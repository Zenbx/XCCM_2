// services/authService.ts
import { User, LoginResponse, RegisterData } from '@/types/auth';
import { setCookie, getCookie, deleteCookie } from '@/lib/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

    setCookie('auth_token', data.data.token);
    // Stockage local pour un accès UI rapide, mais la vérité reste le token
    sessionStorage.setItem('user', JSON.stringify(data.data.user));

    return data.data.user;
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    setCookie('auth_token', data.data.token);
    sessionStorage.setItem('user', JSON.stringify(data.data.user));

    return data.data.user;
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Session expirée');
      }
      if (!response.ok) {
        throw new Error('Erreur de récupération du profil utilisateur');
      }

      const data = await response.json();
      // Supposant que l'API renvoie { success: true, data: { user: {...} } }
      if (!data.data.user) {
        throw new Error("Format de réponse utilisateur invalide");
      }
      
      // Mettre à jour le user en session storage
      sessionStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data.user;
    } catch (error) {
      console.error("Erreur dans getCurrentUser:", error);
      this.clearAuth(); // Nettoyer en cas d'erreur critique
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
    return getCookie('auth_token');
  }

  clearAuth(): void {
    deleteCookie('auth_token');
    sessionStorage.removeItem('user');
  }
}

export const authService = new AuthService();