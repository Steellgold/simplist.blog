import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - og (OG image routes)
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!og|api|_next/static|_next/image|favicon.ico).*)',
  ],
}
