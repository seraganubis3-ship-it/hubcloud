interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Periodically clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      if (record.resetAt < now) {
        memoryStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
  if (timer && typeof (timer as any).unref === 'function') {
    (timer as any).unref();
  }
}

/**
 * Extracts client IP from request headers (x-forwarded-for, x-real-ip)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Sliding window rate limit checker
 * @param ip Client IP address
 * @param action Distinct endpoint or action name (e.g. 'auth:login')
 * @param maxAllowed Maximum allowed requests in window
 * @param windowSeconds Window length in seconds
 */
export function checkRateLimit(
  ip: string,
  action: string,
  maxAllowed: number,
  windowSeconds: number
): { success: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const key = `${action}:${ip}`;

  const record = memoryStore.get(key);

  if (!record || record.resetAt < now) {
    // New or expired window
    memoryStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      remaining: maxAllowed - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (record.count >= maxAllowed) {
    // Rate limit exceeded
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      success: false,
      remaining: 0,
      resetSeconds,
    };
  }

  // Increment counter
  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return {
    success: true,
    remaining: maxAllowed - record.count,
    resetSeconds,
  };
}
