import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../config";
import "./AdminDashboard.css";


function AdminDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [loadingReports, setLoadingReports] =
    useState(true);

  const [loadingDoctors, setLoadingDoctors] =
    useState(true);

  const [loadingPatients, setLoadingPatients] =
    useState(true);

  // =====================================================
  // MODAL
  // =====================================================

  const [selectedItem, setSelectedItem] = useState(null);

  const user =
    JSON.parse(localStorage.getItem("user")) || {
      name: "Admin",
      role: "admin",
    };

  const token = localStorage.getItem("token");

  // =====================================================
  // FETCH APPOINTMENTS
  // =====================================================

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);

      const response = await fetch(
        `${API}/api/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(
        "Failed to fetch appointments:",
        error
      );
    } finally {
      setLoadingAppointments(false);
    }
  };

  // =====================================================
  // FETCH MEDICAL REPORTS
  // =====================================================

  const fetchReports = async () => {
    try {
      setLoadingReports(true);

      const response = await fetch(
        `${API}/api/reports/all`,
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
      console.error(
        "Failed to fetch reports:",
        error
      );
    } finally {
      setLoadingReports(false);
    }
  };

  // =====================================================
  // FETCH DOCTORS
  // =====================================================

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);

      const response = await fetch(
        `${API}/api/doctors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDoctors(data.doctors || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(
        "Failed to fetch doctors:",
        error
      );
    } finally {
      setLoadingDoctors(false);
    }
  };

  // =====================================================
  // FETCH PATIENTS
  // =====================================================

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);

      const response = await fetch(
        `${API}/api/auth/patients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPatients(data.patients || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(
        "Failed to fetch patients:",
        error
      );
    } finally {
      setLoadingPatients(false);
    }
  };

  // =====================================================
  // INITIAL DATA
  // =====================================================

  useEffect(() => {
    if (!token) {
      setLoadingAppointments(false);
      setLoadingReports(false);
      setLoadingDoctors(false);
      setLoadingPatients(false);
      return;
    }

    fetchAppointments();
    fetchReports();
    fetchDoctors();
    fetchPatients();
  }, [token]);

  // =====================================================
  // REFRESH DASHBOARD
  // =====================================================

  const refreshDashboard = () => {
    fetchAppointments();
    fetchReports();
    fetchDoctors();
    fetchPatients();
  };

  // =====================================================
  // SCROLL
  // =====================================================

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // UPDATE APPOINTMENT STATUS
  // =====================================================

  const updateAppointmentStatus = async (
    appointmentId,
    status
  ) => {
    try {
      const response = await fetch(
        `${API}/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update status"
        );

        return;
      }

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === appointmentId
            ? {
                ...appointment,
                status,
              }
            : appointment
        )
      );

      // Update currently opened appointment
      if (
        selectedItem?.type === "appointment" &&
        selectedItem.data?._id === appointmentId
      ) {
        setSelectedItem((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            status,
          },
        }));
      }
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while updating appointment."
      );
    }
  };

  // =====================================================
  // APPOINTMENT STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "confirmed";

      case "Completed":
        return "completed";

      case "Cancelled":
        return "cancelled";

      default:
        return "waiting";
    }
  };

  // =====================================================
  // REPORT STATUS CLASS
  // =====================================================

  const getReportStatusClass = (status) => {
    switch (status) {
      case "Analyzed":
        return "analyzed";

      case "Failed":
        return "failed";

      default:
        return "processing";
    }
  };

  // =====================================================
  // DOCTOR AVAILABILITY
  // =====================================================

  const getDoctorAvailabilityClass = (
    availability
  ) => {
    if (
      availability?.toLowerCase() ===
      "available"
    ) {
      return "doctor-online";
    }

    return "doctor-busy";
  };

  // =====================================================
  // OPEN MODAL
  // =====================================================

  const openDetails = (type, data) => {
    setSelectedItem({
      type,
      data,
    });
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeDetails = () => {
    setSelectedItem(null);
  };

  // =====================================================
  // ESCAPE KEY
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeDetails();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // =====================================================
  // SAFE DETAIL FIELDS
  // =====================================================

  const getSafeFields = (data) => {
    if (!data || typeof data !== "object") {
      return [];
    }

    const ignoredFields = [
      "_id",
      "__v",
      "password",
      "token",
      "refreshToken",
      "profilePicture",
      "aiAnalysis",
      "reportText",
    ];

    return Object.entries(data).filter(
      ([key, value]) =>
        !ignoredFields.includes(key) &&
        value !== null &&
        value !== undefined &&
        typeof value !== "object"
    );
  };

  // =====================================================
  // FORMAT FIELD NAME
  // =====================================================

  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) =>
        str.toUpperCase()
      );
  };

  // =====================================================
  // FORMAT VALUE
  // =====================================================

  const formatValue = (value) => {
    if (!value) return "N/A";

    if (
      typeof value === "string" &&
      value.includes("T") &&
      !Number.isNaN(Date.parse(value))
    ) {
      return new Date(value).toLocaleString();
    }

    return String(value);
  };

  // =====================================================
  // RENDER AI ANALYSIS
  // =====================================================

  const renderAnalysis = (analysis) => {
    if (!analysis) {
      return (
        <div className="admin-modal-empty">
          AI analysis is not available yet.
        </div>
      );
    }

    if (
      typeof analysis === "string"
    ) {
      return (
        <div className="admin-analysis-text">
          {analysis}
        </div>
      );
    }

    if (
      analysis.rawResponse
    ) {
      return (
        <div className="admin-analysis-text">
          {analysis.rawResponse}
        </div>
      );
    }

    return (
      <div className="admin-analysis-grid">
        {Object.entries(analysis).map(
          ([key, value]) => (
            <div
              className="admin-analysis-item"
              key={key}
            >
              <strong>
                {formatFieldName(key)}
              </strong>

              <div>
                {typeof value ===
                "object"
                  ? JSON.stringify(
                      value,
                      null,
                      2
                    )
                  : String(value)}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  // =====================================================
  // DETAILS MODAL
  // =====================================================

  const renderDetailsModal = () => {
    if (!selectedItem) {
      return null;
    }

    const { type, data } =
      selectedItem;

    return (
      <div
        className="admin-modal-overlay"
        onClick={closeDetails}
      >
        <div
          className="admin-modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          {/* MODAL HEADER */}

          <div className="admin-modal-header">

            <div>

              <span className="admin-modal-label">
                {type === "patient" &&
                  "PATIENT DETAILS"}

                {type === "doctor" &&
                  "DOCTOR DETAILS"}

                {type === "appointment" &&
                  "APPOINTMENT DETAILS"}

                {type === "report" &&
                  "MEDICAL REPORT"}
              </span>

              <h2>

                {type === "patient" &&
                  data.name}

                {type === "doctor" &&
                  data.name}

                {type === "appointment" &&
                  "Appointment Information"}

                {type === "report" &&
                  data.reportName}

              </h2>

            </div>

            <button
              className="admin-modal-close"
              onClick={closeDetails}
              aria-label="Close"
            >
              ×
            </button>

          </div>


          {/* PATIENT DETAILS */}

          {type === "patient" && (
            <div className="admin-modal-body">

              <div className="admin-detail-profile">

                <div className="admin-detail-avatar">
                  {data.name
                    ?.substring(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {data.name}
                  </strong>

                  <span>
                    Patient
                  </span>
                </div>

              </div>

              <div className="admin-detail-grid">

                {getSafeFields(data).map(
                  ([key, value]) => (
                    <div
                      className="admin-detail-item"
                      key={key}
                    >
                      <small>
                        {formatFieldName(
                          key
                        )}
                      </small>

                      <strong>
                        {formatValue(
                          value
                        )}
                      </strong>
                    </div>
                  )
                )}

              </div>

            </div>
          )}


          {/* DOCTOR DETAILS */}

          {type === "doctor" && (
            <div className="admin-modal-body">

              <div className="admin-detail-profile">

                <div className="admin-detail-avatar doctor-detail">
                  👨‍⚕️
                </div>

                <div>
                  <strong>
                    {data.name}
                  </strong>

                  <span>
                    {data.specialization ||
                      "Doctor"}
                  </span>
                </div>

              </div>

              <div className="admin-detail-grid">

                {getSafeFields(data).map(
                  ([key, value]) => (
                    <div
                      className="admin-detail-item"
                      key={key}
                    >
                      <small>
                        {formatFieldName(
                          key
                        )}
                      </small>

                      <strong>
                        {formatValue(
                          value
                        )}
                      </strong>
                    </div>
                  )
                )}

              </div>

            </div>
          )}


          {/* APPOINTMENT DETAILS */}

          {type === "appointment" && (
            <div className="admin-modal-body">

              <div className="appointment-detail-highlight">

                <div>
                  <small>
                    CURRENT STATUS
                  </small>

                  <strong
                    className={getStatusClass(
                      data.status
                    )}
                  >
                    {data.status}
                  </strong>
                </div>

                <select
                  value={
                    data.status ||
                    "Pending"
                  }
                  onChange={(event) =>
                    updateAppointmentStatus(
                      data._id,
                      event.target.value
                    )
                  }
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>

              </div>

              <div className="admin-detail-grid">

                <div className="admin-detail-item">
                  <small>
                    Patient
                  </small>

                  <strong>
                    {data.patient?.user?.name ||
                      "Unknown Patient"}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <small>
                    Doctor
                  </small>

                  <strong>
                    {data.doctor?.user?.name ||
                      "Unknown Doctor"}
                  </strong>
                </div>

                <div className="admin-detail-item">
                  <small>
                    Time
                  </small>

                  <strong>
                    {data.time ||
                      "N/A"}
                  </strong>
                </div>

                {data.date && (
                  <div className="admin-detail-item">
                    <small>
                      Date
                    </small>

                    <strong>
                      {formatValue(
                        data.date
                      )}
                    </strong>
                  </div>
                )}

                {data.reason && (
                  <div className="admin-detail-item full-width">
                    <small>
                      Reason
                    </small>

                    <strong>
                      {data.reason}
                    </strong>
                  </div>
                )}

              </div>

            </div>
          )}


          {/* REPORT DETAILS */}

          {type === "report" && (
            <div className="admin-modal-body">

              <div className="report-detail-top">

                <div className="report-detail-icon">
                  📄
                </div>

                <div>

                  <strong>
                    {data.reportName}
                  </strong>

                  <span>
                    {data.reportType}
                  </span>

                  <small>
                    Patient:{" "}
                    {data.patient?.name ||
                      "Unknown Patient"}
                  </small>

                </div>

              </div>


              <div className="report-detail-status-row">

                <span
                  className={`admin-report-status ${getReportStatusClass(
                    data.status
                  )}`}
                >
                  {data.status}
                </span>

                <span
                  className={
                    data.emailSent
                      ? "admin-email-sent"
                      : "admin-email-pending"
                  }
                >
                  {data.emailSent
                    ? "✓ Email Sent"
                    : "Email Pending"}
                </span>

              </div>


              <div className="admin-report-meta">

                <div>
                  <small>
                    File Name
                  </small>

                  <strong>
                    {data.fileName ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <small>
                    Uploaded
                  </small>

                  <strong>
                    {data.createdAt
                      ? new Date(
                          data.createdAt
                        ).toLocaleString()
                      : "N/A"}
                  </strong>
                </div>

              </div>


              {/* AI ANALYSIS */}

              <div className="admin-analysis-section">

                <div className="admin-analysis-heading">

                  <div>
                    <span>
                      AI ANALYSIS
                    </span>

                    <h3>
                      Medical report analysis
                    </h3>
                  </div>

                </div>

                {renderAnalysis(
                  data.aiAnalysis
                )}

              </div>


              {/* EXTRACTED REPORT TEXT */}

              <details className="admin-report-text">

                <summary>
                  View extracted report text
                </summary>

                <pre>
                  {data.reportText ||
                    "No extracted report text available."}
                </pre>

              </details>

            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <span>✚</span>
          <strong>City Hospital</strong>
        </div>

        <div className="admin-badge">
          ADMIN PORTAL
        </div>

        <nav className="admin-nav">

          <button
            className="active"
            onClick={() =>
              scrollToSection("overview")
            }
          >
            <span>⌂</span>
            Overview
          </button>

          <button
            onClick={() => navigate("/admin/patients")}
          >
            <span>♙</span>
            Patients
          </button>

          <button
          onClick={() => navigate("/admin/doctors")}
        >
          <span>♧</span>
          Doctors
        </button>
          <button
            onClick={() =>
              navigate("/admin/appointments")
            }
          >
            <span>▣</span>
            Appointments
          </button>

          <button
            onClick={() =>
              navigate("/admin/reports")
            }
          >
            <span>▤</span>
            Medical Reports
          </button>

          <button
            onClick={() =>
              scrollToSection("users")
            }
          >
            <span>◎</span>
            Users
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <div className="hospital-status">

            <span className="status-dot"></span>

            <div>

              <strong>
                Hospital Status
              </strong>

              <small>
                All systems operational
              </small>

            </div>

          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            ↪ &nbsp; Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <span className="admin-label">
              ADMINISTRATION
            </span>

            <h1>
              Hospital Overview
            </h1>

            <p>
              Welcome back, {user.name}.
              Here's what's happening today.
            </p>

          </div>

          <div className="admin-profile">

            <div className="admin-avatar">
              {user.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {user.name}
              </strong>

              <small>
                Administrator
              </small>

            </div>

          </div>

        </header>


        {/* =================================================
            STATS
        ================================================= */}

        <section id="overview">

          <div className="admin-stats">

            <button
              className="admin-stat-card"
              onClick={() =>
              navigate("/admin/patients")
            }
            >

              <div className="admin-stat-icon">
                ♙
              </div>

              <div>

                <span>
                  Total Patients
                </span>

                <strong>
                  {patients.length}
                </strong>

                <small>
                  Registered patients
                </small>

              </div>

            </button>


            <button
              className="admin-stat-card"
              onClick={() =>
              navigate("/admin/doctors")
            }
            >

              <div className="admin-stat-icon">
                ♧
              </div>

              <div>

                <span>
                  Doctors
                </span>

                <strong>
                  {doctors.length}
                </strong>

                <small>
                  Hospital doctors
                </small>

              </div>

            </button>


            <button
              className="admin-stat-card"
              onClick={() =>
              navigate("/admin/appointments")
            }
            >

              <div className="admin-stat-icon">
                ▣
              </div>

              <div>

                <span>
                  Appointments
                </span>

                <strong>
                  {appointments.length}
                </strong>

                <small>
                  Total appointments
                </small>

              </div>

            </button>


            <button
              className="admin-stat-card"
              onClick={() =>
              navigate("/admin/reports")
            }
            >

              <div className="admin-stat-icon">
                ▤
              </div>

              <div>

                <span>
                  Medical Reports
                </span>

                <strong>
                  {reports.length}
                </strong>

                <small>
                  Uploaded reports
                </small>

              </div>

            </button>

          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="admin-section">

          <div className="admin-section-heading">

            <div>

              <span>
                QUICK ACTIONS
              </span>

              <h2>
                Manage hospital
              </h2>

            </div>

          </div>


          <div className="admin-actions">

            <button
            onClick={() =>
              navigate("/admin/patients")
            }
          >

              <span>♙</span>

              <strong>
                Manage Patients
              </strong>

              <small>
                View and manage patient records
              </small>

              <b>→</b>

            </button>


            <button
              onClick={() =>
              navigate("/admin/doctors")
            }
            >

              <span>♧</span>

              <strong>
                Manage Doctors
              </strong>

              <small>
                View hospital doctors
              </small>

              <b>→</b>

            </button>


            <button
              onClick={() =>
              navigate("/admin/appointments")
            }
            >

              <span>▣</span>

              <strong>
                Appointments
              </strong>

              <small>
                Manage appointments
              </small>

              <b>→</b>

            </button>

          </div>

        </section>


        {/* =================================================
            PATIENTS
        ================================================= */}

        <section
          id="patients"
          className="admin-section"
        >

          <div className="admin-section-heading">

            <div>

              <span>
                PATIENT MANAGEMENT
              </span>

              <h2>
                Recent patients
              </h2>

            </div>

            <button
              className="admin-view-btn"
              onClick={() =>
                navigate("/admin/patients")
              }
            >
              View all →
            </button>

          </div>


          <div className="admin-table">

            <div className="table-header">

              <span>
                Patient
              </span>

              <span>
                Email
              </span>

              <span>
                Registered
              </span>

              <span>
                Status
              </span>

            </div>


            {loadingPatients ? (

              <div className="table-row">

                <span>
                  Loading patients...
                </span>

              </div>

            ) : patients.length === 0 ? (

              <div className="table-row">

                <span>
                  No patients found.
                </span>

              </div>

            ) : (

              patients
                .slice(0, 5)
                .map((patient) => (

                  <button
                    className="table-row admin-clickable-row"
                    key={patient._id}
                    onClick={() =>
                      openDetails(
                        "patient",
                        patient
                      )
                    }
                  >

                    <div className="patient-name">

                      <div className="patient-avatar">

                        {patient.name
                          ?.substring(0, 2)
                          .toUpperCase()}

                      </div>

                      <div>

                        <strong>
                          {patient.name}
                        </strong>

                        <small>
                          Patient ID:{" "}
                          {patient._id.slice(-6)}
                        </small>

                      </div>

                    </div>


                    <span>
                      {patient.email}
                    </span>


                    <span>
                      {patient.createdAt
                        ? new Date(
                            patient.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>


                    <span className="table-status active-status">
                      Active
                    </span>

                  </button>

                ))

            )}

          </div>

        </section>


        {/* =================================================
            DOCTORS
        ================================================= */}

        <section
          id="doctors"
          className="admin-section"
        >

          <div className="admin-section-heading">

            <div>

              <span>
                MEDICAL STAFF
              </span>

              <h2>
                Doctors
              </h2>

            </div>

            <button
              className="admin-view-btn"
              onClick={refreshDashboard}
            >
              Refresh →
            </button>

          </div>


          <div className="admin-doctors-grid">

            {loadingDoctors ? (

              <div className="admin-report-empty">
                Loading doctors...
              </div>

            ) : doctors.length === 0 ? (

              <div className="admin-report-empty">
                No doctors found.
              </div>

            ) : (

              doctors.map((doctor) => (

                <button
                  className="admin-doctor-card"
                  key={doctor._id}
                  onClick={() =>
                    openDetails(
                      "doctor",
                      doctor
                    )
                  }
                >

                  <div className="admin-doctor-avatar">
                    👨‍⚕️
                  </div>


                  <div>

                    <strong>
                      {doctor.name}
                    </strong>

                    <span>
                      {doctor.specialization}
                    </span>

                    <small>
                      {doctor.department}
                    </small>

                  </div>


                  <span
                    className={getDoctorAvailabilityClass(
                      doctor.availability
                    )}
                  >
                    {doctor.availability ||
                      "Available"}
                  </span>

                </button>

              ))

            )}

          </div>

        </section>


        {/* =================================================
            APPOINTMENTS
        ================================================= */}

        <section
          id="appointments"
          className="admin-section"
        >

          <div className="admin-section-heading">

            <div>

              <span>
                APPOINTMENT MANAGEMENT
              </span>

              <h2>
                Appointments
              </h2>

            </div>

            <button
              className="admin-view-btn"
              onClick={refreshDashboard}
            >
              Refresh →
            </button>

          </div>


          <div className="appointments-table">

            <div className="appointment-admin-row heading">

              <span>
                Patient
              </span>

              <span>
                Doctor
              </span>

              <span>
                Time
              </span>

              <span>
                Status
              </span>

            </div>


            {loadingAppointments ? (

              <div className="appointment-admin-row">

                <span>
                  Loading appointments...
                </span>

              </div>

            ) : appointments.length === 0 ? (

              <div className="appointment-admin-row">

                <span>
                  No appointments found.
                </span>

              </div>

            ) : (

              appointments.map(
                (appointment) => (

                  <div
                    className="appointment-admin-row admin-clickable-appointment"
                    key={appointment._id}
                    onClick={() =>
                      openDetails(
                        "appointment",
                        appointment
                      )
                    }
                  >

                    <strong>
                      {
                        appointment.patient
                          ?.name ||
                        "Unknown Patient"
                      }
                    </strong>


                    <span>
                      {
                        appointment.doctor
                          ?.user?.name ||
                        "Unknown Doctor"
                      }
                    </span>


                    <span>
                      {appointment.time}
                    </span>


                    <div
                      className="admin-appointment-status"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >

                      <span
                        className={getStatusClass(
                          appointment.status
                        )}
                      >
                        {appointment.status}
                      </span>


                      <select
                        value={
                          appointment.status
                        }
                        onChange={(event) =>
                          updateAppointmentStatus(
                            appointment._id,
                            event.target.value
                          )
                        }
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Confirmed">
                          Confirmed
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </section>


        {/* =================================================
            MEDICAL REPORTS
        ================================================= */}

        <section
          id="reports"
          className="admin-section"
        >

          <div className="admin-section-heading">

            <div>

              <span>
                REPORT MANAGEMENT
              </span>

              <h2>
                Medical reports
              </h2>

            </div>

            <button
              className="admin-view-btn"
              onClick={refreshDashboard}
            >
              Refresh →
            </button>

          </div>


          <div className="report-management-card">

            <div>

              <div className="report-management-icon">
                📄
              </div>

              <div>

                <strong>
                  {reports.length} Medical Reports
                </strong>

                <span>
                  Uploaded patient reports and
                  AI analysis status
                </span>

              </div>

            </div>


            <button
              onClick={() =>
                scrollToSection("reports-list")
              }
            >
              Review reports →
            </button>

          </div>


          <div
            id="reports-list"
            className="admin-reports-list"
          >

            {loadingReports ? (

              <div className="admin-report-empty">
                Loading reports...
              </div>

            ) : reports.length === 0 ? (

              <div className="admin-report-empty">
                No medical reports uploaded yet.
              </div>

            ) : (

              reports.map((report) => (

                <button
                  className="admin-report-row admin-clickable-report"
                  key={report._id}
                  onClick={() =>
                    openDetails(
                      "report",
                      report
                    )
                  }
                >

                  <div className="admin-report-patient">

                    <div className="admin-report-icon">
                      📄
                    </div>

                    <div>

                      <strong>
                        {report.reportName}
                      </strong>

                      <small>
                        {
                          report.patient?.name ||
                          "Unknown Patient"
                        }
                      </small>

                    </div>

                  </div>


                  <div className="admin-report-type">

                    <span>
                      {report.reportType}
                    </span>

                    <small>
                      {report.createdAt
                        ? new Date(
                            report.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </small>

                  </div>


                  <span
                    className={`admin-report-status ${getReportStatusClass(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>


                  {report.emailSent ? (

                    <span className="admin-email-sent">
                      ✓ Email Sent
                    </span>

                  ) : (

                    <span className="admin-email-pending">
                      Email Pending
                    </span>

                  )}

                </button>

              ))

            )}

          </div>

        </section>


        {/* =================================================
            USERS
        ================================================= */}

        <section
          id="users"
          className="admin-section"
        >

          <div className="admin-section-heading">

            <div>

              <span>
                ACCOUNT MANAGEMENT
              </span>

              <h2>
                System users
              </h2>

            </div>

            <button
              className="admin-view-btn"
              onClick={refreshDashboard}
            >
              Refresh →
            </button>

          </div>


          <div className="users-summary">

            <button
              onClick={() =>
                scrollToSection("patients")
              }
            >

              <strong>
                {patients.length}
              </strong>

              <span>
                Patients
              </span>

            </button>


            <button
              onClick={() =>
                scrollToSection("doctors")
              }
            >

              <strong>
                {doctors.length}
              </strong>

              <span>
                Doctors
              </span>

            </button>


            <button>

              <strong>
                1
              </strong>

              <span>
                Administrators
              </span>

            </button>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="admin-footer">

          <span>
            © 2026 City Hospital
          </span>

          <span>
            Admin Portal • Secure Access
          </span>

        </footer>

      </main>


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {renderDetailsModal()}

    </div>
  );
}

export default AdminDashboard;