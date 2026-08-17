const { GoogleGenAI } = require("@google/genai");
const Doctor = require("../models/Doctor");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Appointment = require("../models/Appointment");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =========================================
// START CHAT
// =========================================

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

    const messages = await Message.find({
      chat: chat._id,
    }).sort("createdAt");

    res.json({
      success: true,
      chat,
      messages,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

const getPatientDoctors = async (req, res) => {
  try {

    console.log("Logged User:", req.user);

    console.log("Searching appointments for patient:", req.user.id);

    const appointments = await Appointment.find({
      patient: req.user.id,
      status:{
      $in:["Pending","Confirmed","Completed"]
    },
    })
    
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email",
        },
      })

      .sort("-createdAt");

      console.log(appointments);

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
        specialization:
          appointment.doctor.specialization,
        chatId: chat._id,
      });
    }

    //=======================//

    console.log("Appointments:", appointments.length);

appointments.forEach((a) => {
  console.log({
    doctorId: a.doctor?._id,
    doctorName: a.doctor?.user?.name,
    status: a.status,
  });
});

console.log("Doctors Sent:", doctors);

//==========================//

    res.json({
      success: true,
      doctors,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// =========================================
// GET MESSAGES
// =========================================

const getMessages = async (req, res) => {

  try {

    const messages = await Message.find({
      chat: req.params.chatId,
    }).sort("createdAt");

    res.json({
      success: true,
      messages,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

// =========================================
// SEND MESSAGE (PATIENT)
// =========================================

const sendMessage = async (req, res) => {

  try {

    const { chatId, message } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success:false,
        message:"Chat not found",
      });
    }

    // Save Patient Message

    const patientMessage = await Message.create({

      chat:chatId,
      senderType:"patient",
      senderId:req.user.id,
      message,

    });

    req.app
      .get("io")
      .to(chatId)
      .emit("new-message", patientMessage);

    // =====================================
    // If Doctor is active
    // =====================================

    if(chat.status==="doctor"){

      return res.json({

        success:true,
        status:"doctor",

      });

    }

    // =====================================
    // Doctor request
    // =====================================

    const lower = message.toLowerCase();

    const wantsDoctor =

      lower.includes("doctor") ||
      lower.includes("human") ||
      lower.includes("consultation") ||
      lower.includes("talk to doctor") ||
      lower.includes("connect doctor");

    if(wantsDoctor){

      chat.doctorRequested=true;

      await chat.save();

      const botReply =
`Your request has been sent to the doctor.

If the doctor is available, they will join this conversation shortly.

Until then, you can continue chatting with the AI Assistant.`;

      const botMessage=await Message.create({

        chat:chatId,
        senderType:"bot",
        message:botReply,

      });

      req.app
      .get("io")
      .to(chatId)
      .emit("new-message",botMessage);

      return res.json({

        success:true,
        reply:botReply,

      });

    }

    // =====================================
    // Gemini Prompt
    // =====================================

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

      model:"gemini-3.5-flash",

      contents:prompt,

    });

    const reply =
      typeof response.text==="function"
      ?response.text().trim()
      :(response.text||"").trim();

    const botMessage=await Message.create({

      chat:chatId,

      senderType:"bot",

      message:reply,

    });

    req.app
    .get("io")
    .to(chatId)
    .emit("new-message",botMessage);

    res.json({

      success:true,

      reply,

      status:"bot",

    });

  }

  catch(err){

    console.error(err);

    res.status(500).json({

      success:false,

      message:err.message,

    });

  }

};

// =========================================
// WAITING CHATS
// =========================================

const getWaitingChats = async (req, res) => {

  try {

    const doctor = await Doctor.findOne({
      user: req.user.id,
    });

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

    res.json({
      success: true,
      chats,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};



// =========================================
// DOCTOR JOIN CHAT
// =========================================

const joinChat = async (req, res) => {

  try {

    const doctor = await Doctor.findOne({
      user: req.user.id,
    });

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

      message:
        "👨‍⚕️ Doctor has joined the conversation.",

    });

    req.app
      .get("io")
      .to(chat._id.toString())
      .emit("new-message", systemMessage);

    res.json({

      success: true,

      chat,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};



// =========================================
// DOCTOR SEND MESSAGE
// =========================================

const doctorSendMessage = async (req, res) => {

  try {

    const { chatId, message } = req.body;

    const doctor = await Doctor.findOne({
      user: req.user.id,
    });

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

    req.app
      .get("io")
      .to(chatId)
      .emit("new-message", doctorMessage);

    res.json({

      success: true,

      message: doctorMessage,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};

// =========================================
// DOCTOR ACTIVE CHATS
// =========================================

const getMyChats = async (req, res) => {

  try {

    const doctor = await Doctor.findOne({
      user: req.user.id,
    });

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

    res.json({

      success: true,

      chats,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};

// =========================================
// END CHAT
// =========================================

const endChat = async (req, res) => {

  try {

    const doctor = await Doctor.findOne({
      user: req.user.id,
    });

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

    res.json({

      success: true,

      message: "Chat ended",

    });

  } catch (err) {

    res.status(500).json({

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