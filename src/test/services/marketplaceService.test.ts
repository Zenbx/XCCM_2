import { describe, it, expect, vi, beforeEach } from "vitest";
import { marketplaceService } from "@/services/marketplaceService";

vi.mock("@/lib/apiHelper", () => ({
    authenticatedFetch: vi.fn(),
}));

import { authenticatedFetch } from "@/lib/apiHelper";

const mockItems = [
    { id: "1", type: "part", title: "Item 1", price: 0, tags: [], downloads: 0, published_at: "", seller_id: "s1", seller: { user_id: "s1", firstname: "A", lastname: "B" } },
    { id: "2", type: "chapter", title: "Item 2", price: 5, tags: [], downloads: 3, published_at: "", seller_id: "s2", seller: { user_id: "s2", firstname: "C", lastname: "D" } },
];

function makeResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
    vi.mocked(authenticatedFetch).mockReset();
});

describe("marketplaceService.getItems — normalisation des réponses", () => {
    it("retourne un tableau quand l'API répond avec { data: [...] }", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ data: mockItems }));
        const result = await marketplaceService.getItems();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
    });

    it("retourne un tableau quand l'API répond avec un tableau direct", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse(mockItems));
        const result = await marketplaceService.getItems();
        expect(result).toHaveLength(2);
    });

    it("retourne un tableau quand l'API répond avec { items: [...] }", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ items: mockItems }));
        const result = await marketplaceService.getItems();
        expect(result).toHaveLength(2);
    });

    it("retourne [] quand data est un objet (pas de crash)", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ data: { count: 0 } }));
        const result = await marketplaceService.getItems();
        expect(result).toEqual([]);
    });

    it("retourne [] quand la réponse est null", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse(null));
        const result = await marketplaceService.getItems();
        expect(result).toEqual([]);
    });

    it("retourne [] quand la réponse est un objet vide", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({}));
        const result = await marketplaceService.getItems();
        expect(result).toEqual([]);
    });

    it("throw si l'API retourne une erreur HTTP", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(
            makeResponse({ message: "Erreur serveur" }, 500)
        );
        await expect(marketplaceService.getItems()).rejects.toThrow();
    });

    it("passe les filtres type/category/search dans la query string", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ data: [] }));
        await marketplaceService.getItems({ type: "chapter", category: "math", search: "intro" });

        const url = vi.mocked(authenticatedFetch).mock.calls[0][0] as string;
        expect(url).toContain("type=chapter");
        expect(url).toContain("category=math");
        expect(url).toContain("search=intro");
    });
});

describe("marketplaceService.publishItem", () => {
    it("retourne l'item publié depuis result.data", async () => {
        const newItem = { ...mockItems[0], id: "new" };
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ data: newItem }));

        const result = await marketplaceService.publishItem({ type: "part", title: "Test", price: 0 });
        expect(result.id).toBe("new");
    });

    it("throw si l'API retourne une erreur HTTP", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ message: "Forbidden" }, 403));
        await expect(
            marketplaceService.publishItem({ type: "part", title: "T" })
        ).rejects.toThrow();
    });
});

describe("marketplaceService.deleteItem", () => {
    it("résout sans valeur en cas de succès", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({}, 200));
        await expect(marketplaceService.deleteItem("item-1")).resolves.toBeUndefined();
    });

    it("throw si l'API retourne une erreur HTTP", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ message: "Not Found" }, 404));
        await expect(marketplaceService.deleteItem("x")).rejects.toThrow();
    });
});
