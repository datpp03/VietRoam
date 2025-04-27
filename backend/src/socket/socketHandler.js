import { User, Message } from '../models';
import mongoose from 'mongoose';

// Lưu trữ danh sách người dùng trực tuyến
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Người dùng kết nối:', socket.id);
    
    // Xử lý sự kiện đăng nhập
    socket.on('login', async (userId) => {
      try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return socket.emit('error', { message: 'ID người dùng không hợp lệ' });
        }
        
        // Lưu thông tin người dùng vào danh sách online
        onlineUsers.set(userId, {
          socketId: socket.id,
          userId: userId,
          lastActive: new Date()
        });
        
        // Lưu userId vào socket để dễ dàng truy cập sau này
        socket.userId = userId;
        
        // Thông báo cho tất cả người dùng biết người này đã online
        io.emit('user_status', { userId, status: 'online' });
        
        console.log(`Người dùng ${userId} đã đăng nhập`);
        
        // Gửi danh sách người dùng online cho client
        const onlineUsersList = Array.from(onlineUsers.keys());
        socket.emit('online_users', onlineUsersList);
      } catch (error) {
        console.error('Lỗi đăng nhập socket:', error);
        socket.emit('error', { message: 'Lỗi đăng nhập' });
      }
    });
    
    // Xử lý sự kiện gửi tin nhắn riêng tư
    socket.on('private_message', async (data) => {
      try {
        const { receiverId, content, media = [] } = data;
        const senderId = socket.userId;
        
        if (!senderId || !receiverId) {
          return socket.emit('error', { message: 'Thiếu thông tin người gửi hoặc người nhận' });
        }
        
        // Tạo conversation_id từ ID của 2 người dùng (sắp xếp để đảm bảo tính nhất quán)
        const participants = [senderId, receiverId].sort();
        const conversationId = participants.join('_');
        
        // Lưu tin nhắn vào database
        const newMessage = new Message({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          media,
          conversation_id: conversationId,
          is_read: false
        });
        
        await newMessage.save();
        
        // Populate thông tin người gửi
        await newMessage.populate('sender_id', 'full_name profile_picture');
        
        // Gửi tin nhắn đến người nhận nếu họ đang online
        const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', newMessage);
        }
        
        // Gửi xác nhận tin nhắn đã được gửi về cho người gửi
        socket.emit('message_sent', newMessage);
        
        // Cập nhật trạng thái cuộc trò chuyện
        io.to(receiverSocketId).emit('conversation_update', {
          conversation_id: conversationId,
          last_message: {
            content: content || 'Đã gửi một media',
            sender_id: senderId,
            createdAt: newMessage.createdAt,
            is_read: false
          }
        });
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
        socket.emit('error', { message: 'Không thể gửi tin nhắn' });
      }
    });
    
    // Xử lý sự kiện đánh dấu tin nhắn đã đọc
    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;
        const userId = socket.userId;
        
        // Cập nhật trạng thái tin nhắn
        const message = await Message.findById(messageId);
        
        if (!message) {
          return socket.emit('error', { message: 'Không tìm thấy tin nhắn' });
        }
        
        // Chỉ người nhận mới có thể đánh dấu tin nhắn đã đọc
        if (message.receiver_id.toString() !== userId) {
          return socket.emit('error', { message: 'Không có quyền đánh dấu tin nhắn này' });
        }
        
        message.is_read = true;
        message.read_at = new Date();
        await message.save();
        
        // Thông báo cho người gửi biết tin nhắn đã được đọc
        const senderSocketId = onlineUsers.get(message.sender_id.toString())?.socketId;
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_read', {
            messageId,
            conversationId: message.conversation_id
          });
        }
      } catch (error) {
        console.error('Lỗi đánh dấu tin nhắn đã đọc:', error);
        socket.emit('error', { message: 'Không thể đánh dấu tin nhắn đã đọc' });
      }
    });
    
    // Xử lý sự kiện đang nhập
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const senderId = socket.userId;
      
      if (!senderId || !receiverId) return;
      
      // Gửi trạng thái đang nhập đến người nhận
      const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: senderId,
          isTyping
        });
      }
    });
    
    // Xử lý sự kiện ngắt kết nối
    socket.on('disconnect', () => {
      const userId = socket.userId;
      
      if (userId) {
        // Xóa người dùng khỏi danh sách online
        onlineUsers.delete(userId);
        
        // Thông báo cho tất cả người dùng biết người này đã offline
        io.emit('user_status', { userId, status: 'offline' });
        
        console.log(`Người dùng ${userId} đã ngắt kết nối`);
      }
    });
  });
};

export default socketHandler;