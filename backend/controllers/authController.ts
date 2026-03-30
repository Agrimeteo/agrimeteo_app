import { Request, Response } from 'express';
import * as authService from '../services/authService.js';

export const register = async (req: Request, res: Response) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await authService.login(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const result = await authService.getMe(req.headers.authorization!.split(' ')[1]);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(401).json({ success: false, error: (error as Error).message });
    }};
    
