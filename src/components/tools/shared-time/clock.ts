/**
 * Time helpers shared by the stopwatch, countdown and Pomodoro timers.
 * Only call clockNow() from event handlers, effects or animation callbacks (never during render).
 */

let lastPerf = -1;
let lastWall = 0;
let sleepOffset = 0;

/**
 * Monotonic milliseconds for measuring elapsed time. Based on performance.now(), which never jumps
 * when the system clock changes. Some devices pause that clock while asleep (e.g. a locked phone),
 * so when the wall clock has moved more than a second further than it since the last reading, the
 * difference is added. The value never goes backwards.
 */
export function clockNow(): number {
  const perf = performance.now();
  const wall = Date.now();
  if (lastPerf >= 0) {
    const drift = wall - lastWall - (perf - lastPerf);
    if (drift > 1000) sleepOffset += drift;
  }
  lastPerf = perf;
  lastWall = wall;
  return perf + sleepOffset;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Stopwatch reading, truncated to hundredths: { main: "01:23" | "1:02:03", frac: ".45" }. */
export function stopwatchParts(ms: number) {
  const cs = Math.floor(Math.max(0, ms) / 10);
  const h = Math.floor(cs / 360000);
  const m = Math.floor(cs / 6000) % 60;
  const s = Math.floor(cs / 100) % 60;
  const frac = `.${pad(cs % 100)}`;
  return { main: h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`, frac, hasHours: h > 0 };
}

/** "01:23.45" or "1:02:03.45". */
export function formatStopwatch(ms: number) {
  const { main, frac } = stopwatchParts(ms);
  return main + frac;
}

/** Whole seconds left, rounded up, so the display reaches 00:00 exactly when time is up. */
export function secondsLeft(ms: number) {
  return Math.max(0, Math.ceil(ms / 1000 - 1e-6));
}

/** Countdown reading from whole seconds: "04:59" or "1:04:59". */
export function formatClock(totalSeconds: number) {
  const t = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(t / 3600);
  const m = Math.floor(t / 60) % 60;
  const s = t % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Human duration: "1 h 30 min", "25 min", "45 s", "1 min 30 s". */
export function formatDuration(totalSeconds: number) {
  const t = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(t / 3600);
  const m = Math.floor(t / 60) % 60;
  const s = t % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} h`);
  if (m) parts.push(`${m} min`);
  if (s || parts.length === 0) parts.push(`${s} s`);
  return parts.join(" ");
}

/** Local calendar date as YYYY-MM-DD (client only: depends on the device time zone). */
export function localDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Wall-clock time a timer will end, e.g. "2:35 PM" (client only). */
export function endsAtLabel(msFromNow: number) {
  return new Date(Date.now() + msFromNow).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
