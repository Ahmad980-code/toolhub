"use client";

import { ChevronDown, Info, TriangleAlert } from "lucide-react";
import { useState } from "react";
import {
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
  focusRing,
  num,
} from "@/components/ui";

type Category = "unprotected" | "protected" | "lifeline";
type Band = { id: string; label: string; upTo: number; rate: number; fixed: number };

// NEPRA uniform domestic tariff (A-1) for DISCOs, S.R.O. 279(I)/2026, effective 12 February 2026.
const BANDS: Record<Category, Band[]> = {
  unprotected: [
    { id: "u1", label: "1–100", upTo: 100, rate: 22.44, fixed: 275 },
    { id: "u2", label: "101–200", upTo: 200, rate: 28.91, fixed: 300 },
    { id: "u3", label: "201–300", upTo: 300, rate: 33.1, fixed: 350 },
    { id: "u4", label: "301–400", upTo: 400, rate: 36.46, fixed: 400 },
    { id: "u5", label: "401–500", upTo: 500, rate: 38.95, fixed: 500 },
    { id: "u6", label: "501–600", upTo: 600, rate: 40.22, fixed: 675 },
    { id: "u7", label: "601–700", upTo: 700, rate: 41.85, fixed: 675 },
    { id: "u8", label: "Above 700", upTo: Infinity, rate: 47.2, fixed: 675 },
  ],
  protected: [
    { id: "p1", label: "1–100", upTo: 100, rate: 10.54, fixed: 200 },
    { id: "p2", label: "101–200", upTo: 200, rate: 13.01, fixed: 300 },
  ],
  lifeline: [
    { id: "l1", label: "1–50", upTo: 50, rate: 3.95, fixed: 0 },
    { id: "l2", label: "51–100", upTo: 100, rate: 7.74, fixed: 0 },
  ],
};
const LIMIT: Record<Category, number> = { unprotected: Infinity, protected: 200, lifeline: 100 };
const LIFELINE_MINIMUM = 75;

const CATEGORY_LABEL: Record<Category, string> = {
  unprotected: "Non-protected",
  protected: "Protected",
  lifeline: "Lifeline",
};

const rs = (n: number) => (Number.isFinite(n) ? `Rs ${fmt(n, 2)}` : "—");
const rsWhole = (n: number) => (Number.isFinite(n) ? `Rs ${fmt(Math.round(n), 0)}` : "—");

type Rates = Record<string, { rate: string; fixed: string }>;
const initialRates = (): Rates =>
  Object.fromEntries(
    Object.values(BANDS)
      .flat()
      .map((b) => [b.id, { rate: String(b.rate), fixed: String(b.fixed) }]),
  );

function categoryHint(c: Category) {
  if (c === "protected") return "Used 200 units or less in each of the last 6 months; one previous slab's benefit applies";
  if (c === "lifeline") return "Single-phase connection up to 1 kW using 100 units or less";
  return "Every unit is charged at the rate of the slab your usage reaches";
}

