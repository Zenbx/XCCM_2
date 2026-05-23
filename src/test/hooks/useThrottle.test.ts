import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle, useThrottledCallback, useThrottledState } from '@/hooks/useThrottle';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useThrottle', () => {
  it('retourne la valeur initiale immédiatement', () => {
    const { result } = renderHook(() => useThrottle('initial', 200));
    expect(result.current).toBe('initial');
  });

  it('met à jour immédiatement si assez de temps s est écoulé', () => {
    const { result, rerender } = renderHook(({ val }) => useThrottle(val, 100), {
      initialProps: { val: 'a' },
    });
    expect(result.current).toBe('a');

    // Advance time past throttle interval
    act(() => { vi.advanceTimersByTime(200); });
    rerender({ val: 'b' });
    expect(result.current).toBe('b');
  });

  it('reporte la mise à jour si trop tôt', () => {
    const { result, rerender } = renderHook(({ val }) => useThrottle(val, 500), {
      initialProps: { val: 'first' },
    });

    // Immediately change value (no time passed)
    rerender({ val: 'second' });
    expect(result.current).toBe('first'); // still throttled

    act(() => { vi.advanceTimersByTime(600); });
    expect(result.current).toBe('second');
  });
});

describe('useThrottledCallback', () => {
  it('appelle le callback immédiatement sur le leading edge', () => {
    const cb = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(cb, 300, { leading: true, trailing: false })
    );
    act(() => { result.current('arg1'); });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('arg1');
  });

  it('n appelle pas le callback pendant l intervalle', () => {
    const cb = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(cb, 300, { leading: true, trailing: false })
    );
    act(() => { result.current(); result.current(); result.current(); });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('appelle sur trailing edge après l intervalle', () => {
    const cb = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(cb, 300, { leading: false, trailing: true })
    );
    act(() => { result.current('x'); });
    expect(cb).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(400); });
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe('useThrottledState', () => {
  it('retourne [immediateValue, throttledValue, setValue]', () => {
    const { result } = renderHook(() => useThrottledState(0, 200));
    const [value, throttledValue] = result.current;
    expect(value).toBe(0);
    expect(throttledValue).toBe(0);
  });

  it('met à jour la valeur immédiate tout de suite', () => {
    const { result } = renderHook(() => useThrottledState(0, 200));
    act(() => { result.current[2](42); });
    expect(result.current[0]).toBe(42);
  });
});
