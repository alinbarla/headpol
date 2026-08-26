import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RootNotFound() {
  return (
    <html lang="sv-SE">
      <body style={{ background: "#111", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1.5rem" }}>
          <p style={{ color: "#fff326", fontWeight: 700 }}>{BRAND}</p>
          <h1 style={{ fontSize: "2rem", marginTop: "1rem" }}>Sidan finns inte</h1>
          <p style={{ color: "#aaa", marginTop: "0.75rem" }}>
            Den här adressen finns inte. Gå till startsidan.
          </p>
          <p style={{ marginTop: "1.5rem" }}>
            <Link href="/sv" style={{ color: "#fff326" }}>
              Till startsidan
            </Link>
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            <Link href="/en" style={{ color: "#fff326" }}>
              English homepage
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
