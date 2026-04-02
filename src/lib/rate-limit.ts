// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number = 30, windowMs: number = 60000): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const keys = Array.from(rateMap.keys());
    keys.forEach((key) => {
      const entry = rateMap.get(key);
      if (entry && now > entry.resetAt) rateMap.delete(key);
    });
  }, 300000);
}
