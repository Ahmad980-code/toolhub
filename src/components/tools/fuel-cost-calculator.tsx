"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import {
  Callout,
  Field,
  NumberInput,
  ResultCard,
  SegmentedControl,
  Stat,
  Switch,
  ToolLayout,
  fmt,
  money,
  num,
} from "@/components/ui";
import { Stepper } from "./shared-calc/stepper";

const KM_PER_MILE = 1.609344;
const LITRES_PER_GALLON = 3.785411784; // US gallon

type DistanceUnit = "km" | "mi";
type Efficiency = "kmpl" | "l100" | "mpg";

export default function FuelCostCalculator() {
  const [distance, setDistance] = useState("120");
  const [unit, setUnit] = useState<DistanceUnit>("km");
  const [effType, setEffType] = useState<Efficiency>("kmpl");
  const [efficiency, setEfficiency] = useState("14");
  const [price, setPrice] = useState("265");
  const [roundTrip, setRoundTrip] = useState(false);
  const [people, setPeople] = useState(1);

  const dist = num(distance);
  const eff = num(efficiency);
  const pr = num(price);
  const distError = distance.trim() !== "" && !(dist > 0) ? "Enter a distance above 0" : undefined;
  const effError = efficiency.trim() !== "" && !(eff > 0) ? "Enter a value above 0" : undefined;
  const priceError = price.trim() !== "" && !(pr >= 0) ? "Enter 0 or more" : undefined;
  const valid = dist > 0 && eff > 0 && pr >= 0;

  const oneWayKm = unit === "km" ? dist : dist * KM_PER_MILE;
  const km = oneWayKm * (roundTrip ? 2 : 1);
  let litres = NaN;
  if (effType === "kmpl") litres = km / eff;
  else if (effType === "l100") litres = (km * eff) / 100;
  else litres = (km / KM_PER_MILE / eff) * LITRES_PER_GALLON;

  const gallons = litres / LITRES_PER_GALLON;
  const cost = effType === "mpg" ? gallons * pr : litres * pr;
  const perDistance = cost / (unit === "km" ? km : km / KM_PER_MILE);
  const tripDistance = unit === "km" ? km : km / KM_PER_MILE;

  // Switching efficiency types converts the typed value so the result stays the same.
  function switchEff(next: Efficiency) {
    if (next === effType) return;
    if (eff > 0) {
      const kmpl = effType === "kmpl" ? eff : effType === "l100" ? 100 / eff : (eff * KM_PER_MILE) / LITRES_PER_GALLON;
      const value = next === "kmpl" ? kmpl : next === "l100" ? 100 / kmpl : (kmpl * LITRES_PER_GALLON) / KM_PER_MILE;
      setEfficiency(String(Math.round(value * 100) / 100));
    }
    if (pr > 0 && (next === "mpg") !== (effType === "mpg")) {
      const converted = next === "mpg" ? pr * LITRES_PER_GALLON : pr / LITRES_PER_GALLON;
      setPrice(String(Math.round(converted * 100) / 100));
    }
    setEffType(next);
  }

  function switchUnit(next: DistanceUnit) {
    if (next === unit) return;
    if (dist > 0) setDistance(String(Math.round((next === "mi" ? dist / KM_PER_MILE : dist * KM_PER_MILE) * 10) / 10));
    setUnit(next);
  }

  return (
    <ToolLayout
      inputs={
        <>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label={roundTrip ? "One-way distance" : "Distance"} error={distError}>
              <NumberInput value={distance} onChange={setDistance} min={0} suffix={unit} placeholder="120" invalid={!!distError} />
            </Field>
            <SegmentedControl
              label="Distance unit"
              value={unit}
              onChange={switchUnit}
              options={[
                { value: "km", label: "km" },
                { value: "mi", label: "miles" },
              ]}
            />
          </div>
          <Field label="Fuel economy measured in" as="group">
            <SegmentedControl
              label="Fuel economy unit"
              value={effType}
              onChange={switchEff}
              fullWidth
              options={[
                { value: "kmpl", label: "km/L" },
                { value: "l100", label: "L/100 km" },
                { value: "mpg", label: "MPG (US)" },
              ]}
            />
          </Field>
          <Field
            label="Your car's fuel economy"
            hint={effType === "kmpl" ? "Typical small cars do 12–18 km per litre" : undefined}
            error={effError}
          >
            <NumberInput
              value={efficiency}
              onChange={setEfficiency}
              min={0}
              step="0.1"
              suffix={effType === "kmpl" ? "km/L" : effType === "l100" ? "L/100 km" : "mpg"}
              invalid={!!effError}
            />
          </Field>
          <Field label={effType === "mpg" ? "Fuel price per gallon" : "Fuel price per litre"} hint="Example price; enter today's rate" error={priceError}>
            <NumberInput value={price} onChange={setPrice} min={0} step="0.01" prefix="Rs" invalid={!!priceError} />
          </Field>
          <Switch checked={roundTrip} onChange={setRoundTrip} label="Round trip" description="Double the distance for the way back" />
          <Field label="Split the cost between" as="group" aside={people === 1 ? "1 person" : `${people} people`}>
            <Stepper value={people} onChange={setPeople} min={1} max={50} label="Number of people" />
          </Field>
        </>
      }
      results={
        <>
          <ResultCard
            label="Fuel cost"
            value={valid ? money(cost) : ""}
            caption={valid ? `${fmt(tripDistance, 1)} ${unit} ${roundTrip ? "round trip" : "trip"}` : undefined}
            copyText={valid ? money(cost) : ""}
            placeholder="Enter distance, fuel economy and price"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat
              label="Fuel needed"
              value={valid ? (effType === "mpg" ? `${fmt(gallons, 2)} gal` : `${fmt(litres, 2)} L`) : "—"}
              hint={valid ? (effType === "mpg" ? `${fmt(litres, 2)} litres` : `${fmt(gallons, 2)} US gallons`) : undefined}
            />
            <Stat label={`Cost per ${unit === "km" ? "km" : "mile"}`} value={valid ? money(perDistance) : "—"} />
            {people > 1 && <Stat label="Each person pays" value={valid ? money(cost / people) : "—"} tone="accent" />}
          </div>
          <Callout tone="neutral" icon={<Info />}>
            Real fuel use depends on traffic, speed, air conditioning and load, so allow a little extra.
          </Callout>
        </>
      }
    />
  );
}
