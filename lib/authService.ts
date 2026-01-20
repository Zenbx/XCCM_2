// lib/authService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  user_id: string;
  email: string;
  firstname: string;
  lastname: string;
  occupation?: string;
  org?: string;
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface RegisterData {
  lastname: string;
  firstname: string;
  email: string;
  password: string;
  password_confirmation: string;
  occupation?: string;    
  org?: string;  
}

/**
 * Helpers pour gérer les cookies côté client
 */
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/;`;
}

/**
 * Service pour gérer l'authentification
 */
class AuthService {
  /**
   * Connexion utilisateur
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      // Stocker le token dans un cookie (au lieu de localStorage)
      setCookie('auth_token', data.data.token, 7);
      
      // Optionnel : stocker l'utilisateur pour y accéder rapidement
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      const apiData = {
        lastname: userData.lastname,
        firstname: userData.firstname,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        occupation: userData.occupation,
        org: userData.org,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Stocker le token dans un cookie
      setCookie('auth_token', data.data.token, 7);
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur');
      }

      const data = await response.json();
      return data.data.user;
    } catch (error) {
      console.error('Erreur getCurrentUser:', error);
      throw error;
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    try {
      const token = this.getAuthToken();

      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      this.clearAuth();
    } catch (error) {
      console.error('Erreur logout:', error);
      this.clearAuth();
    }
  }

  /**
   * Récupère le token d'authentification depuis le cookie
   */
  getAuthToken(): string | null {
    return getCookie('auth_token');
  }

  /**
   * Nettoie les données d'authentification
   */
  clearAuth(): void {
    deleteCookie('auth_token');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user');
    }
  }
}

export const authService = new AuthService();