"use client";

import { Keyboard, RotateCcw, Shuffle, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Field, ResultCard, SegmentedControl, Stat, cn, fmt } from "@/components/ui";
import { TYPING_PASSAGES, typingRating, typingText } from "./shared-misc/typing-passages";
import { clockNow } from "./shared-time/clock";
import { useStoredString, useTicker, writeStored } from "./shared-time/hooks";

type Duration = "15" | "30" | "60" | "120";
type Status = "idle" | "running" | "finished";

const bestKey = (d: Duration) => `toolhub:typing:best:${d}`;

/** Splits the typed region into runs of correct / incorrect characters for cheap rendering. */
function runs(text: string, typed: string) {
  const out: { ok: boolean; s: string }[] = [];
  for (let i = 0; i < typed.length; i++) {
    const ok = typed[i] === text[i];
    const ch = text[i] ?? "";
    const last = out[out.length - 1];
    if (last && last.ok === ok) last.s += ch;
    else out.push({ ok, s: ch });
  }
  return out;
}

export default function TypingSpeedTest() {
  const [duration, setDuration] = useState<Duration>("60");
  const [passage, setPassage] = useState(0);
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [startAt, setStartAt] = useState(0);
  const [endedAt, setEndedAt] = useState(0);
  const [now, setNow] = useTicker(status === "running");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const bestRaw = useStoredString(bestKey(duration));

  const text = typingText(passage);
  const seconds = Number(duration);
  const elapsedMs = status === "running" ? Math.max(0, now - startAt) : status === "finished" ? endedAt - startAt : 0;
  const leftS = Math.max(0, Math.ceil(seconds - elapsedMs / 1000));
  const minutes = Math.max(elapsedMs, 1000) / 60000;

  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++;
  const incorrect = typed.length - correct;
  const wpm = status === "idle" ? 0 : correct / 5 / minutes;
  const raw = status === "idle" ? 0 : typed.length / 5 / minutes;
  const accuracy = typed.length ? (correct / typed.length) * 100 : 100;
  const best = bestRaw ? Number(bestRaw) : 0;

  // End the test when time is up.
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setTimeout(() => {
      const end = startAt + seconds * 1000;
      setEndedAt(end);
      setStatus("finished");
    }, Math.max(0, startAt + seconds * 1000 - clockNow()));
    return () => window.clearTimeout(id);
  }, [status, startAt, seconds]);

  // Save a new personal best once the test is over.
  useEffect(() => {
    if (status !== "finished") return;
    const finalWpm = Math.round(wpm);
    if (finalWpm > best) writeStored(bestKey(duration), String(finalWpm));
  }, [status, wpm, best, duration]);

  // Keep the caret in view as the text scrolls.
  useEffect(() => {
    caretRef.current?.scrollIntoView({ block: "nearest" });
  }, [typed.length]);

  function restart(nextPassage = passage) {
    setPassage(nextPassage);
    setTyped("");
    setStatus("idle");
    inputRef.current?.focus();
  }

  function onType(value: string) {
    if (status === "finished") return;
    const v = value.slice(0, text.length).replace(/\n/g, " ");
    if (status === "idle" && v.length > 0) {
      const t = clockNow();
      setStartAt(t);
      setNow(t);
      setStatus("running");
    }
    setTyped(v);
  }

  const rating = typingRating(Math.round(wpm));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Test length" as="group">
          <SegmentedControl
            label="Test length"
            value={duration}
            onChange={(d) => {
              setDuration(d);
              setTyped("");
              setStatus("idle");
            }}
            options={[
              { value: "15", label: "15 s" },
              { value: "30", label: "30 s" },
              { value: "60", label: "1 min" },
              { value: "120", label: "2 min" },
            ]}
          />
        </Field>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" onClick={() => restart((passage + 1) % TYPING_PASSAGES.length)}>
            <Shuffle /> New text
          </Button>
          <Button onClick={() => restart()}>
            <RotateCcw /> Restart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Time left" value={`${status === "idle" ? seconds : leftS}s`} highlight={status === "running"} />
        <Stat label="Speed" value={`${Math.round(wpm)} WPM`} />
        <Stat label="Accuracy" value={`${fmt(accuracy, 1)}%`} />
        <Stat label="Personal best" value={bestRaw === undefined ? "—" : best ? `${best} WPM` : "—"} icon={<Trophy />} />
      </div>

      <div
        className="relative cursor-text rounded-xl border border-border-strong bg-card focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15"
        onClick={() => inputRef.current?.focus()}
      >
        <div
          aria-hidden
          className="max-h-48 overflow-hidden p-5 font-mono text-lg leading-9 tracking-wide whitespace-pre-wrap sm:max-h-56 sm:text-xl sm:leading-10"
        >
          {runs(text, typed).map((r, i) => (
            <span
              key={i}
              className={r.ok ? "text-foreground" : "rounded-sm bg-danger-soft text-danger underline decoration-danger/60"}
            >
              {r.s}
            </span>
          ))}
          <span ref={caretRef} className={cn("border-l-2 border-accent", status !== "finished" && "animate-pulse")} />
          <span className="text-faint">{text.slice(typed.length)}</span>
        </div>
        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab" || (e.key === "Enter" && status === "finished")) {
              e.preventDefault();
              restart();
            }
            if (e.key === "Enter") e.preventDefault();
          }}
          onPaste={(e) => e.preventDefault()}
          disabled={status === "finished"}
          aria-label="Type the passage here"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="absolute inset-0 size-full cursor-text resize-none opacity-0"
        />
        {status === "idle" && typed.length === 0 && (
          <div className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1 text-[13px] text-muted">
            <Keyboard aria-hidden className="size-3.5" /> Click here and start typing
          </div>
        )}
      </div>

      {status === "finished" && (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <ResultCard label="Your typing speed" value={`${Math.round(wpm)} WPM`} caption={`${fmt(accuracy, 1)}% accuracy`}>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={rating.tone}>{rating.label}</Badge>
              {Math.round(wpm) > 0 && Math.round(wpm) >= best && <Badge tone="success">New personal best</Badge>}
            </div>
          </ResultCard>
          <Stat label="Raw speed" value={`${Math.round(raw)} WPM`} hint="all keystrokes, including errors" />
          <Stat label="Characters" value={`${correct} / ${incorrect}`} hint="correct / incorrect" />
          <p className="text-sm text-muted sm:col-span-3">Press Tab or Enter to try again.</p>
        </div>
      )}
    </div>
  );
}
