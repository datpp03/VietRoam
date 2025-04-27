const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true,
    required: true
  },
  content: { 
    type: String, 
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  media: [{
    _id: false,
    type: { 
      type: String, 
      enum: ['image', 'video'],
      required: true
    },
    url: { 
      type: String,
      required: true,
      validate: {
        validator: (v) => /^(http|https):\/\/[^ "]+$/.test(v),
        message: 'URL media không hợp lệ'
      }
    },
  }],
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    name: String,
    address: String
  },
  tags: [{ 
    type: String,
    maxlength: 20,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'followers'],
    default: 'public'
  },
  likes_count: {
    type: Number,
    default: 0
  },
  comments_count: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

postSchema.index({ location: '2dsphere' });
postSchema.index({ content: 'text', tags: 'text' });

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);