"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Stripe redirects the customer back at the same moment it fires the webhook,
 * so this page can load before the booking is marked paid. Refresh until the
 * server sees the paid row, then stop.
 */
export function PendingPaymentPoller() {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 2000);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
    }, 20_000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [router]);

  return null;
}
