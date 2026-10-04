import type { Metadata } from "next";
import { GraduationCap, Mail } from "lucide-react";
import { ProsePage } from "@/components/prose-page";
import { cn, focusRing, iconTileClass } from "@/components/ui-styles";
import { site } from "@/lib/site";
import { department, developers, university } from "@/lib/team";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact the ${site.name} developers with questions, feedback or tool suggestions.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <ProsePage
      title="Contact us"
      description="Questions, feedback, a bug report or an idea for a new tool? We'd love to hear from you."
    >
      <p>Email either of the developers directly. We usually reply within two business days.</p>
      <ul className="not-prose my-8 grid list-none gap-3 p-0 sm:grid-cols-2">
        {developers.map((dev) => (
          <li key={dev.email} className="m-0 list-none rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <span className={iconTileClass("md")} aria-hidden>
                <span className="text-sm font-semibold">{dev.initials}</span>
              </span>
              <div className="min-w-0">
                <p className="m-0 font-semibold text-foreground">{dev.name}</p>
                <p className="m-0 text-[13px] text-muted">{dev.role}</p>
              </div>
            </div>
            <a
              href={`mailto:${dev.email}`}
              className={cn(
                "mt-4 flex min-h-11 items-center gap-2 rounded-lg border border-border-strong bg-subtle px-3 text-sm font-medium break-all text-foreground no-underline transition-colors hover:border-accent hover:text-accent",
                focusRing,
              )}
            >
              <Mail aria-hidden className="size-4 shrink-0 text-accent" />
              {dev.email}
            </a>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2">
        <GraduationCap aria-hidden className="size-4 shrink-0 text-accent" />
        {site.name} is built by students of the {department}, {university}.
      </p>
    </ProsePage>
  );
}
