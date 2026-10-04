import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { Hero } from "@/components/home/hero";
import { CategoryTiles, ToolDirectory } from "@/components/home/tool-directory";
import { WhySection } from "@/components/home/why-section";
import { JsonLd } from "@/components/json-ld";
import { buttonClass, iconTileClass } from "@/components/ui-styles";
import { absoluteUrl, site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: absoluteUrl("/"),
          description: site.description,
        }}
      />

      <Hero />

      <div className="mt-14 sm:mt-16">
        <CategoryTiles />
      </div>

      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <AdSlot />
      </div>

      <div className="mt-12 sm:mt-14">
        <ToolDirectory />
      </div>

      <div className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <AdSlot />
      </div>

      <WhySection />

      <section aria-labelledby="suggest-heading" className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6">
        <div className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-subtle/60 p-6 sm:flex-row sm:items-center sm:p-8">
          <span className={iconTileClass("lg")}>
            <MessageSquarePlus aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="suggest-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Missing a tool you need?
            </h2>
            <p className="mt-1 text-[15px] leading-7 text-muted">Tell us what to build next. We read every message.</p>
          </div>
          <Link href="/contact" className={buttonClass({ variant: "primary" })}>
            Suggest a tool
          </Link>
        </div>
      </section>
    </>
  );
}
