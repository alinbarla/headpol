import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Public_Sans } from "next/font/google";
import { Toaster } from "@/components/shadcn/sonner";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/analytics/GoogleTagManager";
import "../globals.css";

const publicSans = Public_Sans({
  variable: "--font-public",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin — Strålkastarpolering",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/**
 * The admin has its own document because the locale layout owns <html> for the
 * public site and would wrap every page in next-intl and the motion provider,
 * neither of which the admin needs.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full`}>
      <GoogleTagManager />
      <body className="admin-root min-h-full font-[family-name:var(--font-public)] antialiased">
        <GoogleTagManagerNoscript />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
