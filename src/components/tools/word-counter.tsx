"use client";

import { FileText, Trash2 } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Button,
  Card,
  CopyButton,
  EmptyState,
  Meter,
  SegmentedControl,
  Stat,
  Switch,
  Table,
  Textarea,
  ToolSection,
  fmt,
  type Tone,
} from "@/components/ui";
import { countCharacters, countParagraphs, countSentences, splitWords } from "./shared-text/text-utils";

const READING_WPM = 200;
const SPEAKING_WPM = 130;

type LimitId = "none" | "title" | "meta" | "post";

const LIMITS: Record<Exclude<LimitId, "none">, { max: number; name: string; note: string }> = {
  title: { max: 60, name: "Title tag", note: "Search results usually show about 50–60 characters of a page title." },
  meta: { max: 155, name: "Meta description", note: "Google typically shows about 150–160 characters of a description." },
  post: { max: 280, name: "X post", note: "X allows 280 characters per post and counts every link as 23." },
};

const STOP_WORDS = new Set(
  (
    "a about above after again against all also am an and any are aren't as at be because been before being below " +
    "between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each few " +
    "for from further get got had hadn't has hasn't have haven't having he he's her here here's hers herself him " +
    "himself his how how's i i'd i'll i'm i've if in into is isn't it it's its itself just let's me more most mustn't " +
    "my myself no nor not now of off on once only or other our ours ourselves out over own same she she's should " +
    "shouldn't so some such than that that's the their theirs them themselves then there there's these they they'd " +
    "they'll they're they've this those through to too under until up us very was wasn't we we'd we'll we're we've " +
    "were weren't what what's when when's where where's which while who who's whom why why's will with won't would " +
    "wouldn't you you'd you'll you're you've your yours yourself yourselves"
  ).split(" "),
);

