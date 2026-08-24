/**
 * Shared between proxy.ts and the admin server code, so this module must stay
 * free of Node-only imports.
 */

const PRODUCTION_COOKIE = "__Host-admin_session";
const DEV_COOKIE = "admin_session";

/**
 * The `__Host-` prefix requires HTTPS, which rules it out on
 * http://admin.localhost:3000 during development.
 */
export const ADMIN_SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? PRODUCTION_COOKIE : DEV_COOKIE;

export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

/** Re-issue the cookie when less than this remains, giving a rolling session. */
export const ADMIN_SESSION_REFRESH_THRESHOLD_SECONDS = 6 * 60 * 60;

export const ADMIN_LOGIN_PATH = "/admin/login";

export const ADMIN_MIN_PIN_LENGTH = 6;

/** Failed PIN entries allowed from one IP inside the lockout window. */
export const ADMIN_MAX_LOGIN_ATTEMPTS = 5;
export const ADMIN_LOGIN_WINDOW_MINUTES = 15;

function normalizeHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0];
}

/**
 * Matches the configured admin domain. Falls back to `admin.localhost` so the
 * admin is reachable in development without extra configuration.
 */
export function isAdminHost(host: string | null | undefined): boolean {
  if (!host) return false;

  const candidate = normalizeHost(host);
  if (!candidate) return false;

  const configured = process.env.ADMIN_HOST;
  if (configured) {
    return candidate === normalizeHost(configured);
  }

  return candidate === "admin.localhost";
}
