import express from 'express';
import messageController from '../app/controllers/messageController';
import authMiddleware from '../app/middlewares/authMiddleware';

const router = express.Router();

// Áp dụng middleware xác thực cho tất cả các route
router.use(authMiddleware);

// Lấy danh sách cuộc trò chuyện của người dùng
router.get('/conversations', messageController.getConversations);

// Lấy tin nhắn của một cuộc trò chuyện
router.get('/conversations/:conversationId', messageController.getMessages);

// Gửi tin nhắn mới
router.post('/send', messageController.sendMessage);

// Đánh dấu tin nhắn đã đọc
router.put('/mark-read/:messageId', messageController.markAsRead);

// Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc
router.put('/mark-all-read/:conversationId', messageController.markAllAsRead);

export default router;