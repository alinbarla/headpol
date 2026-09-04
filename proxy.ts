import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isAdminHost } from "@/lib/admin/constants";
import { routing } from "@/lib/i18n";

const intlProxy = createMiddleware(routing);

const METADATA_PATHS = /^\/(icon|apple-icon|opengraph-image|twitter-image)(\/|$)/;

/**
 * The admin lives on its own host inside the same project. next-intl has to be
 * bypassed there, otherwise a request to admin.stralkastarpolering.se/ would be
 * rewritten into the locale tree.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Stripe was historically pointed at the site root. Any signed webhook POST
  // is rewritten to the real handler so delivery works even when the Dashboard
  // URL is wrong (as long as the endpoint is still enabled).
  if (
    request.method === "POST" &&
    request.headers.has("stripe-signature") &&
    pathname !== "/api/stripe/webhook"
  ) {
    const target = request.nextUrl.clone();
    target.pathname = "/api/stripe/webhook";
    return NextResponse.rewrite(target);
  }

  if (isAdminHost(request.headers.get("host"))) {
    return handleAdminHost(request, pathname);
  }

  // The admin tree is only reachable through the admin host. Answer as if the
  // path does not exist rather than redirecting, which would advertise it.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  // Old prefixed URLs: /sv/priser → /priser, /en → /. Keep this in proxy, not
  // next.config redirects — those would also match the internal /sv rewrite
  // next-intl uses and loop.
  const prefixed = pathname.match(/^\/(sv|en)(?=\/|$)/);
  if (prefixed) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(prefixed[0].length) || "/";
    return NextResponse.redirect(url, 308);
  }

  // File-based metadata routes have no locale segment. Sending them through
  // next-intl would rewrite /icon to /sv/icon and 404.
  if (METADATA_PATHS.test(pathname)) {
    return NextResponse.next();
  }

  return intlProxy(request);
}

function handleAdminHost(request: NextRequest, pathname: string) {
  // /admin/* on the admin host would rewrite to /admin/admin/*; send the
  // canonical URL instead so links and redirects stay consistent.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const canonical = request.nextUrl.clone();
    canonical.pathname = pathname.slice("/admin".length) || "/";
    return NextResponse.redirect(canonical);
  }

  const target = request.nextUrl.clone();
  target.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;

  const isLoginRoute = pathname === "/login";
  const hasSessionCookie = request.cookies.has(ADMIN_SESSION_COOKIE);

  // Optimistic only. Next.js is explicit that proxy is not an authorization
  // boundary, so requireAdmin() re-checks the signature in every page and
  // server action. This just avoids rendering the shell for signed-out users.
  if (!hasSessionCookie && !isLoginRoute) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    return noIndex(NextResponse.rewrite(login));
  }

  if (hasSessionCookie && isLoginRoute) {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    return noIndex(NextResponse.redirect(home));
  }

  return noIndex(NextResponse.rewrite(target));
}

function noIndex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  // `/api` is excluded so the Stripe webhook and cron endpoints are never
  // rewritten or gated. Dotted paths cover robots.txt, sitemap.xml, the
  // manifest and generated metadata images.
  matcher: ["/((?!_next/static|_next/image|api/|.*\\..*).*)"],
};
