/**
 * Shared helpers for the browser-only file tools (image compressor/converter, PDF merge/split).
 * Nothing here uploads anything: files are read, processed and downloaded on the user's device.
 */
import { fmt } from "@/components/ui";

/** Human-readable size using 1024-based units, as Windows Explorer and most file managers show. */
export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${fmt(bytes, 0)} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${fmt(value, value < 10 ? 2 : value < 100 ? 1 : 0)} ${units[i]}`;
}

/** Percentage of `original` that was saved by going down to `next` (negative when it grew). */
export function percentSaved(original: number, next: number) {
  if (!(original > 0)) return 0;
  return ((original - next) / original) * 100;
}

/** "holiday.photo.JPG" -> "holiday.photo" */
export function baseName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return base.trim() || "file";
}

/** "holiday.photo.JPG" -> "jpg" ("" when there is none). */
export function extension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

let counter = 0;
/** Stable-enough unique id for list keys (client-side only, created in handlers). */
export function nextId(prefix = "f") {
  counter += 1;
  return `${prefix}${counter}`;
}

/** Saves a Blob as a file through a temporary object URL, revoked once the download has started. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking immediately can cancel the download in some browsers; give it time to start.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Lets React paint (progress bars) between heavy synchronous steps. */
export const nextFrame = () => wait(0);

/**
 * Downloads several files one after another (no zip). A short gap between them keeps browsers
 * from dropping downloads; Chrome may ask once to allow multiple downloads from this site.
 */
export async function downloadSequentially(files: { blob: Blob; filename: string }[], gapMs = 350) {
  for (let i = 0; i < files.length; i++) {
    downloadBlob(files[i].blob, files[i].filename);
    if (i < files.length - 1) await wait(gapMs);
  }
}

/** Makes every name in the list unique by appending " (2)", " (3)"… before the extension. */
export function uniqueNames(names: string[]) {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const key = name.toLowerCase();
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    if (count === 1) return name;
    const ext = extension(name);
    return ext ? `${baseName(name)} (${count}).${ext}` : `${name} (${count})`;
  });
}

/** True when the file matches an accept list such as ["image/png", ".png"]. */
export function matchesAccept(file: File, accept: string[]) {
  const type = file.type.toLowerCase();
  const ext = `.${extension(file.name)}`;
  return accept.some((a) => {
    const rule = a.trim().toLowerCase();
    if (rule.startsWith(".")) return ext === rule;
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

/** "a.png, b.txt and 3 more" for skipped-file messages. */
export function listNames(names: string[], max = 3) {
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} and ${names.length - max} more`;
}

/** "1 image" / "3 images" */
export function plural(n: number, one: string, many = `${one}s`) {
  return `${fmt(n, 0)} ${n === 1 ? one : many}`;
}
