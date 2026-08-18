/**
 * @file doctorController.js
 * @description Doctor account creation, self-registration, authentication, approval, and search operations.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

/**
 * Admin creates a new Doctor profile & account
 * @route POST /api/doctors
 */
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      department,
      experience,
      phone,
      consultationFee,
      availability,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Doctor email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth: new Date("1990-01-01"),
      gender: "Prefer not to say",
      role: "doctor",
      status: "approved",
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      department,
      experience,
      phone,
      consultationFee,
      availability,
    });

    await doctor.populate("user", "name email");

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor,
    });
  } catch (err) {
    console.error("[CREATE_DOCTOR_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Doctor self-registration endpoint (Pending Admin approval)
 * @route POST /api/doctors/register
 */
const doctorSelfRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      department,
      experience,
      consultationFee,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "doctor",
      status: "pending",
      dateOfBirth: new Date("1990-01-01"),
      gender: "Prefer not to say",
    });

    await Doctor.create({
      user: user._id,
      specialization,
      department,
      experience,
      phone,
      consultationFee,
      availability: "Available",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Wait until admin approves your account.",
    });
  } catch (error) {
    console.error("[DOCTOR_SELF_REGISTER_ERROR]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Doctor Login Endpoint
 * @route POST /api/doctors/login
 */
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      role: "doctor",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Check approval status
    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your registration is pending admin approval.",
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your registration request was rejected. Please contact the administrator.",
      });
    }

    const doctor = await Doctor.findOne({ user: user._id }).populate(
      "user",
      "name email"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        doctorId: doctor._id,
        role: "doctor",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      doctor,
    });
  } catch (err) {
    console.error("[DOCTOR_LOGIN_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/**
 * Fetch all doctor profiles with optional search filtering
 * @route GET /api/doctors
 */
const getAllDoctors = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { specialization: searchRegex },
          { department: searchRegex },
          { phone: searchRegex },
          { availability: searchRegex },
        ],
      };

      if (/^[0-9a-fA-F]{24}$/.test(search)) {
        query.$or.push({ _id: search });
      }
    }

    const doctors = await Doctor.find(query)
      .populate("user", "name email status")
      .select("-__v")
      .sort({ createdAt: -1 });

    const formattedDoctors = doctors.map((doctor) => ({
      _id: doctor._id,
      userId: doctor.user?._id,
      name: doctor.user?.name || "",
      email: doctor.user?.email || "",
      status: doctor.user?.status || "approved",
      specialization: doctor.specialization,
      department: doctor.department,
      experience: doctor.experience,
      phone: doctor.phone,
      consultationFee: doctor.consultationFee,
      availability: doctor.availability,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    }));

    return res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: formattedDoctors,
    });
  } catch (error) {
    console.error("[GET_ALL_DOCTORS_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

/**
 * Fetch details of a single doctor profile along with their appointments
 * @route GET /api/doctors/:id
 */
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id)
      .populate("user", "name email")
      .select("-__v");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate(
        "patient",
        "name email phone dateOfBirth gender bloodGroup"
      )
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      message: "Doctor details fetched successfully",
      doctor,
      appointments,
    });
  } catch (error) {
    console.error("[GET_DOCTOR_BY_ID_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch doctor details",
      error: error.message,
    });
  }
};

/**
 * Approve doctor account (Admin access)
 * @route PUT /api/doctors/approve/:id
 */
const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndUpdate(doctor.user, { status: "approved" });

    return res.json({
      success: true,
      message: "Doctor approved successfully",
    });
  } catch (error) {
    console.error("[APPROVE_DOCTOR_ERROR]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reject doctor account (Admin access)
 * @route PUT /api/doctors/reject/:id
 */
const rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndUpdate(doctor.user, { status: "rejected" });

    return res.json({
      success: true,
      message: "Doctor rejected successfully",
    });
  } catch (error) {
    console.error("[REJECT_DOCTOR_ERROR]", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDoctor,
  doctorSelfRegister,
  doctorLogin,
  getAllDoctors,
  getDoctorById,
  approveDoctor,
  rejectDoctor,
};