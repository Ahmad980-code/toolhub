"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/components/ui";
import { compact, niceStep } from "./format";

export type ColumnSeries = {
  label: string;
  /** Fill class for the segments and legend swatch, e.g. "bg-accent". */
  fill: string;
};

export type ColumnRow = {
  /** Category label, e.g. "Year 3". */
  label: string;
  /** Short axis label, e.g. "3". */
  tick: string;
  /** One value per series, bottom segment first. */
  values: number[];
};

/**
 * Stacked column chart (one column per row) built from plain HTML so it inherits the theme tokens.
 * Hover or focus + arrow keys shows a readout of every series; the accompanying table is the
 * accessible source of truth for all values.
 */
export function StackedColumns({
  title,
  rows,
  series,
  format,
  totalLabel = "Total",
  className,
}: {
  /** Accessible name of the chart. */
  title: string;
  rows: ColumnRow[];
  series: ColumnSeries[];
  format: (n: number) => string;
  totalLabel?: string;
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const n = rows.length;
  const totals = rows.map((r) => r.values.reduce((s, v) => s + Math.max(v, 0), 0));
  const max = Math.max(0, ...totals);
  const step = niceStep(max, 4);
  const top = max > 0 ? Math.ceil(max / step - 1e-9) * step : 1;
  const ticks: number[] = [];
  for (let t = 0; t <= top + step / 2; t += step) ticks.push(t);

  // Up to ~6 evenly spaced x labels, always including the first and last column.
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  const xLabels = rows
    .map((r, i) => ({ i, tick: r.tick }))
    .filter(({ i }) => i === n - 1 || (i % labelEvery === 0 && n - 1 - i >= labelEvery / 2));

  const current = active != null && active < n ? active : null;
  const center = (i: number) => ((i + 0.5) / n) * 100;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.floor(((e.clientX - rect.left) / rect.width) * n);
    setActive(Math.min(n - 1, Math.max(0, i)));
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = n - 1;
    const now = current ?? last;
    const next =
      e.key === "ArrowRight" ? Math.min(last, now + 1)
      : e.key === "ArrowLeft" ? Math.max(0, now - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next == null) return;
    e.preventDefault();
    setActive(next);
  }

  if (n === 0) return null;
  const tip = current != null ? rows[current] : null;
  const tipX = current != null ? center(current) : 50;
  const tipShift = tipX < 22 ? "0%" : tipX > 78 ? "-100%" : "-50%";

  return (
    <div className={cn("min-w-0", className)}>
      <ul className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted">
        {series.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span aria-hidden className={cn("size-2.5 rounded-[3px]", s.fill)} />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        {/* Y axis */}
        <div aria-hidden className="relative h-48 w-10 shrink-0 text-right text-[11px] text-muted tabular-nums sm:h-56 sm:text-xs">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 leading-none" style={{ bottom: `${(t / top) * 100}%`, transform: "translateY(50%)" }}>
              {compact(t)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {/* Plot */}
          <div
            tabIndex={0}
            role="group"
            aria-roledescription="chart"
            aria-label={`${title}. Use the left and right arrow keys to read each column; all values are in the table below.`}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive((a) => a ?? n - 1)}
            onBlur={() => setActive(null)}
            onKeyDown={onKeyDown}
            className="relative h-48 cursor-crosshair touch-pan-y rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:h-56"
          >
            {/* Gridlines */}
            {ticks.map((t) => (
              <div
                key={t}
                aria-hidden
                className={cn("absolute inset-x-0 border-t", t === 0 ? "border-border-strong" : "border-border")}
                style={{ bottom: `${(t / top) * 100}%` }}
              />
            ))}

            {/* Columns */}
            <div aria-hidden className="absolute inset-0 flex items-end">
              {rows.map((r, i) => {
                const visible = r.values
                  .map((v, si) => ({ v: Math.max(v, 0), si }))
                  .filter((s) => s.v > 0);
                return (
                  <div
                    key={r.label}
                    className={cn(
                      "flex h-full min-w-0 flex-1 flex-col items-center justify-end transition-colors",
                      current === i && "bg-foreground/[0.045]",
                    )}
                  >
                    <div className="flex h-full w-[64%] max-w-6 flex-col justify-end gap-[2px]">
                      {visible
                        .slice()
                        .reverse()
                        .map(({ v, si }, k) => (
                          <div
                            key={si}
                            className={cn(
                              "w-full shrink-0 transition-[height] duration-300 ease-out",
                              series[si]?.fill,
                              k === 0 && "rounded-t-[4px]",
                              current != null && current !== i && "opacity-60",
                            )}
                            style={{ height: `calc(${(v / top) * 100}% - ${k === visible.length - 1 ? 0 : 2}px)` }}
                          />
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Readout */}
            {tip && current != null && (
              <div
                className="pointer-events-none absolute -top-2 z-10 min-w-40 rounded-lg border border-border bg-elevated px-3 py-2 text-[13px] shadow-lg"
                style={{ left: `${tipX}%`, transform: `translate(${tipShift}, -100%)` }}
              >
                <div className="font-medium text-foreground">{tip.label}</div>
                <ul className="mt-1.5 grid gap-1">
                  {series
                    .map((s, si) => ({ s, si }))
                    .reverse()
                    .map(({ s, si }) => (
                      <li key={s.label} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-muted">
                          <span aria-hidden className={cn("h-[2px] w-3 rounded-full", s.fill)} />
                          {s.label}
                        </span>
                        <span className="font-medium text-foreground tabular-nums">{format(tip.values[si] ?? 0)}</span>
                      </li>
                    ))}
                  <li className="mt-0.5 flex items-center justify-between gap-4 border-t border-border pt-1.5">
                    <span className="text-muted">{totalLabel}</span>
                    <span className="font-semibold text-foreground tabular-nums">{format(totals[current])}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* X axis */}
          <div aria-hidden className="relative mt-2 h-4 text-[11px] text-muted tabular-nums sm:text-xs">
            {xLabels.map(({ i, tick }) => (
              <span key={i} className="absolute -translate-x-1/2 leading-4 whitespace-nowrap" style={{ left: `${center(i)}%` }}>
                {tick}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {tip && current != null
          ? `${tip.label}: ${series.map((s, si) => `${s.label} ${format(tip.values[si] ?? 0)}`).join(", ")}, ${totalLabel} ${format(totals[current])}`
          : ""}
      </p>
    </div>
  );
}
