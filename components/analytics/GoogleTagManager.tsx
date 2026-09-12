import { CONSENT_DEFAULT_STUB } from "@/lib/analytics/consent";
import { GTM_ID } from "@/lib/seo";

/**
 * Head-only dataLayer + Consent Mode default (denied). DeferredGoogleTagManager
 * always loads gtm.js afterward; cookie-gated tags stay blocked until grant.
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
