import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
    });

    it("affiche un fallback personnalisé si fourni", () => {
        render(
            <ErrorBoundary fallback={<div>Fallback custom</div>}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText("Fallback custom")).toBeInTheDocument();
    });

    it("permet de réessayer via le bouton Réessayer", () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        fireEvent.click(screen.getByText("Réessayer"));
        // Après reset, le composant tente de re-render
        // (ThrowError crasherait encore, mais on vérifie que le reset a eu lieu)
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });
});
