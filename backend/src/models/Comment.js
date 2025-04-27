const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
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
  },
  content: { 
    type: String, 
    required: true,
    minlength: 1,
    maxlength: 1000
  },
  parent_comment: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment'
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  edit_history: [{
    content: String,
    edited_at: Date
  }]
}, { 
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.edit_history;
      return ret;
    }
  }
});

commentSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);