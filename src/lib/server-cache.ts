/**
 * Centralized Server-Side In-Memory Caching for HubCloud
 * Provides sub-millisecond response times for frequent database queries
 * while supporting instant invalidation on write/update operations.
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export class MemoryCache<T = any> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlSeconds = 60, maxEntries = 1000) {
    this.ttlMs = ttlSeconds * 1000;
    this.maxEntries = maxEntries;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    // Evict oldest entry if size limit exceeded
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, { data, timestamp: Date.now() });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Global Singletons to survive module evaluations in Next.js development
const globalForCache = globalThis as unknown as {
  categoryFiltersCache?: MemoryCache;
  categoriesListCache?: MemoryCache;
  adminProductsCache?: MemoryCache;
  adminStatsCache?: MemoryCache;
  attributesCache?: MemoryCache;
  attributeGroupsCache?: MemoryCache;
  ordersCache?: MemoryCache;
  userSessionCache?: MemoryCache;
};

export const categoryFiltersCache = globalForCache.categoryFiltersCache ?? new MemoryCache(900);
export const categoriesListCache = globalForCache.categoriesListCache ?? new MemoryCache(300);
export const adminProductsCache = globalForCache.adminProductsCache ?? new MemoryCache(30);
export const adminStatsCache = globalForCache.adminStatsCache ?? new MemoryCache(30);
export const attributesCache = globalForCache.attributesCache ?? new MemoryCache(60);
export const attributeGroupsCache = globalForCache.attributeGroupsCache ?? new MemoryCache(60);
export const ordersCache = globalForCache.ordersCache ?? new MemoryCache(20);
export const userSessionCache = globalForCache.userSessionCache ?? new MemoryCache(60);

if (process.env.NODE_ENV !== 'production') {
  globalForCache.categoryFiltersCache = categoryFiltersCache;
  globalForCache.categoriesListCache = categoriesListCache;
  globalForCache.adminProductsCache = adminProductsCache;
  globalForCache.adminStatsCache = adminStatsCache;
  globalForCache.attributesCache = attributesCache;
  globalForCache.attributeGroupsCache = attributeGroupsCache;
  globalForCache.ordersCache = ordersCache;
  globalForCache.userSessionCache = userSessionCache;
}
