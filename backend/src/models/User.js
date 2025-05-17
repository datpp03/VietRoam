const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email không hợp lệ"],
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    profile_picture: {
      type: String,
      default: "/images/default-avatar.jpg",
      validate: {
        validator: (v) => /^(http|https):\/\/[^ "]+$/.test(v),
        message: "URL ảnh không hợp lệ",
      },
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    travel_interests: [
      {
        type: String,
        enum: ["Adventure", "Cultural", "Food", "Historical", "Nature", "Beach", "Urban Exploration"],
      },
    ],                             
    role: {
      type: Boolean,
      default: true,
    },
    social_links: {
      website: {
        type: String,
        validate: {
          validator: (v) => /^(http|https):\/\/[^ "]+$/.test(v),
          message: "URL không hợp lệ",
        },
      },
      instagram: String,
    },
    location: {
      country: String,
      city: String,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    last_login: Date,
    login_count: {
      type: Number,
      default: 0,
    },
    followers_count: {
      type: Number,
      default: 0,
    },
    following_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.login_count;
        return ret;
      },
    },
  }
);

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "user_id",
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);