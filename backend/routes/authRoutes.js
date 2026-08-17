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


// ======================================================
// REGISTER
// ======================================================

router.post(
  "/register",
  register
);


// ======================================================
// LOGIN
// ======================================================

router.post(
  "/login",
  login
);

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);
// ======================================================
// PROFILE
// ======================================================

router.get(
  "/profile",
  protect,
  (req, res) => {
    res.status(200).json({
      message:
        "Protected route accessed successfully",

      user: req.user,
    });
  }
);


// ======================================================
// ADMIN TEST
// ======================================================

router.get(
  "/admin-test",
  protect,
  adminOnly,
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin",
      user: req.user,
    });
  }
);


// ======================================================
// ADMIN - GET ALL PATIENTS
// Supports:
// /patients
// /patients?search=kanishka
// /patients?search=gmail
// /patients?search=987654
// ======================================================

router.get(
  "/patients",
  protect,
  adminOnly,
  getAllPatients
);


// ======================================================
// ADMIN - GET SINGLE PATIENT
// ======================================================

router.get(
  "/patients/:id",
  protect,
  adminOnly,
  getPatientById
);

// security logs//
router.get(
  "/security-logs",
  protect,
  adminOnly,
  getSecurityLogs
);


module.exports = router;