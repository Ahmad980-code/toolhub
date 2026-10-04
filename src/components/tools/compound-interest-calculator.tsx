"use client";

import { useState } from "react";
import { Field, NumberInput, Stat, inputClass, money, num } from "@/components/ui";

const frequencies = [
  { label: "Yearly", value: 1 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [perYear, setPerYear] = useState(12);
  const [monthly, setMonthly] = useState("200");

  const P = num(principal);
  const yrs = Math.round(num(years));
  const nominal = num(rate) / 100;
  const deposit = num(monthly) || 0;
  const valid = P >= 0 && yrs > 0 && yrs <= 100 && nominal >= 0;

  // Convert the nominal rate + compounding frequency into an equivalent monthly rate.
  const monthlyRate = (1 + nominal / perYear) ** (perYear / 12) - 1;

  const rows: { year: number; deposits: number; interest: number; balance: number }[] = [];
  if (valid) {
    let balance = P;
    let deposits = P;
    for (let month = 1; month <= yrs * 12; month++) {
      balance = balance * (1 + monthlyRate) + deposit;
      deposits += deposit;
      if (month % 12 === 0) {
        rows.push({ year: month / 12, deposits, interest: balance - deposits, balance });
      }
    }
  }
  const last = rows.at(-1);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Starting amount"><NumberInput value={principal} onChange={setPrincipal} min={0} /></Field>
        <Field label="Annual interest rate (%)"><NumberInput value={rate} onChange={setRate} min={0} step="0.1" /></Field>
        <Field label="Years"><NumberInput value={years} onChange={setYears} min={1} max={100} /></Field>
        <Field label="Compounding">
          <select className={inputClass} value={perYear} onChange={(e) => setPerYear(Number(e.target.value))}>
            {frequencies.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Monthly contribution"><NumberInput value={monthly} onChange={setMonthly} min={0} /></Field>
      </div>

      {last && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat highlight label="Final balance" value={money(last.balance)} />
            <Stat label="Total deposited" value={money(last.deposits)} />
            <Stat label="Interest earned" value={money(last.interest)} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-right text-sm tabular-nums">
              <thead className="bg-background text-xs uppercase text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Year</th>
                  <th className="px-3 py-2">Total deposited</th>
                  <th className="px-3 py-2">Interest earned</th>
                  <th className="px-3 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.year} className="border-t border-border">
                    <td className="px-3 py-2 text-left">{row.year}</td>
                    <td className="px-3 py-2">{money(row.deposits)}</td>
                    <td className="px-3 py-2">{money(row.interest)}</td>
                    <td className="px-3 py-2">{money(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
