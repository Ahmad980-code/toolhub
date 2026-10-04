import Link from "next/link";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import { DeveloperCredit } from "@/components/developer-credit";
import { site } from "@/lib/site";
import { Logo } from "./logo";
import { companyLinks, navGroups } from "./nav-data";
import { ThemeSwitcher } from "./theme";
import { cn, focusRing } from "./ui-styles";

const linkClass = cn("rounded-sm text-sm text-muted transition-colors hover:text-foreground", focusRing);

const promises = [
  { icon: Zap, text: "Instant results" },
  { icon: Lock, text: "Runs in your browser" },
  { icon: ShieldCheck, text: "No sign-up" },
];

// Evaluated when the Server Component renders (build time), never during hydration.
const year = new Date().getFullYear();

export function Footer() {
  const groups = navGroups();
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <Link
              href="/"
              aria-label={`${site.name} home`}
              className={cn("-m-1 inline-flex rounded-lg p-1", focusRing)}
            >
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
              Free online calculators, converters and text tools. Everything runs in your browser, so what you
              type never leaves your device.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 lg:flex-col">
              {promises.map(({ icon: PromiseIcon, text }) => (
                <li key={text} className="flex items-center gap-1.5 text-[13px] font-medium text-foreground/80">
                  <PromiseIcon aria-hidden className="size-3.5 text-accent" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* CSS columns balance the uneven group lengths better than a grid would. */}
          <nav aria-label="Footer" className="columns-2 gap-x-6 sm:columns-3 lg:col-span-9 lg:columns-4">
            {groups.map((group) => (
              <div key={group.id} className="mb-10 break-inside-avoid">
                <h2 className="text-[13px] font-semibold text-foreground">{group.name}</h2>
                <ul className="mt-3.5 space-y-2.5">
                  {group.tools.map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/tools/${tool.slug}`} className={linkClass}>
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="mb-10 break-inside-avoid">
              <h2 className="text-[13px] font-semibold text-foreground">Company</h2>
              <ul className="mt-3.5 space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Keep: developer credit (Ahmad Saleem Awan & Muhammad Alam Khan) requested by the site owner.
          The wrapper aligns its inner container with the footer's sm:px-6 gutter. */}
      <div className="sm:[&>section>div]:px-6">
        <DeveloperCredit />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6">
          <p className="text-[13px] text-muted">
            © {year} {site.name}. All rights reserved.
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}
