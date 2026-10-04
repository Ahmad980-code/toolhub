"use client";

import { ImageOff, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Callout, cn, iconTileClass } from "@/components/ui";

type DropzoneProps = {
  /** Called with the dropped, picked or pasted files (unfiltered; the tool validates them). */
  onFiles: (files: File[]) => void;
  /** Value for the file input's accept attribute, e.g. "image/jpeg,image/png,.webp". */
  accept: string;
  multiple?: boolean;
  title: ReactNode;
  description?: ReactNode;
  buttonLabel: string;
  icon?: ReactNode;
  /** Slim one-row variant used once files have been added ("Add more"). Uses a secondary button. */
  compact?: boolean;
  /** Also accept files pasted with Ctrl/Cmd+V anywhere on the page. */
  pasteable?: boolean;
  disabled?: boolean;
  className?: string;
};

function hasFiles(e: React.DragEvent | DragEvent) {
  return Array.from(e.dataTransfer?.types ?? []).includes("Files");
}

/**
 * Dashed drop target with a "Choose files" button (the real <input type=file> is visually hidden).
 * Clicking anywhere on the zone opens the picker; drag-over highlights it.
 */
export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  title,
  description,
  buttonLabel,
  icon,
  compact,
  pasteable,
  disabled,
  className,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);

  // Paste support (screenshots, copied images) when the user isn't typing in a field.
  useEffect(() => {
    if (!pasteable || disabled) return;
    function onPaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      const files = Array.from(e.clipboardData?.files ?? []);
      if (!files.length) return;
      e.preventDefault();
      onFiles(multiple ? files : files.slice(0, 1));
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pasteable, disabled, multiple, onFiles]);

  // A file dropped just outside the zone would make the browser open it and lose the user's work.
  useEffect(() => {
    function guard(e: DragEvent) {
      if (hasFiles(e)) e.preventDefault();
    }
    window.addEventListener("dragover", guard);
    window.addEventListener("drop", guard);
    return () => {
      window.removeEventListener("dragover", guard);
      window.removeEventListener("drop", guard);
    };
  }, []);

  function take(list: FileList | null | undefined) {
    const files = Array.from(list ?? []);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  }

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      onClick={open}
      onDragEnter={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (disabled || !hasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        if (!disabled) take(e.dataTransfer.files);
      }}
      className={cn(
        "group relative flex cursor-pointer rounded-xl border border-dashed transition-[border-color,background-color] duration-150",
        compact
          ? "flex-col items-center gap-3 px-4 py-4 text-center sm:flex-row sm:text-left"
          : "min-h-48 flex-col items-center justify-center px-5 py-8 text-center sm:px-6",
        dragging ? "border-accent bg-accent-soft/50" : "border-border-strong hover:border-border-hover hover:bg-subtle/50",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          iconTileClass(compact ? "sm" : "md"),
          "transition-transform duration-150",
          dragging && "-translate-y-0.5",
          !compact && "mb-3",
        )}
      >
        {icon ?? <Upload />}
      </span>
      <div className={cn("min-w-0", compact && "sm:flex-1")}>
        <p className="text-[15px] font-medium text-foreground">{dragging ? "Drop to add" : title}</p>
        {description && <p className={cn("text-sm text-muted", compact ? "mt-0.5" : "mt-1")}>{description}</p>}
      </div>
      <Button
        variant={compact ? "secondary" : "primary"}
        size={compact ? "sm" : "md"}
        className={compact ? undefined : "mt-5"}
        disabled={disabled}
        // The zone's onClick opens the picker; this button is the keyboard/AT entry point.
      >
        <Upload aria-hidden />
        {buttonLabel}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          take(e.target.files);
          e.target.value = ""; // allow re-adding the same file
        }}
      />
    </div>
  );
}

/** "Your files never leave your device" reassurance, shown next to every dropzone. */
export function PrivacyNote({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <Callout tone="accent" icon={<ShieldCheck />} className={className}>
      <strong className="font-medium text-foreground">Your files never leave your device.</strong>{" "}
      {children ?? "They are processed right here in your browser and never uploaded."}
    </Callout>
  );
}

/** Token-based checkerboard that reveals transparent areas of a preview in both themes. */
export const checkerboard =
  "bg-[conic-gradient(var(--color-subtle)_25%,var(--color-card)_0_50%,var(--color-subtle)_0_75%,var(--color-card)_0)] bg-size-[16px_16px]";

/**
 * <img> for a local Blob/File. The object URL is created after mount and revoked on change/unmount,
 * so nothing leaks and SSR never sees it. Shows a neutral icon if the browser can't decode it.
 */
export function BlobImage({
  blob,
  alt,
  className,
  fit = "cover",
}: {
  blob: Blob;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState<Blob | null>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    const url = URL.createObjectURL(blob);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  const broken = failed === blob;
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden bg-subtle ring-1 ring-inset ring-border",
        fit === "contain" && checkerboard,
        className,
      )}
    >
      {broken && <ImageOff aria-hidden className="size-5 text-faint" />}
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL, next/image can't optimise it */}
      <img
        ref={ref}
        alt={alt}
        decoding="async"
        onError={() => setFailed(blob)}
        onLoad={() => setFailed(null)}
        className={cn(
          "absolute inset-0 size-full",
          fit === "cover" ? "object-cover" : "object-contain",
          broken && "invisible",
        )}
      />
    </span>
  );
}
