const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema({
  post_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post',
    index: true,
    required: true
  },
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true,
    required: true
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
likeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });
module.exports = mongoose.models.Like || mongoose.model('Like', likeSchema);