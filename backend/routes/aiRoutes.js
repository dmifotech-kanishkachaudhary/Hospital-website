const express = require("express");

const {
  analyzeReport,
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/analyze", protect, analyzeReport);

module.exports = router;