export default function ElectricityBillCalculator() {
  const [units, setUnits] = useState("250");
  const [category, setCategory] = useState<Category>("unprotected");
  const [load, setLoad] = useState("2");
  const [rates, setRates] = useState<Rates>(initialRates);
  const [fpa, setFpa] = useState("0");
  const [qta, setQta] = useState("0");
  const [gst, setGst] = useState("18");
  const [duty, setDuty] = useState("1.5");
  const [ptv, setPtv] = useState("35");

  const u = num(units);
  const kw = load.trim() === "" ? 0 : num(load);
  const unitsError = units.trim() !== "" && !(u >= 0) ? "Enter 0 or more units" : undefined;
  const loadError = load.trim() !== "" && !(kw >= 0) ? "Enter 0 or more kW" : undefined;
  const valid = u >= 0 && kw >= 0;

  // Protected and lifeline status only apply up to their limits; above that the bill is non-protected.
  const effective: Category = valid && u > LIMIT[category] ? "unprotected" : category;
  const bands = BANDS[effective].map((b) => ({
    ...b,
    rate: num(rates[b.id].rate) || 0,
    fixed: num(rates[b.id].fixed) || 0,
  }));
  const band = bands.find((b) => u <= b.upTo) ?? bands[bands.length - 1];

  const lines: { label: string; detail: string; amount: number }[] = [];
  let energy = 0;
  if (valid && u > 0) {
    if (effective === "protected" && u > 100) {
      // Protected consumers get the benefit of one previous slab.
      const [first, second] = bands;
      energy = 100 * first.rate + (u - 100) * second.rate;
      lines.push({
        label: "Energy charges",
        detail: `100 × Rs ${first.rate} + ${fmt(u - 100, 2)} × Rs ${second.rate}`,
        amount: energy,
      });
    } else {
      energy = u * band.rate;
      lines.push({ label: "Energy charges", detail: `${fmt(u, 2)} units × Rs ${band.rate} (${band.label} slab)`, amount: energy });
    }
  }
  if (effective === "lifeline" && valid && energy < LIFELINE_MINIMUM) {
    lines.splice(0, lines.length, { label: "Minimum charge", detail: "Lifeline minimum monthly charge", amount: LIFELINE_MINIMUM });
    energy = LIFELINE_MINIMUM;
  }
  const fixed = valid && u > 0 ? band.fixed * kw : 0;
  if (fixed > 0) lines.push({ label: "Fixed charges", detail: `${fmt(kw, 2)} kW × Rs ${band.fixed}`, amount: fixed });
  const fpaAmount = valid ? u * (num(fpa) || 0) : 0;
  if (fpaAmount !== 0) lines.push({ label: "Fuel price adjustment", detail: `${fmt(u, 2)} × Rs ${fpa}`, amount: fpaAmount });
  const qtaAmount = valid ? u * (num(qta) || 0) : 0;
  if (qtaAmount !== 0) lines.push({ label: "Quarterly adjustment", detail: `${fmt(u, 2)} × Rs ${qta}`, amount: qtaAmount });

  const subtotal = energy + fixed + fpaAmount + qtaAmount;
  const dutyAmount = (subtotal * (num(duty) || 0)) / 100;
  const gstAmount = (subtotal * (num(gst) || 0)) / 100;
  const ptvAmount = valid && u > 0 ? num(ptv) || 0 : 0;
  if (dutyAmount) lines.push({ label: "Electricity duty", detail: `${duty}% of ${rs(subtotal)}`, amount: dutyAmount });
  if (gstAmount) lines.push({ label: "GST", detail: `${gst}% of ${rs(subtotal)}`, amount: gstAmount });
  if (ptvAmount) lines.push({ label: "PTV fee", detail: "Fixed monthly fee", amount: ptvAmount });
  const total = subtotal + dutyAmount + gstAmount + ptvAmount;

  const setRate = (id: string, key: "rate" | "fixed", value: string) =>
    setRates((r) => ({ ...r, [id]: { ...r[id], [key]: value } }));

  return (
    <div className="grid gap-8">
      <ToolLayout
        inputs={
          <>
            <Field label="Units consumed this month" error={unitsError}>
              <NumberInput value={units} onChange={setUnits} min={0} suffix="kWh" inputMode="numeric" placeholder="250" invalid={!!unitsError} />
            </Field>
            <Field label="Consumer type" as="group" hint={categoryHint(category)}>
              <SegmentedControl
                label="Consumer type"
                value={category}
                onChange={setCategory}
                fullWidth
                options={[
                  { value: "unprotected", label: "Non-protected" },
                  { value: "protected", label: "Protected" },
                  { value: "lifeline", label: "Lifeline" },
                ]}
              />
            </Field>
            <Field label="Sanctioned load" hint="Printed on your bill; fixed charges are per kW" error={loadError}>
              <NumberInput value={load} onChange={setLoad} min={0} step="0.5" suffix="kW" placeholder="2" invalid={!!loadError} />
            </Field>
            {valid && effective !== category && (
              <Callout tone="warning" icon={<TriangleAlert />}>
                {CATEGORY_LABEL[category]} rates only apply up to {LIMIT[category]} units, so this bill is worked out at
                non-protected rates.
              </Callout>
            )}
            <Callout tone="neutral" icon={<Info />} className="mt-auto">
              Base rates from NEPRA&apos;s uniform domestic tariff (S.R.O. 279(I)/2026, effective 12 February 2026).
              Real bills also include the monthly fuel price adjustment and other changes; add them under
              &ldquo;Edit rates &amp; taxes&rdquo; for a closer estimate.
            </Callout>
          </>
        }
        results={
          <>
            <ResultCard
              label="Estimated bill"
              value={valid ? rsWhole(total) : ""}
              caption={
                valid && u > 0
                  ? `${fmt(u, 2)} units · ${CATEGORY_LABEL[effective]} · about Rs ${fmt(total / u, 2)} per unit`
                  : undefined
              }
              copyText={valid ? rsWhole(total) : ""}
              placeholder="Enter the units on your bill"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Energy charges" value={valid ? rs(energy) : "—"} />
              <Stat label="Taxes & fees" value={valid ? rs(dutyAmount + gstAmount + ptvAmount) : "—"} hint="duty, GST, PTV fee" />
              <Stat
                label="Your slab rate"
                value={valid && u > 0 ? `Rs ${band.rate}` : "—"}
                hint={valid && u > 0 ? `${band.label} units` : undefined}
              />
              <Stat label="Fixed charges" value={valid ? rs(fixed) : "—"} />
            </div>
          </>
        }
      />

      <ToolSection title="Bill breakdown" description="How the estimate is built up, line by line.">
        <Table label="Bill breakdown">
          <thead>
            <tr>
              <th>Item</th>
              <th>How it&apos;s worked out</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.label}>
                <td className="font-medium">{l.label}</td>
                <td className="text-muted">{l.detail}</td>
                <td className="num">{rs(l.amount)}</td>
              </tr>
            ))}
            <tr>
              <td className="font-semibold">Total</td>
              <td />
              <td className="num font-semibold">{valid ? rs(total) : "—"}</td>
            </tr>
          </tbody>
        </Table>
      </ToolSection>

      <details className="group rounded-xl border border-border bg-card">
        <summary
          className={cn(
            "flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 font-medium text-foreground sm:px-5",
            focusRing,
          )}
        >
          Edit rates &amp; taxes
          <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-6 border-t border-border p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Fuel price adjustment" hint="Per unit; negative for a refund">
              <NumberInput value={fpa} onChange={setFpa} step="0.01" prefix="Rs" placeholder="0" />
            </Field>
            <Field label="Quarterly adjustment" hint="Per unit; negative for a cut">
              <NumberInput value={qta} onChange={setQta} step="0.01" prefix="Rs" placeholder="0" />
            </Field>
            <Field label="GST">
              <NumberInput value={gst} onChange={setGst} min={0} step="0.5" suffix="%" />
            </Field>
            <Field label="Electricity duty" hint="Varies by province">
              <NumberInput value={duty} onChange={setDuty} min={0} step="0.1" suffix="%" />
            </Field>
            <Field label="PTV fee">
              <NumberInput value={ptv} onChange={setPtv} min={0} prefix="Rs" />
            </Field>
          </div>
          <Table label={`${CATEGORY_LABEL[effective]} slab rates`}>
            <thead>
              <tr>
                <th>{CATEGORY_LABEL[effective]} units / month</th>
                <th className="num">Rate per unit</th>
                <th className="num">Fixed per kW</th>
              </tr>
            </thead>
            <tbody>
              {BANDS[effective].map((b) => (
                <tr key={b.id}>
                  <td>{b.label}</td>
                  <td className="num">
                    <div className="ml-auto w-32">
                      <NumberInput
                        value={rates[b.id].rate}
                        onChange={(v) => setRate(b.id, "rate", v)}
                        step="0.01"
                        prefix="Rs"
                        aria-label={`Rate for ${b.label} units`}
                      />
                    </div>
                  </td>
                  <td className="num">
                    <div className="ml-auto w-32">
                      <NumberInput
                        value={rates[b.id].fixed}
                        onChange={(v) => setRate(b.id, "fixed", v)}
                        step="1"
                        prefix="Rs"
                        aria-label={`Fixed charge per kW for ${b.label} units`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </details>
    </div>
  );
}
