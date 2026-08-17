import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ReportDetails.css";
import AnalysisView from "../../components/AnalysisView";

function ReportDetails() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/reports/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setReport(data.report);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Report Details Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, token]);

  if (loading) {
    return (
      <div className="report-details-page">
        <div className="report-loading">
          <div>⏳</div>
          <h3>Loading report...</h3>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="report-details-page">
        <div className="report-not-found">
          <div>📄</div>
          <h2>Report not found</h2>

          <Link to="/user/reports">
            ← Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const analysis = report.aiAnalysis;

  return (
    <div className="report-details-page">

      {/* Navbar */}
      <nav className="report-details-navbar">

        <Link
          to="/user/reports"
          className="back-link"
        >
          ← My Reports
        </Link>

        <div className="report-hospital">
          <span>✚</span>
          <strong>City Hospital</strong>
        </div>

      </nav>

      {/* Header */}
      <section className="report-details-header">

        <div>
          <span>MEDICAL REPORT</span>

          <h1>
            {report.reportName}
          </h1>

          <p>
            {report.reportType}
            {" • "}
            {report.createdAt
              ? new Date(
                  report.createdAt
                ).toLocaleDateString()
              : ""}
          </p>
        </div>

        <div
          className={`detail-status ${
            report.status?.toLowerCase()
          }`}
        >
          {report.status}
        </div>

      </section>

      {/* Processing */}
      {report.status === "Processing" && (
        <div className="processing-banner">

          <div className="processing-banner-icon">
            ⏳
          </div>

          <div>
            <strong>
              Your report is being analyzed
            </strong>

            <p>
              Our AI is currently analyzing your
              report. You can explore other features
              while we process it. Once complete,
              the analysis will also be sent to your
              registered email.
            </p>
          </div>

        </div>
      )}

      {/* Failed */}
      {report.status === "Failed" && (
        <div className="failed-banner">
          <strong>
            AI analysis could not be completed.
          </strong>

          <p>
            Please try uploading the report again
            or consult a qualified healthcare
            professional.
          </p>
        </div>
      )}

     {report.status === "Analyzed" && (
    <AnalysisView analysis={analysis} />
)}

    </div>
  );
}

export default ReportDetails;