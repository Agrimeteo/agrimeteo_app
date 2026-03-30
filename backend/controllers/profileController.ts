import { Request, Response } from 'express';
import * as profileService from '../services/profileService.js';
import storageService from '../services/storageService.js';

type AuthRequest = Request & { user: { id: string } };

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const profile = await profileService.getProfile(req.user.id);
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(404).json({ success: false, error: (error as Error).message });
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
