const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

const TEST_MODE = process.env.TEST_MODE === "true";

// ======================================================
// CREATE APPOINTMENT
// ======================================================

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

    // Check doctor exists
    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Payment check
    /*if (
      paymentStatus !== "Paid" ||
      !paymentId ||
      !orderId
    ) {
      return res.status(400).json({
        message:
          "Payment is required before booking an appointment.",
      });
    }*/

    //======================================
    // PAYMENT CHECK
    // ======================================

if (!TEST_MODE) {
  if (
    paymentStatus !== "Paid" ||
    !paymentId ||
    !orderId
  ) {
    return res.status(400).json({
      message:
        "Payment is required before booking an appointment.",
    });
  }
}

//================================//

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      department,
      date,
      time,
      reason,
      /*paymentId,
      orderId,
      paymentStatus,*/

      //=============//
      paymentId: TEST_MODE
      ? "TEST_PAYMENT_ID"
      : paymentId,

      orderId: TEST_MODE
      ? "TEST_ORDER_ID"
      : orderId,

     paymentStatus: TEST_MODE
      ? "Paid"
      : paymentStatus,

      //=================//

      status: "Pending",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (error) {
    console.error("Create Appointment Error:", error);

    res.status(500).json({
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

// ======================================================
// USER - GET MY APPOINTMENTS
// ======================================================

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.id,
    })
    .populate("patient", "name email")
      .populate({
        path: "doctor",
        populate: {
        path: "user",
        select: "name email"
    }
})
      .sort({
        date: 1,
        createdAt: -1,
      });

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    console.error("Get My Appointments Error:", error);

    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN - GET ALL APPOINTMENTS
// Supports search
// ======================================================

const getAllAppointments = async (req, res) => {
  try {
    const search =
      req.query.search?.trim() || "";

    const status =
      req.query.status?.trim() || "";

    let appointments = await Appointment.find()
      .populate(
        "patient",
        "name email phone dateOfBirth gender bloodGroup allergies medicalConditions"
      )
      .populate({
    path: "doctor",
    populate: {
        path: "user",
        select: "name email"
    }
})
      .sort({
        date: 1,
        createdAt: -1,
      });

    // ==================================================
    // SEARCH
    // ==================================================

    if (search) {
      const searchLower = search.toLowerCase();

      appointments = appointments.filter(
        (appointment) => {

          const patient =
            appointment.patient;

          const doctor =
            appointment.doctor;

          return (
            patient?.name
              ?.toLowerCase()
              .includes(searchLower) ||

            patient?.email
              ?.toLowerCase()
              .includes(searchLower) ||

            patient?.phone
              ?.toLowerCase()
              .includes(searchLower) ||

            doctor?.user?.name
                ?.toLowerCase()
                .includes(searchLower)||

            doctor?.user?.email
                ?.toLowerCase()
                .includes(searchLower)||

            doctor?.specialization
              ?.toLowerCase()
              .includes(searchLower) ||

            doctor?.department
              ?.toLowerCase()
              .includes(searchLower) ||

            appointment.department
              ?.toLowerCase()
              .includes(searchLower) ||

            appointment.reason
              ?.toLowerCase()
              .includes(searchLower) ||

            appointment.status
              ?.toLowerCase()
              .includes(searchLower) ||

            appointment.time
              ?.toLowerCase()
              .includes(searchLower)
          );
        }
      );
    }

    // ==================================================
    // STATUS FILTER
    // ==================================================

    if (status) {
      appointments = appointments.filter(
        (appointment) =>
          appointment.status === status
      );
    }

    res.status(200).json({
      message:
        "All appointments fetched successfully",

      appointments,
    });
  } catch (error) {
    console.error(
      "Get All Appointments Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch appointments",

      error: error.message,
    });
  }
};

// ======================================================
// ADMIN - GET SINGLE APPOINTMENT
// ======================================================

const getAppointmentById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const appointment =
      await Appointment.findById(id)
        .populate(
          "patient",
          "name email phone dateOfBirth gender bloodGroup allergies medicalConditions address city state pincode"
        )
        .populate({
    path: "doctor",
    populate:{
        path:"user",
        select:"name email"
    }
})

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message:
        "Appointment details fetched successfully",

      appointment,
    });
  } catch (error) {
    console.error(
      "Get Appointment Details Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch appointment details",

      error: error.message,
    });
  }
};

// ======================================================
// ADMIN - UPDATE APPOINTMENT STATUS
// ======================================================

const updateAppointmentStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid appointment status",
      });
    }

    const appointment =
      await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "patient",
          "name email phone"
        )
        .populate(
          "doctor",
          "name specialization department"
        );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message:
        "Appointment status updated",

      appointment,
    });
  } catch (error) {
    console.error(
      "Update Appointment Status Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update appointment status",

      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};

