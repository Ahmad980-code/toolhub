import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...tools.map((t) => ({
      url: absoluteUrl(`/tools/${t.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...["/about", "/contact", "/privacy", "/terms"].map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
