import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../types/express';
import { sessions } from './auth';
import { logWarning, logInfo } from '../utils/logger';

export function setSecureCookie(res: Response, sessionId: string) {
  res.cookie('sessionId', sessionId, {
    httpOnly: true, // Prevent XSS access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
}

export function clearSecureCookie(res: Response) {
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

export function requireAuthCookie(req: Request & Partial<RequestWithUser>, res: Response, next: NextFunction) {
  // Check for session in cookies first, fallback to Authorization header
  const sessionId = req.cookies?.sessionId || req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId) {
    logWarning('auth', 'No session found in cookies or headers', { 
      ip: req.ip, 
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'NO_SESSION'
    });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    logWarning('auth', 'Invalid session', { 
      ip: req.ip, 
      path: req.path,
      sessionId: sessionId.substring(0, 8)
    });
    
    // Clear invalid cookie
    clearSecureCookie(res);
    
    return res.status(401).json({ 
      error: 'Invalid or expired session',
      code: 'INVALID_SESSION'
    });
  }

  req.userId = session.userId;
  logInfo('auth', 'Session authenticated', { 
    userId: session.userId,
    sessionId: sessionId.substring(0, 8)
  });
  
  next();
}