'use client';

import { useState, useEffect, useCallback } from 'react';
import { onboardingService } from '@/services/onboardingService';

/**
 * Returns whether a feature is "new" (not yet discovered by the user),
 * plus a dismiss callback that marks it as discovered.
 */
export function useDiscovery(featureId: string) {
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        setIsNew(!onboardingService.hasDiscovered(featureId));
    }, [featureId]);

    const dismiss = useCallback(() => {
        onboardingService.markDiscovered(featureId);
        setIsNew(false);
    }, [featureId]);

    return { isNew, dismiss };
}
