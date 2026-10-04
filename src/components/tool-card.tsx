import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Icon } from "@/components/icon";
import type { Tool } from "@/lib/tools";
import { cn, iconTileClass, interactiveCardClass } from "./ui-styles";

/** Link card for a tool: icon tile, name, one-line summary; lifts on hover. */
export function ToolCard({
  tool,
  className,
}: {
  tool: Pick<Tool, "slug" | "name" | "icon" | "summary">;
  className?: string;
}) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(interactiveCardClass, "group relative flex items-start gap-4 p-4 sm:p-5", className)}
    >
      <span className={cn(iconTileClass("md"), "transition-colors duration-200 group-hover:ring-accent/30")}>
        <Icon name={tool.icon} />
      </span>
      <span className="min-w-0 flex-1 pr-5">
        <span className="block text-[15px] font-semibold tracking-tight text-foreground">{tool.name}</span>
        <span className="mt-1 block text-sm leading-5 text-muted">{tool.summary}</span>
      </span>
      <ArrowUpRight
        aria-hidden
        className="absolute top-4 right-4 size-4 text-faint transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent sm:top-5 sm:right-5"
      />
    </Link>
  );
}
