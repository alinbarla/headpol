import type {
  BookingSource,
  BookingStatus,
  PaymentStatus,
} from "@/lib/supabase/server";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Ej bekräftad",
  confirmed: "Bekräftad",
  completed: "Utförd",
  cancelled: "Avbokad",
  no_show: "Uteblev",
  expired: "Förfallen",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Obetald",
  awaiting_payment: "Väntar på betalning",
  paid: "Betald",
  refunded: "Återbetald",
  partially_refunded: "Delvis återbetald",
};

export const SOURCE_LABELS: Record<BookingSource, string> = {
  web: "Webb",
  phone: "Telefon",
  walk_in: "Drop-in",
  admin: "Admin",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Kort",
  swish: "Swish",
  klarna: "Klarna",
  cash: "Kontant",
  swish_manual: "Swish (manuell)",
  card_manual: "Kort (manuell)",
};

export const WEEKDAY_LABELS = [
  "Söndag",
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
];

/** Monday-first ordering for the settings form, matching Swedish convention. */
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
