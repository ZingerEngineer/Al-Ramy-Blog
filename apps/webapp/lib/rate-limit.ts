import { getRamyClient } from '@workspace/services/redis';
import { hash } from '@workspace/utilities';
import { authLogger } from './logger';

/**
 * Atomic fixed-window rate limiter Lua script.
 *
 * Executed server-side on Redis in a single atomic step — no other Redis
 * command can interleave between the INCR and the EXPIRE:
 *
 *   1. Increment the hit counter for this key.
 *   2. If this is the very first hit (count === 1), start the window TTL.
 *      Subsequent hits within the window do NOT reset the TTL.
 *
 * KEYS[1] — the rate-limit Redis key
 * ARGV[1] — window duration in seconds
 * Returns  — current hit count after increment
 */
const FIXED_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
` as const;

/**
 * Check whether a request is within its rate limit.
 *
 * Uses a Redis Lua script for atomic increment + conditional TTL so that:
 * - The window always starts on the first hit and never resets mid-window.
 * - No race condition can create a key without a TTL.
 *
 * Fail-closed: returns { allowed: false } on any Redis error so that
 * a Redis outage cannot be leveraged to bypass rate limiting.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const redis = getRamyClient();
    const count = Number(await redis.eval(FIXED_WINDOW_SCRIPT, 1, key, windowSeconds));

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    if (!allowed) {
      // key is safe to log — it contains a SHA-256 hash, not raw PII.
      authLogger.warn({ ratelimitKey: key, limit }, 'Rate limit exceeded');
    }

    return { allowed, remaining };
  } catch (error) {
    // Fail-closed: deny on Redis failure to prevent brute-force bypass.
    authLogger.error({ err: error }, 'Rate limit check failed');
    return { allowed: false, remaining: 0 };
  }
}

/**
 * Rate limit configurations for password-related actions.
 * windowSeconds matches the checkRateLimit parameter name exactly.
 */
export const RATE_LIMITS = {
  PASSWORD_RESET_REQUEST: {
    limit: 3,
    windowSeconds: 3600, // 3 requests per hour
  },
  PASSWORD_CHANGE: {
    limit: 5,
    windowSeconds: 3600, // 5 changes per hour
  },
  PASSWORD_RESET: {
    limit: 5,
    windowSeconds: 3600, // 5 reset attempts per hour
  },
} as const;

/** Rate limit key for password reset requests — keyed by hashed email. */
export const getPasswordResetRequestKey = (email: string): string =>
  `rate-limit:password-reset-request:${hash(email)}`;

/** Rate limit key for password changes — keyed by hashed userId. */
export const getPasswordChangeKey = (userId: string): string =>
  `rate-limit:password-change:${hash(userId)}`;

/** Rate limit key for password reset token attempts — keyed by hashed token. */
export const getPasswordResetKey = (token: string): string =>
  `rate-limit:password-reset:${hash(token)}`;
