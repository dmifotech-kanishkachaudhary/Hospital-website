import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API } from "../../config";
import "./PatientDetails.css";

function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API}/api/auth/patients/${encodeURIComponent(id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch patient details"
          );
        }

        setPatient(data.patient || null);
        setAppointments(data.appointments || []);
        setReports(data.reports || []);
      } catch (error) {
        console.error("Patient Details Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id, token]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";

    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    return status
      ?.toLowerCase()
      .replace(/\s+/g, "-") || "";
  };

  if (loading) {
    return (
      <div className="patient-details-page">
        <div className="patient-details-state">
          <div>⏳</div>
          <h2>Loading patient details...</h2>
          <p>
            Please wait while we fetch the complete
            patient record.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-details-page">

        <div className="patient-details-error">

          <div className="patient-error-icon">
            ⚠
          </div>

          <h2>Unable to load patient</h2>

          <p>{error}</p>

          <Link
            to="/admin/patients"
            className="back-patients-btn"
          >
            ← Back to Patients
          </Link>

        </div>

      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-details-page">
        <div className="patient-details-state">
          <div>👤</div>
          <h2>Patient not found</h2>

          <Link
            to="/admin/patients"
            className="back-patients-btn"
          >
            ← Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-details-page">

      {/* ================= NAVBAR ================= */}

      <nav className="admin-details-navbar">

        <Link
          to="/admin/dashboard"
          className="admin-details-logo"
        >
          <span>✚</span>

          <div>
            <strong>City Hospital</strong>
            <small>Admin Portal</small>
          </div>
        </Link>

        <div className="admin-details-nav">

          <Link to="/admin/dashboard">
            Dashboard
          </Link>

          <Link
            to="/admin/patients"
            className="active"
          >
            Patients
          </Link>

          <Link to="/admin/doctors">
            Doctors
          </Link>

          <Link to="/admin/appointments">
            Appointments
          </Link>

          <Link to="/admin/reports">
            Reports
          </Link>

        </div>

        <button
          className="details-logout"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>

      </nav>


      {/* ================= CONTENT ================= */}

      <main className="patient-details-container">

        {/* Back */}

        <Link
          to="/admin/patients"
          className="patient-back-link"
        >
          ← Back to Patients
        </Link>


        {/* ================= PATIENT HEADER ================= */}

        <section className="patient-profile-header">

          <div className="patient-large-avatar">
            {patient.name
              ?.charAt(0)
              .toUpperCase() || "P"}
          </div>

          <div className="patient-header-info">

            <span>PATIENT PROFILE</span>

            <h1>
              {patient.name || "Unknown Patient"}
            </h1>

            <p>
              {patient.email || "No email available"}
            </p>

            <div className="patient-header-meta">

              <span>
                Patient ID:
                <strong>
                  {patient.patientId ||
                    patient._id}
                </strong>
              </span>

              <span>
                {patient.phone ||
                  "No phone number"}
              </span>

            </div>

          </div>

          <div className="patient-header-status">
            <span>ACCOUNT</span>
            <strong>Active</strong>
          </div>

        </section>


        {/* ================= SUMMARY ================= */}

        <section className="patient-summary-grid">

          <div className="patient-summary-card">
            <span>AGE</span>
            <strong>
              {calculateAge(
                patient.dateOfBirth
              )}
            </strong>
          </div>

          <div className="patient-summary-card">
            <span>GENDER</span>
            <strong>
              {patient.gender || "N/A"}
            </strong>
          </div>

          <div className="patient-summary-card">
            <span>BLOOD GROUP</span>
            <strong>
              {patient.bloodGroup || "N/A"}
            </strong>
          </div>

          <div className="patient-summary-card">
            <span>APPOINTMENTS</span>
            <strong>
              {appointments.length}
            </strong>
          </div>

          <div className="patient-summary-card">
            <span>REPORTS</span>
            <strong>
              {reports.length}
            </strong>
          </div>

        </section>


        {/* ================= PERSONAL INFORMATION ================= */}

        <section className="details-section">

          <div className="details-section-heading">
            <span>PERSONAL INFORMATION</span>
            <h2>Patient Information</h2>
          </div>

          <div className="details-card">

            <div className="details-grid">

              <div className="detail-field">
                <span>FULL NAME</span>
                <strong>
                  {patient.name || "N/A"}
                </strong>
              </div>

              <div className="detail-field">
                <span>EMAIL ADDRESS</span>
                <strong>
                  {patient.email || "N/A"}
                </strong>
              </div>

              <div className="detail-field">
                <span>PHONE NUMBER</span>
                <strong>
                  {patient.phone || "N/A"}
                </strong>
              </div>

              <div className="detail-field">
                <span>DATE OF BIRTH</span>
                <strong>
                  {formatDate(
                    patient.dateOfBirth
                  )}
                </strong>
              </div>

              <div className="detail-field">
                <span>AGE</span>
                <strong>
                  {calculateAge(
                    patient.dateOfBirth
                  )}
                </strong>
              </div>

              <div className="detail-field">
                <span>GENDER</span>
                <strong>
                  {patient.gender || "N/A"}
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= ADDRESS ================= */}

        <section className="details-section">

          <div className="details-section-heading">
            <span>ADDRESS</span>
            <h2>Residential Information</h2>
          </div>

          <div className="details-card">

            <div className="details-grid">

              <div className="detail-field detail-field-wide">
                <span>ADDRESS</span>
                <strong>
                  {patient.address || "N/A"}
                </strong>
              </div>

              <div className="detail-field">
                <span>CITY</span>
                <strong>
                  {patient.city || "N/A"}
                </strong>
              </div>

              <div className="detail-field">
                <span>STATE</span>
                <strong>
                  {patient.state || "N/A"}
                </strong>
              </div>

              <div className="detail-field">
                <span>PINCODE</span>
                <strong>
                  {patient.pincode || "N/A"}
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= MEDICAL INFORMATION ================= */}

        <section className="details-section">

          <div className="details-section-heading">
            <span>MEDICAL INFORMATION</span>
            <h2>Health Information</h2>
          </div>

          <div className="details-card">

            <div className="details-grid">

              <div className="detail-field">
                <span>BLOOD GROUP</span>
                <strong>
                  {patient.bloodGroup || "N/A"}
                </strong>
              </div>

              <div className="detail-field detail-field-wide">
                <span>ALLERGIES</span>
                <strong>
                  {patient.allergies || "None recorded"}
                </strong>
              </div>

              <div className="detail-field detail-field-wide">
                <span>MEDICAL CONDITIONS</span>
                <strong>
                  {patient.medicalConditions ||
                    "None recorded"}
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= EMERGENCY CONTACT ================= */}

        <section className="details-section">

          <div className="details-section-heading">
            <span>EMERGENCY CONTACT</span>
            <h2>Emergency Information</h2>
          </div>

          <div className="details-card emergency-card">

            <div className="details-grid">

              <div className="detail-field">
                <span>CONTACT NAME</span>
                <strong>
                  {patient.emergencyContactName ||
                    "N/A"}
                </strong>
              </div>

              <div className="detail-field">
                <span>PHONE NUMBER</span>
                <strong>
                  {patient.emergencyContactNumber ||
                    "N/A"}
                </strong>
              </div>

              <div className="detail-field">
                <span>RELATIONSHIP</span>
                <strong>
                  {patient.emergencyContactRelationship ||
                    "N/A"}
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* ================= APPOINTMENTS ================= */}

        <section className="details-section">

          <div className="details-section-heading">
            <span>APPOINTMENT HISTORY</span>
            <h2>Appointments</h2>
          </div>

          {appointments.length === 0 ? (

            <div className="details-empty">
              <div>📅</div>
              <h3>No appointments</h3>
              <p>
                This patient has no appointment
                records yet.
              </p>
            </div>

          ) : (

            <div className="appointment-list">

              {appointments.map(
                (appointment) => (

                  <div
                    className="appointment-card"
                    key={appointment._id}
                  >

                    <div className="appointment-date">

                      <strong>
                        {formatDate(
                          appointment.date
                        )}
                      </strong>

                      <span>
                        {appointment.time ||
                          "Time not available"}
                      </span>

                    </div>


                    <div className="appointment-info">

                      <h3>
                        {appointment.doctor
                          ?.name ||
                          "Doctor not available"}
                      </h3>

                      <p>
                        {appointment.doctor
                          ?.specialization ||
                          "Specialization not available"}
                      </p>

                      <span>
                        {appointment.department ||
                          "Department not available"}
                      </span>

                      {appointment.reason && (
                        <small>
                          Reason:{" "}
                          {appointment.reason}
                        </small>
                      )}

                    </div>


                    <div className="appointment-right">

                      <span
                        className={`appointment-status ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status ||
                          "Pending"}
                      </span>

                      {appointment.doctor && (
                        <div className="doctor-mini-info">
                          <span>
                            Doctor Contact
                          </span>

                          <strong>
                            {appointment.doctor.phone ||
                              "N/A"}
                          </strong>
                        </div>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* ================= REPORTS ================= */}

        <section className="details-section">

          <div className="details-section-heading">
            <span>MEDICAL RECORDS</span>
            <h2>Medical Reports</h2>
          </div>

          {reports.length === 0 ? (

            <div className="details-empty">
              <div>📄</div>

              <h3>No medical reports</h3>

              <p>
                This patient has not uploaded any
                medical reports yet.
              </p>
            </div>

          ) : (

            <div className="reports-admin-list">

              {reports.map((report) => (

                <div
                  className="admin-report-card"
                  key={report._id}
                >

                  <div className="admin-report-icon">
                    📄
                  </div>


                  <div className="admin-report-info">

                    <h3>
                      {report.reportName ||
                        "Medical Report"}
                    </h3>

                    <p>
                      {report.reportType ||
                        "Medical Report"}
                    </p>

                    <span>
                      Uploaded{" "}
                      {formatDate(
                        report.createdAt
                      )}
                    </span>

                  </div>


                  <div className="admin-report-right">

                    <span
                      className={`report-admin-status ${getStatusClass(
                        report.status
                      )}`}
                    >
                      {report.status ||
                        "Processing"}
                    </span>

                    {report.emailSent && (
                      <small>
                        ✓ Email sent
                      </small>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ================= SECURITY NOTE ================= */}

        <div className="patient-admin-note">

          <div>🔒</div>

          <div>
            <strong>
              Patient information
            </strong>

            <p>
              This information is available only
              to authorized hospital administrators.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}

export default PatientDetails;