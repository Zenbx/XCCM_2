import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";

// Mocks avant les imports
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => "/",
}));

vi.mock("@/services/authService", () => ({
    authService: {
        login: vi.fn(),
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        getStoredToken: vi.fn().mockReturnValue(null),
    },
}));

vi.mock("@/lib/cookies", () => ({
    setCookie: vi.fn(),
    getCookie: vi.fn().mockReturnValue(null),
    deleteCookie: vi.fn(),
}));

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";

const mockUser = {
    user_id: "u1", email: "test@xccm.io", firstname: "Alice",
    lastname: "Martin", role: "user", org: null, occupation: null,
    profile_picture: null, created_at: new Date().toISOString(),
};

function TestConsumer() {
    const { user, isAuthenticated, isLoading, isAdmin, login, logout } = useAuth();
    return (
        <div>
            <span data-testid="loading">{String(isLoading)}</span>
            <span data-testid="auth">{String(isAuthenticated)}</span>
            <span data-testid="email">{user?.email ?? "none"}</span>
            <span data-testid="admin">{String(isAdmin)}</span>
            <button onClick={() => login("test@xccm.io", "Password123!")}>Login</button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
}

function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
    beforeEach(() => {
        vi.mocked(authService.getCurrentUser).mockResolvedValue(null as any);
    });

    it("démarre en état non authentifié après chargement", async () => {
        render(<TestConsumer />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("false");
        });
        expect(screen.getByTestId("auth").textContent).toBe("false");
        expect(screen.getByTestId("email").textContent).toBe("none");
    });

    it("met à jour l'état après un login réussi", async () => {
        vi.mocked(authService.login).mockResolvedValue(mockUser as any);
        render(<TestConsumer />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("false");
        });

        await act(async () => {
            screen.getByText("Login").click();
        });

        await waitFor(() => {
            expect(screen.getByTestId("auth").textContent).toBe("true");
            expect(screen.getByTestId("email").textContent).toBe("test@xccm.io");
        });
    });

    it("vide l'état après logout", async () => {
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);
        vi.mocked(authService.logout).mockResolvedValue(undefined);
        render(<TestConsumer />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByTestId("auth").textContent).toBe("true");
        });

        await act(async () => {
            screen.getByText("Logout").click();
        });

        await waitFor(() => {
            expect(screen.getByTestId("auth").textContent).toBe("false");
            expect(screen.getByTestId("email").textContent).toBe("none");
        });
    });

    it("isAdmin est false pour un utilisateur avec role='user'", async () => {
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);
        render(<TestConsumer />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByTestId("auth").textContent).toBe("true");
        });
        expect(screen.getByTestId("admin").textContent).toBe("false");
    });

    it("isAdmin est true uniquement quand role='admin'", async () => {
        const adminUser = { ...mockUser, role: "admin" };
        vi.mocked(authService.getCurrentUser).mockResolvedValue(adminUser as any);
        render(<TestConsumer />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByTestId("auth").textContent).toBe("true");
        });
        expect(screen.getByTestId("admin").textContent).toBe("true");
    });

    it("isAdmin est false quand role est undefined (pas de faille sécurité)", async () => {
        const noRoleUser = { ...mockUser, role: undefined };
        vi.mocked(authService.getCurrentUser).mockResolvedValue(noRoleUser as any);
        render(<TestConsumer />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByTestId("auth").textContent).toBe("true");
        });
        expect(screen.getByTestId("admin").textContent).toBe("false");
    });

    it("isAdmin est false quand role est null", async () => {
        const nullRoleUser = { ...mockUser, role: null };
        vi.mocked(authService.getCurrentUser).mockResolvedValue(nullRoleUser as any);
        render(<TestConsumer />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByTestId("auth").textContent).toBe("true");
        });
        expect(screen.getByTestId("admin").textContent).toBe("false");
    });
});
