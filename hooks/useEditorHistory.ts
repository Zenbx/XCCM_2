import { useState, useCallback, useRef } from 'react';

/**
 * Type d'action d'historique
 */
export type HistoryActionType = 'create' | 'delete' | 'rename' | 'move' | 'reorder' | 'update_content';

/**
 * Interface pour une action d'historique
 */
export interface HistoryAction {
    id: string;
    timestamp: number;
    type: HistoryActionType;
    description: string;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
}

/**
 * Hook useEditorHistory - Gère la pile d'annulation/rétablissement pour les actions de l'éditeur
 */
export function useEditorHistory(maxSize = 50) {
    const [history, setHistory] = useState<HistoryAction[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    // Pour éviter les boucles d'effets
    const isUndoingRedoing = useRef(false);

    /**
     * Ajoute une nouvelle action à l'historique
     */
    const addAction = useCallback((action: Omit<HistoryAction, 'timestamp' | 'id'>) => {
        if (isUndoingRedoing.current) return;

        const fullAction: HistoryAction = {
            ...action,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
        };

        setHistory(prev => {
            // Supprimer les actions futures si on était au milieu de la pile
            const newHistory = prev.slice(0, currentIndex + 1);
            newHistory.push(fullAction);

            // Limiter la taille
            if (newHistory.length > maxSize) {
                newHistory.shift();
            }

            return [...newHistory];
        });

        setCurrentIndex(prev => {
            const next = prev + 1;
            return next >= maxSize ? maxSize - 1 : next;
        });

        console.log(`[History] Action added: ${action.description}`);
    }, [currentIndex, maxSize]);

    /**
     * Annule la dernière action
     */
    const undo = useCallback(async () => {
        if (currentIndex < 0 || isUndoingRedoing.current) return;

        const action = history[currentIndex];
        if (!action) return;

        try {
            isUndoingRedoing.current = true;
            console.log(`[History] Undoing: ${action.description}`);
            await action.undo();
            setCurrentIndex(prev => prev - 1);
        } catch (error) {
            console.error('[History] Undo failed:', error);
            throw error;
        } finally {
            isUndoingRedoing.current = false;
        }
    }, [currentIndex, history]);

    /**
     * Rétablit l'action annulée
     */
    const redo = useCallback(async () => {
        if (currentIndex >= history.length - 1 || isUndoingRedoing.current) return;

        const nextIndex = currentIndex + 1;
        const action = history[nextIndex];
        if (!action) return;

        try {
            isUndoingRedoing.current = true;
            console.log(`[History] Redoing: ${action.description}`);
            await action.redo();
            setCurrentIndex(nextIndex);
        } catch (error) {
            console.error('[History] Redo failed:', error);
            throw error;
        } finally {
            isUndoingRedoing.current = false;
        }
    }, [currentIndex, history]);

    /**
     * Vide l'historique
     */
    const clearHistory = useCallback(() => {
        setHistory([]);
        setCurrentIndex(-1);
    }, []);

    return {
        addAction,
        undo,
        redo,
        canUndo: currentIndex >= 0,
        canRedo: currentIndex < history.length - 1,
        history,
        currentIndex,
        clearHistory,
        currentAction: currentIndex >= 0 ? history[currentIndex] : null
    };
}

export default useEditorHistory;
