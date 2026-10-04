import {
  ArrowLeftRight,
  Calculator,
  Clock,
  CodeXml,
  HeartPulse,
  Images,
  Landmark,
  Type,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/lib/tools";

/** One icon per category, used by the home directory, category pills and tool breadcrumbs. */
export const categoryIcons: Record<CategoryId, LucideIcon> = {
  calculators: Calculator,
  finance: Wallet,
  pakistan: Landmark,
  health: HeartPulse,
  time: Clock,
  text: Type,
  media: Images,
  developer: CodeXml,
  converters: ArrowLeftRight,
};

/** Home hero "Popular" chips: slug + short chip label. */
export const popularSearches: { slug: string; label: string }[] = [
  { slug: "salary-tax-calculator-pakistan", label: "Salary tax Pakistan" },
  { slug: "cgpa-calculator", label: "CGPA" },
  { slug: "currency-converter", label: "Currency" },
  { slug: "image-compressor", label: "Image compressor" },
  { slug: "word-counter", label: "Word counter" },
  { slug: "password-generator", label: "Password generator" },
];

/** Home "Featured tools" grid (complements the hero chips rather than repeating them). */
export const featuredSlugs = [
  "loan-calculator",
  "percentage-calculator",
  "electricity-bill-calculator",
  "zakat-calculator",
  "pdf-merge",
  "qr-code-generator",
];
