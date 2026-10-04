"use client";

import { ArrowDown, ArrowUp, CircleAlert, Combine, FileText, GripVertical, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Callout, ResultCard, ToolSection, cn } from "@/components/ui";
import { Dropzone, PrivacyNote } from "./shared-media/dropzone";
import { downloadBlob, formatBytes, nextId } from "./shared-media/files";

type Item = { id: string; file: File; pages?: number; error?: string };

async function inspect(file: File): Promise<{ pages?: number; error?: string }> {
  try {
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    if (doc.isEncrypted) return { error: "This PDF is password-protected. Remove the password first." };
    return { pages: doc.getPageCount() };
  } catch {
    return { error: "This file isn't a valid PDF or is damaged." };
  }
}

export default function PdfMerge() {
  const [items, setItems] = useState<Item[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; pages: number } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  async function addFiles(files: File[]) {
    const pdfs = files.filter((f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name));
    const rejected = files.length - pdfs.length;
    setFailure(rejected ? `${rejected} file${rejected === 1 ? " isn't a PDF" : "s aren't PDFs"} and ${rejected === 1 ? "was" : "were"} skipped.` : null);
    setOutput(null);
    const added = pdfs.map((file) => ({ id: nextId("pdf"), file }));
    setItems((list) => [...list, ...added]);
    for (const item of added) {
      const info = await inspect(item.file);
      setItems((list) => list.map((x) => (x.id === item.id ? { ...x, ...info } : x)));
    }
  }

  function move(id: string, delta: number) {
    setOutput(null);
    setItems((list) => {
      const i = list.findIndex((x) => x.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setOutput(null);
    setItems((list) => {
      const from = list.findIndex((x) => x.id === dragId);
      const to = list.findIndex((x) => x.id === targetId);
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  const usable = items.filter((i) => i.pages);
  const totalPages = usable.reduce((n, i) => n + (i.pages ?? 0), 0);
  const pending = items.some((i) => i.pages === undefined && !i.error);

  async function merge() {
    setFailure(null);
    setOutput(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (let k = 0; k < usable.length; k++) {
        setProgress(`Adding file ${k + 1} of ${usable.length}…`);
        const src = await PDFDocument.load(await usable[k].file.arrayBuffer(), { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setProgress("Saving…");
      const bytes = await merged.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setOutput({ blob, pages: merged.getPageCount() });
      downloadBlob(blob, "merged.pdf");
    } catch {
      setFailure("Merging failed. One of the files may be damaged; remove it and try again.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="grid gap-6">
      {items.length === 0 ? (
        <div className="grid gap-3">
          <Dropzone
            onFiles={addFiles}
            accept="application/pdf,.pdf"
            title="Drop PDF files here"
            description="Add two or more PDFs, then put them in order"
            buttonLabel="Choose PDF files"
            icon={<FileText />}
          />
          <PrivacyNote />
        </div>
      ) : (
        <Dropzone onFiles={addFiles} accept="application/pdf,.pdf" title="Add more PDFs" buttonLabel="Add PDFs" compact />
      )}

      {failure && (
        <Callout tone="danger" icon={<CircleAlert />}>
          {failure}
        </Callout>
      )}

      {items.length > 0 && (
        <ToolSection
          title="Files to merge"
          description="Drag to reorder, or use the arrows. Pages are combined top to bottom."
          actions={
            <Button size="sm" variant="ghost" onClick={() => { setItems([]); setOutput(null); }} disabled={!!progress}>
              Clear all
            </Button>
          }
        >
          <ol className="grid gap-2">
            {items.map((item, i) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropOn(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow",
                  dragId === item.id && "opacity-60 shadow-lg",
                )}
              >
                <GripVertical aria-hidden className="size-4 shrink-0 cursor-grab text-faint" />
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                  <p className="text-[13px] text-muted">
                    {formatBytes(item.file.size)}
                    {item.pages !== undefined && ` · ${item.pages} page${item.pages === 1 ? "" : "s"}`}
                    {item.pages === undefined && !item.error && " · reading…"}
                  </p>
                  {item.error && <p className="mt-1 text-[13px] text-danger">{item.error}</p>}
                </div>
                {item.error && <Badge tone="danger">Skipped</Badge>}
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={`Move ${item.file.name} up`} onClick={() => move(item.id, -1)} disabled={i === 0}>
                    <ArrowUp />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Move ${item.file.name} down`} onClick={() => move(item.id, 1)} disabled={i === items.length - 1}>
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${item.file.name}`}
                    onClick={() => { setItems((list) => list.filter((x) => x.id !== item.id)); setOutput(null); }}
                  >
                    <X />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" onClick={merge} disabled={usable.length < 2 || pending || !!progress}>
              {progress ? <LoaderCircle className="animate-spin" /> : <Combine />}
              {progress ?? `Merge ${usable.length} PDFs`}
            </Button>
            {usable.length < 2 && <span className="text-sm text-muted">Add at least two PDFs to merge.</span>}
          </div>
        </ToolSection>
      )}

      {output && (
        <ResultCard
          label="Merged PDF ready"
          value={`${output.pages} pages`}
          size="md"
          caption={`${formatBytes(output.blob.size)} · the download started automatically`}
        >
          <Button className="mt-3" onClick={() => downloadBlob(output.blob, "merged.pdf")}>
            Download again
          </Button>
        </ResultCard>
      )}
      {!output && totalPages > 0 && (
        <p className="text-sm text-muted">The merged file will have {totalPages} pages.</p>
      )}
    </div>
  );
}
