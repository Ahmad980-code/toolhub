"use client";

import { CircleAlert, Download, FileText, LoaderCircle, Scissors, X } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Callout,
  Field,
  Input,
  NumberInput,
  SegmentedControl,
  ToolSection,
  num,
} from "@/components/ui";
import { Dropzone, PrivacyNote } from "./shared-media/dropzone";
import { baseName, downloadBlob, downloadSequentially, formatBytes } from "./shared-media/files";

type Mode = "extract" | "each" | "chunks";
type Part = { name: string; pages: number[] }; // 0-based page indexes
type Output = { name: string; blob: Blob; pages: number };

/** "1-3, 5, 8-10" -> [0,1,2,4,7,8,9] (in the order typed, no repeats). */
export function parseRanges(input: string, count: number): { pages: number[] } | { error: string } {
  const tokens = input.split(/[,;\s]+/).filter(Boolean);
  if (!tokens.length) return { error: "Enter the pages to extract, e.g. 1-3, 5" };
  const out: number[] = [];
  const seen = new Set<number>();
  for (const t of tokens) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(t);
    if (!m) return { error: `"${t}" isn't a page number or range` };
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (a < 1 || b < 1) return { error: "Pages start at 1" };
    if (a > count || b > count) return { error: `This PDF has ${count} page${count === 1 ? "" : "s"}` };
    if (b < a) return { error: `"${t}" goes backwards; write it as ${b}-${a}` };
    for (let p = a; p <= b; p++) {
      if (!seen.has(p)) {
        seen.add(p);
        out.push(p - 1);
      }
    }
  }
  return { pages: out };
}

