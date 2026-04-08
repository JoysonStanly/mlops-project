import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function protect(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    response.status(401);
    throw new Error('Not authorized');
  }

  const token = header.slice(7);
  try {
    request.user = jwt.verify(token, env.JWT_SECRET) as Request['user'];
    next();
  } catch {
    response.status(401);
    throw new Error('Invalid token');
  }
}
