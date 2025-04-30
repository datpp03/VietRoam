const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return !this.media || this.media.length === 0;
      },
      maxlength: 2000,
    },
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "file"],
          required: true,
        },
        url: {
          type: String,
          required: true,
          validate: {
            validator: (v) => /^(http|https):\/\/[^ "]+$/.test(v),
            message: "URL media không hợp lệ",
          },
        },
        filename: String,
        size: Number,
      },
    ],
    conversation_id: {
      type: String,
      index: true,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    read_at: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

messageSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);