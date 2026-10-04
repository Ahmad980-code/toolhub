/** Shared theme constants (server-safe: no "use client", so layout.tsx can inline the script). */

export const THEME_STORAGE_KEY = "theme";
export const DARK_MEDIA = "(prefers-color-scheme: dark)";

/**
 * Inlined in <head> by layout.tsx. Runs before first paint and sets <html data-theme> from the
 * stored choice ("light" | "dark"), falling back to the OS preference when nothing is stored.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia(${JSON.stringify(
  DARK_MEDIA,
)}).matches?"dark":"light"}d.setAttribute("data-theme",t)})()`;
