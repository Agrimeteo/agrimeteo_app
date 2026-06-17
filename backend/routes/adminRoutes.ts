
import { Router } from 'express';
import { 
  getStats,
  getUsers, 
  getCrops, 
  getReports, 
  getWeatherAlerts,
  getAuditLogs,
  updateUser, 
  deleteUserAccount, 
  getAdminNotifications,
  createNotification 
} from '../controllers/adminController.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';
import {
  getPermissionsMatrix,
  updateRolePermissions,
} from '../controllers/permissionController.js';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Stats
router.get('/stats', getStats);

// Users management
router.get('/users', requirePermission('users.read'), getUsers);
router.put('/users/:id', requirePermission('users.update'), updateUser);
router.delete('/users/:id', requirePermission('users.delete'), deleteUserAccount);

// Data management
router.get('/crops', requirePermission('crops.read'), getCrops);
router.get('/reports', requirePermission('reports.read'), getReports);
router.get('/weather', getWeatherAlerts);
router.get('/permissions', requirePermission('permissions.read'), getPermissionsMatrix);
router.put('/permissions/:role', requirePermission('permissions.update'), updateRolePermissions);
router.get('/audit-logs', getAuditLogs);

// Notifications
router.get('/notifications', getAdminNotifications);
router.post('/notifications', createNotification);

export default router;

