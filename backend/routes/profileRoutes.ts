import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.use(authMiddleware);
router.get('/', profileController.getProfile as any);
router.put('/', profileController.updateProfile as any);
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar as any);

export default router;
