/**
 * @file doctorDashboardController.js
 * @description Doctor dashboard metrics, appointment management, patient overview, and profile updates.
 */

const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

/**
 * Fetch doctor dashboard analytics and appointments breakdown
 * @route GET /api/doctor/dashboard
 */
const getDoctorDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is waiting for admin approval.",
      });
    }

    const doctor = await Doctor.findOne({ user: req.user.id }).populate(
      "user",
      "name email"
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // Fetch all doctor appointments
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name email phone gender bloodGroup dateOfBirth")
      .sort({ date: 1, createdAt: -1 });

    // Dashboard Statistics Calculation
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(
      (a) => a.status === "Pending"
    ).length;
    const confirmedAppointments = appointments.filter(
      (a) => a.status === "Confirmed"
    ).length;
    const completedAppointments = appointments.filter(
      (a) => a.status === "Completed"
    ).length;
    const cancelledAppointments = appointments.filter(
      (a) => a.status === "Cancelled"
    ).length;

    // Today's Appointments Filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });

    // Unique Patients Extraction
    const patientMap = new Map();
    appointments.forEach((appointment) => {
      if (appointment.patient) {
        patientMap.set(
          appointment.patient._id.toString(),
          appointment.patient
        );
      }
    });

    const recentPatients = [...patientMap.values()];

    return res.status(200).json({
      message: "Doctor dashboard fetched successfully",
      doctor: {
        id: doctor._id,
        name: doctor.user.name,
        email: doctor.user.email,
        specialization: doctor.specialization,
        department: doctor.department,
        experience: doctor.experience,
        phone: doctor.phone,
        consultationFee: doctor.consultationFee,
        availability: doctor.availability,
      },
      stats: {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
      },
      todayAppointments,
      recentPatients,
    });
  } catch (error) {
    console.error("[DOCTOR_DASHBOARD_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};

/**
 * Get all appointments for the logged-in doctor
 * @route GET /api/doctor/appointments
 */
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate(
      "user",
      "name email"
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name email phone gender bloodGroup dateOfBirth")
      .sort({ date: 1, createdAt: -1 });

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error("[GET_DOCTOR_APPOINTMENTS_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

/**
 * Doctor updates appointment status
 * @route PUT /api/doctor/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const allowedStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid appointment status" });
    }

    appointment.status = req.body.status;
    await appointment.save();

    return res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("[UPDATE_DOCTOR_APPOINTMENT_ERROR]", error);
    return res.status(500).json({
      message: "Failed to update appointment",
      error: error.message,
    });
  }
};

/**
 * Get unique patients list treated by doctor
 * @route GET /api/doctor/patients
 */
const getMyPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name email phone gender bloodGroup dateOfBirth")
      .sort({ createdAt: -1 });

    const patientMap = new Map();
    appointments.forEach((appointment) => {
      if (appointment.patient) {
        patientMap.set(
          appointment.patient._id.toString(),
          appointment.patient
        );
      }
    });

    const patients = [...patientMap.values()];

    return res.status(200).json({
      message: "Patients fetched successfully",
      patients,
    });
  } catch (error) {
    console.error("[GET_MY_PATIENTS_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};

/**
 * Update doctor profile information
 * @route PUT /api/doctor/profile
 */
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      phone,
      specialization,
      department,
      experience,
      consultationFee,
      availability,
    } = req.body;

    // Update User Fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Update Doctor Fields
    if (specialization) doctor.specialization = specialization;
    if (department) doctor.department = department;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availability) doctor.availability = availability;

    await user.save();
    await doctor.save();
    await doctor.populate("user", "name email phone");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("[UPDATE_DOCTOR_PROFILE_ERROR]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  getDoctorDashboard,
  getDoctorAppointments,
  updateAppointmentStatus,
  getMyPatients,
  updateDoctorProfile,
};