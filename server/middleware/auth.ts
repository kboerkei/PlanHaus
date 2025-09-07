import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// Extend Express Request type to include user
export interface RequestWithUser extends Request {
  userId: number;
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
  projectRole?: string;
}

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
export function generateToken(user: { id: number; email: string; username: string; role: string }): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      username: user.username,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Type-safe middleware wrapper
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  return _authenticateUser(req as RequestWithUser, res, next);
}

// Internal authentication function with proper typing
async function _authenticateUser(req: RequestWithUser, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    let userId: number;

    // Check if it's a simple session ID (demo_*)
    if (token.startsWith('demo_')) {
      const session = await storage.getSessionById(token);
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }
      userId = session.userId;
    } else {
      // Try JWT token verification
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      userId = decoded.id;
    }

    // Get user from database to ensure they still exist
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    // Also set userId for backward compatibility
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Project permission middleware
export function checkProjectPermission(requiredRole: 'admin' | 'editor' | 'viewer' = 'viewer') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as RequestWithUser;
    return _checkProjectPermission(requiredRole)(authReq, res, next);
  };
}

// Internal permission check function with proper typing
function _checkProjectPermission(requiredRole: 'admin' | 'editor' | 'viewer' = 'viewer') {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const projectId = parseInt(req.params.projectId || req.body.projectId);
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      // For demo purposes, assume user has admin access to their own projects
      const project = await storage.getWeddingProjectById(projectId);
      if (project && project.createdBy === req.user.id) {
        req.projectRole = 'admin';
        return next();
      }

      // Get user's role in this project
      const userRole = await storage.getUserProjectRole(req.user.id, projectId);
      
      if (!userRole) {
        return res.status(403).json({ error: 'Access denied: Not a collaborator on this project' });
      }

      // Check permission hierarchy: admin > editor > viewer
      const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
      const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ 
          error: `Access denied: ${requiredRole} permission required, you have ${userRole}` 
        });
      }

      req.projectRole = userRole;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

// Admin-only middleware
export const requireAdmin = checkProjectPermission('admin');

// Editor permission middleware (can create/edit content)
export const requireEditor = checkProjectPermission('editor');

// Viewer permission middleware (can view content)
export const requireViewer = checkProjectPermission('viewer');

// Legacy compatibility exports
export const requireAuth = authenticateUser;