import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { ReportProblem } from "@/components/analytics/report-problem";
import { ToolUsage } from "@/components/analytics/tool-usage";
import { Icon } from "@/components/icon";
import { JsonLd } from "@/components/json-ld";
import { ToolCard } from "@/components/tool-card";
import { toolComponents } from "@/components/tools";
import { absoluteUrl, site } from "@/lib/site";
import { categories, getTool, relatedTools, tools } from "@/lib/tools";

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url: `/tools/${tool.slug}`,
      type: "website",
    },
  };
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = getTool(slug);
  const ToolComponent = toolComponents[slug];
  if (!tool || !ToolComponent) notFound();

  const url = absoluteUrl(`/tools/${tool.slug}`);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      url,
      description: tool.description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: site.name, item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: tool.name, item: url },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <JsonLd data={structuredData} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/#${tool.category}`} className="hover:text-foreground">
          {categories[tool.category].name}
        </Link>
      </nav>

      <header className="mt-4 flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          <Icon name={tool.icon} className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tool.name}</h1>
          <p className="mt-2 text-muted">{tool.summary}</p>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <ToolUsage key={tool.slug} slug={tool.slug}>
          <ToolComponent />
        </ToolUsage>
      </section>

      <div className="mt-3">
        <ReportProblem key={tool.slug} slug={tool.slug} name={tool.name} />
      </div>

      <AdSlot className="mt-6" />

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">About this {tool.name.toLowerCase()}</h2>
          <p className="mt-3 leading-relaxed text-muted">{tool.intro}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">How to use it</h2>
          <ol className="mt-3 space-y-2">
            {tool.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-muted">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
          {tool.faqs.map((f) => (
            <details key={f.q} className="group p-4 sm:px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Related tools</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {relatedTools(tool).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
