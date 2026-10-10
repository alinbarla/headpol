"use client";

import type { MouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { CONTACT_PHONE } from "@/lib/booking";

const TEL_HREF = `tel:${CONTACT_PHONE}`;

function trackPhoneClick(event: MouseEvent<HTMLAnchorElement>) {
  const report = window.gtag_report_conversion;
  if (typeof report !== "function") return;
  event.preventDefault();
  report(event.currentTarget.href);
}

export function PhoneCallLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={TEL_HREF} className={className} onClick={trackPhoneClick}>
      {children}
    </a>
  );
}

export function PhoneCallButton({
  variant,
  className,
  children,
}: {
  variant?: "primary" | "ghost" | "outline" | "dark";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button href={TEL_HREF} variant={variant} className={className} onClick={trackPhoneClick}>
      {children}
    </Button>
  );
}

declare global {
  interface Window {
    gtag_report_conversion?: (url?: string) => boolean;
  }
}
