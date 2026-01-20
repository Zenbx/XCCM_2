import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useDebounce - Returns a debounced value that only updates after the specified delay
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // This will only run 300ms after the user stops typing
 *   fetchSearchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * useDebouncedCallback - Returns a debounced version of the callback function
 *
 * @param callback - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns A debounced version of the callback
 *
 * @example
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query);
 * }, 300, []);
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
    deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback, ...deps]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);
}

/**
 * useDebouncedState - State with built-in debouncing
 * Returns both the immediate value and the debounced value
 *
 * @param initialValue - Initial state value
 * @param delay - The debounce delay in milliseconds
 * @returns [immediateValue, debouncedValue, setValue]
 *
 * @example
 * const [query, debouncedQuery, setQuery] = useDebouncedState('', 300);
 * // query updates immediately for UI responsiveness
 * // debouncedQuery updates after 300ms for API calls
 */
export function useDebouncedState<T>(
    initialValue: T,
    delay: number
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(initialValue);
    const debouncedValue = useDebounce(value, delay);

    return [value, debouncedValue, setValue];
}

export default useDebounce;
