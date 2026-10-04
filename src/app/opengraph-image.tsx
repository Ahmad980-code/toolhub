import { ogSize, renderOgImage } from "@/components/og-image";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export const alt = `${site.name} – ${site.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Free online tools that",
    highlight: "just work",
    description: "Calculators, converters, text and developer tools. Fast, private and free, right in your browser.",
    chips: [`${tools.length} free tools`, "No sign-up", "100% private"],
  });
}
