/**
 * @file aiController.js
 * @description Google Gemini AI service controller for analyzing medical laboratory reports.
 */

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Core helper function to send medical report text to Gemini and receive structured JSON response.
 * @param {string} reportText - Extracted text content of medical report PDF
 * @returns {Promise<string>} Gemini response text string
 */
const generateReportAnalysis = async (reportText) => {
  const prompt = `
You are an experienced medical report explanation assistant for a hospital management system.

Your job is to explain laboratory reports in simple, patient-friendly English while remaining medically responsible.

Analyze the following report and return ONLY valid JSON.

Medical Report:
${reportText}

Return exactly this JSON structure:

{
  "summary": "",
  "keyFindings": [],
  "abnormalValues": [],
  "possibleConcerns": [],
  "commonMedicationInformation": [],
  "generalRecommendations": [],
  "doctorAdvice": "",
  "disclaimer": "This information is AI-generated and may contain mistakes. It is not a medical diagnosis or prescription. Please consult a qualified doctor before taking any medication or making medical decisions."
}

Instructions:

1. Return ONLY valid JSON.
2. Do not wrap the JSON inside markdown.
3. Do not include explanations outside the JSON.
4. The "summary" must be a well-written paragraph (5-8 sentences), not a single line.
5. Explain the overall health status in simple language.
6. Mention important normal findings as well as abnormal findings.
7. If everything is normal, clearly mention that no major abnormalities were found.
8. "keyFindings" should contain short bullet-style statements.
9. "abnormalValues" should contain only abnormal parameters.
10. If no abnormal values exist, return an empty array [].
11. "possibleConcerns" should contain possible medical concerns only if supported by the report.
12. Never diagnose diseases.
13. Never prescribe medicines.
14. "commonMedicationInformation" may contain only general information about medications commonly used for such conditions, never dosage or prescriptions.
15. "generalRecommendations" should contain 4-6 practical lifestyle recommendations.
16. "doctorAdvice" should be written as a natural paragraph, as if a doctor is giving general advice.
17. Use clear, professional English suitable for both patients and doctors.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text;
};

/**
 * Controller endpoint to execute AI analysis directly from API request
 * @route POST /api/ai/analyze
 */
const analyzeReport = async (req, res) => {
  try {
    const { reportText } = req.body;

    if (!reportText) {
      return res.status(400).json({ message: "Report text is required" });
    }

    const analysis = await generateReportAnalysis(reportText);

    return res.status(200).json({
      message: "Report analyzed successfully",
      analysis,
    });
  } catch (error) {
    console.error("[AI_ANALYSIS_ERROR]", error);
    return res.status(500).json({
      message: "AI analysis failed",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeReport,
  generateReportAnalysis,
};