// services/authService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      us_id: string;
      email: string;
      prenom: string;
      nom: string;
      profession?: string;
      created_at: string;
    };
  };
}

export interface RegisterData {
  lastname: string;
  firstname: string;
  email: string;
  password: string;
  password_confirmation: string;
  occupation?: string;    // Champ optionnel (profession)
  org?: string;  // Champ optionnel (organisation)
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
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
      // Transformer les données pour correspondre à l'API backend
      const apiData = {
        lastname: userData.lastname,
        firstname: userData.firstname,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        occupation: userData.occupation,  // profession → occupation
        org: userData.org,       // organisation → org
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
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
  async getCurrentUser() {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Non authentifié');
      }

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

      // Nettoyer le localStorage
      this.clearAuth();
    } catch (error) {
      console.error('Erreur logout:', error);
      // Nettoyer quand même le localStorage en cas d'erreur
      this.clearAuth();
    }
  }

  /**
   * Récupère le token d'authentification
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  /**
   * Nettoie les données d'authentification
   */
  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }
}

export const authService = new AuthService();