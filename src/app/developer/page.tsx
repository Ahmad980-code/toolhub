import type { Metadata } from "next";
import Link from "next/link";
import { Database, Info, LayoutDashboard, LockKeyhole, TriangleAlert } from "lucide-react";
import { ErrorsList, LogoutButton, ReportsList } from "@/components/developer/issues";
import { LoginForm } from "@/components/developer/login-form";
import { ToolsTable } from "@/components/developer/tools-table";
import { TrafficChart } from "@/components/developer/traffic-chart";
import { Badge, Callout, Stat, ToolSection } from "@/components/ui";
import { cn, focusRing } from "@/components/ui-styles";
import { isDeveloper, passwordConfigured } from "@/lib/analytics/auth";
import { loadDashboard, type Ranked, type Range } from "@/lib/analytics/dashboard";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Developer dashboard",
  robots: { index: false, follow: false },
};

const RANGES: Range[] = [7, 30, 90];

/** Server-side number formatting (the ui.tsx helpers are client-only). */
const fmt = (n: number, digits = 0) => (Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: digits }) : "—");

function delta(now: number, before: number) {
  if (!before) return now ? "new this period" : "no data yet";
  const pct = ((now - before) / before) * 100;
  return `${pct >= 0 ? "+" : "−"}${fmt(Math.abs(pct), 0)}% vs previous period`;
}

