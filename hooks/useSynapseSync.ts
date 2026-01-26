"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Awareness } from 'y-protocols/awareness';

// Types pour la présence utilisateur
export interface UserPresence {
    id: string;
    clientId: number;
    name: string;
    color: string;
    cursor?: {
        anchor: number;
        head: number;
    };
    selection?: {
        from: number;
        to: number;
    };
}

export interface SynapseSyncOptions {
    documentId: string;
    userId: string;
    userName: string;
    userColor?: string;
    serverUrl?: string;
    token?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onSynced?: () => void;
    onAwarenessChange?: (users: UserPresence[]) => void;
}

export interface SynapseSyncResult {
    // Y.js document
    yDoc: Y.Doc | null;
    provider: HocuspocusProvider | null;
    awareness: Awareness | null;

    // Connection state
    isConnected: boolean;
    isSynced: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';

    // Présence
    connectedUsers: UserPresence[];
    localUser: UserPresence | null;
    localClientId: number | null;

    // Actions
    updateCursor: (anchor: number, head: number) => void;
    updateSelection: (from: number, to: number) => void;
    disconnect: () => void;
    reconnect: () => void;

    // Helpers pour TipTap
    getYXmlFragment: (name?: string) => Y.XmlFragment | null;

    // Explicit document ID for tracking
    documentId: string;
}

// Couleurs prédéfinies pour les utilisateurs
const USER_COLORS = [
    '#FF6B6B', // Rouge corail
    '#4ECDC4', // Turquoise
    '#45B7D1', // Bleu ciel
    '#96CEB4', // Vert menthe
    '#FFEAA7', // Jaune pastel
    '#DDA0DD', // Plum
    '#98D8C8', // Vert eau
    '#F7DC6F', // Jaune vif
    '#BB8FCE', // Violet pastel
    '#85C1E9', // Bleu pastel
];

