import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { BRAND_GRADIENT, LogoGlyph } from "./logo";

/**
 * Branded 1200x630 social card, rendered with next/og. Server-only (reads font files).
 * Used by app/opengraph-image.tsx; a route can reuse it from its own opengraph-image.tsx:
 *   export default () => renderOgImage({ eyebrow: "Finance Calculators", title: "Loan Calculator", ... })
 */
export const ogSize = { width: 1200, height: 630 };

const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-SemiBold.ttf")),
]);

export async function renderOgImage({
  eyebrow,
  title,
  highlight,
  description,
  chips = [],
}: {
  /** Small label above the title (e.g. a category). */
  eyebrow?: string;
  title: string;
  /** Optional trailing words of the title, drawn in the accent color. */
  highlight?: string;
  description?: string;
  chips?: string[];
}) {
  const [regular, semibold] = await fontsPromise;
  const host = new URL(site.url).host;
  const showHost = !/^(localhost|127\.0\.0\.1)(:|$)/.test(host);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0a0b0f",
          backgroundImage:
            "radial-gradient(circle at 85% -10%, rgba(124,108,255,0.45), rgba(10,11,15,0) 55%), radial-gradient(circle at 0% 110%, rgba(79,70,229,0.25), rgba(10,11,15,0) 45%)",
          color: "#eceef2",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage: `linear-gradient(135deg, ${BRAND_GRADIENT.from}, ${BRAND_GRADIENT.to})`,
              boxShadow: "0 12px 32px -8px rgba(79,70,229,0.7)",
            }}
          >
            <LogoGlyph size={40} />
          </div>
          <div style={{ fontSize: 38, fontWeight: 600, letterSpacing: -1 }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div style={{ fontSize: 26, fontWeight: 600, color: "#a9a4ff", marginBottom: 18 }}>{eyebrow}</div>
          )}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              columnGap: 20,
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1.08,
              maxWidth: 1000,
            }}
          >
            {/* One span per word so wrapping never leaves a stray indent. */}
            {title.split(" ").map((word, i) => (
              <span key={`t${i}`}>{word}</span>
            ))}
            {highlight?.split(" ").map((word, i) => (
              <span key={`h${i}`} style={{ color: "#a9a4ff" }}>
                {word}
              </span>
            ))}
          </div>
          {description && (
            <div style={{ marginTop: 26, fontSize: 30, lineHeight: 1.4, color: "#9ba1ae", maxWidth: 900 }}>
              {description}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {chips.map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.14)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  fontSize: 22,
                  color: "#c9ccd6",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
          {showHost && <div style={{ fontSize: 24, color: "#6b7180" }}>{host}</div>}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: regular, style: "normal", weight: 400 },
        { name: "Geist", data: semibold, style: "normal", weight: 600 },
      ],
    },
  );
}
