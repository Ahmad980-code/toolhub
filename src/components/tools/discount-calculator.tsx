"use client";

import { useState } from "react";
import {
  Button,
  Field,
  NumberInput,
  ResultCard,
  SegmentedControl,
  Stat,
  ToolLayout,
  fmt,
  money,
  num,
} from "@/components/ui";
import { Stepper } from "./shared-calc/stepper";

export default function DiscountCalculator() {
  const [price, setPrice] = useState("2500");
  const [type, setType] = useState<"percent" | "amount">("percent");
  const [discount, setDiscount] = useState("20");
  const [extra, setExtra] = useState("");
  const [tax, setTax] = useState("0");
  const [qty, setQty] = useState(1);

  const p = num(price);
  const d = discount.trim() === "" ? 0 : num(discount);
  const e = extra.trim() === "" ? 0 : num(extra);
  const t = tax.trim() === "" ? 0 : num(tax);

  const priceError = price.trim() !== "" && !(p > 0) ? "Enter a price above 0" : undefined;
  let discountError: string | undefined;
  if (!(d >= 0)) discountError = "Enter 0 or more";
  else if (type === "percent" && d > 100) discountError = "A discount can't be more than 100%";
  else if (type === "amount" && p > 0 && d > p) discountError = "The discount is bigger than the price";
  const extraError = !(e >= 0) || e > 100 ? "Enter 0–100%" : undefined;
  const taxError = !(t >= 0) ? "Enter 0 or more" : undefined;
  const valid = p > 0 && !discountError && !extraError && !taxError;

  const afterFirst = type === "percent" ? p * (1 - d / 100) : p - d;
  const salePrice = afterFirst * (1 - e / 100);
  const taxEach = (salePrice * t) / 100;
  const finalEach = salePrice + taxEach;
  const total = finalEach * qty;
  const saved = (p - salePrice) * qty;
  const effective = p > 0 ? (1 - salePrice / p) * 100 : 0;

  return (
    <ToolLayout
      inputs={
        <>
          <Field label="Original price" error={priceError}>
            <NumberInput value={price} onChange={setPrice} min={0} step="0.01" prefix="Rs" placeholder="2500" invalid={!!priceError} />
          </Field>
          <Field label="Discount type" as="group">
            <SegmentedControl
              label="Discount type"
              value={type}
              onChange={setType}
              fullWidth
              options={[
                { value: "percent", label: "Percent off" },
                { value: "amount", label: "Amount off" },
              ]}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Discount" error={discountError}>
              {type === "percent" ? (
                <NumberInput value={discount} onChange={setDiscount} min={0} max={100} suffix="%" placeholder="20" invalid={!!discountError} />
              ) : (
                <NumberInput value={discount} onChange={setDiscount} min={0} prefix="Rs" placeholder="500" invalid={!!discountError} />
              )}
            </Field>
            <Field label="Extra discount" hint='e.g. "extra 10% off"' error={extraError}>
              <NumberInput value={extra} onChange={setExtra} min={0} max={100} suffix="%" placeholder="0" invalid={!!extraError} />
            </Field>
          </div>
          <Field
            label="Sales tax / GST"
            error={taxError}
            aside={
              <Button size="sm" variant="ghost" onClick={() => setTax(num(tax) === 18 ? "0" : "18")}>
                {num(tax) === 18 ? "Remove GST" : "Add GST 18%"}
              </Button>
            }
          >
            <NumberInput value={tax} onChange={setTax} min={0} step="0.5" suffix="%" placeholder="0" invalid={!!taxError} />
          </Field>
          <Field label="Quantity" as="group">
            <Stepper value={qty} onChange={setQty} min={1} max={999} label="Quantity" />
          </Field>
        </>
      }
      results={
        <>
          <ResultCard
            label={qty > 1 ? `You pay for ${qty} items` : "You pay"}
            value={valid ? money(total) : ""}
            caption={valid ? (t > 0 ? `including ${fmt(t, 2)}% tax of ${money(taxEach * qty)}` : "after discount") : undefined}
            copyText={valid ? money(total) : ""}
            placeholder="Enter the price and discount"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat label="You save" value={valid ? money(saved) : "—"} hint={valid ? `${fmt(effective, 2)}% off in total` : undefined} tone="success" />
            <Stat label="Sale price per item" value={valid ? money(salePrice) : "—"} hint="before tax" />
            <Stat label="Original total" value={valid ? money(p * qty) : "—"} />
            <Stat label="Tax" value={valid ? money(taxEach * qty) : "—"} hint={t > 0 ? `${fmt(t, 2)}% of the sale price` : "no tax added"} />
          </div>
        </>
      }
    />
  );
}
