import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy (formerly Middleware) that runs on the Edge before any page is served.
 * Next.js 16.2.9 requires the file to be named "proxy.ts" instead of "middleware.ts".
 *
 * Logic:
 * - If user hits "/" and has NOT set the "aiEngineEntered" cookie → redirect to /splash
 * - If user hits "/splash" and HAS the cookie → redirect to / (no going back)
 * - Everything else: pass through
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasEntered = request.cookies.get('aiEngineEntered')?.value === 'true';

  // Redirect new users from home to splash
  if (pathname === '/' && !hasEntered) {
    const splashUrl = new URL('/splash', request.url);
    const response = NextResponse.redirect(splashUrl, { status: 307 });
    // Prevent caching of the redirect to avoid stale redirects in Firefox
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  // Redirect returning users away from splash
  if (pathname === '/splash' && hasEntered) {
    const homeUrl = new URL('/', request.url);
    const response = NextResponse.redirect(homeUrl, { status: 307 });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Only run on home and splash, skip static files/_next internals
  matcher: ['/', '/splash'],
};
