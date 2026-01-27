import { useEffect, useRef, useCallback } from 'react';
import { Realtime } from 'ably';
import { getAuthHeaders } from '@/lib/apiHelper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

interface UseRealtimeSyncOptions {
    projectName: string;
    onStructureChange: (event: string, data: any) => void;
    onPresenceChange?: (count: number, members: any[]) => void; // ✅ Added
    enabled?: boolean;
}

/**
 * Hook pour écouter les changements temps réel d'un projet via Ably
 */
export function useRealtimeSync({ projectName, onStructureChange, onPresenceChange, enabled = true }: UseRealtimeSyncOptions) {
    const ablyRef = useRef<Realtime | null>(null);
    const isConnectedRef = useRef(false);
    const channelRef = useRef<any>(null);

    // Utiliser une ref pour le callback pour éviter les reconnexions tout en ayant la version la plus fraîche
    const callbackRef = useRef(onStructureChange);
    useEffect(() => {
        callbackRef.current = onStructureChange;
    }, [onStructureChange]);

    useEffect(() => {
        if (!enabled || !projectName) return;

        let mounted = true;

        const setupRealtime = async () => {
            try {
                console.log('🔌 Setting up Ably realtime connection...');

                // 1. Obtenir un token Ably depuis le backend
                const response = await fetch(`${API_BASE_URL}/api/realtime/auth`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    console.error('❌ Failed to get Ably token:', response.status);
                    return;
                }

                const { data } = await response.json();
                const tokenRequest = data.tokenRequest;

                console.log('✅ Ably token received');

                // 2. Initialiser le client Ably
                const ably = new Realtime({
                    authCallback: (tokenParams, callback) => {
                        callback(null, tokenRequest);
                    },
                });

                ablyRef.current = ably;

                // Écouter les événements de connexion
                ably.connection.on('connected', () => {
                    console.log('✅ Ably connected!');
                    isConnectedRef.current = true;
                });

                ably.connection.on('failed', (stateChange) => {
                    console.error('❌ Ably connection failed:', stateChange.reason);
                });

                ably.connection.on('disconnected', () => {
                    console.log('🔌 Ably disconnected');
                    isConnectedRef.current = false;
                });

                // 3. S'abonner au channel du projet
                const channel = ably.channels.get(`project:${projectName}`);
                channelRef.current = channel;

                // 4. Écouter tous les événements
                console.log(`✅ Subscribed to channel: project:${projectName}`);

                // 5. Gérer la présence (pour savoir si on est plusieurs)
                if (onPresenceChange) {
                    const presence = channel.presence;

                    const updatePresence = async () => {
                        const members = await presence.get();
                        onPresenceChange(members.length, members);
                    };

                    presence.subscribe('enter', updatePresence);
                    presence.subscribe('leave', updatePresence);
                    presence.enter(); // Signaler notre arrivée
                    updatePresence(); // Initiale
                }
            } catch (error) {
                console.error('❌ Error setting up realtime sync:', error);
            }
        };

        setupRealtime();

        // Cleanup
        return () => {
            mounted = false;
            console.log('🧹 Cleaning up Ably connection...');

            // Unsubscribe du channel d'abord
            if (channelRef.current) {
                try {
                    channelRef.current.unsubscribe();
                } catch (e) {
                    // Ignorer les erreurs de unsubscribe
                }
            }

            // Fermer la connexion seulement si elle est active
            if (ablyRef.current && isConnectedRef.current) {
                try {
                    ablyRef.current.close();
                    console.log('✅ Ably connection closed');
                } catch (error) {
                    // Ignorer les erreurs de fermeture
                }
            }
        };
    }, [projectName, enabled]);
}
