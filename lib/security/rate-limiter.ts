/**
 * Rate Limiter
 * Implements token bucket algorithm for API rate limiting
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: "Too many requests, please try again later.",
      ...config,
    };
  }

  /**
   * Check if request should be rate limited
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns Object with allowed status and remaining requests
   */
  check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const record = store.get(identifier);

    // No record or expired window - create new
    if (!record || now > record.resetTime) {
      const resetTime = now + this.config.windowMs;
      store.set(identifier, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Within window - check count
    if (record.count < this.config.maxRequests) {
      record.count++;
      return {
        allowed: true,
        remaining: this.config.maxRequests - record.count,
        resetTime: record.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    store.delete(identifier);
  }
}

/**
 * Predefined rate limiters for different API endpoints
 */
export const rateLimiters = {
  // Authentication endpoints - strict
  auth: new RateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  }),

  // API endpoints - moderate
  api: new RateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "Rate limit exceeded. Please slow down your requests.",
  }),

  // File uploads - restrictive
  upload: new RateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Upload limit reached. Please try again later.",
  }),

  // Email sending - very restrictive
  email: new RateLimiter({
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Email sending limit reached. Please try again later.",
  }),

  // General endpoints - lenient
  general: new RateLimiter({
    maxRequests: 1000,
    windowMs: 60 * 1000, // 1 minute
  }),
};

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = forwardedFor?.split(",")[0] || realIp || cfConnectingIp || "unknown";
  
  return ip;
}
