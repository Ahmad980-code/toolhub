"use client";

import { useState } from "react";
import { Button, CopyButton } from "@/components/ui";

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
};
const AMBIGUOUS = /[O0Il1|]/g;

type Options = Record<keyof typeof SETS, boolean> & { length: number; noAmbiguous: boolean };

/** Unbiased random integer in [0, max) using the browser's CSPRNG. */
function randomInt(max: number) {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

function pools(o: Options) {
  return (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((k) => o[k])
    .map((k) => (o.noAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]));
}

function generate(o: Options) {
  const sets = pools(o);
  if (!sets.length) return "";
  const all = sets.join("");
  // Guarantee at least one character from every selected set, then shuffle.
  const chars = sets.map((s) => s[randomInt(s.length)]);
  while (chars.length < o.length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, o.length).join("");
}

function strength(o: Options) {
  const size = pools(o).join("").length;
  const bits = size ? o.length * Math.log2(size) : 0;
  if (bits < 40) return { label: "Weak", width: "25%", color: "bg-red-500" };
  if (bits < 64) return { label: "Fair", width: "50%", color: "bg-amber-500" };
  if (bits < 100) return { label: "Strong", width: "75%", color: "bg-emerald-500" };
  return { label: "Very strong", width: "100%", color: "bg-emerald-600" };
}

const labels: Record<keyof typeof SETS, string> = {
  upper: "Uppercase (A–Z)",
  lower: "Lowercase (a–z)",
  numbers: "Numbers (0–9)",
  symbols: "Symbols (!@#…)",
};

export default function PasswordGenerator() {
  const [options, setOptions] = useState<Options>({
    length: 16,
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
    noAmbiguous: false,
  });
  const [password, setPassword] = useState("");

  function update(patch: Partial<Options>) {
    const next = { ...options, ...patch };
    setOptions(next);
    if (password) setPassword(generate(next));
  }

  const s = strength(options);
  const nothingSelected = !pools(options).length;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <output
          className="min-h-12 flex-1 break-all rounded-lg border border-border bg-background px-4 py-3 font-mono text-lg"
          aria-live="polite"
        >
          {password || <span className="text-base text-muted">Click “Generate” to create a password</span>}
        </output>
        <div className="flex gap-2">
          <Button active disabled={nothingSelected} onClick={() => setPassword(generate(options))}>
            Generate
          </Button>
          <CopyButton text={password} />
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-muted">Strength</span>
          <span className="font-medium">{s.label}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div className={`h-full ${s.color} transition-all`} style={{ width: s.width }} />
        </div>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="flex justify-between">
          <span className="text-muted">Length</span>
          <span className="font-semibold">{options.length}</span>
        </span>
        <input
          type="range"
          min={6}
          max={64}
          value={options.length}
          onChange={(e) => update({ length: Number(e.target.value) })}
          className="accent-accent"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(labels) as (keyof typeof SETS)[]).map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={options[k]}
              onChange={(e) => update({ [k]: e.target.checked })}
            />
            {labels[k]}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-accent"
            checked={options.noAmbiguous}
            onChange={(e) => update({ noAmbiguous: e.target.checked })}
          />
          Avoid look-alikes (O, 0, I, l, 1)
        </label>
      </div>
    </div>
  );
}
