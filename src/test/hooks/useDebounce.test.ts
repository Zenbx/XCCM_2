import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useDebouncedCallback, useDebouncedState } from "@/hooks/useDebounce";

describe("useDebounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it("retourne la valeur initiale immédiatement", () => {
        const { result } = renderHook(() => useDebounce("initial", 300));
        expect(result.current).toBe("initial");
    });

    it("ne met pas à jour la valeur avant le délai", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
            { initialProps: { value: "initial", delay: 300 } }
        );

        rerender({ value: "updated", delay: 300 });
        vi.advanceTimersByTime(100);

        expect(result.current).toBe("initial");
    });

    it("met à jour la valeur après le délai complet", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
            { initialProps: { value: "initial", delay: 300 } }
        );

        rerender({ value: "updated", delay: 300 });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe("updated");
    });

    it("réinitialise le délai si la valeur change avant l'expiration", () => {
        const { result, rerender } = renderHook(
            ({ value }: { value: string }) => useDebounce(value, 300),
            { initialProps: { value: "first" } }
        );

        rerender({ value: "second" });
        vi.advanceTimersByTime(200); // pas encore expiré

        rerender({ value: "third" });
        act(() => {
            vi.advanceTimersByTime(300); // 300ms depuis "third"
        });

        expect(result.current).toBe("third");
    });

    it("fonctionne avec des types non-string", () => {
        const { result, rerender } = renderHook(
            ({ value }: { value: number }) => useDebounce(value, 100),
            { initialProps: { value: 0 } }
        );

        rerender({ value: 42 });
        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(result.current).toBe(42);
    });
});

describe("useDebouncedCallback", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it("n'appelle pas le callback immédiatement", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        result.current("arg1");
        expect(callback).not.toHaveBeenCalled();
    });

    it("appelle le callback avec les bons arguments après le délai", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        result.current("arg1");
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("arg1");
    });

    it("n'appelle le callback qu'une fois si appelé plusieurs fois rapidement", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        result.current("first");
        result.current("second");
        result.current("third");
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("third");
    });

    it("appelle à nouveau le callback après un nouvel appel post-délai", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        result.current("first");
        act(() => { vi.advanceTimersByTime(300); });

        result.current("second");
        act(() => { vi.advanceTimersByTime(300); });

        expect(callback).toHaveBeenCalledTimes(2);
    });
});

describe("useDebouncedState", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it("retourne la valeur immédiate et la valeur debouncée initiale identiques", () => {
        const { result } = renderHook(() => useDebouncedState("initial", 300));
        const [value, debouncedValue] = result.current;

        expect(value).toBe("initial");
        expect(debouncedValue).toBe("initial");
    });

    it("met à jour la valeur immédiate instantanément, la valeur debouncée après le délai", () => {
        const { result } = renderHook(() => useDebouncedState("initial", 300));

        act(() => {
            result.current[2]("updated");
        });

        // Immediate value changes right away
        expect(result.current[0]).toBe("updated");
        // Debounced value still old
        expect(result.current[1]).toBe("initial");

        act(() => {
            vi.advanceTimersByTime(300);
        });

        // Now debounced value catches up
        expect(result.current[1]).toBe("updated");
    });
});
