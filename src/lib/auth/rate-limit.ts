/**
 * Simple in-memory rate limiter for serverless environments.
 * In production, consider using upstash/ratelimit or Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const configs: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  forgotPassword: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  checkout: { maxAttempts: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
  contact: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
};

export function checkRateLimit(
  identifier: string,
  action: keyof typeof configs
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = configs[action];
  if (!config) return { allowed: true, remaining: 999, resetAt: 0 };

  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxAttempts - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxAttempts - entry.count, resetAt: entry.resetAt };
}
