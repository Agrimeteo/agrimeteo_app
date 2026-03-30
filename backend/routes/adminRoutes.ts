
import { Router } from 'express';
import { 
  getStats,
  getUsers, 
  getCrops, 
  getReports, 
  updateUser, 
  deleteUserAccount, 
  getAdminNotifications,
  createNotification 
} from '../controllers/adminController.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Stats
router.get('/stats', getStats);

// Users management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUserAccount);

// Data management
router.get('/crops', getCrops);
router.get('/reports', getReports);

// Notifications
router.get('/notifications', getAdminNotifications);
router.post('/notifications', createNotification);

export default router;

