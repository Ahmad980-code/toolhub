"use client";

import { ArrowLeftRight, CircleAlert, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Button,
  Callout,
  Field,
  NumberInput,
  ResultCard,
  Select,
  Stat,
  Table,
  ToolLayout,
  ToolSection,
  cn,
  fmt,
  focusRing,
  num,
} from "@/components/ui";

const CURRENCIES: [code: string, name: string][] = [
  ["USD", "US Dollar"],
  ["PKR", "Pakistani Rupee"],
  ["EUR", "Euro"],
  ["GBP", "British Pound"],
  ["SAR", "Saudi Riyal"],
  ["AED", "UAE Dirham"],
  ["INR", "Indian Rupee"],
  ["QAR", "Qatari Riyal"],
  ["KWD", "Kuwaiti Dinar"],
  ["OMR", "Omani Rial"],
  ["BHD", "Bahraini Dinar"],
  ["CAD", "Canadian Dollar"],
  ["AUD", "Australian Dollar"],
  ["NZD", "New Zealand Dollar"],
  ["CNY", "Chinese Yuan"],
  ["JPY", "Japanese Yen"],
  ["KRW", "South Korean Won"],
  ["MYR", "Malaysian Ringgit"],
  ["SGD", "Singapore Dollar"],
  ["HKD", "Hong Kong Dollar"],
  ["THB", "Thai Baht"],
  ["IDR", "Indonesian Rupiah"],
  ["PHP", "Philippine Peso"],
  ["BDT", "Bangladeshi Taka"],
  ["LKR", "Sri Lankan Rupee"],
  ["NPR", "Nepalese Rupee"],
  ["AFN", "Afghan Afghani"],
  ["TRY", "Turkish Lira"],
  ["EGP", "Egyptian Pound"],
  ["ZAR", "South African Rand"],
  ["NGN", "Nigerian Naira"],
  ["KES", "Kenyan Shilling"],
  ["CHF", "Swiss Franc"],
  ["SEK", "Swedish Krona"],
  ["NOK", "Norwegian Krone"],
  ["DKK", "Danish Krone"],
  ["RUB", "Russian Ruble"],
  ["BRL", "Brazilian Real"],
  ["MXN", "Mexican Peso"],
];
const NAMES = Object.fromEntries(CURRENCIES);
const PAIRS: [string, string][] = [
  ["USD", "PKR"],
  ["SAR", "PKR"],
  ["AED", "PKR"],
  ["GBP", "PKR"],
  ["EUR", "PKR"],
  ["USD", "INR"],
  ["EUR", "USD"],
];
const POPULAR = ["USD", "PKR", "EUR", "GBP", "SAR", "AED", "INR", "CNY", "CAD"];
const API = "https://open.er-api.com/v6/latest/USD";
const CACHE_KEY = "toolhub:fx:usd";

type Rates = { rates: Record<string, number>; updated: string; fetchedAt: number };

async function loadRates(force: boolean): Promise<Rates> {
  if (!force) {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as Rates;
        if (Date.now() - data.fetchedAt < 60 * 60 * 1000) return data;
      }
    } catch {
      // Storage unavailable: just fetch.
    }
  }
  const res = await fetch(API);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.result !== "success" || !json.rates) throw new Error("Bad response");
  const data: Rates = { rates: json.rates, updated: json.time_last_update_utc ?? "", fetchedAt: Date.now() };
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore.
  }
  return data;
}

/** More decimals for small numbers so tiny rates stay readable. */
function fmtAmount(n: number) {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  return fmt(n, a >= 100 ? 2 : a >= 1 ? 4 : 6);
}

