import { Request, Response, NextFunction } from "express";

// Type for response.end method
type ResponseEnd = Response['end'];
import { logError, logInfo } from "../utils/logger";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 10 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate limiting middleware for OpenAI endpoints
 */
export function createRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests, please try again later",
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Initialize or get existing rate limit data
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    const rateLimit = rateLimitStore[key];

    // Check if rate limit exceeded
    if (rateLimit.count >= max) {
      logInfo('rateLimit', 'Rate limit exceeded', { 
        key, 
        count: rateLimit.count, 
        max, 
        path: req.path 
      });

      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((rateLimit.resetTime - now) / 1000)
      });
    }

    // Increment request count
    rateLimit.count++;

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - rateLimit.count).toString(),
      'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
    });

    // Handle response tracking for rate limiting
    const originalEnd: ResponseEnd = res.end.bind(res);
    res.end = function(chunk?: any, encoding?: any, cb?: any) {
      const statusCode = res.statusCode;

      // Adjust count based on response status if configured
      if (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) {
        rateLimit.count = Math.max(0, rateLimit.count - 1);
      } else if (skipFailedRequests && (statusCode >= 400)) {
        rateLimit.count = Math.max(0, rateLimit.count - 1);
      }

      return originalEnd(chunk, encoding, cb);
    } as ResponseEnd;

    next();
  };
}

/**
 * Specific rate limit configurations for different endpoints
 */
export const aiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes for AI endpoints
  message: "Too many AI requests. Please wait before making more requests.",
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    const userId = (req as any).userId;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  }
});

export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes for general endpoints
  message: "Too many requests. Please slow down.",
  skipSuccessfulRequests: true // Don't count successful requests against limit
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: "Too many login attempts. Please try again later.",
  keyGenerator: (req: Request) => `auth:${req.ip}`
});