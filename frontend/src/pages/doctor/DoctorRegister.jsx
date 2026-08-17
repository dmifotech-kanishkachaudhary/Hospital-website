import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Register.css";

function DoctorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: "",
    department: "",
    experience: "",
    consultationFee: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/doctors/register",
        formData
      );

      setSuccess(res.data.message);

      setTimeout(() => {
        navigate("/doctor/login");
      }, 2000);

    } catch (err) {

      setError(
        err.response?.data?.message ||
          "Registration failed."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-info">

          <div className="register-brand">
            <span>✚</span>
            <strong>City Hospital</strong>
          </div>

          <div className="register-message">
            <span>DOCTOR PORTAL</span>

            <h1>
              Join our
              <br />
              <em>Medical Team</em>
            </h1>

            <p>
              Register as a doctor. Your account will
              become active after admin approval.
            </p>

          </div>

        </div>

        <div className="register-form-section">

          <div className="register-header">

            <span>DOCTOR REGISTRATION</span>

            <h2>Create Account</h2>

          </div>

          <form onSubmit={handleRegister}>

            <div className="register-form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label>Specialization</label>
              <input
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label>Department</label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-row">

              <div className="register-form-group">
                <label>Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>

              <div className="register-form-group">
                <label>Consultation Fee</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                />
              </div>

            </div>

            {error && (
              <p className="register-error">
                {error}
              </p>
            )}

            {success && (
              <p className="register-success">
                {success}
              </p>
            )}

            <button
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Registering..."
                : "Register as Doctor"}
            </button>

          </form>

          <div className="login-text">

            Already have an account?

            <Link to="/doctor/login">
              Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DoctorRegister;