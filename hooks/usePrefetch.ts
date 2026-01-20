import { useRef, useCallback } from 'react';
import { structureService } from '@/services/structureService';

interface PrefetchCacheEntry {
    data: any;
    timestamp: number;
}

interface PrefetchCache {
    [key: string]: PrefetchCacheEntry;
}

interface UsePrefetchOptions {
    maxCacheSize?: number;
    ttl?: number; // Time to live in milliseconds
}

/**
 * Hook for aggressive prefetching with LRU cache
 * Prefetches notion content on hover and viewport intersection
 */
export function usePrefetch(options: UsePrefetchOptions = {}) {
    const {
        maxCacheSize = 50,
        ttl = 5 * 60 * 1000, // 5 minutes default
    } = options;

    const cache = useRef<PrefetchCache>({});
    const accessOrder = useRef<string[]>([]);
    const pendingFetches = useRef<Set<string>>(new Set());

    // Clean expired entries
    const cleanExpired = useCallback(() => {
        const now = Date.now();
        Object.keys(cache.current).forEach(key => {
            if (now - cache.current[key].timestamp > ttl) {
                delete cache.current[key];
                accessOrder.current = accessOrder.current.filter(k => k !== key);
            }
        });
    }, [ttl]);

    // Evict LRU item when cache is full
    const evictLRU = useCallback(() => {
        if (accessOrder.current.length >= maxCacheSize) {
            const lruKey = accessOrder.current.shift();
            if (lruKey) {
                delete cache.current[lruKey];
            }
        }
    }, [maxCacheSize]);

    // Update access order (LRU tracking)
    const updateAccessOrder = useCallback((key: string) => {
        accessOrder.current = accessOrder.current.filter(k => k !== key);
        accessOrder.current.push(key);
    }, []);

    /**
     * Prefetch notion content
     */
    const prefetchNotion = useCallback(async (
        projectName: string,
        partTitle: string,
        chapterTitle: string,
        paraName: string,
        notionName: string
    ) => {
        const cacheKey = `${projectName}:${partTitle}:${chapterTitle}:${paraName}:${notionName}`;

        // Already cached and fresh
        if (cache.current[cacheKey]) {
            const age = Date.now() - cache.current[cacheKey].timestamp;
            if (age < ttl) {
                updateAccessOrder(cacheKey);
                return cache.current[cacheKey].data;
            }
        }

        // Already fetching
        if (pendingFetches.current.has(cacheKey)) {
            return null;
        }

        try {
            pendingFetches.current.add(cacheKey);

            // Fetch structure and navigate to find notion
            const parts = await structureService.getProjectStructure(projectName);
            let notion: any = null;

            // Navigate the tree to find the notion
            for (const part of parts) {
                if (part.part_title !== partTitle) continue;
                for (const chapter of part.chapters || []) {
                    if (chapter.chapter_title !== chapterTitle) continue;
                    for (const para of chapter.paragraphs || []) {
                        if (para.para_name !== paraName) continue;
                        notion = para.notions?.find(n => n.notion_name === notionName);
                        if (notion) break;
                    }
                    if (notion) break;
                }
                if (notion) break;
            }

            if (!notion) {
                console.warn(`[Prefetch] ❌ Notion not found: ${notionName}`);
                return null;
            }

            // Clean expired entries
            cleanExpired();

            // Evict LRU if needed
            evictLRU();

            // Cache the result
            cache.current[cacheKey] = {
                data: notion,
                timestamp: Date.now(),
            };

            updateAccessOrder(cacheKey);

            console.log(`[Prefetch] ✅ Cached: ${notionName} (${Object.keys(cache.current).length}/${maxCacheSize})`);

            return notion;
        } catch (error) {
            console.error('[Prefetch] ❌ Error:', error);
            return null;
        } finally {
            pendingFetches.current.delete(cacheKey);
        }
    }, [ttl, cleanExpired, evictLRU, updateAccessOrder, maxCacheSize]);

    /**
     * Prefetch part intro
     */
    const prefetchPart = useCallback(async (
        projectName: string,
        partTitle: string
    ) => {
        const cacheKey = `part:${projectName}:${partTitle}`;

        if (cache.current[cacheKey]) {
            updateAccessOrder(cacheKey);
            return cache.current[cacheKey].data;
        }

        if (pendingFetches.current.has(cacheKey)) {
            return null;
        }

        try {
            pendingFetches.current.add(cacheKey);

            const parts = await structureService.getProjectStructure(projectName);
            const part = parts.find(p => p.part_title === partTitle);

            if (part) {
                cleanExpired();
                evictLRU();

                cache.current[cacheKey] = {
                    data: part,
                    timestamp: Date.now(),
                };

                updateAccessOrder(cacheKey);
                console.log(`[Prefetch] ✅ Cached part: ${partTitle}`);
                return part;
            }

            return null;
        } catch (error) {
            console.error('[Prefetch] ❌ Error prefetching part:', error);
            return null;
        } finally {
            pendingFetches.current.delete(cacheKey);
        }
    }, [cleanExpired, evictLRU, updateAccessOrder]);

    /**
     * Get from cache (if exists and fresh)
     */
    const getFromCache = useCallback((
        projectName: string,
        partTitle: string,
        chapterTitle?: string,
        paraName?: string,
        notionName?: string
    ) => {
        const cacheKey = notionName
            ? `${projectName}:${partTitle}:${chapterTitle}:${paraName}:${notionName}`
            : `part:${projectName}:${partTitle}`;

        const entry = cache.current[cacheKey];
        if (entry) {
            const age = Date.now() - entry.timestamp;
            if (age < ttl) {
                updateAccessOrder(cacheKey);
                return entry.data;
            }
        }
        return null;
    }, [ttl, updateAccessOrder]);

    /**
     * Invalidate cache for a specific notion (e.g., after edit)
     */
    const invalidate = useCallback((
        projectName: string,
        partTitle: string,
        chapterTitle?: string,
        paraName?: string,
        notionName?: string
    ) => {
        const cacheKey = notionName
            ? `${projectName}:${partTitle}:${chapterTitle}:${paraName}:${notionName}`
            : `part:${projectName}:${partTitle}`;

        delete cache.current[cacheKey];
        accessOrder.current = accessOrder.current.filter(k => k !== cacheKey);
        console.log(`[Prefetch] 🗑️ Invalidated: ${cacheKey}`);
    }, []);

    /**
     * Clear entire cache
     */
    const clearCache = useCallback(() => {
        cache.current = {};
        accessOrder.current = [];
        pendingFetches.current.clear();
        console.log('[Prefetch] 🗑️ Cache cleared');
    }, []);

    /**
     * Get cache stats
     */
    const getCacheStats = useCallback(() => {
        return {
            size: Object.keys(cache.current).length,
            maxSize: maxCacheSize,
            keys: Object.keys(cache.current),
            pending: Array.from(pendingFetches.current),
        };
    }, [maxCacheSize]);

    return {
        prefetchNotion,
        prefetchPart,
        getFromCache,
        invalidate,
        clearCache,
        getCacheStats,
    };
}
