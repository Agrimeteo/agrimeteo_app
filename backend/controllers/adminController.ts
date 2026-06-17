
import { Request, Response } from 'express';
import {
  getAdminStats,
  getAllUsers,
  getAllCrops,
  getAllReports,
  getAllWeatherAlerts,
  getProfileById,
  updateUserRole,
  deleteUser
} from '../services/adminService.js';
import { getAuditLogs as getAuditLogsService, safeRecordAuditLog } from '../services/auditService.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import {
  getUserNotifications,
  getAdminNotifications as getAdminNotificationsService,
  createAdminNotification
} from '../services/notificationService.js';

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const users = await getAllUsers(page, limit);
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCrops = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const crops = await getAllCrops(page, limit);
    res.json({ success: true, data: crops });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const reports = await getAllReports(page, limit);
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWeatherAlerts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const alerts = await getAllWeatherAlerts(page, limit);
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { role } = req.body;
    const previousUser = await getProfileById(id);
    const user = await updateUserRole(id, role);
    await safeRecordAuditLog({
      actor: authReq.user,
      entityType: 'user',
      entityId: user.id,
      entityLabel: user.full_name || user.email || id,
      action: 'update',
      description: `Updated user ${user.full_name || user.email || id}`,
      details: {
        before: {
          role: previousUser?.role || null,
        },
        after: {
          role: user.role || role,
        },
      },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const previousUser = await getProfileById(id);
    await deleteUser(id);
    await safeRecordAuditLog({
      actor: authReq.user,
      entityType: 'user',
      entityId: id,
      entityLabel: previousUser?.full_name || previousUser?.email || id,
      action: 'delete',
      description: `Deleted user ${previousUser?.full_name || previousUser?.email || id}`,
      details: {
        role: previousUser?.role || null,
        location: previousUser?.location || null,
      },
    });
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.q as string) || '';
    const entityType = (req.query.entityType as string) || 'all';
    const action = (req.query.action as string) || 'all';

    const auditLogs = await getAuditLogsService({
      page,
      limit,
      search,
      entityType: entityType as 'crop' | 'user' | 'report' | 'all',
      action: action as 'create' | 'update' | 'delete' | 'all',
    });

    res.json({ success: true, data: auditLogs.items, pagination: auditLogs.pagination });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const notifications = await getAdminNotificationsService(limit);
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const notification = req.body;
    const result = await createAdminNotification(notification.title, notification.message, notification.type);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

