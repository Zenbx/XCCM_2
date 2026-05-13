// middleware.ts
/**
 * Middleware frontend pour protéger les routes de l'application
 *
 * - Redirige vers /login si utilisateur non authentifié
 * - Empêche l'accès aux pages auth (login/register) si déjà connecté
 * - Décodage du JWT stocké dans cookie HttpOnly
 * - Ajoute l'userId et le userRole dans les headers pour les requêtes internes
 * - Gère la logique de rôle (admin vs user)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes qui nécessitent une authentification
const protectedRoutes = ['/edit-home', '/edit', '/account', '/settings', '/admin', '/invitations', '/classrooms'];

// Routes réservées aux administrateurs
const adminRoutes = ['/admin'];

// Routes accessibles uniquement quand NON authentifié
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  console.log(`🔍 Middleware - Path: ${pathname}, Token: ${!!token}`);

  // Embed mode: token passed as URL param → set as JS-readable cookie before page renders.
  // httpOnly MUST be false: authService.getAuthToken() reads document.cookie (JS-land).
  // sameSite=none is required for cross-origin iframes (Moodle, Canvas, etc.).
  if (pathname.startsWith('/embed')) {
    const urlToken = request.nextUrl.searchParams.get('token');
    if (urlToken && !token) {
      const response = NextResponse.next();
      response.cookies.set('auth_token', urlToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
        maxAge: 60 * 60 * 8, // 8h session
      });
      return response;
    }
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    console.log('❌ Accès refusé (protégé) - Pas de token, redirection vers /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    console.log('✅ Déjà connecté, redirection vers /edit-home');
    return NextResponse.redirect(new URL('/edit-home', request.url));
  }

  if (token) {
    try {
      // Validation du secret JWT
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET non défini dans les variables d\'environnement');
        // Supprimer le cookie corrompu + rediriger pour éviter la boucle infinie
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      const userId = payload.userId as string;
      const userRole = payload.role as string; // Note: le role doit être ajouté au JWT backend

      if (!userId) {
        throw new Error('userId manquant dans le payload');
      }

      // Si c'est une route admin, vérifier le rôle
      if (isAdminRoute && userRole !== 'admin') {
        console.log(`❌ Accès refusé (admin) - Rôle: ${userRole}`);
        // Rediriger vers une page "non autorisé" ou la page d'accueil
        return NextResponse.redirect(new URL('/edit-home', request.url));
      }

      // Ajouter userId et userRole aux headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', userId);
      requestHeaders.set('x-user-role', userRole);

      console.log(`✅ Token valide - UserID: ${userId}, Role: ${userRole}`);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      console.error('❌ Token invalide:', error);

      const response = isProtectedRoute
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.next();

      // Supprimer le cookie corrompu
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protéger toutes les routes sauf les pages statiques et API
    '/((?!api|_next/static|_next/image|favicon.ico).+)',
  ],
};
