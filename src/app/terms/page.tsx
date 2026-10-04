import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of use for ${site.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Use" updated="October 3, 2026">
      <p>By using {site.name} you agree to these terms.</p>

      <h2>Use of the tools</h2>
      <p>
        The tools are provided free of charge for personal and commercial use. You may not attempt to disrupt
        the site or use automated means to overload it.
      </p>

      <h2>No professional advice</h2>
      <p>
        Results are provided for general information only. Financial calculators are estimates and are not
        financial advice; health calculators such as BMI are not medical advice. Always consult a qualified
        professional before making important decisions.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided &quot;as is&quot; without warranties of any kind. While we work hard to keep every
        tool accurate, we are not liable for any loss arising from its use.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms at any time. Continued use of the site means you accept the updated terms.</p>
    </ProsePage>
  );
}
