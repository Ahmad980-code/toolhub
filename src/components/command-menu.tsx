"use client";

import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, SearchX } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon } from "./icon";
import type { NavGroup, NavTool } from "./nav-data";
import { buttonClass, cn, focusRing, iconTileClass } from "./ui-styles";

const noopSubscribe = () => () => {};

/** Dispatch on window to open the search dialog from anywhere: window.dispatchEvent(new Event(OPEN_SEARCH_EVENT)). */
export const OPEN_SEARCH_EVENT = "toolhub:open-search";

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

/**
 * Site-wide tool search (Ctrl/⌘ K or "/"). Renders its own triggers: a search field-style button on
 * desktop and an icon button on mobile. Uses a native modal <dialog> for focus trapping and Escape.
 */
export function CommandMenu({ groups }: { groups: NavGroup[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  // Platform-specific shortcut hint, rendered only after hydration (null on the server).
  const isMac = useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => null,
  );

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = groups
    .map((g) => ({
      ...g,
      tools: g.tools.filter((t) => {
        const haystack = `${t.name} ${t.summary} ${g.name}`.toLowerCase();
        return words.every((w) => haystack.includes(w));
      }),
    }))
    .filter((g) => g.tools.length > 0);
  const sections = filtered.map((g, gi) => ({
    ...g,
    start: filtered.slice(0, gi).reduce((n, prev) => n + prev.tools.length, 0),
  }));
  const flat: NavTool[] = filtered.flatMap((g) => g.tools);
  const activeIndex = Math.min(active, Math.max(flat.length - 1, 0));

  function open() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    dialog.showModal();
    document.documentElement.style.setProperty("overflow", "hidden"); // lock page scroll
    inputRef.current?.focus();
  }

  function close() {
    dialogRef.current?.close();
  }

  function go(tool: NavTool | undefined) {
    if (!tool) return;
    close();
    router.push(`/tools/${tool.slug}`);
  }

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        open();
      }
    };
    const onOpenRequest = () => open();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenRequest);
    };
  }, []);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!flat.length) return;
      const delta = e.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + delta + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[activeIndex]);
    }
  }

  return (
    <>
      {/* Desktop trigger */}
      <button
        type="button"
        onClick={open}
        aria-label="Search tools"
        className={cn(
          "hidden h-9 w-56 items-center gap-2 rounded-lg border border-border bg-card/70 pr-1.5 pl-3 text-sm text-muted shadow-xs transition-colors hover:border-border-hover hover:text-foreground md:inline-flex lg:w-64",
          focusRing,
        )}
      >
        <Search aria-hidden className="size-4 text-faint" />
        <span className="flex-1 text-left">Search tools…</span>
        {isMac !== null && (
          <kbd className="rounded-md border border-border bg-subtle px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        )}
      </button>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={open}
        aria-label="Search tools"
        className={buttonClass({ variant: "ghost", size: "icon", className: "text-foreground md:hidden" })}
      >
        <Search aria-hidden />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search tools"
        onClose={() => {
          document.documentElement.style.removeProperty("overflow");
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close(); // backdrop click
        }}
        className="fixed inset-x-0 top-0 mx-auto mt-4 w-[calc(100vw-2rem)] max-w-xl overflow-hidden rounded-2xl border border-border bg-elevated p-0 text-foreground shadow-xl backdrop:bg-black/40 backdrop:backdrop-blur-[2px] open:animate-enter sm:mt-[12vh]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search aria-hidden className="size-5 shrink-0 text-faint" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat.length ? `${listId}-${activeIndex}` : undefined}
            aria-label="Search tools"
            placeholder="Search tools…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-faint"
          />
          <button
            type="button"
            onClick={close}
            className={cn(
              "rounded-md border border-border bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-muted hover:text-foreground",
              focusRing,
            )}
          >
            Esc
          </button>
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label="Tools" className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <SearchX aria-hidden className="size-6 text-faint" />
              <p className="mt-3 text-sm font-medium text-foreground">No tools match “{query.trim()}”</p>
              <p className="mt-1 text-sm text-muted">Try a broader word like “calculator” or “text”.</p>
            </div>
          ) : (
            sections.map((group) => (
              <div key={group.id} role="group" aria-label={group.name} className="pb-1">
                <p className="px-3 pt-2 pb-1.5 text-xs font-medium text-muted">{group.name}</p>
                {group.tools.map((tool, ti) => {
                  const i = group.start + ti;
                  const selected = i === activeIndex;
                  return (
                    <div
                      key={tool.slug}
                      id={`${listId}-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={selected}
                      onPointerMove={() => selected || setActive(i)}
                      onClick={() => go(tool)}
                      className={cn(
                        "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                        selected && "bg-subtle",
                      )}
                    >
                      <span className={iconTileClass("sm")}>
                        <Icon name={tool.icon} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">{tool.name}</span>
                        <span className="block truncate text-xs text-muted">{tool.summary}</span>
                      </span>
                      {selected && <CornerDownLeft aria-hidden className="hidden size-4 text-faint sm:block" />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-border bg-subtle/60 px-4 py-2.5 text-xs text-muted sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> to open
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>esc</Kbd> to close
          </span>
        </div>
      </dialog>
    </>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-grid min-w-5 place-items-center rounded border border-border bg-card px-1 font-sans text-[11px] font-medium text-muted">
      {children}
    </kbd>
  );
}
