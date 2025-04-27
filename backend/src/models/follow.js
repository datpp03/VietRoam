// models/Follow.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Đảm bảo mỗi cặp (follower, following) là duy nhất
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Virtuals để lấy thông tin người dùng liên quan
followSchema.virtual("follower_details", {
  ref: "User",
  localField: "follower",
  foreignField: "_id",
  justOne: true,
});

followSchema.virtual("following_details", {
  ref: "User",
  localField: "following",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.models.Follow || mongoose.model("Follow", followSchema);