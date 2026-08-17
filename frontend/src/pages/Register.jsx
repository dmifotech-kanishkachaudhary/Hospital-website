import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="register-card">

        <div className="register-info">

          <div className="register-brand">

            <span>✚</span>

            <strong>
              City Hospital
            </strong>

          </div>


          <div className="register-message">

            <span>
              JOIN CITY HOSPITAL
            </span>

            <h1>
              Better care,
              <br />
              <em>starts here.</em>
            </h1>

            <p>
              Create your account to manage appointments,
              medical records and healthcare services easily.
            </p>

          </div>


          <div className="register-benefits">

            <div>
              ✓ Easy appointment booking
            </div>

            <div>
              ✓ Access medical records
            </div>

            <div>
              ✓ Manage prescriptions
            </div>

          </div>

        </div>


        {/* ================= RIGHT SIDE ================= */}

        <div className="register-form-section">

          <div className="register-header">

            <span>
              CREATE ACCOUNT
            </span>

            <h2>
              Get started
            </h2>

            <p>
              Enter your details to create your account.
            </p>

          </div>


          <form onSubmit={handleRegister}>

            {/* NAME */}

            <div className="register-form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* EMAIL */}

            <div className="register-form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* PHONE */}

            <div className="register-form-group">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />

            </div>


            {/* DOB + GENDER */}

            <div className="register-form-row">

              <div className="register-form-group">

                <label>
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  required
                />

              </div>


              <div className="register-form-group">

                <label>
                  Gender
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>

                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>

                </select>

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />

            </div>


            {/* ERROR */}

            {error && (
              <p className="register-error">
                {error}
              </p>
            )}


            {/* SUCCESS */}

            {success && (
              <p className="register-success">
                {success}
              </p>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : "Create Account"}

              {!loading && (
                <span>
                  →
                </span>
              )}

            </button>

          </form>

          <div className="doctor-register-link">

          <p>
              Are you a doctor?
          </p>

          <Link to="/doctor/register">
              Register as Doctor →
          </Link>

        </div>


          <div className="login-text">

            Already have an account?

            <Link to="/login">
              Login
            </Link>

          </div>


          <Link
            to="/public/dashboard"
            className="register-back-home"
          >
            ← Back to Hospital
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;