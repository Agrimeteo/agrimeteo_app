import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.use(authMiddleware);
router.post('/sync', profileController.syncProfile as any);
router.post('/location', profileController.updateProfileLocation as any);
router.get('/notifications', profileController.getNotifications as any);
router.get('/notifications/count', profileController.getNotificationsCount as any);
router.patch('/notifications/:notificationId/read', profileController.markNotificationRead as any);
router.delete('/notifications/:notificationId', profileController.removeNotification as any);
router.delete('/notifications', profileController.clearNotifications as any);
router.get('/', profileController.getProfile as any);
router.put('/', profileController.updateProfile as any);
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar as any);

export default router;
