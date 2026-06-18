import { Request, Response } from 'express';
import * as chatService from '../services/chatService.js';

type AuthRequest = Request & { user: { id: string } };

export const getHistory = async (req: AuthRequest, res: Response) => {
    try {
        const result = await chatService.getChatHistory(req.user.id);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const sendChat = async (req: AuthRequest, res: Response) => {
    try {
        const { message } = req.body;
        if (!message) throw new Error('Message required');
        const result = await chatService.sendChat(req.user.id, message);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const diagnosePlant = async (req: AuthRequest, res: Response) => {
    try {
        const { image, description } = req.body;

        if (!image) {
            throw new Error('Plant image is required');
        }

        const result = await chatService.diagnosePlant(req.user.id, image, description);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

