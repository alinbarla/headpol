import Script from "next/script";
import { GOOGLE_ADS_ID } from "@/lib/seo";

/**
 * Google tag (gtag.js) for the Google Ads account, loaded once for every page
 * of the public site. `afterInteractive` keeps it off the critical path while
 * still firing the page view as soon as hydration starts.
 */
export function GoogleTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
