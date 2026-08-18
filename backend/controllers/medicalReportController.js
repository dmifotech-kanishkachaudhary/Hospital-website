/**
 * @file medicalReportController.js
 * @description Medical report PDF upload, text extraction, background AI analysis, and retrieval.
 */

const { PDFParse } = require("pdf-parse");
const MedicalReport = require("../models/MedicalReport");
const User = require("../models/User");
const { generateReportAnalysis } = require("./aiController");
const { sendReportAnalysisEmail } = require("../utils/emailService");

/**
 * Background worker task to execute AI analysis on uploaded report text and send notification email.
 */
const processReportInBackground = async (
  reportId,
  reportText,
  email,
  name,
  reportName
) => {
  try {
    console.log(`[REPORT_AI_PROCESS] Starting AI analysis for report ID: ${reportId}`);

    const analysisText = await generateReportAnalysis(reportText);

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (error) {
      console.warn("[REPORT_AI_PROCESS] Gemini response was not valid JSON. Storing raw response text.");
      analysis = { rawResponse: analysisText };
    }

    const report = await MedicalReport.findById(reportId);
    if (!report) {
      console.error(`[REPORT_AI_PROCESS_ERROR] Report not found: ${reportId}`);
      return;
    }

    report.aiAnalysis = analysis;
    report.status = "Analyzed";
    await report.save();

    console.log(`[REPORT_AI_PROCESS] AI analysis saved for report ID: ${reportId}`);

    // Send email notification with analysis
    try {
      await sendReportAnalysisEmail({
        email,
        name,
        reportName,
        analysis,
      });

      report.emailSent = true;
      await report.save();
      console.log(`[REPORT_EMAIL_SUCCESS] Report analysis email sent to: ${email}`);
    } catch (emailError) {
      console.error("[REPORT_EMAIL_ERROR] Email dispatch failed:", emailError);
      report.emailSent = false;
      await report.save();
    }
  } catch (error) {
    console.error("[REPORT_BG_PROCESS_ERROR] Background report processing failed:", error);
    try {
      await MedicalReport.findByIdAndUpdate(reportId, { status: "Failed" });
    } catch (dbError) {
      console.error("[REPORT_STATUS_UPDATE_ERROR] Failed to update failed status:", dbError);
    }
  }
};

/**
 * Upload medical report PDF, extract text content, and trigger background AI processing
 * @route POST /api/reports/upload
 */
const createMedicalReport = async (req, res) => {
  try {
    const { reportName, reportType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Medical report PDF is required" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF medical reports are allowed" });
    }

    // Check if patient already has a report currently processing
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

    const finalReportName =
      reportName || req.file.originalname.replace(/\.pdf$/i, "");
    const finalReportType = reportType || "Medical Report";

    // Extract text from PDF buffer
    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const reportText = pdfData.text;
    await parser.destroy();

    if (!reportText || !reportText.trim()) {
      return res.status(400).json({
        message: "Could not extract text from PDF. Please upload a text-based PDF.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

    // Start background processing
    processReportInBackground(
      report._id,
      reportText,
      user.email,
      user.name,
      finalReportName
    );

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
    console.error("[CREATE_MEDICAL_REPORT_ERROR]", error);
    return res.status(500).json({
      message: "Failed to process medical report",
      error: error.message,
    });
  }
};

/**
 * Fetch medical reports owned by the logged-in user
 * @route GET /api/reports/my-reports
 */
const getMyReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ patient: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Reports fetched successfully",
      reports,
    });
  } catch (error) {
    console.error("[GET_MY_REPORTS_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

/**
 * Fetch a single medical report by ID (with patient ownership security check)
 * @route GET /api/reports/:id
 */
const getReportById = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ report });
  } catch (error) {
    console.error("[GET_REPORT_BY_ID_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

/**
 * Fetch all medical reports (Admin access)
 * @route GET /api/reports/admin/all
 */
const getAllReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find()
      .populate("patient", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All medical reports fetched successfully",
      reports,
    });
  } catch (error) {
    console.error("[GET_ALL_REPORTS_ADMIN_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch medical reports",
      error: error.message,
    });
  }
};

/**
 * Fetch single medical report by ID for Admin (Admin access)
 * @route GET /api/reports/admin/:id
 */
const getReportByIdAdmin = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id).populate(
      "patient",
      "name email"
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({ report });
  } catch (error) {
    console.error("[GET_REPORT_BY_ID_ADMIN_ERROR]", error);
    return res.status(500).json({
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

module.exports = {
  createMedicalReport,
  getMyReports,
  getReportById,
  getAllReports,
  getReportByIdAdmin,
};