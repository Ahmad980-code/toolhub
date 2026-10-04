"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button, Input, cn } from "@/components/ui";

/**
 * Integer stepper: [-] [value] [+]. Typing is allowed; the value is clamped to [min, max] when the
 * field loses focus. Wrap it in <Field as="group" label="…">.
 */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 100,
  label,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Accessible name of the number field, e.g. "Number of people". */
  label: string;
  className?: string;
}) {
  // Text being typed (null while not editing) so the field can be briefly empty.
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));

  function commit(text: string) {
    const n = Number(text);
    if (text.trim() !== "" && Number.isFinite(n)) onChange(clamp(n));
    setDraft(null);
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="secondary"
        size="icon"
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus aria-hidden />
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={max}
        step={1}
        value={draft ?? String(value)}
        className="min-w-0 flex-1 text-center"
        onChange={(e) => {
          const text = e.target.value;
          setDraft(text);
          const n = Number(text);
          if (text.trim() !== "" && Number.isFinite(n) && n >= min && n <= max) onChange(Math.round(n));
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.currentTarget.value);
        }}
      />
      <Button
        variant="secondary"
        size="icon"
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus aria-hidden />
      </Button>
    </div>
  );
}
