/**
 * Hook pour gérer la reconnexion automatique avec backoff exponentiel
 * Utilisé par useSynapseSync pour améliorer la résilience des WebSocket
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface AutoReconnectOptions {
    maxRetries?: number;          // Max tentatives (défaut: 10)
    initialDelay?: number;        // Délai initial en ms (défaut: 1000)
    maxDelay?: number;            // Délai max en ms (défaut: 30000)
    onReconnectAttempt?: (attempt: number) => void;
    onReconnectSuccess?: () => void;
    onReconnectFailed?: () => void;
}

interface AutoReconnectState {
    isReconnecting: boolean;
    reconnectAttempt: number;
    nextRetryIn: number; // Temps en ms avant la prochaine tentative
}

/**
 * Hook pour gérer la reconnexion automatique
 *
 * @example
 * ```typescript
 * const { startReconnect, stopReconnect, reconnectState } = useAutoReconnect({
 *   maxRetries: 5,
 *   onReconnectAttempt: (attempt) => console.log(`Tentative ${attempt}`),
 * });
 *
 * // Quand la connexion est perdue
 * startReconnect(() => provider.connect());
 * ```
 */
export function useAutoReconnect(options: AutoReconnectOptions = {}) {
    const {
        maxRetries = 10,
        initialDelay = 1000,
        maxDelay = 30000,
        onReconnectAttempt,
        onReconnectSuccess,
        onReconnectFailed,
    } = options;

    const [reconnectState, setReconnectState] = useState<AutoReconnectState>({
        isReconnecting: false,
        reconnectAttempt: 0,
        nextRetryIn: 0,
    });

    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const attemptCountRef = useRef(0);
    const reconnectFnRef = useRef<(() => void) | null>(null);

    /**
     * Calcul du délai avec backoff exponentiel et jitter
     */
    const calculateDelay = useCallback((attempt: number): number => {
        // Backoff exponentiel: delay * 2^attempt
        const exponentialDelay = initialDelay * Math.pow(2, attempt);

        // Jitter aléatoire pour éviter les "thundering herd"
        const jitter = Math.random() * 1000;

        // Limiter au délai maximum
        return Math.min(exponentialDelay + jitter, maxDelay);
    }, [initialDelay, maxDelay]);

    /**
     * Nettoie le timeout en cours
     */
    const clearReconnectTimeout = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    /**
     * Lance une tentative de reconnexion
     */
    const attemptReconnect = useCallback(() => {
        const currentAttempt = attemptCountRef.current;

        if (currentAttempt >= maxRetries) {
            console.warn('[AutoReconnect] Max tentatives atteintes');
            setReconnectState({
                isReconnecting: false,
                reconnectAttempt: currentAttempt,
                nextRetryIn: 0,
            });
            onReconnectFailed?.();
            return;
        }

        console.log(`[AutoReconnect] Tentative ${currentAttempt + 1}/${maxRetries}`);

        onReconnectAttempt?.(currentAttempt + 1);

        setReconnectState({
            isReconnecting: true,
            reconnectAttempt: currentAttempt + 1,
            nextRetryIn: 0,
        });

        // Exécuter la fonction de reconnexion
        if (reconnectFnRef.current) {
            try {
                reconnectFnRef.current();
            } catch (error) {
                console.error('[AutoReconnect] Erreur lors de la tentative:', error);
            }
        }

        attemptCountRef.current += 1;

        // Programmer la prochaine tentative si elle échoue
        const delay = calculateDelay(currentAttempt);
        setReconnectState(prev => ({
            ...prev,
            nextRetryIn: delay,
        }));

        reconnectTimeoutRef.current = setTimeout(() => {
            attemptReconnect();
        }, delay);

    }, [maxRetries, calculateDelay, onReconnectAttempt, onReconnectFailed]);

    /**
     * Démarre le processus de reconnexion automatique
     * @param reconnectFn - Fonction à appeler pour se reconnecter
     */
    const startReconnect = useCallback((reconnectFn: () => void) => {
        console.log('[AutoReconnect] Démarrage de la reconnexion automatique');

        // Stocker la fonction de reconnexion
        reconnectFnRef.current = reconnectFn;

        // Réinitialiser le compteur
        attemptCountRef.current = 0;

        // Nettoyer tout timeout existant
        clearReconnectTimeout();

        // Lancer immédiatement la première tentative
        attemptReconnect();
    }, [attemptReconnect, clearReconnectTimeout]);

    /**
     * Arrête la reconnexion automatique
     */
    const stopReconnect = useCallback(() => {
        console.log('[AutoReconnect] Arrêt de la reconnexion automatique');

        clearReconnectTimeout();
        attemptCountRef.current = 0;
        reconnectFnRef.current = null;

        setReconnectState({
            isReconnecting: false,
            reconnectAttempt: 0,
            nextRetryIn: 0,
        });
    }, [clearReconnectTimeout]);

    /**
     * Notifie que la reconnexion a réussi
     */
    const notifySuccess = useCallback(() => {
        console.log('[AutoReconnect] Reconnexion réussie');

        clearReconnectTimeout();
        attemptCountRef.current = 0;

        setReconnectState({
            isReconnecting: false,
            reconnectAttempt: 0,
            nextRetryIn: 0,
        });

        onReconnectSuccess?.();
    }, [clearReconnectTimeout, onReconnectSuccess]);

    /**
     * Nettoie au démontage du composant
     */
    useEffect(() => {
        return () => {
            clearReconnectTimeout();
        };
    }, [clearReconnectTimeout]);

    return {
        reconnectState,
        startReconnect,
        stopReconnect,
        notifySuccess,
    };
}

/**
 * Hook pour détecter les changements de statut réseau
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => {
            console.log('[NetworkStatus] Connexion rétablie');
            setIsOnline(true);
        };

        const handleOffline = () => {
            console.log('[NetworkStatus] Connexion perdue');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOffline);
            window.removeEventListener('offline', handleOnline);
        };
    }, []);

    return { isOnline };
}