function getRandomColor(): string {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

/**
 * useSynapseSync - Hook pour la synchronisation temps réel avec Y.js/Hocuspocus
 *
 * Ce hook gère:
 * - La connexion WebSocket vers le serveur Hocuspocus
 * - La synchronisation CRDT avec Y.js
 * - La gestion de la présence (curseurs, sélections)
 * - L'intégration avec TipTap via y-prosemirror
 *
 * @example
 * const { yDoc, provider, connectedUsers, isConnected } = useSynapseSync({
 *   documentId: 'notion-123',
 *   userId: 'user-abc',
 *   userName: 'Jean Dupont',
 *   onAwarenessChange: (users) => console.log('Users:', users),
 * });
 */
export function useSynapseSync(options: SynapseSyncOptions): SynapseSyncResult {
    const {
        documentId,
        userId,
        userName,
        userColor = getRandomColor(),
        serverUrl = process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234',
        token,
        onConnect,
        onDisconnect,
        onSynced,
        onAwarenessChange,
    } = options;

    // Use Refs to avoid re-render loops but keep state for connection status
    const yDocRef = useRef<Y.Doc | null>(null);

    // ✅ CRITICAL FIX: Create Y.Doc synchronously so it's available for Tiptap immediately
    // useEditor extension initialization happens once on mount. If yDoc is null then, Collab is disabled forever.
    const yDoc = useMemo(() => {
        return new Y.Doc();
    }, [documentId]); // Recreate doc only when ID changes

    // Update ref for legacy access compatibility if needed
    useEffect(() => {
        yDocRef.current = yDoc;
    }, [yDoc]);

    // Provider Ref to manage lifecycle without re-renders
    const providerRef = useRef<HocuspocusProvider | null>(null);

    // State
    const [isConnected, setIsConnected] = useState(false);
    const [isSynced, setIsSynced] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [connectedUsers, setConnectedUsers] = useState<UserPresence[]>([]);
    const [localClientId, setLocalClientId] = useState<number | null>(null);

    // Utilisateur local (sans clientId initial car il n'est pas encore connu)
    const localUserBase = {
        id: userId,
        name: userName,
        color: userColor,
    };

    // Initialisation de la connexion
    useEffect(() => {
        if (!documentId || !userId || !yDoc) return;

        console.log(`[Synapse] Initializing connection for ${documentId}`);

        const provider = new HocuspocusProvider({
            url: serverUrl,
            name: documentId,
            document: yDoc,
            token: token || undefined,
            onConnect: () => {
                console.log(`[Synapse] Connected to ${documentId}`);
                setIsConnected(true);
                setConnectionStatus('connected');
                onConnect?.();
            },
            onDisconnect: () => {
                console.log(`[Synapse] Disconnected from ${documentId}`);
                setIsConnected(false);
                setConnectionStatus('disconnected');
                onDisconnect?.();
            },
            onSynced: ({ state }) => {
                console.log(`[Synapse] Synced: ${state}`);
                setIsSynced(state);
                if (state) onSynced?.();
            },
            onStatus: ({ status }) => {
                // Use functional update to avoid dependency issues
                setConnectionStatus(prev => {
                    if (status === 'connecting') return 'connecting';
                    if (status === 'connected') return 'connected';
                    if (status === 'disconnected') return 'disconnected';
                    return prev;
                });
            },
        });

        providerRef.current = provider;

        // Stocker le clientId local
        if (provider.awareness) {
            setLocalClientId(provider.awareness.clientID);
        }

        // Configurer l'awareness (présence)
        const awareness = provider.awareness;
        if (!awareness) {
            console.error('[Synapse] Awareness not available');
            return;
        }

        // Définir l'état local de l'utilisateur
        if (awareness) {
            awareness.setLocalStateField('user', {
                id: userId,
                name: userName,
                color: userColor,
            });
        }

        // Écouter les changements d'awareness
        const handleAwarenessChange = () => {
            const states = awareness.getStates();
            const users: UserPresence[] = [];

            states.forEach((state, clientId) => {
                if (state.user) {
                    users.push({
                        id: state.user.id || 'anonymous',
                        clientId: clientId,
                        name: state.user.name || 'Anonyme',
                        color: state.user.color || getRandomColor(),
                        cursor: state.cursor,
                        selection: state.selection,
                    });
                }
            });

            setConnectedUsers(users);
            onAwarenessChange?.(users);
        };

        awareness.on('change', handleAwarenessChange);

        // État initial
        setConnectionStatus('connecting');

        // Cleanup
        return () => {
            console.log(`[Synapse] Cleaning up connection for ${documentId}`);
            awareness.off('change', handleAwarenessChange);
            provider.disconnect();
            providerRef.current = null;

            // Note: with useMemo, react might handle destroy but being explicit is safer for Yjs
            // when the docId changes. However since we create a new one, destroying the old one is good.
            yDoc.destroy();
        };
    }, [yDoc, documentId, userId, userName, userColor, serverUrl, token]);

    // Mettre à jour la position du curseur
    const updateCursor = useCallback((anchor: number, head: number) => {
        const awareness = providerRef.current?.awareness;
        if (awareness) {
            awareness.setLocalStateField('cursor', { anchor, head });
        }
    }, []);

    // Mettre à jour la sélection
    const updateSelection = useCallback((from: number, to: number) => {
        const awareness = providerRef.current?.awareness;
        if (awareness) {
            awareness.setLocalStateField('selection', { from, to });
        }
    }, []);

    // Déconnecter
    const disconnect = useCallback(() => {
        providerRef.current?.disconnect();
    }, []);

    // Reconnecter
    const reconnect = useCallback(() => {
        providerRef.current?.connect();
    }, []);

    // Obtenir le fragment XML pour TipTap
    const getYXmlFragment = useCallback((name: string = 'prosemirror') => {
        return yDoc.getXmlFragment(name) || null;
    }, [yDoc]);

    return {
        yDoc: yDoc,
        provider: providerRef.current,
        awareness: providerRef.current?.awareness || null,
        isConnected,
        isSynced,
        connectionStatus,
        connectedUsers,
        localUser: {
            id: localUserBase.id,
            name: localUserBase.name,
            color: localUserBase.color,
            clientId: localClientId || 0
        },
        localClientId,
        updateCursor,
        updateSelection,
        disconnect,
        reconnect,
        getYXmlFragment,
        documentId,
    };
}

export default useSynapseSync;
