import Link from "next/link";
import { site } from "@/lib/site";
import { CommandMenu } from "./command-menu";
import { MobileMenu, NavLink, ToolsMenu } from "./header-nav";
import { Logo } from "./logo";
import { navGroups } from "./nav-data";
import { ThemeToggle } from "./theme";
import { cn, focusRing } from "./ui-styles";

/** Sticky site header: brand, primary nav, search, theme toggle and the mobile menu. */
export function Header() {
  const groups = navGroups();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" aria-label={`${site.name} home`} className={cn("-ml-1 mr-3 rounded-lg p-1", focusRing)}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
          <ToolsMenu groups={groups} />
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <CommandMenu groups={groups} />
          <ThemeToggle className="text-foreground sm:text-muted sm:hover:text-foreground" />
          <MobileMenu groups={groups} />
        </div>
      </div>
    </header>
  );
}
