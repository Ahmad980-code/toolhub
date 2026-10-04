import { categories, tools } from "@/lib/tools";
import { backend, lastDays, store, type DayData, type ErrorGroup, type Report } from "./store";

export type Range = 7 | 30 | 90;

export type DailyRow = { day: string; label: string; views: number; visitors: number; uses: number; errors: number };
export type ToolRow = { slug: string; name: string; category: string; views: number; uses: number; errors: number; reports: number };
export type Ranked = { label: string; count: number }[];
export type ErrorRow = ErrorGroup & { inRange: number; lastSeenAgo: string; firstSeenAgo: string; pageName: string };
export type ReportRow = Report & { ago: string; toolName: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (d: string) => `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`;

function merge(rows: DayData[], part: keyof Pick<DayData, "paths" | "uses" | "errs" | "errpaths" | "ref" | "country" | "device" | "browser">) {
  const out: Record<string, number> = {};
  for (const r of rows) for (const [k, v] of Object.entries(r[part])) out[k] = (out[k] ?? 0) + v;
  return out;
}

const total = (rec: Record<string, number>) => Object.values(rec).reduce((a, b) => a + b, 0);
const ranked = (rec: Record<string, number>, rename = (k: string) => k): Ranked =>
  Object.entries(rec)
    .map(([k, count]) => ({ label: rename(k), count }))
    .sort((a, b) => b.count - a.count);

export function ago(t: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d < 60 ? `${d} days ago` : `${Math.round(d / 30)} months ago`;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryName = (cc: string) => {
  if (cc === "Unknown") return "Unknown";
  try {
    return regionNames.of(cc) ?? cc;
  } catch {
    return cc;
  }
};

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/contact": "Contact",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Use",
  other: "Other pages",
};
const toolBySlug = new Map(tools.map((t) => [t.slug, t]));
export const pageName = (p: string) => PAGE_NAMES[p] ?? toolBySlug.get(p.replace("/tools/", ""))?.name ?? p;

export async function loadDashboard(range: Range) {
  const s = store();
  const days = lastDays(range);
  const prevDays = lastDays(range, range);
  const [cur, prev, uniques, prevUniques, groups, reports] = await Promise.all([
    s.days(days),
    s.days(prevDays),
    s.uniques(days),
    s.uniques(prevDays),
    s.errorGroups(),
    s.reports(),
  ]);

  const daily: DailyRow[] = cur.map((d) => ({
    day: d.day,
    label: dayLabel(d.day),
    views: d.views,
    visitors: d.visitors,
    uses: total(d.uses),
    errors: total(d.errs),
  }));

  const sum = (rows: DayData[]) => ({
    views: rows.reduce((n, d) => n + d.views, 0),
    uses: rows.reduce((n, d) => n + total(d.uses), 0),
    errors: rows.reduce((n, d) => n + total(d.errs), 0),
  });
  const now = Date.now();
  const openReports = reports.filter((r) => r.status === "open");

  const paths = merge(cur, "paths");
  const uses = merge(cur, "uses");
  const errpaths = merge(cur, "errpaths");
  const errsInRange = merge(cur, "errs");

  const toolRows: ToolRow[] = tools.map((t) => ({
    slug: t.slug,
    name: t.name,
    category: categories[t.category].name,
    views: paths[`/tools/${t.slug}`] ?? 0,
    uses: uses[t.slug] ?? 0,
    errors: errpaths[`/tools/${t.slug}`] ?? 0,
    reports: openReports.filter((r) => r.slug === t.slug).length,
  }));

  const errors: ErrorRow[] = groups
    .map((g) => ({
      ...g,
      inRange: errsInRange[g.sig] ?? 0,
      lastSeenAgo: ago(g.lastSeen, now),
      firstSeenAgo: ago(g.firstSeen, now),
      pageName: pageName(g.path),
    }))
    .sort((a, b) => b.lastSeen - a.lastSeen);

  const reportRows: ReportRow[] = reports
    .map((r) => ({ ...r, ago: ago(r.time, now), toolName: r.slug ? (toolBySlug.get(r.slug)?.name ?? r.slug) : pageName(r.path) }))
    .sort((a, b) => (a.status === b.status ? b.time - a.time : a.status === "open" ? -1 : 1));

  const otherPages = Object.fromEntries(Object.entries(paths).filter(([p]) => !p.startsWith("/tools/")));

  return {
    backend: backend(),
    range,
    daily,
    totals: { ...sum(cur), visitors: uniques, openReports: openReports.length },
    previous: { ...sum(prev), visitors: prevUniques },
    tools: toolRows,
    pages: ranked(otherPages, pageName),
    referrers: ranked(merge(cur, "ref")),
    countries: ranked(merge(cur, "country"), countryName),
    devices: ranked(merge(cur, "device")),
    browsers: ranked(merge(cur, "browser")),
    errors,
    reports: reportRows,
  };
}

export type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;
