import "server-only";

import {
  ANALYTICS_SETTINGS_KEY,
  DEFAULT_ANALYTICS_SETTINGS,
} from "@/lib/analytics/constants";
import type { AnalyticsSettings } from "@/lib/analytics/types";
import {
  getSupabaseAdminClient,
  withSupabaseTimeout,
} from "@/lib/supabase/server";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function parseAnalyticsSettings(value: unknown): AnalyticsSettings {
  if (!value || typeof value !== "object") return DEFAULT_ANALYTICS_SETTINGS;

  const raw = value as Record<string, unknown>;
  const sampleRate =
    typeof raw.sampleRate === "number" && Number.isFinite(raw.sampleRate)
      ? clamp(raw.sampleRate, 0, 1)
      : DEFAULT_ANALYTICS_SETTINGS.sampleRate;
  const retentionDays =
    typeof raw.retentionDays === "number" && Number.isFinite(raw.retentionDays)
      ? clamp(Math.round(raw.retentionDays), 1, 365)
      : DEFAULT_ANALYTICS_SETTINGS.retentionDays;

  return {
    enabled: raw.enabled === true,
    sampleRate,
    retentionDays,
  };
}

/**
 * Fail closed: a missing row or unreachable database means collection stays off.
 * Uses the service-role client because RLS only allows public SELECT of
 * `booking_rules` — `analytics_settings` is otherwise invisible and the
 * tracker would never start.
 */
export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await withSupabaseTimeout(
      supabase
        .from("settings")
        .select("value")
        .eq("key", ANALYTICS_SETTINGS_KEY)
        .maybeSingle()
    );

    if (error || !data) return DEFAULT_ANALYTICS_SETTINGS;
    return parseAnalyticsSettings(data.value);
  } catch {
    return DEFAULT_ANALYTICS_SETTINGS;
  }
}

export async function saveAnalyticsSettings(
  settings: AnalyticsSettings
): Promise<AnalyticsSettings> {
  const next = parseAnalyticsSettings(settings);
  const supabase = getSupabaseAdminClient();
  const { error } = await withSupabaseTimeout(
    supabase.from("settings").upsert(
      { key: ANALYTICS_SETTINGS_KEY, value: next },
      { onConflict: "key" }
    )
  );

  if (error) {
    throw new Error(error.message);
  }

  return next;
}
