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
 * Last non-direct touch wins within the TTL. A direct landing never clears a
 * fresher Ads / organic / referral touch.
 */
export function captureLandingAttribution(
  input: AttributionInput,
  now = Date.now()
): StoredAttribution {
  const classified = classifyAcquisition(input);
  const existing = readStoredAttribution(now);

  const next: StoredAttribution = {
    ...classified,
    capturedAt: now,
  };

  if (!isNonDirectChannel(classified.channel)) {
    if (existing && isNonDirectChannel(existing.channel)) {
      return existing;
    }
    writeStoredAttribution(next);
    return next;
  }

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
