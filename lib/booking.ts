export const CONTACT_EMAIL = "teo@stralkastarpolering.se";
export const CONTACT_PHONE = "+46763441168";
export const CONTACT_PHONE_DISPLAY = "076-344 11 68";

/** Pair price shown on the flyer and in booking emails. */
export const BOOKING_PRICE = "799kr/par";
export const BOOKING_OLD_PRICE = "1499kr/par";

/** Hourly slots from 16:00 through 19:00 (service window ends at 20:00). */
export const BOOKING_HOURS = {
  start: 16,
  end: 20,
};

/** Sunday (0) through Friday (5). Saturday (6) is closed. */
export const BOOKING_WEEKDAYS = [0, 1, 2, 3, 4, 5] as const;

export const BOOKING_HORIZON_DAYS = 60;

export function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = BOOKING_HOURS.start; hour < BOOKING_HOURS.end; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

export function isBookableWeekday(date: Date): boolean {
  return (BOOKING_WEEKDAYS as readonly number[]).includes(date.getDay());
}

export function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

export function isPastDate(date: Date): boolean {
  const today = startOfLocalDay(new Date());
  const compare = startOfLocalDay(date);
  return compare < today;
}

export function isBeyondHorizon(date: Date): boolean {
  const limit = startOfLocalDay(new Date());
  limit.setDate(limit.getDate() + BOOKING_HORIZON_DAYS);
  return startOfLocalDay(date) > limit;
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

export function isValidTimeSlot(time: string): boolean {
  return getTimeSlots().includes(time);
}

export function getFullyBookedDates(
  bookedSlots: Set<string>,
  from: Date,
  to: Date
): Date[] {
  const fullyBooked: Date[] = [];
  const cursor = startOfLocalDay(from);
  const end = startOfLocalDay(to);
  const allSlots = getTimeSlots();

  while (cursor <= end) {
    if (isBookableWeekday(cursor)) {
      const dateKey = toDateKey(cursor);
      const everySlotTaken = allSlots.every((time) =>
        bookedSlots.has(slotKey(dateKey, time))
      );
      if (everySlotTaken) fullyBooked.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return fullyBooked;
}

export function getBookedTimesForDate(
  bookedSlots: Set<string>,
  date: Date
): Set<string> {
  const dateKey = toDateKey(date);
  const booked = new Set<string>();
  for (const time of getTimeSlots()) {
    if (bookedSlots.has(slotKey(dateKey, time))) {
      booked.add(time);
    }
  }
  return booked;
}
