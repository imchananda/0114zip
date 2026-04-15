import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';

// Initialize Redis if the environment variables are available
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Fallback empty rate limiter if variables are missing
 */
const mockRateLimit = {
  limit: async (ip: string) => ({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 10000,
  }),
};

/**
 * General API Limiter: 50 requests per 10 seconds per IP.
 * Used for standard API endpoints like /api/analytics
 */
export const rateLimitAPI = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(50, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit/api',
    })
  : mockRateLimit;

/**
 * Authentication Limiter: Strict limit of 5 requests per 10 seconds.
 * Used for /login, /register, and sensitive auth routes to prevent brute-force attacks.
 */
export const rateLimitAuth = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit/auth',
    })
  : mockRateLimit;
