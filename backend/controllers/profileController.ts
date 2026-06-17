import { Request, Response } from 'express';
import * as profileService from '../services/profileService.js';
import storageService from '../services/storageService.js';
import type { AuthenticatedUser } from '../middlewares/authMiddleware.js';
import {
    clearUserNotifications,
    deleteNotification,
    getNotificationCount,
    getUserNotifications,
    markNotificationAsRead,
} from '../services/notificationService.js';

type AuthRequest = Request & { user: AuthenticatedUser };

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const profile = await profileService.getProfile(req.user.id);
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(404).json({ success: false, error: (error as Error).message });
    }
};

export const syncProfile = async (req: AuthRequest, res: Response) => {
    try {
        const metadata = (req.user?.user_metadata ?? {}) as Record<string, unknown>;
        const fullName =
            typeof req.user?.full_name === 'string'
                ? req.user.full_name
                : typeof metadata.full_name === 'string'
                    ? metadata.full_name
                    : null;

        const email =
            typeof req.user?.email === 'string'
                ? req.user.email
                : typeof metadata.email === 'string'
                    ? metadata.email
                    : null;

        const role =
            typeof req.user?.role === 'string'
                ? req.user.role
                : typeof metadata.role === 'string'
                    ? metadata.role
                    : null;

        const profile = await profileService.syncProfile({
            id: req.user.id,
            email,
            full_name: fullName,
            role: role as 'user' | 'beginner' | 'farmer' | 'admin' | null,
        });

        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const result = await profileService.updateProfile(req.user.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const uploadAvatar = async (req: AuthRequest & { file?: Express.Multer.File }, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: 'No avatar file provided' });
            return;
        }

        const uploadResult = await storageService.uploadPlantImage(req.file, req.user.id);
        const result = await profileService.updateAvatar(req.user.id, uploadResult.publicUrl);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const updateProfileLocation = async (req: AuthRequest, res: Response) => {
    try {
        const latitude = Number(req.body?.latitude);
        const longitude = Number(req.body?.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            res.status(400).json({ success: false, error: 'Valid latitude and longitude are required' });
            return;
        }

        const result = await profileService.updateProfileLocationFromCoordinates(req.user.id, latitude, longitude);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const limit = Number(req.query.limit ?? 50);
        const readParam = typeof req.query.read === 'string' ? req.query.read : null;
        const read = readParam === null ? undefined : readParam === 'true';

        const notifications = await getUserNotifications(
            req.user.id,
            Number.isFinite(limit) ? limit : 50,
            read
        );

        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const getNotificationsCount = async (req: AuthRequest, res: Response) => {
    try {
        const count = await getNotificationCount(req.user.id);
        res.json({ success: true, data: { unread: count } });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
    try {
        const notification = await markNotificationAsRead(req.user.id, req.params.notificationId);
        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const removeNotification = async (req: AuthRequest, res: Response) => {
    try {
        await deleteNotification(req.user.id, req.params.notificationId);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const clearNotifications = async (req: AuthRequest, res: Response) => {
    try {
        await clearUserNotifications(req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};
