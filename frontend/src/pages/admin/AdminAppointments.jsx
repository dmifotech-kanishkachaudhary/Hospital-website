import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../config";
import AdminNavbar from "../../components/AdminNavbar";
import "./AdminAppointments.css";

function Appointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchAppointments = async (
    searchValue = "",
    statusValue = ""
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.append("search", searchValue.trim());
      }

      if (statusValue) {
        params.append("status", statusValue);
      }

      const query = params.toString();

      const url = query
        ? `${API}/api/appointments?${query}`
        : `${API}/api/appointments`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch appointments"
        );
      }

      setAppointments(data.appointments || []);
    } catch (error) {
      console.error(
        "Appointments Error:",
        error
      );

      setError(error.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    fetchAppointments(
      search,
      status
    );
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;

    setStatus(newStatus);

    fetchAppointments(
      search,
      newStatus
    );
  };

  const handleClear = () => {
    setSearch("");
    setStatus("");

    fetchAppointments();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (value) => {
    return (
      value?.toLowerCase() ||
      "pending"
    );
  };

  return (
    <div className="admin-appointments-page">

      {/* ================= NAVBAR ================= */}

      <AdminNavbar activePage="appointments" />


      {/* ================= MAIN ================= */}

      <main className="admin-appointments-container">

        {/* HEADER */}

        <div className="admin-appointments-header">

          <div>

            <span>
              APPOINTMENT MANAGEMENT
            </span>

            <h1>
              Appointments
            </h1>

            <p>
              Search and manage all hospital
              appointments.
            </p>

          </div>

          <div className="appointment-count">

            <strong>
              {appointments.length}
            </strong>

            <span>
              {search || status
                ? "Matching Appointments"
                : "Appointments"}
            </span>

          </div>

        </div>


        {/* SEARCH */}

        <form
          className="appointment-search"
          onSubmit={handleSearch}
        >

          <div className="appointment-search-input">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search by patient, doctor, email, department or reason..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <select
            value={status}
            onChange={handleStatusChange}
            className="appointment-status-filter"
          >
            <option value="">
              All Status
            </option>

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

          <button type="submit">
            Search
          </button>

          {(search || status) && (
            <button
              type="button"
              className="clear-appointment-search"
              onClick={handleClear}
            >
              Clear
            </button>
          )}

        </form>


        {/* ERROR */}

        {error && (
          <div className="appointments-error">
            {error}
          </div>
        )}


        {/* APPOINTMENTS TABLE */}

        <section className="appointments-table-card">

          <div className="appointments-table-heading">

            <div>

              <span>
                HOSPITAL APPOINTMENTS
              </span>

              <h2>
                Appointment List
              </h2>

            </div>

          </div>


          {loading ? (

            <div className="appointments-state">

              <div>⏳</div>

              <h3>
                Loading appointments...
              </h3>

              <p>
                Please wait while we fetch
                appointment records.
              </p>

            </div>

          ) : appointments.length === 0 ? (

            <div className="appointments-state">

              <div>📅</div>

              <h3>
                No appointments found
              </h3>

              <p>
                Try searching with a different
                patient, doctor or status.
              </p>

            </div>

          ) : (

            <div className="appointments-table-wrapper">

              <table className="appointments-table">

                <thead>

                  <tr>

                    <th>
                      Appointment ID
                    </th>

                    <th>
                      Patient
                    </th>

                    <th>
                      Doctor
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {appointments.map(
                    (appointment) => (

                      <tr
                        key={
                          appointment._id
                        }
                      >

                        {/* ID */}

                        <td>

                          <span className="appointment-id">
                            {appointment._id.slice(
                              -8
                            )}
                          </span>

                        </td>


                        {/* PATIENT */}

                        <td>

                          <button
                            className="table-person-btn"
                            onClick={() => {
                              const patientId =
                                appointment.patient?._id;

                              if (patientId) {
                                navigate(
                                  `/admin/patients/${patientId}`
                                );
                              }
                            }}
                          >

                            <div className="appointment-person-avatar">
                              {appointment.patient?.name
                                ?.charAt(0)
                                .toUpperCase() ||
                                "P"}
                            </div>

                            <strong>
                              {appointment.patient
                                ?.name ||
                                "Unknown Patient"}
                            </strong>

                          </button>

                        </td>


                        {/* DOCTOR */}

                        <td>

                          <button
                            className="table-person-btn"
                            onClick={() => {
                              const doctorId =
                                appointment.doctor?._id;

                              if (doctorId) {
                                navigate(
                                  `/admin/doctors/${doctorId}`
                                );
                              }
                            }}
                          >

                            <div className="doctor-mini-avatar">
                              👨‍⚕️
                            </div>

                            <strong>
                            {appointment.doctor?.user?.name || "Unknown Doctor"}
                          </strong>

                          </button>

                        </td>


                        {/* DEPARTMENT */}

                        <td>
                          {appointment.department ||
                            appointment.doctor
                              ?.department ||
                            "N/A"}
                        </td>


                        {/* DATE */}

                        <td>
                          {formatDate(
                            appointment.date
                          )}
                        </td>


                        {/* TIME */}

                        <td>
                          {appointment.time ||
                            "N/A"}
                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`appointment-status ${getStatusClass(
                              appointment.status
                            )}`}
                          >
                            {appointment.status ||
                              "Pending"}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="view-appointment-btn"
                            onClick={() =>
                              navigate(
                                `/admin/appointments/${appointment._id}`
                              )
                            }
                          >
                            View Details →
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Appointments;