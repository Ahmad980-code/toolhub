import { GraduationCap } from "lucide-react";
import { department, developerNames, developers, university } from "@/lib/team";

/** "Developers" band shown at the bottom of every page, above the copyright line. */
export function DeveloperCredit() {
  return (
    <section aria-labelledby="developers-heading" className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="developers-heading" className="text-xs font-semibold uppercase tracking-wider text-muted">
            Developers
          </h2>
          <p className="mt-2 text-sm text-foreground">
            Co-developed by <span className="font-semibold">{developerNames}</span>
          </p>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
            <GraduationCap className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              {department}
              <br />
              {university}
            </span>
          </p>
        </div>

        <ul className="flex flex-wrap gap-3">
          {developers.map((dev) => (
            <li
              key={dev.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
              >
                {dev.initials}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">{dev.name}</span>
                <span className="block text-xs text-muted">{dev.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
