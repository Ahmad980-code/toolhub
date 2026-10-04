"use client";

import { ChevronDown, Coffee, Pause, Play, RotateCcw, SkipForward, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, Field, NumberInput, Stat, Switch, cn, focusRing, num } from "@/components/ui";
import { clockNow, formatClock, localDateKey, secondsLeft } from "./shared-time/clock";
import { readStored, useDocumentTitle, useHotkeys, useStoredString, useTicker, writeStored } from "./shared-time/hooks";
import { playChime, unlockAudio } from "./shared-time/sound";
import { ProgressRing, ShortcutHints } from "./shared-time/ui";

type Phase = "focus" | "short" | "long";
type Settings = { focus: number; short: number; long: number; every: number; auto: boolean; sound: boolean };

const DEFAULTS: Settings = { focus: 25, short: 5, long: 15, every: 4, auto: true, sound: true };
const SETTINGS_KEY = "toolhub:pomodoro:settings";
const TODAY_KEY = "toolhub:pomodoro:today";
const PHASE_LABEL: Record<Phase, string> = { focus: "Focus", short: "Short break", long: "Long break" };

function parseSettings(raw: string | null | undefined): Settings {
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

function bumpToday() {
  const today = localDateKey(new Date());
  let count = 0;
  try {
    const saved = JSON.parse(readStored(TODAY_KEY) ?? "null") as { date: string; count: number } | null;
    if (saved && saved.date === today) count = saved.count;
  } catch {
    // Start fresh.
  }
  writeStored(TODAY_KEY, JSON.stringify({ date: today, count: count + 1 }));
}

export default function PomodoroTimer() {
  const settings = parseSettings(useStoredString(SETTINGS_KEY));
  const todayRaw = useStoredString(TODAY_KEY);

  const [phase, setPhase] = useState<Phase>("focus");
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [endAt, setEndAt] = useState(0);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(0); // focus sessions finished this visit
  const [now, setNow] = useTicker(status === "running");
  const stopSound = useRef<(() => void) | null>(null);

  const lengthMs = settings[phase] * 60_000;
  const remainingMs = status === "running" ? Math.max(0, endAt - now) : status === "paused" ? left : lengthMs;
  const shown = secondsLeft(remainingMs);

  let todayCount = 0;
  if (todayRaw) {
    try {
      const saved = JSON.parse(todayRaw) as { date: string; count: number };
      if (saved.date === localDateKey(new Date())) todayCount = saved.count;
    } catch {
      // Ignore bad data.
    }
  }

  function nextPhase(after: Phase, finished: number): Phase {
    if (after !== "focus") return "focus";
    return finished % settings.every === 0 ? "long" : "short";
  }

  function begin(p: Phase) {
    const t = clockNow();
    setPhase(p);
    setEndAt(t + settings[p] * 60_000);
    setNow(t);
    setStatus("running");
  }

  // When a phase ends: chime, count focus sessions, move to the next phase.
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setTimeout(() => {
      const finished = phase === "focus" ? done + 1 : done;
      if (phase === "focus") {
        setDone(finished);
        bumpToday();
      }
      const next = nextPhase(phase, finished);
      if (settings.sound) stopSound.current = playChime(next === "focus" ? "up" : "down");
      if (settings.auto) {
        const t = clockNow();
        setPhase(next);
        setEndAt(t + settings[next] * 60_000);
        setNow(t);
      } else {
        setPhase(next);
        setStatus("idle");
      }
    }, Math.max(0, endAt - clockNow()));
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, endAt, phase]);

  useEffect(() => () => stopSound.current?.(), []);

  function toggle() {
    unlockAudio();
    if (status === "running") {
      setLeft(Math.max(0, endAt - clockNow()));
      setStatus("paused");
    } else if (status === "paused") {
      const t = clockNow();
      setEndAt(t + left);
      setNow(t);
      setStatus("running");
    } else {
      begin(phase);
    }
  }

  function skip() {
    const next = nextPhase(phase, phase === "focus" ? done + 1 : done);
    if (phase === "focus") setDone((d) => d + 1);
    setPhase(next);
    setStatus("idle");
  }

  function reset() {
    setStatus("idle");
  }

  function update(patch: Partial<Settings>) {
    writeStored(SETTINGS_KEY, JSON.stringify({ ...settings, ...patch }));
  }

  useHotkeys({ " ": toggle, r: reset, s: skip });
  useDocumentTitle(status === "idle" ? null : `${formatClock(shown)} · ${PHASE_LABEL[phase]}`);

  const isBreak = phase !== "focus";
  const cyclePos = done % settings.every;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
      <div
        className={cn(
          "flex flex-col items-center gap-6 rounded-xl px-4 py-8 transition-colors",
          isBreak ? "bg-success-soft" : "bg-subtle",
        )}
      >
        <div className="flex gap-2" role="tablist" aria-label="Phase">
          {(["focus", "short", "long"] as Phase[]).map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={phase === p}
              onClick={() => {
                setPhase(p);
                setStatus("idle");
              }}
              className={cn(
                "min-h-9 rounded-full px-3 text-sm font-medium transition-colors",
                focusRing,
                phase === p
                  ? p === "focus"
                    ? "bg-accent text-accent-foreground"
                    : "bg-success text-white dark:text-background"
                  : "text-muted hover:text-foreground",
              )}
            >
              {PHASE_LABEL[p]}
            </button>
          ))}
        </div>
        <ProgressRing value={1 - remainingMs / lengthMs} tone={isBreak ? "success" : "accent"} className="max-w-72">
          {isBreak ? <Coffee aria-hidden className="mb-1 size-5 text-success" /> : <Target aria-hidden className="mb-1 size-5 text-accent" />}
          <div role="timer" aria-label={`${PHASE_LABEL[phase]}: ${formatClock(shown)} left`} className="font-mono text-5xl font-semibold tracking-tight text-foreground tabular-nums sm:text-6xl">
            {formatClock(shown)}
          </div>
          <p className="mt-2 text-sm text-muted">
            {PHASE_LABEL[phase]}
            {status === "paused" ? " · paused" : ""}
          </p>
        </ProgressRing>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" onClick={toggle} className="min-w-36">
            {status === "running" ? <Pause /> : <Play />}
            {status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start"}
          </Button>
          <Button size="lg" onClick={skip}>
            <SkipForward /> Skip
          </Button>
          <Button size="lg" variant="ghost" onClick={reset} disabled={status === "idle"}>
            <RotateCcw /> Reset
          </Button>
        </div>
        <ShortcutHints
          items={[
            { keys: "Space", label: "start / pause" },
            { keys: "S", label: "skip" },
            { keys: "R", label: "reset" },
          ]}
        />
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Sessions this visit" value={done} hint={`${cyclePos} of ${settings.every} before a long break`} />
          <Stat label="Focus sessions today" value={todayRaw === undefined ? "—" : todayCount} hint="saved in this browser" />
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: settings.every }, (_, i) => (
            <span key={i} className={cn("h-2 flex-1 rounded-full", i < cyclePos ? "bg-accent" : "bg-border-strong")} />
          ))}
        </div>
        <details className="group rounded-xl border border-border bg-card" open>
          <summary className={cn("flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 font-medium text-foreground", focusRing)}>
            Settings
            <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-border p-4">
            <div className="grid grid-cols-3 gap-2">
              <Field label="Focus">
                <NumberInput value={String(settings.focus)} onChange={(v) => num(v) > 0 && update({ focus: Math.min(180, num(v)) })} min={1} suffix="min" inputMode="numeric" />
              </Field>
              <Field label="Short">
                <NumberInput value={String(settings.short)} onChange={(v) => num(v) > 0 && update({ short: Math.min(60, num(v)) })} min={1} suffix="min" inputMode="numeric" />
              </Field>
              <Field label="Long">
                <NumberInput value={String(settings.long)} onChange={(v) => num(v) > 0 && update({ long: Math.min(120, num(v)) })} min={1} suffix="min" inputMode="numeric" />
              </Field>
            </div>
            <Field label="Long break after" aside={`${settings.every} sessions`}>
              <NumberInput value={String(settings.every)} onChange={(v) => num(v) >= 2 && update({ every: Math.min(12, Math.round(num(v))) })} min={2} max={12} suffix="sessions" inputMode="numeric" />
            </Field>
            <Switch checked={settings.auto} onChange={(v) => update({ auto: v })} label="Start the next phase automatically" />
            <Switch checked={settings.sound} onChange={(v) => update({ sound: v })} label="Chime when a phase ends" />
            <Button size="sm" variant="ghost" onClick={() => writeStored(SETTINGS_KEY, null)}>
              Restore defaults (25 / 5 / 15)
            </Button>
          </div>
        </details>
      </div>
    </div>
  );
}
