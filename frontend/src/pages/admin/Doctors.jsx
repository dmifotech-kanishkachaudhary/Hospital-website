import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../config";
import AdminNavbar from "../../components/AdminNavbar";
import SearchBar from "../../components/SearchBar";
import "./Doctors.css";

function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchDoctors = async (
    searchValue = ""
  ) => {
    try {
      setLoading(true);
      setError("");

      const url = searchValue.trim()
        ? `${API}/api/doctors?search=${encodeURIComponent(
            searchValue.trim()
          )}`
        : `${API}/api/doctors`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch doctors"
        );
      }

      setDoctors(data.doctors || []);
    } catch (error) {
      console.error(
        "Doctors Error:",
        error
      );

      setError(error.message);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(search);
  };

  const handleClear = () => {
    setSearch("");
    fetchDoctors();
  };

  const updateDoctorStatus = async (
  doctorId,
  action
) => {
  try {

    const response = await fetch(
      `${API}/api/doctors/${doctorId}/${action}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    fetchDoctors(search);

  } catch (error) {

    alert(error.message);

  }
};

  return (
    <div className="admin-doctors-page">

      {/* ================= NAVBAR ================= */}

      <AdminNavbar activePage="doctors" />


      {/* ================= MAIN ================= */}

      <main className="admin-doctors-container">

        {/* HEADER */}

        <div className="admin-doctors-header">

          <div>

            <span>
              MEDICAL STAFF MANAGEMENT
            </span>

            <h1>
              Doctors
            </h1>

            <p>
              Search and manage hospital
              doctors.
            </p>

          </div>

          <div className="doctor-count">

            <strong>
              {doctors.length}
            </strong>

            <span>
              {search
                ? "Matching Doctors"
                : "Doctors"}
            </span>

          </div>

        </div>


        {/* SEARCH */}

        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSearch}
          onClear={handleClear}
          placeholder="Search by Doctor ID, name, email, specialization or department..."
          formClassName="doctor-search"
          inputWrapperClassName="doctor-search-input"
          clearClassName="clear-doctor-search"
        />


        {/* ERROR */}

        {error && (
          <div className="doctors-error">
            {error}
          </div>
        )}


        {/* DOCTOR LIST */}

        <section className="doctors-table-card">

          <div className="doctors-table-heading">

            <div>

              <span>
                REGISTERED MEDICAL STAFF
              </span>

              <h2>
                Doctor List
              </h2>

            </div>

          </div>


          {loading ? (

            <div className="doctors-state">

              <div>⏳</div>

              <h3>
                Loading doctors...
              </h3>

              <p>
                Please wait while we
                fetch doctor records.
              </p>

            </div>

          ) : doctors.length === 0 ? (

            <div className="doctors-state">

              <div>👨‍⚕️</div>

              <h3>
                No doctors found
              </h3>

              <p>
                Try searching with a
                different name,
                specialization or
                department.
              </p>

            </div>

          ) : (

            <div className="doctors-table-wrapper">

              <table className="doctors-table">

                <thead>

                  <tr>
                    <th>
                      Doctor ID
                    </th>

                    <th>
                      Doctor
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Specialization
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Experience
                    </th>

                    <th>
                      Availability
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

                  {doctors.map(
                    (doctor) => (

                      <tr
                        key={
                          doctor._id
                        }
                      >

                        <td>

                          <span className="doctor-id">
                            {doctor._id.slice(
                              -8
                            )}
                          </span>

                        </td>


                        <td>

                          <div className="doctor-name">

                            <div className="doctor-avatar">
                              👨‍⚕️
                            </div>

                            <strong>
                              {doctor.name ||
                                "Unknown"}
                            </strong>

                          </div>

                        </td>


                        <td>
                          {doctor.email ||
                            "N/A"}
                        </td>


                        <td>
                          {doctor.specialization ||
                            "N/A"}
                        </td>


                        <td>
                          {doctor.department ||
                            "N/A"}
                        </td>


                        <td>
                          {doctor.experience ??
                            0}{" "}
                          years
                        </td>


                        <td>

                          <span
                            className={
                              doctor.availability
                                ?.toLowerCase() ===
                              "available"
                                ? "doctor-available"
                                : "doctor-unavailable"
                            }
                          >
                            {doctor.availability ||
                              "Available"}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`doctor-status ${doctor.status}`}
                          >
                            {doctor.status}
                          </span>

                        </td>

                        <td>

  {doctor.status === "pending" ? (

    <>

      <button
        className="approve-btn"
        onClick={() =>
          updateDoctorStatus(
            doctor._id,
            "approve"
          )
        }
      >
        Approve
      </button>

      <button
        className="reject-btn"
        onClick={() =>
          updateDoctorStatus(
            doctor._id,
            "reject"
          )
        }
      >
        Reject
      </button>

    </>

  ) : (

    <button
      className="view-doctor-btn"
      onClick={() =>
        navigate(
          `/admin/doctors/${doctor._id}`
        )
      }
    >
      View Details →
    </button>

  )}

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

export default Doctors;