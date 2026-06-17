import type { NextFunction, Response } from 'express';
import type { AuthRequest } from './authMiddleware.js';
import { roleHasPermission } from '../services/permissionService.js';
import type { PermissionCode } from '../types/permission.js';

// Security workflow:
// 1. authMiddleware resolves the current authenticated user and role.
// 2. requirePermission checks the role against Supabase-backed permission rules.
// 3. Sensitive handlers only execute when both auth and permission checks pass.
export const requirePermission = (permissionCode: PermissionCode) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const allowed = await roleHasPermission(req.user.role, permissionCode);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: `Missing permission: ${permissionCode}`,
      });
    }

    next();
  };
};
