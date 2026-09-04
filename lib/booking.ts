export const CONTACT_EMAIL = "teo@stralkastarpolering.se";
export const CONTACT_PHONE = "+46763441168";
export const CONTACT_PHONE_DISPLAY = "076-344 11 68";

/** Pair price shown on the flyer and in booking emails. */
export const BOOKING_PRICE = "899kr/par";
export const BOOKING_OLD_PRICE = "1499kr/par";

/**
 * Weekly hours, weekdays and the booking horizon used to be constants here.
 * They now live in the `settings` table so the owner can change them from the
 * admin; see DEFAULT_BOOKING_RULES in lib/availability.ts for the fallback.
 */

/**
 * Bookable postal codes (PostNord / Swedish postcode system):
 * 10xxx–19xxx covers Stockholms län except Norrtälje.
 * 76xxx (Norrtälje) is not yet served — the booking form shows the out-of-area message.
 */
export const STOCKHOLM_COUNTY_POSTAL_RANGES = [
  { min: 10000, max: 19999 },
] as const;

export function digitsFromPostalCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5);
}

export function formatSwedishPostalCode(value: string): string {
  const digits = digitsFromPostalCode(value);
  if (digits.length !== 5) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

export function isCompletePostalCode(value: string): boolean {
  return digitsFromPostalCode(value).length === 5;
}

export function isStockholmCountyPostalCode(value: string): boolean {
  const digits = digitsFromPostalCode(value);
  if (digits.length !== 5) return false;
  const numeric = Number(digits);
  return STOCKHOLM_COUNTY_POSTAL_RANGES.some(
    (range) => numeric >= range.min && numeric <= range.max
  );
}

export function startOfLocalDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDbTime(slot: string): string {
  return slot.length === 5 ? `${slot}:00` : slot;
}

export function fromDbTime(time: string): string {
  return time.slice(0, 5);
}

export function slotKey(dateKey: string, time: string): string {
  return `${dateKey}T${time}`;
}

export function buildMailtoLink(
  subject: string,
  body: string,
  email: string = CONTACT_EMAIL
): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatBookingDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Formats an öre amount as Swedish currency, e.g. 89900 -> "899 kr". */
export function formatOre(ore: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: ore % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(ore / 100);
}
