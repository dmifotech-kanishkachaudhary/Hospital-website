import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Appointments.css";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/appointments/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("Appointments:", data);

        if (response.ok) {
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        console.error("Appointments Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  return (
    <div className="appointments-page">

      {/* Top Navigation */}
      <div className="appointments-topbar">

        <Link to="/user/dashboard">
          ← Dashboard
        </Link>

        <Link
          to="/user/book-appointment"
          className="book-appointment-btn"
        >
          + Book Appointment
        </Link>

      </div>

      {/* Header */}
      <div className="appointments-header">

        <span>YOUR HEALTHCARE</span>

        <h1>My Appointments</h1>

        <p>
          View and manage your upcoming hospital
          appointments.
        </p>

      </div>

      {/* Content */}

      {loading ? (

        <div className="appointment-empty">
          <p>Loading appointments...</p>
        </div>

      ) : appointments.length === 0 ? (

        <div className="appointment-empty">

          <div className="empty-calendar">
            📅
          </div>

          <h2>No appointments yet</h2>

          <p>
            You don't have any appointments booked yet.
          </p>

          <Link
            to="/user/book-appointment"
            className="book-main-btn"
          >
            Book Your First Appointment →
          </Link>

        </div>

      ) : (

        <div className="appointments-list">

          {appointments.map((appointment) => (

            <div
              className="appointment-card"
              key={appointment._id}
            >

              <div className="doctor-avatar">
                👨‍⚕️
              </div>

              <div className="appointment-main">

                <h2>
                  Dr. {appointment.doctor?.user?.name || "Doctor"}
                </h2>

                <p className="specialization">
                  {appointment.doctor?.specialization ||
                    appointment.department}
                </p>

                <div className="appointment-details">

                  <span>
                    📅{" "}
                    {new Date(
                      appointment.date
                    ).toLocaleDateString()}
                  </span>

                  <span>
                    🕐 {appointment.time}
                  </span>

                  <span>
                    🏥 {appointment.department}
                  </span>

                </div>

                {appointment.reason && (
                  <p className="appointment-reason">
                    <strong>Reason:</strong>{" "}
                    {appointment.reason}
                  </p>
                )}

              </div>

              <div className="appointment-right">

                <span
                  className={`appointment-status ${
                    appointment.status?.toLowerCase() ||
                    "pending"
                  }`}
                >
                  {appointment.status ||
                    "Pending"}
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Appointments;