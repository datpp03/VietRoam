import { Message, User, Follow } from "../../models";
import mongoose from "mongoose";

// console.log("Follow model:", Follow); // Debug Follow

class MessageController {
  async getConversations(req, res) {
    try {
      // console.log("getConversations: req.user:", req.user);
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      if (!Follow) {
        console.error("Follow model is undefined");
        return res.status(500).json({ success: false, message: "Internal server error: Follow model not found" });
      }

      const following = await Follow.find({ follower: userId }).select("following");
      // console.log("getConversations: following:", following);
      const followingIds = following.map((f) => f.following);

      const mutualFollowers = await Follow.find({
        follower: { $in: followingIds },
        following: userId,
      }).select("follower");
      // console.log("getConversations: mutualFollowers:", mutualFollowers);

      const mutualFollowerIds = mutualFollowers.map((f) => f.follower);

      const messages = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender_id: new mongoose.Types.ObjectId(userId) },
              { receiver_id: new mongoose.Types.ObjectId(userId) },
            ],
            $and: [
              {
                $or: [
                  { sender_id: { $in: mutualFollowerIds } },
                  { receiver_id: { $in: mutualFollowerIds } },
                ],
              },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$conversation_id",
            last_message: { $first: "$$ROOT" },
            messages: { $push: "$$ROOT" },
          },
        },
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
                      { $eq: ["$$message.receiver_id", new mongoose.Types.ObjectId(userId)] },
                      { $eq: ["$$message.is_read", false] },
                    ],
                  },
                },
              },
            },
          },
        },
        { $sort: { "last_message.createdAt": -1 } },
      ]);

      // console.log("getConversations: Raw messages:", messages);

      const userIds = new Set();
      messages.forEach((conv) => {
        if (!conv.conversation_id || typeof conv.conversation_id !== "string") {
          console.error("Invalid conversation_id:", conv);
          return;
        }
        const participants = conv.conversation_id.split("_");
        if (participants.length !== 2 || !participants.every(id => mongoose.Types.ObjectId.isValid(id))) {
          console.error("Invalid participants in conversation_id:", conv.conversation_id);
          return;
        }
        participants.forEach((id) => userIds.add(id));
      });

      const users = await User.find({ _id: { $in: Array.from(userIds) } }).select("_id full_name profile_picture");
      // console.log("getConversations: users:", users);

      const usersMap = {};
      users.forEach((user) => {
        usersMap[user._id] = user;
      });

      const conversations = messages
        .filter(conv => conv.conversation_id && typeof conv.conversation_id === "string")
        .map((conv) => {
          const participants = conv.conversation_id.split("_");
          return {
            _id: conv._id,
            conversation_id: conv.conversation_id,
            participants,
            last_message: {
              content: conv.last_message?.content || "Đã gửi một media",
              sender_id: conv.last_message?.sender_id,
              createdAt: conv.last_message?.createdAt,
              is_read: conv.last_message?.is_read,
            },
            unread_count: conv.unread_count,
          };
        });

      res.json({
        success: true,
        conversations,
        users: usersMap,
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách cuộc trò chuyện:", error);
      res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách cuộc trò chuyện",
        error: error.message,
      });
    }
  }

  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }

      const participants = conversationId.split("_");
      if (!participants.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập cuộc trò chuyện này",
        });
      }

      const otherUserId = participants.find((id) => id !== userId);
      const followRecord1 = await Follow.findOne({ follower: userId, following: otherUserId });
      const followRecord2 = await Follow.findOne({ follower: otherUserId, following: userId });
      const isMutualFollow = followRecord1 && followRecord2;

      const messages = await Message.find({ conversation_id: conversationId })
        .sort({ createdAt: 1 })
        .populate("sender_id", "full_name profile_picture");

      await Message.updateMany(
        {
          conversation_id: conversationId,
          receiver_id: userId,
          is_read: false,
        },
        {
          is_read: true,
          read_at: new Date(),
        }
      );

      res.json({
        success: true,
        messages,
        isMutualFollow,
      });
    } catch (error) {
      console.error("Lỗi lấy tin nhắn:", error);
      res.status(500).json({
        success: false,
        message: "Không thể lấy tin nhắn",
        error: error.message,
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const { receiverId, content, media } = req.body;
      const senderId = req.user.id;

      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin người nhận",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({
          success: false,
          message: "ID người nhận không hợp lệ",
        });
      }

      if (!content && (!media || media.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "Tin nhắn không được để trống",
        });
      }

      const followRecord1 = await Follow.findOne({ follower: senderId, following: receiverId });
      const followRecord2 = await Follow.findOne({ follower: receiverId, following: senderId });
      const isMutualFollow = followRecord1 && followRecord2;

      if (!isMutualFollow) {
        return res.status(403).json({
          success: false,
          message: "Bạn phải follow lẫn nhau để nhắn tin",
        });
      }

      const participants = [senderId, receiverId].sort();
      const conversationId = participants.join("_");

      const newMessage = new Message({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        media: media || [],
        conversation_id: conversationId,
        is_read: false,
      });

      await newMessage.save();
      await newMessage.populate("sender_id", "full_name profile_picture");

      res.status(201).json({
        success: true,
        message: newMessage,
      });
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      res.status(500).json({
        success: false,
        message: "Không thể gửi tin nhắn",
        error: error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy tin nhắn",
        });
      }

      if (message.receiver_id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền đánh dấu tin nhắn này",
        });
      }

      message.is_read = true;
      message.read_at = new Date();
      await message.save();

      res.json({
        success: true,
        message: "Đã đánh dấu tin nhắn là đã đọc",
      });
    } catch (error) {
      console.error("Lỗi đánh dấu tin nhắn đã đọc:", error);
      res.status(500).json({
        success: false,
        message: "Không thể đánh dấu tin nhắn đã đọc",
        error: error.message,
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      const participants = conversationId.split("_");
      if (!participants.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập cuộc trò chuyện này",
        });
      }

      const result = await Message.updateMany(
        {
          conversation_id: conversationId,
          receiver_id: userId,
          is_read: false,
        },
        {
          is_read: true,
          read_at: new Date(),
        }
      );

      res.json({
        success: true,
        message: `Đã đánh dấu ${result.modifiedCount} tin nhắn là đã đọc`,
      });
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả tin nhắn đã đọc:", error);
      res.status(500).json({
        success: false,
        message: "Không thể đánh dấu tất cả tin nhắn đã đọc",
        error: error.message,
      });
    }
  }

  async uploadMedia(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }
  
      const baseUrl = process.env.APP_URL || "http://localhost:3001"; // Thêm biến môi trường hoặc URL mặc định
      const media = req.files.map((file) => ({
        type: file.mimetype.startsWith("image/") ? "image" : file.mimetype.startsWith("video/") ? "video" : "file",
        url: `${baseUrl}/Uploads/${file.filename}`, // Trả về URL đầy đủ
        filename: file.originalname,
        size: file.size,
      }));
  
      res.status(201).json({ success: true, media });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }
}

export default new MessageController();