// lib/apiHelper.ts

/**
 * Récupère le token d'authentification depuis les cookies
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; auth_token=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Crée les headers pour les requêtes authentifiées
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Wrapper fetch avec gestion automatique de l'authentification
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Détection globale de l'expiration du token
  if (response.status === 401 && typeof window !== 'undefined') {
    // Éviter les boucles si on est déjà en train de vérifier l'auth ou de se déconnecter
    if (!url.includes('/api/auth/me') && !url.includes('/api/auth/logout')) {
      console.warn("🔒 Session expirée détectée via 401. Notification globale envoyée.");
      window.dispatchEvent(new CustomEvent('xccm2:auth-expired'));
    }
  }

  return response;
}