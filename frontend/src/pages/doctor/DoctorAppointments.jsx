import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../config";
import "../../styles/doctor.css";

function DoctorAppointments() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {

    try {

      const res = await fetch(
        `${API}/api/doctor/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setAppointments(data.appointments);

    } catch (err) {
      console.log(err);
    }

    setLoading(false);

  };

  const updateStatus = async (id, status) => {

    try {

      const res = await fetch(
        `${API}/api/doctor/appointments/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      fetchAppointments();

    } catch (err) {
      alert(err.message);
    }

  };

  if (loading) {

    return (
      <div className="doctor-loading">
        Loading Appointments...
      </div>
    );

  }

  return (

    <div className="doctor-dashboard">

      <div className="doctor-topbar">

        <h2>Appointments</h2>

        <button
          onClick={() => navigate("/doctor/dashboard")}
        >
          Back
        </button>

      </div>

      <div className="appointment-table">

        <table>

          <thead>

            <tr>

              <th>Patient</th>

              <th>Email</th>

              <th>Phone</th>

              <th>Date</th>

              <th>Time</th>

              <th>Reason</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {appointments.length === 0 && (

              <tr>

                <td colSpan="8">

                  No appointments found

                </td>

              </tr>

            )}

            {appointments.map((appointment) => (

              <tr key={appointment._id}>

                <td>

                  {appointment.patient?.name}

                </td>

                <td>

                  {appointment.patient?.email}

                </td>

                <td>

                  {appointment.patient?.phone}

                </td>

                <td>

                  {new Date(
                    appointment.date
                  ).toLocaleDateString()}

                </td>

                <td>

                  {appointment.time}

                </td>

                <td>

                  {appointment.reason}

                </td>

                <td>

                  <span
                    className={`status ${appointment.status.toLowerCase()}`}
                  >

                    {appointment.status}

                  </span>

                </td>

                <td>

                  {appointment.status === "Pending" && (

                    <>

                      <button
                        className="confirm-btn"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "Confirmed"
                          )
                        }
                      >
                        Confirm
                      </button>

                      <button
                        className="cancel-btn"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "Cancelled"
                          )
                        }
                      >
                        Cancel
                      </button>

                    </>

                  )}

                  {appointment.status === "Confirmed" && (

                    <button
                      className="complete-btn"
                      onClick={() =>
                        updateStatus(
                          appointment._id,
                          "Completed"
                        )
                      }
                    >
                      Complete
                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default DoctorAppointments;