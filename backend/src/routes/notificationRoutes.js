import express from 'express';
import notificationController from '../app/controllers/notificationController.js';
import authMiddleware from '../app/middlewares/authMiddleware.js';

const router = express.Router();

router.get('/notifications/:myId', authMiddleware, notificationController.getNotifications);
router.patch('/notifications/:myId/:notificationId/read', authMiddleware, notificationController.markAsRead);
router.patch('/notifications/:myId/read-all', authMiddleware, notificationController.markAllAsRead);

export default router;