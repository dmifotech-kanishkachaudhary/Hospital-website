/**
 * @file authRoutes.js
 * @description Express routing definitions for user authentication, profile, and admin patient management.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  register,
  login,
  sendOtp,
  verifyOtp,
  getAllPatients,
  getPatientById,
  getSecurityLogs,
} = require("../controllers/authController");

const router = express.Router();

// Public Authentication Routes
router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected User Routes
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

// Admin-Only Routes
router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.status(200).json({
    message: "Welcome Admin",
    user: req.user,
  });
});

router.get("/patients", protect, adminOnly, getAllPatients);
router.get("/patients/:id", protect, adminOnly, getPatientById);
router.get("/security-logs", protect, adminOnly, getSecurityLogs);

module.exports = router;