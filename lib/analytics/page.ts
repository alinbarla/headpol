import { MAX_PAGE_LENGTH } from "@/lib/analytics/constants";

/** Path only: drop origin, query, and hash. Reject admin routes. */
export function sanitizePagePath(value: unknown): string | null {
  if (typeof value !== "string") return null;

  let path = value.trim();
  if (!path) return null;

  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      path = new URL(path).pathname;
    }
  } catch {
    return null;
  }

  const cut = path.split("?")[0]?.split("#")[0] ?? "";
  if (!cut.startsWith("/")) return null;
  if (cut === "/admin" || cut.startsWith("/admin/")) return null;
  if (cut.length > MAX_PAGE_LENGTH) return null;
  if (!/^\/[A-Za-z0-9/_-]*$/.test(cut)) return null;

  return cut.replace(/\/{2,}/g, "/") || "/";
}

export function sanitizeReferrerPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value, "https://example.invalid");
    const path = url.pathname.split("?")[0]?.split("#")[0] ?? "";
    if (!path.startsWith("/")) return null;
    if (path.length > MAX_PAGE_LENGTH) return null;
    return path;
  } catch {
    return null;
  }
}
