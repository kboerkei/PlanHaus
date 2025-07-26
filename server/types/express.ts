import { Request } from "express";

export interface RequestWithUser extends Request {
  userId: number;
  session?: {
    userId: number;
    createdAt: Date;
    lastAccessedAt: Date;
    ipAddress: string;
    userAgent: string;
    isExpired: () => boolean;
  };
}

export interface AuthenticatedRequest extends Request {
  userId: number;
  user?: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
}