import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND} — Strålkastarpolering Stockholm`,
    short_name: BRAND,
    description:
      "Professionell strålkastarpolering och strålkastarrenovering i Stockholm. Klarare ljus, säkrare körning och godkänd besiktning.",
    start_url: "/sv",
    scope: "/",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#111111",
    lang: "sv-SE",
    dir: "ltr",
    categories: ["automotive", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
