import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn, focusRing } from "./ui-styles";

/** Layout for simple text pages (about, privacy, terms, contact). */
export function ProsePage({
  title,
  updated,
  description,
  children,
}: {
  title: string;
  /** "Last updated" date, shown under the title. */
  updated?: string;
  /** Optional lead paragraph under the title. */
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <header className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-fade" />
        <div
          aria-hidden
          className="absolute inset-x-0 -top-32 -z-10 mx-auto h-64 max-w-2xl rounded-full bg-accent/15 blur-3xl dark:bg-accent/10"
        />
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
            <Link href="/" className={cn("rounded-sm transition-colors hover:text-foreground", focusRing)}>
              Home
            </Link>
            <ChevronRight aria-hidden className="size-3.5 text-faint" />
            <span aria-current="page" className="text-foreground">
              {title}
            </span>
          </nav>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">{title}</h1>
          {description && <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{description}</p>}
          {updated && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] text-muted shadow-xs">
              <span aria-hidden className="size-1.5 rounded-full bg-success" />
              Last updated {updated}
            </p>
          )}
        </div>
      </header>
      <article className="prose-content mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">{children}</article>
    </>
  );
}
