"use client";

import { BellOff, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, Callout, Field, NumberInput, Switch, cn, focusRing, num } from "@/components/ui";
import { clockNow, formatClock, formatDuration, secondsLeft } from "./shared-time/clock";
import { useDocumentTitle, useHotkeys, useTicker } from "./shared-time/hooks";
import { playAlarm, unlockAudio } from "./shared-time/sound";
import { ProgressRing, ShortcutHints } from "./shared-time/ui";

type Status = "idle" | "running" | "paused" | "done";
const PRESETS = [1, 3, 5, 10, 15, 25, 30, 60];

export default function CountdownTimer() {
  const [h, setH] = useState("0");
  const [m, setM] = useState("5");
  const [s, setS] = useState("0");
  const [status, setStatus] = useState<Status>("idle");
  const [total, setTotal] = useState(300); // seconds in the current run
  const [endAt, setEndAt] = useState(0);
  const [left, setLeft] = useState(0); // ms left while paused
  const [muted, setMuted] = useState(false);
  const stopAlarm = useRef<(() => void) | null>(null);
  const [now, setNow] = useTicker(status === "running");

  const inputSeconds = Math.max(0, (num(h) || 0) * 3600 + (num(m) || 0) * 60 + (num(s) || 0));
  const remainingMs =
    status === "running" ? Math.max(0, endAt - now) : status === "paused" ? left : status === "done" ? 0 : inputSeconds * 1000;
  const shownSeconds = secondsLeft(remainingMs);
  const duration = status === "idle" ? inputSeconds : total;
  const progress = duration > 0 ? remainingMs / (duration * 1000) : 0;

  // Fire the alarm when time runs out (a timeout is accurate enough, even in a background tab).
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setTimeout(() => {
      setStatus("done");
      if (!muted) stopAlarm.current = playAlarm(30);
    }, Math.max(0, endAt - clockNow()));
    return () => window.clearTimeout(id);
  }, [status, endAt, muted]);

  useEffect(() => () => stopAlarm.current?.(), []);

  function silence() {
    stopAlarm.current?.();
    stopAlarm.current = null;
  }

  function start() {
    unlockAudio();
    silence();
    const t = clockNow();
    if (status === "paused") {
      setEndAt(t + left);
    } else {
      if (inputSeconds <= 0) return;
      setTotal(inputSeconds);
      setEndAt(t + inputSeconds * 1000);
    }
    setNow(t);
    setStatus("running");
  }

  function pause() {
    setLeft(Math.max(0, endAt - clockNow()));
    setStatus("paused");
  }

  function reset() {
    silence();
    setStatus("idle");
  }

  function addMinute() {
    if (status === "running") setEndAt((e) => e + 60_000);
    else if (status === "paused") setLeft((l) => l + 60_000);
    else return;
    setTotal((t) => t + 60);
  }

  function preset(min: number) {
    silence();
    setH(String(Math.floor(min / 60)));
    setM(String(min % 60));
    setS("0");
    setStatus("idle");
  }

  useHotkeys({ " ": () => (status === "running" ? pause() : start()), r: reset });
  useDocumentTitle(
    status === "running" || status === "paused"
      ? `${formatClock(shownSeconds)} · Timer`
      : status === "done"
        ? "Time's up! · Timer"
        : null,
  );

  const editing = status === "idle";
  const tone = status === "done" ? "success" : status === "paused" ? "warning" : "accent";

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
      <div className="flex flex-col items-center gap-6 rounded-xl bg-subtle px-4 py-8">
        <ProgressRing value={status === "idle" ? 1 : progress} tone={tone} className="max-w-72">
          <div
            role="timer"
            aria-label={`${formatDuration(shownSeconds)} left`}
            className={cn(
              "font-mono text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl",
              status === "done" ? "text-success" : "text-foreground",
            )}
          >
            {formatClock(shownSeconds)}
          </div>
          <p className="mt-2 text-sm text-muted">
            {status === "running" ? "Running" : status === "paused" ? "Paused" : status === "done" ? "Time's up" : `of ${formatDuration(duration)}`}
          </p>
        </ProgressRing>
        <div className="flex flex-wrap justify-center gap-3">
          {status === "running" ? (
            <Button variant="primary" size="lg" onClick={pause} className="min-w-36">
              <Pause /> Pause
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={start}
              disabled={status === "done" || (editing && inputSeconds <= 0)}
              className="min-w-36"
            >
              <Play /> {status === "paused" ? "Resume" : "Start"}
            </Button>
          )}
          <Button size="lg" onClick={addMinute} disabled={status === "idle" || status === "done"}>
            <Plus /> 1 min
          </Button>
          <Button size="lg" variant="ghost" onClick={reset} disabled={status === "idle"}>
            <RotateCcw /> {status === "done" ? "Restart" : "Reset"}
          </Button>
        </div>
        <ShortcutHints
          items={[
            { keys: "Space", label: "start / pause" },
            { keys: "R", label: "reset" },
          ]}
        />
      </div>

      <div className="grid gap-5">
        {status === "done" && (
          <Callout tone="success" title="Time's up!">
            <Button size="sm" className="mt-2" onClick={silence}>
              <BellOff /> Stop alarm
            </Button>
          </Callout>
        )}
        <Field label="Quick presets" as="group">
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const on = editing && inputSeconds === p * 60;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={on}
                  onClick={() => preset(p)}
                  className={cn(
                    "h-11 rounded-lg border text-sm font-medium tabular-nums transition-colors sm:h-10",
                    focusRing,
                    on
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border-strong bg-card text-foreground hover:border-border-hover hover:bg-subtle",
                  )}
                >
                  {p < 60 ? `${p} min` : "1 hour"}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Custom time" as="group" hint={editing ? undefined : "Reset the timer to change the time"}>
          <div className="grid grid-cols-3 gap-2">
            <NumberInput value={h} onChange={setH} min={0} max={99} suffix="h" inputMode="numeric" aria-label="Hours" disabled={!editing} />
            <NumberInput value={m} onChange={setM} min={0} max={59} suffix="min" inputMode="numeric" aria-label="Minutes" disabled={!editing} />
            <NumberInput value={s} onChange={setS} min={0} max={59} suffix="s" inputMode="numeric" aria-label="Seconds" disabled={!editing} />
          </div>
        </Field>
        <Switch checked={!muted} onChange={(v) => setMuted(!v)} label="Alarm sound" description="Beeps for 30 seconds when time is up" />
      </div>
    </div>
  );
}
