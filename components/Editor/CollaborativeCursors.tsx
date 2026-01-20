"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPresence } from '@/hooks/useSynapseSync';
import { Editor } from '@tiptap/react';

interface CollaborativeCursorsProps {
    users: UserPresence[];
    currentUserId: string;
    containerRef: React.RefObject<HTMLElement>;
    editor?: Editor | null; // Ajout de l'éditeur pour calculer les positions
}

/**
 * CollaborativeCursors - Affiche les curseurs des autres utilisateurs
 *
 * Affiche les curseurs colorés et les noms des utilisateurs connectés
 * qui éditent le même document.
 */
export const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({
    users,
    currentUserId,
    containerRef,
    editor,
}) => {
    // Filtrer l'utilisateur courant
    const otherUsers = users.filter(user => user.id !== currentUserId);

    if (otherUsers.length === 0) return null;

    return (
        <AnimatePresence>
            {otherUsers.map(user => (
                user.cursor && (
                    <CursorOverlay
                        key={user.id}
                        user={user}
                        containerRef={containerRef}
                        editor={editor}
                    />
                )
            ))}
        </AnimatePresence>
    );
};

interface CursorOverlayProps {
    user: UserPresence;
    containerRef: React.RefObject<HTMLElement>;
    editor?: Editor | null;
}

const CursorOverlay: React.FC<CursorOverlayProps> = ({ user, containerRef, editor }) => {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    // Calcul de la position du curseur à partir de ProseMirror
    const updateCursorPosition = useCallback(() => {
        if (!editor || !user.cursor || !containerRef.current) {
            return;
        }

        try {
            const { anchor } = user.cursor;

            // Vérifier que la position est valide
            if (anchor < 0 || anchor > editor.state.doc.content.size) {
                return;
            }

            // Obtenir les coordonnées du curseur dans le document
            const resolvedPos = editor.state.doc.resolve(anchor);
            const coords = editor.view.coordsAtPos(anchor);

            if (!coords) return;

            // Obtenir les coordonnées du conteneur
            const containerRect = containerRef.current.getBoundingClientRect();

            // Calculer la position relative au conteneur
            const relativeTop = coords.top - containerRect.top + containerRef.current.scrollTop;
            const relativeLeft = coords.left - containerRect.left + containerRef.current.scrollLeft;

            setPosition({
                top: relativeTop,
                left: relativeLeft,
            });
        } catch (error) {
            console.warn('[CollaborativeCursors] Erreur calcul position:', error);
            // Fallback position si erreur
            setPosition({ top: 100, left: 200 });
        }
    }, [editor, user.cursor, containerRef]);

    // Mettre à jour la position quand le curseur change
    useEffect(() => {
        updateCursorPosition();
    }, [updateCursorPosition, user.cursor]);

    // Mettre à jour la position au scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => updateCursorPosition();
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [containerRef, updateCursorPosition]);

    // Si pas de position calculée, ne rien afficher
    if (!position) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-50"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {/* Curseur */}
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={user.color}
                className="drop-shadow-sm"
            >
                <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86h8.12c.45 0 .67-.54.35-.85L5.85 2.36c-.32-.32-.85-.1-.85.35z" />
            </svg>

            {/* Nom de l'utilisateur */}
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-4 -mt-1 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap shadow-sm"
                style={{ backgroundColor: user.color }}
            >
                {user.name}
            </motion.div>
        </motion.div>
    );
};

/**
 * PresenceIndicator - Affiche les utilisateurs connectés
 */
interface PresenceIndicatorProps {
    users: UserPresence[];
    currentUserId: string;
    maxVisible?: number;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
    users,
    currentUserId,
    maxVisible = 5,
}) => {
    const otherUsers = users.filter(user => user.id !== currentUserId);
    const visibleUsers = otherUsers.slice(0, maxVisible);
    const remainingCount = otherUsers.length - maxVisible;

    if (otherUsers.length === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span>Vous êtes seul</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Indicateur de connexion */}
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

            {/* Avatars des utilisateurs */}
            <div className="flex -space-x-2">
                <AnimatePresence mode="popLayout">
                    {visibleUsers.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.5, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.5, x: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group"
                        >
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer transition-transform hover:scale-110 hover:z-10"
                                style={{ backgroundColor: user.color }}
                                title={user.name}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Tooltip au survol */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {user.name}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Compteur pour les utilisateurs supplémentaires */}
                {remainingCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold"
                    >
                        +{remainingCount}
                    </motion.div>
                )}
            </div>

            {/* Texte descriptif */}
            <span className="text-sm text-gray-500 ml-1">
                {otherUsers.length === 1
                    ? '1 collaborateur'
                    : `${otherUsers.length} collaborateurs`}
            </span>
        </div>
    );
};

/**
 * SelectionHighlight - Affiche les sélections des autres utilisateurs
 */
interface SelectionHighlightProps {
    user: UserPresence;
    text: string;
}

export const SelectionHighlight: React.FC<SelectionHighlightProps> = ({
    user,
}) => {
    if (!user.selection) return null;

    return (
        <span
            className="relative"
            style={{
                backgroundColor: `${user.color}30`,
                borderBottom: `2px solid ${user.color}`,
            }}
        >
            {/* Le contenu sélectionné serait rendu ici */}
        </span>
    );
};

/**
 * ConnectionStatus - Affiche l'état de la connexion
 */
interface ConnectionStatusProps {
    status: 'connecting' | 'connected' | 'disconnected' | 'error';
    onReconnect?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    status,
    onReconnect,
}) => {
    const statusConfig = {
        connecting: {
            color: 'bg-yellow-500',
            text: 'Connexion...',
            animate: true,
        },
        connected: {
            color: 'bg-green-500',
            text: 'Connecté',
            animate: false,
        },
        disconnected: {
            color: 'bg-gray-400',
            text: 'Déconnecté',
            animate: false,
        },
        error: {
            color: 'bg-red-500',
            text: 'Erreur',
            animate: false,
        },
    };

    const config = statusConfig[status];

    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-2 h-2 rounded-full ${config.color} ${config.animate ? 'animate-pulse' : ''}`}
            />
            <span className="text-xs text-gray-500">{config.text}</span>

            {(status === 'disconnected' || status === 'error') && onReconnect && (
                <button
                    onClick={onReconnect}
                    className="text-xs text-[#99334C] hover:underline ml-1"
                >
                    Reconnecter
                </button>
            )}
        </div>
    );
};

export default CollaborativeCursors;
