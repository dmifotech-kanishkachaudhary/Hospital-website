import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ReportDetails.css";
import AnalysisView from "../../components/AnalysisView";

function ReportDetails() {
  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/reports/all/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch report"
          );
        }

        setReport(data.report);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, token]);

  if (loading) {
    return (
      <div className="report-details-page">
        <div className="details-state">
          <h2>Loading report...</h2>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-details-page">
        <div className="details-state">
          <h2>{error || "Report not found"}</h2>

          <Link to="/admin/reports">
            ← Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="report-details-page">

      {/* NAVBAR */}

      <nav className="admin-page-navbar">

        <Link
          to="/admin/dashboard"
          className="admin-page-logo"
        >
          <span>✚</span>

          <div>
            <strong>City Hospital</strong>
            <small>Admin Portal</small>
          </div>
        </Link>

        <div className="admin-page-nav">
          <Link to="/admin/dashboard">
            Dashboard
          </Link>

          <Link to="/admin/patients">
            Patients
          </Link>

          <Link to="/admin/doctors">
            Doctors
          </Link>

          <Link to="/admin/appointments">
            Appointments
          </Link>

          <Link
            to="/admin/reports"
            className="active"
          >
            Reports
          </Link>
        </div>

        <button
          className="admin-logout"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>

      </nav>

      <main className="report-details-container">

        <Link
          className="back-btn"
          to="/admin/reports"
        >
          ← Back to Reports
        </Link>

        <div className="details-header">

          <h1>{report.reportName}</h1>

          <span className={`status ${report.status.toLowerCase()}`}>
            {report.status}
          </span>

        </div>

        <div className="details-grid">

          <div className="detail-card">

            <h3>Patient Information</h3>

            <p>
              <strong>Name:</strong>{" "}
              {report.patient?.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {report.patient?.email}
            </p>

          </div>

          <div className="detail-card">

            <h3>Report Information</h3>

            <p>
              <strong>Type:</strong>{" "}
              {report.reportType}
            </p>

            <p>
              <strong>Uploaded:</strong>{" "}
              {new Date(
                report.createdAt
              ).toLocaleString()}
            </p>

            <p>
              <strong>Email Sent:</strong>{" "}
              {report.emailSent ? "Yes" : "No"}
            </p>

          </div>

        </div>

        <div className="detail-card">

          <h3>Extracted Report Text</h3>

          <pre className="report-text">
            {report.reportText}
          </pre>

        </div>

        <AnalysisView analysis={report.aiAnalysis} />
      </main>

    </div>
  );
}

export default ReportDetails;