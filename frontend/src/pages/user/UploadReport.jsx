import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UploadReport.css";

function UploadReport() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasProcessingReport, setHasProcessingReport] =
    useState(false);

  const token = localStorage.getItem("token");

  // ==========================================
  // CHECK IF USER ALREADY HAS A PROCESSING REPORT
  // ==========================================

  useEffect(() => {
    const checkProcessingReport = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/reports/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          const processing = data.reports.some(
            (report) => report.status === "Processing"
          );

          setHasProcessingReport(processing);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkProcessingReport();
  }, [token]);

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleFileChange = (e) => {
    if (hasProcessingReport) return;

    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setMessage("Please select a PDF file only.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage("");
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasProcessingReport) {
      setMessage(
        "Your previous medical report is still being analyzed. Please wait until it is completed before uploading another report."
      );
      return;
    }

    if (!file) {
      setMessage("Please select a medical report PDF.");
      return;
    }

    const formData = new FormData();

    formData.append("report", file);

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/reports/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to upload report"
        );
      }

      setMessage(
        "Report uploaded successfully. AI analysis has started."
      );

      setTimeout(() => {
        navigate("/user/reports");
      }, 1500);

    } catch (error) {
      console.error("Upload Error:", error);
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-report-page">

      {/* Navbar */}

      <nav className="upload-navbar">

        <Link to="/user/dashboard">
          ← Dashboard
        </Link>

        <Link to="/user/reports">
          My Reports
        </Link>

      </nav>

      {/* Main */}

      <main className="upload-container">

        <div className="upload-heading">

          <span>MEDICAL RECORDS</span>

          <h1>Upload Your Report</h1>

          <p>
            Upload a medical report in PDF format and
            our AI will help explain the information
            in simple language.
          </p>

        </div>

        <div className="upload-layout">

          <form
            className="upload-card"
            onSubmit={handleSubmit}
          >

            {hasProcessingReport && (
              <div className="upload-warning-box">
                ⏳ Your previous medical report is
                currently being analyzed.
                <br />
                <br />
                Please wait until it is completed
                before uploading another report.
              </div>
            )}

            <label
              htmlFor="report-file"
              className="file-upload-box"
              style={{
                pointerEvents: hasProcessingReport
                  ? "none"
                  : "auto",
                opacity: hasProcessingReport
                  ? 0.6
                  : 1,
              }}
            >

              <div className="upload-icon">
                📄
              </div>

              {file ? (
                <>
                  <h3>{file.name}</h3>

                  <p>
                    {(file.size / 1024 / 1024).toFixed(
                      2
                    )}{" "}
                    MB
                  </p>
                </>
              ) : (
                <>
                  <h3>
                    Choose your PDF report
                  </h3>

                  <p>
                    Click here to browse your files
                  </p>
                </>
              )}

              <span className="browse-text">
                {file
                  ? "Choose another file"
                  : "Browse PDF"}
              </span>

            </label>

            <input
              id="report-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              hidden
            />

            {message && (
              <div
                className={
                  message.includes("successfully")
                    ? "upload-success"
                    : "upload-error"
                }
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="upload-submit"
              disabled={
                uploading ||
                hasProcessingReport
              }
            >
              {hasProcessingReport
                ? "Previous Report is Processing..."
                : uploading
                ? "Uploading & Analyzing..."
                : "Upload & Analyze Report →"}
            </button>

          </form>

          {/* Information */}

          <div className="upload-info">

            <div className="upload-info-icon">
              ✦
            </div>

            <h2>
              What happens after upload?
            </h2>

            <div className="upload-step">
              <span>01</span>
              <div>
                <strong>
                  Secure Upload
                </strong>
                <p>
                  Your medical report is uploaded
                  securely to the hospital system.
                </p>
              </div>
            </div>

            <div className="upload-step">
              <span>02</span>
              <div>
                <strong>
                  AI Analysis
                </strong>
                <p>
                  Gemini AI reads the report and
                  explains important findings.
                </p>
              </div>
            </div>

            <div className="upload-step">
              <span>03</span>
              <div>
                <strong>
                  Easy Explanation
                </strong>
                <p>
                  You receive a simple summary,
                  recommendations and general
                  medication information.
                </p>
              </div>
            </div>

            <div className="upload-warning">
              <strong>⚠ Important</strong>

              <p>
                AI-generated information may contain
                mistakes. It is not a medical
                diagnosis or prescription. Please
                consult a qualified doctor before
                taking any medication.
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default UploadReport;