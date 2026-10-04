import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeWatcher } from "@/components/theme";
import { Tracker } from "@/components/analytics/tracker";
import { ThemeInitScript } from "@/components/theme-init";
import { site } from "@/lib/site";
import { developerNames, developers } from "@/lib/team";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Keep: developer credit requested by the site owner.
  authors: developers.map((d) => ({ name: d.name })),
  creator: developerNames,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} – ${site.tagline}`,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  ...(site.adsenseClient && { other: { "google-adsense-account": site.adsenseClient } }),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: THEME_SCRIPT sets data-theme on <html> before React hydrates.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Runs before first paint: stored theme choice, else the OS preference. No flash. */}
        <ThemeInitScript />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <a
          href="#main"
          className="sr-only rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
        >
          Skip to content
        </a>
        <ThemeWatcher />
        <Tracker />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {site.adsenseClient && (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}`}
          />
        )}
      </body>
    </html>
  );
}
