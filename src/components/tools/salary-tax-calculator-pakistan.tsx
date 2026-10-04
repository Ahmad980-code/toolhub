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
  fmt,
  num,
} from "@/components/ui";

/** Tax on income in (from, to] = base + rate × (income − from). Bases equal the tax of all lower slabs. */
type Slab = { from: number; to: number; base: number; rate: number };
type YearId = "2027" | "2026";

const TAX_YEARS: Record<
  YearId,
  { label: string; period: string; law: string; slabs: Slab[]; surcharge?: { above: number; rate: number } }
> = {
  "2027": {
    label: "2026-27",
    period: "Tax year 2027 (1 July 2026 – 30 June 2027)",
    law: "Finance Act 2026",
    slabs: [
      { from: 0, to: 600_000, base: 0, rate: 0 },
      { from: 600_000, to: 1_200_000, base: 0, rate: 0.01 },
      { from: 1_200_000, to: 2_200_000, base: 6_000, rate: 0.11 },
      { from: 2_200_000, to: 3_200_000, base: 116_000, rate: 0.2 },
      { from: 3_200_000, to: 4_100_000, base: 316_000, rate: 0.25 },
      { from: 4_100_000, to: 5_600_000, base: 541_000, rate: 0.29 },
      { from: 5_600_000, to: 7_000_000, base: 976_000, rate: 0.32 },
      { from: 7_000_000, to: Infinity, base: 1_424_000, rate: 0.35 },
    ],
  },
  "2026": {
    label: "2025-26",
    period: "Tax year 2026 (1 July 2025 – 30 June 2026)",
    law: "Finance Act 2025",
    slabs: [
      { from: 0, to: 600_000, base: 0, rate: 0 },
      { from: 600_000, to: 1_200_000, base: 0, rate: 0.01 },
      { from: 1_200_000, to: 2_200_000, base: 6_000, rate: 0.11 },
      { from: 2_200_000, to: 3_200_000, base: 116_000, rate: 0.23 },
      { from: 3_200_000, to: 4_100_000, base: 346_000, rate: 0.3 },
      { from: 4_100_000, to: Infinity, base: 616_000, rate: 0.35 },
    ],
    // 9% of the tax payable when taxable income exceeds Rs 10 million (abolished from tax year 2027).
    surcharge: { above: 10_000_000, rate: 0.09 },
  },
};

const rs = (n: number) => (Number.isFinite(n) ? `Rs ${fmt(Math.round(n), 0)}` : "—");
const pct = (r: number) => `${fmt(r * 100, 2)}%`;

function computeTax(income: number, year: YearId) {
  const { slabs, surcharge } = TAX_YEARS[year];
  const slab = slabs.find((s) => income <= s.to) ?? slabs[slabs.length - 1];
  const base = income > 0 ? slab.base + slab.rate * (income - slab.from) : 0;
  const extra = surcharge && income > surcharge.above ? base * surcharge.rate : 0;
  return { tax: base + extra, base, surcharge: extra, slab };
}

function slabLabel(s: Slab) {
  if (s.from === 0) return `Up to Rs ${fmt(s.to, 0)}`;
  if (s.to === Infinity) return `Above Rs ${fmt(s.from, 0)}`;
  return `Rs ${fmt(s.from + 1, 0)} – ${fmt(s.to, 0)}`;
}

