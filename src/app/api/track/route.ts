import { randomUUID } from "node:crypto";
import { dayKey, store } from "@/lib/analytics/store";
import {
  TOOL_SLUGS,
  browserOf,
  clientIp,
  clip,
  countryOf,
  deviceOf,
  errorSignature,
  isBot,
  normalisePath,
  referrerHost,
  visitorId,
} from "@/lib/analytics/request";

export const dynamic = "force-dynamic";

const ok = () => new Response(null, { status: 204 });

/** Collects anonymous page views, tool uses, browser errors and user bug reports. */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (isBot(ua)) return ok();

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 12_000) return new Response("Too large", { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const s = store();
  const day = dayKey();
  const path = normalisePath(body.path);
  const ip = clientIp(request.headers);
  const visitor = visitorId(ip, ua, day);

  try {
    switch (body.type) {
      case "pageview":
        await s.record({
          kind: "pageview",
          day,
          visitor,
          path,
          referrer: referrerHost(body.referrer, request.headers.get("host")),
          country: countryOf(request.headers),
          device: deviceOf(ua),
          browser: browserOf(ua),
        });
        return ok();

      case "tool_use": {
        const slug = clip(body.slug, 80);
        if (!TOOL_SLUGS.has(slug)) return new Response("Unknown tool", { status: 400 });
        await s.record({ kind: "use", day, slug });
        return ok();
      }

      case "error": {
        const message = clip(body.message, 300).trim();
        if (!message) return new Response("Missing message", { status: 400 });
        if (!(await s.allow(`err:${visitor}`, 30, 3600))) return ok();
        const stack = clip(body.stack, 2000);
        await s.record({
          kind: "error",
          day,
          group: {
            sig: errorSignature(message, stack),
            message,
            stack,
            path,
            browser: `${browserOf(ua)} · ${deviceOf(ua)}`,
            source: clip(body.source, 40) || "window",
            lastSeen: Date.now(),
          },
        });
        return ok();
      }

      case "report": {
        const text = clip(body.text, 2000).trim();
        if (text.length < 5) return new Response("Please describe the problem", { status: 400 });
        if (!(await s.allow(`rep:${visitor}`, 5, 3600)))
          return new Response("Too many reports, please try again later", { status: 429 });
        const slug = clip(body.slug, 80);
        await s.saveReport({
          id: randomUUID(),
          slug: TOOL_SLUGS.has(slug) ? slug : "",
          path,
          text,
          contact: clip(body.contact, 200).trim(),
          browser: browserOf(ua),
          device: deviceOf(ua),
          time: Date.now(),
          status: "open",
        });
        return new Response(null, { status: 201 });
      }

      default:
        return new Response("Unknown event", { status: 400 });
    }
  } catch {
    // Analytics must never break the site; storage hiccups are dropped silently.
    return ok();
  }
}
