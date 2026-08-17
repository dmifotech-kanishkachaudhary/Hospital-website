const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


// ======================================================
// MEDICAL REPORT ANALYSIS EMAIL
// ======================================================

const sendReportAnalysisEmail = async ({
  email,
  name,
  reportName,
  analysis,
}) => {

  const mailOptions = {
    from: `"City Hospital" <${process.env.EMAIL_USER}>`,

    to: email,

    subject:
      `AI Analysis of Your Medical Report - ${reportName}`,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">

        <h2>City Hospital</h2>

        <p>Hello ${name || "Patient"},</p>

        <p>
          Your medical report
          <strong>${reportName}</strong>
          has been analyzed by our AI system.
        </p>

        <hr />

        <h3>Summary</h3>

        <p>
          ${analysis.summary || "Not available"}
        </p>

        <h3>Key Findings</h3>

        <ul>
          ${
            (analysis.keyFindings || [])
              .map(
                (item) =>
                  `<li>${item}</li>`
              )
              .join("")
          }
        </ul>

        <h3>Possible Concerns</h3>

        <ul>
          ${
            (analysis.possibleConcerns || [])
              .map(
                (item) =>
                  `<li>${item}</li>`
              )
              .join("")
          }
        </ul>

        <h3>Common Medication Information</h3>

        <ul>
          ${
            (
              analysis.commonMedicationInformation ||
              []
            )
              .map(
                (item) =>
                  `<li>${item}</li>`
              )
              .join("")
          }
        </ul>

        <h3>General Recommendations</h3>

        <ul>
          ${
            (analysis.generalRecommendations || [])
              .map(
                (item) =>
                  `<li>${item}</li>`
              )
              .join("")
          }
        </ul>

        <h3>Doctor's Advice</h3>

        <p>
          ${
            analysis.doctorAdvice ||
            "Please consult your doctor."
          }
        </p>

        <hr />

        <p style="font-size: 13px; color: #777;">

          <strong>Important:</strong>

          ${
            analysis.disclaimer ||
            "This information is AI-generated and may contain mistakes. It is not a medical diagnosis or prescription. Please consult a qualified doctor before taking any medication or making medical decisions."
          }

        </p>

        <p>
          Regards,<br />
          <strong>City Hospital</strong>
        </p>

      </div>
    `,
  };

  await transporter.sendMail(
    mailOptions
  );
};


// ======================================================
// OTP EMAIL
// ======================================================

const sendLoginOtpEmail = async ({
  email,
  name,
  otp,
}) => {

  const mailOptions = {
    from: `"City Hospital" <${process.env.EMAIL_USER}>`,

    to: email,

    subject:
      "Your City Hospital Login OTP",

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          color: #3d342b;
        "
      >

        <h2 style="color: #687957;">
          City Hospital
        </h2>

        <p>
          Hello ${name || "Patient"},
        </p>

        <p>
          You requested to login to your
          City Hospital account using OTP.
        </p>

        <div
          style="
            margin: 30px 0;
            padding: 20px;
            text-align: center;
            background: #f3ede3;
            border-radius: 12px;
          "
        >

          <p
            style="
              margin: 0 0 10px;
              font-size: 13px;
              color: #81776c;
            "
          >
            Your Login OTP
          </p>

          <strong
            style="
              font-size: 32px;
              letter-spacing: 8px;
              color: #3d342b;
            "
          >
            ${otp}
          </strong>

        </div>

        <p>
          This OTP is valid for
          <strong>5 minutes</strong>.
        </p>

        <p
          style="
            font-size: 13px;
            color: #777;
          "
        >
          If you did not request this login,
          you can safely ignore this email.
        </p>

        <p>
          Regards,<br />
          <strong>City Hospital</strong>
        </p>

      </div>
    `,
  };

  await transporter.sendMail(
    mailOptions
  );
};


module.exports = {
  sendReportAnalysisEmail,
  sendLoginOtpEmail,
};