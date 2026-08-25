import Script from "next/script";
import { GOOGLE_ADS_ID, GOOGLE_ADS_PURCHASE_SEND_TO } from "@/lib/seo";

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

type PurchaseConversionProps = {
  /** Unique per booking so Google Ads drops duplicate fires on refresh. */
  transactionId: string;
  /** Gross amount in kronor (not öre). */
  valueSek: number;
};

/**
 * Google Ads Purchase conversion. Only mount this on a confirmed paid
 * booking — firing it on the empty confirmation URL would invent conversions.
 */
export function PurchaseConversion({
  transactionId,
  valueSek,
}: PurchaseConversionProps) {
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_PURCHASE_SEND_TO) return null;
  if (!/^[0-9a-f-]{8,}$/i.test(transactionId)) return null;

  const value = Number.isFinite(valueSek) ? valueSek : 1;

  return (
    <Script id="google-ads-purchase" strategy="afterInteractive">
      {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('event', 'conversion', {
  send_to: '${GOOGLE_ADS_PURCHASE_SEND_TO}',
  value: ${value},
  currency: 'SEK',
  transaction_id: '${transactionId}'
});`}
    </Script>
  );
}
