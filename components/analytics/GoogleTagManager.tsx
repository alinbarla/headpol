import { CONSENT_DEFAULT_STUB } from "@/lib/analytics/consent";
import { GTM_ID } from "@/lib/seo";

/**
 * Head-only dataLayer + Consent Mode default (denied). Actual gtm.js is
 * loaded by DeferredGoogleTagManager only after the visitor grants analytics
 * or marketing.
 */
export function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <script
      id="gtm-datalayer-stub"
      dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_STUB }}
    />
  );
}
