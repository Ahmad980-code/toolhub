"use client";

import { Clock, Moon, Plus, Sun, X } from "lucide-react";
import { useState } from "react";
import { Button, Field, Input, Select, ToolSection, cn } from "@/components/ui";

const CITIES: [name: string, zone: string][] = [
  ["Karachi / Lahore / Islamabad", "Asia/Karachi"],
  ["Dubai", "Asia/Dubai"],
  ["Riyadh / Jeddah", "Asia/Riyadh"],
  ["Doha", "Asia/Qatar"],
  ["Kuwait City", "Asia/Kuwait"],
  ["Muscat", "Asia/Muscat"],
  ["Manama", "Asia/Bahrain"],
  ["Tehran", "Asia/Tehran"],
  ["Kabul", "Asia/Kabul"],
  ["Delhi / Mumbai", "Asia/Kolkata"],
  ["Dhaka", "Asia/Dhaka"],
  ["Kathmandu", "Asia/Kathmandu"],
  ["Colombo", "Asia/Colombo"],
  ["Tashkent", "Asia/Tashkent"],
  ["Almaty", "Asia/Almaty"],
  ["Bangkok", "Asia/Bangkok"],
  ["Jakarta", "Asia/Jakarta"],
  ["Kuala Lumpur", "Asia/Kuala_Lumpur"],
  ["Singapore", "Asia/Singapore"],
  ["Hong Kong", "Asia/Hong_Kong"],
  ["Beijing / Shanghai", "Asia/Shanghai"],
  ["Manila", "Asia/Manila"],
  ["Seoul", "Asia/Seoul"],
  ["Tokyo", "Asia/Tokyo"],
  ["Perth", "Australia/Perth"],
  ["Sydney / Melbourne", "Australia/Sydney"],
  ["Auckland", "Pacific/Auckland"],
  ["Istanbul", "Europe/Istanbul"],
  ["Moscow", "Europe/Moscow"],
  ["Athens", "Europe/Athens"],
  ["Cairo", "Africa/Cairo"],
  ["Johannesburg", "Africa/Johannesburg"],
  ["Nairobi", "Africa/Nairobi"],
  ["Lagos", "Africa/Lagos"],
  ["Berlin / Frankfurt", "Europe/Berlin"],
  ["Paris", "Europe/Paris"],
  ["Rome / Milan", "Europe/Rome"],
  ["Madrid", "Europe/Madrid"],
  ["Amsterdam", "Europe/Amsterdam"],
  ["Stockholm", "Europe/Stockholm"],
  ["London", "Europe/London"],
  ["Dublin", "Europe/Dublin"],
  ["Lisbon", "Europe/Lisbon"],
  ["Reykjavik", "Atlantic/Reykjavik"],
  ["UTC / GMT", "UTC"],
  ["São Paulo", "America/Sao_Paulo"],
  ["Buenos Aires", "America/Argentina/Buenos_Aires"],
  ["New York / Toronto", "America/New_York"],
  ["Washington DC", "America/New_York"],
  ["Toronto", "America/Toronto"],
  ["Chicago", "America/Chicago"],
  ["Houston / Dallas", "America/Chicago"],
  ["Mexico City", "America/Mexico_City"],
  ["Denver", "America/Denver"],
  ["Phoenix", "America/Phoenix"],
  ["Los Angeles / San Francisco", "America/Los_Angeles"],
  ["Vancouver", "America/Vancouver"],
  ["Anchorage", "America/Anchorage"],
  ["Honolulu", "Pacific/Honolulu"],
];

// Indexes into CITIES: Pakistan, Dubai, Riyadh, Delhi, London, New York, Chicago, Los Angeles, Sydney, Kuala Lumpur, Istanbul.
const DEFAULT_TARGETS = [0, 1, 2, 9, 40, 47, 50, 55, 25, 17, 27];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const partsFormat = new Map<string, Intl.DateTimeFormat>();
function fields(zone: string, ts: number) {
  let f = partsFormat.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    partsFormat.set(zone, f);
  }
  const p = Object.fromEntries(f.formatToParts(ts).map((x) => [x.type, x.value]));
  return { y: Number(p.year), mo: Number(p.month), d: Number(p.day), h: Number(p.hour) % 24, mi: Number(p.minute), s: Number(p.second) };
}

/** Offset of `zone` from UTC at instant `ts`, in minutes. */
function offsetMinutes(zone: string, ts: number) {
  const f = fields(zone, ts);
  return Math.round((Date.UTC(f.y, f.mo - 1, f.d, f.h, f.mi, f.s) - Math.floor(ts / 1000) * 1000) / 60000);
}

