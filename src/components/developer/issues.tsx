"use client";

import Link from "next/link";
import { Bug, Check, CircleCheck, LogOut, Mail, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge, Button, EmptyState, SegmentedControl, cn, focusRing } from "@/components/ui";
import type { ErrorRow, ReportRow } from "@/lib/analytics/dashboard";

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (action: string, id?: string) =>
    start(async () => {
      await fetch("/api/developer/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      }).catch(() => null);
      router.refresh();
    });
  return { run, pending };
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        await fetch("/api/developer/session", { method: "DELETE" }).catch(() => null);
        router.refresh();
      }}
    >
      <LogOut /> Log out
    </Button>
  );
}

export function ErrorsList({ errors }: { errors: ErrorRow[] }) {
  const { run, pending } = useAction();
  if (!errors.length)
    return <EmptyState icon={<CircleCheck />} title="No errors reported" description="JavaScript errors from visitors' browsers will appear here." />;
  return (
    <div className={cn("grid gap-3", pending && "opacity-60")}>
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onClick={() => confirm("Remove every error from the list?") && run("clear-errors")}>
          <Trash2 /> Clear all
        </Button>
      </div>
      <ul className="grid gap-3">
        {errors.map((e) => (
          <li key={e.sig} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start gap-3">
              <Bug aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[13px] break-words text-foreground">{e.message}</p>
                <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
                  <span>
                    <Link href={e.path === "other" ? "/" : e.path} className={cn("rounded-sm underline-offset-2 hover:underline", focusRing)}>
                      {e.pageName}
                    </Link>
                  </span>
                  <span>{e.browser}</span>
                  <span>last seen {e.lastSeenAgo}</span>
                  <span>first seen {e.firstSeenAgo}</span>
                  <span>source: {e.source}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone="danger">{e.inRange} in period</Badge>
                <Badge>{e.total} total</Badge>
                <Button size="sm" onClick={() => run("dismiss-error", e.sig)}>
                  <Check /> Mark fixed
                </Button>
              </div>
            </div>
            {e.stack && (
              <details className="mt-3">
                <summary className={cn("cursor-pointer rounded-sm text-[12px] font-medium text-muted hover:text-foreground", focusRing)}>
                  Stack trace
                </summary>
                <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-subtle p-3 font-mono text-[11px] leading-5 whitespace-pre-wrap text-muted">
                  {e.stack}
                </pre>
              </details>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportsList({ reports }: { reports: ReportRow[] }) {
  const { run, pending } = useAction();
  const [filter, setFilter] = useState<"open" | "all">("open");
  const open = reports.filter((r) => r.status === "open");
  const shown = filter === "open" ? open : reports;

  return (
    <div className={cn("grid gap-3", pending && "opacity-60")}>
      <SegmentedControl
        label="Show reports"
        value={filter}
        onChange={setFilter}
        size="sm"
        className="justify-self-start"
        options={[
          { value: "open", label: `Open (${open.length})` },
          { value: "all", label: `All (${reports.length})` },
        ]}
      />
      {shown.length === 0 ? (
        <EmptyState
          icon={<CircleCheck />}
          title={filter === "open" ? "No open bug reports" : "No bug reports yet"}
          description='Visitors can send reports with the "Report a problem" button under every tool.'
        />
      ) : (
        <ul className="grid gap-3">
          {shown.map((r) => (
            <li key={r.id} className={cn("rounded-xl border border-border bg-card p-4", r.status === "resolved" && "opacity-70")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{r.toolName}</span>
                <Badge tone={r.status === "open" ? "warning" : "success"}>{r.status === "open" ? "Open" : "Resolved"}</Badge>
                <span className="text-[12px] text-muted">
                  {r.ago} · {r.device} · {r.browser}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-foreground">{r.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.contact && (
                  <a
                    href={`mailto:${r.contact}?subject=${encodeURIComponent(`Your ToolHub report: ${r.toolName}`)}`}
                    className={cn("mr-auto inline-flex items-center gap-1.5 rounded-sm text-sm text-accent hover:underline", focusRing)}
                  >
                    <Mail aria-hidden className="size-4" /> {r.contact}
                  </a>
                )}
                {r.status === "open" ? (
                  <Button size="sm" onClick={() => run("resolve-report", r.id)}>
                    <Check /> Mark resolved
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => run("reopen-report", r.id)}>
                    <RotateCcw /> Reopen
                  </Button>
                )}
                <Button size="sm" variant="ghost" aria-label="Delete report" onClick={() => confirm("Delete this report?") && run("delete-report", r.id)}>
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
