"use client";

import { useEffect } from "react";
import { pushConsentUpdate, readStoredPrefs } from "@/lib/analytics/consent";

/**
 * Always loads Google's scripts after window `load` + requestIdleCallback (2s
 * timeout): first gtag.js for the Ads call tracking configured in the head,
 * then gtm.js once it has run, so GTM reuses that Ads tag instead of fetching
 * its own copy. Consent Mode defaults stay denied in the head stub; tags that
 * need cookies wait for grant. Loading GTM in the denied state lets Google
 * receive cookieless pings and model conversions for Ads / Smart Bidding.
 */
export function DeferredGoogleTagManager({
  gtmId,
  adsId,
}: {
  gtmId: string;
  adsId: string;
}) {
  useEffect(() => {
    if (!gtmId) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelled = false;

    const injectGtm = () => {
      if (cancelled || document.getElementById("gtm-script")) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const script = document.createElement("script");
      script.id = "gtm-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      document.head.appendChild(script);
    };

    const inject = () => {
      if (cancelled || document.getElementById("gtm-script")) return;

      // Re-apply stored choice before the Google scripts so returning visitors
      // are not stuck on the denied defaults from the head stub.
      const prefs = readStoredPrefs();
      if (prefs) pushConsentUpdate(prefs);

      if (document.getElementById("google-ads-gtag")) {
        injectGtm();
        return;
      }
      const ads = document.createElement("script");
      ads.id = "google-ads-gtag";
      ads.async = true;
      ads.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
      // GTM goes in either way, even when a blocker stops gtag.js. It starts
      // in its own task: once gtag.js runs it handles every dataLayer.push
      // synchronously, which would otherwise make one long task out of both.
      const afterAds = () => window.setTimeout(injectGtm, 0);
      ads.addEventListener("load", afterAds, { once: true });
      ads.addEventListener("error", afterAds, { once: true });
      document.head.appendChild(ads);
    };

    const schedule = () => {
      if (cancelled || document.getElementById("gtm-script")) return;
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") {
        idleId = ric(() => inject(), { timeout: 2000 });
      } else {
        timeoutId = window.setTimeout(inject, 2000);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [gtmId, adsId]);

  return null;
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback: (handle: number) => void;
  }
}
