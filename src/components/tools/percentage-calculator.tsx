"use client";

import { ChartPie, Percent, TrendingDown, TrendingUp } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { Badge, CopyButton, Field, NumberInput, cn, fmt, iconTileClass, num } from "@/components/ui";

type Outcome =
  | { ok: true; value: string; formula: string; badge?: ReactNode }
  | { ok: false; message: string };

type Spec = {
  icon: ReactNode;
  title: string;
  description: string;
  a: { label: string; suffix?: string; initial: string };
  b: { label: string; suffix?: string; initial: string };
  compute: (a: number, b: number) => Outcome;
};

/** Echo of a typed number inside a formula, e.g. 1234.5 -> "1,234.5". */
const n = (x: number) => fmt(x, 6);

const specs: Spec[] = [
  {
    icon: <Percent />,
    title: "What is X% of Y?",
    description: "Find a percentage of a number, e.g. a discount or a share.",
    a: { label: "Percentage", suffix: "%", initial: "20" },
    b: { label: "Of the number", initial: "150" },
    compute: (p, v) => {
      const result = (p * v) / 100;
      return { ok: true, value: fmt(result, 4), formula: `${n(v)} × ${n(p)} ÷ 100` };
    },
  },
  {
    icon: <ChartPie />,
    title: "X is what percent of Y?",
    description: "Find what share one number is of another, e.g. a test score.",
    a: { label: "Part", initial: "30" },
    b: { label: "Whole", initial: "120" },
    compute: (part, whole) => {
      if (whole === 0) return { ok: false, message: "The whole can't be 0" };
      return { ok: true, value: `${fmt((part / whole) * 100, 4)}%`, formula: `${n(part)} ÷ ${n(whole)} × 100` };
    },
  },
  {
    icon: <TrendingUp />,
    title: "Percentage change",
    description: "Increase or decrease from an old value to a new one.",
    a: { label: "From", initial: "50" },
    b: { label: "To", initial: "65" },
    compute: (from, to) => {
      if (from === 0) return { ok: false, message: "Change from 0 is undefined" };
      const change = ((to - from) / Math.abs(from)) * 100;
      const diff = to - from;
      const badge =
        change > 0 ? (
          <Badge tone="accent">
            <TrendingUp aria-hidden className="size-3.5" /> Increase of {n(diff)}
          </Badge>
        ) : change < 0 ? (
          <Badge tone="neutral">
            <TrendingDown aria-hidden className="size-3.5" /> Decrease of {n(-diff)}
          </Badge>
        ) : (
          <Badge tone="neutral">No change</Badge>
        );
      return {
        ok: true,
        value: `${change >= 0 ? "+" : ""}${fmt(change, 4)}%`,
        formula: `(${n(to)} − ${n(from)}) ÷ ${from < 0 ? `|${n(from)}|` : n(from)} × 100`,
        badge,
      };
    },
  },
];

function PercentCard({ spec }: { spec: Spec }) {
  const id = useId();
  const [a, setA] = useState(spec.a.initial);
  const [b, setB] = useState(spec.b.initial);
  const x = num(a);
  const y = num(b);
  const ready = Number.isFinite(x) && Number.isFinite(y);
  const out: Outcome | null = ready ? spec.compute(x, y) : null;

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="grid min-w-0 gap-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] md:gap-6"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className={iconTileClass("sm")} aria-hidden>
            {spec.icon}
          </span>
          <div className="min-w-0">
            <h3 id={`${id}-title`} className="text-base font-semibold tracking-tight text-foreground">
              {spec.title}
            </h3>
            <p className="mt-0.5 text-sm text-muted">{spec.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={spec.a.label}>
            <NumberInput value={a} onChange={setA} suffix={spec.a.suffix} placeholder="0" />
          </Field>
          <Field label={spec.b.label}>
            <NumberInput value={b} onChange={setB} suffix={spec.b.suffix} placeholder="0" />
          </Field>
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-center rounded-lg bg-subtle px-4 py-3.5 ring-1 ring-border ring-inset">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-muted">Answer</span>
          <CopyButton
            text={out?.ok ? out.value : ""}
            iconOnly
            size="sm"
            variant="ghost"
            label="Copy answer"
            className="-my-1 -mr-2"
          />
        </div>
        <div
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            "mt-0.5 text-3xl leading-tight font-semibold tracking-tight break-words tabular-nums",
            out?.ok ? "text-foreground" : "text-faint",
          )}
        >
          {out?.ok ? out.value : "—"}
        </div>
        <div className="mt-1 min-h-5 text-[13px] text-muted">
          {!ready ? "Enter both numbers" : out && !out.ok ? out.message : out?.ok ? `= ${out.formula}` : null}
        </div>
        {out?.ok && out.badge && <div className="mt-2">{out.badge}</div>}
      </div>
    </section>
  );
}

export default function PercentageCalculator() {
  return (
    <div className="grid gap-4">
      {specs.map((spec) => (
        <PercentCard key={spec.title} spec={spec} />
      ))}
    </div>
  );
}
