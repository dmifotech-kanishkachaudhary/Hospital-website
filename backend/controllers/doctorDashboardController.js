const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const User = require("../models/User");

// ======================================================
// DOCTOR DASHBOARD
// ======================================================



const getDoctorDashboard = async (req, res) => {
  try {

    // Logged in doctor
    const user = await User.findById(req.user.id);

if (!user) {
  return res.status(404).json({
    message: "User not found",
  });
}

if (user.status !== "approved") {
  return res.status(403).json({
    success: false,
    message: "Your account is waiting for admin approval.",
  });
}

const doctor = await Doctor.findOne({
  user: req.user.id,
}).populate("user", "name email");

if (!doctor) {
  return res.status(404).json({
    message: "Doctor profile not found",
  });
}

    // All appointments
    const appointments = await Appointment.find({
      doctor: doctor._id,
    })
      .populate(
        "patient",
        "name email phone gender bloodGroup dateOfBirth"
      )
      .sort({
        date: 1,
        createdAt: -1,
      });

    // ===============================================
    // Dashboard Stats
    // ===============================================

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

    // ===============================================
    // Today's Appointments
    // ===============================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);

      return (
        appointmentDate >= today &&
        appointmentDate < tomorrow
      );
    });

    // ===============================================
    // Recent Patients (Unique)
    // ===============================================

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

    // ===============================================
    // Response
    // ===============================================

    res.status(200).json({
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
    console.error("Doctor Dashboard Error:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL APPOINTMENTS OF DOCTOR
// ======================================================

const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.id,
    }).populate("user", "name email");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    })
      .populate(
        "patient",
        "name email phone gender bloodGroup dateOfBirth"
      )
      .sort({
        date: 1,
        createdAt: -1,
      });

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE APPOINTMENT STATUS
// ======================================================

const updateAppointmentStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    appointment.status = req.body.status;

    await appointment.save();

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update appointment",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY PATIENTS
// ======================================================

const getMyPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.id,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    })
      .populate(
        "patient",
        "name email phone gender bloodGroup dateOfBirth"
      )
      .sort({
        createdAt: -1,
      });

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

    res.status(200).json({
      message: "Patients fetched successfully",
      patients,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE DOCTOR PROFILE
// ======================================================

const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.id,
    });

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

    // ===========================
    // USER TABLE
    // ===========================

    if (name) user.name = name;
    if (phone) user.phone = phone;

    // ===========================
    // DOCTOR TABLE
    // ===========================

    if (specialization)
      doctor.specialization = specialization;

    if (department)
      doctor.department = department;

    if (experience !== undefined)
      doctor.experience = experience;

    if (consultationFee !== undefined)
      doctor.consultationFee = consultationFee;

    if (availability)
      doctor.availability = availability;

    await user.save();
    await doctor.save();

    await doctor.populate(
      "user",
      "name email phone"
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });

  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getDoctorDashboard,
  getDoctorAppointments,
  updateAppointmentStatus,
  getMyPatients,
  updateDoctorProfile,
};