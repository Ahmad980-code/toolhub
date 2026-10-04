"use client";

import { THEME_SCRIPT } from "./theme-script";

/**
 * Renders THEME_SCRIPT in <head>. On the server it is a real script (runs during HTML parsing,
 * before first paint). If React ever renders it on the client (soft navigation, error recovery)
 * it becomes inert text/plain, which avoids React's "script tag while rendering" warning.
 * Pattern from node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md.
 */
export function ThemeInitScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
