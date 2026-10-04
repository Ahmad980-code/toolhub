"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { DARK_MEDIA as MEDIA, THEME_STORAGE_KEY as STORAGE_KEY } from "./theme-script";
import { buttonClass, cn } from "./ui-styles";

/**
 * Theme handling. The resolved theme lives in <html data-theme="light|dark">.
 * - THEME_SCRIPT (theme-script.ts, inlined in <head> by layout.tsx) sets it before first paint.
 * - The stored choice is "light" | "dark"; no stored value means "system" (follow the OS).
 */

export type ThemeChoice = "system" | "light" | "dark";

const listeners = new Set<() => void>();

function readChoice(): ThemeChoice {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function resolve(choice: ThemeChoice) {
  if (choice !== "system") return choice;
  return window.matchMedia(MEDIA).matches ? "dark" : "light";
}

function apply(choice: ThemeChoice) {
  const root = document.documentElement;
  const next = resolve(choice);
  if (root.getAttribute("data-theme") === next) return;
  // Switch instantly: suppress every transition for a frame so colors don't fade unevenly.
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  root.setAttribute("data-theme", next);
  void window.getComputedStyle(document.body).opacity; // force a style flush before re-enabling
  requestAnimationFrame(() => style.remove());
}

export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage blocked: the theme still applies for this page view.
  }
  apply(choice);
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const media = window.matchMedia(MEDIA);
  const onSystemChange = () => {
    apply(readChoice());
    callback();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onSystemChange();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** The stored theme choice. Renders "system" during SSR/hydration, then the real value. */
export function useThemeChoice() {
  return useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice);
}

/**
 * Keeps <html data-theme> correct after hydration: re-applies it when React's dev Strict Mode
 * remount resets <html> attributes, and follows OS changes / other tabs. Renders nothing.
 */
export function ThemeWatcher() {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", resolve(readChoice()));
  }, []);
  useThemeChoice();
  return null;
}

/** Header icon button: flips between light and dark. Icon swaps via CSS, so it is hydration-safe. */
export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      onClick={() => {
        const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        // Picking the theme the OS already uses means "follow the system" again.
        setTheme(window.matchMedia(MEDIA).matches === (next === "dark") ? "system" : next);
      }}
      className={buttonClass({ variant: "ghost", size: "icon", className })}
    >
      <Sun aria-hidden className="block dark:hidden" />
      <Moon aria-hidden className="hidden dark:block" />
    </button>
  );
}

const choices: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/** Three-way System / Light / Dark switch (footer, mobile menu). */
export function ThemeSwitcher({ showLabels, className }: { showLabels?: boolean; className?: string }) {
  const choice = useThemeChoice();
  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn("inline-flex gap-0.5 rounded-full bg-subtle p-1 ring-1 ring-border ring-inset", className)}
    >
      {choices.map(({ value, label, Icon }) => {
        const selected = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring sm:h-7",
              showLabels ? "flex-1 px-3" : "w-9 sm:w-7",
              selected
                ? "bg-card text-foreground shadow-sm ring-1 ring-border dark:bg-elevated"
                : "text-muted hover:text-foreground",
            )}
          >
            <Icon aria-hidden className="size-4 sm:size-3.5" />
            {showLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
