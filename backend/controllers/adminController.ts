
import { Request, Response } from 'express';
import {
  getAdminStats,
  getAllUsers,
  getAllCrops,
  getAllReports,
  updateUserRole,
  deleteUser
} from '../services/adminService.js';
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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await updateUserRole(id, role);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.json({ success: true, message: 'User deleted' });
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

