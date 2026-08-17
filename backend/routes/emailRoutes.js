const express = require("express");

const {
  sendReportAnalysisEmail,
} = require("../utils/emailService");

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    await sendReportAnalysisEmail({
      email,
      name: "Test Patient",
      reportName: "Test CBC Report",

      analysis: {
        summary:
          "This is a test email from City Hospital.",

        keyFindings: [
          "This is a test finding",
          "Email service is being tested",
        ],

        possibleConcerns: [],

        commonMedicationInformation: [],

        generalRecommendations: [
          "Please consult a qualified doctor for medical advice.",
        ],

        doctorAdvice:
          "This is only a test email.",

        disclaimer:
          "This information is AI-generated and may contain mistakes. It is not a medical diagnosis or prescription.",
      },
    });

    res.status(200).json({
      message: "Test email sent successfully",
    });

  } catch (error) {
    console.error("Email Error:", error);

    res.status(500).json({
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

module.exports = router;