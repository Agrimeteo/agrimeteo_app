"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var adminController_1 = require("../controllers/adminController");
var adminMiddleware_1 = require("../middlewares/adminMiddleware");
var authMiddleware_1 = require("../middlewares/authMiddleware");
var router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.use(adminMiddleware_1.adminMiddleware);
// Stats
router.get('/stats', adminController_1.getStats);
// Users management
router.get('/users', adminController_1.getUsers);
router.put('/users/:id', adminController_1.updateUser);
router.delete('/users/:id', adminController_1.deleteUserAccount);
// Data management
router.get('/crops', adminController_1.getCrops);
router.get('/reports', adminController_1.getReports);
// Notifications
router.get('/notifications', adminController_1.getAdminNotifications);
router.post('/notifications', adminController_1.createNotification);
exports.default = router;
