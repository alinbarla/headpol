import { GOOGLE_ADS_ID, GOOGLE_ADS_PURCHASE_SEND_TO } from "@/lib/seo";

const gtagBootstrap = GOOGLE_ADS_ID
  ? `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`
  : "";

/**
 * Google tag (gtag.js) for AW-18407352152. A native `<script>` (not
 * next/script) so it is in the initial HTML next to GTM. As a child of
 * `<html>` the browser treats it as head content, which matches Google Ads'
 * "paste between the head tags on every page" install.
 */
export function GoogleTag() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <script dangerouslySetInnerHTML={{ __html: gtagBootstrap }} />
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
    <script
      dangerouslySetInnerHTML={{
        __html: `gtag('event', 'conversion', {
  send_to: ${JSON.stringify(GOOGLE_ADS_PURCHASE_SEND_TO)},
  value: ${value},
  currency: 'SEK',
  transaction_id: ${JSON.stringify(transactionId)}
});`,
      }}
    />
  );
}
