"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { useState } from "react";
import { Badge, Table, cn, fmt, focusRing } from "@/components/ui";
import type { ToolRow } from "@/lib/analytics/dashboard";

type SortKey = "name" | "views" | "uses" | "rate" | "errors" | "reports";
const rate = (t: ToolRow) => (t.views ? t.uses / t.views : 0);

/** Every tool with its views, uses, use rate, errors and open bug reports; click a header to sort. */
export function ToolsTable({ rows }: { rows: ToolRow[] }) {
  const [sort, setSort] = useState<SortKey>("views");
  const sorted = [...rows].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    const va = sort === "rate" ? rate(a) : a[sort];
    const vb = sort === "rate" ? rate(b) : b[sort];
    return vb - va || a.name.localeCompare(b.name);
  });
  const maxViews = Math.max(1, ...rows.map((r) => r.views));

  const header = (key: SortKey, label: string, numeric = true) => (
    <th className={numeric ? "num" : undefined} aria-sort={sort === key ? (key === "name" ? "ascending" : "descending") : undefined}>
      <button
        type="button"
        onClick={() => setSort(key)}
        className={cn("inline-flex items-center gap-1 rounded-sm font-medium", focusRing, sort === key ? "text-foreground" : "")}
      >
        {label}
        {sort === key && <ArrowDown aria-hidden className={cn("size-3", key === "name" && "rotate-180")} />}
      </button>
    </th>
  );

  return (
    <Table label="Tool usage" maxHeight={560}>
      <thead>
        <tr>
          {header("name", "Tool", false)}
          {header("views", "Views")}
          {header("uses", "Uses")}
          {header("rate", "Use rate")}
          {header("errors", "Errors")}
          {header("reports", "Reports")}
        </tr>
      </thead>
      <tbody>
        {sorted.map((t) => (
          <tr key={t.slug}>
            <td>
              <Link href={`/tools/${t.slug}`} className={cn("rounded-sm font-medium text-foreground hover:text-accent", focusRing)}>
                {t.name}
              </Link>
              <span className="block text-[12px] text-muted">{t.category}</span>
            </td>
            <td className="num">
              <div className="flex items-center justify-end gap-2">
                <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-subtle sm:block" aria-hidden>
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${(t.views / maxViews) * 100}%` }} />
                </span>
                {fmt(t.views, 0)}
              </div>
            </td>
            <td className="num">{fmt(t.uses, 0)}</td>
            <td className="num">{t.views ? `${fmt(rate(t) * 100, 0)}%` : "—"}</td>
            <td className="num">{t.errors ? <Badge tone="danger">{t.errors}</Badge> : <span className="text-faint">0</span>}</td>
            <td className="num">{t.reports ? <Badge tone="warning">{t.reports}</Badge> : <span className="text-faint">0</span>}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
