import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../../config";
import "./Reports.css";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          `${API}/api/reports/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setReports(data.reports || []);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Reports Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  return (
    <div className="reports-page">

      {/* Navbar */}
      <nav className="reports-navbar">
        <Link to="/user/dashboard" className="reports-logo">
          <span>✚</span>

          <div>
            <strong>City Hospital</strong>
            <small>Patient Portal</small>
          </div>
        </Link>

        <Link
          to="/user/upload-report"
          className="upload-report-btn"
        >
          + Upload Report
        </Link>
      </nav>

      {/* Header */}
      <section className="reports-header">
        <span>MEDICAL RECORDS</span>

        <h1>My Medical Reports</h1>

        <p>
          View your uploaded reports and AI-powered
          health explanations.
        </p>
      </section>

      {/* Reports */}
      <section className="reports-container">

        {loading ? (
          <div className="reports-empty">
            <div className="loading-icon">⏳</div>
            <h3>Loading your reports...</h3>
          </div>
        ) : reports.length === 0 ? (

          <div className="reports-empty">

            <div className="empty-report-icon">
              📄
            </div>

            <h2>No reports yet</h2>

            <p>
              Upload your first medical report to get
              an AI-powered explanation.
            </p>

            <Link
              to="/user/upload-report"
              className="primary-report-btn"
            >
              Upload Your First Report →
            </Link>

          </div>

        ) : (

          <div className="reports-grid">

            {reports.map((report) => (

              <div
                className="report-card"
                key={report._id}
              >

                <div className="report-card-top">

                  <div className="report-icon">
                    📄
                  </div>

                  <span
                    className={`report-status ${
                      report.status?.toLowerCase() ||
                      "processing"
                    }`}
                  >
                    {report.status || "Processing"}
                  </span>

                </div>

                <h2>
                  {report.reportName}
                </h2>

                <p className="report-type">
                  {report.reportType}
                </p>

                <div className="report-meta">

                  <span>
                    📅{" "}
                    {report.createdAt
                      ? new Date(
                          report.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>

                  {report.emailSent && (
                    <span className="email-sent">
                      ✓ Email Sent
                    </span>
                  )}

                </div>

                {report.status === "Processing" && (
                  <div className="processing-box">
                    <strong>
                      AI analysis in progress
                    </strong>

                    <p>
                      You can explore other features.
                      We'll send the analysis to your
                      registered email when it's ready.
                    </p>
                  </div>
                )}

                {report.status === "Failed" && (
                  <div className="failed-box">
                    AI analysis could not be completed.
                  </div>
                )}

                <div className="report-actions">

                  <Link
                    to={`/user/reports/${report._id}`}
                    className="view-report-btn"
                  >
                    View Report →
                  </Link>

                  {report.status === "Analyzed" && (
                    <Link
                      to={`/user/reports/${report._id}`}
                      className="analysis-btn"
                    >
                      AI Analysis
                    </Link>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* Disclaimer */}
      <div className="reports-disclaimer">
        <strong>AI Health Information</strong>

        <p>
          AI-generated information may contain mistakes.
          It is not a medical diagnosis or prescription.
          Please consult a qualified doctor before making
          medical decisions.
        </p>
      </div>

    </div>
  );
}

export default Reports;