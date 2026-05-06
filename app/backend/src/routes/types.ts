import type { NextFunction, Request, Response } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export type AuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => unknown;
