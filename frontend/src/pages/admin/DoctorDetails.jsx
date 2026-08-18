import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API } from "../../config";
import AdminNavbar from "../../components/AdminNavbar";
import "./DoctorDetails.css";

function DoctorDetails() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
const [appointments, setAppointments] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API}/api/doctors/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch doctor details"
          );
        }

        setDoctor(data.doctor);
        setAppointments(data.appointments || []);
      } catch (error) {
        console.error("Doctor Details Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id, token]);

  if (loading) {
    return (
      <div className="doctor-details-page">
        <div className="doctor-details-state">
          <div>⏳</div>
          <h3>Loading doctor details...</h3>
          <p>Please wait while we fetch the doctor information.</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="doctor-details-page">
        <div className="doctor-details-state error-state">
          <div>⚠️</div>
          <h3>Doctor not found</h3>
          <p>{error || "Unable to load doctor details."}</p>

          <Link to="/admin/doctors" className="back-doctors-btn">
            ← Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-details-page">

      {/* ================= NAVBAR ================= */}

      <AdminNavbar
        activePage="doctors"
        className="doctor-details-navbar"
        logoClassName="doctor-details-logo"
        navClassName="doctor-details-nav"
        logoutClassName="doctor-details-logout"
      />


      {/* ================= MAIN ================= */}

      <main className="doctor-details-container">

        <Link
          to="/admin/doctors"
          className="doctor-back-link"
        >
          ← Back to Doctors
        </Link>


        {/* ================= HEADER ================= */}

        <section className="doctor-profile-header">

          <div className="doctor-profile-avatar">
            {doctor.user?.name
            ? doctor.user.name.charAt(0).toUpperCase()
           : "D"}
          </div>

          <div className="doctor-profile-info">

            <span>DOCTOR PROFILE</span>

            <h1>
              {doctor.user?.name || "Unknown Doctor"}
            </h1>

            <p>
              {doctor.specialization || "Specialization not available"}
            </p>

            <div className="doctor-profile-tags">

              <span>
                {doctor.department || "Department N/A"}
              </span>

              <span
                className={
                  doctor.availability === "Available"
                    ? "available"
                    : "unavailable"
                }
              >
                ● {doctor.availability || "Unknown"}
              </span>

            </div>

          </div>

        </section>


        {/* ================= DETAILS ================= */}

        <section className="doctor-details-card">

          <div className="doctor-section-heading">

            <span>DOCTOR INFORMATION</span>

            <h2>Professional & Personal Details</h2>

          </div>


          <div className="doctor-details-grid">

            <div className="doctor-detail-field">
              <span>FULL NAME</span>
              <strong>
                {doctor.name || "N/A"}
              </strong>
            </div>


            <div className="doctor-detail-field">
              <span>EMAIL ADDRESS</span>
              <strong>
                {doctor.user?.email || "N/A"}
              </strong>
            </div>


            <div className="doctor-detail-field">
              <span>PHONE NUMBER</span>
              <strong>
                {doctor.phone || "N/A"}
              </strong>
            </div>


            <div className="doctor-detail-field">
              <span>SPECIALIZATION</span>
              <strong>
                {doctor.specialization || "N/A"}
              </strong>
            </div>


            <div className="doctor-detail-field">
              <span>DEPARTMENT</span>
              <strong>
                {doctor.department || "N/A"}
              </strong>
            </div>


            <div className="doctor-detail-field">
              <span>EXPERIENCE</span>
              <strong>
                {doctor.experience !== undefined
                  ? `${doctor.experience} years`
                  : "N/A"}
              </strong>
            </div>


            <div className="doctor-detail-field">
              <span>AVAILABILITY</span>
              <strong>
                {doctor.availability || "N/A"}
              </strong>
            </div>


            <div className="doctor-detail-field">
              <span>CONSULTATION FEE</span>
              <strong>
                ₹{doctor.consultationFee ?? 0}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= ACCOUNT INFO ================= */}

        <section className="doctor-account-card">

          <div>
            <span>ACCOUNT INFORMATION</span>

            <h3>
              Doctor registered with City Hospital
            </h3>

            <p>
              Doctor profile and professional information
              is maintained by the hospital administration.
            </p>
          </div>

          <div className="doctor-account-icon">
            ✓
          </div>

        </section>

        {/* ================= APPOINTMENTS ================= */}

<section className="doctor-appointments-card">

  <div className="doctor-section-heading">
    <span>APPOINTMENT HISTORY</span>
    <h2>Doctor's Appointments</h2>
  </div>

  {appointments.length === 0 ? (

    <div className="doctor-no-appointments">
      <div>📅</div>
      <h3>No appointments found</h3>
      <p>
        This doctor does not have any appointment
        records yet.
      </p>
    </div>

  ) : (

    <div className="doctor-appointments-table-wrapper">

      <table className="doctor-appointments-table">

        <thead>
          <tr>
            <th>Patient</th>
            <th>Email</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {appointments.map((appointment) => (

            <tr key={appointment._id}>

              <td>
                <strong>
                  {appointment.patient?.name || "N/A"}
                </strong>
              </td>

              <td>
                {appointment.patient?.email || "N/A"}
              </td>

              <td>
                {appointment.date
                  ? new Date(
                      appointment.date
                    ).toLocaleDateString()
                  : "N/A"}
              </td>

              <td>
                {appointment.time || "N/A"}
              </td>

              <td>
                {appointment.reason || "N/A"}
              </td>

              <td>
                <span
                  className={`appointment-status ${
                    appointment.status?.toLowerCase()
                  }`}
                >
                  {appointment.status || "Pending"}
                </span>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )}

</section>

      </main>

    </div>
  );
}

export default DoctorDetails;