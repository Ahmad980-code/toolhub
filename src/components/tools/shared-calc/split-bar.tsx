"use client";

import { cn } from "@/components/ui";

export type SplitPart = {
  label: string;
  value: number;
  /** Fill class for the segment and its legend swatch, e.g. "bg-accent" or "bg-accent/60". */
  fill: string;
};

/**
 * 100% stacked bar showing how a total splits into parts, with a legend that carries every
 * value and share (so identity never relies on color alone).
 */
export function SplitBar({
  title,
  parts,
  format,
  className,
}: {
  title: string;
  parts: SplitPart[];
  format: (n: number) => string;
  className?: string;
}) {
  const total = parts.reduce((s, p) => s + Math.max(p.value, 0), 0);
  const share = (v: number) => (total > 0 ? (Math.max(v, 0) / total) * 100 : 0);
  const summary = parts.map((p) => `${p.label} ${Math.round(share(p.value))}%`).join(", ");

  return (
    <div className={cn("min-w-0 rounded-xl border border-border bg-card p-4 shadow-xs", className)}>
      <div className="text-[13px] font-medium text-muted">{title}</div>
      <div
        role="img"
        aria-label={`${title}: ${summary}`}
        className="mt-3 flex h-3 w-full gap-[2px] overflow-hidden rounded-full"
      >
        {parts.map((p) =>
          share(p.value) > 0 ? (
            <div
              key={p.label}
              className={cn("h-full transition-[width] duration-300 ease-out", p.fill)}
              style={{ width: `${share(p.value)}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-3 grid gap-2">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-muted">
              <span aria-hidden className={cn("size-2.5 shrink-0 rounded-[3px]", p.fill)} />
              <span className="truncate">{p.label}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              <span className="font-medium text-foreground">{format(p.value)}</span>
              <span className="ml-2 inline-block w-11 text-right text-muted">{Math.round(share(p.value))}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
