'use client'

import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';
import CommandPalette from '@/components/CommandPalette/CommandPalette';
import SpotlightTour from '@/components/Onboarding/SpotlightTour';
import { ToastAnnouncer } from '@/components/UI/ToastAnnouncer';
import { useGlobalKeyboardShortcuts } from '@/hooks/useGlobalKeyboardShortcuts';
import { ErrorBoundary } from '@/components/UI/ErrorBoundary';

const Providers = ({ children }: { children: ReactNode }) => {
    useGlobalKeyboardShortcuts();

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <LanguageProvider>
                        <ErrorBoundary>
                            <OnboardingProvider>
                                {children}
                                <SpotlightTour />
                                <Toaster
                                    position="top-right"
                                    containerStyle={{ zIndex: 99999, top: 80 }}
                                    toastOptions={{
                                        duration: 4000,
                                        style: {
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(12px)',
                                            WebkitBackdropFilter: 'blur(12px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                            color: '#1f2937',
                                            borderRadius: '12px',
                                            padding: '12px 16px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        },
                                        success: {
                                            iconTheme: { primary: '#99334C', secondary: '#fff' },
                                            style: { border: '1px solid rgba(153, 51, 76, 0.2)' },
                                        },
                                        error: {
                                            iconTheme: { primary: '#DC3545', secondary: '#fff' },
                                        },
                                        className: 'dark:!bg-gray-900/80 dark:!text-white dark:!border-gray-700/50 dark:!shadow-none',
                                    }}
                                />
                                <CommandPalette />
                                <ToastAnnouncer />
                            </OnboardingProvider>
                        </ErrorBoundary>
                    </LanguageProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default Providers;
