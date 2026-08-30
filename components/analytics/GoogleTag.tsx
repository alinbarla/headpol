import { CONFIRMATION_PATH } from "@/lib/routes";
import { GOOGLE_ADS_ID, GOOGLE_ADS_BOOKING_SEND_TO } from "@/lib/seo";

const gtagBootstrap = GOOGLE_ADS_ID
  ? `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`
  : "";

/**
 * Sitewide Google tag (gtag.js). Rendered as native `<script>` tags inside
 * the locale layout `<head>` so the initial HTML matches what Google Ads
 * Tag Diagnostics looks for. `next/script` cannot do that here: the root
 * layout does not own `<html>`, so `beforeInteractive` is queued in `<body>`.
 */
export function GoogleTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <script
        id="gtag-config"
        dangerouslySetInnerHTML={{ __html: gtagBootstrap }}
      />
    </>
  );
}

const conversionSnippet = GOOGLE_ADS_BOOKING_SEND_TO
  ? `if (/\\/(?:sv|en)\\/${CONFIRMATION_PATH}\\/?$/.test(location.pathname)) {
  gtag('event', 'conversion', {'send_to': '${GOOGLE_ADS_BOOKING_SEND_TO}'});
}`
  : "";

/**
 * Event snippet for Book appointment. Lives in `<head>` next to the Google
 * tag (what Google Ads Tag Diagnostics reads). The `gtag('event', …)` line
 * is the one Ads ships; the pathname check keeps other pages from converting.
 */
export function GoogleAdsConversionEvent() {
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_BOOKING_SEND_TO) return null;

  return (
    <script
      id="google-ads-book-appointment"
      dangerouslySetInnerHTML={{ __html: conversionSnippet }}
    />
  );
}
