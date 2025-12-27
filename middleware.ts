import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedRoutes = ['/edit-home', '/account', '/settings'];

// Routes accessibles uniquement quand NON authentifié
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const { pathname } = request.nextUrl;

  // Rediriger vers login si tentative d'accès à une route protégée sans token
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rediriger vers edit-home si déjà authentifié et tentative d'accès à login/register
  if (authRoutes.some(route => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL('/edit-home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/edit-home/:path*',
    '/account/:path*',
    '/settings/:path*',
    '/login',
    '/register',
  ],
};
