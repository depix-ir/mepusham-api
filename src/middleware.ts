import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Only handle /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("mepusham_admin_auth_token")?.value;
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    // If admin is already logged in with token, redirect away from login page to dashboard
    if (token) {
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // Protected /admin/* routes
  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    // Sanitize redirect parameter to prevent open redirect vulnerabilities
    if (pathname.startsWith("/admin") && !pathname.startsWith("//")) {
      loginUrl.searchParams.set("redirect", pathname + search);
    }
    const response = NextResponse.redirect(loginUrl);
    // Prevent client caching of redirects
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return response;
  }

  // Response with security headers to prevent back-button viewing of stale admin pages
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
