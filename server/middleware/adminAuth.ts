import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Debes iniciar sesión para acceder a esta función" });
  }

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "No tienes permisos de administrador para realizar esta acción" });
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Debes iniciar sesión para acceder a esta función" });
  }
  next();
}