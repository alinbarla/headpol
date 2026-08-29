import Script from "next/script";
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

type BookingConversionProps = {
  /** Unique per booking so Google Ads drops duplicate fires on refresh. */
  transactionId: string;
};

/**
 * Event snippet for the Book appointment conversion. Only on a confirmed
 * paid booking. `transaction_id` is the booking UUID so a refresh is not
 * counted twice.
 */
export function PurchaseConversion({ transactionId }: BookingConversionProps) {
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_BOOKING_SEND_TO) return null;
  if (!/^[0-9a-f-]{8,}$/i.test(transactionId)) return null;

  return (
    <Script
      id="google-ads-book-appointment"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `gtag('event', 'conversion', {
  send_to: ${JSON.stringify(GOOGLE_ADS_BOOKING_SEND_TO)},
  transaction_id: ${JSON.stringify(transactionId)}
});`,
      }}
    />
  );
}
