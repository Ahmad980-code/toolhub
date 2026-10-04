"use client";

import { Flag, Pause, Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Badge, Button, EmptyState, Table, ToolSection, cn } from "@/components/ui";
import { clockNow, formatStopwatch, stopwatchParts } from "./shared-time/clock";
import { useDocumentTitle, useHotkeys, useTicker } from "./shared-time/hooks";
import { ShortcutHints } from "./shared-time/ui";

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const [banked, setBanked] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [now, setNow] = useTicker(running, "frame");

  const elapsed = banked + (running ? Math.max(0, now - startAt) : 0);
  const { main, frac } = stopwatchParts(elapsed);

  function toggle() {
    const t = clockNow();
    if (running) {
      setBanked((b) => b + Math.max(0, t - startAt));
      setRunning(false);
    } else {
      setStartAt(t);
      setNow(t);
      setRunning(true);
    }
  }

  function lap() {
    if (!running) return;
    const total = banked + Math.max(0, clockNow() - startAt);
    setLaps((l) => [...l, total]);
  }

  function reset() {
    if (running) return;
    setBanked(0);
    setLaps([]);
  }

  useHotkeys({ " ": toggle, l: lap, r: reset });
  useDocumentTitle(running || elapsed > 0 ? `${main} · Stopwatch` : null);

  const splits = laps.map((total, i) => total - (i ? laps[i - 1] : 0));
  const best = splits.length > 1 ? Math.min(...splits) : NaN;
  const worst = splits.length > 1 ? Math.max(...splits) : NaN;

  return (
    <div className="grid gap-8">
      <div className="flex flex-col items-center gap-6 rounded-xl bg-subtle px-4 py-10 sm:py-14">
        <div
          role="timer"
          aria-live="off"
          aria-label={`Elapsed time ${formatStopwatch(elapsed)}`}
          className="font-mono text-6xl font-semibold tracking-tight text-foreground tabular-nums sm:text-8xl"
        >
          {main}
          <span className="text-muted">{frac}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" onClick={toggle} className="min-w-36">
            {running ? <Pause /> : <Play />}
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </Button>
          <Button size="lg" onClick={lap} disabled={!running}>
            <Flag /> Lap
          </Button>
          <Button size="lg" variant="ghost" onClick={reset} disabled={running || elapsed === 0}>
            <RotateCcw /> Reset
          </Button>
        </div>
        <ShortcutHints
          items={[
            { keys: "Space", label: "start / pause" },
            { keys: "L", label: "lap" },
            { keys: "R", label: "reset" },
          ]}
        />
      </div>

      <ToolSection title="Laps" description={laps.length ? `${laps.length} lap${laps.length === 1 ? "" : "s"} recorded` : undefined}>
        {laps.length === 0 ? (
          <EmptyState
            icon={<Flag />}
            title="No laps yet"
            description="Press Lap (or L) while the stopwatch runs to record split times."
          />
        ) : (
          <Table label="Lap times" maxHeight={360}>
            <thead>
              <tr>
                <th>Lap</th>
                <th className="num">Lap time</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {laps
                .map((total, i) => ({ total, i, split: splits[i] }))
                .reverse()
                .map(({ total, i, split }) => (
                  <tr key={i}>
                    <td>
                      <span className="inline-flex items-center gap-2">
                        Lap {i + 1}
                        {split === best && <Badge tone="success">Fastest</Badge>}
                        {split === worst && <Badge tone="warning">Slowest</Badge>}
                      </span>
                    </td>
                    <td className={cn("num font-mono", split === best && "text-success", split === worst && "text-warning")}>
                      {formatStopwatch(split)}
                    </td>
                    <td className="num font-mono text-muted">{formatStopwatch(total)}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </ToolSection>
    </div>
  );
}
