"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
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

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div role="alert" style={{ padding: "2rem", textAlign: "center" }}>
                    <h2>Une erreur est survenue</h2>
                    <p style={{ color: "#666" }}>Rechargez la page ou contactez le support.</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })}>
                        Réessayer
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
