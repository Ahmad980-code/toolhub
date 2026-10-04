"use client";

import { ArrowRight, CircleAlert, Download, ImagePlus, Info, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Callout,
  Field,
  NumberInput,
  ResultCard,
  SegmentedControl,
  Slider,
  Stat,
  ToolLayout,
  ToolSection,
  cn,
  fmt,
  num,
} from "@/components/ui";
import { BlobImage, Dropzone, PrivacyNote } from "./shared-media/dropzone";
import {
  baseName,
  downloadBlob,
  downloadSequentially,
  formatBytes,
  listNames,
  matchesAccept,
  nextId,
  percentSaved,
  plural,
  uniqueNames,
} from "./shared-media/files";
import { useDebounced, useWebpEncodeSupport } from "./shared-media/hooks";
import {
  OUTPUT_EXT,
  OUTPUT_LABEL,
  decodeImage,
  encodeImage,
  fitWithin,
  formatLabel,
  sameOutputType,
  type OutputType,
} from "./shared-media/image-codec";

type Format = "same" | "image/jpeg" | "image/webp";
type Settings = { quality: number; format: Format; maxW: number | null; maxH: number | null };

type Result = {
  blob: Blob;
  filename: string;
  /** Format of the file offered for download. */
  type: OutputType;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  /** The re-encoded file was not smaller, so the original is offered instead. */
  kept: boolean;
  /** Format and size the re-encoded file had (shown when the original is kept). */
  encodedType: OutputType;
  encodedSize: number;
};

type Item = {
  id: string;
  file: File;
  /** Settings key the current result/error was produced with. */
  key?: string;
  result?: Result;
  error?: string;
};

const ACCEPT = ["image/jpeg", "image/png", "image/webp", ".jpg", ".jpeg", ".jfif", ".png", ".webp"];

async function compress(file: File, s: Settings): Promise<Result> {
  const img = await decodeImage(file);
  try {
    const { width, height } = fitWithin(img.width, img.height, s.maxW ?? NaN, s.maxH ?? NaN);
    const original = sameOutputType(file) ?? "image/jpeg";
    const type: OutputType = s.format === "same" ? original : s.format;
    const blob = await encodeImage(img, {
      width,
      height,
      type,
      quality: s.quality / 100,
      // JPG has no transparency: paint transparent pixels white instead of black.
      background: type === "image/jpeg" ? "white" : undefined,
    });
    const resized = width !== img.width || height !== img.height;
    const kept = !resized && blob.size >= file.size;
    return {
      blob: kept ? file : blob,
      filename: kept ? file.name : `${baseName(file.name)}-compressed.${OUTPUT_EXT[type]}`,
      type: kept ? original : type,
      width,
      height,
      originalWidth: img.width,
      originalHeight: img.height,
      kept,
      encodedType: type,
      encodedSize: blob.size,
    };
  } finally {
    img.close();
  }
}

const isPending = (item: Item, liveKey: string) => !item.error && (item.key !== liveKey || !item.result);

