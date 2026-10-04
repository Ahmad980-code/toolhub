import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { buttonClass, iconTileClass } from "@/components/ui-styles";
import { tools } from "@/lib/tools";

const popular = ["percentage-calculator", "word-counter", "loan-calculator", "password-generator"];

export default function NotFound() {
  const suggestions = popular
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is (typeof tools)[number] => Boolean(t));

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <div
        aria-hidden
        className="absolute inset-x-0 -top-40 -z-10 mx-auto h-80 max-w-3xl rounded-full bg-accent/15 blur-3xl dark:bg-accent/10"
      />
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-8 text-center sm:px-6 sm:pt-28">
        <span className={iconTileClass("lg", "mx-auto")}>
          <Compass aria-hidden />
        </span>
        <p className="mt-6 text-sm font-semibold tracking-wide text-accent">404 error</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-muted">
          The link may be broken or the page may have moved. Try one of our most popular tools instead.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/#tools" className={buttonClass({ variant: "primary", size: "lg" })}>
            Browse all tools
          </Link>
          <Link href="/" className={buttonClass({ variant: "secondary", size: "lg" })}>
            <ArrowLeft aria-hidden />
            Back to home
          </Link>
        </div>
      </div>

      <section aria-labelledby="popular-tools" className="mx-auto max-w-3xl px-4 pt-10 pb-4 sm:px-6">
        <h2 id="popular-tools" className="text-center text-sm font-medium text-muted">
          Popular tools
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {suggestions.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
