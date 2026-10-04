import { site } from "@/lib/site";
import { cn } from "./ui-styles";

/** Brand gradient, shared with the favicon (app/icon.svg) and the social card. */
export const BRAND_GRADIENT = { from: "#8b7dff", to: "#4f46e5" } as const;

/**
 * The glyph inside the mark: a 2x2 grid of tools where one tile is a dot, i.e. "a hub of tools".
 * Plain SVG with inline attributes so it also renders inside next/og ImageResponse.
 */
export function LogoGlyph({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2.25" />
      <circle cx="17" cy="7" r="4" />
      <rect x="3" y="13" width="8" height="8" rx="2.25" opacity="0.6" />
      <rect x="13" y="13" width="8" height="8" rx="2.25" />
    </svg>
  );
}

/** Square brand mark (gradient tile + glyph). Size it with a `size-*` class; default 32px. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-[9px] shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_1px_2px_rgb(49_46_129/0.25),0_4px_12px_-4px_rgb(79_70_229/0.55)]",
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${BRAND_GRADIENT.from}, ${BRAND_GRADIENT.to})` }}
    >
      <span className="grid size-[60%] place-items-center [&>svg]:size-full">
        <LogoGlyph />
      </span>
    </span>
  );
}

/** Mark + wordmark, as used in the header and footer. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">{site.name}</span>
    </span>
  );
}
