"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import {
  Badge,
  Callout,
  Field,
  NumberInput,
  ResultCard,
  SegmentedControl,
  Stat,
  Table,
  ToolLayout,
  ToolSection,
  cn,
  fmt,
  num,
  type Tone,
} from "@/components/ui";

const LB = 0.45359237;
type System = "metric" | "imperial";

function category(bmi: number): { label: string; tone: Tone } {
  if (bmi < 18.5) return { label: "Underweight", tone: "warning" };
  if (bmi < 25) return { label: "Healthy weight", tone: "success" };
  if (bmi < 30) return { label: "Overweight", tone: "warning" };
  return { label: "Obese", tone: "danger" };
}

/** Adult categories (WHO). `min`/`max` are BMI bounds used for the scale and the weight table. */
const bands = [
  { label: "Underweight", range: "Below 18.5", min: 15, max: 18.5, fill: "bg-warning/80", tone: "warning" as Tone },
  { label: "Healthy weight", range: "18.5 – 24.9", min: 18.5, max: 25, fill: "bg-success/80", tone: "success" as Tone },
  { label: "Overweight", range: "25 – 29.9", min: 25, max: 30, fill: "bg-warning/80", tone: "warning" as Tone },
  { label: "Obese", range: "30 or above", min: 30, max: 40, fill: "bg-danger/80", tone: "danger" as Tone },
];
const SCALE_MIN = 15;
const SCALE_MAX = 40;
const pos = (b: number) => ((Math.min(Math.max(b, SCALE_MIN), SCALE_MAX) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

function BmiScale({ bmi }: { bmi: number }) {
  return (
    <div>
      <div className="relative pt-1">
        <div aria-hidden className="flex h-2 gap-[2px] overflow-hidden rounded-full">
          {bands.map((b) => (
            <div key={b.label} className={b.fill} style={{ flex: `${b.max - b.min} 1 0%` }} />
          ))}
        </div>
        {Number.isFinite(bmi) && (
          <span
            aria-hidden
            className="absolute top-1/2 size-4 rounded-full border-[3px] border-foreground bg-card shadow-sm transition-[left] duration-300 ease-out"
            style={{ left: `${pos(bmi)}%`, transform: "translate(-50%, -38%)" }}
          />
        )}
      </div>
      <div aria-hidden className="relative mt-2 h-4 text-xs text-muted tabular-nums">
        {[18.5, 25, 30].map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: `${pos(t)}%` }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BmiCalculator() {
  const [system, setSystem] = useState<System>("metric");
  const [cm, setCm] = useState("175");
  const [kg, setKg] = useState("70");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("9");
  const [lb, setLb] = useState("154");
  const metric = system === "metric";

  const heightM = metric ? num(cm) / 100 : ((num(ft) || 0) * 12 + (num(inch) || 0)) * 0.0254;
  const weightKg = metric ? num(kg) : num(lb) * LB;
  const bmi = heightM > 0 && weightKg > 0 ? weightKg / (heightM * heightM) : NaN;
  const cat = Number.isFinite(bmi) ? category(bmi) : null;

  // Weight (in the chosen unit) at a given BMI for this height.
  const unit = metric ? "kg" : "lb";
  const weightAt = (b: number) => (b * heightM * heightM) / (metric ? 1 : LB);
  const weight = metric ? num(kg) : num(lb);
  const low = weightAt(18.5);
  const high = weightAt(24.9);

  // Switching units converts what's typed, so the result stays the same.
  function switchTo(next: System) {
    if (next === system) return;
    if (next === "imperial") {
      const c = num(cm);
      if (c > 0) {
        const totalIn = c / 2.54;
        let f = Math.floor(totalIn / 12);
        let i = Math.round((totalIn - f * 12) * 10) / 10;
        if (i >= 12) {
          f += 1;
          i -= 12;
        }
        setFt(String(f));
        setInch(String(i));
      }
      const k = num(kg);
      if (k > 0) setLb(String(Math.round((k / LB) * 10) / 10));
    } else {
      const totalIn = (num(ft) || 0) * 12 + (num(inch) || 0);
      if (totalIn > 0) setCm(String(Math.round(totalIn * 2.54 * 10) / 10));
      const p = num(lb);
      if (p > 0) setKg(String(Math.round(p * LB * 10) / 10));
    }
    setSystem(next);
  }

  const positive = (v: string, what: string) => (v.trim() !== "" && !(num(v) > 0) ? `Enter a ${what} above 0` : undefined);
  const heightError = metric ? positive(cm, "height") : ft.trim() !== "" && num(ft) < 0 ? "Feet can't be negative" : inch.trim() !== "" && num(inch) < 0 ? "Inches can't be negative" : undefined;
  const weightError = metric ? positive(kg, "weight") : positive(lb, "weight");

  let advice: { label: string; value: string; hint: string; tone?: Tone } | null = null;
  if (cat && Number.isFinite(weight)) {
    if (bmi < 18.5) advice = { label: "To reach a healthy BMI", value: `+${fmt(low - weight, 1)} ${unit}`, hint: "gain to reach BMI 18.5" };
    else if (bmi >= 25) advice = { label: "To reach a healthy BMI", value: `−${fmt(weight - high, 1)} ${unit}`, hint: "lose to reach BMI 24.9" };
    else advice = { label: "Your weight", value: "In range", hint: "no change needed", tone: "success" };
  }

  return (
    <div className="grid gap-8">
      <ToolLayout
        inputs={
          <>
            <Field label="Units" as="group">
              <SegmentedControl
                label="Unit system"
                value={system}
                onChange={switchTo}
                fullWidth
                options={[
                  { value: "metric", label: "Metric (cm, kg)" },
                  { value: "imperial", label: "Imperial (ft, lb)" },
                ]}
              />
            </Field>

            {metric ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height" error={heightError}>
                  <NumberInput value={cm} onChange={setCm} min={0} suffix="cm" placeholder="175" invalid={!!heightError} />
                </Field>
                <Field label="Weight" error={weightError}>
                  <NumberInput value={kg} onChange={setKg} min={0} suffix="kg" placeholder="70" invalid={!!weightError} />
                </Field>
              </div>
            ) : (
              <>
                <Field label="Height" as="group" error={heightError}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput value={ft} onChange={setFt} min={0} suffix="ft" aria-label="Height, feet" inputMode="numeric" placeholder="5" invalid={!!heightError && num(ft) < 0} />
                    <NumberInput value={inch} onChange={setInch} min={0} suffix="in" aria-label="Height, inches" placeholder="9" invalid={!!heightError && num(inch) < 0} />
                  </div>
                </Field>
                <Field label="Weight" error={weightError}>
                  <NumberInput value={lb} onChange={setLb} min={0} suffix="lb" placeholder="154" invalid={!!weightError} />
                </Field>
              </>
            )}

            <Callout tone="neutral" icon={<Info />} className="mt-auto">
              BMI is a screening measure for adults. It can&apos;t tell muscle from fat and isn&apos;t meant for
              children or pregnancy, so ask a doctor for a full health check.
            </Callout>
          </>
        }
        results={
          <>
            <ResultCard
              label="Your BMI"
              value={cat ? fmt(bmi, 1) : ""}
              tone={cat?.tone ?? "accent"}
              caption={cat ? cat.label : undefined}
              copyText={cat ? fmt(bmi, 1) : ""}
              placeholder="Enter your height and weight"
            >
              <BmiScale bmi={bmi} />
            </ResultCard>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="Healthy weight"
                value={cat ? `${fmt(low, 1)}–${fmt(high, 1)}` : "—"}
                hint={cat ? `${unit} for your height` : undefined}
              />
              <Stat
                label={advice?.label ?? "To reach a healthy BMI"}
                value={advice?.value ?? "—"}
                hint={advice?.hint}
                tone={advice?.tone}
              />
            </div>
          </>
        }
      />

      <ToolSection
        title="BMI categories for adults"
        description={cat ? `Weight ranges for your height (${unit})` : "Enter your height to see weight ranges"}
      >
        <Table label="BMI categories">
          <thead>
            <tr>
              <th>Category</th>
              <th className="num">BMI</th>
              <th className="num">Weight for your height</th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b, i) => {
              const current = cat?.label === b.label;
              const from = i === 0 ? null : weightAt(b.min);
              const to = i === bands.length - 1 ? null : weightAt(b.max === 25 ? 24.9 : b.max === 30 ? 29.9 : b.max);
              const range =
                !(heightM > 0)
                  ? "—"
                  : from == null
                    ? `Below ${fmt(weightAt(18.5), 1)}`
                    : to == null
                      ? `${fmt(from, 1)} or more`
                      : `${fmt(from, 1)} – ${fmt(to, 1)}`;
              return (
                <tr key={b.label} className={cn(current && "bg-subtle")}>
                  <td>
                    <span className="flex items-center gap-2">
                      <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", b.fill)} />
                      <span className={cn(current && "font-medium text-foreground")}>{b.label}</span>
                      {current && <Badge tone={b.tone}>You</Badge>}
                    </span>
                  </td>
                  <td className="num">{b.range}</td>
                  <td className="num">{range}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ToolSection>
    </div>
  );
}
