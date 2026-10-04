"use client";

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { clockNow, localDateKey } from "./clock";

/**
 * Re-renders with a fresh clockNow() reading while `active`. "frame" updates every animation frame
 * (stopwatch hundredths); "smooth" does too unless the user prefers reduced motion, then 4 times a
 * second. A 1-second interval keeps hidden tabs (where animation frames stop) and the tab title
 * up to date. Returns [now, setNow] so handlers can sync `now` with the moment they act.
 */
export function useTicker(active: boolean, mode: "frame" | "smooth" = "smooth") {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(clockNow());
    const useFrames =
      mode === "frame" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const frame = () => {
      tick();
      raf = requestAnimationFrame(frame);
    };
    if (useFrames) raf = requestAnimationFrame(frame);
    const fast = useFrames ? 0 : window.setInterval(tick, 250);
    const slow = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(fast);
      window.clearInterval(slow);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [active, mode]);
  return [now, setNow] as const;
}

/**
 * Shows `title` in the browser tab while it is non-null, and restores the page's own title when it
 * becomes null or the component unmounts (unless something else changed the title meanwhile).
 */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title === null) return;
    // Each cleanup restores the previous title, so `before` is always the page's own title.
    const before = document.title;
    document.title = title;
    return () => {
      if (document.title === title) document.title = before;
    };
  }, [title]);
}

type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type;
    return !["checkbox", "radio", "button", "submit", "reset", "range"].includes(type);
  }
  return false;
}

function isActivatable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("button, a[href], [role=button], [role=switch], [role=radio], [role=checkbox], input, summary"));
}

/**
 * Page-wide single-key shortcuts (keys are lower-case `e.key` values, " " for Space). Ignored while
 * typing in a field, with Ctrl/Alt/Meta held, on key repeat, and Space is left alone when a button
 * or other control has focus (Space already activates it).
 */
export function useHotkeys(map: HotkeyMap) {
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
    if (isTyping(e.target)) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const handler = map[key];
    if (!handler) return;
    if (key === " " && isActivatable(e.target)) return;
    e.preventDefault();
    handler(e);
  });
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
}

/* -------------------------------------------------------------------------------------------------
 * localStorage, hydration safe (server and first client render see `undefined`).
 * -----------------------------------------------------------------------------------------------*/

const storageListeners = new Set<() => void>();

function subscribeStorage(callback: () => void) {
  storageListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    storageListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the tool still works this session.
  }
  storageListeners.forEach((l) => l());
}

/** Raw stored string: `undefined` during SSR/hydration, `null` when nothing is stored. */
export function useStoredString(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribeStorage,
    () => readStored(key),
    () => undefined,
  );
}

function subscribeDay(callback: () => void) {
  const id = window.setInterval(callback, 60_000);
  document.addEventListener("visibilitychange", callback);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", callback);
  };
}

/** Today's local date (YYYY-MM-DD) on the client, `null` during SSR/hydration. */
export function useTodayKey(): string | null {
  return useSyncExternalStore(
    subscribeDay,
    () => localDateKey(new Date()),
    () => null,
  );
}
