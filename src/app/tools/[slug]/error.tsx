"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button, buttonClass } from "@/components/ui";
import { track } from "@/lib/analytics/client";

/** Shown if a tool crashes; the error is reported to the developer dashboard automatically. */
export default function ToolError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    track({
      type: "error",
      path: location.pathname,
      message: error.message || "A tool crashed",
      stack: error.stack ?? "",
      source: "crash",
    });
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <TriangleAlert aria-hidden className="mx-auto size-10 text-warning" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">This tool ran into a problem</h1>
      <p className="mt-3 text-muted">
        Sorry about that. The error has been reported to the developers automatically. Try again, or pick another
        tool while we fix it.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="primary" onClick={() => retry()}>
          <RotateCcw /> Try again
        </Button>
        <Link href="/#tools" className={buttonClass({ variant: "secondary" })}>
          Browse all tools
        </Link>
      </div>
    </div>
  );
}
