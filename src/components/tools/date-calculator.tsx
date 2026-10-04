"use client";

import { ArrowLeftRight, CalendarCheck } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Field,
  Input,
  NumberInput,
  ResultCard,
  SegmentedControl,
  Stat,
  Switch,
  ToolLayout,
  fmt,
  num,
} from "@/components/ui";

const DAY = 86_400_000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "YYYY-MM-DD" -> UTC midnight timestamp (no time zone or DST surprises). */
function parse(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return NaN;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isFinite(t) ? t : NaN;
}

function iso(t: number) {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function longDate(t: number) {
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Full years, months and days from a to b (a <= b), counted like an age. */
function ymd(a: number, b: number) {
  const x = new Date(a);
  const y = new Date(b);
  let years = y.getUTCFullYear() - x.getUTCFullYear();
  let months = y.getUTCMonth() - x.getUTCMonth();
  let days = y.getUTCDate() - x.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(y.getUTCFullYear(), y.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

/** Monday–Friday days in [a, b) — b is excluded. */
function businessDays(a: number, b: number) {
  const total = Math.round((b - a) / DAY);
  const fullWeeks = Math.floor(total / 7);
  let count = fullWeeks * 5;
  const startDay = new Date(a).getUTCDay();
  for (let i = 0; i < total % 7; i++) {
    const wd = (startDay + i) % 7;
    if (wd !== 0 && wd !== 6) count++;
  }
  return count;
}

/** Adds months, clamping to the last day of the month (31 Jan + 1 month = 28/29 Feb). */
function addMonths(t: number, months: number) {
  const d = new Date(t);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d.getUTCDate(), lastDay));
}

const plural = (n: number, w: string) => `${fmt(n, 0)} ${w}${n === 1 ? "" : "s"}`;

export default function DateCalculator() {
  const [mode, setMode] = useState<"between" | "add">("between");
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-12-31");
  const [inclusive, setInclusive] = useState(false);
  const [base, setBase] = useState("2026-01-31");
  const [op, setOp] = useState<"add" | "subtract">("add");
  const [years, setYears] = useState("0");
  const [months, setMonths] = useState("1");
  const [weeks, setWeeks] = useState("0");
  const [days, setDays] = useState("0");

  // Between two dates.
  let a = parse(start);
  let b = parse(end);
  const swapped = Number.isFinite(a) && Number.isFinite(b) && b < a;
  if (swapped) [a, b] = [b, a];
  const validBetween = Number.isFinite(a) && Number.isFinite(b);
  const bEnd = b + (inclusive ? DAY : 0);
  const totalDays = validBetween ? Math.round((bEnd - a) / DAY) : NaN;
  const parts = validBetween ? ymd(a, bEnd) : null;
  const work = validBetween ? businessDays(a, bEnd) : NaN;

  // Add / subtract.
  const t0 = parse(base);
  const sign = op === "add" ? 1 : -1;
  const n = (v: string) => (v.trim() === "" ? 0 : Math.trunc(num(v)));
  const amounts = [n(years), n(months), n(weeks), n(days)];
  const validAdd = Number.isFinite(t0) && amounts.every(Number.isFinite);
  let result = NaN;
  if (validAdd) {
    result = addMonths(t0, sign * (amounts[0] * 12 + amounts[1]));
    result += sign * (amounts[2] * 7 + amounts[3]) * DAY;
  }
  const validResult = Number.isFinite(result) && new Date(result).getUTCFullYear() > 0 && new Date(result).getUTCFullYear() < 10000;

  return (
    <div className="grid gap-6">
      <SegmentedControl
        label="Calculation"
        value={mode}
        onChange={setMode}
        fullWidth
        className="sm:max-w-md"
        options={[
          { value: "between", label: "Between two dates" },
          { value: "add", label: "Add / subtract" },
        ]}
      />

      {mode === "between" ? (
        <ToolLayout
          inputs={
            <>
              <Field label="Start date" aside={<Button size="sm" variant="ghost" onClick={() => setStart(todayIso())}>Today</Button>}>
                <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="End date" aside={<Button size="sm" variant="ghost" onClick={() => setEnd(todayIso())}>Today</Button>}>
                <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                className="justify-self-start"
                onClick={() => {
                  setStart(end);
                  setEnd(start);
                }}
              >
                <ArrowLeftRight /> Swap dates
              </Button>
              <Switch
                checked={inclusive}
                onChange={setInclusive}
                label="Include the end date"
                description="Counts both the first and the last day (e.g. a 1–7 Jan booking = 7 days)"
              />
            </>
          }
          results={
            <>
              <ResultCard
                label="Days between"
                value={validBetween ? plural(totalDays, "day") : ""}
                caption={
                  validBetween
                    ? `${swapped ? "End date is before the start · " : ""}${longDate(a)} → ${longDate(b)}`
                    : undefined
                }
                copyText={validBetween ? String(totalDays) : ""}
                placeholder="Pick two dates"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Stat
                  label="Years, months, days"
                  value={parts ? `${parts.years}y ${parts.months}m ${parts.days}d` : "—"}
                />
                <Stat label="Weeks" value={validBetween ? `${fmt(Math.floor(totalDays / 7), 0)}w ${totalDays % 7}d` : "—"} />
                <Stat label="Business days" value={validBetween ? fmt(work, 0) : "—"} hint="Monday to Friday" />
                <Stat label="Hours" value={validBetween ? fmt(totalDays * 24, 0) : "—"} />
              </div>
            </>
          }
        />
      ) : (
        <ToolLayout
          inputs={
            <>
              <Field label="Start date" aside={<Button size="sm" variant="ghost" onClick={() => setBase(todayIso())}>Today</Button>}>
                <Input type="date" value={base} onChange={(e) => setBase(e.target.value)} />
              </Field>
              <SegmentedControl
                label="Add or subtract"
                value={op}
                onChange={setOp}
                fullWidth
                options={[
                  { value: "add", label: "Add" },
                  { value: "subtract", label: "Subtract" },
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Years">
                  <NumberInput value={years} onChange={setYears} min={0} inputMode="numeric" />
                </Field>
                <Field label="Months">
                  <NumberInput value={months} onChange={setMonths} min={0} inputMode="numeric" />
                </Field>
                <Field label="Weeks">
                  <NumberInput value={weeks} onChange={setWeeks} min={0} inputMode="numeric" />
                </Field>
                <Field label="Days">
                  <NumberInput value={days} onChange={setDays} min={0} inputMode="numeric" />
                </Field>
              </div>
            </>
          }
          results={
            <>
              <ResultCard
                label="Resulting date"
                value={validResult ? longDate(result) : ""}
                size="md"
                caption={validResult ? `${iso(result)} · ${plural(Math.round(Math.abs(result - t0) / DAY), "day")} ${op === "add" ? "later" : "earlier"}` : undefined}
                copyText={validResult ? longDate(result) : ""}
                placeholder="Pick a start date"
              />
              <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted">
                <CalendarCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                Months are added first, then weeks and days. If the day doesn&apos;t exist in the new month (31 January
                + 1 month), the last day of that month is used.
              </div>
            </>
          }
        />
      )}
    </div>
  );
}
