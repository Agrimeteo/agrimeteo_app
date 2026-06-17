import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/', requirePermission('reports.create'), upload.single('image'), reportController.createReport as any);

export default router;
