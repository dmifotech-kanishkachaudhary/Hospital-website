const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================================================
// ADMIN - CREATE DOCTOR
// ======================================================

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

    // Check existing user
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Doctor email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create login account
    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      phone,

      // Required fields from User schema
      dateOfBirth: new Date("1990-01-01"),
      gender: "Prefer not to say",

      role: "doctor",
      status:"approved",
    });

    // Create doctor profile
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

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};


// ======================================================
// DOCTOR SELF REGISTER
// ======================================================

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

    // Check email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,

      role: "doctor",
      status: "pending",

      // Required fields
      dateOfBirth: new Date("1990-01-01"),
      gender: "Prefer not to say",
    });

    // Create Doctor Profile
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
      message:
        "Registration successful. Wait until admin approves your account.",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ===========================================
// GET ALL DOCTORS
// =============================================

const getAllDoctors = async (req, res) => {
  try {
    const search =
      req.query.search?.trim() || "";

    let query = {};

    // ==================================================
    // SEARCH
    // ==================================================

    if (search) {
      const searchRegex =
        new RegExp(search, "i");

      query = {
        $or: [
          {
            name: searchRegex,
          },
          {
            email: searchRegex,
          },
          {
            specialization: searchRegex,
          },
          {
            department: searchRegex,
          },
          {
            phone: searchRegex,
          },
          {
            availability: searchRegex,
          },
        ],
      };

      // Search by MongoDB Doctor ID
      if (
        /^[0-9a-fA-F]{24}$/.test(search)
      ) {
        query.$or.push({
          _id: search,
        });
      }
    }

    // ==================================================
    // FETCH DOCTORS
    // ==================================================

    const doctors = await Doctor.find(query)
  .populate("user", "name email status")
  .select("-__v")
  .sort({
    createdAt: -1,
  });

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
    console.error(
      "Get Doctors Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch doctors",

      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE DOCTOR
// Doctor + Related Appointments
// ======================================================

const getDoctorById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // ==================================================
    // FIND DOCTOR
    // ==================================================

    const doctor =
      await Doctor.findById(id)
      .populate(
          "user",
          "name email"
      )
      .select(
        "-__v"
      );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // ==================================================
    // GET DOCTOR APPOINTMENTS
    // ==================================================

    const appointments =
      await Appointment.find({
        doctor: doctor._id,
      })
        .populate(
          "patient",
          "name email phone dateOfBirth gender bloodGroup"
        )
        .sort({
          date: -1,
          createdAt: -1,
        });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message:
        "Doctor details fetched successfully",

      doctor,

      appointments,
    });
  } catch (error) {
    console.error(
      "Get Doctor Details Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch doctor details",

      error: error.message,
    });
  }
};

// ======================================================
// APPROVE DOCTOR
// ======================================================

const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    console.log("Doctor:", doctor);
    console.log("Doctor User:", doctor.user);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndUpdate(
      doctor.user,
      {
        status: "approved",
      }
    );

    

    return res.json({
      success: true,
      message: "Doctor approved successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================================
// REJECT DOCTOR
// ======================================================

const rejectDoctor = async (req, res) => {
  try {

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await User.findByIdAndUpdate(
      doctor.user,
      {
        status: "rejected",
      }
    );

    return res.json({
      success: true,
      message: "Doctor rejected successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

//Doctor Login//

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

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Check doctor approval status
if (user.status === "pending") {
  return res.status(403).json({
    success: false,
    message:
      "Your registration is pending admin approval.",
  });
}

if (user.status === "rejected") {
  return res.status(403).json({
    success: false,
    message:
      "Your registration request was rejected. Please contact the administrator.",
  });
}

    const doctor = await Doctor.findOne({
      user: user._id,
    }).populate("user", "name email");

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
      {
        expiresIn: "1d",
      }
    );

    res.json({
      success: true,
      token,
      doctor,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


// ================================================
// EXPORT
// ================================================

module.exports = {
  createDoctor,
  doctorSelfRegister,
  doctorLogin,
  getAllDoctors,
  getDoctorById,
  approveDoctor,
  rejectDoctor,
};