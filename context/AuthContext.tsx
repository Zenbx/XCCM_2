// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean; // Ajout de la commodité isAdmin
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;
  /* 
   * LOGIQUE ADMIN
   * - Role 'admin' explicit
   * - OU pas de rôle défini (Legacy Support pour les premiers inscrits)
   */
  const isAdmin = isAuthenticated && (user?.role === 'admin' || !user?.role);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Essayer de charger rapidement depuis le cache local d'abord
      const cachedUser = typeof window !== 'undefined'
        ? localStorage.getItem('xccm2_user')
        : null;

      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          setUser(parsed);
          // Continuer à vérifier en arrière-plan
          setIsLoading(false);
        } catch {
          // Cache invalide, ignorer
        }
      }

      // Vérifier avec l'API pour s'assurer que la session est valide
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);

    // Redirection basée sur le rôle
    if (loggedInUser.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/edit-home');
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/');
  };

  // Écouteur global pour l'expiration de session (401)
  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn("🔔 [AuthContext] Session expirée détectée globalement. Déconnexion...");
      logout();
    };

    window.addEventListener('xccm2:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('xccm2:auth-expired', handleAuthExpired);
  }, [logout]);

  const register = async (userData: any) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
    router.push('/edit-home');
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const getAuthToken = () => {
    return authService.getAuthToken();
  };

  // Protection de route raffinée
  useEffect(() => {
    const publicRoutes = ['/', '/login', '/register', '/library', '/help', '/about', '/book-reader', '/auth'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    if (isLoading) return; // Ne rien faire pendant le chargement initial

    if (!isAuthenticated && !isPublicRoute) {
      // Vérifier si un token existe malgré l'absence d'objet user (gap d'hydratation)
      const token = authService.getAuthToken();
      if (token) {
        console.log("⏳ Hydratation en cours (token présent mais user absent), on attend...");
        return;
      }

      console.log("🛑 Non authentifié sur une route protégée, redirection vers /login");
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isAdmin, login, logout, register, refreshUser, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
