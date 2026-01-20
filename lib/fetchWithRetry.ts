/**
 * Utilitaire pour faire des requêtes fetch avec retry automatique et timeout
 * Améliore la stabilité des connexions API
 */

interface FetchWithRetryOptions extends RequestInit {
    timeout?: number;        // Timeout en ms (défaut: 30000)
    retries?: number;        // Nombre de tentatives (défaut: 3)
    retryDelay?: number;     // Délai entre retries en ms (défaut: 1000)
    onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Effectue une requête fetch avec timeout
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number }
): Promise<Response> {
    const { timeout = 30000, ...fetchOptions } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error(`Timeout de ${timeout}ms dépassé pour ${url}`);
        }
        throw error;
    }
}

/**
 * Détermine si une erreur est "retriable" (temporaire)
 */
function isRetriableError(error: any): boolean {
    // Erreurs réseau temporaires
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
        return true;
    }

    // Timeout
    if (error.message?.includes('Timeout')) {
        return true;
    }

    // Status HTTP 5xx (erreurs serveur)
    if (error.status >= 500 && error.status < 600) {
        return true;
    }

    // Status 429 (trop de requêtes)
    if (error.status === 429) {
        return true;
    }

    // Status 408 (request timeout)
    if (error.status === 408) {
        return true;
    }

    return false;
}

/**
 * Calcul du délai de retry avec backoff exponentiel
 */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
    // Backoff exponentiel avec jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // Ajoute 0-1000ms aléatoires
    return Math.min(exponentialDelay + jitter, 10000); // Max 10 secondes
}

/**
 * Requête fetch avec retry automatique et timeout
 *
 * @example
 * ```typescript
 * const response = await fetchWithRetry('/api/projects', {
 *   method: 'GET',
 *   headers: { Authorization: 'Bearer token' },
 *   timeout: 5000,
 *   retries: 3,
 *   onRetry: (attempt, error) => {
 *     console.log(`Tentative ${attempt} échouée:`, error.message);
 *   }
 * });
 * ```
 */
export async function fetchWithRetry(
    url: string,
    options: FetchWithRetryOptions = {}
): Promise<Response> {
    const {
        timeout = 30000,
        retries = 3,
        retryDelay = 1000,
        onRetry,
        ...fetchOptions
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetchWithTimeout(url, {
                ...fetchOptions,
                timeout,
            });

            // Si erreur HTTP 5xx, on peut retry
            if (!response.ok && isRetriableError({ status: response.status })) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Succès
            return response;

        } catch (error: any) {
            lastError = error;

            // Si c'est la dernière tentative, on throw
            if (attempt === retries) {
                throw error;
            }

            // Si l'erreur n'est pas retriable, on throw immédiatement
            if (!isRetriableError(error)) {
                throw error;
            }

            // Callback de retry
            if (onRetry) {
                onRetry(attempt + 1, error);
            }

            // Attendre avant de réessayer
            const delay = calculateRetryDelay(attempt, retryDelay);
            console.warn(
                `[fetchWithRetry] Tentative ${attempt + 1}/${retries} échouée pour ${url}. ` +
                `Nouvelle tentative dans ${Math.round(delay)}ms...`
            );
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

/**
 * Wrapper pour requêtes JSON avec retry
 */
export async function fetchJSONWithRetry<T = any>(
    url: string,
    options: FetchWithRetryOptions = {}
): Promise<T> {
    const response = await fetchWithRetry(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
}

/**
 * Hook React pour afficher le statut de retry
 */
import { useState, useCallback } from 'react';

interface UseRetryState {
    isRetrying: boolean;
    retryAttempt: number;
    lastError: string | null;
}

export function useRetryState() {
    const [retryState, setRetryState] = useState<UseRetryState>({
        isRetrying: false,
        retryAttempt: 0,
        lastError: null,
    });

    const onRetry = useCallback((attempt: number, error: Error) => {
        setRetryState({
            isRetrying: true,
            retryAttempt: attempt,
            lastError: error.message,
        });
    }, []);

    const resetRetry = useCallback(() => {
        setRetryState({
            isRetrying: false,
            retryAttempt: 0,
            lastError: null,
        });
    }, []);

    return { retryState, onRetry, resetRetry };
}
