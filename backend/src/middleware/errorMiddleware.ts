import type { Request, Response, NextFunction } from 'express';

export function notFound(_request: Request, response: Response, next: NextFunction) {
  response.status(404);
  next(new Error('Route not found'));
}

export function errorHandler(error: Error, _request: Request, response: Response, _next: NextFunction) {
  const statusCode = response.statusCode >= 400 ? response.statusCode : 500;
  response.status(statusCode).json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
}
