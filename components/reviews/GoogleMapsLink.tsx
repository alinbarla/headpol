"use client";

import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";

function prefersMapsAppHandoff(): boolean {
  if (typeof window === "undefined") return false;
  // Touch phones/tablets: same-tab navigation lets Universal/App Links open
  // Google Maps when installed. Desktop keeps a new browser tab.
  if (typeof window.matchMedia === "function") {
    if (window.matchMedia("(pointer: coarse) and (max-width: 1023px)").matches) {
      return true;
    }
  }
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

type GoogleMapsLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "children" | "className" | "target" | "rel"
>;

/**
 * Link to a Google Maps / Business Profile URL.
 * Mobile: same-tab navigation so the Maps app can intercept.
 * Desktop: opens the web URL in a new tab.
 */
export function GoogleMapsLink({
  href,
  children,
  className,
  onClick,
  ...rest
}: GoogleMapsLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!prefersMapsAppHandoff()) return;

    // Force same-document navigation even if a parent set target=_blank.
    event.preventDefault();
    window.location.assign(href);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}
