import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}: free, fast and private online tools that run entirely in your browser.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ProsePage title={`About ${site.name}`}>
      <p>
        {site.name} is a collection of {tools.length} free online tools for everyday tasks: calculating
        percentages, ages and loan payments, counting words, formatting JSON, converting units, generating
        passwords and more.
      </p>
      <h2>Why we built it</h2>
      <p>
        Most tool sites are slow, cluttered and ask for your email before showing a simple answer. We wanted
        tools that load instantly, work on any device and respect your privacy.
      </p>
      <h2>How it works</h2>
      <p>
        Every tool runs entirely in your web browser. What you type is never uploaded to our servers, which
        makes the tools both fast and private.
      </p>
      <h2>Get in touch</h2>
      <p>
        Have an idea for a new tool or found a bug? <Link href="/contact">Contact us</Link> — we read every
        message.
      </p>
    </ProsePage>
  );
}
