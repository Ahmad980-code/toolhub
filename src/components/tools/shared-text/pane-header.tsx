import type { ReactNode } from "react";

/**
 * Title row above an editor: a label (bound to the textarea when `htmlFor` is set), muted meta
 * text such as a size or count, and right-aligned actions.
 */
export function PaneHeader({
  label,
  htmlFor,
  meta,
  actions,
}: {
  label: ReactNode;
  htmlFor?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 sm:min-h-9">
      <div className="flex min-w-0 items-baseline gap-2">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : (
          <span className="text-sm font-medium text-foreground">{label}</span>
        )}
        {meta != null && <span className="truncate text-[13px] text-muted tabular-nums">{meta}</span>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}