export default function ImageCompressor() {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<Format>("same");
  const [maxW, setMaxW] = useState("");
  const [maxH, setMaxH] = useState("");
  const [skipped, setSkipped] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const webpOk = useWebpEncodeSupport();

  const wNum = num(maxW);
  const hNum = num(maxH);
  const wError = maxW !== "" && !(wNum >= 1) ? "Enter 1 px or more" : undefined;
  const hError = maxH !== "" && !(hNum >= 1) ? "Enter 1 px or more" : undefined;
  const settings: Settings = {
    quality,
    format: format === "image/webp" && !webpOk ? "same" : format,
    maxW: maxW === "" || wError ? null : Math.round(wNum),
    maxH: maxH === "" || hError ? null : Math.round(hNum),
  };
  const liveKey = JSON.stringify(settings);
  const key = useDebounced(liveKey, 300);

  // Compress one image at a time; each finished image re-runs this effect for the next one.
  // Results are tagged with the settings key they were made with, so a settings change
  // simply makes every image "stale" and the queue re-compresses them.
  const busy = useRef(false);
  useEffect(() => {
    if (busy.current) return;
    const next = items.find((i) => i.key !== key);
    if (!next) return;
    busy.current = true;
    compress(next.file, JSON.parse(key) as Settings).then(
      (result) => {
        busy.current = false;
        setItems((prev) => prev.map((p) => (p.id === next.id ? { ...p, key, result, error: undefined } : p)));
      },
      (err: unknown) => {
        busy.current = false;
        const error = err instanceof Error && err.message ? err.message : "This image couldn't be compressed.";
        setItems((prev) => prev.map((p) => (p.id === next.id ? { ...p, key, result: undefined, error } : p)));
      },
    );
  }, [items, key]);

  const addFiles = useCallback((files: File[]) => {
    setSkipped(files.filter((f) => !matchesAccept(f, ACCEPT)).map((f) => f.name));
    const ok = files.filter((f) => matchesAccept(f, ACCEPT));
    if (ok.length) setItems((prev) => [...prev, ...ok.map((file) => ({ id: nextId("img"), file }))]);
  }, []);

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clearAll = () => {
    setItems([]);
    setSkipped([]);
  };

  const done = items.filter((i) => i.result);
  const pending = items.some((i) => isPending(i, liveKey));
  const before = done.reduce((s, i) => s + i.file.size, 0);
  const after = done.reduce((s, i) => s + (i.result?.blob.size ?? 0), 0);
  const saved = percentSaved(before, after);
  const hasPng = items.some((i) => formatLabel(i.file) === "PNG");

  async function downloadAll() {
    const ready = done.map((i) => i.result!);
    const names = uniqueNames(ready.map((r) => r.filename));
    setDownloading(true);
    try {
      await downloadSequentially(ready.map((r, i) => ({ blob: r.blob, filename: names[i] })));
    } finally {
      setDownloading(false);
    }
  }

  const formatHint =
    format === "same"
      ? "Keeps each image's format: JPG stays JPG, PNG stays PNG."
      : format === "image/jpeg"
        ? "JPG has no transparency, so transparent areas turn white."
        : "WebP works in all modern browsers and keeps transparency.";

  return (
    <div className="flex flex-col gap-8">
      <ToolLayout
        inputs={
          <>
            <div className="flex flex-col gap-3">
              <Dropzone
                onFiles={addFiles}
                accept={ACCEPT.join(",")}
                multiple
                pasteable
                compact={items.length > 0}
                icon={<ImagePlus />}
                title={items.length ? "Add more images" : "Drop images here"}
                description={items.length ? "JPG, PNG or WebP" : "JPG, PNG or WebP, as many as you like. You can also paste."}
                buttonLabel={items.length ? "Add images" : "Choose images"}
              />
              {skipped.length > 0 && (
                <Callout tone="warning" icon={<CircleAlert />} title={`Skipped ${plural(skipped.length, "file")}`}>
                  {listNames(skipped)}: only JPG, PNG and WebP images can be compressed. For other formats, use the{" "}
                  <Link href="/tools/image-converter" className="font-medium text-accent underline-offset-2 hover:underline">
                    Image Converter
                  </Link>
                  .
                </Callout>
              )}
              <PrivacyNote />
            </div>

            <Field
              label="Quality"
              aside={`${quality}%`}
              hint="Lower means smaller files. 70–80% looks the same as the original for most photos."
            >
              <Slider value={quality} onChange={setQuality} min={10} max={100} step={5} />
            </Field>

            <Field label="Output format" as="group" hint={formatHint}>
              <SegmentedControl
                label="Output format"
                value={format}
                onChange={setFormat}
                fullWidth
                options={[
                  { value: "same", label: "Original" },
                  { value: "image/jpeg", label: "JPG" },
                  { value: "image/webp", label: "WebP", disabled: !webpOk },
                ]}
              />
            </Field>

            {hasPng && format !== "image/webp" && webpOk && (
              <Callout tone="accent" icon={<Info />}>
                PNG is lossless, so the quality slider barely changes PNG files. WebP keeps transparency and is usually
                much smaller.{" "}
                <button
                  type="button"
                  onClick={() => setFormat("image/webp")}
                  className="inline-flex min-h-11 items-center rounded-sm font-medium text-accent underline-offset-2 hover:underline sm:min-h-0"
                >
                  Switch to WebP
                </button>
              </Callout>
            )}

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Max width" error={wError}>
                  <NumberInput value={maxW} onChange={setMaxW} suffix="px" placeholder="Any" min={1} step={1} inputMode="numeric" invalid={!!wError} />
                </Field>
                <Field label="Max height" error={hError}>
                  <NumberInput value={maxH} onChange={setMaxH} suffix="px" placeholder="Any" min={1} step={1} inputMode="numeric" invalid={!!hError} />
                </Field>
              </div>
              <p className="text-[13px] leading-5 text-muted">
                Optional. Larger images are scaled down to fit, keeping their proportions. Smaller ones are never enlarged.
              </p>
            </div>
          </>
        }
        results={
          <>
            <ResultCard
              label="Total saved"
              value={done.length ? `${fmt(Math.max(0, saved), saved < 10 ? 1 : 0)}%` : ""}
              placeholder={items.length ? "Working…" : "Add images to start"}
              caption={
                done.length
                  ? `${formatBytes(before)} → ${formatBytes(after)} across ${plural(done.length, "image")}`
                  : "Your total saving appears here"
              }
            />
            {done.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Original" value={formatBytes(before)} />
                <Stat label="Compressed" value={formatBytes(after)} tone={after < before ? "success" : undefined} />
              </div>
            )}
            {items.length > 0 && (
              <Button variant="primary" size="lg" fullWidth onClick={downloadAll} disabled={!done.length || pending || downloading}>
                {pending ? <LoaderCircle aria-hidden className="animate-spin" /> : <Download aria-hidden />}
                {pending ? "Compressing…" : done.length > 1 ? `Download all (${done.length})` : "Download"}
              </Button>
            )}
            {done.length > 1 && (
              <p className="text-center text-[13px] text-muted">
                Files download one by one. Your browser may ask you to allow multiple downloads.
              </p>
            )}
          </>
        }
      />

      {items.length > 0 && (
        <ToolSection
          title="Your images"
          description={`${plural(items.length, "image")} · ${format === "same" ? "original formats" : `saving as ${OUTPUT_LABEL[format]}`}`}
          actions={
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          }
        >
          <ul className="grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <ImageRow key={item.id} item={item} pending={isPending(item, liveKey)} onRemove={() => remove(item.id)} />
            ))}
          </ul>
        </ToolSection>
      )}
    </div>
  );
}

