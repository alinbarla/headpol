import "server-only";

import { latestAuditLog } from "./store";
import type { SeoAuditType } from "./types";

const HOUR_MS = 60 * 60 * 1000;

export async function seoToolCooldown(
  type: SeoAuditType
): Promise<{ allowed: boolean; retryAfterMinutes: number }> {
  const latest = await latestAuditLog(type);
  if (!latest) return { allowed: true, retryAfterMinutes: 0 };

  const elapsed = Date.now() - new Date(latest.created_at).getTime();
  if (elapsed >= HOUR_MS) return { allowed: true, retryAfterMinutes: 0 };

  return {
    allowed: false,
    retryAfterMinutes: Math.max(1, Math.ceil((HOUR_MS - elapsed) / 60_000)),
  };
}
