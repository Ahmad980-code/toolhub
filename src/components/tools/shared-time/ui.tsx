"use client";

import type { ReactNode } from "react";
import { cn, type Tone } from "@/components/ui";

const ringStroke: Record<Tone, string> = {
  neutral: "stroke-muted",
  accent: "stroke-accent",
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
};

/**
 * Circular progress gauge with content in the middle. `value` is 0–1 (the filled part, drawn
 * clockwise from 12 o'clock). Decorative: put the accessible reading in `children`.
 */
export function ProgressRing({
  value,
  tone = "accent",
  children,
  className,
}: {
  value: number;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}) {
  const v = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 1);
  return (
    <div className={cn("relative mx-auto aspect-square w-full", className)}>
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full -rotate-90">
        <circle cx="50" cy="50" r="46" fill="none" strokeWidth="3" className="stroke-border-strong/70" />
        {v > 0.0005 && (
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100 100"
            strokeDashoffset={100 - v * 100}
            className={cn(ringStroke[tone], "transition-[stroke] duration-300")}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">{children}</div>
    </div>
  );
}

/** Keyboard key hint. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border-strong bg-subtle px-1.5 font-mono text-[11px] font-medium text-muted shadow-xs">
      {children}
    </kbd>
  );
}

/** Row of shortcut hints, hidden on touch-sized screens where there is no keyboard. */
export function ShortcutHints({ items }: { items: { keys: string; label: string }[] }) {
  return (
    <p className="hidden flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px] text-muted sm:flex">
      {items.map((it) => (
        <span key={it.keys} className="inline-flex items-center gap-1.5">
          <Kbd>{it.keys}</Kbd>
          {it.label}
        </span>
      ))}
    </p>
  );
}
