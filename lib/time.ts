/**
 * `booking_date` and `booking_time` are naive local values for Stockholm.
 * Vercel functions run with TZ=UTC, so anything server-side that reasons about
 * "today" must convert explicitly instead of using the process timezone.
 * Sweden alternates between UTC+1 and UTC+2, so a fixed offset is not enough.
 */
export const STOCKHOLM_TIME_ZONE = "Europe/Stockholm";

const dateKeyFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: STOCKHOLM_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: STOCKHOLM_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Current (or given) instant as a YYYY-MM-DD key in Stockholm. */
export function stockholmDateKey(instant: Date = new Date()): string {
  // sv-SE already formats as YYYY-MM-DD.
  return dateKeyFormatter.format(instant);
}

/** Current (or given) instant as HH:MM in Stockholm. */
export function stockholmTime(instant: Date = new Date()): string {
  return timeFormatter.format(instant);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  // Midday UTC keeps the arithmetic clear of DST edges in either direction.
  const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return `${anchor.getUTCFullYear()}-${String(anchor.getUTCMonth() + 1).padStart(2, "0")}-${String(
    anchor.getUTCDate()
  ).padStart(2, "0")}`;
}

/** Day of week for a date key, 0 = Sunday, independent of the process timezone. */
export function weekdayForDateKey(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

export function compareDateKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Converts a Stockholm-local date and time into a real instant, resolving the
 * UTC offset that applies on that date rather than assuming one.
 */
export function stockholmDateTimeToInstant(dateKey: string, time: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // Start from the naive value read as UTC, then correct by the zone offset
  // that Stockholm actually had at that moment.
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMinutes = stockholmOffsetMinutes(new Date(naive));
  return new Date(naive - offsetMinutes * 60_000);
}

function stockholmOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STOCKHOLM_TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  const asUtc = Date.UTC(
    lookup("year"),
    lookup("month") - 1,
    lookup("day"),
    lookup("hour") % 24,
    lookup("minute"),
    lookup("second")
  );

  return (asUtc - instant.getTime()) / 60_000;
}

/** Formats a date key for display, e.g. "måndag 24 augusti 2026". */
export function formatDateKey(dateKey: string, locale: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

const stockholmTimestampFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: STOCKHOLM_TIME_ZONE,
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * Renders a stored timestamp in Stockholm time. These are `timestamptz` values
 * read on a server running as UTC, so formatting without an explicit zone would
 * show the owner times an hour or two off their own clock.
 */
export function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "—";

  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return "—";

  return stockholmTimestampFormatter.format(instant);
}
