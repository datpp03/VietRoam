// controllers/followController.js
const { Follow, User } = require("../models");

class FollowController {
  // Theo dõi người dùng
  static async followUser(req, res) {
    try {
      const { followingId } = req.body;
      const followerId = req.user.id; // Lấy từ JWT

      // Không cho tự theo dõi
      if (followerId === followingId) {
        return res.status(400).json({ error: "Không thể tự theo dõi" });
      }

      // Kiểm tra đã theo dõi chưa
      const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
      if (existingFollow) {
        return res.status(400).json({ error: "Đã theo dõi người này" });
      }

      // Tạo follow
      const follow = await Follow.create({ follower: followerId, following: followingId });

      // Cập nhật số lượng
      await User.findByIdAndUpdate(followerId, { $inc: { following_count: 1 } });
      await User.findByIdAndUpdate(followingId, { $inc: { followers_count: 1 } });

      res.json(follow);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Hủy theo dõi
  static async unfollowUser(req, res) {
    try {
      const { followingId } = req.params;
      const followerId = req.user.id;

      const deletedFollow = await Follow.findOneAndDelete({
        follower: followerId,
        following: followingId,
      });

      if (!deletedFollow) {
        return res.status(404).json({ error: "Không tìm thấy mối quan hệ theo dõi" });
      }

      // Cập nhật số lượng
      await User.findByIdAndUpdate(followerId, { $inc: { following_count: -1 } });
      await User.findByIdAndUpdate(followingId, { $inc: { followers_count: -1 } });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = FollowController;