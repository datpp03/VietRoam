// models/index.js
const User = require("./User");
const Post = require("./Post");
const Comment = require("./Comment");
const Like = require("./Like");
const Message = require("./Message");
const Follow = require("./Follow");
const Notification = require("./Notification");

// Thêm các model khác nếu có

module.exports = {
  User,
  Post,
  Comment,
  Like,
  Notification,
  Message,
  Follow,
};
