import { describe, it, expect, vi, beforeEach } from "vitest";
import { projectService } from "@/services/projectService";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockProjects = [
    { pr_id: "p1", pr_name: "Projet Alpha", owner_id: "u1", created_at: "", updated_at: "" },
    { pr_id: "p2", pr_name: "Projet Beta", owner_id: "u1", created_at: "", updated_at: "" },
];

function makeResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
    mockFetch.mockReset();
    // Simuler un cookie d'auth pour toutes les méthodes qui le requièrent
    document.cookie = "auth_token=test-tok; path=/";
});

describe("projectService.getAllProjects — normalisation des réponses", () => {
    it("extrait { data: { projects: [...] } }", async () => {
        mockFetch.mockResolvedValue(makeResponse({ data: { projects: mockProjects } }));
        const result = await projectService.getAllProjects();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
    });

    it("extrait { data: [...] } (tableau direct)", async () => {
        mockFetch.mockResolvedValue(makeResponse({ data: mockProjects }));
        const result = await projectService.getAllProjects();
        expect(result).toHaveLength(2);
    });

    it("retourne [] si data est un objet sans projects", async () => {
        mockFetch.mockResolvedValue(makeResponse({ data: { count: 0 } }));
        const result = await projectService.getAllProjects();
        expect(result).toEqual([]);
    });

    it("retourne [] si data est null", async () => {
        mockFetch.mockResolvedValue(makeResponse({ data: null }));
        const result = await projectService.getAllProjects();
        expect(result).toEqual([]);
    });

    it("throw si status non ok", async () => {
        mockFetch.mockResolvedValue(
            makeResponse({ message: "Non autorisé" }, 403)
        );
        await expect(projectService.getAllProjects()).rejects.toThrow();
    });

    it("throw si pas de token", async () => {
        document.cookie = "auth_token=; Max-Age=0; path=/";
        await expect(projectService.getAllProjects()).rejects.toThrow("Non authentifié");
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it("inclut le header Authorization dans la requête", async () => {
        mockFetch.mockResolvedValue(makeResponse({ data: [] }));
        await projectService.getAllProjects();
        const headers = mockFetch.mock.calls[0][1].headers;
        expect(headers["Authorization"]).toBe("Bearer test-tok");
    });
});

describe("projectService.getPublishedProjects — normalisation des réponses", () => {
    it("extrait { data: { documents: [...] } }", async () => {
        mockFetch.mockResolvedValue(makeResponse({ data: { documents: mockProjects } }));
        const result = await projectService.getPublishedProjects();
        expect(result).toHaveLength(2);
    });

    it("extrait { data: [...] } (tableau direct)", async () => {
        mockFetch.mockResolvedValue(makeResponse({ data: mockProjects }));
        const result = await projectService.getPublishedProjects();
        expect(result).toHaveLength(2);
    });

    it("retourne [] si l'API répond avec un objet vide", async () => {
        mockFetch.mockResolvedValue(makeResponse({ data: {} }));
        const result = await projectService.getPublishedProjects();
        expect(result).toEqual([]);
    });

    it("throw si status non ok", async () => {
        mockFetch.mockResolvedValue(makeResponse({}, 500));
        await expect(projectService.getPublishedProjects()).rejects.toThrow();
    });
});

describe("projectService.createProject", () => {
    it("retourne le projet créé depuis result.data.project", async () => {
        const newProject = { ...mockProjects[0], pr_id: "new" };
        mockFetch.mockResolvedValue(makeResponse({ data: { project: newProject } }));

        const result = await projectService.createProject({ pr_name: "Nouveau" });
        expect(result.pr_id).toBe("new");
    });

    it("throw si status non ok", async () => {
        mockFetch.mockResolvedValue(makeResponse({ message: "Nom déjà pris" }, 409));
        await expect(projectService.createProject({ pr_name: "Dup" })).rejects.toThrow();
    });
});
