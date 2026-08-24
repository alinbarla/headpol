import "server-only";

import { timingSafeEqual, createHash } from "node:crypto";

/**
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Anyone can reach
 * these routes over the public internet, so an unset secret must deny rather
 * than allow.
 */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set; refusing to run");
    return false;
  }

  const header = request.headers.get("authorization");
  if (!header) return false;

  const expected = `Bearer ${secret}`;
  const a = createHash("sha256").update(header).digest();
  const b = createHash("sha256").update(expected).digest();

  return timingSafeEqual(a, b);
}

export function unauthorized(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
