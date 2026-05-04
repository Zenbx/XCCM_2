import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWithRetry, fetchJSONWithRetry } from "@/lib/fetchWithRetry";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
    mockFetch.mockReset();
});

describe("fetchWithRetry", () => {
    it("retourne la réponse immédiatement en cas de succès", async () => {
        mockFetch.mockResolvedValue(new Response("OK", { status: 200 }));
        const res = await fetchWithRetry("/api/test", { retries: 3, retryDelay: 10 });
        expect(res.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("réessaie sur une erreur réseau et réussit au 2e essai", async () => {
        mockFetch
            .mockRejectedValueOnce(new Error("network error"))
            .mockResolvedValue(new Response("OK", { status: 200 }));

        const res = await fetchWithRetry("/api/test", { retries: 3, retryDelay: 0 });

        expect(res.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("réessaie sur une erreur 500 et réussit au 3e essai", async () => {
        mockFetch
            .mockResolvedValueOnce(new Response("", { status: 500, statusText: "Server Error" }))
            .mockResolvedValueOnce(new Response("", { status: 500, statusText: "Server Error" }))
            .mockResolvedValue(new Response("OK", { status: 200 }));

        const res = await fetchWithRetry("/api/test", { retries: 3, retryDelay: 0 });

        expect(res.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("throw après avoir épuisé toutes les tentatives", async () => {
        mockFetch
            .mockRejectedValueOnce(new Error("network error"))
            .mockRejectedValueOnce(new Error("network error"))
            .mockRejectedValueOnce(new Error("network error"));

        await expect(
            fetchWithRetry("/api/test", { retries: 2, retryDelay: 0 })
        ).rejects.toThrow("network error");
        expect(mockFetch).toHaveBeenCalledTimes(3); // 1 + 2 retries
    });

    it("ne réessaie pas sur une erreur 401 (non retriable)", async () => {
        mockFetch.mockResolvedValue(new Response("", { status: 401 }));
        const res = await fetchWithRetry("/api/test", { retries: 3, retryDelay: 10 });
        expect(res.status).toBe(401);
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("appelle onRetry avec le numéro de tentative et l'erreur", async () => {
        const onRetry = vi.fn();
        mockFetch
            .mockRejectedValueOnce(new Error("network error"))
            .mockResolvedValue(new Response("OK", { status: 200 }));

        await fetchWithRetry("/api/test", { retries: 3, retryDelay: 0, onRetry });

        expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });
});

describe("fetchJSONWithRetry", () => {
    it("parse et retourne le JSON en cas de succès", async () => {
        mockFetch.mockResolvedValue(
            new Response(JSON.stringify({ id: 1 }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        );
        const data = await fetchJSONWithRetry<{ id: number }>("/api/test");
        expect(data.id).toBe(1);
    });

    it("throw si la réponse n'est pas ok", async () => {
        mockFetch.mockResolvedValue(new Response("Not Found", { status: 404 }));
        await expect(fetchJSONWithRetry("/api/test")).rejects.toThrow("HTTP 404");
    });
});
