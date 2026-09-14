import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { verifyToken } from '../utils/jwt';
import { AuthRequest } from '../types/auth.types';

// validation.middleware.ts
export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors },
      });
    } else {
      next(error);
    }
  }
};

// error.middleware.ts
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  console.error('[Error]:', err);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong on the server' },
  });
};

// auth.middleware.ts
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized', 'MISSING_TOKEN'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN'));
  }
};

// role.middleware.ts
export const requireRole = (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError(401, 'Unauthorized', 'NO_SESSION'));
  }
  if (req.user.role !== role) {
    return next(new AppError(403, 'Forbidden', 'INSUFFICIENT_ROLES'));
  }
  next();
};
