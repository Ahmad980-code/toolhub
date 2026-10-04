// Central site settings. Change these (or set the env vars) after buying a domain.
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "ToolHub",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  tagline: "Free online calculators, converters & text tools",
  description:
    "33 free, fast and private online tools: salary tax and electricity bill calculators for Pakistan, CGPA, zakat, currency converter, image compressor, PDF merge, QR codes, word counter and more. No sign-up — everything runs in your browser.",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "ahmadsaleemawan890@gmail.com",
  // Google AdSense publisher id, e.g. "ca-pub-1234567890123456". Ads stay off until it is set.
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  // Optional ad unit id for the in-page ad slots. Without it, AdSense Auto Ads still work.
  adsenseSlot: process.env.NEXT_PUBLIC_ADSENSE_SLOT,
};

export function absoluteUrl(path = "/") {
  return `${site.url}${path === "/" ? "" : path}`;
}
