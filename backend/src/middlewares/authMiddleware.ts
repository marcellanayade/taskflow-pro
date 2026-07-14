import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  //look for token in header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Access denied. Token not provided.' });
    return;
  }

  //remove "Bearer"
  const [, token] = authHeader.split(' ');

  try {
    //get secret key to validate token
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as { id: string, email: string };

    //if valid get id
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
    return;
  }
};