import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express";
import { checkRateLimit } from "../utils/validation";
import { logWarning } from "../utils/logger";

export function aiRateLimit(maxRequests: number = 5, windowMs: number = 300000) { // 5 requests per 5 minutes
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    const key = `ai_${req.userId || req.ip}`;
    const { allowed, remaining } = checkRateLimit(key, maxRequests, windowMs);
    
    if (!allowed) {
      logWarning('ai-rate-limit', 'Rate limit exceeded', { 
        userId: req.userId, 
        ip: req.ip, 
        path: req.path 
      });
      
      return res.status(429).json({
        message: "Too many AI requests. Please try again later.",
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    next();
  };
}

export function validateOpenAIKey(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!(apiKey && apiKey.startsWith('sk-') && apiKey.length > 20);
}