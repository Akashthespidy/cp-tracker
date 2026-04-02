/**
 * Shared server-side rate-limiting utility.
 *
 * Each API route can create its own instance with a custom window + max.
 * The limiter tracks request timestamps per IP (in-memory) and rejects
 * calls that exceed the budget.
 */

interface RateLimitEntry {
  timestamps: number[];
}

export function createRateLimiter(windowMs: number, maxRequests: number) {
  const store = new Map<string, RateLimitEntry>();

  /** Clean expired entries every 5 minutes to avoid memory leak */
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, 5 * 60_000);

  return {
    /**
     * Returns `true` if the caller has exceeded the rate limit.
     */
    isLimited(ip: string): boolean {
      const now = Date.now();
      const entry = store.get(ip) ?? { timestamps: [] };
      entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

      if (entry.timestamps.length >= maxRequests) return true;

      entry.timestamps.push(now);
      store.set(ip, entry);
      return false;
    },
  };
}
