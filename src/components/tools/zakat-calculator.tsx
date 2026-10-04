"use client";

import { Info } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Badge,
  Callout,
  Field,
  NumberInput,
  ResultCard,
  SegmentedControl,
  Stat,
  ToolLayout,
  fmt,
  num,
} from "@/components/ui";

const TOLA_G = 11.664;
const NISAB_G = { silver: 612.36, gold: 87.48 } as const;
const NISAB_TOLA = { silver: 52.5, gold: 7.5 } as const;
const RATE = 0.025;

type Unit = "tola" | "gram";
type Basis = "silver" | "gold";

const rs = (n: number) => (Number.isFinite(n) ? `Rs ${fmt(Math.round(n), 0)}` : "—");
/** Empty counts as 0; negative or non-numeric input is invalid (NaN). */
const amount = (v: string) => (v.trim() === "" ? 0 : num(v) >= 0 ? num(v) : NaN);
const round = (n: number, digits: number) => String(Math.round(n * 10 ** digits) / 10 ** digits);

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-3 text-[13px] font-semibold tracking-wide text-muted uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function ZakatCalculator() {
  const [unit, setUnit] = useState<Unit>("tola");
  const [basis, setBasis] = useState<Basis>("silver");
  const [cash, setCash] = useState("300000");
  const [bank, setBank] = useState("500000");
  const [goldQty, setGoldQty] = useState("2");
  const [goldPrice, setGoldPrice] = useState("350000");
  const [silverQty, setSilverQty] = useState("0");
  const [silverPrice, setSilverPrice] = useState("4000");
  const [inventory, setInventory] = useState("");
  const [receivables, setReceivables] = useState("");
  const [investments, setInvestments] = useState("");
  const [debts, setDebts] = useState("50000");

  // Switching units converts what's typed so the totals don't change.
  function switchUnit(next: Unit) {
    if (next === unit) return;
    const toGram = next === "gram";
    const qty = (v: string) => (num(v) > 0 ? round(toGram ? num(v) * TOLA_G : num(v) / TOLA_G, 3) : v);
    const price = (v: string) => (num(v) > 0 ? round(toGram ? num(v) / TOLA_G : num(v) * TOLA_G, 2) : v);
    setGoldQty(qty(goldQty));
    setSilverQty(qty(silverQty));
    setGoldPrice(price(goldPrice));
    setSilverPrice(price(silverPrice));
    setUnit(next);
  }

  const values = [
    amount(cash),
    amount(bank),
    amount(goldQty) * amount(goldPrice),
    amount(silverQty) * amount(silverPrice),
    amount(inventory),
    amount(receivables),
    amount(investments),
  ];
  const assets = values.reduce((a, b) => a + b, 0);
  const deductions = amount(debts);
  const net = assets - deductions;

  const basisPrice = amount(basis === "silver" ? silverPrice : goldPrice);
  const pricePerGram = unit === "tola" ? basisPrice / TOLA_G : basisPrice;
  const nisab = basisPrice > 0 ? NISAB_G[basis] * pricePerGram : NaN;

  const invalid = !Number.isFinite(net);
  const due = !invalid && Number.isFinite(nisab) && net >= nisab && net > 0;
  const zakat = due ? net * RATE : 0;

  const unitLabel = unit === "tola" ? "tola" : "g";
  const err = (v: string) => (v.trim() !== "" && !(num(v) >= 0) ? "Enter 0 or more" : undefined);
  const rupees = (label: string, value: string, set: (v: string) => void, hint?: string) => (
    <Field label={label} hint={hint} error={err(value)}>
      <NumberInput value={value} onChange={set} min={0} prefix="Rs" inputMode="numeric" placeholder="0" invalid={!!err(value)} />
    </Field>
  );

  let caption: ReactNode;
  if (invalid) caption = "Check the highlighted fields";
  else if (!Number.isFinite(nisab)) caption = `Enter the ${basis} price to work out the nisab`;
  else if (due) caption = `2.5% of your net zakatable wealth of ${rs(net)}`;
  else caption = `Your net wealth is below the nisab of ${rs(nisab)}, so no zakat is due`;

  return (
    <ToolLayout
      inputs={
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Weigh gold & silver in" as="group">
              <SegmentedControl
                label="Weight unit"
                value={unit}
                onChange={switchUnit}
                fullWidth
                options={[
                  { value: "tola", label: "Tola" },
                  { value: "gram", label: "Grams" },
                ]}
              />
            </Field>
            <Field label="Nisab based on" as="group">
              <SegmentedControl
                label="Nisab basis"
                value={basis}
                onChange={setBasis}
                fullWidth
                options={[
                  { value: "silver", label: "Silver" },
                  { value: "gold", label: "Gold" },
                ]}
              />
            </Field>
          </div>

          <Group title="Cash & savings">
            <div className="grid gap-3 sm:grid-cols-2">
              {rupees("Cash in hand", cash, setCash)}
              {rupees("Bank balances", bank, setBank, "Savings, current accounts, wallets")}
            </div>
          </Group>

          <Group title="Gold & silver">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Gold you own" error={err(goldQty)}>
                <NumberInput value={goldQty} onChange={setGoldQty} min={0} suffix={unitLabel} placeholder="0" invalid={!!err(goldQty)} />
              </Field>
              <Field label={`Gold price per ${unit}`} error={err(goldPrice)}>
                <NumberInput value={goldPrice} onChange={setGoldPrice} min={0} prefix="Rs" placeholder="0" invalid={!!err(goldPrice)} />
              </Field>
              <Field label="Silver you own" error={err(silverQty)}>
                <NumberInput value={silverQty} onChange={setSilverQty} min={0} suffix={unitLabel} placeholder="0" invalid={!!err(silverQty)} />
              </Field>
              <Field label={`Silver price per ${unit}`} error={err(silverPrice)}>
                <NumberInput value={silverPrice} onChange={setSilverPrice} min={0} prefix="Rs" placeholder="0" invalid={!!err(silverPrice)} />
              </Field>
            </div>
            <Callout tone="accent" icon={<Info />}>
              The prices shown are examples. Replace them with today&apos;s gold and silver rates in your city.
            </Callout>
          </Group>

          <Group title="Business & other assets">
            <div className="grid gap-3 sm:grid-cols-2">
              {rupees("Business stock", inventory, setInventory, "Goods held for sale, at sale value")}
              {rupees("Money owed to you", receivables, setReceivables, "Loans you expect to get back")}
              {rupees("Shares & investments", investments, setInvestments, "Market value of tradable holdings")}
            </div>
          </Group>

          <Group title="Deductions">
            {rupees("Debts & bills due now", debts, setDebts, "Payments due immediately, e.g. rent, bills, instalments")}
          </Group>
        </>
      }
      results={
        <>
          <ResultCard
            label="Zakat payable"
            value={invalid || !Number.isFinite(nisab) ? "" : rs(zakat)}
            caption={caption}
            tone={due || invalid || !Number.isFinite(nisab) ? "accent" : "success"}
            copyText={due ? rs(zakat) : ""}
            placeholder="Enter your assets"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat label="Net zakatable wealth" value={invalid ? "—" : rs(net)} hint="assets minus deductions" />
            <Stat
              label="Nisab threshold"
              value={rs(nisab)}
              hint={`${NISAB_TOLA[basis]} tola (${NISAB_G[basis]} g) of ${basis}`}
            />
            <Stat label="Total assets" value={invalid ? "—" : rs(assets)} />
            <Stat label="Deductions" value={rs(deductions)} />
          </div>
          {!invalid && Number.isFinite(nisab) && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              Status:
              {due ? <Badge tone="accent">Zakat is due</Badge> : <Badge tone="success">Below nisab</Badge>}
            </div>
          )}
        </>
      }
    />
  );
}
