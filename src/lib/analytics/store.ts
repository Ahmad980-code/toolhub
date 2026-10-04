import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Anonymous, cookie-free analytics storage.
 *
 * Data is kept as per-day counters (page views, unique visitors, tool uses, errors and breakdowns)
 * plus a list of error groups and user bug reports. Two backends:
 *  - Upstash Redis (production): set KV_REST_API_URL + KV_REST_API_TOKEN (added automatically by the
 *    Vercel "Upstash for Redis" integration) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 *  - A JSON file in .analytics/ (local development, or ANALYTICS_STORE=file).
 * Without either, recording is a no-op and the dashboard explains how to connect storage.
 */

const RETENTION_DAYS = 400;
const MAX_ERROR_GROUPS = 300;
const MAX_REPORTS = 500;

export type Backend = "redis" | "file" | "none";
type Breakdown = "paths" | "uses" | "errs" | "errpaths" | "ref" | "country" | "device" | "browser";

export type ErrorGroup = {
  sig: string;
  message: string;
  stack: string;
  path: string;
  browser: string;
  source: string;
  firstSeen: number;
  lastSeen: number;
  total: number;
};

export type Report = {
  id: string;
  slug: string;
  path: string;
  text: string;
  contact: string;
  browser: string;
  device: string;
  time: number;
  status: "open" | "resolved";
};

export type DayData = {
  day: string;
  views: number;
  visitors: number;
  paths: Record<string, number>;
  uses: Record<string, number>;
  errs: Record<string, number>;
  errpaths: Record<string, number>;
  ref: Record<string, number>;
  country: Record<string, number>;
  device: Record<string, number>;
  browser: Record<string, number>;
};

export type Increment =
  | { kind: "pageview"; day: string; visitor: string; path: string; referrer: string | null; country: string; device: string; browser: string }
  | { kind: "use"; day: string; slug: string }
  | { kind: "error"; day: string; group: Omit<ErrorGroup, "total" | "firstSeen"> };

// ---------------------------------------------------------------------------------------------
// Backend selection

function redisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function backend(): Backend {
  if (redisConfig()) return "redis";
  if (process.env.ANALYTICS_STORE === "file" || process.env.NODE_ENV !== "production") return "file";
  return "none";
}

// ---------------------------------------------------------------------------------------------
// Upstash Redis (REST API, no SDK needed)

async function redis(commands: (string | number)[][]): Promise<unknown[]> {
  const cfg = redisConfig();
  if (!cfg || !commands.length) return [];
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((r) => (r.error ? null : r.result));
}

const key = (day: string, part: string) => `th:${day}:${part}`;
const ttl = RETENTION_DAYS * 86_400;

function pairsToRecord(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (Array.isArray(v)) for (let i = 0; i + 1 < v.length; i += 2) out[String(v[i])] = Number(v[i + 1]) || 0;
  else if (v && typeof v === "object") for (const [k, n] of Object.entries(v)) out[k] = Number(n) || 0;
  return out;
}

