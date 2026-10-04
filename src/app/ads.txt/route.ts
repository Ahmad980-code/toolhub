import { site } from "@/lib/site";

export const dynamic = "force-static";

// AdSense requires /ads.txt to list your publisher id; it's generated from NEXT_PUBLIC_ADSENSE_CLIENT.
export function GET() {
  const publisher = site.adsenseClient?.replace(/^ca-/, "");
  const body = publisher ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n` : "";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
