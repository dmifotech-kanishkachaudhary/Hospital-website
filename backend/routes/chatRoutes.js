const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const doctorOnly = require("../middleware/doctorMiddleware");

const {
  startChat,
  getPatientDoctors,
  getMessages,
  sendMessage,
  getWaitingChats,
  joinChat,
  doctorSendMessage,
  getMyChats,
  endChat,
} = require("../controllers/chatController");

// ===============================
// Patient
// ===============================

router.get(
  "/my-doctors",
  protect,
  getPatientDoctors
);

router.post(
  "/start",
  protect,
  startChat
);

router.post(
  "/send",
  protect,
  sendMessage
);

// ===============================
// Doctor
// ===============================

router.get(
  "/waiting",
  protect,
  doctorOnly,
  getWaitingChats
);

router.post(
  "/join/:id",
  protect,
  doctorOnly,
  joinChat
);

router.post(
  "/doctor-message",
  protect,
  doctorOnly,
  doctorSendMessage
);

router.get(
  "/active",
  protect,
  doctorOnly,
  getMyChats
);

router.put(
  "/end/:id",
  protect,
  doctorOnly,
  endChat
);

// ===============================
// Messages
// ===============================

router.get(
  "/:chatId/messages",
  protect,
  getMessages
);

module.exports = router;