/** "45s", "3m", "1m 30s" for a word count at a given words-per-minute pace. */
function duration(words: number, wpm: number) {
  const secs = Math.round((words / wpm) * 60);
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function analyse(text: string) {
  const words = splitWords(text);
  const sentences = countSentences(text);
  // Letters/digits (and inner apostrophes) of each word, lower-cased, for keyword and length stats.
  const terms = words
    .map((w) =>
      (w.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []).join("").replace(/’/g, "'"),
    )
    .filter(Boolean);
  const letters = terms.reduce((n, t) => n + Array.from(t.replace(/'/g, "")).length, 0);
  const counts = new Map<string, number>();
  for (const t of terms) counts.set(t, (counts.get(t) ?? 0) + 1);
  const longest = terms.reduce((best, t) => (Array.from(t).length > Array.from(best).length ? t : best), "");

  return {
    words: words.length,
    characters: countCharacters(text),
    noSpaces: countCharacters(text.replace(/\s/g, "")),
    sentences,
    paragraphs: countParagraphs(text),
    unique: counts.size,
    avgWordLength: terms.length ? letters / terms.length : NaN,
    avgSentenceLength: sentences ? words.length / sentences : NaN,
    longest,
    counts,
  };
}

const SAMPLE =
  "Writing for the web is different from writing for print. Readers scan before they read, so short paragraphs and clear headings help them find what they need.\n\n" +
  "A good meta description sums up the page in one or two sentences. Keep it under about 155 characters so search engines show it in full, and make every word count.";

export default function WordCounter() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState<LimitId>("none");
  const [hideCommon, setHideCommon] = useState(true);

  const deferred = useDeferredValue(text);
  const stats = useMemo(() => analyse(deferred), [deferred]);

  const keywords = useMemo(() => {
    return [...stats.counts]
      .filter(([w]) => !/^\p{N}+$/u.test(w) && (!hideCommon || (!STOP_WORDS.has(w) && Array.from(w).length > 1)))
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
      .slice(0, 10);
  }, [stats.counts, hideCommon]);
  const topCount = keywords[0]?.[1] ?? 1;

  const active = limit === "none" ? null : LIMITS[limit];
  const used = stats.characters;
  const ratio = active ? used / active.max : 0;
  const limitTone: Tone = ratio > 1 ? "danger" : ratio > 0.9 ? "warning" : "success";
  const left = active ? active.max - used : 0;

  const details: [string, string][] = [
    ["Characters (no spaces)", fmt(stats.noSpaces, 0)],
    ["Paragraphs", fmt(stats.paragraphs, 0)],
    ["Unique words", fmt(stats.unique, 0)],
    ["Speaking time", `${duration(stats.words, SPEAKING_WPM)} at ${SPEAKING_WPM} wpm`],
    ["Average word length", Number.isFinite(stats.avgWordLength) ? `${fmt(stats.avgWordLength, 1)} characters` : "—"],
    [
      "Average sentence length",
      Number.isFinite(stats.avgSentenceLength) ? `${fmt(stats.avgSentenceLength, 1)} words` : "—",
    ],
    ["Longest word", stats.longest || "—"],
  ];

  const summary = stats.words
    ? [
        `Words: ${fmt(stats.words, 0)}`,
        `Characters: ${fmt(stats.characters, 0)}`,
        `Sentences: ${fmt(stats.sentences, 0)}`,
        `Reading time: ${duration(stats.words, READING_WPM)}`,
        ...details.map(([k, v]) => `${k}: ${v}`),
      ].join("\n")
    : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-auto">
            <SegmentedControl
              label="Character limit"
              value={limit}
              onChange={setLimit}
              size="sm"
              fullWidth
              options={[
                { value: "none", label: "No limit" },
                { value: "title", label: <>Title<span className="hidden sm:inline">&nbsp;60</span></> },
                { value: "meta", label: <>Meta<span className="hidden sm:inline">&nbsp;155</span></> },
                { value: "post", label: <>X post<span className="hidden sm:inline">&nbsp;280</span></> },
              ]}
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <CopyButton text={text} size="sm" variant="ghost" />
            <Button size="sm" variant="ghost" onClick={() => setText("")} disabled={!text}>
              <Trash2 aria-hidden /> Clear
            </Button>
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here…"
          aria-label="Text to count"
          className="min-h-56 sm:min-h-72"
        />

        {active && (
          <div className="flex flex-col gap-1.5">
            <Meter
              label={`${active.name}: ${fmt(used, 0)} / ${active.max} characters`}
              value={Math.min(ratio, 1)}
              tone={limitTone}
              valueLabel={left >= 0 ? `${fmt(left, 0)} left` : `${fmt(-left, 0)} over`}
            />
            <p className="text-[13px] text-muted">{active.note}</p>
          </div>
        )}
      </div>

      <section aria-label="Text statistics" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat highlight label="Words" value={fmt(stats.words, 0)} />
        <Stat label="Characters" value={fmt(stats.characters, 0)} hint="including spaces" />
        <Stat label="Sentences" value={fmt(stats.sentences, 0)} />
        <Stat label="Reading time" value={duration(stats.words, READING_WPM)} hint={`at ${READING_WPM} wpm`} />
      </section>

      <div className="grid items-start gap-6 md:grid-cols-2">
        <ToolSection
          title="Details"
          actions={
            <div className="flex min-h-9 items-center">
              <CopyButton text={summary} label="Copy stats" size="sm" variant="ghost" />
            </div>
          }
        >
          <Card padded={false}>
            <dl className="divide-y divide-border">
              {details.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="shrink-0 text-muted">{label}</dt>
                  <dd className="min-w-0 text-right font-medium break-all text-foreground tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </ToolSection>

        <ToolSection
          title="Keyword density"
          actions={<Switch checked={hideCommon} onChange={setHideCommon} label="Hide common words" />}
        >
          {keywords.length ? (
            <Table label="Most frequent keywords">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th className="num">Count</th>
                  <th className="num">Density</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map(([word, count]) => (
                  <tr key={word}>
                    <td className="max-w-40 truncate font-medium">{word}</td>
                    <td className="num">{fmt(count, 0)}</td>
                    <td className="num">
                      <span className="inline-flex items-center justify-end gap-2">
                        <span aria-hidden className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-subtle sm:block">
                          <span
                            className="block h-full rounded-full bg-accent"
                            style={{ width: `${(count / topCount) * 100}%` }}
                          />
                        </span>
                        {fmt((count / stats.words) * 100, 1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              icon={<FileText />}
              title={stats.words ? "No keywords yet" : "Keywords appear as you type"}
              description={
                stats.words
                  ? "Only common words so far. Turn off “Hide common words” to see them."
                  : "See which words you use most and how often, as a share of all words."
              }
              action={
                !text && (
                  <Button variant="soft" size="sm" onClick={() => setText(SAMPLE)}>
                    Try a sample
                  </Button>
                )
              }
              className="py-8"
            />
          )}
        </ToolSection>
      </div>
    </div>
  );
}
