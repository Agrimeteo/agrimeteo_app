import { Router } from 'express';
import * as cropController from '../controllers/cropController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.post('/', cropController.createCrop as any);
router.get('/', cropController.getCrops as any);
router.get('/:id', cropController.getCrop as any);
router.put('/:id', cropController.updateCrop as any);
router.delete('/:id', cropController.deleteCrop as any);

export default router;
