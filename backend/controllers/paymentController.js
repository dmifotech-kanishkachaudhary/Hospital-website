/**
 * @file paymentController.js
 * @description Razorpay payment order creation and cryptographic payment signature verification.
 */

const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

/**
 * Create a new Razorpay payment order
 * @route POST /api/payment/create-order
 */
const createOrder = async (req, res) => {
  try {
    const amount = 500; // Fixed consultation fee amount

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order,
      key: process.env.PAYMENT_API_KEY,
    });
  } catch (err) {
    console.error("[RAZORPAY_CREATE_ORDER_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Verify Razorpay payment HMAC SHA256 signature and finalize appointment creation
 * @route POST /api/payment/verify
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentData,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.PAYMENT_API_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const doctor = await Doctor.findById(appointmentData.doctor);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: appointmentData.doctor,
      department: appointmentData.department,
      date: appointmentData.date,
      time: appointmentData.time,
      reason: appointmentData.reason,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentStatus: "Paid",
      amount: 500,
    });

    return res.json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR]", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};