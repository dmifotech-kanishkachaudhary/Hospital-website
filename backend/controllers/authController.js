const User = require("../models/User");
const Appointment = require("../models/Appointment");
const MedicalReport = require("../models/MedicalReport");
const { sendLoginOtpEmail } = require("../utils/emailService");
const LoginAttempt = require("../models/LoginAttempt");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================================================
// REGISTER
// ======================================================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelationship,
      bloodGroup,
      allergies,
      medicalConditions,
    } = req.body;

    // Check existing user
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      phone,
      role: "user",
      dateOfBirth,
      gender,

      address,
      city,
      state,
      pincode,

      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelationship,

      bloodGroup,
      allergies,
      medicalConditions,
    });

    return res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Registration Error:",
      error
    );

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get Client IP
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

    // Check previous login attempts
    let loginAttempt = await LoginAttempt.findOne({
      email,
      ip,
    });

    // Check if blocked
    if (
      loginAttempt &&
      loginAttempt.blockedUntil &&
      loginAttempt.blockedUntil > new Date()
    ) {
      return res.status(429).json({
        message:
          "Too many failed login attempts. Please try again after 15 minutes.",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // Wrong password
    if (!isPasswordCorrect) {
      if (!loginAttempt) {
        loginAttempt = new LoginAttempt({
          email,
          ip,
          attempts: 1,
        });
      } else {
        loginAttempt.attempts += 1;
      }

      // Block after 5 attempts
      if (loginAttempt.attempts >= 5) {
        loginAttempt.blockedUntil = new Date(
          Date.now() + 15 * 60 * 1000 // 15 minutes
        );
      }

      await loginAttempt.save();

      return res.status(401).json({
        message:
          loginAttempt.attempts >= 5
            ? "Too many failed login attempts. You are blocked for 15 minutes."
            : `Invalid email or password. ${
                5 - loginAttempt.attempts
              } attempt(s) remaining.`,
      });
    }

    // Successful login → reset attempts
    await LoginAttempt.deleteOne({
      email,
      ip,
    });

    // Generate JWT
    const token = jwt.sign(
  {
    id: user._id,
    role: user.role,

    name: user.name,
    email: user.email,
    phone: user.phone,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d",
  }
);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ======================================================
// SEND OTP
// ======================================================

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpHash = await bcrypt.hash(otp, 10);

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

    await sendLoginOtpEmail({
      email: user.email,
      name: user.name,
      otp,
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {

    console.error("Send OTP Error:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });

  }
};


// ======================================================
// VERIFY OTP
// ======================================================

const verifyOtp = async (req, res) => {

  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      !user.otpHash ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const isValidOtp = await bcrypt.compare(
      otp,
      user.otpHash
    );

    if (!isValidOtp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.otpHash = null;
    user.otpExpiresAt = null;

    await user.save();

    const token = jwt.sign(
  {
    id: user._id,
    role: user.role,

    name: user.name,
    email: user.email,
    phone: user.phone,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d",
  }
);

    return res.status(200).json({
      message: "OTP verified successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "OTP verification failed",
    });

  }

};


// ======================================================
// ADMIN - GET ALL PATIENTS
// Supports search
// ======================================================

const getAllPatients = async (
  req,
  res
) => {
  try {
    const search =
      req.query.search?.trim() || "";

    let query = {
      role: "user",
    };

    // ==================================================
    // SEARCH
    // ==================================================

    if (search) {
      const searchRegex =
        new RegExp(search, "i");

      query = {
        role: "user",

        $or: [
          {
            name: searchRegex,
          },

          {
            email: searchRegex,
          },

          {
            phone: searchRegex,
          },

          {
            gender: searchRegex,
          },

          {
            bloodGroup: searchRegex,
          },

          {
            city: searchRegex,
          },

          {
            state: searchRegex,
          },

          {
            pincode: searchRegex,
          },
        ],
      };

      // If search looks like MongoDB ObjectId,
      // also search by actual patient ID.
      if (
        /^[0-9a-fA-F]{24}$/.test(search)
      ) {
        query.$or.push({
          _id: search,
        });
      }
    }

    const patients =
      await User.find(query)
        .select(
          "-password -otpHash -otpExpiresAt"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "Patients fetched successfully",

      patients,
    });
  } catch (error) {
    console.error(
      "Get Patients Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch patients",

      error: error.message,
    });
  }
};


// ======================================================
// ADMIN - GET SINGLE PATIENT
// Patient + Appointments + Reports
// ======================================================

const getPatientById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // ==================================================
    // FIND PATIENT
    // ==================================================

    const patient =
      await User.findOne({
        _id: id,
        role: "user",
      }).select(
        "-password -otpHash -otpExpiresAt"
      );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // ==================================================
    // GET APPOINTMENTS
    // ==================================================

    const appointments =
      await Appointment.find({
        patient: patient._id,
      })
        .populate(
          "doctor",
          "name email specialization department experience phone availability consultationFee"
        )
        .sort({
          date: -1,
          createdAt: -1,
        });

    // ==================================================
    // GET MEDICAL REPORTS
    // ==================================================

    const reports =
      await MedicalReport.find({
        patient: patient._id,
      })
        .sort({
          createdAt: -1,
        });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message:
        "Patient details fetched successfully",

      patient,

      appointments,

      reports,
    });
  } catch (error) {
    console.error(
      "Get Patient Details Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch patient details",

      error: error.message,
    });
  }
};

// ======================================================
// ADMIN - SECURITY LOGS
// ======================================================

const getSecurityLogs = async (req, res) => {
  try {

    const logs = await LoginAttempt.find()
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      message: "Security logs fetched successfully",
      logs,
    });

  } catch (error) {

    return res.status(500).json({
      message: "Failed to fetch security logs",
      error: error.message,
    });

  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  getAllPatients,
  getPatientById,
  getSecurityLogs,
};