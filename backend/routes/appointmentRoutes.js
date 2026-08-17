const express = require("express");

const {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// ======================================================
// USER - BOOK APPOINTMENT
// ======================================================

router.post(
  "/",
  protect,
  createAppointment
);

// ======================================================
// USER - MY APPOINTMENTS
// ======================================================

router.get(
  "/my",
  protect,
  getMyAppointments
);

// ======================================================
// ADMIN - ALL APPOINTMENTS
// ======================================================

router.get(
  "/",
  protect,
  adminOnly,
  getAllAppointments
);

// ======================================================
// ADMIN - SINGLE APPOINTMENT
// ======================================================

router.get(
  "/:id",
  protect,
  adminOnly,
  getAppointmentById
);

// ======================================================
// ADMIN - UPDATE STATUS
// ======================================================

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateAppointmentStatus
);

module.exports = router;