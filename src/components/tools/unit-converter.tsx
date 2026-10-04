"use client";

import { useState } from "react";
import { Button, Field, NumberInput, Stat, fmt, inputClass, num } from "@/components/ui";

type Unit = { id: string; name: string; toBase: (v: number) => number; fromBase: (v: number) => number };

const linear = (id: string, name: string, factor: number): Unit => ({
  id,
  name,
  toBase: (v) => v * factor,
  fromBase: (v) => v / factor,
});

const groups: Record<string, Unit[]> = {
  Length: [
    linear("mm", "Millimetres", 0.001),
    linear("cm", "Centimetres", 0.01),
    linear("m", "Metres", 1),
    linear("km", "Kilometres", 1000),
    linear("in", "Inches", 0.0254),
    linear("ft", "Feet", 0.3048),
    linear("yd", "Yards", 0.9144),
    linear("mi", "Miles", 1609.344),
  ],
  Weight: [
    linear("mg", "Milligrams", 0.001),
    linear("g", "Grams", 1),
    linear("kg", "Kilograms", 1000),
    linear("t", "Tonnes", 1_000_000),
    linear("oz", "Ounces", 28.349523125),
    linear("lb", "Pounds", 453.59237),
    linear("st", "Stone", 6350.29318),
  ],
  Temperature: [
    { id: "c", name: "Celsius", toBase: (v) => v, fromBase: (v) => v },
    { id: "f", name: "Fahrenheit", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
    { id: "k", name: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  Volume: [
    linear("ml", "Millilitres", 0.001),
    linear("l", "Litres", 1),
    linear("m3", "Cubic metres", 1000),
    linear("tsp", "Teaspoons (US)", 0.00492892),
    linear("tbsp", "Tablespoons (US)", 0.0147868),
    linear("cup", "Cups (US)", 0.236588),
    linear("floz", "Fluid ounces (US)", 0.0295735),
    linear("gal", "Gallons (US)", 3.78541),
  ],
  Speed: [
    linear("mps", "Metres/second", 1),
    linear("kph", "Kilometres/hour", 1 / 3.6),
    linear("mph", "Miles/hour", 0.44704),
    linear("kn", "Knots", 0.514444),
  ],
};

const defaults: Record<string, [string, string]> = {
  Length: ["cm", "in"],
  Weight: ["kg", "lb"],
  Temperature: ["c", "f"],
  Volume: ["l", "gal"],
  Speed: ["kph", "mph"],
};

export default function UnitConverter() {
  const [group, setGroup] = useState("Length");
  const [from, setFrom] = useState("cm");
  const [to, setTo] = useState("in");
  const [value, setValue] = useState("1");

  const units = groups[group];
  const fromUnit = units.find((u) => u.id === from) ?? units[0];
  const toUnit = units.find((u) => u.id === to) ?? units[1];
  const v = num(value);
  const base = Number.isFinite(v) ? fromUnit.toBase(v) : NaN;

  function pickGroup(g: string) {
    setGroup(g);
    setFrom(defaults[g][0]);
    setTo(defaults[g][1]);
  }

  const unitSelect = (current: string, set: (id: string) => void, label: string) => (
    <select className={inputClass} value={current} onChange={(e) => set(e.target.value)} aria-label={label}>
      {units.map((u) => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>
  );

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {Object.keys(groups).map((g) => (
          <Button key={g} active={g === group} onClick={() => pickGroup(g)}>{g}</Button>
        ))}
      </div>

      <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto_1fr]">
        <Field label="Value"><NumberInput value={value} onChange={setValue} /></Field>
        <Field label="From">{unitSelect(fromUnit.id, setFrom, "From unit")}</Field>
        <Button
          aria-label="Swap units"
          onClick={() => {
            setFrom(toUnit.id);
            setTo(fromUnit.id);
          }}
        >
          ⇄
        </Button>
        <Field label="To">{unitSelect(toUnit.id, setTo, "To unit")}</Field>
      </div>

      <Stat
        highlight
        label="Result"
        value={Number.isFinite(base) ? `${fmt(v, 6)} ${fromUnit.name} = ${fmt(toUnit.fromBase(base), 6)} ${toUnit.name}` : "—"}
      />

      {Number.isFinite(base) && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <tbody>
              {units.map((u) => (
                <tr key={u.id} className="border-t border-border first:border-t-0">
                  <td className="px-3 py-2 text-muted">{u.name}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{fmt(u.fromBase(base), 6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
