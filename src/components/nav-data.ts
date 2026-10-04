import { categories, toolsInCategory, type CategoryId, type Tool } from "@/lib/tools";

export type NavTool = Pick<Tool, "slug" | "name" | "icon" | "summary">;
export type NavGroup = { id: CategoryId; name: string; tools: NavTool[] };

/** Tools grouped by category, trimmed to what navigation needs (safe to pass to Client Components). */
export function navGroups(): NavGroup[] {
  return (Object.keys(categories) as CategoryId[]).map((id) => ({
    id,
    name: categories[id].name,
    tools: toolsInCategory(id).map(({ slug, name, icon, summary }) => ({ slug, name, icon, summary })),
  }));
}

export const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
] as const;
