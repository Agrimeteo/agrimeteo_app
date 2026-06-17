import { Router } from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', requirePermission('settings.read'), settingsController.getUserSettings);
router.put('/', requirePermission('settings.update'), settingsController.saveUserSettings);

export default router;
