"use client";

import { useState } from "react";
import {
  Field,
  Input,
  ResultCard,
  SegmentedControl,
  Select,
  Stat,
  Switch,
  ToolLayout,
} from "@/components/ui";
import {
  amountToWords,
  applyCase,
  parseAmount,
  type NumberSystem,
  type WordsCase,
  type WordsCurrency,
} from "./shared-money/number-words";

const OTHER: Record<NumberSystem, NumberSystem> = { "south-asian": "international", international: "south-asian" };
const SYSTEM_LABEL: Record<NumberSystem, string> = {
  "south-asian": "Lakh / crore",
  international: "Million / billion",
};

export default function AmountInWords() {
  const [raw, setRaw] = useState("125000");
  const [system, setSystem] = useState<NumberSystem>("south-asian");
  const [currency, setCurrency] = useState<WordsCurrency>("PKR");
  const [only, setOnly] = useState(true);
  const [style, setStyle] = useState<WordsCase>("title");

  const parsed = parseAmount(raw);
  const result = parsed.ok ? amountToWords(parsed.intDigits, parsed.fracDigits, { system, currency, only }) : null;
  const alt = parsed.ok ? amountToWords(parsed.intDigits, parsed.fracDigits, { system: OTHER[system], currency, only }) : null;
  const words = result ? applyCase(result.words, style) : "";
  const altWords = alt ? applyCase(alt.words, style) : "";
  const error = !parsed.ok && parsed.error ? parsed.error : undefined;

  return (
    <ToolLayout
      inputs={
        <>
          <Field label="Amount" hint="Commas and a decimal point are fine, e.g. 1,25,000.50" error={error}>
            <Input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              inputMode="decimal"
              placeholder="125000"
              invalid={!!error}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Field label="Number system" as="group">
            <SegmentedControl
              label="Number system"
              value={system}
              onChange={setSystem}
              fullWidth
              options={[
                { value: "south-asian", label: "Lakh / crore" },
                { value: "international", label: "Million" },
              ]}
            />
          </Field>
          <Field label="Currency">
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as WordsCurrency)}>
              <option value="PKR">Pakistani Rupees (Rupees, Paisa)</option>
              <option value="INR">Indian Rupees (Rupees, Paise)</option>
              <option value="USD">US Dollars (Dollars, Cents)</option>
              <option value="none">No currency (plain number)</option>
            </Select>
          </Field>
          <Field label="Letter case" as="group">
            <SegmentedControl
              label="Letter case"
              value={style}
              onChange={setStyle}
              fullWidth
              options={[
                { value: "title", label: "Title Case" },
                { value: "sentence", label: "Sentence" },
                { value: "upper", label: "UPPER" },
              ]}
            />
          </Field>
          <Switch
            checked={only}
            onChange={setOnly}
            label='Add "Only" at the end'
            description="Cheque style, so nothing can be added after the amount"
          />
        </>
      }
      results={
        <>
          <ResultCard
            label="Amount in words"
            size="md"
            value={words}
            caption={result ? `${currency === "none" ? "" : `${currency} `}${result.figures}` : undefined}
            copyText={words}
            placeholder="Enter an amount"
          />
          <div className="grid grid-cols-1 gap-3">
            <Stat
              label={`In the ${SYSTEM_LABEL[OTHER[system]].toLowerCase()} system`}
              value={<span className="text-base leading-6 font-medium">{altWords || "—"}</span>}
              hint={alt ? alt.figures : undefined}
            />
            {result?.rounded && (
              <p className="text-sm text-muted">Rounded to two decimal places ({currency === "USD" ? "cents" : "paisa"}).</p>
            )}
          </div>
        </>
      }
    />
  );
}
