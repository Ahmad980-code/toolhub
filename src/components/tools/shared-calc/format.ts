/** Small, locale-pinned helpers shared by the calculator tools (safe during SSR). */

/** Compact axis label: 950 -> "950", 12_500 -> "12.5K", 2_400_000 -> "2.4M". */
export function compact(value: number) {
  const abs = Math.abs(value);
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [size, suffix] of units) {
    if (abs >= size) {
      const scaled = value / size;
      const digits = Math.abs(scaled) >= 100 ? 0 : 1;
      return `${Number(scaled.toFixed(digits)).toString()}${suffix}`;
    }
  }
  return Number(value.toFixed(abs >= 10 ? 0 : 1)).toString();
}

/** A "nice" step (1, 2, 2.5 or 5 x 10^k) so that `max` fits in roughly `count` steps. */
export function niceStep(max: number, count = 4) {
  if (!(max > 0)) return 1;
  const raw = max / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const m = raw / power;
  const nice = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return nice * power;
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "Tuesday, 15 August 1995" (no Intl, so server and browser always agree). */
export function longDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Tue, 15 Aug 2026". */
export function shortDate(d: Date) {
  return `${WEEKDAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

/** "1 year" / "3 years". */
export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Tab-separated text (pastes cleanly into Excel / Google Sheets). */
export function toTsv(rows: (string | number)[][]) {
  return rows.map((r) => r.join("\t")).join("\n");
}
