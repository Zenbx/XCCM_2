// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/authService';

export interface User {
  us_id: string;
  email: string;
  firstname: string;  // ✅ firstname (pas prenom)
  lastname: string;   // ✅ lastname (pas nom)
  occupation?: string; // ✅ occupation (pas profession)
  org?: string;       // ✅ org (pas organisation)
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;
  const router = useRouter();
  const pathname = usePathname();

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/', '/login', '/register', '/about', '/help', '/library'];

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  // Rediriger si nécessaire après vérification de l'auth
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      if (!isAuthenticated && !isPublicRoute) {
        // Utilisateur non authentifié sur route protégée -> redirection vers login
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, pathname]);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        setUser(null);
        return;
      }

      // Vérifier si le token est valide en récupérant les infos utilisateur
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      // Token invalide ou expiré
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.data.token && response.data.user) {
        // Sauvegarder le token
        localStorage.setItem('authToken', response.data.token);
        
        // Sauvegarder les infos utilisateur
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Mettre à jour l'état
        setUser(response.data.user);
        
        // IMPORTANT: La redirection doit être gérée par le composant Login
        // après l'exécution réussie de cette fonction
      } else {
        throw new Error('Données de connexion invalides');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Appeler l'API de déconnexion si nécessaire
      // await authService.logout();
      
      // Nettoyer le localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Réinitialiser l'état
      setUser(null);
      
      // Rediriger vers la page d'accueil
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      
      // Après l'inscription, connecter automatiquement l'utilisateur
      if (response.data.token && response.data.user) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        
        // La redirection sera gérée par le composant Register
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}