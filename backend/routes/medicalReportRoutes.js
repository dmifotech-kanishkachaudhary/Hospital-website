const express = require("express");
const multer = require("multer");

const {
  createMedicalReport,
  getMyReports,
  getReportById,
  getAllReports,
  getReportByIdAdmin,
} = require("../controllers/medicalReportController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// ======================================================
// USER - UPLOAD MEDICAL REPORT
// ======================================================

router.post(
  "/upload",
  protect,
  upload.single("report"),
  createMedicalReport
);

// ======================================================
// USER - MY REPORTS
// ======================================================

router.get(
  "/my",
  protect,
  getMyReports
);

// ======================================================
// ADMIN - ALL REPORTS
// IMPORTANT: Keep this BEFORE /:id
// ======================================================

router.get(
  "/all",
  protect,
  adminOnly,
  getAllReports
);

// ======================================================
// USER - SINGLE REPORT
// ======================================================

router.get(
  "/all/:id",
  protect,
  adminOnly,
  getReportByIdAdmin
);

router.get(
  "/:id",
  protect,
  getReportById
);

module.exports = router;