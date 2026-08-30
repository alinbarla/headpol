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
  ? `var __bookSid = new URLSearchParams(location.search).get('session_id');
if (/\\/(?:sv|en)\\/${CONFIRMATION_PATH}\\/?$/.test(location.pathname) && __bookSid) {
  gtag('event', 'conversion', {'send_to': '${GOOGLE_ADS_BOOKING_SEND_TO}', 'transaction_id': __bookSid});
}`
  : "";

/**
 * Event snippet for the Book appointment conversion. Lives in the document
 * `<head>` next to the Google tag. Sends only on the confirmation page when
 * Stripe's `session_id` is present, so a refresh is not counted twice.
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
