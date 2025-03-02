import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const PUBLIC_PATHS = ["/auth"];
  const PUBLIC_PREFIXES = ["/auth/"];

  if (request.nextUrl.pathname.startsWith("/api") ||
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/public")) {
    return NextResponse.next();
  }

  if (sessionCookie) {
    if (request.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  if (!sessionCookie) {
    const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname) ||
                         PUBLIC_PREFIXES.some(prefix => request.nextUrl.pathname.startsWith(prefix));

    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|public|.*\\..*$).*)"
  ]
};
