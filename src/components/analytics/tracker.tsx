"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";

const isDeveloperPage = (p: string) => p.startsWith("/developer");

// Last path counted; stops double counting when React re-runs effects (dev Strict Mode).
let lastTracked = "";

/**
 * Counts anonymous page views (no cookies, nothing typed into tools) and reports JavaScript errors
 * so they show up in the developer dashboard.
 */
export function Tracker() {
  const pathname = usePathname();
  const firstView = useRef(true);

  useEffect(() => {
    if (pathname === lastTracked) return;
    lastTracked = pathname;
    if (isDeveloperPage(pathname)) return;
    const referrer = firstView.current ? document.referrer : "";
    firstView.current = false;
    track({ type: "pageview", path: pathname, referrer });
  }, [pathname]);

  useEffect(() => {
    const seen = new Set<string>();
    const report = (message: string, stack: string, source: string) => {
      if (isDeveloperPage(location.pathname) || seen.has(message) || seen.size >= 10) return;
      seen.add(message);
      track({ type: "error", path: location.pathname, message: message.slice(0, 300), stack: stack.slice(0, 2000), source });
    };
    const onError = (e: ErrorEvent) => {
      // Skip opaque cross-origin errors and errors thrown by browser extensions or ad scripts.
      if (!e.message || e.message === "Script error." || (e.filename && !e.filename.startsWith(location.origin))) return;
      report(e.message, e.error instanceof Error ? (e.error.stack ?? "") : `${e.filename}:${e.lineno}:${e.colno}`, "window");
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      report(`Unhandled rejection: ${r instanceof Error ? r.message : String(r)}`, r instanceof Error ? (r.stack ?? "") : "", "promise");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
