import { User, Follow } from "../../models";
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

  async followUser(req, res) {
    try {
      const { userId } = req.body;
      const currentUserId = req.user.id;

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

      res.json({ success: true, message: "Followed user successfully" });
    } catch (error) {
      console.error("Error following user:", error);
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
}

export default new UserController();