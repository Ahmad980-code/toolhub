import { createHash } from "node:crypto";
import { tools } from "@/lib/tools";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|go-http|java\//i;

const PAGES = new Set(["/", "/about", "/contact", "/privacy", "/terms", ...tools.map((t) => `/tools/${t.slug}`)]);
export const TOOL_SLUGS = new Set(tools.map((t) => t.slug));

export function isBot(ua: string) {
  return !ua || BOT.test(ua);
}

export function deviceOf(ua: string) {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "Tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "Mobile";
  return "Desktop";
}

export function browserOf(ua: string) {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/Firefox|FxiOS/.test(ua)) return "Firefox";
  if (/Chrome|CriOS/.test(ua)) return "Chrome";
  if (/Safari/.test(ua)) return "Safari";
  return "Other";
}

/** Known page path, or "other" (keeps junk paths out of the stats). */
export function normalisePath(p: unknown) {
  if (typeof p !== "string") return "other";
  const clean = p.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return PAGES.has(clean) ? clean : "other";
}

/** Referrer host without "www.", or null for internal/empty referrers. */
export function referrerHost(ref: unknown, ownHost: string | null) {
  if (typeof ref !== "string" || !ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (!host || (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0])) return null;
    return host.slice(0, 80);
  } catch {
    return null;
  }
}

/**
 * Anonymous daily visitor id: a salted hash of IP + browser that changes every day, so visitors
 * can be counted without cookies and without storing IP addresses.
 */
export function visitorId(ip: string, ua: string, day: string) {
  const salt = process.env.ANALYTICS_SALT ?? process.env.DEVELOPER_PASSWORD ?? "toolhub";
  return createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 16);
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "local";
}

export function countryOf(headers: Headers) {
  const c = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "";
  return /^[A-Z]{2}$/.test(c) ? c : "Unknown";
}

/** Groups similar errors: numbers and quoted values are masked before hashing. */
export function errorSignature(message: string, stack: string) {
  const firstFrame = stack.split("\n").find((l) => /at |@/.test(l))?.replace(/:\d+:\d+/g, "") ?? "";
  const norm = message.replace(/\d+/g, "N").replace(/(["'`]).*?\1/g, "S");
  return createHash("sha1").update(`${norm}|${firstFrame}`).digest("hex").slice(0, 12);
}

export const clip = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
