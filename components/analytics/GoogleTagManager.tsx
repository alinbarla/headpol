import { GTM_ID } from "@/lib/seo";

/** Tiny dataLayer stub so early pushes are not lost before gtm.js loads. */
const dataLayerStub = GTM_ID
  ? `window.dataLayer=window.dataLayer||[];`
  : "";

/**
 * Head-only dataLayer stub. Actual gtm.js is loaded by DeferredGoogleTagManager
 * after window load + idle so Ads/GTM stay off the critical path.
 */
export function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <script
      id="gtm-datalayer-stub"
      dangerouslySetInnerHTML={{ __html: dataLayerStub }}
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
