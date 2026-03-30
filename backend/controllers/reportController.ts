import { Request, Response } from 'express';
import * as reportService from '../services/reportService.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

type AuthRequest = Request & { user: { id: string } };

export const createReport = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) throw new Error('No image uploaded');
        const report = await reportService.createReport(req.user.id, req.file, req.body.description);
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

// Use with upload.single('image') in route
