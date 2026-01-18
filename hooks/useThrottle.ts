import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useThrottle - Returns a throttled value that only updates at most once per interval
 *
 * @param value - The value to throttle
 * @param interval - The minimum time between updates in milliseconds
 * @returns The throttled value
 *
 * @example
 * const [scrollPosition, setScrollPosition] = useState(0);
 * const throttledScroll = useThrottle(scrollPosition, 100);
 *
 * // Updates at most every 100ms, preventing excessive renders
 */
export function useThrottle<T>(value: T, interval: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastExecuted = useRef<number>(Date.now());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const now = Date.now();
        const elapsed = now - lastExecuted.current;

        if (elapsed >= interval) {
            // Enough time has passed, update immediately
            lastExecuted.current = now;
            setThrottledValue(value);
        } else {
            // Schedule update for remaining time
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                lastExecuted.current = Date.now();
                setThrottledValue(value);
            }, interval - elapsed);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, interval]);

    return throttledValue;
}

/**
 * useThrottledCallback - Returns a throttled version of the callback function
 *
 * @param callback - The function to throttle
 * @param interval - The minimum time between calls in milliseconds
 * @param options - Additional options
 * @returns A throttled version of the callback
 *
 * @example
 * const handleScroll = useThrottledCallback((e: Event) => {
 *   updateScrollIndicator(e);
 * }, 100);
 *
 * window.addEventListener('scroll', handleScroll);
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
    callback: T,
    interval: number,
    options: {
        leading?: boolean;  // Execute on the leading edge (immediately)
        trailing?: boolean; // Execute on the trailing edge (after interval)
    } = { leading: true, trailing: true }
): (...args: Parameters<T>) => void {
    const { leading = true, trailing = true } = options;

    const lastExecuted = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastArgsRef = useRef<Parameters<T> | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        const elapsed = now - lastExecuted.current;
        lastArgsRef.current = args;

        const executeCallback = () => {
            lastExecuted.current = Date.now();
            callbackRef.current(...(lastArgsRef.current as Parameters<T>));
        };

        if (elapsed >= interval) {
            // First call or enough time has passed
            if (leading) {
                executeCallback();
            } else {
                // Schedule for trailing edge
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(executeCallback, interval);
            }
        } else if (trailing) {
            // Schedule trailing call
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(executeCallback, interval - elapsed);
        }
    }, [interval, leading, trailing]);
}

/**
 * useThrottledState - State with built-in throttling
 *
 * @param initialValue - Initial state value
 * @param interval - The minimum time between updates in milliseconds
 * @returns [immediateValue, throttledValue, setValue]
 *
 * @example
 * const [position, throttledPosition, setPosition] = useThrottledState({ x: 0, y: 0 }, 16);
 * // throttledPosition updates at most every 16ms (60fps)
 */
export function useThrottledState<T>(
    initialValue: T,
    interval: number
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(initialValue);
    const throttledValue = useThrottle(value, interval);

    return [value, throttledValue, setValue];
}

/**
 * useAnimationFrame - Throttles updates to animation frame rate (60fps)
 * Useful for smooth animations that sync with browser repaint
 *
 * @param callback - Function to call on each animation frame
 * @param deps - Dependencies array
 *
 * @example
 * useAnimationFrame(() => {
 *   updateParticlePositions();
 * }, [particles]);
 */
export function useAnimationFrame(
    callback: (deltaTime: number) => void,
    deps: React.DependencyList = []
): void {
    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback, ...deps]);

    useEffect(() => {
        const animate = (time: number) => {
            if (previousTimeRef.current !== undefined) {
                const deltaTime = time - previousTimeRef.current;
                callbackRef.current(deltaTime);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);
}

export default useThrottle;
