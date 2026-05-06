"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from 'react';
import { onboardingService } from '@/services/onboardingService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TourStep {
    /** CSS selector of the element to highlight. Empty string = center (no spotlight). */
    target: string;
    title: string;
    description: string;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
    icon?: ReactNode;
    accentColor?: string;
    /** Called before the step is shown (e.g. open a panel) */
    beforeShow?: () => void;
}

export interface TourConfig {
    flowId: string;
    title?: string;
    steps: TourStep[];
    onComplete?: () => void;
}

interface OnboardingContextValue {
    activeTour: TourConfig | null;
    currentStep: number;
    isRunning: boolean;
    /** Start a tour. Pass force=true to show even if already seen. */
    startTour: (config: TourConfig, force?: boolean) => void;
    /** Start a tour only if the user has not seen it yet (and is not already running a tour). */
    autoStartTour: (config: TourConfig) => void;
    nextStep: () => void;
    prevStep: () => void;
    endTour: () => void;
    /** Replay a tour from settings. */
    replayTour: (config: TourConfig) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const useOnboarding = (): OnboardingContextValue => {
    const ctx = useContext(OnboardingContext);
    if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
    return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
    const [activeTour, setActiveTour] = useState<TourConfig | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const isRunning = activeTour !== null;

    const startTour = useCallback((config: TourConfig, force = false) => {
        if (!force && onboardingService.hasSeenFlow(config.flowId)) return;
        setActiveTour(config);
        setCurrentStep(0);
    }, []);

    const autoStartTour = useCallback((config: TourConfig) => {
        if (onboardingService.hasSeenFlow(config.flowId)) return;
        if (isRunning) return; // Don't interrupt an ongoing tour
        // Slight delay so the page has time to render before we query elements
        const timer = setTimeout(() => {
            setActiveTour(config);
            setCurrentStep(0);
        }, 700);
        return () => clearTimeout(timer);
    }, [isRunning]);

    const replayTour = useCallback((config: TourConfig) => {
        onboardingService.resetFlow(config.flowId);
        setActiveTour(config);
        setCurrentStep(0);
    }, []);

    const nextStep = useCallback(() => {
        if (!activeTour) return;
        if (currentStep < activeTour.steps.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            endTour();
        }
    }, [activeTour, currentStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) setCurrentStep(s => s - 1);
    }, [currentStep]);

    const endTour = useCallback(() => {
        if (!activeTour) return;
        onboardingService.markFlowSeen(activeTour.flowId);
        activeTour.onComplete?.();
        setActiveTour(null);
        setCurrentStep(0);
    }, [activeTour]);

    // Keyboard navigation
    useEffect(() => {
        if (!isRunning) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') endTour();
            if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); nextStep(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isRunning, endTour, nextStep, prevStep]);

    return (
        <OnboardingContext.Provider
            value={{ activeTour, currentStep, isRunning, startTour, autoStartTour, replayTour, nextStep, prevStep, endTour }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};
