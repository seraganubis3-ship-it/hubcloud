import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes and /api/admin endpoints
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    let session = null;
    if (sessionCookie) {
      session = await verifySessionToken(sessionCookie);
    }

    const isAuthorizedAdmin = session && (session.role === 'admin' || session.email.includes('admin'));

    if (!isAuthorizedAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access denied. Administrative authentication required.',
          },
          { status: 401 }
        );
      }

      // Redirect browser to login page with return url
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
