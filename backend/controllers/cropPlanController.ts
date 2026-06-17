import { Request, Response } from 'express';
import * as cropPlanService from '../services/cropPlanService.js';
import * as recommendationService from '../services/recommendationService.js';

export const generateCropPlan = async (req: Request, res: Response) => {
  try {
    const { cropId } = req.params;
    const plan = await cropPlanService.generateCropPlan(cropId);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getCropPlans = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const plans = await cropPlanService.getCropPlans(userId);
    res.json({ success: true, data: plans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCropPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await cropPlanService.getCropPlan(id);
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateCropPlanTask = async (req: Request, res: Response) => {
  try {
    const { planId, taskId } = req.params;
    const updates = req.body;
    const task = await cropPlanService.updateCropPlanTask(planId, taskId, updates);
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getCropRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const result = await recommendationService.getCropRecommendations(id, userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const refreshCropRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const result = await recommendationService.getCropRecommendations(id, userId, {
      forceRefresh: true,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

