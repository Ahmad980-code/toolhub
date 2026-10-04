"use client";

import { useState } from "react";
import { SegmentedControl, cn, fmt } from "@/components/ui";
import type { DailyRow } from "@/lib/analytics/dashboard";

type Metric = "views" | "visitors" | "uses" | "errors";
const METRIC_LABEL: Record<Metric, string> = { views: "Page views", visitors: "Visitors", uses: "Tool uses", errors: "Errors" };

/** Rounds up to 1, 2, 2.5 or 5 × 10^n so gridline labels are tidy. */
function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((n) => n >= v) ?? v;
}

/** Daily traffic as columns: one metric at a time, hover/tap a day for all its numbers. */
export function TrafficChart({ rows }: { rows: DailyRow[] }) {
  const [metric, setMetric] = useState<Metric>("views");
  const [hover, setHover] = useState<number | null>(null);
  const values = rows.map((r) => r[metric]);
  const max = niceMax(Math.max(...values, 0));
  const step = rows.length <= 7 ? 1 : rows.length <= 31 ? 5 : 15;
  const empty = values.every((v) => v === 0);
  const h = hover !== null ? rows[hover] : null;

  return (
    <div className="grid gap-4">
      <SegmentedControl
        label="Chart metric"
        value={metric}
        onChange={setMetric}
        size="sm"
        className="justify-self-start"
        options={(Object.keys(METRIC_LABEL) as Metric[]).map((m) => ({ value: m, label: METRIC_LABEL[m] }))}
      />
      <div className="relative">
        {/* Gridlines + y labels */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-52">
          {[1, 0.5, 0].map((f) => (
            <div key={f} className="absolute inset-x-0 flex items-center gap-2" style={{ top: `${(1 - f) * 100}%` }}>
              <span className="w-10 -translate-y-1/2 text-right text-[11px] text-muted tabular-nums">{fmt(max * f, 0)}</span>
              <span className="h-px flex-1 -translate-y-1/2 bg-border" />
            </div>
          ))}
        </div>
        <div className="relative ml-12 flex h-52 items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
          {rows.map((r, i) => {
            const v = r[metric];
            return (
              <div
                key={r.day}
                className="flex h-full flex-1 items-end"
                onMouseEnter={() => setHover(i)}
                onClick={() => setHover(i)}
              >
                <div
                  className={cn(
                    "w-full rounded-t-[4px] transition-colors",
                    hover === i ? "bg-accent-hover" : "bg-accent",
                    v === 0 && "bg-transparent",
                  )}
                  style={{ height: `${(v / max) * 100}%` }}
                />
              </div>
            );
          })}
          {h && hover !== null && (
            <div
              role="status"
              className="pointer-events-none absolute top-0 z-10 w-44 rounded-lg border border-border bg-elevated p-3 text-[13px] shadow-lg"
              style={{ left: `${((hover + 0.5) / rows.length) * 100}%`, transform: `translateX(${hover > rows.length / 2 ? "calc(-100% - 8px)" : "8px"})` }}
            >
              <p className="font-semibold text-foreground">{h.label}</p>
              {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
                <p key={m} className="mt-1 flex justify-between gap-3">
                  <span className={m === metric ? "text-foreground" : "text-muted"}>{METRIC_LABEL[m]}</span>
                  <span className="font-medium text-foreground tabular-nums">{fmt(h[m], 0)}</span>
                </p>
              ))}
            </div>
          )}
        </div>
        <div aria-hidden className="mt-2 ml-12 flex gap-[2px]">
          {rows.map((r, i) => (
            <div key={r.day} className="relative flex-1">
              {(i % step === 0 || i === rows.length - 1) && (
                <span className="absolute left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap text-muted">{r.label}</span>
              )}
            </div>
          ))}
        </div>
        {empty && (
          <div className="absolute inset-x-0 top-0 ml-12 grid h-52 place-items-center text-sm text-muted">
            No {METRIC_LABEL[metric].toLowerCase()} recorded in this period yet
          </div>
        )}
      </div>
    </div>
  );
}
