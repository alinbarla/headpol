/**
 * Shared between next.config.ts (CSP frame-ancestors) and the public replay
 * bridge. Keep this free of Node-only and server-only imports.
 */
export function getAdminHost(): string {
  return process.env.ADMIN_HOST ?? "admin.stralkastarpolering.se";
}

function originsForHost(host: string): string[] {
  const clean = host.trim().toLowerCase().split(":")[0];
  if (!clean) return [];
  if (clean.endsWith("localhost") || clean.endsWith(".local")) {
    return [`http://${clean}`, `http://${clean}:3000`];
  }
  return [`https://${clean}`];
}

export function getAdminOrigins(): string[] {
  return [
    ...new Set([
      ...originsForHost(getAdminHost()),
      ...originsForHost("admin.localhost"),
    ]),
  ];
}

export function adminFrameAncestors(): string {
  return ["'self'", ...getAdminOrigins()].join(" ");
}
