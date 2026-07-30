import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

// Extend Express Request to carry the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: Pick<IUser, '_id' | 'name' | 'email' | 'role'>;
    }
  }
}

interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

const auth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Must be present and follow "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided. Authorization denied.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      _id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    } as unknown as Pick<IUser, '_id' | 'name' | 'email' | 'role'>;

    next();
  } catch {
    // Covers expired, malformed, and signature-mismatch errors
    res.status(401).json({ message: 'Token is invalid or expired. Authorization denied.' });
  }
};

export default auth;
