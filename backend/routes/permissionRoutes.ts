import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getCurrentUserPermissions } from '../controllers/permissionController.js';

const router = Router();

router.use(authMiddleware);
router.get('/me', getCurrentUserPermissions);

export default router;
