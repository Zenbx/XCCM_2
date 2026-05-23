import { describe, it, expect } from "vitest";
import { safeArr, safeArrFrom, extractArray } from "@/lib/apiUtils";

describe("safeArr", () => {
    it("retourne le tableau tel quel quand c'est déjà un tableau", () => {
        expect(safeArr([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("retourne [] pour undefined", () => {
        expect(safeArr(undefined)).toEqual([]);
    });

    it("retourne [] pour null", () => {
        expect(safeArr(null)).toEqual([]);
    });

    it("retourne [] pour un objet plain", () => {
        expect(safeArr({ data: [1, 2] })).toEqual([]);
    });

    it("retourne [] pour un string", () => {
        expect(safeArr("oops")).toEqual([]);
    });

    it("retourne [] pour un nombre", () => {
        expect(safeArr(42)).toEqual([]);
    });

    it("retourne [] pour un tableau vide", () => {
        expect(safeArr([])).toEqual([]);
    });

    it("préserve les types génériques", () => {
        const arr = safeArr<string>(["a", "b"]);
        expect(arr[0]).toBe("a");
    });
});

describe("safeArrFrom", () => {
    it("retourne le tableau pour la première clé trouvée", () => {
        const obj = { items: [1, 2], data: [3, 4] };
        expect(safeArrFrom(obj, ["items", "data"])).toEqual([1, 2]);
    });

    it("essaie la clé suivante si la première n'est pas un tableau", () => {
        const obj = { items: null, data: [3, 4] };
        expect(safeArrFrom(obj, ["items", "data"])).toEqual([3, 4]);
    });

    it("retourne [] si aucune clé ne contient un tableau", () => {
        const obj = { count: 5, status: "ok" };
        expect(safeArrFrom(obj, ["items", "data"])).toEqual([]);
    });

    it("retourne [] pour null", () => {
        expect(safeArrFrom(null, ["data"])).toEqual([]);
    });

    it("retourne [] pour undefined", () => {
        expect(safeArrFrom(undefined, ["data"])).toEqual([]);
    });

    it("retourne [] pour un non-objet (string)", () => {
        expect(safeArrFrom("oops", ["data"])).toEqual([]);
    });

    it("retourne [] pour un tableau vide de clés", () => {
        const obj = { data: [1, 2] };
        expect(safeArrFrom(obj, [])).toEqual([]);
    });
});

describe("extractArray", () => {
    it("retourne l'entrée directement si c'est déjà un tableau", () => {
        expect(extractArray([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("extrait result.data quand c'est un tableau", () => {
        expect(extractArray({ data: [1, 2] })).toEqual([1, 2]);
    });

    it("extrait result.data.items quand data est un objet", () => {
        expect(extractArray({ data: { items: [1, 2] } })).toEqual([1, 2]);
    });

    it("extrait result.data.documents", () => {
        expect(extractArray({ data: { documents: ["a", "b"] } })).toEqual(["a", "b"]);
    });

    it("extrait result.data.projects", () => {
        expect(extractArray({ data: { projects: [{ id: 1 }] } })).toEqual([{ id: 1 }]);
    });

    it("retourne [] pour null", () => {
        expect(extractArray(null)).toEqual([]);
    });

    it("retourne [] pour undefined", () => {
        expect(extractArray(undefined)).toEqual([]);
    });

    it("retourne [] quand result.data est null", () => {
        expect(extractArray({ data: null })).toEqual([]);
    });

    it("retourne [] quand result.data est un objet sans clés connues", () => {
        expect(extractArray({ data: { count: 5 } })).toEqual([]);
    });

    it("retourne [] pour un tableau vide", () => {
        expect(extractArray([])).toEqual([]);
    });

    it("retourne [] pour un string", () => {
        expect(extractArray("oops")).toEqual([]);
    });

    it("respecte les dataKeys custom passées en paramètre", () => {
        expect(extractArray({ data: { custom: [99] } }, ["custom"])).toEqual([99]);
    });
});
