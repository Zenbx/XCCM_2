'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    /** Optional custom fallback UI */
    fallback?: ReactNode;
    /** If true, only a small inline error chip is shown instead of full-screen */
    inline?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    }

    private reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (!this.state.hasError) return this.props.children;
        if (this.props.fallback) return this.props.fallback;

        if (this.props.inline) {
            return (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Une erreur est survenue dans ce composant.</span>
                    <button
                        onClick={this.reset}
                        className="ml-1 underline hover:no-underline font-medium"
                    >
                        Réessayer
                    </button>
                </div>
            );
        }

        return (
            <div className="min-h-[300px] flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Quelque chose s'est mal passé
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Une erreur inattendue s'est produite. Vous pouvez recharger la page ou réessayer.
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre className="text-left text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 overflow-auto max-h-40 text-red-600">
                            {this.state.error.message}
                        </pre>
                    )}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={this.reset}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#99334C] text-white font-semibold hover:bg-[#7a283d] transition-all"
                        >
                            <RefreshCw className="w-4 h-4" aria-hidden="true" />
                            Réessayer
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            Recharger la page
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
