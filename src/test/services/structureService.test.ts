import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/apiHelper", () => ({ authenticatedFetch: vi.fn() }));
import { authenticatedFetch } from "@/lib/apiHelper";
import { structureService } from "@/services/structureService";

const mf = vi.mocked(authenticatedFetch);
const proj = "Mon Projet";
const mockPart     = { part_id: "p1", part_title: "Partie 1", part_number: 1, parent_pr: proj };
const mockChapter  = { chapter_id: "c1", chapter_title: "Chapitre 1", chapter_number: 1, parent_part: "p1" };
const mockPara     = { para_id: "par1", para_name: "Para 1", para_number: 1, parent_chapter: "c1" };
const mockNotion   = { notion_id: "n1", notion_name: "Notion 1", notion_content: "<p>X</p>", parent_para: "par1" };

const ok  = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const err = (msg = "Erreur", status = 400) => new Response(JSON.stringify({ message: msg }), { status });
const u401 = () => new Response("{}", { status: 401 });

beforeEach(() => mf.mockReset());

// ── getProjectStructureOptimized ────────────────────────────────────────────
describe("getProjectStructureOptimized", () => {
  it("extrait data.structure", async () => {
    mf.mockResolvedValue(ok({ data: { structure: [mockPart] } }));
    expect(await structureService.getProjectStructureOptimized(proj)).toHaveLength(1);
  });
  it("extrait data[] directement", async () => {
    mf.mockResolvedValue(ok({ data: [mockPart] }));
    expect(await structureService.getProjectStructureOptimized(proj)).toHaveLength(1);
  });
  it("retourne [] si data null", async () => {
    mf.mockResolvedValue(ok({ data: null }));
    expect(await structureService.getProjectStructureOptimized(proj)).toEqual([]);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Projet introuvable", 404));
    await expect(structureService.getProjectStructureOptimized(proj)).rejects.toThrow("Projet introuvable");
  });
  it("URL contient le nom encodé", async () => {
    mf.mockResolvedValue(ok({ data: [] }));
    await structureService.getProjectStructureOptimized(proj);
    expect(mf.mock.calls[0][0]).toContain(encodeURIComponent(proj));
  });
});

// ── Parts ───────────────────────────────────────────────────────────────────
describe("getParts", () => {
  it("extrait data.parts", async () => {
    mf.mockResolvedValue(ok({ data: { parts: [mockPart] } }));
    expect(await structureService.getParts(proj)).toHaveLength(1);
  });
  it("extrait data[]", async () => {
    mf.mockResolvedValue(ok({ data: [mockPart] }));
    expect(await structureService.getParts(proj)).toHaveLength(1);
  });
  it("retourne [] si data vide", async () => {
    mf.mockResolvedValue(ok({ data: {} }));
    expect(await structureService.getParts(proj)).toEqual([]);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Erreur", 500));
    await expect(structureService.getParts(proj)).rejects.toThrow();
  });
});

describe("createPart", () => {
  it("retourne result.data.part", async () => {
    mf.mockResolvedValue(ok({ data: { part: mockPart } }));
    const r = await structureService.createPart(proj, { part_title: "P1", part_number: 1 });
    expect(r.part_id).toBe("p1");
  });
  it("methode POST", async () => {
    mf.mockResolvedValue(ok({ data: { part: mockPart } }));
    await structureService.createPart(proj, { part_title: "P1", part_number: 1 });
    expect(mf.mock.calls[0][1]?.method).toBe("POST");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Titre pris", 409));
    await expect(structureService.createPart(proj, { part_title: "P1", part_number: 1 })).rejects.toThrow("Titre pris");
  });
});

describe("updatePart", () => {
  it("retourne la partie mise a jour", async () => {
    mf.mockResolvedValue(ok({ data: { part: { ...mockPart, part_title: "P1 bis" } } }));
    const r = await structureService.updatePart(proj, "Partie 1", { part_title: "P1 bis" });
    expect(r.part_title).toBe("P1 bis");
  });
  it("throw sur 401", async () => {
    mf.mockResolvedValue(u401());
    await expect(structureService.updatePart(proj, "P1", {})).rejects.toThrow("Token invalide ou expiré.");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.updatePart(proj, "P1", {})).rejects.toThrow();
  });
});

