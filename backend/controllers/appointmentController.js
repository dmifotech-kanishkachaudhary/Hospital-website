/**
 * @file appointmentController.js
 * @description Handles appointment creation, retrieval, filtering, and status updates for users and admins.
 */

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const TEST_MODE = process.env.TEST_MODE === "true";

/**
 * Create a new appointment booking
 * @route POST /api/appointments
 */
const createAppointment = async (req, res) => {
  try {
    const {
      doctor,
      department,
      date,
      time,
      reason,
      paymentId,
      orderId,
      paymentStatus,
    } = req.body;

    // Check if doctor exists
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Payment validation check
    if (!TEST_MODE) {
      if (paymentStatus !== "Paid" || !paymentId || !orderId) {
        return res.status(400).json({
          message: "Payment is required before booking an appointment.",
        });
      }
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      department,
      date,
      time,
      reason,
      paymentId: TEST_MODE ? "TEST_PAYMENT_ID" : paymentId,
      orderId: TEST_MODE ? "TEST_ORDER_ID" : orderId,
      paymentStatus: TEST_MODE ? "Paid" : paymentStatus,
      status: "Pending",
    });

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("[CREATE_APPOINTMENT_ERROR]", error);
    return res.status(500).json({
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

/**
 * Fetch all appointments for the logged-in user/patient
 * @route GET /api/appointments/my-appointments
 */
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("patient", "name email")
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ date: 1, createdAt: -1 });

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error("[GET_MY_APPOINTMENTS_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

/**
 * Fetch all appointments with optional search and status filtering (Admin access)
 * @route GET /api/appointments
 */
const getAllAppointments = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim() || "";

    let appointments = await Appointment.find()
      .populate(
        "patient",
        "name email phone dateOfBirth gender bloodGroup allergies medicalConditions"
      )
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ date: 1, createdAt: -1 });

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();

      appointments = appointments.filter((appointment) => {
        const patient = appointment.patient;
        const doctor = appointment.doctor;

        return (
          patient?.name?.toLowerCase().includes(searchLower) ||
          patient?.email?.toLowerCase().includes(searchLower) ||
          patient?.phone?.toLowerCase().includes(searchLower) ||
          doctor?.user?.name?.toLowerCase().includes(searchLower) ||
          doctor?.user?.email?.toLowerCase().includes(searchLower) ||
          doctor?.specialization?.toLowerCase().includes(searchLower) ||
          doctor?.department?.toLowerCase().includes(searchLower) ||
          appointment.department?.toLowerCase().includes(searchLower) ||
          appointment.reason?.toLowerCase().includes(searchLower) ||
          appointment.status?.toLowerCase().includes(searchLower) ||
          appointment.time?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by appointment status
    if (status) {
      appointments = appointments.filter(
        (appointment) => appointment.status === status
      );
    }

    return res.status(200).json({
      message: "All appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error("[GET_ALL_APPOINTMENTS_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

/**
 * Fetch details of a single appointment by ID (Admin access)
 * @route GET /api/appointments/:id
 */
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate(
        "patient",
        "name email phone dateOfBirth gender bloodGroup allergies medicalConditions address city state pincode"
      )
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json({
      message: "Appointment details fetched successfully",
      appointment,
    });
  } catch (error) {
    console.error("[GET_APPOINTMENT_BY_ID_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch appointment details",
      error: error.message,
    });
  }
};

/**
 * Update the status of an appointment (Admin access)
 * @route PUT /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid appointment status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization department");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json({
      message: "Appointment status updated",
      appointment,
    });
  } catch (error) {
    console.error("[UPDATE_APPOINTMENT_STATUS_ERROR]", error);
    return res.status(500).json({
      message: "Failed to update appointment status",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};
