/**
 * Server-safe class helpers for the design system. Import these (not ui.tsx) from Server
 * Components, e.g. to style a <Link> as a button: <Link className={buttonClass({ variant: "primary" })}>.
 * Values exported from a "use client" module cannot be called on the server.
 */

type ClassValue = string | number | bigint | boolean | null | undefined;

/** Joins class names, skipping non-string/falsy values. No conflict resolution: don't pass competing utilities. */
export function cn(...classes: ClassValue[]) {
  return classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/** Visible keyboard focus ring for custom interactive elements (links, cards, menu items). */
export const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const buttonBase =
  "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 " +
  focusRing;

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm inset-shadow-[0_1px_0_rgb(255_255_255/0.16)] hover:bg-primary-hover hover:shadow-glow",
  secondary:
    "border border-border-strong bg-card text-foreground shadow-xs hover:border-border-hover hover:bg-subtle",
  ghost: "text-muted hover:bg-subtle hover:text-foreground",
  soft: "bg-accent-soft text-accent hover:bg-accent/15",
  danger: "bg-danger-soft text-danger ring-1 ring-inset ring-danger/25 hover:bg-danger/15",
};

// Every size is >= 44px tall below the sm breakpoint (touch), then tightens on desktop.
const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-11 rounded-lg px-3 text-sm sm:h-8 sm:px-2.5 sm:text-[13px]",
  md: "h-11 rounded-lg px-4 text-[15px] sm:h-10 sm:text-sm",
  lg: "h-12 rounded-xl px-5 text-base",
  icon: "size-11 rounded-lg sm:size-9",
  "icon-sm": "size-11 rounded-lg sm:size-8",
};

export function buttonClass({
  variant = "secondary",
  size = "md",
  fullWidth,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], fullWidth && "w-full", className);
}

/** Shared look of every text-like form control (border, fill, focus ring, invalid state). */
export const controlSurface =
  "rounded-lg border border-border-strong bg-input text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 hover:border-border-hover";

const controlFocus = "focus:border-accent focus:ring-4 focus:ring-accent/15";
const controlInvalid =
  "aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:ring-danger/15";

/**
 * Single-line input. 44px tall on mobile, 40px from sm. Don't append height/padding/leading
 * utilities (they'd conflict); use <Textarea/> for multi-line text.
 */
export const inputClass = cn(
  "block w-full min-w-0 px-3.5 py-[9px] text-base leading-6 placeholder:text-faint disabled:cursor-not-allowed disabled:opacity-60 sm:py-[7px] sm:text-[15px]",
  controlSurface,
  controlFocus,
  controlInvalid,
);

/** Multi-line text area. Append min-h-* to size it; font-mono for code. */
export const textareaClass = cn(
  "block w-full min-w-0 min-h-40 resize-y px-3.5 py-3 text-base leading-relaxed placeholder:text-faint disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]",
  controlSurface,
  controlFocus,
  controlInvalid,
);

/** Surface for content blocks. */
export const cardClass = "rounded-xl border border-border bg-card shadow-xs";

/** Interactive card (links): lifts and strengthens its border on hover. */
export const interactiveCardClass = cn(
  cardClass,
  "transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border-hover hover:shadow-md",
  focusRing,
);

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

export const toneText: Record<Tone, string> = {
  neutral: "text-foreground",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export const toneFill: Record<Tone, string> = {
  neutral: "bg-muted",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const badgeTones: Record<Tone, string> = {
  neutral: "bg-subtle text-muted ring-border",
  accent: "bg-accent-soft text-accent ring-accent/20",
  success: "bg-success-soft text-success ring-success/20",
  warning: "bg-warning-soft text-warning ring-warning/25",
  danger: "bg-danger-soft text-danger ring-danger/20",
};

export function badgeClass(tone: Tone = "neutral", className?: string) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
    badgeTones[tone],
    className,
  );
}

/** Tinted icon tile used on tool cards, tool headers and empty states. */
export function iconTileClass(size: "xs" | "sm" | "md" | "lg" = "md", className?: string) {
  return cn(
    "grid shrink-0 place-items-center bg-linear-to-b from-accent-soft to-accent-soft/50 text-accent ring-1 ring-inset ring-accent/15",
    size === "xs" && "size-7 rounded-md [&_svg]:size-3.5",
    size === "sm" && "size-8 rounded-md [&_svg]:size-4",
    size === "md" && "size-10 rounded-lg [&_svg]:size-5",
    size === "lg" && "size-12 rounded-xl [&_svg]:size-6",
    className,
  );
}
