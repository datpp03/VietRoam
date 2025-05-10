const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'reply'],
    required: true
  },
  post_id: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    index: true
  },
  comment_id: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  is_read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

notificationSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);