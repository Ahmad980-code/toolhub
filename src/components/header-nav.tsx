"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { OPEN_SEARCH_EVENT } from "./command-menu";
import { Icon } from "./icon";
import { companyLinks, type NavGroup } from "./nav-data";
import { ThemeSwitcher } from "./theme";
import { buttonClass, cn, focusRing, iconTileClass } from "./ui-styles";

const navItemClass = (active: boolean) =>
  cn(
    "inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-subtle hover:text-foreground",
    focusRing,
    active ? "text-foreground" : "text-muted",
  );

/** Closes a menu when a link inside it is clicked (covers same-page and hash links too). */
function closeOnLinkClick(close: () => void) {
  return (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) close();
  };
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const active = usePathname() === href;
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={navItemClass(active)}>
      {children}
    </Link>
  );
}

/**
 * Desktop "Tools" mega menu. The panel is positioned against the sticky <header> (no `relative`
 * wrapper), so it spans the full header width and lays categories out in columns.
 */
export function ToolsMenu({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const pathname = usePathname();
  const total = groups.reduce((n, g) => n + g.tools.length, 0);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      onBlur={(e) => {
        if (open && !rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(navItemClass(open || pathname.startsWith("/tools/")), open && "bg-subtle")}
      >
        Tools
        <ChevronDown
          aria-hidden
          className={cn("size-4 text-faint transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          id={panelId}
          onClick={closeOnLinkClick(() => setOpen(false))}
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-5rem)] animate-enter overflow-y-auto border-b border-border bg-elevated shadow-xl"
        >
          <div className="mx-auto max-w-6xl px-4 pt-6 pb-5 sm:px-6">
            <div className="columns-3 gap-6 lg:columns-4">
              {groups.map((group) => (
                <div key={group.id} className="mb-5 break-inside-avoid">
                  <p className="px-2 pb-1.5 text-xs font-medium text-muted">{group.name}</p>
                  <ul>
                    {group.tools.map((tool) => {
                      const href = `/tools/${tool.slug}`;
                      const current = pathname === href;
                      return (
                        <li key={tool.slug}>
                          <Link
                            href={href}
                            title={tool.summary}
                            aria-current={current ? "page" : undefined}
                            className={cn(
                              "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-subtle hover:text-foreground",
                              focusRing,
                              current && "bg-subtle text-foreground",
                            )}
                          >
                            <span className={iconTileClass("xs")}>
                              <Icon name={tool.icon} />
                            </span>
                            <span className="min-w-0 leading-snug">{tool.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-1 flex items-center justify-between gap-4 rounded-xl bg-subtle px-4 py-3">
              <p className="text-[13px] text-muted">
                All {total} tools are free, private and run entirely in your browser.
              </p>
              <Link
                href="/#tools"
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-md text-[13px] font-medium text-accent hover:text-accent-hover",
                  focusRing,
                )}
              >
                Browse all tools <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile navigation: a full-screen sheet under the header (portalled, because the header's
 * backdrop-filter would otherwise become the containing block of a fixed element).
 * Search shortcut on top, then one accordion per category (single-open), company links, theme.
 */
export function MobileMenu({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentGroup = groups.find((g) => g.tools.some((t) => `/tools/${t.slug}` === pathname))?.id ?? null;
  const [expanded, setExpanded] = useState<string | null>(null);
  const total = groups.reduce((n, g) => n + g.tools.length, 0);

  function toggleMenu() {
    if (!open) setExpanded(currentGroup);
    setOpen(!open);
  }

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const panel = panelRef.current;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("button, a[href]")?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel || !button) return;
      // Keep focus inside the toggle button + sheet while it is open.
      const items = [button, ...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey
        ? index <= 0
          ? items.length - 1
          : index - 1
        : index === -1 || index === items.length - 1
          ? 0
          : index + 1;
      e.preventDefault();
      items[next].focus();
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={toggleMenu}
        className={buttonClass({ variant: "ghost", size: "icon", className: "text-foreground md:hidden" })}
      >
        {open ? <X aria-hidden /> : <Menu aria-hidden />}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id="mobile-menu"
            onClick={closeOnLinkClick(() => setOpen(false))}
            className="fixed inset-x-0 top-[calc(4rem+1px)] bottom-0 z-40 animate-fade-in overflow-y-auto overscroll-contain bg-background md:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto flex max-w-xl flex-col gap-7 px-4 pt-4 pb-12">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
                }}
                className={cn(
                  "flex h-12 w-full items-center gap-3 rounded-xl border border-border-strong bg-input px-4 text-left text-[15px] text-faint shadow-xs",
                  focusRing,
                )}
              >
                <Search aria-hidden className="size-4.5 text-muted" />
                Search {total} tools…
              </button>

              <section>
                <h2 className="px-1 text-xs font-medium text-muted">Tools</h2>
                <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                  {groups.map((group) => {
                    const isOpen = expanded === group.id;
                    const regionId = `mobile-${group.id}`;
                    return (
                      <div key={group.id} className="border-t border-border first:border-t-0">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={regionId}
                          onClick={() => setExpanded(isOpen ? null : group.id)}
                          className="flex min-h-13 w-full items-center gap-3 px-4 text-left outline-none focus-visible:bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                        >
                          <span className="flex-1 text-[15px] font-medium text-foreground">{group.name}</span>
                          <span className="rounded-full bg-subtle px-2 py-0.5 text-xs font-medium text-muted tabular-nums">
                            {group.tools.length}
                          </span>
                          <ChevronDown
                            aria-hidden
                            className={cn("size-4 text-faint transition-transform duration-200", isOpen && "rotate-180")}
                          />
                        </button>
                        {isOpen && (
                          <ul id={regionId} className="animate-fade-in px-2 pb-2">
                            {group.tools.map((tool) => {
                              const href = `/tools/${tool.slug}`;
                              const current = pathname === href;
                              return (
                                <li key={tool.slug}>
                                  <Link
                                    href={href}
                                    aria-current={current ? "page" : undefined}
                                    className={cn(
                                      "flex min-h-12 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors active:bg-subtle",
                                      "outline-none focus-visible:bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                                      current && "bg-subtle",
                                    )}
                                  >
                                    <span className={iconTileClass("sm")}>
                                      <Icon name={tool.icon} />
                                    </span>
                                    <span className="min-w-0 flex-1 text-[15px] text-foreground">{tool.name}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="px-1 text-xs font-medium text-muted">Company</h2>
                <ul className="mt-2 grid grid-cols-2 gap-2">
                  {companyLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center rounded-xl border border-border bg-card px-4 text-[15px] font-medium text-foreground shadow-xs active:bg-subtle",
                          focusRing,
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-2 pl-4 shadow-xs">
                <span className="text-[15px] font-medium text-foreground">Theme</span>
                <ThemeSwitcher />
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
