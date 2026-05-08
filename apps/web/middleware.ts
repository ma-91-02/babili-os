import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/customer', '/r'];

const PROTECTED_PREFIXES = ['/admin', '/restaurant', '/staff'];

function preserveLang(request: NextRequest, response: NextResponse): NextResponse {
  const lang = request.nextUrl.searchParams.get('lang');
  if (lang) {
    response.headers.set('X-Lang', lang);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return preserveLang(request, NextResponse.next());
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico') {
    return preserveLang(request, NextResponse.next());
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const lang = request.nextUrl.searchParams.get('lang');
      if (lang) {
        loginUrl.searchParams.set('lang', lang);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return preserveLang(request, NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
