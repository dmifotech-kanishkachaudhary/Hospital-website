const { PDFParse } = require("pdf-parse");

const MedicalReport = require("../models/MedicalReport");
const User = require("../models/User");

const {
  generateReportAnalysis,
} = require("./aiController");

const {
  sendReportAnalysisEmail,
} = require("../utils/emailService");


// ======================================================
// CREATE MEDICAL REPORT
// Upload PDF + Extract Text + Start AI Analysis
// ======================================================

const createMedicalReport = async (req, res) => {
  try {
    const {
      reportName,
      reportType,
    } = req.body;

    // Check PDF file
    if (!req.file) {
      return res.status(400).json({
        message: "Medical report PDF is required",
      });
    }

    // Only PDF allowed
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        message: "Only PDF medical reports are allowed",
      });
    }

    // ==================================================
// CHECK IF PREVIOUS REPORT IS STILL PROCESSING
// ==================================================

const processingReport = await MedicalReport.findOne({
  patient: req.user.id,
  status: "Processing",
});

if (processingReport) {
  return res.status(400).json({
    message:
      "Your previous report is still being analyzed. Please wait until it is completed before uploading another report.",
  });
}


    // ==================================================
    // REPORT DETAILS
    // ==================================================

    const finalReportName =
      reportName ||
      req.file.originalname.replace(/\.pdf$/i, "");

    const finalReportType =
      reportType || "Medical Report";

    // ==================================================
    // READ PDF FROM MEMORY
    // ==================================================

    const parser = new PDFParse({
      data: req.file.buffer,
    });

    const pdfData = await parser.getText();

    const reportText = pdfData.text;

    await parser.destroy();

    // Check extracted text
    if (!reportText || !reportText.trim()) {
      return res.status(400).json({
        message:
          "Could not extract text from PDF. Please upload a text-based PDF.",
      });
    }

    // ==================================================
    // FIND USER
    // ==================================================

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==================================================
    // SAVE REPORT IN DATABASE
    // ==================================================

    const report = await MedicalReport.create({
      patient: req.user.id,

      reportName: finalReportName,
      reportType: finalReportType,

      fileName: req.file.originalname,

      filePath: null,

      reportText,

      status: "Processing",

      aiAnalysis: null,

      emailSent: false,
    });

    // ==================================================
    // START AI PROCESSING IN BACKGROUND
    // ==================================================

    processReportInBackground(
      report._id,
      reportText,
      user.email,
      user.name,
      finalReportName
    );

    // ==================================================
    // IMMEDIATE RESPONSE
    // ==================================================

    return res.status(202).json({
      message:
        "Your report has been uploaded successfully. It is being analyzed by our AI system. You can explore other features while we process your report. The analysis will be sent to your registered email once it is ready.",

      report: {
        id: report._id,
        reportName: report.reportName,
        reportType: report.reportType,
        status: report.status,
      },
    });

  } catch (error) {
    console.error(
      "Medical Report Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to process medical report",
      error: error.message,
    });
  }
};


// ======================================================
// BACKGROUND AI PROCESSING
// ======================================================

const processReportInBackground = async (
  reportId,
  reportText,
  email,
  name,
  reportName
) => {

  try {

    console.log(
      "Starting AI analysis for report:",
      reportId.toString()
    );

    // ==================================================
    // GEMINI ANALYSIS
    // ==================================================

    const analysisText =
      await generateReportAnalysis(
        reportText
      );

    let analysis;

    // Convert Gemini JSON response into object
    try {

      analysis = JSON.parse(
        analysisText
      );

    } catch (error) {

      console.log(
        "Gemini response was not valid JSON. Saving raw response."
      );

      analysis = {
        rawResponse: analysisText,
      };
    }

    // ==================================================
    // FIND REPORT
    // ==================================================

    const report =
      await MedicalReport.findById(
        reportId
      );

    if (!report) {

      console.error(
        "Report not found:",
        reportId
      );

      return;
    }

    // ==================================================
    // SAVE AI ANALYSIS
    // ==================================================

    report.aiAnalysis = analysis;

    report.status = "Analyzed";

    await report.save();

    console.log(
      "AI analysis completed:",
      reportId.toString()
    );

    // ==================================================
    // SEND EMAIL
    // ==================================================

    try {

      await sendReportAnalysisEmail({
        email,
        name,
        reportName,
        analysis,
      });

      report.emailSent = true;

      await report.save();

      console.log(
        "Report analysis email sent to:",
        email
      );

    } catch (emailError) {

      console.error(
        "Email sending failed:",
        emailError
      );

      // AI analysis succeeded even if email fails
      report.emailSent = false;

      await report.save();
    }

  } catch (error) {

    console.error(
      "Background report processing failed:",
      error
    );

    // ==================================================
    // MARK REPORT AS FAILED
    // ==================================================

    try {

      await MedicalReport.findByIdAndUpdate(
        reportId,
        {
          status: "Failed",
        }
      );

    } catch (dbError) {

      console.error(
        "Failed to update report status:",
        dbError
      );
    }
  }
};


// ======================================================
// GET LOGGED-IN USER'S REPORTS
// ======================================================

const getMyReports = async (req, res) => {

  try {

    const reports =
      await MedicalReport.find({
        patient: req.user.id,
      })
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "Reports fetched successfully",

      reports,
    });

  } catch (error) {

    return res.status(500).json({
      message:
        "Failed to fetch reports",

      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE REPORT
// ======================================================

const getReportById = async (req, res) => {

  try {

    const report =
      await MedicalReport.findById(
        req.params.id
      );

    // Report doesn't exist
    if (!report) {

      return res.status(404).json({
        message: "Report not found",
      });
    }

    // ==================================================
    // SECURITY CHECK
    // User can only access their own report
    // ==================================================

    if (
      report.patient.toString() !==
      req.user.id
    ) {

      return res.status(403).json({
        message: "Access denied",
      });
    }

    return res.status(200).json({
      report,
    });

  } catch (error) {

    return res.status(500).json({
      message:
        "Failed to fetch report",

      error: error.message,
    });
  }
};


// ======================================================
// ADMIN - GET ALL MEDICAL REPORTS
// ======================================================

const getAllReports = async (req, res) => {

  try {

    const reports =
      await MedicalReport.find()
        .populate(
          "patient",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "All medical reports fetched successfully",

      reports,
    });

  } catch (error) {

    console.error(
      "Get All Reports Error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch medical reports",

      error: error.message,
    });
  }
};

// ======================================================
// ADMIN - SINGLE REPORT
// ======================================================

const getReportByIdAdmin = async (req, res) => {
  try {

    const report = await MedicalReport.findById(req.params.id)
      .populate("patient", "name email");

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    return res.status(200).json({
      report,
    });

  } catch (error) {

    return res.status(500).json({
      message: "Failed to fetch report",
      error: error.message,
    });

  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createMedicalReport,
  getMyReports,
  getReportById,
  getAllReports,
  getReportByIdAdmin,
};