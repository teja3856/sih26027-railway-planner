import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
    department: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required. Please log in to access this resource.',
      },
    });
  }

  jwt.verify(token, env.JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired authentication token. Please re-authenticate.',
        },
      });
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      department: decoded.department,
    };
    next();
  });
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Action requires one of the following roles: [${roles.join(', ')}].`,
        },
      });
    }
    next();
  };
};
