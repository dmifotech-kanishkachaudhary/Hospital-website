import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../../config";
import "./UserDashboard.css";

function UserDashboard() {
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
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  return (
    <div className="user-dashboard">

      {/* Navbar */}
      <nav className="dashboard-navbar">

  <Link
    to="/user/dashboard"
    className="dashboard-logo"
  >
    <span className="logo-cross">✚</span>

    <div>
      <strong>City Hospital</strong>
      <small>Patient Portal</small>
    </div>
  </Link>

  <div className="dashboard-nav-links">

    <Link to="/user/dashboard">
      <span>⌂</span>
      Dashboard
    </Link>

    <Link to="/user/appointments">
      <span>▣</span>
      Appointments
    </Link>

    <Link to="/user/reports">
      <span>▤</span>
      Reports
    </Link>

    <Link to="/user/chat">
      <span>💬</span>
      Messages
    </Link>

    <Link to="/user/profile">
      <span>♙</span>
      Profile
    </Link>

  </div>

  <div className="dashboard-user">

    <Link
      to="/user/profile"
      className="user-avatar"
    >
      👤
    </Link>

    <div className="user-info">
      <strong>
        {JSON.parse(localStorage.getItem("user"))?.name ||
          "Patient"}
      </strong>

      <span>Patient</span>
    </div>

    <button
      className="logout-btn"
      onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }}
    >
      Logout
    </button>

  </div>

</nav>

      {/* Welcome */}
      <section className="dashboard-welcome">

        <div>
          <span className="dashboard-tag">
            PATIENT DASHBOARD
          </span>

          <h1>
            Welcome back
            <span> 👋</span>
          </h1>

          <p>
            Manage your health information, medical reports
            and appointments from one place.
          </p>
        </div>

        <Link
          to="/user/upload-report"
          className="upload-report-btn"
        >
          + Upload Report
        </Link>

      </section>

      {/* Quick Stats */}
      <section className="dashboard-stats">

        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div>
            <span>Total Reports</span>
            <strong>{reports.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div>
            <span>AI Analyzed</span>
            <strong>
              {
                reports.filter(
                  (report) =>
                    report.status === "Analyzed"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <span>Processing</span>
            <strong>
              {
                reports.filter(
                  (report) =>
                    report.status === "Processing"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div>
            <span>Emails Sent</span>
            <strong>
              {
                reports.filter(
                  (report) =>
                    report.emailSent === true
                ).length
              }
            </strong>
          </div>
        </div>

      </section>

      {/* Reports */}
      <section
        className="reports-section"
        id="reports"
      >

        <div className="section-title">

          <div>
            <span>YOUR HEALTH RECORDS</span>
            <h2>My Medical Reports</h2>
          </div>

          <Link to="/user/upload-report">
            Upload New Report →
          </Link>

        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading your reports...</p>
          </div>
        ) : reports.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              📄
            </div>

            <h3>No medical reports yet</h3>

            <p>
              Upload your first medical report to get
              an AI-powered explanation.
            </p>

            <Link
              to="/user/upload-report"
              className="primary-dashboard-btn"
            >
              Upload Report
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

                  <div className="report-file-icon">
                    📄
                  </div>

                  <span
                    className={`status-badge ${report.status?.toLowerCase()}`}
                  >
                    {report.status}
                  </span>

                </div>

                <h3>
                  {report.reportName}
                </h3>

                <p className="report-type">
                  {report.reportType}
                </p>

                <p className="report-date">
                  {report.createdAt
                    ? new Date(
                        report.createdAt
                      ).toLocaleDateString()
                    : ""}
                </p>

                <div className="report-actions">

                  <Link
                    to={`/user/reports/${report._id}`}
                    className="view-report-btn"
                  >
                    View Report
                  </Link>

                  {report.status ===
                    "Analyzed" && (
                    <Link
                      to={`/user/reports/${report._id}`}
                      className="analysis-btn"
                    >
                      AI Analysis
                    </Link>
                  )}

                </div>

                {report.status ===
                  "Processing" && (
                  <p className="processing-message">
                    Your report is being analyzed.
                    You can explore other features
                    while we process it.
                  </p>
                )}

                {report.emailSent && (
                  <p className="email-status">
                    ✓ Analysis sent to your email
                  </p>
                )}

              </div>

            ))}

          </div>

        )}

      </section>

      {/* Disclaimer */}
      <div className="dashboard-disclaimer">

        <strong>AI Health Information</strong>

        <p>
          AI-generated report explanations are for
          informational purposes only and may contain
          mistakes. They are not a medical diagnosis or
          prescription. Always consult a qualified doctor
          before making medical decisions.
        </p>

      </div>

    </div>
  );
}

export default UserDashboard;