export default function SalaryTaxCalculatorPakistan() {
  const [year, setYear] = useState<YearId>("2027");
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");
  const [salary, setSalary] = useState("150000");

  const amount = num(salary);
  const error = salary.trim() !== "" && !(amount >= 0) ? "Enter a salary of 0 or more" : undefined;
  const valid = amount >= 0;
  const annual = valid ? (period === "monthly" ? amount * 12 : amount) : NaN;
  const { tax, surcharge, slab } = computeTax(valid ? annual : 0, year);
  const effective = annual > 0 ? tax / annual : 0;
  const info = TAX_YEARS[year];

  function switchPeriod(next: "monthly" | "annual") {
    if (next === period) return;
    if (amount > 0) {
      const converted = next === "annual" ? amount * 12 : amount / 12;
      setSalary(String(Math.round(converted * 100) / 100));
    }
    setPeriod(next);
  }

  return (
    <div className="grid gap-8">
      <ToolLayout
        inputs={
          <>
            <Field label="Tax year" as="group">
              <SegmentedControl
                label="Tax year"
                value={year}
                onChange={setYear}
                fullWidth
                options={[
                  { value: "2027", label: "2026-27" },
                  { value: "2026", label: "2025-26" },
                ]}
              />
            </Field>
            <Field label="I'm entering my" as="group">
              <SegmentedControl
                label="Salary period"
                value={period}
                onChange={switchPeriod}
                fullWidth
                options={[
                  { value: "monthly", label: "Monthly salary" },
                  { value: "annual", label: "Annual salary" },
                ]}
              />
            </Field>
            <Field
              label={period === "monthly" ? "Monthly taxable salary" : "Annual taxable salary"}
              hint="Gross salary before tax, excluding tax-exempt allowances"
              error={error}
            >
              <NumberInput
                value={salary}
                onChange={setSalary}
                min={0}
                step="1000"
                prefix="Rs"
                inputMode="numeric"
                placeholder={period === "monthly" ? "150000" : "1800000"}
                invalid={!!error}
              />
            </Field>
            <Callout tone="neutral" icon={<Info />} className="mt-auto">
              Salaried-person rates for {info.period}, under the {info.law}. This is an estimate: it doesn&apos;t
              include other income, tax credits or adjustments your employer may apply.
            </Callout>
          </>
        }
        results={
          <>
            <ResultCard
              label="Monthly income tax"
              value={valid ? rs(tax / 12) : ""}
              caption={valid ? `${rs(tax)} a year · ${pct(effective)} of your salary` : undefined}
              copyText={valid ? rs(tax / 12) : ""}
              placeholder="Enter your salary"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Monthly take-home" value={valid ? rs((annual - tax) / 12) : "—"} />
              <Stat label="Annual take-home" value={valid ? rs(annual - tax) : "—"} />
              <Stat label="Annual income tax" value={valid ? rs(tax) : "—"} />
              <Stat
                label="Your tax slab"
                value={valid ? `${fmt(slab.rate * 100, 0)}%` : "—"}
                hint={valid ? (slab.rate === 0 ? "no tax in this slab" : "rate on income in this slab") : undefined}
              />
              {surcharge > 0 && <Stat label="Surcharge (9%)" value={rs(surcharge)} hint="included in the tax above" />}
            </div>
          </>
        }
      />

      <ToolSection
        title="Slab-by-slab breakdown"
        description={`${info.period}. Each part of your annual salary is taxed at its own slab's rate.`}
      >
        <Table label="Income tax slabs">
          <thead>
            <tr>
              <th>Annual income slab</th>
              <th className="num">Rate</th>
              <th className="num">Your income in slab</th>
              <th className="num">Tax</th>
            </tr>
          </thead>
          <tbody>
            {info.slabs.map((s) => {
              const portion = valid ? Math.min(Math.max(annual - s.from, 0), s.to - s.from) : 0;
              const active = valid && s === slab && annual > 0;
              return (
                <tr key={s.from}>
                  <td>
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {slabLabel(s)}
                      {active && <Badge tone="accent">You</Badge>}
                    </span>
                  </td>
                  <td className="num">{fmt(s.rate * 100, 0)}%</td>
                  <td className="num">{portion > 0 ? rs(portion) : "—"}</td>
                  <td className="num">{portion > 0 ? rs(portion * s.rate) : "—"}</td>
                </tr>
              );
            })}
            {surcharge > 0 && (
              <tr>
                <td>Surcharge: 9% of tax (income above Rs 10,000,000)</td>
                <td className="num">9%</td>
                <td className="num">—</td>
                <td className="num">{rs(surcharge)}</td>
              </tr>
            )}
            <tr>
              <td className="font-semibold">Total annual tax</td>
              <td className="num" />
              <td className="num font-semibold">{valid ? rs(annual) : "—"}</td>
              <td className="num font-semibold">{valid ? rs(tax) : "—"}</td>
            </tr>
          </tbody>
        </Table>
      </ToolSection>
    </div>
  );
}