describe("deletePart", () => {
  it("resout si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(structureService.deletePart(proj, "P1")).resolves.toBeUndefined();
  });
  it("methode DELETE", async () => {
    mf.mockResolvedValue(ok({}));
    await structureService.deletePart(proj, "P1");
    expect(mf.mock.calls[0][1]?.method).toBe("DELETE");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.deletePart(proj, "P1")).rejects.toThrow();
  });
});

// ── Chapters ────────────────────────────────────────────────────────────────
describe("getChapters", () => {
  it("extrait data.chapters", async () => {
    mf.mockResolvedValue(ok({ data: { chapters: [mockChapter] } }));
    expect(await structureService.getChapters(proj, "P1")).toHaveLength(1);
  });
  it("retourne [] si data null", async () => {
    mf.mockResolvedValue(ok({ data: null }));
    expect(await structureService.getChapters(proj, "P1")).toEqual([]);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.getChapters(proj, "P1")).rejects.toThrow();
  });
});

describe("createChapter", () => {
  it("retourne result.data.chapter", async () => {
    mf.mockResolvedValue(ok({ data: { chapter: mockChapter } }));
    const r = await structureService.createChapter(proj, "P1", { chapter_title: "C1", chapter_number: 1 });
    expect(r.chapter_id).toBe("c1");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.createChapter(proj, "P1", { chapter_title: "C1", chapter_number: 1 })).rejects.toThrow();
  });
});

describe("updateChapter", () => {
  it("retourne le chapitre mis a jour", async () => {
    mf.mockResolvedValue(ok({ data: { chapter: { ...mockChapter, chapter_title: "C1b" } } }));
    const r = await structureService.updateChapter(proj, "P1", "C1", { chapter_title: "C1b" });
    expect(r.chapter_title).toBe("C1b");
  });
  it("throw sur 401", async () => {
    mf.mockResolvedValue(u401());
    await expect(structureService.updateChapter(proj, "P1", "C1", {})).rejects.toThrow("Token invalide ou expiré.");
  });
});

describe("deleteChapter", () => {
  it("resout si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(structureService.deleteChapter(proj, "P1", "C1")).resolves.toBeUndefined();
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.deleteChapter(proj, "P1", "C1")).rejects.toThrow();
  });
});

// ── Paragraphs ──────────────────────────────────────────────────────────────
describe("getParagraphs", () => {
  it("extrait data.paragraphs", async () => {
    mf.mockResolvedValue(ok({ data: { paragraphs: [mockPara] } }));
    expect(await structureService.getParagraphs(proj, "P1", "C1")).toHaveLength(1);
  });
  it("retourne [] si data vide", async () => {
    mf.mockResolvedValue(ok({ data: {} }));
    expect(await structureService.getParagraphs(proj, "P1", "C1")).toEqual([]);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.getParagraphs(proj, "P1", "C1")).rejects.toThrow();
  });
});

describe("createParagraph", () => {
  it("retourne result.data.paragraph", async () => {
    mf.mockResolvedValue(ok({ data: { paragraph: mockPara } }));
    const r = await structureService.createParagraph(proj, "P1", "C1", { para_name: "Par1", para_number: 1 });
    expect(r.para_id).toBe("par1");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.createParagraph(proj, "P1", "C1", { para_name: "Par1", para_number: 1 })).rejects.toThrow();
  });
});

describe("updateParagraph", () => {
  it("retourne le paragraphe mis a jour", async () => {
    mf.mockResolvedValue(ok({ data: { paragraph: { ...mockPara, para_name: "Para 1b" } } }));
    const r = await structureService.updateParagraph(proj, "P1", "C1", "Par1", { para_name: "Para 1b" });
    expect(r.para_name).toBe("Para 1b");
  });
  it("throw sur 401", async () => {
    mf.mockResolvedValue(u401());
    await expect(structureService.updateParagraph(proj, "P1", "C1", "Par1", {})).rejects.toThrow("Token invalide ou expiré.");
  });
});

describe("deleteParagraph", () => {
  it("resout si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(structureService.deleteParagraph(proj, "P1", "C1", "Par1")).resolves.toBeUndefined();
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.deleteParagraph(proj, "P1", "C1", "Par1")).rejects.toThrow();
  });
});

