import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProd = env.NODE_ENV === 'production';

  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'),
      message: isProd && statusCode === 500 ? 'An internal server error occurred' : err.message || 'Internal Server Error',
      ...(isProd ? {} : { stack: err.stack }),
    },
  });
};