const redisStore = {
  async record(inc: Increment) {
    const c: (string | number)[][] = [];
    const hincr = (part: Breakdown, field: string) => {
      c.push(["HINCRBY", key(inc.day, part), field, 1], ["EXPIRE", key(inc.day, part), ttl]);
    };
    if (inc.kind === "pageview") {
      c.push(["INCR", key(inc.day, "pv")], ["EXPIRE", key(inc.day, "pv"), ttl]);
      c.push(["PFADD", key(inc.day, "uv"), inc.visitor], ["EXPIRE", key(inc.day, "uv"), ttl]);
      hincr("paths", inc.path);
      if (inc.referrer) hincr("ref", inc.referrer);
      hincr("country", inc.country);
      hincr("device", inc.device);
      hincr("browser", inc.browser);
    } else if (inc.kind === "use") {
      hincr("uses", inc.slug);
    } else {
      hincr("errs", inc.group.sig);
      hincr("errpaths", inc.group.path);
      c.push(["HGET", "th:errinfo", inc.group.sig]);
    }
    const res = await redis(c);
    if (inc.kind === "error") {
      const prev = parseJson<ErrorGroup>(res[res.length - 1]);
      const group: ErrorGroup = {
        ...inc.group,
        firstSeen: prev?.firstSeen ?? inc.group.lastSeen,
        total: (prev?.total ?? 0) + 1,
      };
      await redis([["HSET", "th:errinfo", group.sig, JSON.stringify(group)]]);
    }
  },

  async days(days: string[]): Promise<DayData[]> {
    const parts: Breakdown[] = ["paths", "uses", "errs", "errpaths", "ref", "country", "device", "browser"];
    const cmds: (string | number)[][] = [];
    for (const d of days) {
      cmds.push(["GET", key(d, "pv")], ["PFCOUNT", key(d, "uv")]);
      for (const p of parts) cmds.push(["HGETALL", key(d, p)]);
    }
    const res = await redis(cmds);
    const per = 2 + parts.length;
    return days.map((day, i) => {
      const r = res.slice(i * per, (i + 1) * per);
      const data = { day, views: Number(r[0]) || 0, visitors: Number(r[1]) || 0 } as DayData;
      parts.forEach((p, j) => (data[p] = pairsToRecord(r[2 + j])));
      return data;
    });
  },

  /** Distinct visitors across all the given days (HyperLogLog union, ~1% error). */
  async uniques(days: string[]) {
    const [n] = await redis([["PFCOUNT", ...days.map((d) => key(d, "uv"))]]);
    return Number(n) || 0;
  },

  async errorGroups(): Promise<ErrorGroup[]> {
    const [all] = await redis([["HGETALL", "th:errinfo"]]);
    return Object.values(pairsToStrings(all)).map((s) => parseJson<ErrorGroup>(s)).filter((g): g is ErrorGroup => !!g);
  },
  async deleteErrorGroup(sig: string | null) {
    await redis([sig ? ["HDEL", "th:errinfo", sig] : ["DEL", "th:errinfo"]]);
  },

  async reports(): Promise<Report[]> {
    const [all] = await redis([["HGETALL", "th:reports"]]);
    return Object.values(pairsToStrings(all)).map((s) => parseJson<Report>(s)).filter((r): r is Report => !!r);
  },
  async saveReport(r: Report) {
    await redis([["HSET", "th:reports", r.id, JSON.stringify(r)]]);
  },
  async deleteReport(id: string) {
    await redis([["HDEL", "th:reports", id]]);
  },

  /** Fixed-window limiter: true while `bucket` has been hit at most `max` times in the window. */
  async allow(bucket: string, max: number, windowSeconds: number) {
    const k = `th:rl:${bucket}`;
    const [count] = await redis([["INCR", k], ["EXPIRE", k, windowSeconds, "NX"]]);
    return Number(count) <= max;
  },
};

function pairsToStrings(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(v)) for (let i = 0; i + 1 < v.length; i += 2) out[String(v[i])] = String(v[i + 1]);
  else if (v && typeof v === "object") for (const [k, s] of Object.entries(v)) out[k] = String(s);
  return out;
}

function parseJson<T>(v: unknown): T | null {
  if (typeof v !== "string") return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Local JSON file (development)

type FileDay = Omit<DayData, "visitors" | "day"> & { uv: string[] };
type FileData = { days: Record<string, FileDay>; errinfo: Record<string, ErrorGroup>; reports: Record<string, Report> };

const FILE = path.join(process.cwd(), ".analytics", "data.json");
let queue: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<FileData> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as FileData;
  } catch {
    return { days: {}, errinfo: {}, reports: {} };
  }
}

/** Serialises read-modify-write cycles so concurrent requests don't lose updates. */
function mutate(fn: (d: FileData) => void) {
  const run = queue.then(async () => {
    const d = await readFile();
    fn(d);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(d));
    await fs.rename(tmp, FILE);
  });
  queue = run.catch(() => {});
  return run;
}

