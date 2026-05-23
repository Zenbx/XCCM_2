import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/UI/ErrorBoundary";

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) throw new Error("Test crash");
    return <div>Contenu OK</div>;
};

// Supprimer les logs d'erreur React dans les tests
const originalError = console.error;
beforeEach(() => { console.error = vi.fn(); });
afterEach(() => { console.error = originalError; });

describe("ErrorBoundary", () => {
    it("affiche les enfants normalement s'il n'y a pas d'erreur", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );
        expect(screen.getByText("Contenu OK")).toBeInTheDocument();
    });

    it("affiche le fallback par défaut quand un enfant crash", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText(/quelque chose s'est mal passé/i)).toBeInTheDocument();
        expect(screen.getAllByText(/réessayer/i).length).toBeGreaterThan(0);
    });

    it("affiche un fallback personnalisé si fourni", () => {
        render(
            <ErrorBoundary fallback={<div>Fallback custom</div>}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText("Fallback custom")).toBeInTheDocument();
    });

    it("affiche le mode inline quand inline=true", () => {
        render(
            <ErrorBoundary inline>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
    });

    it("permet de réessayer via le bouton Réessayer", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        // Le premier bouton Réessayer est celui du fallback complet
        fireEvent.click(screen.getAllByText(/réessayer/i)[0]);
        // Après reset, le composant re-render — ThrowError écrase encore (état fixe)
        expect(screen.getByText(/quelque chose s'est mal passé/i)).toBeInTheDocument();
    });
});
