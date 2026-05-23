import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@/services/authService";

// Mock cookie helpers
vi.mock("@/lib/cookies", () => ({
    setCookie: vi.fn(),
    getCookie: vi.fn().mockReturnValue(null),
    deleteCookie: vi.fn(),
}));

import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockUser = {
    user_id: "u1",
    email: "test@xccm.io",
    firstname: "Alice",
    lastname: "Martin",
    role: "user",
};

const mockLoginResponse = {
    success: true,
    message: "OK",
    data: { token: "tok-abc", user: mockUser },
};

beforeEach(() => {
    mockFetch.mockReset();
    vi.mocked(getCookie).mockReturnValue(null);
    localStorage.clear();
});

describe("authService.login", () => {
    it("retourne l'utilisateur et stocke le token en cas de succès", async () => {
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify(mockLoginResponse), { status: 200 })
        );

        const user = await authService.login("test@xccm.io", "Password123!");

        expect(user.email).toBe("test@xccm.io");
        expect(setCookie).toHaveBeenCalledWith("auth_token", "tok-abc");
        expect(localStorage.getItem("xccm2_auth_token")).toBe("tok-abc");
        expect(localStorage.getItem("xccm2_user")).toContain("test@xccm.io");
    });

    it("throw si la réponse n'est pas ok", async () => {
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ success: false, message: "Identifiants invalides" }), { status: 401 })
        );

        await expect(authService.login("bad@x.io", "wrong")).rejects.toThrow("Identifiants invalides");
    });

    it("throw si success=false même avec status 200", async () => {
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ success: false, message: "Compte désactivé" }), { status: 200 })
        );

        await expect(authService.login("x@x.io", "pass")).rejects.toThrow("Compte désactivé");
    });
});

describe("authService.getCurrentUser", () => {
    it("retourne null si pas de token", async () => {
        vi.mocked(getCookie).mockReturnValue(null);
        const user = await authService.getCurrentUser();
        expect(user).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("retourne l'utilisateur depuis l'API avec token valide", async () => {
        vi.mocked(getCookie).mockReturnValue("tok-abc");
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ data: { user: mockUser } }), { status: 200 })
        );

        const user = await authService.getCurrentUser();
        expect(user?.email).toBe("test@xccm.io");
    });

    it("vide l'auth et throw sur 401", async () => {
        vi.mocked(getCookie).mockReturnValue("expired-token");
        mockFetch.mockResolvedValue(new Response("Unauthorized", { status: 401 }));

        await expect(authService.getCurrentUser()).rejects.toThrow("Session expirée");
        expect(deleteCookie).toHaveBeenCalledWith("auth_token");
    });

    it("retourne le cache utilisateur si l'API échoue (erreur réseau)", async () => {
        vi.mocked(getCookie).mockReturnValue("tok-abc");
        localStorage.setItem("xccm2_user", JSON.stringify(mockUser));
        mockFetch.mockRejectedValue(new Error("Network error"));

        const user = await authService.getCurrentUser();
        expect(user?.email).toBe("test@xccm.io");
    });

    it("met à jour le cache localStorage après succès API", async () => {
        vi.mocked(getCookie).mockReturnValue("tok-abc");
        const updatedUser = { ...mockUser, firstname: "Bob" };
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ data: { user: updatedUser } }), { status: 200 })
        );

        await authService.getCurrentUser();
        const cached = JSON.parse(localStorage.getItem("xccm2_user")!);
        expect(cached.firstname).toBe("Bob");
    });
});

describe("authService.logout", () => {
    it("appelle l'API de logout et efface l'auth locale", async () => {
        vi.mocked(getCookie).mockReturnValue("tok-abc");
        mockFetch.mockResolvedValue(new Response("{}", { status: 200 }));
        localStorage.setItem("xccm2_auth_token", "tok-abc");
        localStorage.setItem("xccm2_user", JSON.stringify(mockUser));

        await authService.logout();

        expect(deleteCookie).toHaveBeenCalledWith("auth_token");
        expect(localStorage.getItem("xccm2_auth_token")).toBeNull();
        expect(localStorage.getItem("xccm2_user")).toBeNull();
    });

    it("efface l'auth locale même si l'API de logout échoue", async () => {
        vi.mocked(getCookie).mockReturnValue("tok-abc");
        mockFetch.mockRejectedValue(new Error("Server down"));

        await authService.logout(); // ne doit pas throw

        expect(deleteCookie).toHaveBeenCalledWith("auth_token");
    });
});

describe("authService.getAuthToken", () => {
    it("retourne le token depuis le cookie en priorité", () => {
        vi.mocked(getCookie).mockReturnValue("cookie-tok");
        localStorage.setItem("xccm2_auth_token", "storage-tok");
        expect(authService.getAuthToken()).toBe("cookie-tok");
    });

    it("fallback sur localStorage si pas de cookie", () => {
        vi.mocked(getCookie).mockReturnValue(null);
        localStorage.setItem("xccm2_auth_token", "storage-tok");
        expect(authService.getAuthToken()).toBe("storage-tok");
    });

    it("retourne null si ni cookie ni localStorage", () => {
        vi.mocked(getCookie).mockReturnValue(null);
        expect(authService.getAuthToken()).toBeNull();
    });
});
