import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/doctor.css";

function DoctorProfile() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    department: "",
    experience: 0,
    consultationFee: 0,
    availability: "Available",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/doctor/profile",
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

      setDoctor({
        name: data.doctor.user.name,
        email: data.doctor.user.email,
        phone: data.doctor.phone,
        specialization: data.doctor.specialization,
        department: data.doctor.department,
        experience: data.doctor.experience,
        consultationFee: data.doctor.consultationFee,
        availability: data.doctor.availability,
      });
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setDoctor({
      ...doctor,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/doctor/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(doctor),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setMessage("Profile updated successfully.");

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="doctor-dashboard">

      <div className="doctor-topbar">
        <h2>Doctor Profile</h2>

        <button
          onClick={() =>
            navigate("/doctor/dashboard")
          }
        >
          Back
        </button>
      </div>

      <form
        className="doctor-profile-form"
        onSubmit={saveProfile}
      >

        <label>Name</label>

        <input
          name="name"
          value={doctor.name}
          onChange={handleChange}
        />

        <label>Email</label>

        <input
          value={doctor.email}
          disabled
        />

        <label>Phone</label>

        <input
          name="phone"
          value={doctor.phone}
          onChange={handleChange}
        />

        <label>Specialization</label>

        <input
          name="specialization"
          value={doctor.specialization}
          onChange={handleChange}
        />

        <label>Department</label>

        <input
          name="department"
          value={doctor.department}
          onChange={handleChange}
        />

        <label>Experience</label>

        <input
          type="number"
          name="experience"
          value={doctor.experience}
          onChange={handleChange}
        />

        <label>Consultation Fee</label>

        <input
          type="number"
          name="consultationFee"
          value={doctor.consultationFee}
          onChange={handleChange}
        />

        <label>Availability</label>

        <select
          name="availability"
          value={doctor.availability}
          onChange={handleChange}
        >
          <option>Available</option>
          <option>Busy</option>
          <option>On Leave</option>
        </select>

        {message && (
          <p className="register-success">
            {message}
          </p>
        )}

        {error && (
          <p className="register-error">
            {error}
          </p>
        )}

        <button type="submit">
          Save Changes
        </button>

      </form>

    </div>
  );
}

export default DoctorProfile;