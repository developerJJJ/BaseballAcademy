import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
    academyId: number;
  };
}

export const authorize = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Mocking auth for MVP. In real app, extract from JWT
    const userId = req.headers['x-user-id'];
    const academyId = req.headers['x-academy-id'];
    const userRole = req.headers['x-user-role'] as Role;

    if (!userId || !academyId || !userRole) {
      return res.status(401).json({ error: 'Unauthorized: Missing identity headers' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    req.user = {
      id: Number(userId),
      email: 'mock@example.com',
      role: userRole,
      academyId: Number(academyId),
    };

    next();
  };
};
