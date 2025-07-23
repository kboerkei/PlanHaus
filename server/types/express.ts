import { Request } from "express";

export interface RequestWithUser extends Request {
  userId: number;
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