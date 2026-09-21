"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { selectBookingService } from "@/lib/bookingNav";
import { bookingUrl, type ProductId } from "@/lib/products";

type BookServiceButtonProps = {
  productId: ProductId;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "outline" | "dark";
};

/**
 * "Book now" CTA that scrolls to the in-page booking form when present,
 * instead of reloading via `/?service=…#booking`.
 */
export function BookServiceButton({
  productId,
  children,
  className,
  variant = "primary",
}: BookServiceButtonProps) {
  return (
    <Button
      href={bookingUrl(productId)}
      variant={variant}
      className={className}
      onClick={(event) => {
        if (selectBookingService(productId)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}
