import Script from "next/script";
import { GOOGLE_ADS_ID, GOOGLE_ADS_PURCHASE_SEND_TO } from "@/lib/seo";

const gtagBootstrap = GOOGLE_ADS_ID
  ? `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`
  : "";

/**
 * Google tag (gtag.js) for AW-18407352152. Loaded with next/script so React 19
 * streaming does not wrap a raw `<script>` in `<template>`.
 */
export function GoogleTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <Script
        id="gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {gtagBootstrap}
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
 * Event snippet for the Purchase conversion. Only on a confirmed paid
 * booking. `transaction_id` is the booking UUID; Google Ads uses it to ignore
 * reloads of the confirmation page.
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
      {`gtag('event', 'conversion', {
  send_to: ${JSON.stringify(GOOGLE_ADS_PURCHASE_SEND_TO)},
  value: ${value},
  currency: 'SEK',
  transaction_id: ${JSON.stringify(transactionId)}
});`}
    </Script>
  );
}
