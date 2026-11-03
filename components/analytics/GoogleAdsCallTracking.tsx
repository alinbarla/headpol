export const GOOGLE_ADS_ID = "AW-18409115873";

/**
 * Google Ads call tracking, placed immediately after the Google tag.
 * The head stub above defines `gtag` and Consent Mode defaults first.
 * gtag.js then picks up the phone-number config and the click conversion.
 * gtag.js itself (~165 KB) is loaded by DeferredGoogleTagManager after window
 * `load`, just before gtm.js, so it stays off the LCP path on mobile. Config
 * and conversion calls made before it arrives wait in dataLayer.
 */
export function GoogleAdsCallTracking() {
  return (
    <>
      <script
        id="google-ads-phone-conversion"
        dangerouslySetInnerHTML={{
          __html: `gtag('js', new Date());
gtag('config', 'AW-18409115873/mDpyCIK0ipgdEOGhk8pE', {
  'phone_conversion_number': '0763441168'
});`,
        }}
      />
      <script
        id="google-ads-click-to-call"
        dangerouslySetInnerHTML={{
          __html: `function gtag_report_conversion(url) {
  var called = false;
  var callback = function () {
    if (called) return;
    called = true;
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
      'send_to': 'AW-18409115873/xuXWCIW0ipgdEOGhk8pE',
      'value': 1.0,
      'currency': 'SEK',
      'event_callback': callback
  });
  setTimeout(callback, 800);
  return false;
}`,
        }}
      />
    </>
  );
}
