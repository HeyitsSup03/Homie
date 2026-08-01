import { Request, Response, NextFunction } from 'express';

/**
 * Role guard middleware — restricts a route to users with a specific role.
 * Must be used AFTER the `auth` middleware (which attaches req.user).
 *
 * Usage:
 *   router.post('/', auth, requireRole('owner'), createListing);
 */
const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        message: `Access denied. This endpoint requires the "${role}" role.`,
      });
      return;
    }

    next();
  };
};

export default requireRole;
