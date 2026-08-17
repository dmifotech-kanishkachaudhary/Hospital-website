const express = require("express");

const {
  getDoctorDashboard,
  getDoctorAppointments,
  updateAppointmentStatus,
  getMyPatients,
  updateDoctorProfile,
} = require("../controllers/doctorDashboardController");

const protect = require("../middleware/authMiddleware");
const doctorOnly = require("../middleware/doctorMiddleware");

const router = express.Router();

// =============================================
// DOCTOR DASHBOARD
// =============================================

router.get(
  "/dashboard",
  protect,
  doctorOnly,
  getDoctorDashboard
);

// =============================================
// MY APPOINTMENTS
// =============================================

router.get(
  "/appointments",
  protect,
  doctorOnly,
  getDoctorAppointments
);

// =============================================
// MY PATIENTS
// =============================================

router.get(
  "/patients",
  protect,
  doctorOnly,
  getMyPatients
);

// =============================================
// UPDATE APPOINTMENT STATUS
// =============================================

router.put(
  "/appointments/:id",
  protect,
  doctorOnly,
  updateAppointmentStatus
);

router.put(
  "/profile",
  protect,
  doctorOnly,
  updateDoctorProfile
);

router.get(

"/profile",

protect,

doctorOnly,

async(req,res)=>{

const Doctor=require("../models/Doctor");

const doctor=await Doctor.findOne({

user:req.user.id

}).populate(

"user",

"name email"

);

res.json({

doctor

});

}

);

module.exports = router;