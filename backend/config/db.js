/**
 * @file db.js
 * @description MongoDB Connection configuration using Mongoose.
 */

const mongoose = require("mongoose");

/**
 * Establishes connection to MongoDB database using URI from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host || "Successful"}`);
  } catch (error) {
    console.error("[DATABASE_ERROR] Connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;