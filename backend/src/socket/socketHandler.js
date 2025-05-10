import mongoose from "mongoose";
import { Message, User, Follow } from "../models";
const socketHandler = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("socketHandler: New connection, socketId:", socket.id);

    socket.on("login", (userId) => {
      if (userId) {
        console.log("socketHandler: Login attempt, userId:", userId);
        onlineUsers.set(userId, { socketId: socket.id });
        socket.userId = userId;
        console.log("socketHandler: User logged in:", { userId, socketId: socket.id });
        console.log("socketHandler: Current onlineUsers:", Array.from(onlineUsers.entries()));
        socket.broadcast.emit("user_online", userId);
      } else {
        console.error("socketHandler: Missing or invalid userId in login event");
        socket.emit("error", { message: "Thiếu hoặc không hợp lệ userId" });
      }
    });

    socket.on("private_message", async (data) => {
      console.log("socketHandler: Received private_message data:", data);

      try {
        const { receiverId, content, media = [], tempId } = data;
        const senderId = socket.userId;

        if (!senderId) {
          console.error("socketHandler: Missing senderId, socket.userId not set");
          socket.emit("error", { message: "Thiếu thông tin người gửi, vui lòng đăng nhập lại" });
          return;
        }

        if (!receiverId) {
          console.error("socketHandler: Missing receiverId in data");
          socket.emit("error", { message: "Thiếu thông tin người nhận" });
          return;
        }

        console.log("socketHandler: Processing private_message:", { senderId, receiverId, content, tempId });

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
          console.error("socketHandler: Invalid receiverId:", receiverId);
          socket.emit("error", { message: "ID người nhận không hợp lệ" });
          return;
        }

        const followRecord1 = await Follow.findOne({ follower: senderId, following: receiverId });
        const followRecord2 = await Follow.findOne({ follower: receiverId, following: senderId });
        const isMutualFollow = followRecord1 && followRecord2;

        if (!isMutualFollow) {
          console.error("socketHandler: Not mutual follow:", { senderId, receiverId });
          socket.emit("error", { message: "Bạn phải follow lẫn nhau để nhắn tin" });
          return;
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

        const populatedMessage = await Message.findById(newMessage._id)
          .populate("sender_id", "full_name profile_picture")
          .lean();

        const messageToSend = {
          ...populatedMessage,
          sender_id: populatedMessage.sender_id._id.toString(),
          receiver_id: receiverId.toString(),
          tempId,
        };

        console.log("socketHandler: Prepared messageToSend:", messageToSend);

        const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message", messageToSend);
          console.log("socketHandler: Sent new_message to receiverSocketId:", receiverSocketId);
        } else {
          console.warn("socketHandler: Receiver not online, no socketId found for receiverId:", receiverId);
        }

        socket.emit("message_sent", messageToSend);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("conversation_update", {
            conversation_id: conversationId,
            last_message: {
              content: content || "Đã gửi một media",
              sender_id: senderId,
              createdAt: newMessage.createdAt,
              is_read: false,
            },
          });
          console.log("socketHandler: Sent conversation_update to receiverSocketId:", receiverSocketId);
        }

      } catch (error) {
        console.error("socketHandler: Error sending message:", error);
        socket.emit("error", { message: "Không thể gửi tin nhắn" });
      }
    });

    socket.on("typing", ({ conversationId, isTyping }) => {
      console.log("socketHandler: Received typing event:", { conversationId, isTyping });

      if (!conversationId) {
        console.error("socketHandler: Missing conversationId in typing event");
        socket.emit("error", { message: "Thiếu conversationId" });
        return;
      }

      const userId = socket.userId;
      if (!userId) {
        console.error("socketHandler: Missing userId in typing event, socket.userId not set");
        return;
      }

      const participants = conversationId.split("_");
      const receiverId = participants.find((id) => id !== userId);

      if (!receiverId) {
        console.error("socketHandler: Cannot determine receiverId from conversationId:", conversationId);
        return;
      }

      const receiverSocketId = onlineUsers.get(receiverId)?.socketId;
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { conversationId, userId, isTyping });
        console.log("socketHandler: Sent typing event to receiverSocketId:", receiverSocketId);
      } else {
        console.warn("socketHandler: Receiver not online, no socketId found for receiverId:", receiverId);
      }
    });

    socket.on("mark_read", async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message && !message.is_read) {
          message.is_read = true;
          message.read_at = new Date();
          await message.save();

          const senderId = message.sender_id.toString();
          const senderSocketId = onlineUsers.get(senderId)?.socketId;
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_read", { messageId });
          }
        }
      } catch (error) {
        console.error("socketHandler: Error marking message as read:", error);
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log("socketHandler: User disconnected:", socket.userId);
        console.log("socketHandler: Current onlineUsers:", Array.from(onlineUsers.entries()));
        socket.broadcast.emit("user_offline", socket.userId);
      }
    });
  });
};

module.exports = socketHandler;