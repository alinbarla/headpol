import Link from "next/link";
import { MapPinIcon, PhoneIcon, StickyNoteIcon } from "lucide-react";
import { fromDbTime, formatOre } from "@/lib/booking";
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TONE,
  STATUS_TONE,
  mapsLink,
  telLink,
} from "@/lib/admin/labels";
import type { BookingRecord } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

/**
 * The owner reads this on a phone between jobs, so the call and navigate
 * targets are full-width tap areas rather than icon buttons.
 */
export function BookingCard({ booking }: { booking: BookingRecord }) {
  const phone = telLink(booking.customer_phone);
  const maps = mapsLink(booking.customer_address);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums">
            {fromDbTime(booking.booking_time)}
          </p>
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="mt-0.5 block truncate text-base font-medium hover:text-primary"
          >
            {booking.customer_name ?? "Utan namn"}
          </Link>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] font-medium",
              STATUS_TONE[booking.status]
            )}
          >
            {BOOKING_STATUS_LABELS[booking.status]}
          </span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px]",
              PAYMENT_TONE[booking.payment_status]
            )}
          >
            {PAYMENT_STATUS_LABELS[booking.payment_status]} ·{" "}
            {formatOre(booking.price_ore)}
          </span>
        </div>
      </div>

      {booking.customer_address && (
        <p className="mt-3 text-sm text-muted-foreground">
          {booking.customer_address}
        </p>
      )}

      {booking.internal_notes && (
        <p className="mt-2 flex gap-2 rounded-lg bg-secondary/60 p-2 text-sm text-secondary-foreground">
          <StickyNoteIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span className="whitespace-pre-wrap">{booking.internal_notes}</span>
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {phone && (
          <a
            href={phone}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 text-sm font-medium transition-colors hover:border-primary"
          >
            <PhoneIcon className="size-4" />
            Ring
          </a>
        )}
        {maps && (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 text-sm font-medium transition-colors hover:border-primary"
          >
            <MapPinIcon className="size-4" />
            Navigera
          </a>
        )}
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:border-primary"
        >
          Öppna
        </Link>
      </div>
    </div>
  );
}
