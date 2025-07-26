import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';

// Input sanitization schemas
export const sanitizeSchema = z.object({
  // Basic string sanitization - remove potential XSS
  text: z.string().transform(str => 
    str.replace(/[<>'"]/g, '').trim().slice(0, 1000)
  ),
  email: z.string().email().toLowerCase(),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/).optional(),
  url: z.string().url().optional(),
});

// Rate limiting configurations
export const createRateLimit = (windowMs: number, max: number, message: string) => 
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // Use user ID if available, fallback to IP
    keyGenerator: (req: any) => req.userId?.toString() || req.ip,
  });

// API rate limits
export const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many API requests, please try again later'
);

export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes  
  5, // 5 login attempts per window
  'Too many authentication attempts, please try again later'
);

export const aiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 AI requests per window
  'Too many AI requests, please try again later'
);

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for some features
});

// Input validation middleware
export function validateInput(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid input',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

// CSRF protection (simple token-based for demo)
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip for GET requests and auth endpoints
  if (req.method === 'GET' || req.path.startsWith('/api/auth/')) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  // Simple CSRF check - in production, use proper CSRF tokens
  if (!csrfToken || csrfToken !== `csrf-${sessionToken?.substring(0, 8)}`) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}

// SQL injection prevention (redundant with Drizzle ORM, but good practice)
export function preventSQLInjection(req: Request, res: Response, next: NextFunction) {
  const suspiciousPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b)/i,
    /(\bUNION\b|\bOR\b\s+\d+\s*=\s*\d+|\bAND\b\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/|;|'|")/
  ];

  const checkForSQLInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForSQLInjection);
    }
    return false;
  };

  if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query)) {
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
}