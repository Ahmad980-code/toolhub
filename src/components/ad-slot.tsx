"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * An AdSense display unit. Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT and
 * NEXT_PUBLIC_ADSENSE_SLOT are set; in development it shows a placeholder instead.
 */
export function AdSlot({ className = "" }: { className?: string }) {
  const pushed = useRef(false);
  const enabled = Boolean(site.adsenseClient && site.adsenseSlot);

  useEffect(() => {
    if (!enabled || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers make this throw; the page should keep working.
    }
  }, [enabled]);

  if (!enabled) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div
        className={`flex h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong bg-subtle/50 px-4 text-center ${className}`}
      >
        <span className="text-[11px] font-medium tracking-wider text-faint uppercase">Ad space · dev only</span>
        <span className="text-xs text-muted">Set NEXT_PUBLIC_ADSENSE_CLIENT + NEXT_PUBLIC_ADSENSE_SLOT</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle block"
        data-ad-client={site.adsenseClient}
        data-ad-slot={site.adsenseSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
