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

followSchema.index({ follower: 1, following: 1 }, { unique: true });

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