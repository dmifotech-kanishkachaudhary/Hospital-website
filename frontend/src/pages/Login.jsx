import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../config";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [loginMode, setLoginMode] =
    useState("password");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // DASHBOARD REDIRECT
  // =====================================================

  const redirectUser = (user) => {

    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }

  };


  // =====================================================
  // PASSWORD LOGIN
  // =====================================================

  const handlePasswordLogin = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {

      const response =
        await axios.post(
          `${API}/api/auth/login`,
          {
            email,
            password,
          }
        );


      const {
        token,
        user,
      } = response.data;


      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      redirectUser(user);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Login failed. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // SEND OTP
  // =====================================================

  const handleSendOtp = async () => {

    if (!email) {

      setError(
        "Please enter your email address."
      );

      return;
    }


    setError("");
    setSuccess("");
    setLoading(true);

    try {

      const response =
        await axios.post(
          `${API}/api/auth/send-otp`,
          {
            email,
          }
        );


      setOtpSent(true);

      setSuccess(
        response.data.message ||
        "OTP sent to your email."
      );

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Failed to send OTP."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOtp = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {

      const response =
        await axios.post(
          `${API}/api/auth/verify-otp`,
          {
            email,
            otp,
          }
        );


      const {
        token,
        user,
      } = response.data;


      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      redirectUser(user);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "OTP verification failed."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // CHANGE LOGIN MODE
  // =====================================================

  const changeLoginMode = (mode) => {

    setLoginMode(mode);

    setError("");
    setSuccess("");

    setOtpSent(false);
    setOtp("");

  };


  return (

    <div className="login-page">

      <div className="login-card">


        {/* ================= LEFT ================= */}

        <div className="login-info">

          <div className="login-brand">

            <span>✚</span>

            <strong>
              City Hospital
            </strong>

          </div>


          <div className="login-message">

            <span>
              WELCOME BACK
            </span>

            <h1>
              Your health,
              <br />
              <em>
                our priority.
              </em>
            </h1>

            <p>
              Access your appointments,
              medical records, prescriptions
              and more — all in one place.
            </p>

          </div>


          <div className="login-support">

            <span>
              24/7 Emergency Support
            </span>

            <strong>
              108
            </strong>

          </div>

        </div>


        {/* ================= RIGHT ================= */}

        <div className="login-form-section">


          <div className="form-header">

            <span>
              ACCOUNT LOGIN
            </span>

            <h2>
              Welcome back
            </h2>

            <p>
              Choose how you want to login.
            </p>

          </div>


          {/* ================= LOGIN TABS ================= */}

          <div className="login-tabs">

            <button
              type="button"
              className={
                loginMode === "password"
                  ? "login-tab active"
                  : "login-tab"
              }
              onClick={() =>
                changeLoginMode("password")
              }
            >
              Password Login
            </button>


            <button
              type="button"
              className={
                loginMode === "otp"
                  ? "login-tab active"
                  : "login-tab"
              }
              onClick={() =>
                changeLoginMode("otp")
              }
            >
              Login with OTP
            </button>

          </div>


          {/* =================================================
              PASSWORD LOGIN
          ================================================= */}

          {loginMode === "password" && (

            <form
              onSubmit={
                handlePasswordLogin
              }
            >

              <div className="form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              <div className="form-group">

                <div className="password-label">

                  <label>
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => {
                      changeLoginMode("otp");
                    }}
                  >
                    Login with OTP
                  </button>

                </div>


                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              {error && (
                <p className="login-error">
                  {error}
                </p>
              )}


              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >

                {loading
                  ? "Logging in..."
                  : "Login"}

                {!loading && (
                  <span>
                    →
                  </span>
                )}

              </button>

            </form>

          )}


          {/* =================================================
              OTP LOGIN
          ================================================= */}

          {loginMode === "otp" && (

            <form
              onSubmit={
                otpSent
                  ? handleVerifyOtp
                  : (e) => {
                      e.preventDefault();
                      handleSendOtp();
                    }
              }
            >

              <div className="form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  disabled={otpSent}
                  required
                />

              </div>


              {!otpSent && (

                <>

                  <p className="otp-info">
                    We'll send a 6-digit OTP
                    to your registered email
                    address.
                  </p>


                  {error && (
                    <p className="login-error">
                      {error}
                    </p>
                  )}


                  <button
                    type="submit"
                    className="login-submit"
                    disabled={loading}
                  >

                    {loading
                      ? "Sending OTP..."
                      : "Send OTP"}

                    {!loading && (
                      <span>
                        →
                      </span>
                    )}

                  </button>

                </>

              )}


              {otpSent && (

                <>

                  <div className="form-group">

                    <label>
                      Enter OTP
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                        )
                      }
                      required
                    />

                  </div>


                  {success && (
                    <p className="login-success">
                      {success}
                    </p>
                  )}


                  {error && (
                    <p className="login-error">
                      {error}
                    </p>
                  )}


                  <button
                    type="submit"
                    className="login-submit"
                    disabled={
                      loading ||
                      otp.length !== 6
                    }
                  >

                    {loading
                      ? "Verifying..."
                      : "Verify & Login"}

                    {!loading && (
                      <span>
                        →
                      </span>
                    )}

                  </button>


                  <button
                    type="button"
                    className="resend-otp"
                    onClick={() => {
                      setOtp("");
                      handleSendOtp();
                    }}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>

                </>

              )}

            </form>

          )}


          {/* ================= REGISTER ================= */}

          <div className="register-text">

            Don't have an account?

            <Link to="/register">
              Create an account
            </Link>

          </div>

          <div className="doctor-login-section">

            <p className="doctor-login-text">
              Are you a doctor?
            </p>

            <Link to="/doctor/login">
              <button
                type="button"
                className="doctor-login-btn"
              >
                🩺 Doctor Login
              </button>
            </Link>

          </div>


          <Link
            to="/public/dashboard"
            className="back-home"
          >
            ← Back to Hospital
          </Link>


        </div>

      </div>

    </div>
  );
}

export default Login;