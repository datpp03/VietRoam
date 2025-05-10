import { Notification, User, Post, Comment } from "../../models";
import mongoose from "mongoose";

class NotificationController {
  async getNotifications(req, res) {
    try {
      const {myId} = req.params;
      if (!mongoose.Types.ObjectId.isValid(myId)) {
        return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ" });
      }

      const notifications = await Notification.find({ user_id: myId })
        .sort({ createdAt: -1 })
        .populate("sender_id", "full_name profile_picture email")
        .populate("post_id", "media content")
        .populate("comment_id", "content")
        .lean();

      const unreadCount = notifications.filter((notification) => !notification.is_read).length;

      return res.status(200).json({
        success: true,
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách thông báo",
        error: error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId,myId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({ success: false, message: "ID thông báo không hợp lệ" });
      }

      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });
      }

      if (notification.user_id.toString() !== myId) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền đánh dấu thông báo này",
        });
      }

      notification.is_read = true;
      await notification.save();

      return res.status(200).json({
        success: true,
        message: "Đã đánh dấu thông báo là đã đọc",
      });
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể đánh dấu thông báo đã đọc",
        error: error.message,
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const {myId} = req.params;

      if (!mongoose.Types.ObjectId.isValid(myId)) {
        return res.status(400).json({ success: false, message: "ID người dùng không hợp lệ" });
      }

      const result = await Notification.updateMany(
        { user_id: myId, is_read: false },
        { is_read: true }
      );

      return res.status(200).json({
        success: true,
        message: `Đã đánh dấu ${result.modifiedCount} thông báo là đã đọc`,
      });
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả thông báo đã đọc:", error);
      return res.status(500).json({
        success: false,
        message: "Không thể đánh dấu tất cả thông báo đã đọc",
        error: error.message,
      });
    }
  }
}

export default new NotificationController();