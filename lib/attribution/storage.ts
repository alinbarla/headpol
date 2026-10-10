import { SESSION_STORAGE_KEY } from "@/lib/analytics/constants";
import {
  ATTRIBUTION_STORAGE_KEY,
  ATTRIBUTION_TTL_DAYS,
} from "@/lib/attribution/constants";
import {
  classifyAcquisition,
  isNonDirectChannel,
  type AttributionInput,
  type ClassifiedAttribution,
} from "@/lib/attribution/classify";

const SESSION_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StoredAttribution = AttributionInput & {
  channel: ClassifiedAttribution["channel"];
  capturedAt: number;
};

function ttlMs(): number {
  return ATTRIBUTION_TTL_DAYS * 24 * 60 * 60 * 1000;
}

function isFresh(capturedAt: number, now = Date.now()): boolean {
  return now - capturedAt <= ttlMs();
}

export function readStoredAttribution(
  now = Date.now()
): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (!parsed || typeof parsed.capturedAt !== "number") return null;
    if (!isFresh(parsed.capturedAt, now)) {
      localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredAttribution(value: StoredAttribution): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Quota / private mode — booking still works without attribution.
  }
}

/**
 * First non-direct touch wins within the TTL.
 *
 * Returning from Stripe Checkout (or any later referral) must not replace the
 * original Ads / organic / referral channel captured on the first visit.
 * Direct landings never clear a stored first touch; a later non-direct touch
 * may upgrade a stored direct landing.
 */
export function captureLandingAttribution(
  input: AttributionInput,
  now = Date.now()
): StoredAttribution {
  const classified = classifyAcquisition(input);
  const existing = readStoredAttribution(now);

  if (existing && isNonDirectChannel(existing.channel)) {
    return existing;
  }

  if (existing && !isNonDirectChannel(classified.channel)) {
    return existing;
  }

  const next: StoredAttribution = {
    ...classified,
    capturedAt: now,
  };
  writeStoredAttribution(next);
  return next;
}

/** Payload shape sent with the booking POST. */
export function attributionForBookingPost(): AttributionInput | null {
  const stored = readStoredAttribution();
  if (!stored) return null;
  const { capturedAt: _capturedAt, channel: _channel, ...input } = stored;
  return input;
}

/** First-party analytics session id for joining bookings ↔ visitors. */
export function analyticsSessionIdForBookingPost(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (value && SESSION_UUID_RE.test(value)) return value;
  } catch {
    // Private mode / blocked storage.
  }
  return null;
}
