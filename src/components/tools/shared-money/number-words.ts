/**
 * Number-to-words engine for the Amount in Words tool (pure, no React, safe on server and client).
 * Works on digit strings and BigInt so very large amounts never lose precision.
 */

export type NumberSystem = "south-asian" | "international";
export type WordsCurrency = "PKR" | "INR" | "USD" | "none";
export type WordsCase = "title" | "sentence" | "upper";

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** Largest whole-number part supported (15 digits): 999 trillion / 99 neel. */
export const MAX_DIGITS = 15;

/** 0–99 in words ("Twenty-Five"). */
function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  return n % 10 ? `${t}-${ONES[n % 10]}` : t;
}

/** 1–999 in words, without "and" ("One Hundred Twenty-Five"). Returns "" for 0. */
function threeDigits(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ONES[h]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

export type PlaceGroup = { name: string; value: number };

/**
 * Splits a non-negative integer string into named place-value groups, most significant first.
 * South Asian: hundreds (3 digits), then thousand, lakh, crore, arab, kharab, neel (2 digits each).
 * International: groups of 3 digits: (units), thousand, million, billion, trillion.
 */
export function placeGroups(intDigits: string, system: NumberSystem): PlaceGroup[] {
  const digits = intDigits.replace(/^0+(?=\d)/, "");
  const groups: PlaceGroup[] = [];
  if (system === "international") {
    const names = ["", "Thousand", "Million", "Billion", "Trillion"];
    let rest = digits;
    let i = 0;
    while (rest.length > 0) {
      const chunk = rest.slice(-3);
      rest = rest.slice(0, -3);
      groups.unshift({ name: names[i] ?? "", value: Number(chunk) });
      i++;
    }
  } else {
    const names = ["Thousand", "Lakh", "Crore", "Arab", "Kharab", "Neel"];
    const last3 = digits.slice(-3);
    let rest = digits.slice(0, -3);
    groups.unshift({ name: "", value: Number(last3) });
    let i = 0;
    while (rest.length > 0) {
      const chunk = rest.slice(-2);
      rest = rest.slice(0, -2);
      groups.unshift({ name: names[i] ?? "", value: Number(chunk) });
      i++;
    }
  }
  return groups;
}

/** Whole number (digit string) in words, Title Case. "0" -> "Zero". */
export function integerToWords(intDigits: string, system: NumberSystem): string {
  const groups = placeGroups(intDigits, system);
  const parts = groups
    .filter((g) => g.value > 0)
    .map((g) => {
      const w = threeDigits(g.value);
      return g.name ? `${w} ${g.name}` : w;
    });
  return parts.length ? parts.join(" ") : "Zero";
}

/** Groups digits with commas: South Asian 12,34,56,789 or international 123,456,789. */
export function groupDigits(intDigits: string, system: NumberSystem): string {
  const digits = intDigits.replace(/^0+(?=\d)/, "");
  if (system === "international") return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

export type ParsedAmount =
  | { ok: true; intDigits: string; fracDigits: string }
  | { ok: false; error: string };

/** Parses user input such as "1,25,000.50" or "125 000". Empty input -> error "". */
export function parseAmount(raw: string): ParsedAmount {
  const s = raw.trim();
  if (s === "") return { ok: false, error: "" };
  if (/^-/.test(s)) return { ok: false, error: "Enter a positive amount (no minus sign)." };
  const cleaned = s.replace(/[,\s _]/g, "");
  if (!/^\d*\.?\d*$/.test(cleaned) || !/\d/.test(cleaned)) {
    return { ok: false, error: "Use digits only. Commas and one decimal point are fine." };
  }
  const [intRaw, fracRaw = ""] = cleaned.split(".");
  const intDigits = (intRaw || "0").replace(/^0+(?=\d)/, "");
  if (intDigits.length > MAX_DIGITS) {
    return { ok: false, error: "That's too large. Amounts up to 15 digits (999 trillion, or 99 neel) are supported." };
  }
  return { ok: true, intDigits, fracDigits: fracRaw };
}

/** Rounds a parsed amount to whole cents/paisa (half up) without floating point. */
export function toMinorUnits(intDigits: string, fracDigits: string): { major: string; minor: number; rounded: boolean } {
  const two = (fracDigits + "00").slice(0, 2);
  const roundUp = fracDigits.length > 2 && Number(fracDigits[2]) >= 5;
  let total = BigInt(intDigits) * 100n + BigInt(two) + (roundUp ? 1n : 0n);
  if (total < 0n) total = 0n;
  return {
    major: (total / 100n).toString(),
    minor: Number(total % 100n),
    rounded: fracDigits.length > 2 && /[1-9]/.test(fracDigits.slice(2)),
  };
}

const CURRENCY_WORDS: Record<Exclude<WordsCurrency, "none">, {
  major: [string, string];
  minor: [string, string];
  /** Rupee cheques write the unit first ("Rupees One Lakh"); dollars follow the number. */
  prefix: boolean;
}> = {
  PKR: { major: ["Rupees", "Rupees"], minor: ["Paisa", "Paisa"], prefix: true },
  INR: { major: ["Rupees", "Rupees"], minor: ["Paisa", "Paise"], prefix: true },
  USD: { major: ["Dollar", "Dollars"], minor: ["Cent", "Cents"], prefix: false },
};

export type WordsResult = {
  words: string;
  /** Grouped figures, e.g. "1,25,000.50". */
  figures: string;
  /** True when more than two decimals were rounded off (currencies only). */
  rounded: boolean;
  /** Whole-number part actually spelled (after rounding). */
  major: string;
};

/** Builds the full phrase in Title Case (apply applyCase for other styles). */
export function amountToWords(
  intDigits: string,
  fracDigits: string,
  opts: { system: NumberSystem; currency: WordsCurrency; only: boolean },
): WordsResult {
  const { system, currency, only } = opts;
  const tail = only ? " Only" : "";

  if (currency === "none") {
    // Plain numbers read each decimal digit as typed: 12.05 -> "Twelve Point Zero Five".
    const frac = fracDigits;
    let words = integerToWords(intDigits, system);
    if (frac.length > 0) {
      words += " Point " + frac.split("").map((d) => ONES[Number(d)]).join(" ");
    }
    const figures = groupDigits(intDigits, system) + (frac.length ? `.${frac}` : "");
    return { words: words + tail, figures, rounded: false, major: intDigits };
  }

  const c = CURRENCY_WORDS[currency];
  const { major, minor, rounded } = toMinorUnits(intDigits, fracDigits);
  const majorIsZero = /^0+$/.test(major);
  const majorWords = integerToWords(major, system);
  const minorWords = minor > 0 ? `${twoDigits(minor)} ${minor === 1 ? c.minor[0] : c.minor[1]}` : "";
  const majorUnit = major === "1" ? c.major[0] : c.major[1];

  let words: string;
  if (majorIsZero && minor > 0) {
    words = minorWords;
  } else if (c.prefix) {
    words = `${majorUnit} ${majorWords}${minorWords ? ` and ${minorWords}` : ""}`;
  } else {
    words = `${majorWords} ${majorUnit}${minorWords ? ` and ${minorWords}` : ""}`;
  }
  const figures = `${groupDigits(major, system)}.${String(minor).padStart(2, "0")}`;
  return { words: words + tail, figures, rounded, major };
}

/** Applies a letter case to a Title Case phrase. */
export function applyCase(words: string, style: WordsCase): string {
  if (style === "upper") return words.toUpperCase();
  if (style === "sentence") {
    const lower = words.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return words;
}
