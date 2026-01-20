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
  const isAdmin = user?.role === 'admin' || !user?.role;

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

  const register = async (userData: any) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
    router.push('/edit-home');
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  // Protection de route simplifiée (le middleware est le principal garde, mais la protection client-side est aussi active ici)
  // AJOUTER ICI LES ROUTES PUBLIQUES SUPPLÉMENTAIRES
  useEffect(() => {
    const publicRoutes = ['/', '/login', '/register', '/library', '/help', '/about', '/book-reader'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isAdmin, login, logout, register, refreshUser }}>
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
