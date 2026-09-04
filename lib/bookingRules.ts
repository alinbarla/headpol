import "server-only";

import {
  DEFAULT_BOOKING_RULES,
  parseBookingRules,
  type AvailabilityOverride,
  type BookingRules,
} from "@/lib/availability";
import {
  getSupabaseAdminClient,
  getSupabaseServerClient,
  withSupabaseTimeout,
} from "@/lib/supabase/server";

const BOOKING_RULES_KEY = "booking_rules";
/** Previous public default; rows still on this amount are lifted to 899 kr. */
const LEGACY_PRICE_ORE = 79900;

/**
 * Reads the rules from the settings table. A missing row or an unreachable
 * database falls back to the original hard-coded values rather than taking the
 * booking form down.
 */
export async function getBookingRules(): Promise<BookingRules> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("settings")
        .select("value")
        .eq("key", BOOKING_RULES_KEY)
        .maybeSingle()
    );

    if (error || !data) return DEFAULT_BOOKING_RULES;

    const rules = parseBookingRules(data.value);
    const raw =
      data.value && typeof data.value === "object"
        ? (data.value as Record<string, unknown>)
        : {};

    const needsPersist =
      typeof raw.weekdayMaxBookings !== "number" ||
      typeof raw.weekendMaxBookings !== "number" ||
      raw.priceOre === LEGACY_PRICE_ORE;

    if (needsPersist) {
      const next: BookingRules = {
        ...rules,
        priceOre:
          raw.priceOre === LEGACY_PRICE_ORE
            ? DEFAULT_BOOKING_RULES.priceOre
            : rules.priceOre,
      };
      void persistBookingRules(next);
      return next;
    }

    return rules;
  } catch {
    return DEFAULT_BOOKING_RULES;
  }
}

async function persistBookingRules(rules: BookingRules): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    await withSupabaseTimeout(
      supabase
        .from("settings")
        .upsert({ key: BOOKING_RULES_KEY, value: rules }, { onConflict: "key" })
    );
  } catch {
    // Read path must stay available even if the write-back fails.
  }
}

export async function getAvailabilityOverrides(
  fromDateKey: string,
  toDateKey: string
): Promise<AvailabilityOverride[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("availability_overrides")
        .select("id, override_date, start_time, end_time, kind, note")
        .gte("override_date", fromDateKey)
        .lte("override_date", toDateKey)
        .order("override_date", { ascending: true })
    );

    if (error || !data) return [];

    return (data as AvailabilityOverride[]).map((row) => ({
      ...row,
      // Postgres returns HH:MM:SS; the slot vocabulary is HH:MM.
      start_time: row.start_time ? row.start_time.slice(0, 5) : null,
      end_time: row.end_time ? row.end_time.slice(0, 5) : null,
    }));
  } catch {
    return [];
  }
}
