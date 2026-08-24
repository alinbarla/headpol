import { addDaysToDateKey, weekdayForDateKey } from "@/lib/time";

/**
 * Weekly rules, previously hard-coded constants in lib/booking.ts. They now
 * live in the `settings` table so hours, horizon and price change without a
 * deploy. These defaults mirror the original constants exactly.
 */
export type BookingRules = {
  /** 0 = Sunday. Saturday (6) was excluded originally. */
  weekdays: number[];
  startHour: number;
  /** Exclusive: endHour 20 means the last slot starts at 19:00. */
  endHour: number;
  horizonDays: number;
  priceOre: number;
};

export const DEFAULT_BOOKING_RULES: BookingRules = {
  weekdays: [0, 1, 2, 3, 4, 5],
  startHour: 16,
  endHour: 20,
  horizonDays: 60,
  priceOre: 79900,
};

export type AvailabilityOverride = {
  id: string;
  override_date: string;
  /** Null start and end means the entry covers the whole day. */
  start_time: string | null;
  end_time: string | null;
  kind: "block" | "open";
  note: string | null;
};

export function parseBookingRules(value: unknown): BookingRules {
  if (!value || typeof value !== "object") return DEFAULT_BOOKING_RULES;

  const raw = value as Partial<Record<keyof BookingRules, unknown>>;
  const weekdays = Array.isArray(raw.weekdays)
    ? raw.weekdays.filter(
        (day): day is number => typeof day === "number" && day >= 0 && day <= 6
      )
    : DEFAULT_BOOKING_RULES.weekdays;

  const startHour = clampHour(raw.startHour, DEFAULT_BOOKING_RULES.startHour);
  const endHour = clampHour(raw.endHour, DEFAULT_BOOKING_RULES.endHour);

  return {
    weekdays: weekdays.length > 0 ? weekdays : DEFAULT_BOOKING_RULES.weekdays,
    startHour,
    endHour: endHour > startHour ? endHour : startHour + 1,
    horizonDays:
      typeof raw.horizonDays === "number" && raw.horizonDays > 0
        ? Math.min(Math.floor(raw.horizonDays), 365)
        : DEFAULT_BOOKING_RULES.horizonDays,
    priceOre:
      typeof raw.priceOre === "number" && raw.priceOre >= 0
        ? Math.floor(raw.priceOre)
        : DEFAULT_BOOKING_RULES.priceOre,
  };
}

function clampHour(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(Math.floor(value), 0), 24);
}

export function hourToTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function timeToHour(time: string): number {
  return Number(time.slice(0, 2));
}

/** The slots a normal open day offers, ignoring overrides and bookings. */
export function baseTimeSlots(rules: BookingRules): string[] {
  const slots: string[] = [];
  for (let hour = rules.startHour; hour < rules.endHour; hour++) {
    slots.push(hourToTime(hour));
  }
  return slots;
}

/**
 * Every slot that could ever be offered, including hours only reachable
 * through an `open` override. The admin calendar uses this to size its grid.
 */
export function allPossibleTimeSlots(
  rules: BookingRules,
  overrides: AvailabilityOverride[]
): string[] {
  const hours = new Set<number>();
  for (let hour = rules.startHour; hour < rules.endHour; hour++) {
    hours.add(hour);
  }

  for (const override of overrides) {
    if (override.kind !== "open") continue;
    const { from, to } = overrideHourRange(override, rules);
    for (let hour = from; hour < to; hour++) hours.add(hour);
  }

  return [...hours].sort((a, b) => a - b).map(hourToTime);
}

function overrideHourRange(
  override: AvailabilityOverride,
  rules: BookingRules
): { from: number; to: number } {
  if (!override.start_time || !override.end_time) {
    return { from: rules.startHour, to: rules.endHour };
  }
  return {
    from: timeToHour(override.start_time),
    to: timeToHour(override.end_time),
  };
}

/**
 * Open slots for one day: the weekly rules, plus `open` overrides, minus
 * `block` overrides. Bookings are subtracted separately by the caller so this
 * stays a pure function of the schedule.
 */
export function openSlotsForDate(
  dateKey: string,
  rules: BookingRules,
  overrides: AvailabilityOverride[]
): string[] {
  const dayOverrides = overrides.filter((o) => o.override_date === dateKey);
  const isNormallyOpen = rules.weekdays.includes(weekdayForDateKey(dateKey));

  const hours = new Set<number>();

  if (isNormallyOpen) {
    for (let hour = rules.startHour; hour < rules.endHour; hour++) {
      hours.add(hour);
    }
  }

  for (const override of dayOverrides) {
    if (override.kind !== "open") continue;
    const { from, to } = overrideHourRange(override, rules);
    for (let hour = from; hour < to; hour++) hours.add(hour);
  }

  // Blocks win over opens, so they are applied last.
  for (const override of dayOverrides) {
    if (override.kind !== "block") continue;
    if (!override.start_time || !override.end_time) {
      hours.clear();
      break;
    }
    const from = timeToHour(override.start_time);
    const to = timeToHour(override.end_time);
    for (let hour = from; hour < to; hour++) hours.delete(hour);
  }

  return [...hours].sort((a, b) => a - b).map(hourToTime);
}

export type AvailabilityMap = Record<string, string[]>;

/**
 * Open slots for every date in the window. Dates with no open slots are
 * omitted, which is what the calendar treats as "disabled".
 */
export function buildAvailabilityMap(
  fromDateKey: string,
  toDateKey: string,
  rules: BookingRules,
  overrides: AvailabilityOverride[]
): AvailabilityMap {
  const map: AvailabilityMap = {};

  let cursor = fromDateKey;
  // Bound the walk so a bad range cannot spin forever.
  for (let i = 0; i <= 400 && cursor <= toDateKey; i++) {
    const slots = openSlotsForDate(cursor, rules, overrides);
    if (slots.length > 0) map[cursor] = slots;
    cursor = addDaysToDateKey(cursor, 1);
  }

  return map;
}

/** Dates in the window where every open slot is already taken. */
export function fullyBookedDateKeys(
  availability: AvailabilityMap,
  bookedSlots: Set<string>
): string[] {
  return Object.entries(availability)
    .filter(([dateKey, slots]) =>
      slots.every((time) => bookedSlots.has(`${dateKey}T${time}`))
    )
    .map(([dateKey]) => dateKey);
}

export function isSlotOpen(
  dateKey: string,
  time: string,
  rules: BookingRules,
  overrides: AvailabilityOverride[]
): boolean {
  return openSlotsForDate(dateKey, rules, overrides).includes(time);
}