// ── Notions ─────────────────────────────────────────────────────────────────
describe("getNotions", () => {
  it("extrait data.notions", async () => {
    mf.mockResolvedValue(ok({ data: { notions: [mockNotion] } }));
    expect(await structureService.getNotions(proj, "P1", "C1", "Par1")).toHaveLength(1);
  });
  it("retourne [] si data null", async () => {
    mf.mockResolvedValue(ok({ data: null }));
    expect(await structureService.getNotions(proj, "P1", "C1", "Par1")).toEqual([]);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.getNotions(proj, "P1", "C1", "Par1")).rejects.toThrow();
  });
});

describe("createNotion", () => {
  it("retourne result.data.notion", async () => {
    mf.mockResolvedValue(ok({ data: { notion: mockNotion } }));
    const r = await structureService.createNotion(proj, "P1", "C1", "Par1", { notion_name: "N1", notion_content: "<p>X</p>", notion_number: 1 });
    expect(r.notion_id).toBe("n1");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.createNotion(proj, "P1", "C1", "Par1", { notion_name: "N1", notion_content: "", notion_number: 1 })).rejects.toThrow();
  });
});

describe("updateNotion", () => {
  it("retourne la notion mise a jour", async () => {
    mf.mockResolvedValue(ok({ data: { notion: { ...mockNotion, notion_name: "N1b" } } }));
    const r = await structureService.updateNotion(proj, "P1", "C1", "Par1", "N1", { notion_name: "N1b" });
    expect(r.notion_name).toBe("N1b");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.updateNotion(proj, "P1", "C1", "Par1", "N1", {})).rejects.toThrow();
  });
});

describe("deleteNotion", () => {
  it("resout si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(structureService.deleteNotion(proj, "P1", "C1", "Par1", "N1")).resolves.toBeUndefined();
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.deleteNotion(proj, "P1", "C1", "Par1", "N1")).rejects.toThrow();
  });
});

// ── UUID-based ops ───────────────────────────────────────────────────────────
describe("updateGranuleById", () => {
  it("retourne result.data", async () => {
    mf.mockResolvedValue(ok({ data: { notion_name: "updated" } }));
    const r = await structureService.updateGranuleById(proj, "uuid-1", { notion_name: "updated" });
    expect(r.notion_name).toBe("updated");
  });
  it("throw sur 401", async () => {
    mf.mockResolvedValue(u401());
    await expect(structureService.updateGranuleById(proj, "uuid-1", {})).rejects.toThrow("Token invalide ou expiré.");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Introuvable", 404));
    await expect(structureService.updateGranuleById(proj, "uuid-x", {})).rejects.toThrow("Introuvable");
  });
});

describe("deleteGranuleById", () => {
  it("resout si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(structureService.deleteGranuleById(proj, "uuid-1")).resolves.toBeUndefined();
  });
  it("throw sur 401", async () => {
    mf.mockResolvedValue(u401());
    await expect(structureService.deleteGranuleById(proj, "uuid-1")).rejects.toThrow("Token invalide ou expiré.");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.deleteGranuleById(proj, "uuid-x")).rejects.toThrow();
  });
});

// ── moveGranule / reorderGranules ────────────────────────────────────────────
describe("moveGranule", () => {
  it("retourne result.data", async () => {
    mf.mockResolvedValue(ok({ data: { moved: true } }));
    const r = await structureService.moveGranule(proj, "chapter", "c1", "p2");
    expect(r.moved).toBe(true);
  });
  it("methode PATCH", async () => {
    mf.mockResolvedValue(ok({ data: {} }));
    await structureService.moveGranule(proj, "notion", "n1", "par2");
    expect(mf.mock.calls[0][1]?.method).toBe("PATCH");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Deplacement impossible", 422));
    await expect(structureService.moveGranule(proj, "chapter", "c1", "p2")).rejects.toThrow("Deplacement impossible");
  });
});

describe("reorderGranules", () => {
  it("resout si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(structureService.reorderGranules(proj, "part", [{ id: "p1", number: 1 }])).resolves.toBeUndefined();
  });
  it("throw sur 401", async () => {
    mf.mockResolvedValue(u401());
    await expect(structureService.reorderGranules(proj, "part", [])).rejects.toThrow("Token invalide ou expiré.");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(structureService.reorderGranules(proj, "part", [])).rejects.toThrow();
  });
});
