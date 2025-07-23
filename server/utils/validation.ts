import { z } from "zod";

// Input sanitization helper
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Sanitize object recursively
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Validation middleware creator
export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: any, res: any, next: any) => {
    try {
      const sanitizedBody = sanitizeObject(req.body);
      req.body = schema.parse(sanitizedBody);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(400).json({ message: "Invalid request data" });
    }
  };
}