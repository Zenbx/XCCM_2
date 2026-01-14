// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

interface User {
  user_id: string;
  email: string;
  firstname: string;
  lastname: string;
  occupation?: string;
  org?: string;
  created_at: string;
  role: string; // Ajout du champ role
}

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
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      // Pas besoin de clearAuth ici, getCurrentUser le fait déjà en cas de 401
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

  // Protection de route simplifiée (le middleware est le principal garde)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !['/login', '/register', '/'].includes(pathname)) {
       router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname]);


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
