"use client";

import { useEffect } from "react";
import {
  allowsGtm,
  CONSENT_UPDATED_EVENT,
  readStoredPrefs,
} from "@/lib/analytics/consent";

/**
 * Loads gtm.js after consent + window `load` + requestIdleCallback (2s timeout).
 * Without analytics/marketing consent the script never injects.
 */
export function DeferredGoogleTagManager({ gtmId }: { gtmId: string }) {
  useEffect(() => {
    if (!gtmId) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelled = false;

    const inject = () => {
      if (cancelled || document.getElementById("gtm-script")) return;
      if (!allowsGtm(readStoredPrefs())) return;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const script = document.createElement("script");
      script.id = "gtm-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      document.head.appendChild(script);
    };

    const schedule = () => {
      if (!allowsGtm(readStoredPrefs())) return;
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") {
        idleId = ric(() => inject(), { timeout: 2000 });
      } else {
        timeoutId = window.setTimeout(inject, 2000);
      }
    };

    const onConsent = () => schedule();

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsent);

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      window.removeEventListener(CONSENT_UPDATED_EVENT, onConsent);
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
