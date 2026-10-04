"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Secret word that opens the developer dashboard when typed anywhere outside a text field.
 * Set NEXT_PUBLIC_DEV_SHORTCUT in .env.local / hosting settings (kept out of the repository).
 * Leave it unset to disable the keyboard shortcut.
 */
const SECRET_WORD = (process.env.NEXT_PUBLIC_DEV_SHORTCUT ?? "").trim().toLowerCase();
const TAPS = 5;
const TAP_WINDOW_MS = 2000;

/**
 * The footer's "Developers" heading, with two hidden shortcuts to /developer:
 * typing the secret word on any page, or tapping the heading TAPS times quickly.
 * The dashboard itself stays password protected.
 */
export function DevelopersHeading() {
  const router = useRouter();
  const taps = useRef<number[]>([]);

  useEffect(() => {
    if (!SECRET_WORD) return;
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      // Ignore shortcuts, special keys, keys a tool has claimed (e.g. the keyboard tester) and typing in fields.
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      typed = (typed + e.key.toLowerCase()).slice(-SECRET_WORD.length);
      if (typed === SECRET_WORD) {
        typed = "";
        router.push("/developer");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  function onTap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < TAP_WINDOW_MS), now];
    if (taps.current.length >= TAPS) {
      taps.current = [];
      router.push("/developer");
    }
  }

  return (
    <h2
      id="developers-heading"
      onClick={onTap}
      className="text-xs font-semibold tracking-wider text-muted uppercase select-none [-webkit-tap-highlight-color:transparent]"
    >
      Developers
    </h2>
  );
}
