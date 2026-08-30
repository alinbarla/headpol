import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isAdminHost } from "@/lib/admin/constants";
import { routing } from "@/lib/i18n";

const intlProxy = createMiddleware(routing);

/**
 * The admin lives on its own host inside the same project. next-intl has to be
 * bypassed there, otherwise a request to admin.stralkastarpolering.se/ would be
 * redirected to /sv before it ever reaches the admin tree.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminHost(request.headers.get("host"))) {
    return handleAdminHost(request, pathname);
  }

  // The admin tree is only reachable through the admin host. Answer as if the
  // path does not exist rather than redirecting, which would advertise it.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  // Google Ads fetches the bare origin. next-intl's 307 to /sv is text/plain
  // with no Google tag, so their installer reports the tag as missing. Serve
  // the Swedish homepage at / instead; canonicals still point at /sv.
  if (pathname === "/") {
    const swedish = request.nextUrl.clone();
    swedish.pathname = "/sv";
    const response = NextResponse.rewrite(swedish);
    response.cookies.set("NEXT_LOCALE", "sv", { path: "/", sameSite: "lax" });
    return response;
  }

  // Preserve the previous narrow matcher behaviour: paths outside the locale
  // tree stay untouched and fall through to a 404 rather than being redirected.
  if (/^\/(sv|en)(\/|$)/.test(pathname)) {
    return intlProxy(request);
  }

  return NextResponse.next();
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
