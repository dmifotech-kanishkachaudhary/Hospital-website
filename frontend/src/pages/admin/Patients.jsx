import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../config";
import AdminNavbar from "../../components/AdminNavbar";
import SearchBar from "../../components/SearchBar";
import "./Patients.css";

function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchPatients = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const url =
        searchValue.trim()
          ? `${API}/api/auth/patients?search=${encodeURIComponent(
              searchValue.trim()
            )}`
          : `${API}/api/auth/patients`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch patients"
        );
      }

      setPatients(data.patients || []);
    } catch (error) {
      console.error("Patients Error:", error);
      setError(error.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  const handleClear = () => {
    setSearch("");
    fetchPatients();
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

  return (
    <div className="admin-patients-page">

      {/* ================= NAVBAR ================= */}

      <AdminNavbar activePage="patients" />


      {/* ================= HEADER ================= */}

      <main className="admin-patients-container">

        <div className="admin-patients-header">

          <div>
            <span>PATIENT MANAGEMENT</span>

            <h1>Patients</h1>

            <p>
              Search and manage registered hospital
              patients.
            </p>
          </div>

          <div className="patient-count">
            <strong>{patients.length}</strong>
            <span>
              {search
                ? "Matching Patients"
                : "Patients"}
            </span>
          </div>

        </div>


        {/* ================= SEARCH ================= */}

        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSearch}
          onClear={handleClear}
          placeholder="Search by Patient ID, name, email or phone..."
          clearClassName="clear-search"
        />


        {/* ================= ERROR ================= */}

        {error && (
          <div className="patients-error">
            {error}
          </div>
        )}


        {/* ================= PATIENT TABLE ================= */}

        <section className="patients-table-card">

          <div className="table-heading">

            <div>
              <span>REGISTERED PATIENTS</span>
              <h2>Patient List</h2>
            </div>

          </div>


          {loading ? (

            <div className="patients-state">
              <div>⏳</div>
              <h3>Loading patients...</h3>
              <p>
                Please wait while we fetch patient
                records.
              </p>
            </div>

          ) : patients.length === 0 ? (

            <div className="patients-state">

              <div>👤</div>

              <h3>No patients found</h3>

              <p>
                Try searching with a different
                Patient ID, name, email or phone.
              </p>

            </div>

          ) : (

            <div className="patients-table-wrapper">

              <table className="patients-table">

                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Patient</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {patients.map((patient) => (

                    <tr key={patient._id}>

                      <td>
                        <span className="patient-id">
                          {patient.patientId ||
                            patient._id.slice(-8)}
                        </span>
                      </td>

                      <td>

                        <div className="patient-name">

                          <div className="patient-avatar">
                            {patient.name
                              ?.charAt(0)
                              .toUpperCase() ||
                              "P"}
                          </div>

                          <strong>
                            {patient.name ||
                              "Unknown"}
                          </strong>

                        </div>

                      </td>

                      <td>
                        {patient.email || "N/A"}
                      </td>

                      <td>
                        {patient.phone || "N/A"}
                      </td>

                      <td>
                        {calculateAge(
                          patient.dateOfBirth
                        )}
                      </td>

                      <td>
                        {patient.gender || "N/A"}
                      </td>

                      <td>

                        <button
                          className="view-patient-btn"
                          onClick={() =>
  navigate(`/admin/patients/${patient._id}`)
}
                        >
                          View Details →
                        </button>

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

export default Patients;