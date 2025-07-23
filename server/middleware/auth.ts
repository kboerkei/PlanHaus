import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express";
import { logWarning } from "../utils/logger";

// Simple session storage for demo purposes
export const sessions = new Map<string, { userId: number }>();

export function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function requireAuth(req: RequestWithUser, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    logWarning('auth', 'Unauthorized access attempt', { 
      ip: req.ip, 
      path: req.path,
      sessionId: sessionId?.substring(0, 8) + '...' 
    });
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  req.userId = sessions.get(sessionId)!.userId;
  next();
}

export function optionalAuth(req: RequestWithUser, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (sessionId && sessions.has(sessionId)) {
    req.userId = sessions.get(sessionId)!.userId;
  }
  
  next();
}