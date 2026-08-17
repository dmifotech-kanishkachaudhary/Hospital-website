const express = require("express");

const {
  createDoctor,
  doctorSelfRegister,
  getAllDoctors,
  getDoctorById,
  doctorLogin,
  approveDoctor,
  rejectDoctor,
} = require("../controllers/doctorController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");


const router = express.Router();

router.post("/login", doctorLogin);
router.post("/register", doctorSelfRegister);

router.post(
  "/",
  protect,
  adminOnly,
  createDoctor
);


// ======================================================
// GET ALL DOCTORS
// ======================================================

// /api/doctors
// /api/doctors?search=cardiology
// /api/doctors?search=rahul
// /api/doctors?search=doctor@email.com

router.get(
  "/",
  protect,
  getAllDoctors
);

// /api/doctors/:id

router.get(
  "/:id",
  protect,
  adminOnly,
  getDoctorById
);

router.put(
  "/:id/approve",
  protect,
  adminOnly,
  approveDoctor
);

router.put(
  "/:id/reject",
  protect,
  adminOnly,
  rejectDoctor
);


module.exports = router;