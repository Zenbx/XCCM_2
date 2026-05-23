import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/apiHelper", () => ({
    authenticatedFetch: vi.fn(),
}));

import { authenticatedFetch } from "@/lib/apiHelper";
import { documentService } from "@/services/documentService";

function makeResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status });
}

const mockDocs = [
    { doc_id: "d1", doc_name: "Doc 1", url_content: "", pages: 10, doc_size: 100, published_at: "", consult: 0, downloaded: 0 },
    { doc_id: "d2", doc_name: "Doc 2", url_content: "", pages: 5, doc_size: 50, published_at: "", consult: 2, downloaded: 1 },
];

beforeEach(() => {
    vi.mocked(authenticatedFetch).mockReset();
});

describe("documentService.getPublishedDocuments — normalisation des réponses", () => {
    it("extrait { data: { documents: [...] } }", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(
            makeResponse({ data: { documents: mockDocs, hasMore: false } })
        );
        const result = await documentService.getPublishedDocuments();
        expect(Array.isArray(result.documents)).toBe(true);
        expect(result.documents).toHaveLength(2);
        expect(result.hasMore).toBe(false);
    });

    it("extrait { data: [...] } (tableau direct dans data)", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(
            makeResponse({ data: mockDocs })
        );
        const result = await documentService.getPublishedDocuments();
        expect(result.documents).toHaveLength(2);
    });

    it("retourne documents=[] quand data est un objet sans documents", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(
            makeResponse({ data: { count: 0 } })
        );
        const result = await documentService.getPublishedDocuments();
        expect(result.documents).toEqual([]);
    });

    it("retourne documents=[] quand data est null", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ data: null }));
        const result = await documentService.getPublishedDocuments();
        expect(result.documents).toEqual([]);
    });

    it("throw si le statut HTTP n'est pas ok", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({}, 500));
        await expect(documentService.getPublishedDocuments()).rejects.toThrow();
    });

    it("passe les paramètres page et limit dans l'URL", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(
            makeResponse({ data: { documents: [], hasMore: false } })
        );
        await documentService.getPublishedDocuments(2, 10);
        const url = vi.mocked(authenticatedFetch).mock.calls[0][0] as string;
        expect(url).toContain("page=2");
        expect(url).toContain("limit=10");
    });
});

describe("documentService.getDocumentById", () => {
    it("retourne result.data en cas de succès", async () => {
        const mockDoc = { document: mockDocs[0], project: {}, structure: [] };
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({ data: mockDoc }));

        const result = await documentService.getDocumentById("d1");
        expect(result).toEqual(mockDoc);
    });

    it("throw si le statut n'est pas ok", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({}, 404));
        await expect(documentService.getDocumentById("unknown")).rejects.toThrow();
    });
});

describe("documentService.toggleLike", () => {
    it("retourne les données de like/unlike", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(
            makeResponse({ data: { likes: 5, isLiked: true } })
        );
        const result = await documentService.toggleLike("d1");
        expect(result.likes).toBe(5);
        expect(result.isLiked).toBe(true);
    });

    it("throw si le statut n'est pas ok", async () => {
        vi.mocked(authenticatedFetch).mockResolvedValue(makeResponse({}, 401));
        await expect(documentService.toggleLike("d1")).rejects.toThrow();
    });
});
