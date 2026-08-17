require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medicalReportRoutes = require("./routes/medicalReportRoutes");
const emailRoutes = require("./routes/emailRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const doctorDashboardRoutes = require("./routes/doctorDashboardRoutes");

const app = express();
const server = http.createServer(app);

// =======================================
// DATABASE
// =======================================

connectDB();

// =======================================
// MIDDLEWARE
// =======================================

app.use(cors());

app.use(express.json());

// =======================================
// ROUTES
// =======================================

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reports", medicalReportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/doctor", doctorDashboardRoutes);

// =======================================
// HOME
// =======================================

app.get("/", (req, res) => {
  res.json({
    message: "Hospital Dashboard API running",
  });
});

// =======================================
// SOCKET.IO
// =======================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://city-hospitall.netlify.app/"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// Optional
const onlineUsers = {};

io.on("connection", (socket) => {

  // ===========================
  // Register User
  // ===========================

  socket.on("register", (userId) => {

    if (!userId) return;

    onlineUsers[userId] = socket.id;

  });

  // ===========================
  // Join Chat Room
  // ===========================

  socket.on("joinChat", (chatId) => {

    if (!chatId) return;

    socket.join(chatId);

  });

  // ===========================
  // Doctor Joined
  // ===========================

  socket.on("doctorJoined", (data) => {

    if (!data?.chatId) return;

    io.to(data.chatId).emit("doctorJoined", data);

  });

  // ===========================
  // Doctor Left
  // ===========================

  socket.on("doctorLeft", (data) => {

    if (!data?.chatId) return;

    io.to(data.chatId).emit("doctorLeft", data);

  });

  // ===========================
  // Typing
  // ===========================

  socket.on("typing", (data) => {

    if (!data?.chatId) return;

    socket.to(data.chatId).emit("typing", data);

  });

  socket.on("stopTyping", (data) => {

    if (!data?.chatId) return;

    socket.to(data.chatId).emit("stopTyping");

  });

  // ===========================
  // Disconnect
  // ===========================

  socket.on("disconnect", () => {

    Object.keys(onlineUsers).forEach((id) => {

      if (onlineUsers[id] === socket.id) {

        delete onlineUsers[id];

      }

    });

  });

});

// =======================================

app.set("io", io);

// =======================================
// START SERVER
// =======================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});