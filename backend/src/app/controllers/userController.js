import { User, Follow, Notification } from "../../models";
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
import mongoose from "mongoose";

class UserController {
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select("_id full_name profile_picture");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  async getProfileUser(req, res) {
    try {
      const { username } = req.params;
      const user = await User.findOne({
        email: { $regex: `^${username}@`, $options: 'i' },
      }).select('-login_count -last_login -is_verified');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  async followUser(req, res) {
    try {      
        const { userId } = req.body;
        const currentUserId = req.user.id;
        console.log("currentUserId", currentUserId);
        console.log("userId", userId);
        if (userId === currentUserId) {
            return res.status(400).json({ success: false, message: "Cannot follow yourself" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const userToFollow = await User.findById(userId);
        if (!userToFollow) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const existingFollow = await Follow.findOne({ follower: currentUserId, following: userId });
        if (existingFollow) {
            return res.status(400).json({ success: false, message: "Already following this user" });
        }

        const newFollow = new Follow({
            follower: currentUserId,
            following: userId,
        });
        await newFollow.save();

        await User.findByIdAndUpdate(currentUserId, { $inc: { following_count: 1 } });
        await User.findByIdAndUpdate(userId, { $inc: { followers_count: 1 } });

        const notification = new Notification({
            user_id: userId,
            sender_id: currentUserId,
            type: 'follow',
            is_read: false
        });
        await notification.save();

        res.json({ success: true, message: "Followed user successfully" });
    } catch (error) {
        console.error("Error following user2:", error);
        res.status(500).json({ success: false, message: "Cannot follow user", error: error.message });
    }
}

async unfollowUser(req, res) {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ success: false, message: "Cannot unfollow yourself" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const followRecord = await Follow.findOneAndDelete({ follower: currentUserId, following: userId });
    if (!followRecord) {
      return res.status(400).json({ success: false, message: "Not following this user" });
    }

    await User.findByIdAndUpdate(currentUserId, { $inc: { following_count: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followers_count: -1 } });
    await Notification.findOneAndDelete({
      user_id: userId,
      sender_id: currentUserId,
      type: 'follow'
    });

    res.json({ success: true, message: "Unfollowed user successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ success: false, message: "Cannot unfollow user", error: error.message });
  }
}
  async searchUsers(req, res) {
    try {
      const { q } = req.query;
      const currentUserId = req.user.id;

      if (!q) {
        return res.status(400).json({ success: false, message: "Query is required" });
      }

      const following = await Follow.find({ follower: currentUserId }).select("following");
      const followingIds = following.map((f) => f.following);

      const mutualFollowers = await Follow.find({
        follower: { $in: followingIds },
        following: currentUserId,
      }).select("follower");

      const mutualFollowerIds = mutualFollowers.map((f) => f.follower);

      const users = await User.find({
        $and: [
          {
            $or: [
              { full_name: { $regex: q, $options: "i" } },
              { email: { $regex: q, $options: "i" } },
            ],
          },
          { _id: { $in: mutualFollowerIds } },
        ],
      }).select("_id full_name profile_picture");

      res.json({ success: true, users });
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ success: false, message: "Cannot search users", error: error.message });
    }
  }

  async searchAllUsers(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ success: false, message: "Query is required" });
      }

      const users = await User.find({
        $or: [
          { full_name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }).select("_id full_name profile_picture email is_verified");

      res.json({ success: true, users });
    } catch (error) {
      console.error("Error searching all users:", error);
      res.status(500).json({ success: false, message: "Cannot search users", error: error.message });
    }
  }

  async getUsersBatch(req, res) {
    try {
      const { userIds } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách userIds không hợp lệ',
        });
      }

      const users = await User.find({ _id: { $in: userIds } })
        .select('_id full_name profile_picture email')
        .lean();

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message,
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;
      
      // Chỉ cho phép người dùng cập nhật thông tin của chính họ
      if (id !== currentUserId) {
        return res.status(403).json({ success: false, message: "Unauthorized to update this user" });
      }
  
      // Xử lý upload ảnh nếu có
      let profilePictureUrl = null;
      if (req.file) {
        const fileExt = path.extname(req.file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join(__dirname, '../../../Uploads', fileName);
        
        await fs.writeFile(filePath, req.file.buffer);
        profilePictureUrl = `http://localhost:3001/Uploads/${fileName}`;
      }
  
      // Cập nhật thông tin người dùng
      const updates = {
        full_name: req.body.full_name,
        bio: req.body.bio,
        travel_interests: JSON.parse(req.body.travel_interests || '[]'),
        location: JSON.parse(req.body.location || '{}'),
      };
  
      if (profilePictureUrl) {
        updates.profile_picture = profilePictureUrl;
      }
  
      const user = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      }).select('-login_count -last_login -is_verified');
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }
}

export default new UserController();