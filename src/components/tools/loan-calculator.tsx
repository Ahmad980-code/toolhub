"use client";

import { useState } from "react";
import { Button, Field, NumberInput, Stat, money, num } from "@/components/ui";

export default function LoanCalculator() {
  const [amount, setAmount] = useState("250000");
  const [rate, setRate] = useState("7.5");
  const [term, setTerm] = useState("20");
  const [inYears, setInYears] = useState(true);

  const P = num(amount);
  const n = Math.round(num(term) * (inYears ? 12 : 1));
  const r = num(rate) / 100 / 12;
  const valid = P > 0 && n > 0 && r >= 0;

  const emi = !valid ? NaN : r === 0 ? P / n : (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const total = emi * n;

  const schedule: { year: number; principal: number; interest: number; balance: number }[] = [];
  if (valid && n <= 1200) {
    let balance = P;
    for (let month = 1; month <= n; month++) {
      const interest = balance * r;
      const principal = Math.min(emi - interest, balance);
      balance -= principal;
      const year = Math.ceil(month / 12);
      const row = schedule[year - 1] ?? (schedule[year - 1] = { year, principal: 0, interest: 0, balance: 0 });
      row.principal += principal;
      row.interest += interest;
      row.balance = Math.max(balance, 0);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Loan amount"><NumberInput value={amount} onChange={setAmount} min={0} /></Field>
        <Field label="Interest rate (% per year)"><NumberInput value={rate} onChange={setRate} min={0} step="0.1" /></Field>
        <Field label={`Term (${inYears ? "years" : "months"})`}>
          <div className="flex gap-2">
            <NumberInput value={term} onChange={setTerm} min={1} />
            <Button onClick={() => setInYears((v) => !v)} aria-label="Switch term unit">
              {inYears ? "Yrs" : "Mo"}
            </Button>
          </div>
        </Field>
      </div>

      {valid && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat highlight label="Monthly payment (EMI)" value={money(emi)} />
            <Stat label="Total interest" value={money(total - P)} />
            <Stat label="Total amount paid" value={money(total)} />
          </div>

          {schedule.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-right text-sm tabular-nums">
                <thead className="bg-background text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Year</th>
                    <th className="px-3 py-2">Principal paid</th>
                    <th className="px-3 py-2">Interest paid</th>
                    <th className="px-3 py-2">Balance left</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.year} className="border-t border-border">
                      <td className="px-3 py-2 text-left">{row.year}</td>
                      <td className="px-3 py-2">{money(row.principal)}</td>
                      <td className="px-3 py-2">{money(row.interest)}</td>
                      <td className="px-3 py-2">{money(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
