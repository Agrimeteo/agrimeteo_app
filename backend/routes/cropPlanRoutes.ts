import { Router } from 'express';
import * as cropPlanController from '../controllers/cropPlanController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/:cropId', authMiddleware, cropPlanController.generateCropPlan);
router.get('/', authMiddleware, cropPlanController.getCropPlans);
router.get('/:id/recommendations', authMiddleware, cropPlanController.getCropRecommendations);
router.post('/:id/recommendations/refresh', authMiddleware, cropPlanController.refreshCropRecommendations);
router.get('/:id', authMiddleware, cropPlanController.getCropPlan);
router.patch('/:planId/task/:taskId', authMiddleware, cropPlanController.updateCropPlanTask);

export default router;

