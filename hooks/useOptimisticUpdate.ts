import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface OptimisticConfig<T> {
    onOptimisticUpdate: (newData: T) => void;
    onRollback: (originalData: T) => void;
    apiCall: (data: any) => Promise<any>;
    successMessage?: string;
    errorMessage?: string;
}

/**
 * Hook pour gérer les mises à jour optimistes
 * Permet de mettre à jour l'UI instantanément et de rollback en cas d'erreur API
 */
export function useOptimisticUpdate<T>() {
    const [isPending, setIsPending] = useState(false);

    const execute = useCallback(async (
        currentState: T,
        optimisticState: T,
        config: OptimisticConfig<T>
    ) => {
        // 1. Appliquer l'update optimiste
        config.onOptimisticUpdate(optimisticState);
        setIsPending(true);

        try {
            // 2. Appeler l'API
            await config.apiCall(optimisticState);

            if (config.successMessage) {
                // Optionnel : Toast discret ou rien du tout pour la fluidité
                // toast.success(config.successMessage);
            }
        } catch (error) {
            console.error('Optimistic update failed:', error);

            // 3. Rollback en cas d'erreur
            config.onRollback(currentState);
            toast.error(config.errorMessage || "Erreur de synchronisation, retour à l'état précédent.");
        } finally {
            setIsPending(false);
        }
    }, []);

    return { execute, isPending };
}
