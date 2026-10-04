import type { Metadata } from "next";
import { ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles your data, cookies and advertising.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy Policy" updated="October 3, 2026">
      <p>
        This Privacy Policy explains how {site.name} (&quot;we&quot;, &quot;us&quot;) handles information when
        you use this website.
      </p>

      <h2>Data you enter into tools</h2>
      <p>
        All tools run entirely in your browser. Text, numbers and other data you enter are processed on your
        device and are <strong>not sent to or stored on our servers</strong>.
      </p>

      <h2>Cookies and advertising</h2>
      <p>
        We use Google AdSense to show advertisements. Third-party vendors, including Google, use cookies to
        serve ads based on your prior visits to this website or other websites.
      </p>
      <ul>
        <li>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your
          visits to this and/or other sites on the Internet.
        </li>
        <li>
          You may opt out of personalised advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>{" "}
          or{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            www.aboutads.info
          </a>
          .
        </li>
        <li>
          Learn more about{" "}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
            how Google uses data from sites that use its services
          </a>
          .
        </li>
      </ul>

      <h2>Analytics and logs</h2>
      <p>
        We count visits anonymously to understand which tools are popular and to find bugs. For each page view
        we record the page, the website that linked to it, your country (from your connection), and your device
        and browser type. We also count when a tool is used, but never what you type or upload. We don&apos;t use
        cookies for this, and we don&apos;t store IP addresses: visitors are counted with a one-way code that
        changes every day and can&apos;t identify you. If a tool shows an error, technical details of the error
        (not your data) are sent so we can fix it. If you send a bug report, we store your message and the email
        address you choose to give us.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>This site is not directed at children under 13 and we do not knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>We may update this policy from time to time. Changes take effect when posted on this page.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </ProsePage>
  );
}
