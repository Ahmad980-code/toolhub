"use client";

import { CircleAlert, Info } from "lucide-react";
import { useState } from "react";
import {
  Badge,
  Callout,
  Field,
  NumberInput,
  ResultCard,
  SegmentedControl,
  Select,
  Stat,
  Table,
  ToolLayout,
  ToolSection,
  cn,
  fmt,
  num,
} from "@/components/ui";

type Units = "metric" | "imperial";
type Sex = "male" | "female";

const LB_PER_KG = 1 / 0.45359237;
const KCAL_PER_KG = 7700;

const ACTIVITY = [
  { value: "1.2", label: "Sedentary", short: "little or no exercise", detail: "Little or no exercise, desk job" },
  { value: "1.375", label: "Lightly active", short: "1–3 days a week", detail: "Light exercise or sport 1–3 days a week" },
  { value: "1.55", label: "Moderately active", short: "3–5 days a week", detail: "Moderate exercise or sport 3–5 days a week" },
  { value: "1.725", label: "Very active", short: "6–7 days a week", detail: "Hard exercise or sport 6–7 days a week" },
  { value: "1.9", label: "Extra active", short: "physical job", detail: "Very hard daily training or a physical job" },
] as const;

/** Weekly weight change in kg (negative = loss). */
const GOALS = [
  { id: "maintain", kgPerWeek: 0 },
  { id: "lose-0.25", kgPerWeek: -0.25 },
  { id: "lose-0.5", kgPerWeek: -0.5 },
  { id: "lose-1", kgPerWeek: -1 },
  { id: "gain-0.25", kgPerWeek: 0.25 },
  { id: "gain-0.5", kgPerWeek: 0.5 },
] as const;
type GoalId = (typeof GOALS)[number]["id"];

const MACROS = [
  { key: "protein", label: "Protein", share: 0.3, kcalPerGram: 4, fill: "bg-accent" },
  { key: "carbs", label: "Carbs", share: 0.4, kcalPerGram: 4, fill: "bg-success" },
  { key: "fat", label: "Fat", share: 0.3, kcalPerGram: 9, fill: "bg-warning" },
] as const;

/** Mifflin-St Jeor resting energy expenditure in kcal/day. */
function mifflinStJeor(sex: Sex, kg: number, cm: number, age: number) {
  return 10 * kg + 6.25 * cm - 5 * age + (sex === "male" ? 5 : -161);
}

function goalLabel(kgPerWeek: number, units: Units) {
  if (kgPerWeek === 0) return "Maintain weight";
  const amount = Math.abs(kgPerWeek);
  const rate = units === "metric" ? `${fmt(amount, 2)} kg` : `${fmt(amount * LB_PER_KG, 2)} lb`;
  return `${kgPerWeek < 0 ? "Lose" : "Gain"} ${rate} a week`;
}

