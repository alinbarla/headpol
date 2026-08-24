import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_LOGIN_WINDOW_MINUTES,
  ADMIN_MAX_LOGIN_ATTEMPTS,
  ADMIN_MIN_PIN_LENGTH,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  ADMIN_SESSION_REFRESH_THRESHOLD_SECONDS,
} from "@/lib/admin/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

type SessionPayload = {
  /** Unix seconds. */
  exp: number;
  /** Random per-session id, recorded in the audit log to group actions. */
  sid: string;
};

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "locked" | "misconfigured" };

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

function getAdminPin(): string | null {
  const pin = process.env.ADMIN_PIN;
  if (!pin || pin.length < ADMIN_MIN_PIN_LENGTH) return null;
  return pin;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Constant-time comparison that tolerates differing lengths. `timingSafeEqual`
 * throws on a length mismatch, and the throw itself would leak the length.
 */
function safeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  // Hash both sides so the compared buffers always match in length.
  const digestA = createHmac("sha256", "compare").update(bufferA).digest();
  const digestB = createHmac("sha256", "compare").update(bufferB).digest();

  return timingSafeEqual(digestA, digestB);
}

export function createSessionToken(secret: string): string {
  const payload: SessionPayload = {
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS,
    sid: randomBytes(9).toString("base64url"),
  };

  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string
): SessionPayload | null {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const encoded = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!safeEquals(signature, sign(encoded, secret))) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    if (typeof payload.exp !== "number" || typeof payload.sid !== "string") {
      return null;
    }
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerList.get("x-real-ip");
}

async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Serverless instances cannot share an in-memory counter, so the throttle
 * lives in the database. A six-digit PIN is only ~20 bits, which is trivially
 * brute-forced without this.
 */
async function isLockedOut(ip: string | null): Promise<boolean> {
  if (!ip) return false;

  const since = new Date(
    Date.now() - ADMIN_LOGIN_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .eq("succeeded", false)
    .gte("created_at", since);

  if (error) {
    // Fail closed: an unreachable throttle store must not become an open door.
    console.error("[admin] lockout check failed", error.message);
    return true;
  }

  return (count ?? 0) >= ADMIN_MAX_LOGIN_ATTEMPTS;
}

async function recordLoginAttempt(
  ip: string | null,
  succeeded: boolean
): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("admin_login_attempts").insert({ ip, succeeded });
  } catch (error) {
    console.error("[admin] could not record login attempt", error);
  }
}

export async function login(pin: string): Promise<LoginResult> {
  const secret = getSessionSecret();
  const expectedPin = getAdminPin();

  if (!secret || !expectedPin) {
    console.error(
      "[admin] ADMIN_PIN (min 6 chars) and ADMIN_SESSION_SECRET (min 32 chars) must both be set"
    );
    return { ok: false, reason: "misconfigured" };
  }

  const ip = await getClientIp();

  if (await isLockedOut(ip)) {
    return { ok: false, reason: "locked" };
  }

  if (!safeEquals(pin, expectedPin)) {
    await recordLoginAttempt(ip, false);
    return { ok: false, reason: "invalid" };
  }

  await recordLoginAttempt(ip, true);
  await setSessionCookie(createSessionToken(secret));
  await logAdminAction("admin.login", { entityType: "admin" });

  return { ok: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return verifySessionToken(token, secret);
}

/**
 * The authoritative gate. The proxy only checks that a cookie exists, which
 * the Next.js docs are explicit is not an authorization boundary, so every
 * admin page and server action calls this.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    redirect(ADMIN_LOGIN_PATH);
  }

  await maybeRefreshSession(session);
  return session;
}

/**
 * Route handlers cannot redirect, so they get a boolean instead.
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

async function maybeRefreshSession(session: SessionPayload): Promise<void> {
  const secondsLeft = session.exp - Math.floor(Date.now() / 1000);
  if (secondsLeft > ADMIN_SESSION_REFRESH_THRESHOLD_SECONDS) return;

  const secret = getSessionSecret();
  if (!secret) return;

  try {
    await setSessionCookie(createSessionToken(secret));
  } catch {
    // Server Components cannot set cookies; the next action refreshes instead.
  }
}

export async function logAdminAction(
  action: string,
  options: {
    entityType?: string;
    entityId?: string;
    details?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    const ip = await getClientIp();
    const supabase = getSupabaseAdminClient();

    await supabase.from("admin_audit_log").insert({
      action,
      entity_type: options.entityType ?? null,
      entity_id: options.entityId ?? null,
      details: options.details ?? null,
      ip,
    });
  } catch (error) {
    // Never let audit logging break the action it is recording.
    console.error("[admin] audit log write failed", error);
  }
}
