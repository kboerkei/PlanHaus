import { rateLimit } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
// Simple logging functions (replace with actual logger if available)
const logError = (context: string, error: Error, metadata?: any) => {
  console.error(`[${context.toUpperCase()}] ${error.message}`, metadata);
};

const logInfo = (context: string, message: string, metadata?: any) => {
  console.info(`[${context.toUpperCase()}] ${message}`, metadata);
};

// Rate limiting configurations for different endpoint types
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logError('rate-limit', new Error('Auth rate limit exceeded'), { 
      ip: req.ip, 
      endpoint: req.path 
    });
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  }
});

export const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 AI requests per window
  message: {
    error: 'AI service rate limit exceeded. Please wait before making more requests.',
    resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logError('rate-limit', new Error('AI rate limit exceeded'), { 
      ip: req.ip, 
      endpoint: req.path 
    });
    res.status(429).json({
      error: 'AI service rate limit exceeded. Please wait before making more requests.',
      resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  }
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests. Please slow down.',
    resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for successful requests to reduce overhead
    return req.method === 'GET' && !req.path.startsWith('/api/ai');
  },
  handler: (req: Request, res: Response) => {
    logInfo('rate-limit', 'General rate limit exceeded', { 
      ip: req.ip, 
      endpoint: req.path 
    });
    res.status(429).json({
      error: 'Too many requests. Please slow down.',
      resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  }
});

// User-specific rate limiting using session or IP as fallback
const userRateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function createUserRateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract user ID from session or use IP as fallback
    const sessionId = req.cookies?.sessionId || req.headers.authorization?.replace('Bearer ', '');
    const identifier = sessionId || req.ip || 'unknown';
    
    const now = Date.now();
    const userLimit = userRateLimitStore.get(identifier);
    
    // Reset if window has passed
    if (!userLimit || now > userLimit.resetTime) {
      userRateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    // Check if limit exceeded
    if (userLimit.count >= maxRequests) {
      logError('rate-limit', new Error('User rate limit exceeded'), { 
        identifier, 
        endpoint: req.path,
        count: userLimit.count 
      });
      
      return res.status(429).json({
        error: 'Rate limit exceeded for this account. Please wait before making more requests.',
        resetTime: new Date(userLimit.resetTime).toISOString(),
        remainingTime: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }
    
    // Increment counter
    userLimit.count++;
    userRateLimitStore.set(identifier, userLimit);
    
    // Set headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - userLimit.count).toString(),
      'X-RateLimit-Reset': new Date(userLimit.resetTime).toISOString()
    });
    
    next();
  };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(userRateLimitStore.entries());
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      userRateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes