// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/authService';

interface User {
  user_id: string;
  email: string;
  firstname: string;
  lastname: string;
  occupation?: string;
  org?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Routes publiques
  const publicRoutes = ['/', '/login', '/register', '/about', '/help', '/library'];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, pathname]);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        setUser(null);
        return;
      }

      const userData = await authService.getCurrentUser(token); // injecter le token dans Authorization
      setUser(userData);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);

    if (response.data.token && response.data.user) {
      // Stocker le token dans un cookie HttpOnly via backend ou localStorage temporairement
      document.cookie = `auth_token=${response.data.token}; path=/;`;

      setUser(response.data.user);
    } else {
      throw new Error('Connexion échouée');
    }
  };

  const logout = async () => {
    document.cookie = 'auth_token=; Max-Age=0; path=/;';
    setUser(null);
    router.push('/');
  };

  const register = async (userData: any) => {
    const response = await authService.register(userData);
    if (response.data.token && response.data.user) {
      document.cookie = `auth_token=${response.data.token}; path=/;`;
      setUser(response.data.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
