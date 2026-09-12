export const CONSENT_KEY = "cookie-consent";
export const PREFS_KEY = "cookie-preferences";
export const CONSENT_UPDATED_EVENT = "cookie-consent-updated";

export type CookiePrefs = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

export const DENIED_PREFS: CookiePrefs = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export const ALL_PREFS: CookiePrefs = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: true,
};

/** Inline head stub: Consent Mode defaults before any tag can fire. */
export const CONSENT_DEFAULT_STUB = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','analytics_storage':'denied','ad_user_data':'denied','ad_personalization':'denied'});`;

export function readStoredPrefs(): CookiePrefs | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookiePrefs;
    return { ...parsed, necessary: true };
  } catch {
    return null;
  }
}

export function allowsGtm(prefs: CookiePrefs | null): boolean {
  return Boolean(prefs?.analytics || prefs?.marketing);
}

export function pushConsentUpdate(prefs: CookiePrefs) {
  window.dataLayer = window.dataLayer || [];
  // Match Google's snippet: push the Arguments object, not a plain array.
  function gtag(command: string, action: string, params: Record<string, string>) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments as unknown as Record<string, unknown>);
    void command;
    void action;
    void params;
  }
  gtag("consent", "update", {
    ad_storage: prefs.marketing ? "granted" : "denied",
    analytics_storage: prefs.analytics ? "granted" : "denied",
    ad_user_data: prefs.marketing ? "granted" : "denied",
    ad_personalization: prefs.marketing ? "granted" : "denied",
  });
  window.dispatchEvent(new Event(CONSENT_UPDATED_EVENT));
}

export function persistPrefs(prefs: CookiePrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  localStorage.setItem(CONSENT_KEY, "true");
  pushConsentUpdate(prefs);
}
