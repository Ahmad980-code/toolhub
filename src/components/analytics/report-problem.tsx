"use client";

import { CircleCheck, Flag, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button, Callout, Field, Input, Textarea } from "@/components/ui";

/** "Report a problem" link under each tool that opens a short bug-report form. */
export function ReportProblem({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 5) {
      setError("Please describe the problem in a few words.");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        body: JSON.stringify({ type: "report", slug, path: location.pathname, text, contact }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Couldn't send the report");
      setState("sent");
      setText("");
      setContact("");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Couldn't send the report");
    }
  }

  if (state === "sent") {
    return (
      <Callout tone="success" icon={<CircleCheck />} title="Thanks for the report!">
        The developers will look into it. You can keep using the tool.
      </Callout>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-muted">
        Something not working right?
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <Flag /> Report a problem
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">Report a problem with the {name}</h2>
        <p className="mt-1 text-sm text-muted">
          Tell us what you did and what went wrong. Please don&apos;t include passwords or private data.
        </p>
      </div>
      <Field label="What went wrong?" error={error ?? undefined}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. When I enter 250 units the bill looks too high"
          maxLength={2000}
          className="min-h-28"
          invalid={!!error}
          autoFocus
        />
      </Field>
      <Field label="Your email (optional)" hint="Only if you'd like a reply">
        <Input type="email" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={200} placeholder="name@example.com" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={state === "sending"}>
          {state === "sending" ? <LoaderCircle className="animate-spin" /> : <Flag />}
          {state === "sending" ? "Sending…" : "Send report"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
