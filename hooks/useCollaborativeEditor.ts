"use client";

import { useEffect, useMemo, useCallback, useState } from 'react';
import { Editor } from '@tiptap/react';
import { useSynapseSync, SynapseSyncOptions, UserPresence } from './useSynapseSync';

// Types pour l'intégration TipTap
interface CollaborativeEditorOptions extends Omit<SynapseSyncOptions, 'onAwarenessChange'> {
    editor: Editor | null;
    onUsersChange?: (users: UserPresence[]) => void;
}

interface CollaborativeEditorResult {
    // Sync state
    isConnected: boolean;
    isSynced: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';

    // Users
    connectedUsers: UserPresence[];
    localUser: UserPresence | null;

    // Actions
    disconnect: () => void;
    reconnect: () => void;
}

/**
 * useCollaborativeEditor - Intègre Y.js avec TipTap pour l'édition collaborative
 *
 * Ce hook configure automatiquement:
 * - La synchronisation du contenu via Y.js
 * - Les curseurs collaboratifs
 * - La gestion de la présence
 *
 * @example
 * const editor = useEditor({
 *   extensions: [...],
 * });
 *
 * const { connectedUsers, isConnected } = useCollaborativeEditor({
 *   editor,
 *   documentId: 'notion-123',
 *   userId: user.id,
 *   userName: user.name,
 * });
 */
export function useCollaborativeEditor(options: CollaborativeEditorOptions): CollaborativeEditorResult {
    const { editor, onUsersChange, ...syncOptions } = options;
    const [users, setUsers] = useState<UserPresence[]>([]);

    // Initialiser la synchronisation Y.js
    const {
        provider,
        awareness,
        isConnected,
        isSynced,
        connectionStatus,
        connectedUsers,
        localUser,
        updateCursor,
        updateSelection,
        disconnect,
        reconnect,
        getYXmlFragment,
    } = useSynapseSync({
        ...syncOptions,
        onAwarenessChange: (updatedUsers) => {
            setUsers(updatedUsers);
            onUsersChange?.(updatedUsers);
        },
    });

    // Synchroniser les curseurs avec l'éditeur
    useEffect(() => {
        if (!editor || !awareness) return;

        // Écouter les changements de sélection dans l'éditeur
        const handleSelectionUpdate = () => {
            const { from, to, anchor, head } = editor.state.selection;

            // Mettre à jour la position du curseur
            updateCursor(anchor, head);

            // Mettre à jour la sélection si différente du curseur
            if (from !== to) {
                updateSelection(from, to);
            }
        };

        editor.on('selectionUpdate', handleSelectionUpdate);

        return () => {
            editor.off('selectionUpdate', handleSelectionUpdate);
        };
    }, [editor, awareness, updateCursor, updateSelection]);

    return {
        isConnected,
        isSynced,
        connectionStatus,
        connectedUsers: users,
        localUser,
        disconnect,
        reconnect,
    };
}

/**
 * Configuration TipTap pour la collaboration
 *
 * Retourne les extensions et options nécessaires pour intégrer
 * la collaboration Y.js dans un éditeur TipTap.
 *
 * @example
 * const { extensions } = getCollaborationConfig({
 *   documentId: 'notion-123',
 *   user: { id: '1', name: 'Jean', color: '#FF6B6B' },
 * });
 *
 * const editor = useEditor({
 *   extensions: [...baseExtensions, ...extensions],
 * });
 */
export interface CollaborationUser {
    id: string;
    name: string;
    color: string;
}

export interface CollaborationConfig {
    documentId: string;
    user: CollaborationUser;
    serverUrl?: string;
}

// Note: Cette fonction serait utilisée avec les extensions TipTap Collaboration
// import { Collaboration } from '@tiptap/extension-collaboration'
// import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
//
// Pour l'instant, on fournit juste la structure de configuration
export function getCollaborationExtensionsConfig(config: CollaborationConfig) {
    return {
        documentName: config.documentId,
        user: config.user,
        serverUrl: config.serverUrl || process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234',
    };
}

export default useCollaborativeEditor;