function dims(w: number, h: number) {
  return `${fmt(w, 0)}×${fmt(h, 0)}`;
}

function ImageRow({ item, pending, onRemove }: { item: Item; pending: boolean; onRemove: () => void }) {
  const { file, result, error } = item;
  const pct = result ? percentSaved(file.size, result.blob.size) : 0;
  const resized = !!result && (result.width !== result.originalWidth || result.height !== result.originalHeight);

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs" aria-busy={pending}>
      <BlobImage blob={file} alt="" className="size-14 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={file.name}>
          {file.name}
        </p>
        {error ? (
          <p className="mt-0.5 text-[13px] leading-5 text-danger">{error}</p>
        ) : (
          <>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted tabular-nums">
              <span>{formatBytes(file.size)}</span>
              {result && (
                <>
                  <ArrowRight aria-label="to" className="size-3.5 text-faint" />
                  <span className={cn("font-medium", pending ? "text-muted" : "text-foreground")}>
                    {formatBytes(result.blob.size)}
                  </span>
                </>
              )}
              {pending ? (
                <span className="ml-1 inline-flex items-center gap-1">
                  <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> Compressing…
                </span>
              ) : result?.kept ? (
                <Badge className="ml-1">Kept original</Badge>
              ) : result ? (
                <Badge tone={pct > 0 ? "success" : "warning"} className="ml-1">
                  {pct > 0 ? `−${fmt(pct, pct < 10 ? 1 : 0)}%` : `+${fmt(-pct, 0)}%`}
                </Badge>
              ) : null}
            </div>
            {result && !pending && (
              <p className="mt-0.5 text-[13px] leading-5 text-muted">
                {result.kept
                  ? `Already well compressed: a ${OUTPUT_LABEL[result.encodedType]} copy would be ${formatBytes(result.encodedSize)}.`
                  : `${formatLabel(file)} → ${OUTPUT_LABEL[result.type]} · ${
                      resized ? `${dims(result.originalWidth, result.originalHeight)} → ${dims(result.width, result.height)}` : dims(result.width, result.height)
                    }`}
              </p>
            )}
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          aria-label={`Download ${result?.filename ?? file.name}`}
          title="Download"
          disabled={!result || pending}
          onClick={() => result && downloadBlob(result.blob, result.filename)}
        >
          <Download />
        </Button>
        <Button size="icon" variant="ghost" aria-label={`Remove ${file.name}`} title="Remove" onClick={onRemove}>
          <X />
        </Button>
      </div>
    </li>
  );
}
