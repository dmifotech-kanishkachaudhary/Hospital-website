import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/doctor.css";

function DoctorDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [doctor, setDoctor] = useState(null);

  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  });

  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);



  const loadDashboard = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/doctor/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("Dashboard Response:", data);

      if (!res.ok) {
        throw new Error(data.message);
      }

      setDoctor(data.doctor || null);

      setStats(
        data.stats || {
          totalAppointments: 0,
          pendingAppointments: 0,
          confirmedAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
        }
      );

      setAppointments(
  Array.isArray(data.todayAppointments)
    ? data.todayAppointments
    : []
);
    } catch (err) {
      console.log(err);

      setAppointments([]);

      setStats({
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
      });
    }

    setLoading(false);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  if (loading) {
    return (
      <div className="doctor-loading">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <div className="doctor-topbar">
        <h2>🏥 City Hospital</h2>

        <button onClick={logout}>
          Logout
        </button>
      </div>

      <div className="doctor-welcome">
        <h1>
  Welcome Dr. {doctor?.name || "Doctor"}
</h1>

        <p>
          {doctor?.specialization}
        </p>

        <small>
  {doctor?.email}
</small>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{stats.totalAppointments}</h2>
          <p>Total Appointments</p>
        </div>

        <div className="stat-card pending">
          <h2>{stats.pendingAppointments}</h2>
          <p>Pending</p>
        </div>

        <div className="stat-card confirmed">
          <h2>{stats.confirmedAppointments}</h2>
          <p>Confirmed</p>
        </div>

        <div className="stat-card completed">
          <h2>{stats.completedAppointments}</h2>
          <p>Completed</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          onClick={() =>
            navigate("/doctor/appointments")
          }
        >
          Appointments
        </button>

        <button
          onClick={() =>
            navigate("/doctor/patients")
          }
        >
          Patients
        </button>

        <button
          onClick={() =>
            navigate("/doctor/chat")
          }
        >
          Chat
        </button>
        <button
  onClick={() =>
    navigate("/doctor/profile")
  }
>
  My Profile
</button>
      </div>

      <div className="appointment-table">
        <h2>Today's Appointments</h2>

        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="4">
                  No Appointments
                </td>
              </tr>
            ) : (
              appointments.slice(0, 5).map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    {appointment.patient?.name}
                  </td>

                  <td>
                    {new Date(
                      appointment.date
                    ).toLocaleDateString()}
                  </td>

                  <td>{appointment.time}</td>

                  <td>
                    <span
                      className={`status ${appointment.status.toLowerCase()}`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DoctorDashboard;