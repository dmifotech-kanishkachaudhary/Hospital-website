const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==================================================
    // PATIENT ID
    // ==================================================

    patientId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ==================================================
    // BASIC INFORMATION
    // ==================================================

    name: {
      type: String,
      required: true,
      
    },

    email: {
      type: String,
      required: true,
      unique: true,
    
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: [
        "Male",
        "Female",
        "Other",
        "Prefer not to say",
      ],
      required: true,
    },

    // ==================================================
    // ADDRESS
    // ==================================================

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // EMERGENCY CONTACT
    // ==================================================

    emergencyContactName: {
      type: String,
      default: "",
      trim: true,
    },

    emergencyContactNumber: {
      type: String,
      default: "",
      trim: true,
    },

    emergencyContactRelationship: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // MEDICAL INFORMATION
    // ==================================================

    bloodGroup: {
      type: String,
      enum: [
        "",
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ],
      default: "",
    },

    allergies: {
      type: String,
      default: "",
      trim: true,
    },

    medicalConditions: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // AUTHENTICATION
    // ==================================================

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user", "doctor"],
      default: "user",
    },

    status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: function () {
      return this.role === "doctor" ? "pending" : "approved";
    },
  },

    

    // ==================================================
    // OTP LOGIN
    // ==================================================

    otpHash: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;