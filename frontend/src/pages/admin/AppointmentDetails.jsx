import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API } from "../../config";
import "./AppointmentDetails.css";

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch appointment details"
        );
      }

      setAppointment(data.appointment);
    } catch (error) {
      console.error(
        "Appointment Details Error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setError("");

      const response = await fetch(
        `${API}/api/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update appointment status"
        );
      }

      setAppointment(data.appointment);
    } catch (error) {
      console.error(
        "Update Status Error:",
        error
      );

      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

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

  if (loading) {
    return (
      <div className="appointment-details-page">
        <div className="appointment-details-state">
          <div>⏳</div>

          <h3>
            Loading appointment details...
          </h3>

          <p>
            Please wait while we fetch the
            appointment information.
          </p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="appointment-details-page">
        <div className="appointment-details-state error-state">

          <div>⚠️</div>

          <h3>
            Appointment not found
          </h3>

          <p>
            {error ||
              "Unable to load appointment details."}
          </p>

          <Link
            to="/admin/appointments"
            className="back-appointments-btn"
          >
            ← Back to Appointments
          </Link>

        </div>
      </div>
    );
  }

  const patient =
    appointment.patient || {};

  const doctor =
    appointment.doctor || {};

  return (
    <div className="appointment-details-page">

      {/* ================= NAVBAR ================= */}

      <nav className="appointment-details-navbar">

        <Link
          to="/admin/dashboard"
          className="appointment-details-logo"
        >
          <span>✚</span>

          <div>
            <strong>
              City Hospital
            </strong>

            <small>
              Admin Portal
            </small>
          </div>
        </Link>

        <div className="appointment-details-nav">

          <Link to="/admin/dashboard">
            Dashboard
          </Link>

          <Link to="/admin/patients">
            Patients
          </Link>

          <Link to="/admin/doctors">
            Doctors
          </Link>

          <Link
            to="/admin/appointments"
            className="active"
          >
            Appointments
          </Link>

          <Link to="/admin/reports">
            Reports
          </Link>

        </div>

        <button
          className="appointment-details-logout"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
              "/login";
          }}
        >
          Logout
        </button>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="appointment-details-container">

        <Link
          to="/admin/appointments"
          className="appointment-back-link"
        >
          ← Back to Appointments
        </Link>


        {/* ================= HEADER ================= */}

        <section className="appointment-details-header">

          <div>

            <span>
              APPOINTMENT DETAILS
            </span>

            <h1>
              Appointment
            </h1>

            <p>
              Complete information about this
              hospital appointment.
            </p>

          </div>

          <span
            className={`appointment-detail-status ${
              appointment.status
                ?.toLowerCase()
            }`}
          >
            {appointment.status ||
              "Pending"}
          </span>

        </section>


        {/* ================= APPOINTMENT INFO ================= */}

        <section className="appointment-info-card">

          <div className="appointment-section-heading">

            <span>
              APPOINTMENT INFORMATION
            </span>

            <h2>
              Schedule & Visit Details
            </h2>

          </div>

          <div className="appointment-info-grid">

            <div className="appointment-info-field">
              <span>APPOINTMENT ID</span>

              <strong>
                {appointment._id}
              </strong>
            </div>

            <div className="appointment-info-field">
              <span>DEPARTMENT</span>

              <strong>
                {appointment.department ||
                  doctor.department ||
                  "N/A"}
              </strong>
            </div>

            <div className="appointment-info-field">
              <span>DATE</span>

              <strong>
                {formatDate(
                  appointment.date
                )}
              </strong>
            </div>

            <div className="appointment-info-field">
              <span>TIME</span>

              <strong>
                {appointment.time ||
                  "N/A"}
              </strong>
            </div>

            <div className="appointment-info-field appointment-reason-field">
              <span>REASON FOR VISIT</span>

              <strong>
                {appointment.reason ||
                  "No reason provided"}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= PATIENT ================= */}

        <section className="appointment-person-card">

          <div className="appointment-person-header">

            <div className="appointment-person-avatar-large">
              {patient.name
                ?.charAt(0)
                .toUpperCase() || "P"}
            </div>

            <div>

              <span>
                PATIENT INFORMATION
              </span>

              <h2>
                {patient.name ||
                  "Unknown Patient"}
              </h2>

              <p>
                {patient.email ||
                  "Email not available"}
              </p>

            </div>

          </div>


          <div className="appointment-person-details">

            <div>
              <span>PHONE</span>
              <strong>
                {patient.phone ||
                  "N/A"}
              </strong>
            </div>

            <div>
              <span>AGE</span>
              <strong>
                {calculateAge(
                  patient.dateOfBirth
                )}
              </strong>
            </div>

            <div>
              <span>GENDER</span>
              <strong>
                {patient.gender ||
                  "N/A"}
              </strong>
            </div>

            <div>
              <span>BLOOD GROUP</span>
              <strong>
                {patient.bloodGroup ||
                  "N/A"}
              </strong>
            </div>

          </div>


          <button
            className="view-person-btn"
            onClick={() =>
              navigate(
                `/admin/patients/${patient._id}`
              )
            }
          >
            View Patient Details →
          </button>

        </section>


        {/* ================= DOCTOR ================= */}

        <section className="appointment-person-card">

          <div className="appointment-person-header">

            <div className="doctor-avatar-large">
              👨‍⚕️
            </div>

            <div>

              <span>
                DOCTOR INFORMATION
              </span>

              <h2>
                {doctor.name ||
                  "Unknown Doctor"}
              </h2>

              <p>
                {doctor.specialization ||
                  "Specialization not available"}
              </p>

            </div>

          </div>


          <div className="appointment-person-details">

            <div>
              <span>EMAIL</span>
              <strong>
                {doctor.email ||
                  "N/A"}
              </strong>
            </div>

            <div>
              <span>PHONE</span>
              <strong>
                {doctor.phone ||
                  "N/A"}
              </strong>
            </div>

            <div>
              <span>DEPARTMENT</span>
              <strong>
                {doctor.department ||
                  "N/A"}
              </strong>
            </div>

            <div>
              <span>EXPERIENCE</span>
              <strong>
                {doctor.experience ??
                  0}{" "}
                years
              </strong>
            </div>

          </div>


          <button
            className="view-person-btn"
            onClick={() =>
              navigate(
                `/admin/doctors/${doctor._id}`
              )
            }
          >
            View Doctor Details →
          </button>

        </section>


        {/* ================= STATUS ================= */}

        <section className="appointment-status-card">

          <div>

            <span>
              APPOINTMENT STATUS
            </span>

            <h2>
              Update Appointment
            </h2>

            <p>
              Change the current appointment
              status from the options below.
            </p>

          </div>


          <div className="appointment-status-actions">

            <button
              disabled={updating}
              className="status-btn pending-btn"
              onClick={() =>
                updateStatus("Pending")
              }
            >
              Pending
            </button>

            <button
              disabled={updating}
              className="status-btn confirmed-btn"
              onClick={() =>
                updateStatus("Confirmed")
              }
            >
              Confirmed
            </button>

            <button
              disabled={updating}
              className="status-btn completed-btn"
              onClick={() =>
                updateStatus("Completed")
              }
            >
              Completed
            </button>

            <button
              disabled={updating}
              className="status-btn cancelled-btn"
              onClick={() =>
                updateStatus("Cancelled")
              }
            >
              Cancelled
            </button>

          </div>

          {updating && (
            <p className="status-updating">
              Updating appointment status...
            </p>
          )}

        </section>

      </main>

    </div>
  );
}

export default AppointmentDetails;