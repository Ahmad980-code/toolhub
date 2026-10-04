"use client";

import { Eraser, Keyboard as KeyboardIcon, Play, RotateCcw, Square } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Badge, Button, Meter, SegmentedControl, Stat, ToolSection, cn } from "@/components/ui";

type K = { code: string; label: string; shift?: string; w?: number; tall?: boolean; wide?: boolean };
type Row = (K | number)[]; // numbers are blank gaps, in key units
type Layout = "full" | "tkl" | "compact";

const k = (code: string, label: string, w = 1, shift?: string): K => ({ code, label, w, shift });
const letters = (s: string) => s.split("").map((c) => k(`Key${c}`, c));

const FN_ROW: Row = [
  k("Escape", "Esc"), 1,
  ...[1, 2, 3, 4].map((n) => k(`F${n}`, `F${n}`)), 0.5,
  ...[5, 6, 7, 8].map((n) => k(`F${n}`, `F${n}`)), 0.5,
  ...[9, 10, 11, 12].map((n) => k(`F${n}`, `F${n}`)),
];
const MAIN: Row[] = [
  [
    k("Backquote", "`", 1, "~"),
    ...["1!", "2@", "3#", "4$", "5%", "6^", "7&", "8*", "9(", "0)"].map((s) => k(`Digit${s[0]}`, s[0], 1, s[1])),
    k("Minus", "-", 1, "_"), k("Equal", "=", 1, "+"), k("Backspace", "Backspace", 2),
  ],
  [k("Tab", "Tab", 1.5), ...letters("QWERTYUIOP"), k("BracketLeft", "[", 1, "{"), k("BracketRight", "]", 1, "}"), k("Backslash", "\\", 1.5, "|")],
  [k("CapsLock", "Caps Lock", 1.75), ...letters("ASDFGHJKL"), k("Semicolon", ";", 1, ":"), k("Quote", "'", 1, '"'), k("Enter", "Enter", 2.25)],
  [k("ShiftLeft", "Shift", 2.25), ...letters("ZXCVBNM"), k("Comma", ",", 1, "<"), k("Period", ".", 1, ">"), k("Slash", "/", 1, "?"), k("ShiftRight", "Shift", 2.75)],
  [
    k("ControlLeft", "Ctrl", 1.25), k("MetaLeft", "Win", 1.25), k("AltLeft", "Alt", 1.25), k("Space", "", 6.25),
    k("AltRight", "Alt", 1.25), k("MetaRight", "Win", 1.25), k("ContextMenu", "Menu", 1.25), k("ControlRight", "Ctrl", 1.25),
  ],
];
const NAV_FN: Row = [k("PrintScreen", "PrtSc"), k("ScrollLock", "ScrLk"), k("Pause", "Pause")];
const NAV: Row[] = [
  [k("Insert", "Ins"), k("Home", "Home"), k("PageUp", "PgUp")],
  [k("Delete", "Del"), k("End", "End"), k("PageDown", "PgDn")],
  [3],
  [1, k("ArrowUp", "↑"), 1],
  [k("ArrowLeft", "←"), k("ArrowDown", "↓"), k("ArrowRight", "→")],
];
const ARROWS_ONLY: Row[] = [[3], [3], [3], NAV[3], NAV[4]];
const NUMPAD: K[] = [
  k("NumLock", "Num"), k("NumpadDivide", "/"), k("NumpadMultiply", "*"), k("NumpadSubtract", "-"),
  k("Numpad7", "7"), k("Numpad8", "8"), k("Numpad9", "9"), { code: "NumpadAdd", label: "+", tall: true },
  k("Numpad4", "4"), k("Numpad5", "5"), k("Numpad6", "6"),
  k("Numpad1", "1"), k("Numpad2", "2"), k("Numpad3", "3"), { code: "NumpadEnter", label: "Enter", tall: true },
  { code: "Numpad0", label: "0", wide: true }, k("NumpadDecimal", "."),
];

const keysOf = (rows: Row[]) => rows.flat().filter((x): x is K => typeof x !== "number");
const LAYOUT_KEYS: Record<Layout, K[]> = {
  full: [...keysOf([FN_ROW, ...MAIN, NAV_FN, ...NAV]), ...NUMPAD],
  tkl: keysOf([FN_ROW, ...MAIN, NAV_FN, ...NAV]),
  compact: keysOf([FN_ROW, ...MAIN, ...ARROWS_ONLY]),
};
const LAYOUT_UNITS: Record<Layout, number> = { full: 23, tkl: 18.5, compact: 18.5 };
const LABELS = new Map(LAYOUT_KEYS.full.map((x) => [x.code, x.label || "Space"]));

const LOCATION = ["Standard", "Left", "Right", "Numpad"];

type LogEntry = { id: number; type: "down" | "up"; key: string; code: string };
type Info = { key: string; code: string; keyCode: number; location: number; repeat: boolean; mods: string[] };

