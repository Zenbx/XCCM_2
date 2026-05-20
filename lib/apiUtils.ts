/**
 * Safe helpers to normalize API responses.
 *
 * Every API call should funnel through these before setting state,
 * because the backend can return unexpected shapes (null, object, nested array)
 * that cause runtime ".map is not a function" / ".filter is not a function" crashes.
 */

/** Returns v if it is a non-empty array, otherwise []. */
export function safeArr<T = unknown>(v: unknown): T[] {
    return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * Picks the first key from a response object that holds an array.
 * Usage: safeArrFrom(result, ['documents', 'items', 'data'])
 */
export function safeArrFrom<T = unknown>(obj: unknown, keys: string[]): T[] {
    if (!obj || typeof obj !== 'object') return [];
    for (const k of keys) {
        const v = (obj as Record<string, unknown>)[k];
        if (Array.isArray(v)) return v as T[];
    }
    return [];
}

/**
 * Normalizes a typical { data: [...] } or { data: { items: [...] } } API envelope.
 * Falls back to [] so callers can safely call .map()/.filter().
 *
 * Tries in order:
 *  1. result itself is an array
 *  2. result.data is an array
 *  3. result.data[key] is an array  (where key is one of dataKey candidates)
 */
export function extractArray<T = unknown>(
    result: unknown,
    dataKeys: string[] = ['items', 'documents', 'projects', 'users', 'data'],
): T[] {
    if (Array.isArray(result)) return result as T[];
    if (!result || typeof result !== 'object') return [];

    const r = result as Record<string, unknown>;

    if (Array.isArray(r.data)) return r.data as T[];

    if (r.data && typeof r.data === 'object') {
        const nested = r.data as Record<string, unknown>;
        for (const k of dataKeys) {
            if (Array.isArray(nested[k])) return nested[k] as T[];
        }
    }

    return [];
}
