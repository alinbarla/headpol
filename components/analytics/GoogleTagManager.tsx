import Script from "next/script";
import { GTM_ID } from "@/lib/seo";

const gtmBootstrap = GTM_ID
  ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`
  : "";

/**
 * Google Tag Manager bootstrap. `afterInteractive` injects via the DOM instead
 * of rendering a `<script>` child, which React 19 rejects during client render.
 */
export function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <Script
      id="gtm-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: gtmBootstrap }}
    />
  );
}

/** Fallback iframe for visitors with JavaScript disabled. Goes first in `<body>`. */
export function GoogleTagManagerNoscript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
