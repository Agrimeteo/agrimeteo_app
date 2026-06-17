import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import * as permissionService from '../services/permissionService.js';

export const getCurrentUserPermissions = async (req: AuthRequest, res: Response) => {
  if (!req.user?.role) {
    res.status(401).json({ success: false, error: 'User role not available' });
    return;
  }

  try {
    const permissions = await permissionService.getRolePermissions(req.user.role);
    res.json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to load permissions',
    });
  }
};

export const getPermissionsMatrix = async (_req: AuthRequest, res: Response) => {
  try {
    const matrix = await permissionService.getPermissionsMatrix();
    res.json({ success: true, data: matrix });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to load permission matrix',
    });
  }
};

export const updateRolePermissions = async (req: AuthRequest, res: Response) => {
  try {
    const updatedRolePermissions = await permissionService.updateRolePermissions(
      req.params.role,
      req.body?.permissions ?? {},
    );

    res.json({ success: true, data: updatedRolePermissions });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update role permissions',
    });
  }
};