function rangeLabel(pages: number[]) {
  // Compact "1-3,5" for file names, from 0-based indexes.
  const parts: string[] = [];
  let i = 0;
  while (i < pages.length) {
    let j = i;
    while (j + 1 < pages.length && pages[j + 1] === pages[j] + 1) j++;
    parts.push(i === j ? `${pages[i] + 1}` : `${pages[i] + 1}-${pages[j] + 1}`);
    i = j + 1;
  }
  return parts.join(",");
}

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("extract");
  const [ranges, setRanges] = useState("1-2");
  const [chunk, setChunk] = useState("2");
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [progress, setProgress] = useState<string | null>(null);

  async function pick(files: File[]) {
    const f = files.find((x) => x.type === "application/pdf" || /\.pdf$/i.test(x.name));
    setOutputs([]);
    if (!f) {
      setLoadError("Please choose a PDF file.");
      return;
    }
    setFile(f);
    setLoadError(null);
    setCount(0);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      if (doc.isEncrypted) {
        setLoadError("This PDF is password-protected. Remove the password first.");
        return;
      }
      const n = doc.getPageCount();
      setCount(n);
      setRanges(n >= 2 ? `1-${Math.min(2, n)}` : "1");
    } catch {
      setLoadError("This file isn't a valid PDF or is damaged.");
    }
  }

  const base = file ? baseName(file.name) : "document";
  let parts: Part[] = [];
  let planError: string | undefined;
  if (count > 0) {
    if (mode === "extract") {
      const r = parseRanges(ranges, count);
      if ("error" in r) planError = r.error;
      else parts = [{ name: `${base}-pages-${rangeLabel(r.pages)}.pdf`, pages: r.pages }];
    } else if (mode === "each") {
      parts = Array.from({ length: count }, (_, i) => ({ name: `${base}-page-${i + 1}.pdf`, pages: [i] }));
    } else {
      const n = Math.floor(num(chunk));
      if (!(n >= 1)) planError = "Enter 1 or more pages per file";
      else
        for (let s = 0; s < count; s += n) {
          const pages = Array.from({ length: Math.min(n, count - s) }, (_, k) => s + k);
          parts.push({ name: `${base}-pages-${rangeLabel(pages)}.pdf`, pages });
        }
    }
  }

  async function split() {
    if (!file || !parts.length) return;
    setOutputs([]);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const results: Output[] = [];
      for (let k = 0; k < parts.length; k++) {
        setProgress(`Creating file ${k + 1} of ${parts.length}…`);
        const doc = await PDFDocument.create();
        const copied = await doc.copyPages(src, parts[k].pages);
        copied.forEach((p) => doc.addPage(p));
        const bytes = await doc.save();
        results.push({ name: parts[k].name, blob: new Blob([bytes as BlobPart], { type: "application/pdf" }), pages: parts[k].pages.length });
      }
      setOutputs(results);
      if (results.length === 1) downloadBlob(results[0].blob, results[0].name);
    } catch {
      setLoadError("Splitting failed. The PDF may be damaged.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="grid gap-6">
      {!file ? (
        <div className="grid gap-3">
          <Dropzone
            onFiles={pick}
            accept="application/pdf,.pdf"
            multiple={false}
            title="Drop a PDF here"
            description="Extract pages or split it into several files"
            buttonLabel="Choose a PDF"
            icon={<FileText />}
          />
          <PrivacyNote />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 pl-4">
          <FileText aria-hidden className="size-5 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-[13px] text-muted">
              {formatBytes(file.size)}
              {count > 0 ? ` · ${count} page${count === 1 ? "" : "s"}` : loadError ? "" : " · reading…"}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Choose another PDF" onClick={() => { setFile(null); setOutputs([]); setLoadError(null); }}>
            <X />
          </Button>
        </div>
      )}

      {loadError && (
        <Callout tone="danger" icon={<CircleAlert />}>
          {loadError}
        </Callout>
      )}

      {count > 0 && (
        <div className="grid gap-5 rounded-xl border border-border bg-card p-4 sm:p-5">
          <Field label="How do you want to split it?" as="group">
            <SegmentedControl
              label="Split mode"
              value={mode}
              onChange={(m) => { setMode(m); setOutputs([]); }}
              fullWidth
              options={[
                { value: "extract", label: "Extract pages" },
                { value: "each", label: "Every page" },
                { value: "chunks", label: "Every N pages" },
              ]}
            />
          </Field>
          {mode === "extract" && (
            <Field label="Pages to extract" hint={`Pages 1–${count}. Use commas and ranges, e.g. 1-3, 5, 8-10`} error={planError}>
              <Input value={ranges} onChange={(e) => { setRanges(e.target.value); setOutputs([]); }} invalid={!!planError} placeholder="1-3, 5" spellCheck={false} />
            </Field>
          )}
          {mode === "chunks" && (
            <Field label="Pages per file" error={planError}>
              <NumberInput value={chunk} onChange={(v) => { setChunk(v); setOutputs([]); }} min={1} max={count} suffix="pages" inputMode="numeric" className="sm:max-w-48" />
            </Field>
          )}
          {!planError && parts.length > 0 && (
            <p className="text-sm text-muted">
              {parts.length === 1
                ? `Creates 1 PDF with ${parts[0].pages.length} page${parts[0].pages.length === 1 ? "" : "s"} (${rangeLabel(parts[0].pages)}).`
                : `Creates ${parts.length} PDF files.`}
            </p>
          )}
          <div>
            <Button variant="primary" size="lg" onClick={split} disabled={!!planError || !parts.length || !!progress}>
              {progress ? <LoaderCircle className="animate-spin" /> : <Scissors />}
              {progress ?? (parts.length > 1 ? `Split into ${parts.length} files` : "Extract pages")}
            </Button>
          </div>
        </div>
      )}

      {outputs.length > 0 && (
        <ToolSection
          title="Your files"
          description={outputs.length === 1 ? "The download started automatically." : "Download them one by one or all at once."}
          actions={
            outputs.length > 1 ? (
              <Button size="sm" onClick={() => downloadSequentially(outputs.map((o) => ({ blob: o.blob, filename: o.name })))}>
                <Download /> Download all
              </Button>
            ) : undefined
          }
        >
          <ul className="grid gap-2">
            {outputs.map((o) => (
              <li key={o.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 pl-4">
                <FileText aria-hidden className="size-5 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{o.name}</p>
                  <p className="text-[13px] text-muted">
                    {o.pages} page{o.pages === 1 ? "" : "s"} · {formatBytes(o.blob.size)}
                  </p>
                </div>
                <Button size="sm" onClick={() => downloadBlob(o.blob, o.name)}>
                  <Download /> Download
                </Button>
              </li>
            ))}
          </ul>
        </ToolSection>
      )}
    </div>
  );
}
