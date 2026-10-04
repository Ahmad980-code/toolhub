"use client";

import { Check, ChevronDown, Copy } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import {
  badgeClass,
  buttonClass,
  cardClass,
  cn,
  controlSurface,
  focusRing,
  iconTileClass,
  inputClass,
  interactiveCardClass,
  textareaClass,
  toneFill,
  toneText,
  type ButtonSize,
  type ButtonVariant,
  type Tone,
} from "./ui-styles";

export {
  badgeClass,
  buttonClass,
  cardClass,
  cn,
  focusRing,
  iconTileClass,
  inputClass,
  interactiveCardClass,
  textareaClass,
  toneFill,
  toneText,
};
export type { ButtonSize, ButtonVariant, Tone };

/* -------------------------------------------------------------------------------------------------
 * Form fields
 * -----------------------------------------------------------------------------------------------*/

/**
 * Labelled form row. By default it renders a <label> that wraps the control, so no ids are needed.
 * Use as="group" when the child is not a single input (SegmentedControl, checkbox list, ...): it
 * renders role="group" named by the label instead.
 */
export function Field({
  label,
  children,
  hint,
  error,
  aside,
  as = "label",
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  /** Helper text under the control. */
  hint?: ReactNode;
  /** Error text under the control (replaces hint). Also pass `invalid` to the control. */
  error?: ReactNode;
  /** Right-aligned content in the label row, e.g. the current value of a slider. */
  aside?: ReactNode;
  as?: "label" | "group";
  className?: string;
}) {
  const id = useId();
  const labelRow = (
    <span className="flex min-h-5 items-baseline justify-between gap-3">
      <span id={`${id}-label`} className="text-sm font-medium text-foreground">
        {label}
      </span>
      {aside != null && <span className="text-sm font-medium text-muted tabular-nums">{aside}</span>}
    </span>
  );
  const footer = error ? (
    <span className="text-[13px] leading-5 text-danger">{error}</span>
  ) : hint ? (
    <span className="text-[13px] leading-5 text-muted">{hint}</span>
  ) : null;

  if (as === "group") {
    return (
      <div role="group" aria-labelledby={`${id}-label`} className={cn("flex min-w-0 flex-col gap-2", className)}>
        {labelRow}
        {children}
        {footer}
      </div>
    );
  }
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label className="flex min-w-0 flex-col gap-2">
        {labelRow}
        {children}
      </label>
      {footer}
    </div>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> & {
  /** Adornment inside the left edge, e.g. "$". */
  prefix?: ReactNode;
  /** Adornment inside the right edge, e.g. "%", "kg", "years". */
  suffix?: ReactNode;
  /** Marks the value invalid (red border + aria-invalid). */
  invalid?: boolean;
};

/** Text-like input with optional prefix/suffix adornments. `className` styles the outer box. */
export function Input({ prefix, suffix, invalid, className, onWheel, ...props }: InputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const handleWheel: InputProps["onWheel"] = (e) => {
    // A focused number input changes value on scroll; blur it so scrolling the page is safe.
    if (e.currentTarget.type === "number" && document.activeElement === e.currentTarget) e.currentTarget.blur();
    onWheel?.(e);
  };

  if (prefix == null && suffix == null) {
    return (
      <input
        className={cn(inputClass, className)}
        aria-invalid={invalid || undefined}
        onWheel={handleWheel}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        controlSurface,
        "flex w-full min-w-0 cursor-text items-center focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15",
        invalid && "border-danger focus-within:border-danger focus-within:ring-danger/15",
        props.disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      onPointerDown={(e) => {
        if (e.target !== ref.current) {
          e.preventDefault();
          ref.current?.focus();
        }
      }}
    >
      {prefix != null && (
        <span className="flex shrink-0 select-none items-center pl-3.5 text-[15px] text-muted [&_svg]:size-4">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full min-w-0 flex-1 bg-transparent py-[9px] text-base leading-6 text-foreground outline-none placeholder:text-faint disabled:cursor-not-allowed sm:py-[7px] sm:text-[15px]",
          prefix != null ? "pl-2" : "pl-3.5",
          suffix != null ? "pr-2" : "pr-3.5",
        )}
        aria-invalid={invalid || undefined}
        onWheel={handleWheel}
        {...props}
      />
      {suffix != null && (
        <span className="flex shrink-0 select-none items-center pr-3.5 text-sm text-muted [&_svg]:size-4">
          {suffix}
        </span>
      )}
    </div>
  );
}

/** Numeric input bound to a string (so "" means empty). Parse with num(). */
export function NumberInput({
  value,
  onChange,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
} & Omit<InputProps, "value" | "onChange">) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

/** Multi-line text input. Use `mono` for code/data (JSON, Base64). */
export function Textarea({
  className,
  mono,
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { mono?: boolean; invalid?: boolean }) {
  return (
    <textarea
      className={cn(textareaClass, mono && "font-mono text-sm leading-relaxed sm:text-[13px]", className)}
      spellCheck={mono ? false : undefined}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

/** Native <select> (best on mobile) with the system look. Pass <option> children. */
export function Select({
  className,
  children,
  invalid,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <select
        className={cn(inputClass, "cursor-pointer appearance-none pr-10")}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

/** Styled checkbox with a label (and optional description). The whole row is the hit target. */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "group flex min-h-11 cursor-pointer items-start gap-3 py-2.5 sm:min-h-9 sm:py-1.5",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer size-5 cursor-[inherit] appearance-none rounded-[6px] border border-border-strong bg-input shadow-xs transition-colors group-hover:border-border-hover checked:border-primary checked:bg-primary group-hover:checked:border-primary-hover group-hover:checked:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute size-3.5 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] leading-6 text-foreground sm:text-sm">{label}</span>
        {description && <span className="block text-[13px] text-muted">{description}</span>}
      </span>
    </label>
  );
}

/** On/off switch (role="switch"). Prefer for settings that apply immediately. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-h-11 items-center justify-between gap-4 sm:min-h-9", className)}>
      <label htmlFor={id} className={cn("min-w-0 cursor-pointer", disabled && "cursor-not-allowed opacity-50")}>
        <span className="block text-[15px] leading-6 text-foreground sm:text-sm">{label}</span>
        {description && <span className="block text-[13px] text-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
          "before:absolute before:-inset-2.5 before:content-['']",
          checked ? "bg-primary" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

/** Range slider. Pair with <Field label="Length" aside={value}> to show the current value. */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  ...props
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "min" | "max" | "step" | "type">) {
  const fill = max > min ? ((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100 : 0;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("range h-11 sm:h-8", className)}
      style={{ "--fill": `${fill}%` } as CSSProperties}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Buttons
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button. `variant` defaults to "secondary". Legacy: `active` (without a variant) renders the
 * primary style; for selected/unselected option sets use SegmentedControl instead.
 */
export function Button({
  active,
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  return (
    <button
      type={type}
      className={buttonClass({ variant: variant ?? (active ? "primary" : "secondary"), size, fullWidth, className })}
      {...props}
    />
  );
}

export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

/**
 * Mutually exclusive options shown as a pill track (radio-group semantics, arrow-key navigation).
 * Use for modes and unit systems: "Metric | Imperial", "Encode | Decode", "Years | Months".
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  fullWidth,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  /** Accessible name of the group (not shown). */
  label: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    for (let step = 1; step <= options.length; step++) {
      const i = (index + dir * step + options.length) % options.length;
      if (!options[i].disabled) {
        onChange(options[i].value);
        refs.current[i]?.focus();
        return;
      }
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "gap-1 rounded-lg bg-subtle p-1 ring-1 ring-inset ring-border",
        fullWidth ? "flex w-full" : "inline-flex max-w-full",
        className,
      )}
    >
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "relative inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md px-3 font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-150 disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
              "before:absolute before:-inset-y-1 before:inset-x-0 before:content-['']",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
              size === "md" ? "h-9 text-[15px] sm:h-8 sm:text-sm" : "h-9 text-sm sm:h-7 sm:px-2.5 sm:text-[13px]",
              fullWidth && "flex-1",
              selected
                ? "bg-card text-foreground shadow-sm ring-1 ring-border dark:bg-elevated"
                : "text-muted hover:text-foreground",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Copies `text` to the clipboard and confirms with a check mark. Disabled while `text` is empty. */
export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  size = "md",
  variant = "secondary",
  iconOnly,
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  /** Square icon button (uses label as aria-label). */
  iconOnly?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        el.setAttribute("readonly", "");
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        el.remove();
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked (e.g. insecure context or permissions); nothing else to do.
    }
  }

  return (
    <Button
      variant={variant}
      size={iconOnly ? (size === "sm" ? "icon-sm" : "icon") : size}
      disabled={!text}
      onClick={copy}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      className={className}
    >
      {copied ? <Check aria-hidden className="text-success" /> : <Copy aria-hidden />}
      {!iconOnly && <span>{copied ? copiedLabel : label}</span>}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </Button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Surfaces & results
 * -----------------------------------------------------------------------------------------------*/

/** Bordered surface. `padded` adds the standard p-5 (p-4 on mobile). */
export function Card({
  className,
  padded = true,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div className={cn(cardClass, padded && "p-4 sm:p-5", className)} {...props}>
      {children}
    </div>
  );
}

/** Sub-section inside a tool: title row (with optional actions) above its content. */
export function ToolSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

/**
 * Standard calculator layout: inputs on the left, results on the right (stacked on mobile).
 * `results` is wrapped in a ResultsPanel automatically.
 */
export function ToolLayout({
  inputs,
  results,
  className,
}: {
  inputs: ReactNode;
  results: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid items-start gap-5 md:grid-cols-2 md:gap-6", className)}>
      <div className="flex min-w-0 flex-col gap-5">{inputs}</div>
      <ResultsPanel>{results}</ResultsPanel>
    </div>
  );
}

/** Tinted inset that holds a tool's results. */
export function ResultsPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      aria-label="Results"
      className={cn("flex min-w-0 flex-col gap-3 rounded-xl bg-subtle p-3 ring-1 ring-border ring-inset sm:p-4", className)}
    >
      {children}
    </section>
  );
}

/** Small metric tile. `highlight` tints it with the accent (use for at most one per group). */
export function Stat({
  label,
  value,
  highlight,
  hint,
  icon,
  tone,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  highlight?: boolean;
  /** Secondary line under the value. */
  hint?: ReactNode;
  icon?: ReactNode;
  /** Colors the value (e.g. success for "Normal weight"). */
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border p-3.5 sm:p-4",
        highlight ? "border-accent/25 bg-accent-soft" : "border-border bg-card shadow-xs",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted [&_svg]:size-3.5">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-xl font-semibold tracking-tight break-words tabular-nums sm:text-2xl",
          tone ? toneText[tone] : highlight ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[13px] text-muted">{hint}</div>}
    </div>
  );
}

/**
 * The hero answer of a tool: large value, label, optional caption, copy button and extra content.
 * Shows `placeholder` (muted) while `value` is empty, so the layout never jumps.
 */
export function ResultCard({
  label,
  value,
  caption,
  copyText,
  placeholder = "—",
  tone = "accent",
  size = "lg",
  children,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  caption?: ReactNode;
  /** When set (non-empty), shows a copy button that copies this text. */
  copyText?: string;
  placeholder?: ReactNode;
  /** Tints the card; use success/warning/danger for verdict-style results. */
  tone?: Tone;
  size?: "md" | "lg";
  children?: ReactNode;
  className?: string;
}) {
  const empty = value == null || value === "" || value === false;
  const tint: Record<Tone, string> = {
    neutral: "border-border from-card to-card",
    accent: "border-accent/20 from-accent-soft to-card",
    success: "border-success/25 from-success-soft to-card",
    warning: "border-warning/25 from-warning-soft to-card",
    danger: "border-danger/25 from-danger-soft to-card",
  };
  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-xl border bg-linear-to-b p-5 shadow-sm",
        tint[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="pt-1 text-sm font-medium text-muted">{label}</div>
        {copyText !== undefined && (
          <CopyButton text={empty ? "" : copyText} size="sm" variant="ghost" className="-mt-1 -mr-2" />
        )}
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "mt-1 font-semibold tracking-tight break-words tabular-nums",
          size === "lg" ? "text-4xl leading-tight sm:text-[2.75rem]" : "text-3xl leading-tight",
          empty ? "text-faint" : tone === "neutral" || tone === "accent" ? "text-foreground" : toneText[tone],
        )}
      >
        {empty ? placeholder : value}
      </div>
      {caption && <div className="mt-1.5 text-sm text-muted">{caption}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/** Status pill. */
export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={badgeClass(tone, className)}>{children}</span>;
}

/** Horizontal gauge (password strength, BMI position, progress). `value` is 0–1. */
export function Meter({
  value,
  tone = "accent",
  label,
  valueLabel,
  className,
}: {
  value: number;
  tone?: Tone;
  /** Accessible name; also shown on the left above the bar. */
  label: string;
  /** Shown on the right above the bar (e.g. "Strong"). */
  valueLabel?: ReactNode;
  className?: string;
}) {
  const pct = Math.round(Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 1) * 100);
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        {valueLabel != null && <span className={cn("font-medium", toneText[tone])}>{valueLabel}</span>}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-2 overflow-hidden rounded-full bg-border-strong/60"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-300 ease-out", toneFill[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Centered placeholder for "nothing to show yet". Keep the copy short and actionable. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong px-6 py-10 text-center",
        className,
      )}
    >
      {icon && <span className={iconTileClass("md", "mb-3")}>{icon}</span>}
      <p className="text-[15px] font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Inline message box. tone="danger" announces itself (role="alert"). */
export function Callout({
  tone = "neutral",
  title,
  icon,
  children,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const tones: Record<Tone, string> = {
    neutral: "border-border bg-subtle",
    accent: "border-accent/20 bg-accent-soft",
    success: "border-success/25 bg-success-soft",
    warning: "border-warning/30 bg-warning-soft",
    danger: "border-danger/25 bg-danger-soft",
  };
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm", tones[tone], className)}
    >
      {icon && <span className={cn("mt-0.5 shrink-0 [&_svg]:size-4", toneText[tone])}>{icon}</span>}
      <div className="min-w-0">
        {title && <p className={cn("font-medium", toneText[tone])}>{title}</p>}
        {children && <div className={cn("break-words text-foreground/80", title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}

/**
 * Scrollable data table with the system styling. Write normal <thead>/<tbody>; add className="num"
 * (or text-right) to numeric th/td cells. `maxHeight` makes the body scroll with a sticky header.
 */
export function Table({
  children,
  className,
  maxHeight,
  label,
}: {
  children: ReactNode;
  className?: string;
  maxHeight?: number;
  /** Accessible name for the scroll region. */
  label?: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "overflow-auto rounded-xl border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="data-table">{children}</table>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Number helpers (locale pinned to en-US so SSR and the browser agree)
 * -----------------------------------------------------------------------------------------------*/

/** Parses a user-typed number; returns NaN for empty input. */
export function num(value: string) {
  return value.trim() === "" ? NaN : Number(value);
}

export function fmt(value: number, maxDigits = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: maxDigits });
}

export function money(value: number) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
