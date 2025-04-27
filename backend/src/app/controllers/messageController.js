import { Message, User } from '../../models';
import mongoose from 'mongoose';

class MessageController {
  // Lấy danh sách cuộc trò chuyện của người dùng
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      
      // Tìm tất cả tin nhắn mà người dùng là người gửi hoặc người nhận
      const messages = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender_id: mongoose.Types.ObjectId(userId) },
              { receiver_id: mongoose.Types.ObjectId(userId) }
            ]
          }
        },
        // Nhóm theo conversation_id và lấy tin nhắn mới nhất
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: "$conversation_id",
            last_message: { $first: "$$ROOT" },
            messages: { $push: "$$ROOT" }
          }
        },
        // Lấy thông tin cuộc trò chuyện
        {
          $project: {
            _id: 1,
            conversation_id: "$_id",
            last_message: 1,
            unread_count: {
              $size: {
                $filter: {
                  input: "$messages",
                  as: "message",
                  cond: {
                    $and: [
                      { $eq: ["$$message.receiver_id", mongoose.Types.ObjectId(userId)] },
                      { $eq: ["$$message.is_read", false] }
                    ]
                  }
                }
              }
            }
          }
        },
        { $sort: { "last_message.createdAt": -1 } }
      ]);
      
      // Lấy danh sách ID người dùng từ các cuộc trò chuyện
      const userIds = new Set();
      messages.forEach(conv => {
        const participants = conv.conversation_id.split('_');
        participants.forEach(id => userIds.add(id));
      });
      
      // Lấy thông tin người dùng
      const users = await User.find({ _id: { $in: Array.from(userIds) } })
        .select('_id full_name profile_picture');
      
      // Chuyển đổi mảng users thành object để dễ truy cập
      const usersMap = {};
      users.forEach(user => {
        usersMap[user._id] = user;
      });
      
      // Định dạng lại kết quả
      const conversations = messages.map(conv => {
        const participants = conv.conversation_id.split('_');
        
        return {
          _id: conv._id,
          conversation_id: conv.conversation_id,
          participants,
          last_message: {
            content: conv.last_message.content,
            sender_id: conv.last_message.sender_id,
            createdAt: conv.last_message.createdAt,
            is_read: conv.last_message.is_read
          },
          unread_count: conv.unread_count
        };
      });
      
      res.json({
        success: true,
        conversations,
        users: usersMap
      });
    } catch (error) {
      console.error('Lỗi lấy danh sách cuộc trò chuyện:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách cuộc trò chuyện',
        error: error.message
      });
    }
  }
  
  // Lấy tin nhắn của một cuộc trò chuyện
  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      
      // Kiểm tra xem người dùng có phải là thành viên của cuộc trò chuyện không
      const participants = conversationId.split('_');
      if (!participants.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập cuộc trò chuyện này'
        });
      }
      
      // Lấy tin nhắn của cuộc trò chuyện
      const messages = await Message.find({ conversation_id: conversationId })
        .sort({ createdAt: 1 })
        .populate('sender_id', 'full_name profile_picture');
      
      // Đánh dấu tất cả tin nhắn chưa đọc là đã đọc (nếu người dùng là người nhận)
      await Message.updateMany(
        { 
          conversation_id: conversationId,
          receiver_id: userId,
          is_read: false
        },
        { 
          is_read: true,
          read_at: new Date()
        }
      );
      
      res.json({
        success: true,
        messages
      });
    } catch (error) {
      console.error('Lỗi lấy tin nhắn:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể lấy tin nhắn',
        error: error.message
      });
    }
  }
  
  // Gửi tin nhắn mới (API dự phòng nếu không dùng Socket.IO)
  async sendMessage(req, res) {
    try {
      const { receiverId, content, media } = req.body;
      const senderId = req.user.id;
      
      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin người nhận'
        });
      }
      
      if (!content && (!media || media.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Tin nhắn không được để trống'
        });
      }
      
      // Tạo conversation_id từ ID của 2 người dùng (sắp xếp để đảm bảo tính nhất quán)
      const participants = [senderId, receiverId].sort();
      const conversationId = participants.join('_');
      
      // Lưu tin nhắn vào database
      const newMessage = new Message({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        media: media || [],
        conversation_id: conversationId,
        is_read: false
      });
      
      await newMessage.save();
      
      // Populate thông tin người gửi
      await newMessage.populate('sender_id', 'full_name profile_picture');
      
      res.status(201).json({
        success: true,
        message: newMessage
      });
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể gửi tin nhắn',
        error: error.message
      });
    }
  }
  
  // Đánh dấu tin nhắn đã đọc (API dự phòng nếu không dùng Socket.IO)
  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;
      
      const message = await Message.findById(messageId);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin nhắn'
        });
      }
      
      // Chỉ người nhận mới có thể đánh dấu tin nhắn đã đọc
      if (message.receiver_id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền đánh dấu tin nhắn này'
        });
      }
      
      message.is_read = true;
      message.read_at = new Date();
      await message.save();
      
      res.json({
        success: true,
        message: 'Đã đánh dấu tin nhắn là đã đọc'
      });
    } catch (error) {
      console.error('Lỗi đánh dấu tin nhắn đã đọc:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể đánh dấu tin nhắn đã đọc',
        error: error.message
      });
    }
  }
  
  // Đánh dấu tất cả tin nhắn trong cuộc trò chuyện là đã đọc
  async markAllAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      
      // Kiểm tra xem người dùng có phải là thành viên của cuộc trò chuyện không
      const participants = conversationId.split('_');
      if (!participants.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập cuộc trò chuyện này'
        });
      }
      
      // Đánh dấu tất cả tin nhắn chưa đọc là đã đọc (nếu người dùng là người nhận)
      const result = await Message.updateMany(
        { 
          conversation_id: conversationId,
          receiver_id: userId,
          is_read: false
        },
        { 
          is_read: true,
          read_at: new Date()
        }
      );
      
      res.json({
        success: true,
        message: `Đã đánh dấu ${result.nModified} tin nhắn là đã đọc`
      });
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả tin nhắn đã đọc:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể đánh dấu tất cả tin nhắn đã đọc',
        error: error.message
      });
    }
  }
}

export default new MessageController();