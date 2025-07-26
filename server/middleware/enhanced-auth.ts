import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express";
import { logWarning, logInfo } from "../utils/logger";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Enhanced session storage with expiration and security
interface SecureSession {
  userId: number;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress: string;
  userAgent: string;
  isExpired: () => boolean;
}

export const secureSessions = new Map<string, SecureSession>();

// Session configuration
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_SESSIONS_PER_USER = 5; // Limit concurrent sessions

export function generateSecureSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createSession(
  userId: number, 
  ipAddress: string, 
  userAgent: string
): string {
  const sessionId = generateSecureSessionId();
  
  // Clean up expired sessions for this user
  cleanupExpiredSessions(userId);
  
  // Limit concurrent sessions per user
  const userSessions = Array.from(secureSessions.entries())
    .filter(([_, session]) => session.userId === userId);
  
  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    // Remove oldest session
    const oldestSession = userSessions.reduce((oldest, current) => 
      current[1].createdAt < oldest[1].createdAt ? current : oldest
    );
    secureSessions.delete(oldestSession[0]);
    logInfo('auth', 'Removed oldest session due to limit', { userId });
  }

  const session: SecureSession = {
    userId,
    createdAt: new Date(),
    lastAccessedAt: new Date(),
    ipAddress,
    userAgent,
    isExpired: function() {
      return Date.now() - this.lastAccessedAt.getTime() > SESSION_DURATION;
    }
  };

  secureSessions.set(sessionId, session);
  logInfo('auth', 'New session created', { userId, sessionId: sessionId.substring(0, 8) });
  
  return sessionId;
}

export function validateSession(
  sessionId: string,
  ipAddress: string,
  userAgent: string
): SecureSession | null {
  const session = secureSessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  if (session.isExpired()) {
    secureSessions.delete(sessionId);
    logWarning('auth', 'Session expired and removed', { 
      sessionId: sessionId.substring(0, 8) 
    });
    return null;
  }

  // Optional: Check IP and User-Agent for session hijacking prevention
  // Comment out in development if testing from different devices
  /*
  if (session.ipAddress !== ipAddress || session.userAgent !== userAgent) {
    logWarning('auth', 'Session security mismatch', {
      sessionId: sessionId.substring(0, 8),
      expectedIP: session.ipAddress,
      actualIP: ipAddress
    });
    secureSessions.delete(sessionId);
    return null;
  }
  */

  // Update last accessed time
  session.lastAccessedAt = new Date();
  return session;
}

export function cleanupExpiredSessions(userId?: number) {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, session] of secureSessions.entries()) {
    if (session.isExpired() && (!userId || session.userId === userId)) {
      secureSessions.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logInfo('auth', `Cleaned up ${cleanedCount} expired sessions`, { userId });
  }
}

export function revokeSession(sessionId: string): boolean {
  const deleted = secureSessions.delete(sessionId);
  if (deleted) {
    logInfo('auth', 'Session revoked', { sessionId: sessionId.substring(0, 8) });
  }
  return deleted;
}

export function revokeAllUserSessions(userId: number): number {
  let revokedCount = 0;
  
  for (const [sessionId, session] of secureSessions.entries()) {
    if (session.userId === userId) {
      secureSessions.delete(sessionId);
      revokedCount++;
    }
  }

  logInfo('auth', `Revoked ${revokedCount} sessions for user`, { userId });
  return revokedCount;
}

// Enhanced authentication middleware
export function enhancedRequireAuth(req: RequestWithUser, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const sessionId = authHeader?.replace('Bearer ', '');
  
  if (!sessionId) {
    logWarning('auth', 'Missing authorization header', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'MISSING_AUTH_HEADER'
    });
  }

  const session = validateSession(
    sessionId, 
    req.ip || 'unknown', 
    req.get('User-Agent') || 'unknown'
  );
  
  if (!session) {
    logWarning('auth', 'Invalid or expired session', { 
      ip: req.ip, 
      path: req.path,
      sessionId: sessionId.substring(0, 8) 
    });
    return res.status(401).json({ 
      error: 'Invalid or expired session',
      code: 'INVALID_SESSION'
    });
  }
  
  req.userId = session.userId;
  req.session = session;
  next();
}

// Periodic cleanup of expired sessions
export function startSessionCleanup() {
  setInterval(() => {
    cleanupExpiredSessions();
  }, 60 * 60 * 1000); // Clean up every hour
}

// Get session info for debugging/monitoring
export function getSessionStats() {
  const totalSessions = secureSessions.size;
  const activeSessions = Array.from(secureSessions.values())
    .filter(session => !session.isExpired()).length;
  
  return {
    total: totalSessions,
    active: activeSessions,
    expired: totalSessions - activeSessions
  };
}