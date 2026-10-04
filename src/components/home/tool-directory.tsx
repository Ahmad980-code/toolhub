import { ArrowRight } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { ToolCard } from "@/components/tool-card";
import { badgeClass, cn, iconTileClass, interactiveCardClass } from "@/components/ui-styles";
import { categories, tools, toolsInCategory, type CategoryId } from "@/lib/tools";
import { CategoryNav } from "./category-nav";
import { categoryIcons } from "./category-meta";

const ids = () => (Object.keys(categories) as CategoryId[]).filter((id) => toolsInCategory(id).length > 0);

/** "Browse by category": one tile per category, each jumping to its section below. */
export function CategoryTiles() {
  const list = ids();
  return (
    <section aria-labelledby="categories-heading" className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2 id="categories-heading" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Browse by category
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-muted sm:text-base">
            {tools.length} free tools in {list.length} categories. Pick one to jump straight to its tools.
          </p>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {list.map((id) => {
          const CategoryIcon = categoryIcons[id];
          const items = toolsInCategory(id);
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(interactiveCardClass, "group flex h-full flex-col gap-3 p-4 sm:p-5")}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span className={iconTileClass("md")}>
                    <CategoryIcon aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] leading-5 font-semibold tracking-tight text-foreground">{categories[id].name}</h3>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {items.length} tool{items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ArrowRight
                    aria-hidden
                    className="hidden size-4 shrink-0 text-faint transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-accent sm:block"
                  />
                </div>
                <p className="hidden text-sm leading-6 text-muted sm:block">{categories[id].description}</p>
                <p className="mt-auto hidden truncate text-[13px] text-faint sm:block">
                  {items
                    .slice(0, 3)
                    .map((t) => t.name)
                    .join(" · ")}
                  {items.length > 3 ? " …" : ""}
                </p>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Every tool, grouped into one clearly separated section per category, with a sticky category bar. */
export function ToolDirectory() {
  const list = ids();
  return (
    <section id="tools" aria-labelledby="tools-heading" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
      <h2 id="tools-heading" className="sr-only">
        All tools by category
      </h2>
      <CategoryNav items={list.map((id) => ({ id, name: categories[id].name, count: toolsInCategory(id).length }))} />

      <div className="mt-8 grid gap-12 sm:gap-14">
        {list.map((id, index) => {
          const CategoryIcon = categoryIcons[id];
          const items = toolsInCategory(id);
          return (
            <div key={id} className="grid gap-12 sm:gap-14">
              <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-14">
                <header className="flex items-start gap-3.5 sm:items-center">
                  <span className={iconTileClass("md")}>
                    <CategoryIcon aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 id={`${id}-heading`} className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      {categories[id].name}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted">{categories[id].description}</p>
                  </div>
                  <span className={badgeClass("neutral", "shrink-0 tabular-nums")}>
                    {items.length} tool{items.length === 1 ? "" : "s"}
                  </span>
                </header>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </div>
              </section>
              {index === 3 && <AdSlot />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
