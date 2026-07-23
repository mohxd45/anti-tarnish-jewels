import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Graceful initialization: Only create the Redis client if env vars are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Reusable rate limiters
// 3 requests per IP per minute
export const orderRateLimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
}) : null;

export async function checkRateLimit(
  limiter: Ratelimit | null, 
  identifier: string, 
  criticalRoute: boolean = true
) {
  // If Upstash is not configured
  if (!limiter) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Upstash Redis not configured. Bypassing rate limit for", identifier);
      return { success: true };
    }
    
    // In production, we fail closed for critical routes if asked
    if (criticalRoute) {
      console.error("Upstash Redis is missing in production. Failing closed for security on critical route.");
      return { success: false, error: "Configuration Error: Security features offline." };
    }
    
    // Otherwise fail open
    return { success: true };
  }

  // If configured, enforce rate limit
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);
    return { success, limit, reset, remaining };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    // On connection error, fail closed for security
    return { success: false };
  }
}
