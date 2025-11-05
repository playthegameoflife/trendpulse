// A simple localStorage-based cache with TTL (Time To Live)

const CACHE_PREFIX = 'trendpulse-global-cache-';

interface CacheItem<T> {
    timestamp: number;
    data: T;
}

// Default cache duration: 6 hours
const DEFAULT_CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

export const cacheService = {
    set<T>(key: string, data: T, durationMs: number = DEFAULT_CACHE_DURATION_MS): void {
        const cacheKey = `${CACHE_PREFIX}${key}`;
        const item: CacheItem<T> = {
            timestamp: Date.now(),
            data: data,
        };
        try {
            localStorage.setItem(cacheKey, JSON.stringify(item));
        } catch (e) {
            console.error("Could not write to global cache", e);
            // This can happen if localStorage is full or disabled.
        }
    },

    get<T>(key: string, durationMs: number = DEFAULT_CACHE_DURATION_MS): T | null {
        const cacheKey = `${CACHE_PREFIX}${key}`;
        try {
            const cachedItemString = localStorage.getItem(cacheKey);
            if (!cachedItemString) {
                return null;
            }

            const item: CacheItem<T> = JSON.parse(cachedItemString);
            const isExpired = (Date.now() - item.timestamp) > durationMs;

            if (isExpired) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            console.log(`Serving "${key}" from global cache.`);
            return item.data;
        } catch (e) {
            console.error("Could not read from global cache", e);
            // If parsing fails, remove the corrupted item.
            localStorage.removeItem(cacheKey);
            return null;
        }
    }
};
