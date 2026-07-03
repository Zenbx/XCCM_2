// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
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
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const cachedUser = typeof window !== 'undefined'
        ? localStorage.getItem('xccm2_user')
        : null;

      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          setUser(parsed);
          setIsLoading(false);
        } catch {
          // Cache invalide
        }
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);

    if (loggedInUser.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/edit-home');
    }
  }, [router]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.push('/');
  }, [router]);

  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn("🔔 [AuthContext] Session expirée détectée globalement. Déconnexion...");
      logout();
    };

    window.addEventListener('xccm2:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('xccm2:auth-expired', handleAuthExpired);
  }, [logout]);

  const register = useCallback(async (userData: any) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
    router.push('/edit-home');
  }, [router]);

  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const getAuthToken = useCallback(() => {
    return authService.getAuthToken();
  }, []);

  useEffect(() => {
    const publicRoutes = ['/', '/login', '/register', '/library', '/help', '/about', '/book-reader', '/auth', '/embed', '/sandbox'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    if (isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      const token = authService.getAuthToken();
      if (token) {
        return;
      }
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      isAdmin,
      login,
      logout,
      register,
      refreshUser,
      getAuthToken,
    }),
    [user, isAuthenticated, isLoading, isAdmin, login, logout, register, refreshUser, getAuthToken],
  );

  return (
    <AuthContext.Provider value={value}>
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
