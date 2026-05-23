import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthToken, getAuthHeaders, authenticatedFetch } from "@/lib/apiHelper";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
    mockFetch.mockReset();
    // Reset cookies
    document.cookie = "auth_token=; Max-Age=0; path=/";
});

describe("getAuthToken", () => {
    it("retourne null si aucun cookie auth_token", () => {
        expect(getAuthToken()).toBeNull();
    });

    it("retourne le token depuis le cookie", () => {
        document.cookie = "auth_token=mytoken123; path=/";
        expect(getAuthToken()).toBe("mytoken123");
    });

    it("retourne null si cookie vide", () => {
        document.cookie = "auth_token=; path=/";
        expect(getAuthToken()).toBeNull();
    });
});

describe("getAuthHeaders", () => {
    it("retourne Content-Type json sans token", () => {
        const headers = getAuthHeaders();
        expect(headers["Content-Type"]).toBe("application/json");
        expect(headers["Authorization"]).toBeUndefined();
    });

    it("inclut Authorization quand un token est présent", () => {
        document.cookie = "auth_token=tok42; path=/";
        const headers = getAuthHeaders() as Record<string, string>;
        expect(headers["Authorization"]).toBe("Bearer tok42");
    });
});

describe("authenticatedFetch", () => {
    it("appelle fetch avec les bons headers auth", async () => {
        document.cookie = "auth_token=tok99; path=/";
        mockFetch.mockResolvedValue(new Response("{}", { status: 200 }));

        await authenticatedFetch("/api/test");

        expect(mockFetch).toHaveBeenCalledWith(
            "/api/test",
            expect.objectContaining({
                headers: expect.objectContaining({ Authorization: "Bearer tok99" }),
            })
        );
    });

    it("retourne la réponse fetch normalement", async () => {
        mockFetch.mockResolvedValue(new Response("{}", { status: 200 }));
        const res = await authenticatedFetch("/api/data");
        expect(res.status).toBe(200);
    });

    it("dispatche l'événement xccm2:auth-expired sur 401", async () => {
        mockFetch.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
        const handler = vi.fn();
        window.addEventListener("xccm2:auth-expired", handler);

        await authenticatedFetch("/api/projects");

        expect(handler).toHaveBeenCalledTimes(1);
        window.removeEventListener("xccm2:auth-expired", handler);
    });

    it("ne dispatche PAS xccm2:auth-expired pour /api/auth/me sur 401", async () => {
        mockFetch.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
        const handler = vi.fn();
        window.addEventListener("xccm2:auth-expired", handler);

        await authenticatedFetch("/api/auth/me");

        expect(handler).not.toHaveBeenCalled();
        window.removeEventListener("xccm2:auth-expired", handler);
    });

    it("ne dispatche PAS xccm2:auth-expired pour /api/auth/logout sur 401", async () => {
        mockFetch.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
        const handler = vi.fn();
        window.addEventListener("xccm2:auth-expired", handler);

        await authenticatedFetch("/api/auth/logout");

        expect(handler).not.toHaveBeenCalled();
        window.removeEventListener("xccm2:auth-expired", handler);
    });

    it("supprime Content-Type si le body est FormData", async () => {
        mockFetch.mockResolvedValue(new Response("{}", { status: 200 }));
        const formData = new FormData();
        formData.append("name", "test");

        await authenticatedFetch("/api/upload", { method: "POST", body: formData });

        const callArgs = mockFetch.mock.calls[0][1];
        expect(callArgs.headers["Content-Type"]).toBeUndefined();
    });
});