const narrowQuery = "(max-width: 767px)";
const subscribeNarrow = (cb: () => void) => {
  const m = window.matchMedia(narrowQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

function KeyCap({ k: key, held, tested, style }: { k: K; held: boolean; tested: boolean; style?: CSSProperties }) {
  return (
    <div style={style} className={cn("p-[2px]", key.tall && "row-span-2", key.wide && "col-span-2")}>
      <div
        data-code={key.code}
        data-state={held ? "held" : tested ? "tested" : "idle"}
        className={cn(
          "relative flex size-full flex-col items-start justify-between rounded-[6px] border px-[8%] py-[6%] leading-none font-medium transition-[background-color,border-color,color,transform] duration-75 motion-reduce:transition-none",
          held
            ? "translate-y-px border-accent bg-accent text-accent-foreground"
            : tested
              ? "border-success/40 bg-success-soft text-success"
              : "border-border-strong bg-card text-foreground shadow-xs",
        )}
        style={{ fontSize: "calc(var(--u) * 0.24)" }}
      >
        {key.shift ? (
          <>
            <span className="opacity-70">{key.shift}</span>
            <span>{key.label}</span>
          </>
        ) : (
          <span className="mt-auto">{key.label}</span>
        )}
      </div>
    </div>
  );
}

function Rows({ rows, held, tested }: { rows: Row[]; held: Set<string>; tested: Set<string> }) {
  return (
    <div>
      {rows.map((row, r) => (
        <div key={r} className="flex" style={{ height: "var(--u)" }}>
          {row.map((x, i) =>
            typeof x === "number" ? (
              <div key={i} style={{ width: `calc(var(--u) * ${x})` }} />
            ) : (
              <KeyCap key={x.code} k={x} held={held.has(x.code)} tested={tested.has(x.code)} style={{ width: `calc(var(--u) * ${x.w ?? 1})` }} />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

export default function KeyboardTester() {
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches, () => false);
  const [choice, setChoice] = useState<Layout | null>(null);
  const layout: Layout = choice ?? (narrow ? "compact" : "full");
  const [active, setActive] = useState(false);
  const [held, setHeld] = useState<Set<string>>(() => new Set());
  const [tested, setTested] = useState<Set<string>>(() => new Set());
  const [maxHeld, setMaxHeld] = useState(0);
  const [last, setLast] = useState<Info | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [showMissing, setShowMissing] = useState(false);
  const logId = useRef(0);

  useEffect(() => {
    if (!active) return;
    const push = (type: "down" | "up", e: KeyboardEvent) => {
      logId.current += 1;
      const entry = { id: logId.current, type, key: e.key, code: e.code };
      setLog((l) => [entry, ...l].slice(0, 20));
    };
    const onDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const code = e.code || e.key;
      setHeld((h) => {
        const next = new Set(h).add(code);
        setMaxHeld((m) => Math.max(m, next.size));
        return next;
      });
      setTested((t) => (t.has(code) ? t : new Set(t).add(code)));
      const mods = [e.ctrlKey && "Ctrl", e.shiftKey && "Shift", e.altKey && "Alt", e.metaKey && "Meta"].filter(Boolean) as string[];
      setLast({ key: e.key, code, keyCode: e.keyCode, location: e.location, repeat: e.repeat, mods });
      if (!e.repeat) push("down", e);
    };
    const onUp = (e: KeyboardEvent) => {
      e.preventDefault();
      const code = e.code || e.key;
      setHeld((h) => {
        if (!h.has(code)) return h;
        const next = new Set(h);
        next.delete(code);
        return next;
      });
      // Some keys (e.g. Print Screen on Windows) only report keyup.
      setTested((t) => (t.has(code) ? t : new Set(t).add(code)));
      push("up", e);
    };
    const clearHeld = () => setHeld(new Set());
    window.addEventListener("keydown", onDown, true);
    window.addEventListener("keyup", onUp, true);
    window.addEventListener("blur", clearHeld);
    document.addEventListener("visibilitychange", clearHeld);
    return () => {
      window.removeEventListener("keydown", onDown, true);
      window.removeEventListener("keyup", onUp, true);
      window.removeEventListener("blur", clearHeld);
      document.removeEventListener("visibilitychange", clearHeld);
    };
  }, [active]);

  function reset() {
    setHeld(new Set());
    setTested(new Set());
    setMaxHeld(0);
    setLast(null);
    setLog([]);
  }

  const keys = LAYOUT_KEYS[layout];
  const testedCount = keys.filter((x) => tested.has(x.code)).length;
  const missing = keys.filter((x) => !tested.has(x.code));
  const units = LAYOUT_UNITS[layout];
  const minWidth = layout === "full" ? 760 : 600;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Keyboard layout"
          value={layout}
          onChange={setChoice}
          size="sm"
          options={[
            { value: "full", label: "Full-size" },
            { value: "tkl", label: "TKL" },
            { value: "compact", label: "Laptop" },
          ]}
        />
        <div className="ml-auto flex gap-2">
          {active ? (
            <Button onClick={() => setActive(false)}>
              <Square /> Stop testing
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setActive(true)}>
              <Play /> Start testing
            </Button>
          )}
          <Button variant="ghost" onClick={reset}>
            <RotateCcw /> Reset
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-x-auto rounded-xl border bg-subtle p-3 transition-colors sm:p-4",
          active ? "border-accent ring-4 ring-accent/15" : "border-border",
        )}
        onClick={() => setActive(true)}
      >
        <div className="@container" style={{ minWidth }}>
          <div style={{ "--u": `calc(100cqw / ${units})` } as CSSProperties}>
            <div className="flex">
              <div style={{ width: "calc(var(--u) * 15)" }}>
                <Rows rows={[FN_ROW]} held={held} tested={tested} />
                <div style={{ height: "calc(var(--u) * 0.4)" }} />
                <Rows rows={MAIN} held={held} tested={tested} />
              </div>
              <div style={{ width: "calc(var(--u) * 0.5)" }} />
              <div style={{ width: "calc(var(--u) * 3)" }}>
                <Rows rows={layout === "compact" ? [[3]] : [NAV_FN]} held={held} tested={tested} />
                <div style={{ height: "calc(var(--u) * 0.4)" }} />
                <Rows rows={layout === "compact" ? ARROWS_ONLY : NAV} held={held} tested={tested} />
              </div>
              {layout === "full" && (
                <>
                  <div style={{ width: "calc(var(--u) * 0.5)" }} />
                  <div style={{ width: "calc(var(--u) * 4)" }}>
                    <div style={{ height: "calc(var(--u) * 1.4)" }} />
                    <div className="grid" style={{ gridTemplateColumns: "repeat(4, var(--u))", gridAutoRows: "var(--u)" }}>
                      {NUMPAD.map((x) => (
                        <KeyCap key={x.code} k={x} held={held.has(x.code)} tested={tested.has(x.code)} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {!active && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/60 backdrop-blur-[2px]">
            <Button variant="primary" size="lg" onClick={() => setActive(true)}>
              <KeyboardIcon /> Click to start testing
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-3">
          <div className="flex min-h-28 flex-col justify-center rounded-xl border border-border bg-card p-5" aria-live="polite">
            <p className="text-[13px] font-medium text-muted">Last key pressed</p>
            <p className="mt-1 truncate text-4xl font-semibold tracking-tight text-foreground">
              {last ? (LABELS.get(last.code) ?? (last.key === " " ? "Space" : last.key)) : "—"}
            </p>
            {last && (
              <p className="mt-2 font-mono text-[13px] break-all text-muted">
                key &quot;{last.key}&quot; · code {last.code} · keyCode {last.keyCode} · {LOCATION[last.location] ?? "Standard"}
                {last.mods.length ? ` · ${last.mods.join("+")}` : ""}
                {last.repeat ? " · repeating" : ""}
              </p>
            )}
          </div>
          <Meter
            label={`Keys tested: ${testedCount} of ${keys.length}`}
            value={keys.length ? testedCount / keys.length : 0}
            tone={testedCount === keys.length ? "success" : "accent"}
            valueLabel={`${Math.round((testedCount / keys.length) * 100)}%`}
          />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Keys held now" value={held.size} hint={held.size ? [...held].map((c) => LABELS.get(c) ?? c).join(" + ") : "none"} />
            <Stat label="Most at once" value={maxHeld} hint="hold several keys to test rollover" />
          </div>
          <Button variant="ghost" size="sm" className="justify-self-start" onClick={() => setShowMissing((v) => !v)}>
            {showMissing ? "Hide" : "Show"} keys not tested yet ({missing.length})
          </Button>
          {showMissing && (
            <div className="flex flex-wrap gap-1.5">
              {missing.length ? (
                missing.map((x) => <Badge key={x.code}>{x.label || "Space"}{x.code.startsWith("Numpad") ? " (num)" : x.code.endsWith("Right") ? " (R)" : x.code.endsWith("Left") ? " (L)" : ""}</Badge>)
              ) : (
                <Badge tone="success">Every key works!</Badge>
              )}
            </div>
          )}
        </div>
        <ToolSection
          title="Event log"
          description="Latest 20 key events"
          actions={
            <Button size="sm" variant="ghost" onClick={() => setLog([])} disabled={!log.length}>
              <Eraser /> Clear
            </Button>
          }
        >
          {log.length ? (
            <ol className="grid max-h-64 gap-1 overflow-y-auto font-mono text-[13px]">
              {log.map((e) => (
                <li key={e.id} className="flex justify-between gap-3 rounded-md px-2 py-1 odd:bg-subtle">
                  <span className={e.type === "down" ? "text-accent" : "text-muted"}>{e.type === "down" ? "keydown" : "keyup"}</span>
                  <span className="truncate text-foreground">{e.code}</span>
                  <span className="truncate text-muted">{e.key === " " ? "Space" : e.key}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">Press keys to see their events here.</p>
          )}
        </ToolSection>
      </div>

      <p className="text-[13px] text-muted">
        Some keys are handled by your operating system and never reach the browser, such as Fn, media keys, and some
        Windows-key shortcuts. On phones and tablets, connect a physical keyboard for a full test.
      </p>
    </div>
  );
}
