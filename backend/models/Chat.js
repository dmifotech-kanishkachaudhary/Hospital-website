const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    status: {
      type: String,
      enum: ["bot", "doctor"],
      default: "bot",
    },
    doctorRequested:{
    type:Boolean,
    default:false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);