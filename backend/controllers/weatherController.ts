import { Response } from 'express';
import * as weatherService from '../services/weatherService.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export const getWeather = async (req: AuthRequest, res: Response) => {
  try {
    const weather = await weatherService.getWeatherOverview(req.user!.id);
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getWeatherAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await weatherService.getWeatherAlerts(req.user!.id);
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