function signed(n: number) {
  if (n === 0) return "±0";
  return `${n > 0 ? "+" : "−"}${fmt(Math.abs(n), 0)}`;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export default function CalorieCalculator() {
  const [units, setUnits] = useState<Units>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [cm, setCm] = useState("175");
  const [kg, setKg] = useState("75");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("9");
  const [lb, setLb] = useState("165");
  const [activity, setActivity] = useState<string>("1.55");
  const [goal, setGoal] = useState<GoalId>("maintain");

  // Switching units converts what is already entered, so nothing has to be retyped.
  function changeUnits(next: Units) {
    if (next === units) return;
    if (next === "imperial") {
      const c = num(cm);
      if (c > 0) {
        const totalIn = c / 2.54;
        let f = Math.floor(totalIn / 12);
        let i = round1(totalIn - f * 12);
        if (i >= 12) {
          f += 1;
          i = 0;
        }
        setFt(String(f));
        setInch(String(i));
      }
      const k = num(kg);
      if (k > 0) setLb(String(round1(k * LB_PER_KG)));
    } else {
      const f = num(ft);
      const i = num(inch);
      const c = ((Number.isFinite(f) ? f : 0) * 12 + (Number.isFinite(i) ? i : 0)) * 2.54;
      if (c > 0) setCm(String(round1(c)));
      const l = num(lb);
      if (l > 0) setKg(String(round1(l / LB_PER_KG)));
    }
    setUnits(next);
  }

  // ---- Parse + validate -------------------------------------------------------------------------
  const ageN = num(age);
  const ageError = age.trim() !== "" && !(ageN >= 15 && ageN <= 100) ? "Enter an age from 15 to 100" : "";

  let heightCm: number;
  let heightError = "";
  let weightKg: number;
  let weightError = "";
  let heightEmpty: boolean;
  let weightEmpty: boolean;
  if (units === "metric") {
    heightEmpty = cm.trim() === "";
    weightEmpty = kg.trim() === "";
    heightCm = num(cm);
    weightKg = num(kg);
    if (!heightEmpty && !(heightCm >= 100 && heightCm <= 250)) heightError = "Enter a height from 100 to 250 cm";
    if (!weightEmpty && !(weightKg >= 30 && weightKg <= 300)) weightError = "Enter a weight from 30 to 300 kg";
  } else {
    heightEmpty = ft.trim() === "" && inch.trim() === "";
    weightEmpty = lb.trim() === "";
    const f = num(ft);
    const i = num(inch);
    const inches = Number.isFinite(i) ? i : 0;
    heightCm = heightEmpty ? NaN : ((Number.isFinite(f) ? f : 0) * 12 + inches) * 2.54;
    if (!heightEmpty) {
      if (inches < 0 || inches >= 12) heightError = "Inches must be from 0 to 11.9";
      else if (!(heightCm >= 100 && heightCm <= 250)) heightError = "Enter a height from 3 ft 4 in to 8 ft 2 in";
    }
    const pounds = num(lb);
    weightKg = pounds / LB_PER_KG;
    if (!weightEmpty && !(pounds >= 66 && pounds <= 660)) weightError = "Enter a weight from 66 to 660 lb";
  }

  const valid =
    !ageError &&
    !heightError &&
    !weightError &&
    Number.isFinite(ageN) &&
    Number.isFinite(heightCm) &&
    Number.isFinite(weightKg);

  const bmr = valid ? mifflinStJeor(sex, weightKg, heightCm, ageN) : NaN;
  const factor = Number(activity);
  const tdee = bmr * factor;
  const minimum = sex === "female" ? 1200 : 1500;

  const rows = GOALS.map((g) => {
    const delta = (g.kgPerWeek * KCAL_PER_KG) / 7;
    const kcal = tdee + delta;
    return { ...g, delta, kcal, low: Math.round(kcal) < minimum };
  });
  const selected = rows.find((r) => r.id === goal) ?? rows[0];
  const target = selected.kcal;
  const tooLow = valid && selected.low;

  const activityInfo = ACTIVITY.find((a) => a.value === activity) ?? ACTIVITY[2];
  const missing = [age.trim() === "" && "age", heightEmpty && "height", weightEmpty && "weight"].filter(Boolean);
  const placeholder = missing.length ? `Enter your ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}` : "Check the highlighted fields";

  const caption =
    selected.kgPerWeek === 0
      ? "To keep your current weight"
      : `To ${goalLabel(selected.kgPerWeek, units).toLowerCase()} (${signed(Math.round(selected.delta))} kcal a day vs TDEE)`;

  return (
    <div className="flex flex-col gap-8">
      <ToolLayout
        inputs={
          <>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <Field label="Units" as="group">
                <SegmentedControl
                  label="Unit system"
                  value={units}
                  onChange={changeUnits}
                  fullWidth
                  options={[
                    { value: "metric", label: "Metric" },
                    { value: "imperial", label: "Imperial" },
                  ]}
                />
              </Field>
              <Field label="Sex" as="group">
                <SegmentedControl
                  label="Sex"
                  value={sex}
                  onChange={setSex}
                  fullWidth
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                />
              </Field>
            </div>

            <Field label="Age" error={ageError || undefined}>
              <NumberInput
                value={age}
                onChange={setAge}
                suffix="years"
                inputMode="numeric"
                min={15}
                max={100}
                placeholder="30"
                invalid={!!ageError}
              />
            </Field>

            {units === "metric" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Height" error={heightError || undefined}>
                  <NumberInput value={cm} onChange={setCm} suffix="cm" min={100} max={250} placeholder="175" invalid={!!heightError} />
                </Field>
                <Field label="Weight" error={weightError || undefined}>
                  <NumberInput value={kg} onChange={setKg} suffix="kg" min={30} max={300} placeholder="75" invalid={!!weightError} />
                </Field>
              </div>
            ) : (
              <>
                <Field label="Height" as="group" error={heightError || undefined}>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                      value={ft}
                      onChange={setFt}
                      suffix="ft"
                      inputMode="numeric"
                      min={3}
                      max={8}
                      placeholder="5"
                      aria-label="Height, feet"
                      invalid={!!heightError}
                    />
                    <NumberInput
                      value={inch}
                      onChange={setInch}
                      suffix="in"
                      min={0}
                      max={11.9}
                      step="0.1"
                      placeholder="9"
                      aria-label="Height, inches"
                      invalid={!!heightError}
                    />
                  </div>
                </Field>
                <Field label="Weight" error={weightError || undefined}>
                  <NumberInput value={lb} onChange={setLb} suffix="lb" min={66} max={660} placeholder="165" invalid={!!weightError} />
                </Field>
              </>
            )}

            <Field label="Activity level" hint={`${activityInfo.detail} (BMR × ${activityInfo.value})`}>
              <Select value={activity} onChange={(e) => setActivity(e.target.value)}>
                {ACTIVITY.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label} ({a.short})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Goal" hint="Based on about 7,700 kcal per kg of body weight">
              <Select value={goal} onChange={(e) => setGoal(e.target.value as GoalId)}>
                {GOALS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {goalLabel(g.kgPerWeek, units)}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        }
        results={
          <>
            <ResultCard
              label="Daily calorie target"
              value={
                valid ? (
                  <>
                    {fmt(Math.round(target), 0)}{" "}
                    <span className="text-lg font-medium tracking-normal text-muted">kcal/day</span>
                  </>
                ) : (
                  ""
                )
              }
              copyText={valid ? `${fmt(Math.round(target), 0)} kcal` : ""}
              caption={valid ? caption : undefined}
              tone={tooLow ? "warning" : "accent"}
              placeholder={<span className="text-xl font-medium tracking-normal">{placeholder}</span>}
            />

            {tooLow && (
              <Callout tone="warning" icon={<CircleAlert />} title={`Below ${fmt(minimum, 0)} kcal a day`}>
                Eating less than {fmt(minimum, 0)} kcal a day is not recommended for {sex === "female" ? "women" : "men"} without
                medical supervision. Choose a slower rate or add more activity instead.
              </Callout>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Stat label="BMR" value={valid ? fmt(Math.round(bmr), 0) : "—"} hint="kcal a day at rest" />
              <Stat label="TDEE" value={valid ? fmt(Math.round(tdee), 0) : "—"} hint="kcal a day to maintain" />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Macro split</p>
                <p className="text-[13px] text-muted">30% · 40% · 30%</p>
              </div>
              <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
                {MACROS.map((m) => (
                  <span
                    key={m.key}
                    className={cn("h-full", m.fill, !valid && "opacity-30")}
                    style={{ width: `${m.share * 100}%` }}
                  />
                ))}
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2">
                {MACROS.map((m) => {
                  const kcal = target * m.share;
                  return (
                    <div key={m.key} className="min-w-0">
                      <dt className="flex items-center gap-1.5 text-[13px] text-muted">
                        <span className={cn("size-2 shrink-0 rounded-full", m.fill)} aria-hidden />
                        {m.label}
                      </dt>
                      <dd className="mt-0.5 text-lg font-semibold tracking-tight text-foreground tabular-nums">
                        {valid ? `${fmt(Math.round(kcal / m.kcalPerGram), 0)} g` : "—"}
                      </dd>
                      <dd className="text-xs text-muted tabular-nums">{valid ? `${fmt(Math.round(kcal), 0)} kcal` : " "}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </>
        }
      />

      <ToolSection
        title="Calories for every goal"
        description={
          valid ? `Based on your TDEE of ${fmt(Math.round(tdee), 0)} kcal a day` : "Enter your details to see each goal"
        }
      >
        <Table label="Daily calories for each weight goal">
          <thead>
            <tr>
              <th>Goal</th>
              <th className="num">kcal a day</th>
              <th className="num hidden sm:table-cell">vs TDEE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isSelected = r.id === goal;
              return (
                <tr key={r.id} className={cn(isSelected && "bg-accent-soft/60")} aria-current={isSelected ? "true" : undefined}>
                  <td>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={cn(isSelected && "font-medium text-foreground")}>{goalLabel(r.kgPerWeek, units)}</span>
                      {isSelected && <Badge tone="accent">Your goal</Badge>}
                      {valid && r.low && <Badge tone="warning">Below {fmt(minimum, 0)}</Badge>}
                    </span>
                  </td>
                  <td className="num">
                    <span className="block font-medium text-foreground">{valid ? fmt(Math.round(r.kcal), 0) : "—"}</span>
                    {valid && <span className="block text-xs text-muted sm:hidden">{signed(Math.round(r.delta))} vs TDEE</span>}
                  </td>
                  <td className="num hidden text-muted sm:table-cell">{valid ? signed(Math.round(r.delta)) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <p className="mt-3 flex gap-2 text-[13px] text-muted">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Estimates for healthy adults, not medical advice. Talk to a doctor or registered dietitian before a big change in diet.
        </p>
      </ToolSection>
    </div>
  );
}
