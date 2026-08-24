import type {
  BookingSource,
  BookingStatus,
  PaymentStatus,
} from "@/lib/supabase/server";

/**
 * The admin is English-only, unlike the customer-facing site. en-GB keeps the
 * day-before-month ordering and Monday-first weeks the shop actually works to.
 */
export const ADMIN_LOCALE = "en";
export const ADMIN_INTL_LOCALE = "en-GB";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Unconfirmed",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
  expired: "Expired",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

export const SOURCE_LABELS: Record<BookingSource, string> = {
  web: "Web",
  phone: "Phone",
  walk_in: "Walk-in",
  admin: "Admin",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Card",
  swish: "Swish",
  klarna: "Klarna",
  cash: "Cash",
  swish_manual: "Swish (manual)",
  card_manual: "Card (manual)",
};

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Monday-first ordering, matching the Swedish working week the shop runs on. */
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function paymentMethodLabel(method: string | null): string {
  if (!method) return "—";
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

/** Tailwind classes per status, used for badges and calendar blocks. */
export const STATUS_TONE: Record<BookingStatus, string> = {
  pending: "border-amber-500/40 bg-amber-500/15 text-amber-200",
  confirmed: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
  completed: "border-sky-500/40 bg-sky-500/15 text-sky-200",
  cancelled: "border-white/15 bg-white/5 text-muted-foreground line-through",
  no_show: "border-red-500/40 bg-red-500/15 text-red-200",
  expired: "border-white/15 bg-white/5 text-muted-foreground",
};

export const PAYMENT_TONE: Record<PaymentStatus, string> = {
  unpaid: "border-white/15 bg-white/5 text-muted-foreground",
  awaiting_payment: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  refunded: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  partially_refunded: "border-violet-500/40 bg-violet-500/10 text-violet-200",
};

/**
 * A tap-to-navigate link for the phone. The address is a free-text field, so
 * the query search endpoint copes better than coordinates would.
 */
export function mapsLink(address: string | null): string | null {
  if (!address?.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address.trim()
  )}`;
}

export function telLink(phone: string | null): string | null {
  if (!phone?.trim()) return null;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
