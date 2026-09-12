"use client";

import { useEffect } from "react";
import { pushConsentUpdate, readStoredPrefs } from "@/lib/analytics/consent";

/**
 * Always loads gtm.js after window `load` + requestIdleCallback (2s timeout).
 * Consent Mode defaults stay denied in the head stub; tags that need cookies
 * wait for grant. Loading GTM in the denied state lets Google receive
 * cookieless pings and model conversions for Ads / Smart Bidding.
 */
export function DeferredGoogleTagManager({ gtmId }: { gtmId: string }) {
  useEffect(() => {
    if (!gtmId) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelled = false;

    const inject = () => {
      if (cancelled || document.getElementById("gtm-script")) return;

      // Re-apply stored choice before gtm.js so returning visitors are not
      // stuck on the denied defaults from the head stub.
      const prefs = readStoredPrefs();
      if (prefs) pushConsentUpdate(prefs);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const script = document.createElement("script");
      script.id = "gtm-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      document.head.appendChild(script);
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
  }, [gtmId]);

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
