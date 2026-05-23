import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/apiHelper", () => ({ authenticatedFetch: vi.fn() }));
import { authenticatedFetch } from "@/lib/apiHelper";
import { exerciseService } from "@/services/exerciseService";

const mf  = vi.mocked(authenticatedFetch);
const ok  = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const err = (msg = "Erreur", status = 400) => new Response(JSON.stringify({ message: msg }), { status });

const mockExercise = { id: "ex1", type: "QCU" as const, title: "QCU test", parameters: {}, creator_id: "u1", created_at: "" };
const mockSubmission = { id: "sub1", exercise_id: "ex1", student_id: "u1", answers: {}, score: 8, feedback: null, submitted_at: "" };

beforeEach(() => mf.mockReset());

describe("exerciseService.getExercises", () => {
  it("extrait data.exercises", async () => {
    mf.mockResolvedValue(ok({ data: { exercises: [mockExercise] } }));
    expect(await exerciseService.getExercises()).toHaveLength(1);
  });
  it("extrait data[]", async () => {
    mf.mockResolvedValue(ok({ data: [mockExercise] }));
    expect(await exerciseService.getExercises()).toHaveLength(1);
  });
  it("retourne [] si data vide", async () => {
    mf.mockResolvedValue(ok({ data: {} }));
    expect(await exerciseService.getExercises()).toEqual([]);
  });
  it("passe les filtres dans la query string", async () => {
    mf.mockResolvedValue(ok({ data: [] }));
    await exerciseService.getExercises({ project_id: "p1", part_id: "pt1" });
    const url = mf.mock.calls[0][0] as string;
    expect(url).toContain("project_id=p1");
    expect(url).toContain("part_id=pt1");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Forbidden", 403));
    await expect(exerciseService.getExercises()).rejects.toThrow("Forbidden");
  });
});

describe("exerciseService.getProjectExercises", () => {
  it("extrait data.exercises", async () => {
    mf.mockResolvedValue(ok({ data: { exercises: [mockExercise] } }));
    expect(await exerciseService.getProjectExercises("p1")).toHaveLength(1);
  });
  it("retourne [] si data null", async () => {
    mf.mockResolvedValue(ok({ data: null }));
    expect(await exerciseService.getProjectExercises("p1")).toEqual([]);
  });
  it("URL contient project_id et mode=student", async () => {
    mf.mockResolvedValue(ok({ data: [] }));
    await exerciseService.getProjectExercises("proj-42");
    const url = mf.mock.calls[0][0] as string;
    expect(url).toContain("project_id=proj-42");
    expect(url).toContain("mode=student");
  });
});

describe("exerciseService.createExercise", () => {
  it("retourne data.data.exercise", async () => {
    mf.mockResolvedValue(ok({ data: { exercise: mockExercise } }));
    const r = await exerciseService.createExercise({});
    expect(r.id).toBe("ex1");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Validation error", 422));
    await expect(exerciseService.createExercise({})).rejects.toThrow("Validation error");
  });
  it("methode POST", async () => {
    mf.mockResolvedValue(ok({ data: { exercise: mockExercise } }));
    await exerciseService.createExercise({});
    expect(mf.mock.calls[0][1]?.method).toBe("POST");
  });
});

describe("exerciseService.updateExercise", () => {
  it("retourne data.data.exercise", async () => {
    const updated = { ...mockExercise, title: "Updated" };
    mf.mockResolvedValue(ok({ data: { exercise: updated } }));
    const r = await exerciseService.updateExercise("ex1", { title: "Updated" });
    expect(r.title).toBe("Updated");
  });
  it("methode PUT", async () => {
    mf.mockResolvedValue(ok({ data: { exercise: mockExercise } }));
    await exerciseService.updateExercise("ex1", {});
    expect(mf.mock.calls[0][1]?.method).toBe("PUT");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(exerciseService.updateExercise("ex1", {})).rejects.toThrow();
  });
});

describe("exerciseService.deleteExercise", () => {
  it("resout sans valeur si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(exerciseService.deleteExercise("ex1")).resolves.toBeUndefined();
  });
  it("methode DELETE", async () => {
    mf.mockResolvedValue(ok({}));
    await exerciseService.deleteExercise("ex1");
    expect(mf.mock.calls[0][1]?.method).toBe("DELETE");
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Not found", 404));
    await expect(exerciseService.deleteExercise("ex-x")).rejects.toThrow();
  });
});

describe("exerciseService.submitAnswer", () => {
  it("retourne data.data (submission + result)", async () => {
    const payload = { submission: mockSubmission, result: { score: 8, maxPoints: 10, feedback: null, isAutoGraded: true, isPerfect: false } };
    mf.mockResolvedValue(ok({ data: payload }));
    const r = await exerciseService.submitAnswer("ex1", { answer: "A" });
    expect(r.submission.id).toBe("sub1");
    expect(r.result.score).toBe(8);
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err("Already submitted", 409));
    await expect(exerciseService.submitAnswer("ex1", {})).rejects.toThrow("Already submitted");
  });
});

describe("exerciseService.getMySubmissions", () => {
  it("extrait data.submissions", async () => {
    mf.mockResolvedValue(ok({ data: { submissions: [mockSubmission] } }));
    expect(await exerciseService.getMySubmissions()).toHaveLength(1);
  });
  it("retourne [] si data vide", async () => {
    mf.mockResolvedValue(ok({ data: {} }));
    expect(await exerciseService.getMySubmissions()).toEqual([]);
  });
  it("passe les filtres", async () => {
    mf.mockResolvedValue(ok({ data: [] }));
    await exerciseService.getMySubmissions({ exercise_id: "ex1", project_id: "p1" });
    const url = mf.mock.calls[0][0] as string;
    expect(url).toContain("exercise_id=ex1");
    expect(url).toContain("project_id=p1");
  });
});

describe("exerciseService.reorderExercises", () => {
  it("resout si ok", async () => {
    mf.mockResolvedValue(ok({}));
    await expect(exerciseService.reorderExercises(["ex1", "ex2"])).resolves.toBeUndefined();
  });
  it("throw si non ok", async () => {
    mf.mockResolvedValue(err());
    await expect(exerciseService.reorderExercises([])).rejects.toThrow();
  });
});
