import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/apiHelper", () => ({ authenticatedFetch: vi.fn() }));
import { authenticatedFetch } from "@/lib/apiHelper";
import { adminService } from "@/services/adminService";

const mf  = vi.mocked(authenticatedFetch);
const ok  = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const err = (msg = "Erreur", status = 400) => new Response(JSON.stringify({ message: msg }), { status });

beforeEach(() => mf.mockReset());

describe("adminService.getStats", () => {
  it("normalise { global, recentUsers[], recentProjects[] }", async () => {
    mf.mockResolvedValue(ok({ data: { global: { total: 10 }, recentUsers: [{ id: "u1" }], recentProjects: [] } }));
    const r = await adminService.getStats();
    expect(r.global.total).toBe(10);
    expect(Array.isArray(r.recentUsers)).toBe(true);
    expect(r.recentUsers).toHaveLength(1);
  });
  it("retourne tableaux vides si champs manquants", async () => {
    mf.mockResolvedValue(ok({ data: {} }));
    const r = await adminService.getStats();
    expect(r.recentUsers).toEqual([]);
    expect(r.recentProjects).toEqual([]);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Acces refuse", 403));
    await expect(adminService.getStats()).rejects.toThrow("Acces refuse");
  });
});

describe("adminService.getAllProjects", () => {
  it("extrait data.projects", async () => {
    mf.mockResolvedValue(ok({ data: { projects: [{ pr_id: "p1" }] } }));
    const r = await adminService.getAllProjects();
    expect(r).toHaveLength(1);
  });
  it("extrait data[] directement", async () => {
    mf.mockResolvedValue(ok({ data: [{ pr_id: "p2" }] }));
    const r = await adminService.getAllProjects();
    expect(r).toHaveLength(1);
  });
  it("retourne [] si data null", async () => {
    mf.mockResolvedValue(ok({ data: null }));
    expect(await adminService.getAllProjects()).toEqual([]);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Forbidden", 403));
    await expect(adminService.getAllProjects()).rejects.toThrow();
  });
});

describe("adminService.getAllUsers", () => {
  it("retourne data.data", async () => {
    mf.mockResolvedValue(ok({ data: [{ user_id: "u1" }] }));
    const r = await adminService.getAllUsers();
    expect(r).toHaveLength(1);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Forbidden", 403));
    await expect(adminService.getAllUsers()).rejects.toThrow();
  });
});

describe("adminService.deleteUser", () => {
  it("resout sans valeur si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(adminService.deleteUser("u1")).resolves.toBeUndefined();
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Not found", 404));
    await expect(adminService.deleteUser("u-x")).rejects.toThrow();
  });
  it("methode DELETE + URL avec userId", async () => {
    mf.mockResolvedValue(ok({}));
    await adminService.deleteUser("u42");
    expect(mf.mock.calls[0][0]).toContain("u42");
    expect(mf.mock.calls[0][1]?.method).toBe("DELETE");
  });
});

describe("adminService.updateUserRole", () => {
  it("resout sans valeur si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(adminService.updateUserRole("u1", "admin")).resolves.toBeUndefined();
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Erreur", 500));
    await expect(adminService.updateUserRole("u1", "admin")).rejects.toThrow();
  });
  it("envoie role dans le body", async () => {
    mf.mockResolvedValue(ok({}));
    await adminService.updateUserRole("u1", "admin");
    const body = JSON.parse(mf.mock.calls[0][1]?.body as string);
    expect(body.role).toBe("admin");
  });
});

describe("adminService.getSettings", () => {
  it("retourne data.data", async () => {
    mf.mockResolvedValue(ok({ data: { theme: "dark" } }));
    const r = await adminService.getSettings();
    expect(r.theme).toBe("dark");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(adminService.getSettings()).rejects.toThrow();
  });
});
