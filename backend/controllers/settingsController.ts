import type { Response } from 'express';
import * as settingsService from '../services/settingsService.js';
import type { AuthRequest } from '../types/express.js';

const getStatusCode = (error: unknown, fallback = 400) => {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === 'number') {
      return statusCode;
    }
  }

  return fallback;
};

export const getUserSettings = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ success: false, error: 'User not authenticated' });
    return;
  }

  try {
    const settings = await settingsService.getUserSettings(req.user.id);
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to load settings',
    });
  }
};

export const saveUserSettings = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ success: false, error: 'User not authenticated' });
    return;
  }

  try {
    const settings = await settingsService.saveUserSettings(req.user.id, req.body ?? {});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(getStatusCode(error)).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unable to save settings',
    });
  }
};