const emptyDay = (): FileDay => ({
  views: 0,
  uv: [],
  paths: {},
  uses: {},
  errs: {},
  errpaths: {},
  ref: {},
  country: {},
  device: {},
  browser: {},
});

const fileStore = {
  async record(inc: Increment) {
    await mutate((d) => {
      const day = (d.days[inc.day] ??= emptyDay());
      const bump = (part: Breakdown, field: string) => (day[part][field] = (day[part][field] ?? 0) + 1);
      if (inc.kind === "pageview") {
        day.views++;
        if (!day.uv.includes(inc.visitor)) day.uv.push(inc.visitor);
        bump("paths", inc.path);
        if (inc.referrer) bump("ref", inc.referrer);
        bump("country", inc.country);
        bump("device", inc.device);
        bump("browser", inc.browser);
      } else if (inc.kind === "use") {
        bump("uses", inc.slug);
      } else {
        bump("errs", inc.group.sig);
        bump("errpaths", inc.group.path);
        const prev = d.errinfo[inc.group.sig];
        d.errinfo[inc.group.sig] = { ...inc.group, firstSeen: prev?.firstSeen ?? inc.group.lastSeen, total: (prev?.total ?? 0) + 1 };
        const sigs = Object.values(d.errinfo).sort((a, b) => b.lastSeen - a.lastSeen);
        for (const g of sigs.slice(MAX_ERROR_GROUPS)) delete d.errinfo[g.sig];
      }
    });
  },
  async days(days: string[]): Promise<DayData[]> {
    const d = await readFile();
    return days.map((day) => {
      const f = d.days[day] ?? emptyDay();
      const { uv, ...rest } = f;
      return { ...rest, day, visitors: uv.length };
    });
  },
  async uniques(days: string[]) {
    const d = await readFile();
    return new Set(days.flatMap((day) => d.days[day]?.uv ?? [])).size;
  },
  async errorGroups() {
    return Object.values((await readFile()).errinfo);
  },
  async deleteErrorGroup(sig: string | null) {
    await mutate((d) => {
      if (sig) delete d.errinfo[sig];
      else d.errinfo = {};
    });
  },
  async reports() {
    return Object.values((await readFile()).reports);
  },
  async saveReport(r: Report) {
    await mutate((d) => {
      d.reports[r.id] = r;
      const all = Object.values(d.reports).sort((a, b) => b.time - a.time);
      for (const old of all.slice(MAX_REPORTS)) delete d.reports[old.id];
    });
  },
  async deleteReport(id: string) {
    await mutate((d) => {
      delete d.reports[id];
    });
  },
  async allow() {
    return true;
  },
};

const noopStore = {
  async record() {},
  async days(days: string[]): Promise<DayData[]> {
    return days.map((day) => ({ day, views: 0, visitors: 0, paths: {}, uses: {}, errs: {}, errpaths: {}, ref: {}, country: {}, device: {}, browser: {} }));
  },
  async uniques() {
    return 0;
  },
  async errorGroups(): Promise<ErrorGroup[]> {
    return [];
  },
  async deleteErrorGroup() {},
  async reports(): Promise<Report[]> {
    return [];
  },
  async saveReport() {},
  async deleteReport() {},
  async allow() {
    return true;
  },
};

export function store() {
  const b = backend();
  return b === "redis" ? redisStore : b === "file" ? fileStore : noopStore;
}

/** "YYYY-MM-DD" (UTC) for a timestamp. */
export function dayKey(t = Date.now()) {
  return new Date(t).toISOString().slice(0, 10);
}

/** The last `n` UTC days, oldest first, ending today. */
export function lastDays(n: number, endOffset = 0) {
  const today = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
  return Array.from({ length: n }, (_, i) => dayKey(today - (n - 1 - i + endOffset) * 86_400_000));
}
