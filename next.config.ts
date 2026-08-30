import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { CONFIRMATION_PATH } from "./lib/routes";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

/** Same-origin only, plus Supabase (browser calls the booking API which lives on our origin). */
const supabaseOrigin = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
})();

/**
 * Origins required by Google Tag Manager for Google Ads conversions and the
 * conversion linker. From Google's CSP guide:
 * https://developers.google.com/tag-platform/security/guides/csp
 *
 * `www.google.se` covers Swedish visitors; `www.google.com` / `google.com`
 * cover the global endpoints. A missing `connect-src` host silently drops
 * conversion hits and shows up as "tag inactive" in Google Ads.
 */
const googleTag = {
  script:
    "https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tagmanager.google.com",
  img: "https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com https://google.com https://www.google.se https://pagead2.googlesyndication.com https://*.google-analytics.com https://ssl.gstatic.com https://lh3.googleusercontent.com",
  connect:
    "https://www.googletagmanager.com https://www.googleadservices.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ad.doubleclick.net https://www.google.com https://google.com https://www.google.se https://*.google-analytics.com https://*.analytics.google.com https://*.g.doubleclick.net",
  frame: "https://www.googletagmanager.com https://td.doubleclick.net",
};

/**
 * CSP without nonces so pages stay statically rendered (fast TTFB + CDN cacheable).
 * `'unsafe-inline'` is required for Next.js hydration, next/font styles and
 * framer-motion inline styles. A nonce/strict-dynamic policy is the further
 * hardening step but forces dynamic rendering, which we avoid for performance.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${googleTag.script}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${googleTag.img}`,
  "media-src 'self'",
  "font-src 'self'",
  `connect-src 'self' ${googleTag.connect}${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  `frame-src 'self' ${googleTag.frame}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/**
 * The admin shares this deployment, so robots.txt and the sitemap are served
 * from the same handlers as the public site. A host-scoped header keeps the
 * admin out of search indexes regardless of what those handlers return.
 */
const adminHost = process.env.ADMIN_HOST ?? "admin.stralkastarpolering.se";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.stralkastarpolering.se" }],
        destination: "https://stralkastarpolering.se/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: `/${CONFIRMATION_PATH}`,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: adminHost }],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
