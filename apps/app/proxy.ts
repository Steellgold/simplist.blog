import { auth } from "@/lib/auth";
import { prisma } from "@simplist/db";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Routes that should NOT trigger account guards.
 * These are public pages or pages needed for restricted accounts.
 */
const PUBLIC_ROUTES = ["/auth", "/account-restricted", "/reactivate", "/api"];

/**
 * Proxy that checks user account status and redirects if restricted.
 * This runs on every request before the page is rendered.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip guard for public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // No session = not logged in, let the page handle auth redirect
  if (!session?.user?.id) {
    return NextResponse.next();
  }

  // Fetch fresh user status from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      status: true,
      suspensionEndsAt: true,
      deletionScheduledAt: true,
    },
  });

  if (!user) {
    return NextResponse.next();
  }

  // Check account restriction
  if (user.status !== "ACTIVE") {
    // Check if suspension has expired
    if (user.status === "SUSPENDED" && user.suspensionEndsAt) {
      const endsAt = new Date(user.suspensionEndsAt);
      if (!Number.isNaN(endsAt.getTime()) && endsAt.getTime() <= Date.now()) {
        // Suspension expired, update status to ACTIVE
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            status: "ACTIVE",
            statusReasonCode: null,
            statusReason: null,
            suspensionEndsAt: null,
            statusUpdatedAt: new Date(),
          },
        });
        // Don't redirect, account is now active
        return NextResponse.next();
      }
    }

    // Redirect to account-restricted page
    return NextResponse.redirect(new URL("/account-restricted", request.url));
  }

  // Check pending deletion
  if (user.deletionScheduledAt) {
    const scheduledAt = new Date(user.deletionScheduledAt);
    if (
      !Number.isNaN(scheduledAt.getTime()) &&
      scheduledAt.getTime() > Date.now()
    ) {
      return NextResponse.redirect(new URL("/reactivate", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
