"use client";

import { useState } from "react";
import {
  Field,
  Input,
  NumberInput,
  ResultCard,
  Stat,
  Switch,
  ToolLayout,
  cn,
  focusRing,
  money,
  num,
} from "@/components/ui";
import { Stepper } from "./shared-calc/stepper";

const presets = [10, 12, 15, 18, 20];

function pctLabel(p: number) {
  return Number.isFinite(p) ? `${Number(p.toFixed(2)).toString()}%` : "—";
}

export default function TipCalculator() {
  const [bill, setBill] = useState("85.40");
  const [tip, setTip] = useState("15");
  const [custom, setCustom] = useState(false);
  const [people, setPeople] = useState(2);
  const [roundUp, setRoundUp] = useState(false);

  const amount = num(bill);
  const pct = num(tip);
  const split = Math.max(1, Math.floor(people) || 1);
  const billError = bill.trim() !== "" && !(amount > 0) ? "Enter a bill amount above 0" : undefined;
  const tipError = tip.trim() !== "" && !(pct >= 0) ? "The tip can't be negative" : undefined;
  const valid = amount > 0 && pct >= 0;

  const tipAmount = (amount * pct) / 100;
  const total = amount + tipAmount;
  const exactEach = total / split;
  // Optional: round each share up to the next whole unit; the extra goes to the tip.
  const each = roundUp ? Math.ceil(exactEach - 1e-9) : exactEach;
  const paidTotal = roundUp ? each * split : total;
  const paidTip = paidTotal - amount;

  const caption = !valid
    ? undefined
    : split === 1
      ? `Bill ${money(amount)} + ${money(paidTip)} tip`
      : `${money(paidTotal)} split ${split} ways`;

  return (
    <ToolLayout
      inputs={
        <>
          <Field label="Bill amount" error={billError}>
            <NumberInput value={bill} onChange={setBill} min={0} step="0.01" placeholder="0.00" invalid={!!billError} />
          </Field>

          <Field label="Tip" as="group" error={tipError} aside={pct >= 0 ? pctLabel(pct) : undefined}>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => {
                const selected = !custom && num(tip) === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setTip(String(p));
                      setCustom(false);
                    }}
                    className={cn(
                      "h-11 rounded-lg border text-[15px] font-medium tabular-nums shadow-xs transition-[color,background-color,border-color] duration-150 sm:h-10 sm:text-sm",
                      focusRing,
                      selected
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border-strong bg-card text-foreground hover:border-border-hover hover:bg-subtle",
                    )}
                  >
                    {p}%
                  </button>
                );
              })}
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                aria-label="Custom tip percentage"
                placeholder="Other"
                value={custom ? tip : ""}
                suffix="%"
                invalid={!!tipError}
                onChange={(e) => {
                  setTip(e.target.value);
                  setCustom(true);
                }}
                onFocus={(e) => {
                  if (!custom) {
                    setCustom(true);
                    const el = e.currentTarget;
                    requestAnimationFrame(() => el.select());
                  }
                }}
                onBlur={() => {
                  if (tip.trim() === "") {
                    setCustom(false);
                    setTip("15");
                  }
                }}
              />
            </div>
          </Field>

          <Field label="Split between" as="group" aside={split === 1 ? "1 person" : `${split} people`}>
            <Stepper value={people} onChange={setPeople} min={1} max={100} label="Number of people" />
          </Field>

          <Switch
            checked={roundUp}
            onChange={setRoundUp}
            label="Round up each share"
            description="Everyone pays a whole amount; the extra goes to the tip"
          />
        </>
      }
      results={
        <>
          <ResultCard
            label={split === 1 ? "Total to pay" : "Each person pays"}
            value={valid ? money(each) : ""}
            caption={caption}
            copyText={valid ? money(each) : ""}
            placeholder="Enter the bill amount"
          />
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Tip"
              value={valid ? money(paidTip) : "—"}
              hint={valid ? `${pctLabel((paidTip / amount) * 100)} of the bill` : undefined}
            />
            <Stat label="Total with tip" value={valid ? money(paidTotal) : "—"} />
            {split > 1 && (
              <>
                <Stat label="Tip per person" value={valid ? money(paidTip / split) : "—"} />
                <Stat label="Bill per person" value={valid ? money(amount / split) : "—"} hint="before tip" />
              </>
            )}
          </div>
        </>
      }
    />
  );
}
