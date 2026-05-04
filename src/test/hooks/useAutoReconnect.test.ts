import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoReconnect, useNetworkStatus } from "@/hooks/useAutoReconnect";

describe("useAutoReconnect", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runAllTimers();
        vi.useRealTimers();
    });

    it("démarre avec l'état initial (non reconnecting)", () => {
        const { result } = renderHook(() => useAutoReconnect());

        expect(result.current.reconnectState.isReconnecting).toBe(false);
        expect(result.current.reconnectState.reconnectAttempt).toBe(0);
        expect(result.current.reconnectState.nextRetryIn).toBe(0);
    });

    it("startReconnect appelle la fonction de reconnexion immédiatement", () => {
        const { result } = renderHook(() =>
            useAutoReconnect({ maxRetries: 1, initialDelay: 5000 })
        );
        const reconnectFn = vi.fn();

        act(() => {
            result.current.startReconnect(reconnectFn);
        });

        expect(reconnectFn).toHaveBeenCalledTimes(1);
        expect(result.current.reconnectState.isReconnecting).toBe(true);
        expect(result.current.reconnectState.reconnectAttempt).toBe(1);
    });

    it("stopReconnect remet l'état à zéro et stoppe les tentatives", () => {
        const { result } = renderHook(() =>
            useAutoReconnect({ maxRetries: 5, initialDelay: 10000 })
        );
        const reconnectFn = vi.fn();

        act(() => {
            result.current.startReconnect(reconnectFn);
        });

        act(() => {
            result.current.stopReconnect();
        });

        expect(result.current.reconnectState.isReconnecting).toBe(false);
        expect(result.current.reconnectState.reconnectAttempt).toBe(0);

        // Advance timers — no further calls should happen
        act(() => { vi.runAllTimers(); });
        expect(reconnectFn).toHaveBeenCalledTimes(1); // only the initial one
    });

    it("notifySuccess remet l'état à zéro et appelle onReconnectSuccess", () => {
        const onReconnectSuccess = vi.fn();
        const { result } = renderHook(() =>
            useAutoReconnect({ maxRetries: 5, initialDelay: 10000, onReconnectSuccess })
        );
        const reconnectFn = vi.fn();

        act(() => {
            result.current.startReconnect(reconnectFn);
        });

        act(() => {
            result.current.notifySuccess();
        });

        expect(result.current.reconnectState.isReconnecting).toBe(false);
        expect(result.current.reconnectState.reconnectAttempt).toBe(0);
        expect(onReconnectSuccess).toHaveBeenCalledTimes(1);
    });

    it("appelle onReconnectAttempt avec le numéro de tentative", () => {
        const onReconnectAttempt = vi.fn();
        const { result } = renderHook(() =>
            useAutoReconnect({ maxRetries: 3, initialDelay: 5000, onReconnectAttempt })
        );
        const reconnectFn = vi.fn();

        act(() => {
            result.current.startReconnect(reconnectFn);
        });

        expect(onReconnectAttempt).toHaveBeenCalledWith(1);
    });

    it("appelle onReconnectFailed quand maxRetries est atteint", () => {
        const onReconnectFailed = vi.fn();
        const { result } = renderHook(() =>
            useAutoReconnect({ maxRetries: 1, initialDelay: 100, onReconnectFailed })
        );
        const reconnectFn = vi.fn();

        act(() => {
            result.current.startReconnect(reconnectFn);
        });

        // Fire the scheduled retry — second attempt hits maxRetries
        act(() => {
            vi.runAllTimers();
        });

        expect(onReconnectFailed).toHaveBeenCalledTimes(1);
        expect(result.current.reconnectState.isReconnecting).toBe(false);
    });

    it("réinitialise le compteur lors d'un nouveau startReconnect", () => {
        const onReconnectAttempt = vi.fn();
        const { result } = renderHook(() =>
            useAutoReconnect({ maxRetries: 5, initialDelay: 10000, onReconnectAttempt })
        );
        const reconnectFn = vi.fn();

        act(() => { result.current.startReconnect(reconnectFn); });
        act(() => { result.current.stopReconnect(); });
        onReconnectAttempt.mockClear();

        act(() => { result.current.startReconnect(reconnectFn); });

        // Should start from attempt 1 again
        expect(onReconnectAttempt).toHaveBeenCalledWith(1);
    });
});

describe("useNetworkStatus", () => {
    it("retourne isOnline: true par défaut", () => {
        const { result } = renderHook(() => useNetworkStatus());
        expect(result.current.isOnline).toBe(true);
    });

    it("passe à false quand un événement offline est émis", () => {
        const { result } = renderHook(() => useNetworkStatus());

        act(() => {
            window.dispatchEvent(new Event("offline"));
        });

        expect(result.current.isOnline).toBe(false);
    });

    it("repasse à true quand un événement online est émis", () => {
        const { result } = renderHook(() => useNetworkStatus());

        act(() => { window.dispatchEvent(new Event("offline")); });
        act(() => { window.dispatchEvent(new Event("online")); });

        expect(result.current.isOnline).toBe(true);
    });
});