/** The UTC instant when the wall clock in `zone` shows the given date and time. */
function zonedToUtc(zone: string, y: number, mo: number, d: number, h: number, mi: number) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let ts = guess - offsetMinutes(zone, guess) * 60000;
  ts = guess - offsetMinutes(zone, ts) * 60000; // second pass settles DST edges
  return ts;
}

function fmtOffset(min: number) {
  const sign = min < 0 ? "−" : "+";
  const a = Math.abs(min);
  return `UTC${sign}${Math.floor(a / 60)}${a % 60 ? `:${String(a % 60).padStart(2, "0")}` : ""}`;
}

function fmtDiff(min: number) {
  if (min === 0) return "same time";
  const sign = min > 0 ? "+" : "−";
  const a = Math.abs(min);
  return `${sign}${Math.floor(a / 60)}h${a % 60 ? ` ${a % 60}m` : ""}`;
}

export default function TimeZoneConverter() {
  const [date, setDate] = useState("2026-10-04");
  const [time, setTime] = useState("09:00");
  const [source, setSource] = useState(0);
  const [targets, setTargets] = useState<number[]>(DEFAULT_TARGETS);
  const [adding, setAdding] = useState("");

  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{2}):(\d{2})/.exec(time);
  const srcZone = CITIES[source][1];
  const instant = dm && tm ? zonedToUtc(srcZone, Number(dm[1]), Number(dm[2]), Number(dm[3]), Number(tm[1]), Number(tm[2])) : NaN;
  const valid = Number.isFinite(instant);
  const srcOffset = valid ? offsetMinutes(srcZone, instant) : 0;

  function setNow() {
    const f = fields(srcZone, Date.now());
    setDate(`${f.y}-${String(f.mo).padStart(2, "0")}-${String(f.d).padStart(2, "0")}`);
    setTime(`${String(f.h).padStart(2, "0")}:${String(f.mi).padStart(2, "0")}`);
  }

  const rows = targets.map((i) => {
    const [name, zone] = CITIES[i];
    if (!valid) return { i, name, zone, ok: false as const };
    const f = fields(zone, instant);
    const off = offsetMinutes(zone, instant);
    const wd = new Date(Date.UTC(f.y, f.mo - 1, f.d)).getUTCDay();
    return {
      i,
      name,
      zone,
      ok: true as const,
      time: `${String(f.h).padStart(2, "0")}:${String(f.mi).padStart(2, "0")}`,
      day: `${WEEKDAYS[wd]} ${f.d} ${MONTHS[f.mo - 1]}`,
      offset: fmtOffset(off),
      diff: fmtDiff(off - srcOffset),
      daytime: f.h >= 6 && f.h < 18,
    };
  });

  const available = CITIES.map((c, i) => ({ c, i })).filter(({ i }) => !targets.includes(i));

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-xl bg-subtle p-4 sm:grid-cols-[1fr_1fr_1.4fr_auto] sm:items-end sm:p-5">
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <Field label="Time in">
          <Select value={source} onChange={(e) => setSource(Number(e.target.value))}>
            {CITIES.map(([name], i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </Select>
        </Field>
        <Button onClick={setNow}>
          <Clock /> Now
        </Button>
      </div>

      <ToolSection
        title="Same moment around the world"
        description={valid ? `${time} on ${date} in ${CITIES[source][0]} (${fmtOffset(srcOffset)})` : "Enter a valid date and time"}
      >
        <ul className="grid gap-2 sm:grid-cols-2" aria-live="polite">
          {rows.map((r) => (
            <li
              key={r.i}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-card p-3 pl-4",
                r.zone === srcZone && "border-accent/40 bg-accent-soft",
              )}
            >
              {r.ok &&
                (r.daytime ? (
                  <Sun aria-label="Daytime" className="size-5 shrink-0 text-warning" />
                ) : (
                  <Moon aria-label="Night" className="size-5 shrink-0 text-accent" />
                ))}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-[13px] text-muted">{r.ok ? `${r.day} · ${r.offset}` : "—"}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-semibold text-foreground tabular-nums">{r.ok ? r.time : "--:--"}</p>
                <p className="text-[12px] text-muted">{r.ok ? r.diff : ""}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${r.name}`}
                onClick={() => setTargets((t) => t.filter((x) => x !== r.i))}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label="Add a city" className="sm:max-w-sm sm:flex-1">
            <Select value={adding} onChange={(e) => setAdding(e.target.value)}>
              <option value="">Choose a city…</option>
              {available.map(({ c, i }) => (
                <option key={i} value={i}>
                  {c[0]}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            variant="soft"
            disabled={adding === ""}
            onClick={() => {
              setTargets((t) => [...t, Number(adding)]);
              setAdding("");
            }}
          >
            <Plus /> Add
          </Button>
        </div>
      </ToolSection>
    </div>
  );
}
