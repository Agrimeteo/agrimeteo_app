import { Router } from 'express';
import * as cropController from '../controllers/cropController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/types', cropController.getCropTypes as any);
router.post('/', requirePermission('crops.create'), cropController.createCrop as any);
router.get('/', requirePermission('crops.read'), cropController.getCrops as any);
router.get('/:id', requirePermission('crops.read'), cropController.getCrop as any);
router.put('/:id', requirePermission('crops.update'), cropController.updateCrop as any);
router.delete('/:id', requirePermission('crops.delete'), cropController.deleteCrop as any);

export default router;