function Breakdown({ title, rows, empty }: { title: string; rows: Ranked; empty: string }) {
  const total = rows.reduce((n, r) => n + r.count, 0);
  const top = rows.slice(0, 7);
  const rest = rows.slice(7).reduce((n, r) => n + r.count, 0);
  const list = rest ? [...top, { label: "Other", count: rest }] : top;
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      {list.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 grid gap-2.5">
          {list.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="truncate text-foreground">{r.label}</span>
                <span className="shrink-0 text-muted tabular-nums">
                  {fmt(r.count, 0)} · {fmt((r.count / total) * 100, 0)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle" aria-hidden>
                <div className="h-full rounded-full bg-accent" style={{ width: `${(r.count / total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function DeveloperPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isDeveloper())) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 sm:py-28">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
          <LockKeyhole aria-hidden className="size-6" />
        </span>
        <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight text-foreground">Developer dashboard</h1>
        <p className="mt-2 text-center text-sm text-muted">For the {site.name} developers only.</p>
        <div className="mt-8">
          {passwordConfigured() ? (
            <LoginForm />
          ) : (
            <Callout tone="warning" icon={<TriangleAlert />} title="Login isn't set up">
              Add a <code>DEVELOPER_PASSWORD</code> environment variable in your hosting settings and redeploy.
            </Callout>
          )}
        </div>
      </div>
    );
  }

  const sp = await searchParams;
  const range: Range = RANGES.includes(Number(sp.days) as Range) ? (Number(sp.days) as Range) : 30;
  const d = await loadDashboard(range);
  const toolUses = d.tools.reduce((n, t) => n + t.uses, 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-center gap-4">
        <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
          <LayoutDashboard aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Developer dashboard</h1>
          <p className="text-sm text-muted">Traffic, tool usage, errors and bug reports for {site.name}</p>
        </div>
        <nav aria-label="Time range" className="flex gap-1 rounded-full bg-subtle p-1 ring-1 ring-border ring-inset">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/developer?days=${r}`}
              aria-current={r === range ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                focusRing,
                r === range ? "bg-card text-foreground shadow-sm ring-1 ring-border" : "text-muted hover:text-foreground",
              )}
            >
              {r} days
            </Link>
          ))}
        </nav>
        {passwordConfigured() && <LogoutButton />}
      </header>

      {d.backend === "none" && (
        <Callout tone="danger" icon={<Database />} title="Analytics storage isn't connected">
          Nothing is being recorded yet. In Vercel, open your project → Storage → add &ldquo;Upstash for Redis&rdquo;
          (free) and connect it to this project, then redeploy. The dashboard fills up automatically.
        </Callout>
      )}
      {d.backend === "file" && (
        <Callout tone="neutral" icon={<Info />} title="Local mode">
          Data is saved in <code>.analytics/data.json</code> on this computer. On the live site, connect Upstash Redis
          so real visitors are recorded. Automated test browsers are ignored, so open the site yourself to see data.
        </Callout>
      )}
      {!passwordConfigured() && (
        <Callout tone="warning" icon={<TriangleAlert />} title="No password set">
          This page is open because you&apos;re running locally. Set <code>DEVELOPER_PASSWORD</code> before deploying,
          otherwise the live dashboard stays locked.
        </Callout>
      )}

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Page views" value={fmt(d.totals.views, 0)} hint={delta(d.totals.views, d.previous.views)} />
        <Stat label="Unique visitors" value={fmt(d.totals.visitors, 0)} hint={delta(d.totals.visitors, d.previous.visitors)} />
        <Stat label="Tool uses" value={fmt(d.totals.uses, 0)} hint={delta(d.totals.uses, d.previous.uses)} />
        <Stat label="Errors" value={fmt(d.totals.errors, 0)} hint={delta(d.totals.errors, d.previous.errors)} tone={d.totals.errors ? "danger" : undefined} />
        <Stat label="Open bug reports" value={fmt(d.totals.openReports, 0)} hint="sent by visitors" tone={d.totals.openReports ? "warning" : undefined} />
      </section>

      <ToolSection title="Traffic history" description={`Last ${range} days, by day (UTC). Hover a day for details.`}>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <TrafficChart rows={d.daily} />
        </div>
        <details className="mt-3">
          <summary className={cn("cursor-pointer rounded-sm text-sm font-medium text-muted hover:text-foreground", focusRing)}>
            Show as a table
          </summary>
          <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-subtle text-left text-[12px] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 text-right font-medium">Views</th>
                  <th className="px-3 py-2 text-right font-medium">Visitors</th>
                  <th className="px-3 py-2 text-right font-medium">Tool uses</th>
                  <th className="px-3 py-2 text-right font-medium">Errors</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {[...d.daily].reverse().map((r) => (
                  <tr key={r.day} className="border-t border-border">
                    <td className="px-3 py-1.5">{r.day}</td>
                    <td className="px-3 py-1.5 text-right">{r.views}</td>
                    <td className="px-3 py-1.5 text-right">{r.visitors}</td>
                    <td className="px-3 py-1.5 text-right">{r.uses}</td>
                    <td className="px-3 py-1.5 text-right">{r.errors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </ToolSection>

      <ToolSection
        title="Tools"
        description={`Views of each tool page and how many visits actually used the tool (${fmt(toolUses, 0)} uses in total). Click a column to sort.`}
      >
        <ToolsTable rows={d.tools} />
      </ToolSection>

      <section aria-label="Audience" className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Breakdown title="Traffic sources" rows={d.referrers} empty="No visits from other websites yet." />
        <Breakdown title="Countries" rows={d.countries} empty="No visits yet." />
        <Breakdown title="Other pages" rows={d.pages} empty="No visits yet." />
        <Breakdown title="Devices" rows={d.devices} empty="No visits yet." />
        <Breakdown title="Browsers" rows={d.browsers} empty="No visits yet." />
      </section>

      <ToolSection
        title={
          <span className="inline-flex items-center gap-2">
            Errors {d.errors.length > 0 && <Badge tone="danger">{d.errors.length}</Badge>}
          </span>
        }
        description="JavaScript errors and tool crashes captured automatically in visitors' browsers, grouped by message."
      >
        <ErrorsList errors={d.errors} />
      </ToolSection>

      <ToolSection
        title={
          <span className="inline-flex items-center gap-2">
            Bug reports {d.totals.openReports > 0 && <Badge tone="warning">{d.totals.openReports} open</Badge>}
          </span>
        }
        description='Problems reported by visitors with the "Report a problem" button on each tool page.'
      >
        <ReportsList reports={d.reports} />
      </ToolSection>
    </div>
  );
}
