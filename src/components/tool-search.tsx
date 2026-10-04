"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, SearchX, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon } from "@/components/icon";
import { cn, focusRing, iconTileClass } from "@/components/ui-styles";
import type { Tool } from "@/lib/tools";

export type SearchItem = Pick<Tool, "slug" | "name" | "icon" | "summary"> & {
  /** Category display name; also searchable ("finance", "pdf"…). */
  category: string;
};

const MAX_RESULTS = 8;
const noopSubscribe = () => () => {};

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

/** Every word must match the name, summary or category; tools whose name matches rank first. */
function search(items: SearchItem[], query: string) {
  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const ranked: { item: SearchItem; rank: number; order: number }[] = [];
  items.forEach((item, order) => {
    const name = item.name.toLowerCase();
    const haystack = `${name} ${item.summary.toLowerCase()} ${item.category.toLowerCase()}`;
    if (!words.every((w) => haystack.includes(w))) return;
    const rank = name.startsWith(q)
      ? 0
      : name.split(/[\s/&-]+/).some((part) => part.startsWith(words[0]))
        ? 1
        : words.every((w) => name.includes(w))
          ? 2
          : 3;
    ranked.push({ item, rank, order });
  });
  return ranked.sort((a, b) => a.rank - b.rank || a.order - b.order).map((r) => r.item);
}

/**
 * Home-page hero search: instant results in a keyboard-navigable listbox (combobox pattern).
 * While it is on screen, "/" and Ctrl/⌘ K focus it; otherwise they fall through to the global
 * search dialog in the header.
 */
export function ToolSearch({ tools }: { tools: SearchItem[] }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  // Platform-specific shortcut hint, rendered only after hydration (null on the server).
  const isMac = useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => null,
  );

  const q = query.trim();
  const results = search(tools, q).slice(0, MAX_RESULTS);
  const open = focused && !dismissed && q.length > 0;
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (!slash && !cmdK) return;
      const input = inputRef.current;
      if (!input || document.querySelector("dialog[open]")) return;
      if (document.activeElement === input) {
        if (cmdK) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }
      if (slash && isTypingTarget(e.target)) return;
      // Only take over while the hero search is visible below the sticky header.
      const rect = input.getBoundingClientRect();
      if (rect.bottom < 64 || rect.top > window.innerHeight) return;
      e.preventDefault();
      e.stopPropagation(); // capture phase on window: the header's listener never sees it
      input.focus();
      input.select();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function go(tool: SearchItem | undefined) {
    if (!tool) return;
    setDismissed(true);
    router.push(`/tools/${tool.slug}`);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setDismissed(false);
      if (!results.length) return;
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActive(open ? (activeIndex + delta + results.length) % results.length : 0);
    } else if (e.key === "Enter") {
      if (!open) return;
      e.preventDefault();
      go(results[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (open) setDismissed(true);
      else setQuery("");
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative mx-auto w-full max-w-2xl text-left"
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-faint sm:left-5"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Search tools"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results.length ? `${listId}-${activeIndex}` : undefined}
          aria-keyshortcuts="/"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={`Search ${tools.length} tools, e.g. “tax”, “pdf”`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setDismissed(false);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          className="h-14 w-full min-w-0 rounded-2xl border border-border-strong bg-card pr-14 pl-12 text-base text-foreground shadow-md outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint hover:border-border-hover focus:border-accent focus:ring-4 focus:ring-accent/15 sm:h-16 sm:pr-36 sm:pl-14 sm:text-[17px]"
        />
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1.5 sm:right-3">
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className={cn(
                "grid size-11 place-items-center rounded-xl text-muted transition-colors hover:bg-subtle hover:text-foreground sm:size-10",
                focusRing,
              )}
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : (
            <span aria-hidden className="hidden items-center gap-1.5 pr-1 sm:flex">
              <Kbd>/</Kbd>
              {isMac !== null && <Kbd>{isMac ? "⌘ K" : "Ctrl K"}</Kbd>}
            </span>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {open ? (results.length ? `${results.length} tools found` : "No tools found") : ""}
      </p>

      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Matching tools"
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-elevated shadow-xl animate-enter"
      >
        {results.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-9 text-center">
            <SearchX aria-hidden className="size-6 text-faint" />
            <p className="mt-3 text-sm font-medium text-foreground">No tools match “{q}”</p>
            <p className="mt-1 text-sm text-muted">Try a broader word like “calculator”, “image” or “text”.</p>
          </div>
        ) : (
          <div className="max-h-[min(60vh,26rem)] overflow-y-auto p-1.5">
            {results.map((tool, i) => {
              const selected = i === activeIndex;
              return (
                <Link
                  key={tool.slug}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  href={`/tools/${tool.slug}`}
                  onPointerMove={() => selected || setActive(i)}
                  onClick={() => setDismissed(true)}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-lg px-3 py-2 outline-none",
                    selected && "bg-subtle",
                  )}
                >
                  <span className={iconTileClass("sm")}>
                    <Icon name={tool.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{tool.name}</span>
                    <span className="block truncate text-[13px] text-muted">{tool.summary}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted md:block">{tool.category}</span>
                  <CornerDownLeft
                    aria-hidden
                    className={cn("hidden size-4 shrink-0 text-faint sm:block", !selected && "sm:invisible")}
                  />
                </Link>
              );
            })}
          </div>
        )}
        <div className="hidden items-center gap-4 border-t border-border bg-subtle/60 px-4 py-2.5 text-xs text-muted sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd small>↑</Kbd>
            <Kbd small>↓</Kbd> to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd small>↵</Kbd> to open
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd small>esc</Kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children, small }: { children: ReactNode; small?: boolean }) {
  return (
    <kbd
      className={cn(
        "inline-grid place-items-center rounded-md border border-border bg-subtle font-sans font-medium text-muted",
        small ? "min-w-5 px-1 text-[11px]" : "h-6 min-w-6 px-1.5 text-xs",
      )}
    >
      {children}
    </kbd>
  );
}
