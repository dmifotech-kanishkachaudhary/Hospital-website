/**
 * @file server.js
 * @description Main application server entry point for Hospital Management API.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Database & Socket Configurations
const connectDB = require("./config/db");
const initSocketHandler = require("./sockets/socketHandler");

// Route Handlers
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

// ----------------------------------------------------
// 1. Database Connection
// ----------------------------------------------------
connectDB();

// ----------------------------------------------------
// 2. Middleware & CORS Configuration
// ----------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://city-hospitall.netlify.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// ----------------------------------------------------
// 3. API Routes
// ----------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reports", medicalReportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/doctor", doctorDashboardRoutes);

// Health Check Endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Hospital Dashboard API running",
  });
});

// ----------------------------------------------------
// 4. Socket.io Real-Time Server Setup
// ----------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach Socket Instance to App for Controller Access
app.set("io", io);

// Initialize Socket Event Handlers
initSocketHandler(io);

// ----------------------------------------------------
// 5. Server Initialization
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[SERVER] Hospital Dashboard API running on port ${PORT}`);
});