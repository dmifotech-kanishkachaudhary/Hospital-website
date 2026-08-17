import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/doctor.css";

function DoctorPatients() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/doctor/patients",
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

      setPatients(data.patients);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="doctor-loading">
        Loading Patients...
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">

      <div className="doctor-topbar">

        <h2>👨‍⚕️ My Patients</h2>

        <button
          onClick={() => navigate("/doctor/dashboard")}
        >
          ← Dashboard
        </button>

      </div>

      <div className="appointment-table">

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Blood Group</th>
            </tr>

          </thead>

          <tbody>

            {patients.length === 0 ? (
              <tr>
                <td colSpan="5">
                  No Patients Found
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient._id}>

                  <td>{patient.name}</td>

                  <td>{patient.email}</td>

                  <td>{patient.phone}</td>

                  <td>{patient.gender}</td>

                  <td>{patient.bloodGroup || "-"}</td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default DoctorPatients;