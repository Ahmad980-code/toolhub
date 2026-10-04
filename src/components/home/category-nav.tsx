"use client";

import { useEffect, useRef, useState } from "react";
import { cn, focusRing } from "@/components/ui-styles";

type Item = { id: string; name: string; count: number };

/**
 * Category bar that sticks under the site header while the tool directory scrolls past, and
 * highlights the category currently on screen.
 */
export function CategoryNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  // Active = the last section whose heading has scrolled up under the sticky header + this bar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 150) current = item.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  // Keep the active pill visible in the horizontally scrolling bar (without moving the page).
  useEffect(() => {
    const list = listRef.current;
    const pill = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !pill) return;
    const left = pill.offsetLeft - list.clientWidth / 2 + pill.clientWidth / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Tool categories"
      className="sticky top-16 z-30 -mx-4 border-y border-border/80 bg-background/85 px-4 py-2.5 backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 sm:px-6"
    >
      <ul
        ref={listRef}
        className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                data-id={item.id}
                aria-current={on ? "true" : undefined}
                onClick={() => setActive(item.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150",
                  focusRing,
                  on ? "bg-foreground text-background" : "text-muted hover:bg-subtle hover:text-foreground",
                )}
              >
                {item.name}
                <span className={cn("text-xs tabular-nums", on ? "text-background/70" : "text-faint")}>{item.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
