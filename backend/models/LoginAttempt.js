const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    ip: {
      type: String,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    blockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LoginAttempt",
  loginAttemptSchema
);