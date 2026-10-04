"use client";

import { CircleAlert, Download, ImagePlus, LoaderCircle, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import {
  Badge,
  Button,
  Callout,
  Checkbox,
  Field,
  NumberInput,
  SegmentedControl,
  Slider,
  ToolSection,
  num,
} from "@/components/ui";
import { BlobImage, Dropzone, PrivacyNote } from "./shared-media/dropzone";
import { baseName, downloadBlob, downloadSequentially, formatBytes, nextId, uniqueNames } from "./shared-media/files";
import { useWebpEncodeSupport } from "./shared-media/hooks";
import {
  ImageToolError,
  OUTPUT_EXT,
  OUTPUT_LABEL,
  decodeErrorMessage,
  decodeImage,
  encodeImage,
  formatLabel,
  type OutputType,
} from "./shared-media/image-codec";

type Resize = "none" | "percent" | "pixels";
type Result = { blob: Blob; filename: string; width: number; height: number };
type Item = { id: string; file: File; result?: Result; error?: string; busy?: boolean };

export default function ImageConverter() {
  const webp = useWebpEncodeSupport();
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<OutputType>("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [resize, setResize] = useState<Resize>("none");
  const [percent, setPercent] = useState("50");
  const [width, setWidth] = useState("1280");
  const [height, setHeight] = useState("");
  const [lock, setLock] = useState(true);
  const [background, setBackground] = useState("#ffffff");
  const [working, setWorking] = useState(false);

  function addFiles(files: File[]) {
    setItems((list) => [...list, ...files.map((file) => ({ id: nextId("img"), file }))]);
  }

  function targetSize(w: number, h: number) {
    if (resize === "percent") {
      const p = num(percent);
      if (!(p > 0)) return { width: w, height: h };
      return { width: Math.max(1, Math.round((w * p) / 100)), height: Math.max(1, Math.round((h * p) / 100)) };
    }
    if (resize === "pixels") {
      const tw = num(width);
      const th = num(height);
      if (lock) {
        if (tw > 0) return { width: Math.round(tw), height: Math.max(1, Math.round((tw * h) / w)) };
        if (th > 0) return { width: Math.max(1, Math.round((th * w) / h)), height: Math.round(th) };
        return { width: w, height: h };
      }
      return { width: tw > 0 ? Math.round(tw) : w, height: th > 0 ? Math.round(th) : h };
    }
    return { width: w, height: h };
  }

  async function convertOne(file: File): Promise<Result> {
    let img;
    try {
      img = await decodeImage(file);
    } catch {
      throw new ImageToolError(decodeErrorMessage(file));
    }
    try {
      const size = targetSize(img.width, img.height);
      const blob = await encodeImage(img, {
        ...size,
        type: format,
        quality: quality / 100,
        background: format === "image/jpeg" ? background : undefined,
      });
      return { blob, filename: `${baseName(file.name)}.${OUTPUT_EXT[format]}`, ...size };
    } finally {
      img.close();
    }
  }

  async function convertAll() {
    setWorking(true);
    for (const item of items) {
      setItems((list) => list.map((x) => (x.id === item.id ? { ...x, busy: true, error: undefined } : x)));
      try {
        const result = await convertOne(item.file);
        setItems((list) => list.map((x) => (x.id === item.id ? { ...x, busy: false, result } : x)));
      } catch (e) {
        const message = e instanceof ImageToolError ? e.message : "Something went wrong converting this image.";
        setItems((list) => list.map((x) => (x.id === item.id ? { ...x, busy: false, result: undefined, error: message } : x)));
      }
    }
    setWorking(false);
  }

  const done = items.filter((i) => i.result);
  const names = uniqueNames(done.map((i) => i.result!.filename));
  const lossy = format !== "image/png";

  return (
    <div className="grid gap-6">
      {items.length === 0 ? (
        <div className="grid gap-3">
          <Dropzone
            onFiles={addFiles}
            accept="image/*"
            title="Drop images here"
            description="JPG, PNG, WebP, GIF, BMP or AVIF · several at once"
            buttonLabel="Choose images"
            icon={<ImagePlus />}
            pasteable
          />
          <PrivacyNote />
        </div>
      ) : (
        <Dropzone onFiles={addFiles} accept="image/*" title="Add more images" buttonLabel="Add images" compact pasteable />
      )}

      <div className="grid gap-5 rounded-xl border border-border bg-card p-4 sm:p-5">
        <Field label="Convert to" as="group">
          <SegmentedControl
            label="Output format"
            value={format}
            onChange={setFormat}
            fullWidth
            options={[
              { value: "image/jpeg", label: "JPG" },
              { value: "image/png", label: "PNG" },
              { value: "image/webp", label: "WebP", disabled: webp === false },
            ]}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          {lossy && (
            <Field label="Quality" aside={`${quality}%`} hint="Higher keeps more detail; lower makes smaller files">
              <Slider value={quality} onChange={setQuality} min={40} max={100} step={1} />
            </Field>
          )}
          {format === "image/jpeg" && (
            <Field label="Background for transparent areas" hint="JPG can't store transparency">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  aria-label="Background colour"
                  className="h-11 w-14 cursor-pointer rounded-lg border border-border-strong bg-card p-1"
                />
                <span className="font-mono text-sm text-muted uppercase">{background}</span>
              </div>
            </Field>
          )}
        </div>
        <Field label="Resize" as="group">
          <SegmentedControl
            label="Resize"
            value={resize}
            onChange={setResize}
            fullWidth
            options={[
              { value: "none", label: "Original size" },
              { value: "percent", label: "By percent" },
              { value: "pixels", label: "By pixels" },
            ]}
          />
        </Field>
        {resize === "percent" && (
          <Field label="Scale to">
            <NumberInput value={percent} onChange={setPercent} min={1} max={400} suffix="%" className="sm:max-w-48" />
          </Field>
        )}
        {resize === "pixels" && (
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Width">
              <NumberInput value={width} onChange={(v) => { setWidth(v); if (lock) setHeight(""); }} min={1} suffix="px" inputMode="numeric" />
            </Field>
            <Field label="Height">
              <NumberInput value={height} onChange={(v) => { setHeight(v); if (lock) setWidth(""); }} min={1} suffix="px" inputMode="numeric" placeholder={lock ? "auto" : ""} />
            </Field>
            <Checkbox checked={lock} onChange={setLock} label="Keep aspect ratio" />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={convertAll} disabled={!items.length || working}>
            {working ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
            {working ? "Converting…" : `Convert ${items.length || ""} to ${OUTPUT_LABEL[format]}`.replace("  ", " ")}
          </Button>
          {done.length > 1 && (
            <Button onClick={() => downloadSequentially(done.map((i, k) => ({ blob: i.result!.blob, filename: names[k] })))}>
              <Download /> Download all ({done.length})
            </Button>
          )}
          {items.length > 0 && (
            <Button variant="ghost" onClick={() => setItems([])} disabled={working}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <ToolSection title="Your images" description={`${items.length} image${items.length === 1 ? "" : "s"} · converted files appear here`}>
          <ul className="grid gap-3">
            {items.map((item) => {
              const r = item.result;
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <BlobImage blob={r?.blob ?? item.file} alt="" className="size-14 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{r ? r.filename : item.file.name}</p>
                    <p className="text-[13px] text-muted">
                      {formatLabel(item.file)} · {formatBytes(item.file.size)}
                      {r && ` → ${OUTPUT_LABEL[format]} · ${formatBytes(r.blob.size)} · ${r.width}×${r.height}`}
                    </p>
                    {item.error && (
                      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-danger">
                        <CircleAlert aria-hidden className="size-3.5" /> {item.error}
                      </p>
                    )}
                  </div>
                  {item.busy && <LoaderCircle aria-label="Converting" className="size-5 animate-spin text-accent" />}
                  {r && <Badge tone="success">Done</Badge>}
                  {r && (
                    <Button size="sm" onClick={() => downloadBlob(r.blob, r.filename)}>
                      <Download /> Download
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${item.file.name}`}
                    onClick={() => setItems((list) => list.filter((x) => x.id !== item.id))}
                    disabled={working}
                  >
                    <X />
                  </Button>
                </li>
              );
            })}
          </ul>
        </ToolSection>
      )}

      {webp === false && (
        <Callout tone="neutral" icon={<CircleAlert />}>
          This browser can&apos;t create WebP files. Use Chrome, Edge or Firefox to convert to WebP.
        </Callout>
      )}
    </div>
  );
}
