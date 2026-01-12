import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/home', '/profile', '/settings'];
const authRoutes = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (sessionCookie && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Redirect unauthenticated users to login
  if (!sessionCookie && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/profile/:path*', '/settings/:path*', '/login', '/register'],
};
