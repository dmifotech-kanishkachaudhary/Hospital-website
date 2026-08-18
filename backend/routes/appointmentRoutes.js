/**
 * @file appointmentRoutes.js
 * @description Express routing definitions for appointment creation, retrieval, and status management.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

// User Appointment Routes
router.post("/", protect, createAppointment);
router.get("/my", protect, getMyAppointments);

// Admin Appointment Routes
router.get("/", protect, adminOnly, getAllAppointments);
router.get("/:id", protect, adminOnly, getAppointmentById);
router.patch("/:id/status", protect, adminOnly, updateAppointmentStatus);

module.exports = router;