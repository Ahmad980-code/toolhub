import { fmt } from "@/components/ui";

/** Matches any letter or digit in any script. */
export const WORD_CHAR = /[\p{L}\p{N}]/u;

/** Whitespace-separated tokens that contain at least one letter or digit (stray "-" or "—" are not words). */
export function splitWords(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/).filter((t) => WORD_CHAR.test(t));
}

export function countWords(text: string) {
  return splitWords(text).length;
}

/** Sentences end with . ! ? or … (optionally followed by closing quotes/brackets) or a blank line. */
export function countSentences(text: string) {
  return text.split(/[.!?…]+["'”’)\]]*(?:\s+|$)|\n\s*\n/).filter((s) => WORD_CHAR.test(s)).length;
}

/** Each non-empty line counts as a paragraph (as in Word and Google Docs). */
export function countParagraphs(text: string) {
  return text.split(/\n+/).filter((p) => WORD_CHAR.test(p)).length;
}

let segmenter: Intl.Segmenter | null | undefined;

/** User-perceived characters: an emoji such as a family or a flag counts as one. */
export function countCharacters(text: string) {
  if (!text) return 0;
  if (segmenter === undefined) {
    segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter("en", { granularity: "grapheme" }) : null;
  }
  return segmenter ? Array.from(segmenter.segment(text)).length : Array.from(text).length;
}

/** Number of UTF-8 bytes in a string. */
export function byteLength(text: string) {
  return new TextEncoder().encode(text).length;
}

/** "512 B", "1.4 KB", "2.31 MB" (1 KB = 1,024 bytes). */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${fmt(bytes, 0)} B`;
  if (bytes < 1024 * 1024) return `${fmt(bytes / 1024, 1)} KB`;
  return `${fmt(bytes / (1024 * 1024), 2)} MB`;
}

/** "1 word", "2 words". */
export function plural(n: number, one: string, many = `${one}s`) {
  return `${fmt(n, 0)} ${n === 1 ? one : many}`;
}
