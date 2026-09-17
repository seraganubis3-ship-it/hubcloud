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

/**
 * Distributed Rate Limiting via Upstash Redis REST API.
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in .env,
 * rate limiting is globally shared across all serverless/edge instances on Vercel.
 * If not configured, gracefully falls back to the in-memory sliding window.
 */
export async function checkDistributedRateLimit(
  ip: string,
  action: string,
  maxAllowed: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; resetSeconds: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Graceful fallback to in-memory sliding window
    return checkRateLimit(ip, action, maxAllowed, windowSeconds);
  }

  const key = `ratelimit:${action}:${ip}`;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['TTL', key],
      ]),
      cache: 'no-store',
    });

    const results = await res.json();
    const count = Number(results[0]?.result || 1);
    let ttl = Number(results[1]?.result || windowSeconds);

    if (ttl === -1 || count === 1) {
      await fetch(`${url}/expire/${key}/${windowSeconds}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      ttl = windowSeconds;
    }

    if (count > maxAllowed) {
      return {
        success: false,
        remaining: 0,
        resetSeconds: Math.max(1, ttl),
      };
    }

    return {
      success: true,
      remaining: Math.max(0, maxAllowed - count),
      resetSeconds: Math.max(1, ttl),
    };
  } catch (err) {
    console.warn('[RateLimit] Upstash Redis call failed, using in-memory fallback:', err);
    return checkRateLimit(ip, action, maxAllowed, windowSeconds);
  }
}
