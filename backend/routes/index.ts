import { Router } from 'express';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import cropRoutes from './cropRoutes.js';
import reportRoutes from './reportRoutes.js';
import weatherRoutes from './weatherRoutes.js';
import chatRoutes from './chatRoutes.js';
import adminRoutes from './adminRoutes.js';
import cropPlanRoutes from './cropPlanRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/crops', cropRoutes);
router.use('/reports', reportRoutes);
router.use('/weather', weatherRoutes);
router.use('/chat', chatRoutes);
router.use('/crop-plans', cropPlanRoutes);
router.use('/admin', adminRoutes);

export default router;
