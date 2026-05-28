"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPresence } from '@/hooks/useSynapseSync';
import { ProjectMember } from '@/hooks/useRealtimeSync';
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
    localClientId: number | null;
    maxVisible?: number;
    onUserClick?: (user: UserPresence) => void;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
    users,
    localClientId,
    maxVisible = 5,
    onUserClick,
}) => {
    // Filtrer pour obtenir les autres sessions (même si c'est le même utilisateur mais onglet différent)
    const otherUsers = users.filter(user => user.clientId !== localClientId);
    const visibleUsers = otherUsers.slice(0, maxVisible);
    const remainingCount = otherUsers.length - maxVisible;

    if (otherUsers.length === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span>Seul sur ce document</span>
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
                                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform hover:scale-110 hover:z-10 ${onUserClick && user.cursor ? 'cursor-pointer' : 'cursor-default'}`}
                                style={{ backgroundColor: user.color }}
                                title={user.name}
                                onClick={() => onUserClick?.(user)}
                                role={onUserClick && user.cursor ? 'button' : undefined}
                                aria-label={onUserClick && user.cursor ? `Localiser ${user.name}` : undefined}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Tooltip au survol */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {user.name}
                                {onUserClick && user.cursor && (
                                    <span className="block text-gray-400">Cliquer pour localiser</span>
                                )}
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

/**
 * ProjectPresenceIndicator – Shows ALL users online on the project (Ably presence).
 * Clicking an avatar navigates to their granule (if different) or scrolls to their
 * cursor (if on the same granule).
 */
interface ProjectPresenceIndicatorProps {
    projectMembers: ProjectMember[];
    connectedUsers: UserPresence[];  // same-granule users from Hocuspocus awareness
    currentUserId: string;
    currentGranuleId: string;
    maxVisible?: number;
    onMemberClick?: (member: ProjectMember) => void;
}

export const ProjectPresenceIndicator: React.FC<ProjectPresenceIndicatorProps> = ({
    projectMembers,
    connectedUsers,
    currentUserId,
    currentGranuleId,
    maxVisible = 5,
    onMemberClick,
}) => {
    // Exclude self
    const others = projectMembers.filter(m => m.userId !== currentUserId);
    const visible = others.slice(0, maxVisible);
    const extra = others.length - maxVisible;

    if (others.length === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <span>Seul sur le projet</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

            <div className="flex -space-x-2">
                <AnimatePresence mode="popLayout">
                    {visible.map((member, index) => {
                        const onSameGranule = member.granuleId === currentGranuleId && !!currentGranuleId;
                        const hocuUser = connectedUsers.find(u => u.id === member.userId);
                        const hasCursor = onSameGranule && !!hocuUser?.cursor;
                        const isClickable = !!(onMemberClick && member.granuleId);

                        const tooltipAction = onSameGranule
                            ? hasCursor ? 'Cliquer pour localiser' : 'Même granule'
                            : member.granuleName
                                ? `Aller vers : ${member.granuleName}`
                                : 'Cliquer pour naviguer';

                        return (
                            <motion.div
                                key={`${member.userId}-${member.clientId}`}
                                initial={{ opacity: 0, scale: 0.5, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5, x: -10 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group"
                            >
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform hover:scale-110 hover:z-10 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                                    style={{
                                        backgroundColor: member.userColor,
                                        borderColor: onSameGranule ? '#22c55e' : 'white',
                                    }}
                                    title={member.userName}
                                    onClick={() => isClickable && onMemberClick?.(member)}
                                    role={isClickable ? 'button' : undefined}
                                    aria-label={isClickable ? tooltipAction : undefined}
                                >
                                    {member.userName.charAt(0).toUpperCase()}
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 min-w-max">
                                    <p className="font-semibold">{member.userName}</p>
                                    {member.granuleName && (
                                        <p className="text-gray-400 text-[10px]">
                                            {onSameGranule ? '📍 Ce granule' : `📄 ${member.granuleName}`}
                                        </p>
                                    )}
                                    {isClickable && (
                                        <p className="text-[#ff9daf] text-[10px] mt-0.5">{tooltipAction}</p>
                                    )}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {extra > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold"
                    >
                        +{extra}
                    </motion.div>
                )}
            </div>

            <span className="text-sm text-gray-500 ml-1">
                {others.length === 1 ? '1 en ligne' : `${others.length} en ligne`}
            </span>
        </div>
    );
};

export default CollaborativeCursors;
