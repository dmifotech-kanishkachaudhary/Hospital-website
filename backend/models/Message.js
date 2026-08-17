const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    senderType: {
      type: String,
      enum: [
        "patient",
        "doctor",
        "bot",
        "system"
      ],
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Message",
  messageSchema
);