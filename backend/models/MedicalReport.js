const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportName: {
      type: String,
      required: true,
      trim: true,
    },

    reportType: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      default: null,
   },

    reportText: {
      type: String,
      required: true,
    },

    aiAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    status: {
      type: String,
      enum: ["Processing", "Analyzed", "Failed"],
      default: "Processing",
    },

    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("MedicalReport", medicalReportSchema);