// middleware.ts
/**
 * Middleware frontend pour protéger les routes de l'application
 *
 * - Redirige vers /login si utilisateur non authentifié
 * - Empêche l'accès aux pages auth (login/register) si déjà connecté
 * - Décodage du JWT stocké dans cookie HttpOnly
 * - Ajoute l'userId dans les headers pour les requêtes internes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes qui nécessitent une authentification
const protectedRoutes = ['/edit-home', '/edit', '/account', '/settings'];

// Routes accessibles uniquement quand NON authentifié
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Récupérer le token depuis le cookie HttpOnly "auth_token"
  const token = request.cookies.get('auth_token')?.value;

  console.log('🔍 Middleware - Path:', pathname);
  console.log('🔑 Token présent:', !!token);

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // ❌ Si route protégée et pas de token → redirige vers /login
  if (isProtectedRoute && !token) {
    console.log('❌ Accès refusé - Pas de token, redirection vers /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔄 Si route auth (login/register) et token présent → redirige vers /edit-home
  if (isAuthRoute && token) {
    console.log('✅ Déjà connecté, redirection vers /edit-home');
    return NextResponse.redirect(new URL('/edit-home', request.url));
  }

  // ✅ Si token présent, vérifie sa validité et ajoute x-user-id
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(token, secret);

      // ⚠️ Assure-toi que ton payload contient bien "userId" et non "us_id"
      const userId = payload.userId as string;

      if (!userId) {
        throw new Error('userId manquant dans le payload');
      }

      // Créer une nouvelle requête avec le header x-user-id
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', userId);

      console.log('✅ Token valide - User ID:', userId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('❌ Token invalide:', error);

      // Supprime le cookie et redirige vers login si nécessaire
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }
    }
  }

  // ✅ Si aucune condition précédente n’est remplie → accès autorisé
  console.log('✅ Accès autorisé');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/edit-home/:path*',
    '/edit/:path*',
    '/account/:path*',
    '/settings/:path*',
    '/login',
    '/register',
  ],
};
