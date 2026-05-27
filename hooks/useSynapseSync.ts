"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Awareness } from 'y-protocols/awareness';

export interface UserPresence {
    id: string;
    clientId: number;
    name: string;
    color: string;
    cursor?: { anchor: number; head: number };
    selection?: { from: number; to: number };
}

export interface SynapseSyncOptions {
    documentId: string;
    userId: string;
    userName: string;
    userColor?: string;
    serverUrl?: string;
    token?: string | null | (() => string | null);
    onConnect?: () => void;
    onDisconnect?: () => void;
    onSynced?: () => void;
    onAwarenessChange?: (users: UserPresence[]) => void;
    enabled?: boolean;
}

export interface SynapseSyncResult {
    yDoc: Y.Doc | null;
    provider: HocuspocusProvider | null;
    awareness: Awareness | null;
    isConnected: boolean;
    isSynced: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    connectedUsers: UserPresence[];
    localUser: UserPresence | null;
    localClientId: number | null;
    updateCursor: (anchor: number, head: number) => void;
    updateSelection: (from: number, to: number) => void;
    disconnect: () => void;
    reconnect: () => void;
    getYXmlFragment: (name?: string) => Y.XmlFragment | null;
    documentId: string;
}

const USER_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

function getRandomColor(): string {
    return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export function useSynapseSync(options: SynapseSyncOptions): SynapseSyncResult {
    const {
        documentId,
        userId,
        userName,
        userColor: providedColor,
        serverUrl: providedServerUrl,
        token,
        onConnect,
        onDisconnect,
        onSynced,
        onAwarenessChange,
        enabled = true,
    } = options;

    const serverUrl = providedServerUrl || process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234';
    const userColor = useMemo(() => providedColor || getRandomColor(), [providedColor]);

    // Keep token getter fresh without adding it to effect deps
    const tokenRef = useRef(token);
    tokenRef.current = token;

    // ── yDoc created synchronously via useMemo ────────────────────────────────
    // Keyed on documentId so it recreates when the user navigates to another granule.
    // This avoids the double-init pattern where the editor mounts once without
    // collaboration (yDoc null) then re-mounts with collaboration (yDoc ready).
    const yDoc = useMemo<Y.Doc | null>(() => {
        if (!enabled || !documentId || !userId) return null;
        return new Y.Doc();
    }, [documentId, enabled, userId]);

    // Destroy the yDoc when documentId changes (cleanup for the old one)
    useEffect(() => {
        return () => { yDoc?.destroy(); };
    }, [yDoc]);

    const providerRef = useRef<HocuspocusProvider | null>(null);

    // provider exposed as React state so parent re-renders when it becomes available
    const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSynced, setIsSynced] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [connectedUsers, setConnectedUsers] = useState<UserPresence[]>([]);
    const [localClientId, setLocalClientId] = useState<number | null>(null);

    // ── WebSocket connection ──────────────────────────────────────────────────
    useEffect(() => {
        if (!enabled || !documentId || !userId || !yDoc) return;

        const resolvedToken = typeof tokenRef.current === 'function'
            ? tokenRef.current()
            : tokenRef.current;

        if (!resolvedToken) {
            console.warn('[Synapse] No token available, skipping connection');
            return;
        }

        setConnectionStatus('connecting');

        const hp = new HocuspocusProvider({
            url: serverUrl,
            name: documentId,
            document: yDoc,
            token: resolvedToken,
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
                setIsSynced(state);
                if (state) {
                    console.log(`[Synapse] Synced: ${documentId}`);
                    onSynced?.();
                }
            },
            onStatus: ({ status }) => {
                setConnectionStatus(prev => {
                    if (status === 'connecting') return 'connecting';
                    if (status === 'connected') return 'connected';
                    if (status === 'disconnected') return 'disconnected';
                    return prev;
                });
            },
        });

        providerRef.current = hp;
        setProvider(hp);

        if (hp.awareness) {
            setLocalClientId(hp.awareness.clientID);
            hp.awareness.setLocalStateField('user', { id: userId, name: userName, color: userColor });
        }

        const awareness = hp.awareness;
        if (!awareness) return;

        const handleAwarenessChange = () => {
            const users: UserPresence[] = [];
            awareness.getStates().forEach((state, clientId) => {
                if (state.user) {
                    users.push({
                        id: state.user.id || 'anonymous',
                        clientId,
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

        return () => {
            console.log(`[Synapse] Cleaning up connection for ${documentId}`);
            awareness.off('change', handleAwarenessChange);
            hp.disconnect();
            providerRef.current = null;
            setProvider(null);
            setIsConnected(false);
            setIsSynced(false);
            setConnectionStatus('disconnected');
        };
    }, [documentId, userId, userName, userColor, serverUrl, enabled, yDoc]);

    const updateCursor = useCallback((anchor: number, head: number) => {
        providerRef.current?.awareness?.setLocalStateField('cursor', { anchor, head });
    }, []);

    const updateSelection = useCallback((from: number, to: number) => {
        providerRef.current?.awareness?.setLocalStateField('selection', { from, to });
    }, []);

    const disconnect = useCallback(() => { providerRef.current?.disconnect(); }, []);
    const reconnect  = useCallback(() => { providerRef.current?.connect(); }, []);

    const getYXmlFragment = useCallback((name: string = 'prosemirror') => {
        return yDoc?.getXmlFragment(name) || null;
    }, [yDoc]);

    return {
        yDoc,
        provider,
        awareness: provider?.awareness || null,
        isConnected,
        isSynced,
        connectionStatus,
        connectedUsers,
        localUser: { id: userId, name: userName, color: userColor, clientId: localClientId || 0 },
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
