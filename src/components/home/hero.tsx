import Link from "next/link";
import { BadgeCheck, ShieldCheck, UserRoundX } from "lucide-react";
import { Icon } from "@/components/icon";
import { ToolSearch, type SearchItem } from "@/components/tool-search";
import { cn, focusRing } from "@/components/ui-styles";
import { categories, getTool, tools } from "@/lib/tools";
import { popularSearches } from "./category-meta";

const trust = [
  { icon: BadgeCheck, text: "100% free" },
  { icon: UserRoundX, text: "No sign-up" },
  { icon: ShieldCheck, text: "Runs in your browser" },
];

/**
 * Chip/pill rows: one swipeable line on phones (edge-faded, no page overflow), wrapped from sm.
 * Exported for the category pills further down the page.
 */
export const scrollRowClass =
  "-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden";

export const chipClass = cn(
  "inline-flex h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-[13px] font-medium whitespace-nowrap text-foreground/85 shadow-xs transition-[color,border-color,background-color] duration-150 hover:border-border-hover hover:text-foreground sm:h-8 sm:px-3",
  focusRing,
);

export function Hero() {
  const searchItems: SearchItem[] = tools.map(({ slug, name, icon, summary, category }) => ({
    slug,
    name,
    icon,
    summary,
    category: categories[category].name,
  }));
  const popular = popularSearches.flatMap((p) => {
    const tool = getTool(p.slug);
    return tool ? [{ ...p, icon: tool.icon }] : [];
  });
  const categoryCount = Object.keys(categories).length;

  return (
    <section aria-labelledby="hero-heading" className="relative isolate border-b border-border">
      {/* Decorative layers are clipped here so the search dropdown can overflow the hero. */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid mask-fade" />
        <div className="absolute inset-x-0 -top-40 mx-auto h-80 max-w-3xl rounded-full bg-accent/15 blur-3xl dark:bg-accent/10" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-12 pb-12 text-center sm:px-6 sm:pt-20 sm:pb-16">
        <Link
          href="#tools"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border bg-card/80 py-1 pr-3 pl-1 text-[13px] text-muted shadow-xs backdrop-blur transition-colors hover:border-border-hover hover:text-foreground",
            focusRing,
          )}
        >
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent tabular-nums">
            {tools.length} tools
          </span>
          Calculators, converters, text, image &amp; PDF
          <span aria-hidden className="hidden text-faint sm:inline">
            ·
          </span>
          <span className="hidden sm:inline">{categoryCount} categories</span>
        </Link>

        <h1
          id="hero-heading"
          className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-6xl"
        >
          Free online tools that <span className="text-accent">just work</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
          Calculators, converters, text and developer tools — fast, beautifully simple and running entirely in
          your browser.
        </p>

        <div className="mt-8 sm:mt-10">
          <ToolSearch tools={searchItems} />
        </div>

        <div className="mx-auto mt-4 max-w-2xl sm:mt-5">
          <ul aria-label="Popular tools" className={cn(scrollRowClass, "sm:justify-center")}>
            <li className="flex shrink-0 items-center pr-1 text-[13px] text-muted">Popular:</li>
            {popular.map((p) => (
              <li key={p.slug} className="shrink-0">
                <Link href={`/tools/${p.slug}`} className={chipClass}>
                  <Icon name={p.icon} className="size-3.5 text-accent" />
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:mt-10">
          {trust.map(({ icon: TrustIcon, text }) => (
            <li key={text} className="flex items-center gap-1.5 text-[13px] font-medium text-foreground/80">
              <TrustIcon aria-hidden className="size-4 text-accent" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
