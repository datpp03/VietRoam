import { User, Message, Follow } from "../models";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Người dùng kết nối:", socket.id);

    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      lastActive: new Date(),
    });
    io.emit("user_status", { userId: socket.userId, status: "online" });
    const onlineUsersList = Array.from(onlineUsers.keys());
    socket.emit("online_users", onlineUsersList);

    socket.on("private_message", async (data) => {
      try {
        const { receiverId, content, media = [] } = data;
        const senderId = socket.userId;

        if (!senderId || !receiverId) {
          return socket.emit("error", { message: "Thiếu thông tin người gửi hoặc người nhận" });
        }

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
          return socket.emit("error", { message: "ID người nhận không hợp lệ" });
        }

        const followRecord1 = await Follow.findOne({ follower: senderId, following: receiverId });
        const followRecord2 = await Follow.findOne({ follower: receiverId, following: senderId });
        const isMutualFollow = followRecord1 && followRecord2;

        if (!isMutualFollow) {
          return socket.emit("error", { message: "Bạn phải follow lẫn nhau để nhắn tin" });
        }

        const participants = [senderId, receiverId].sort();
        const conversationId = participants.join("_");

        const newMessage = new Message({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          media,
          conversation_id: conversationId,
          is_read: false,
        });

        await newMessage.save();
        await newMessage.populate("sender_id", "full_name profile_picture");

        const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message", newMessage);
        }

        socket.emit("message_sent", newMessage);

        io.to(receiverSocketId).emit("conversation_update", {
          conversation_id: conversationId,
          last_message: {
            content: content || "Đã gửi một media",
            sender_id: senderId,
            createdAt: newMessage.createdAt,
            is_read: false,
          },
        });
      } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        socket.emit("error", { message: "Không thể gửi tin nhắn" });
      }
    });

    socket.on("mark_read", async (data) => {
      try {
        const { messageId } = data;
        const userId = socket.userId;

        const message = await Message.findById(messageId);

        if (!message) {
          return socket.emit("error", { message: "Không tìm thấy tin nhắn" });
        }

        if (message.receiver_id.toString() !== userId) {
          return socket.emit("error", { message: "Không có quyền đánh dấu tin nhắn này" });
        }

        message.is_read = true;
        message.read_at = new Date();
        await message.save();

        const senderSocketId = onlineUsers.get(message.sender_id.toString())?.socketId;
        if (senderSocketId) {
          io.to(senderSocketId).emit("message_read", {
            messageId,
            conversationId: message.conversation_id,
          });
        }
      } catch (error) {
        console.error("Lỗi đánh dấu tin nhắn đã đọc:", error);
        socket.emit("error", { message: "Không thể đánh dấu tin nhắn đã đọc" });
      }
    });

    socket.on("typing", (data) => {
      const { receiverId, isTyping } = data;
      const senderId = socket.userId;

      if (!senderId || !receiverId) return;

      const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", {
          userId: senderId,
          isTyping,
        });
      }
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;

      if (userId) {
        onlineUsers.delete(userId);
        io.emit("user_status", { userId, status: "offline" });
        console.log(`Người dùng ${userId} đã ngắt kết nối`);
      }
    });
  });
};

export default socketHandler;