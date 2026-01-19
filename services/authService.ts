// services/authService.ts
import { User, LoginResponse, RegisterData } from '@/types/auth';
import { setCookie, getCookie, deleteCookie } from '@/lib/cookies';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

// Clé pour le stockage local de l'utilisateur
const USER_STORAGE_KEY = 'xccm2_user';
const TOKEN_STORAGE_KEY = 'xccm2_auth_token';

class AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }

    // Stocker le token dans cookie ET localStorage pour persistance
    setCookie('auth_token', data.data.token);
    this.setStoredToken(data.data.token);
    this.setStoredUser(data.data.user);

    return data.data.user;
  }

  async register(userData: RegisterData): Promise<User> {
    let body;
    const headers: HeadersInit = {};

    if (userData.profile_picture) {
      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      body = formData;
      // Content-Type header is automatically set by browser with boundary for FormData
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(userData);
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers,
      body,
    });

    const data: LoginResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    setCookie('auth_token', data.data.token);
    this.setStoredToken(data.data.token);
    this.setStoredUser(data.data.user);

    return data.data.user;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getAuthToken();
    if (!token) {
      return null;
    }

    // Essayer d'abord de récupérer l'utilisateur depuis le cache local
    const cachedUser = this.getStoredUser();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Session expirée');
      }
      if (!response.ok) {
        // Si l'API échoue mais qu'on a un user en cache, le retourner
        if (cachedUser) {
          console.warn('API /me failed, using cached user');
          return cachedUser;
        }
        throw new Error('Erreur de récupération du profil utilisateur');
      }

      const data = await response.json();
      if (!data.data?.user) {
        if (cachedUser) return cachedUser;
        throw new Error("Format de réponse utilisateur invalide");
      }

      // Mettre à jour le cache local
      this.setStoredUser(data.data.user);

      return data.data.user;
    } catch (error) {
      // Si on a un utilisateur en cache et que c'est juste une erreur réseau, le retourner
      if (cachedUser && !(error instanceof Error && error.message === 'Session expirée')) {
        console.warn('Using cached user due to network error');
        return cachedUser;
      }
      console.error("Erreur dans getCurrentUser:", error);
      this.clearAuth();
      throw error;
    }
  }

  async logout(): Promise<void> {
    const token = this.getAuthToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Le serveur de logout n'a pas pu être atteint, déconnexion locale.");
      }
    }
    this.clearAuth();
  }

  getAuthToken(): string | null {
    // Essayer d'abord le cookie, puis le localStorage
    const cookieToken = getCookie('auth_token');
    if (cookieToken) return cookieToken;

    // Fallback sur localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    }
    return null;
  }

  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  }

  private setStoredUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  clearAuth(): void {
    deleteCookie('auth_token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem('user'); // Nettoyage legacy
    }
  }
  async getAllUsers(): Promise<User[]> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Non authentifié');

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de la récupération des utilisateurs');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteUser(userId: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Non authentifié');

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de la suppression');
    }
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Non authentifié');

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du rôle');
    }
  }
}

export const authService = new AuthService();