"use client";

import { Check, Trash2, Undo2 } from "lucide-react";
import { useId, useState } from "react";
import { Button, CopyButton, Textarea, ToolSection, cn, focusRing } from "@/components/ui";
import { PaneHeader } from "./shared-text/pane-header";
import { countCharacters, countWords, plural } from "./shared-text/text-utils";

/** Splits text into words for programming styles: "XMLHttpRequest id" -> XML, Http, Request, id. */
function identifierWords(s: string) {
  return s
    .replace(/['’]/g, "")
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

/** Applies an identifier style line by line, so a list of names stays a list. */
const perLine = (join: (words: string[]) => string) => (s: string) =>
  s
    .split("\n")
    .map((line) => join(identifierWords(line)))
    .join("\n");

function titleCase(s: string) {
  // Capitalise the first letter of every word; an apostrophe only opens a word after a space (so "don't" stays).
  return s.toLowerCase().replace(/(^|[\s\-(\[{"“‘/]|(?:^|\s)')(\p{L})/gu, (_, p, c) => p + c.toUpperCase());
}

function sentenceCase(s: string) {
  const open = "[\"'\\u201c\\u2018(\\[]*";
  const start = new RegExp(`(^\\s*${open}|[.!?\\u2026]["'\\u201d\\u2019)\\]]*\\s+${open}|\\n\\s*${open})(\\p{L})`, "gu");
  return s
    .toLowerCase()
    .replace(start, (_, p, c) => p + c.toUpperCase())
    .replace(/(^|[^\p{L}\p{N}'’])i(?=$|[^\p{L}\p{N}])/gu, "$1I");
}

function alternating(s: string) {
  let i = 0;
  return Array.from(s)
    .map((ch) => {
      if (ch.toLowerCase() === ch.toUpperCase()) return ch;
      return i++ % 2 ? ch.toUpperCase() : ch.toLowerCase();
    })
    .join("");
}

function inverse(s: string) {
  return Array.from(s)
    .map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()))
    .join("");
}

type Conversion = { id: string; label: string; fn: (s: string) => string };

const CONVERSIONS: Conversion[] = [
  { id: "sentence", label: "Sentence case", fn: sentenceCase },
  { id: "lower", label: "lower case", fn: (s) => s.toLowerCase() },
  { id: "upper", label: "UPPER CASE", fn: (s) => s.toUpperCase() },
  { id: "title", label: "Title Case", fn: titleCase },
  { id: "camel", label: "camelCase", fn: perLine((w) => w.map((x, i) => (i ? cap(x) : x.toLowerCase())).join("")) },
  { id: "pascal", label: "PascalCase", fn: perLine((w) => w.map(cap).join("")) },
  { id: "snake", label: "snake_case", fn: perLine((w) => w.map((x) => x.toLowerCase()).join("_")) },
  { id: "kebab", label: "kebab-case", fn: perLine((w) => w.map((x) => x.toLowerCase()).join("-")) },
  { id: "constant", label: "CONSTANT_CASE", fn: perLine((w) => w.map((x) => x.toUpperCase()).join("_")) },
  { id: "dot", label: "dot.case", fn: perLine((w) => w.map((x) => x.toLowerCase()).join(".")) },
  { id: "alternating", label: "aLtErNaTiNg cAsE", fn: alternating },
  { id: "inverse", label: "iNVERSE cASE", fn: inverse },
];

const EXAMPLE = "the quick brown fox jumps";

export default function CaseConverter() {
  const id = useId();
  const [text, setText] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Previews only need the first line or so; keeps typing fast on very long text.
  const sample = text ? text.slice(0, 160).split("\n").find((l) => l.trim()) ?? "" : EXAMPLE;

  function apply(c: Conversion) {
    const next = c.fn(text);
    if (next !== text) setHistory((h) => [...h.slice(-19), text]);
    setText(next);
    setApplied(c.id);
  }

  function undo() {
    const prev = history[history.length - 1];
    if (prev === undefined) return;
    setHistory((h) => h.slice(0, -1));
    setText(prev);
    setApplied(null);
  }

  function clear() {
    if (text) setHistory((h) => [...h.slice(-19), text]);
    setText("");
    setApplied(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PaneHeader
          label="Your text"
          htmlFor={id}
          meta={text ? `${plural(countWords(text), "word")} · ${plural(countCharacters(text), "character")}` : undefined}
          actions={
            <>
              <Button size="sm" variant="ghost" onClick={undo} disabled={!history.length}>
                <Undo2 aria-hidden /> Undo
              </Button>
              <Button size="sm" variant="ghost" onClick={clear} disabled={!text}>
                <Trash2 aria-hidden /> Clear
              </Button>
              <CopyButton text={text} size="sm" />
            </>
          }
        />
        <Textarea
          id={id}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setApplied(null);
          }}
          placeholder="Type or paste your text, then pick a case below…"
          className="min-h-44 sm:min-h-56"
        />
      </div>

      <ToolSection
        title="Convert to"
        description={text ? "Click a style to convert your text. Undo restores the previous version." : "Add some text above, then click a style."}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {CONVERSIONS.map((c) => {
            const on = applied === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => apply(c)}
                disabled={!text}
                aria-pressed={on}
                className={cn(
                  "flex min-h-16 min-w-0 flex-col items-start justify-center gap-1 rounded-xl border px-3.5 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 active:scale-[0.99] disabled:cursor-not-allowed",
                  focusRing,
                  on
                    ? "border-accent/40 bg-accent-soft"
                    : "border-border bg-card shadow-xs enabled:hover:border-border-hover enabled:hover:bg-subtle",
                )}
              >
                <span className="flex w-full min-w-0 items-center justify-between gap-2 text-sm font-medium text-foreground">
                  <span className="truncate">{c.label}</span>
                  {on && <Check aria-hidden className="size-4 shrink-0 text-accent" />}
                </span>
                <span
                  aria-hidden
                  className={cn("w-full truncate font-mono text-[12px] leading-5", text ? "text-muted" : "text-faint")}
                >
                  {c.fn(sample) || " "}
                </span>
              </button>
            );
          })}
        </div>
      </ToolSection>
    </div>
  );
}