/** "Sat, 04 Oct 2026 00:02:31 +0000" -> "4 Oct 2026, 00:02 UTC" (deterministic, no locale). */
function updatedLabel(s: string) {
  const m = /(\d{1,2}) (\w{3}) (\d{4}) (\d{2}):(\d{2})/.exec(s);
  return m ? `${Number(m[1])} ${m[2]} ${m[3]}, ${m[4]}:${m[5]} UTC` : s;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PKR");
  const [data, setData] = useState<Rates | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadRates(reload > 0)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reload]);

  const a = num(amount);
  const amountError = amount.trim() !== "" && !(a >= 0) ? "Enter 0 or more" : undefined;
  const rate = data && data.rates[from] && data.rates[to] ? data.rates[to] / data.rates[from] : NaN;
  const converted = a * rate;
  const ready = Number.isFinite(rate) && a >= 0;

  const select = (value: string, onChange: (v: string) => void, label: string) => (
    <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {CURRENCIES.map(([code, name]) => (
        <option key={code} value={code}>
          {code} · {name}
        </option>
      ))}
    </Select>
  );

  return (
    <div className="grid gap-8">
      <ToolLayout
        inputs={
          <>
            <Field label="Amount" error={amountError}>
              <NumberInput value={amount} onChange={setAmount} min={0} step="0.01" suffix={from} invalid={!!amountError} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <Field label="From">{select(from, setFrom, "From currency")}</Field>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Swap currencies"
                className="justify-self-center"
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                }}
              >
                <ArrowLeftRight />
              </Button>
              <Field label="To">{select(to, setTo, "To currency")}</Field>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium text-muted">Popular pairs</p>
              <div className="flex flex-wrap gap-2">
                {PAIRS.map(([f, t]) => {
                  const on = f === from && t === to;
                  return (
                    <button
                      key={`${f}${t}`}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setFrom(f);
                        setTo(t);
                      }}
                      className={cn(
                        "min-h-9 rounded-full border px-3 text-sm font-medium transition-colors",
                        focusRing,
                        on
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border bg-card text-muted hover:border-border-hover hover:text-foreground",
                      )}
                    >
                      {f} → {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        }
        results={
          <>
            {error && !data ? (
              <Callout
                tone="danger"
                icon={<CircleAlert />}
                title="Couldn't load exchange rates"
              >
                <p>Check your internet connection and try again.</p>
                <Button size="sm" className="mt-3" onClick={() => setReload((r) => r + 1)}>
                  <RefreshCw /> Try again
                </Button>
              </Callout>
            ) : (
              <ResultCard
                label={`${fmtAmount(a)} ${from} =`}
                value={ready ? `${fmtAmount(converted)} ${to}` : ""}
                caption={ready ? NAMES[to] : undefined}
                copyText={ready ? fmtAmount(converted) : ""}
                placeholder={loading ? "Loading live rates…" : "Enter an amount"}
              />
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Exchange rate" value={ready ? `1 ${from} = ${fmtAmount(rate)} ${to}` : "—"} />
              <Stat label="Inverse rate" value={ready ? `1 ${to} = ${fmtAmount(1 / rate)} ${from}` : "—"} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
              <span>{data ? `Updated ${updatedLabel(data.updated)}` : loading ? "Fetching rates…" : ""}</span>
              <a
                href="https://www.exchangerate-api.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn("inline-flex items-center gap-1 rounded-sm underline-offset-2 hover:text-foreground hover:underline", focusRing)}
              >
                Rates by Exchange Rate API <ExternalLink aria-hidden className="size-3.5" />
              </a>
            </div>
          </>
        }
      />

      <ToolSection
        title={`${fmtAmount(a)} ${from} in other currencies`}
        description="Mid-market rates for reference. Banks and exchange companies add their own margin."
        actions={
          <Button size="sm" variant="ghost" onClick={() => setReload((r) => r + 1)} disabled={loading && !data}>
            <RefreshCw /> Refresh
          </Button>
        }
      >
        <Table label="Conversions">
          <thead>
            <tr>
              <th>Currency</th>
              <th className="num">Amount</th>
              <th className="num">Rate</th>
            </tr>
          </thead>
          <tbody>
            {POPULAR.filter((c) => c !== from).map((code) => {
              const r = data && data.rates[from] && data.rates[code] ? data.rates[code] / data.rates[from] : NaN;
              return (
                <tr key={code}>
                  <td>
                    <span className="font-medium">{code}</span> <span className="text-muted">· {NAMES[code]}</span>
                  </td>
                  <td className="num">{Number.isFinite(r) && a >= 0 ? fmtAmount(a * r) : "—"}</td>
                  <td className="num">{Number.isFinite(r) ? fmtAmount(r) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ToolSection>
    </div>
  );
}
