/**
 * @file chatController.js
 * @description Real-time Patient-Doctor and AI Consultation Chat Controller using Google Gemini AI.
 */

const { GoogleGenAI } = require("@google/genai");
const Doctor = require("../models/Doctor");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Appointment = require("../models/Appointment");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Initialize or fetch existing chat room with a doctor
 * @route POST /api/chat/start
 */
const startChat = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID required",
      });
    }

    let chat = await Chat.findOne({
      patient: patientId,
      doctor: doctorId,
    });

    if (!chat) {
      chat = await Chat.create({
        patient: patientId,
        doctor: doctorId,
        status: "bot",
        doctorRequested: false,
      });
    }

    const messages = await Message.find({ chat: chat._id }).sort("createdAt");

    return res.json({
      success: true,
      chat,
      messages,
    });
  } catch (err) {
    console.error("[START_CHAT_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get list of doctors associated with the logged-in patient's appointments
 * @route GET /api/chat/patient-doctors
 */
const getPatientDoctors = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.id,
      status: { $in: ["Pending", "Confirmed", "Completed"] },
    })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort("-createdAt");

    const doctors = [];
    const added = new Set();

    for (const appointment of appointments) {
      if (!appointment.doctor) continue;

      const id = appointment.doctor._id.toString();
      if (added.has(id)) continue;
      added.add(id);

      let chat = await Chat.findOne({
        patient: req.user.id,
        doctor: appointment.doctor._id,
      });

      if (!chat) {
        chat = await Chat.create({
          patient: req.user.id,
          doctor: appointment.doctor._id,
          status: "bot",
        });
      }

      doctors.push({
        doctorId: appointment.doctor._id,
        doctorName: appointment.doctor.user.name,
        specialization: appointment.doctor.specialization,
        chatId: chat._id,
      });
    }

    return res.json({
      success: true,
      doctors,
    });
  } catch (err) {
    console.error("[GET_PATIENT_DOCTORS_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Fetch historical messages for a chat room
 * @route GET /api/chat/messages/:chatId
 */
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    }).sort("createdAt");

    return res.json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("[GET_MESSAGES_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Process incoming patient message (handles doctor active state, handover request, or AI bot response)
 * @route POST /api/chat/send
 */
const sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Save Patient Message
    const patientMessage = await Message.create({
      chat: chatId,
      senderType: "patient",
      senderId: req.user.id,
      message,
    });

    req.app.get("io").to(chatId).emit("new-message", patientMessage);

    // If Doctor is active in chat room
    if (chat.status === "doctor") {
      return res.json({
        success: true,
        status: "doctor",
      });
    }

    // Check if patient requests a human doctor consultation
    const lower = message.toLowerCase();
    const wantsDoctor =
      lower.includes("doctor") ||
      lower.includes("human") ||
      lower.includes("consultation") ||
      lower.includes("talk to doctor") ||
      lower.includes("connect doctor");

    if (wantsDoctor) {
      chat.doctorRequested = true;
      await chat.save();

      const botReply = `Your request has been sent to the doctor.

If the doctor is available, they will join this conversation shortly.

Until then, you can continue chatting with the AI Assistant.`;

      const botMessage = await Message.create({
        chat: chatId,
        senderType: "bot",
        message: botReply,
      });

      req.app.get("io").to(chatId).emit("new-message", botMessage);

      return res.json({
        success: true,
        reply: botReply,
      });
    }

    // Generate AI Bot Response via Gemini
    const prompt = `
You are City Hospital AI Assistant.

Answer ONLY healthcare related questions.

Never say HANDOVER_DOCTOR.

For fever/cold/headache/acidity recommend only common OTC medicines.

Never prescribe antibiotics.

If symptoms are serious advise immediate hospital visit.

Always end medicine advice with:

This is AI-generated health information and should not replace professional medical advice. Please consult a doctor before taking any medicine.

Patient:

${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reply =
      typeof response.text === "function"
        ? response.text().trim()
        : (response.text || "").trim();

    const botMessage = await Message.create({
      chat: chatId,
      senderType: "bot",
      message: reply,
    });

    req.app.get("io").to(chatId).emit("new-message", botMessage);

    return res.json({
      success: true,
      reply,
      status: "bot",
    });
  } catch (err) {
    console.error("[SEND_MESSAGE_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Fetch chats waiting for doctor assistance
 * @route GET /api/chat/waiting
 */
const getWaitingChats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const chats = await Chat.find({
      doctor: doctor._id,
      status: "bot",
      doctorRequested: true,
    })
      .populate("patient", "name email phone")
      .sort("-updatedAt");

    return res.json({
      success: true,
      chats,
    });
  } catch (err) {
    console.error("[GET_WAITING_CHATS_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Join active chat session as doctor
 * @route PUT /api/chat/join/:id
 */
const joinChat = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    chat.status = "doctor";
    chat.doctorRequested = false;

    await chat.save();

    const systemMessage = await Message.create({
      chat: chat._id,
      senderType: "system",
      message: "👨‍⚕️ Doctor has joined the conversation.",
    });

    req.app
      .get("io")
      .to(chat._id.toString())
      .emit("new-message", systemMessage);

    return res.json({
      success: true,
      chat,
    });
  } catch (err) {
    console.error("[JOIN_CHAT_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Send message as doctor in active chat
 * @route POST /api/chat/doctor-send
 */
const doctorSendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      doctor: doctor._id,
      status: "doctor",
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not assigned",
      });
    }

    const doctorMessage = await Message.create({
      chat: chatId,
      senderType: "doctor",
      senderId: doctor._id,
      message,
    });

    req.app.get("io").to(chatId).emit("new-message", doctorMessage);

    return res.json({
      success: true,
      message: doctorMessage,
    });
  } catch (err) {
    console.error("[DOCTOR_SEND_MESSAGE_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Fetch all active doctor chats
 * @route GET /api/chat/my-chats
 */
const getMyChats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const chats = await Chat.find({
      doctor: doctor._id,
      status: "doctor",
    })
      .populate("patient", "name email phone")
      .sort("-updatedAt");

    return res.json({
      success: true,
      chats,
    });
  } catch (err) {
    console.error("[GET_MY_CHATS_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * End doctor chat session and hand back to AI bot
 * @route PUT /api/chat/end/:id
 */
const endChat = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      doctor: doctor._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    chat.status = "bot";
    chat.doctorRequested = false;

    await chat.save();

    const systemMessage = await Message.create({
      chat: chat._id,
      senderType: "system",
      message:
        "👨‍⚕️ Doctor has left the conversation. AI Assistant is active again.",
    });

    req.app
      .get("io")
      .to(chat._id.toString())
      .emit("new-message", systemMessage);

    return res.json({
      success: true,
      message: "Chat ended",
    });
  } catch (err) {
    console.error("[END_CHAT_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  startChat,
  getPatientDoctors,
  getMessages,
  sendMessage,
  getWaitingChats,
  joinChat,
  doctorSendMessage,
  getMyChats,
  endChat,
};