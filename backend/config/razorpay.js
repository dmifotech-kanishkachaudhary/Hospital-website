/**
 * @file razorpay.js
 * @description Razorpay payment gateway client instance configuration.
 */

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.PAYMENT_API_KEY,
  key_secret: process.env.PAYMENT_API_SECRET,
});

module.exports = razorpay;