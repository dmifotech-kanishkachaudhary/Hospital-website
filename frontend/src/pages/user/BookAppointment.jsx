import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../config";
import "./BookAppointment.css";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

function BookAppointment() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    doctor: "",
    department: "",
    date: "",
    time: "",
    reason: "",
  });

  const token = localStorage.getItem("token");

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          `${API}/api/doctors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setDoctors(data.doctors || []);
        } else {
          setMessage(
            data.message || "Failed to load doctors"
          );
        }

      } catch (error) {
        console.error(error);

        setMessage(
          "Unable to load doctors"
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // When doctor changes, automatically set department
    if (name === "doctor") {
      const selectedDoctor = doctors.find(
        (doctor) => doctor._id === value
      );

      if (selectedDoctor) {
        setFormData((prev) => ({
          ...prev,
          doctor: value,
          department:
            selectedDoctor.department ||
            "",
        }));
      }
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  setBooking(true);
  setMessage("");

  try {

    
//===============================//
    const TEST_MODE = true;

if (TEST_MODE) {
  const res = await fetch(
    `${API}/api/appointments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  setMessage("Appointment booked successfully!");

  setTimeout(() => {
    navigate("/user/appointments");
  }, 1500);

  return;
}
//============================//

    // 1. Create Razorpay Order
    const orderRes = await fetch(
      `${API}/api/payment/create-order`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const orderData = await orderRes.json();

    if (!orderData.success) {
      throw new Error(orderData.message);
    }

    // 2. Razorpay Options
    const options = {
      key: orderData.key,

      amount: orderData.order.amount,

      currency: orderData.order.currency,

      name: "City Hospital",

      description: "Appointment Booking",

      order_id: orderData.order.id,

      handler: async function (response) {
        try {
          const verifyRes = await fetch(
            `${API}/api/payment/verify`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify({
                ...response,
                appointmentData: formData,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (!verifyData.success) {
            throw new Error(verifyData.message);
          }

          setMessage("Appointment booked successfully!");

          setTimeout(() => {
            navigate("/user/appointments");
          }, 1500);

        } catch (err) {
          console.log(err);

          setMessage(err.message);
        }
      },

      prefill: {
        name: "Patient",
        email: "",
      },

      theme: {
        color: "#2563eb",
      },
    };

    const razor = new window.Razorpay(options);

    razor.open();

  } catch (err) {

    console.log(err);

    setMessage(err.message);

  } finally {

    setBooking(false);

  }
};

  return (
    <div className="appointment-page">

      {/* Top bar */}
      <div className="appointment-topbar">
        <Link to="/user/dashboard">
          ← Dashboard
        </Link>

        <span>City Hospital • Patient Portal</span>
      </div>

      {/* Main */}
      <main className="appointment-container">

        <div className="appointment-heading">
          <span>HEALTHCARE APPOINTMENT</span>

          <h1>
            Book an Appointment
          </h1>

          <p>
            Choose a doctor and a convenient time
            for your consultation.
          </p>
        </div>

        <div className="appointment-layout">

          {/* Form */}
          <form
            className="appointment-form"
            onSubmit={handleSubmit}
          >

            {/* Department */}
            <div className="form-group">

              <label>
                Department
              </label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select department
                </option>

                <option value="Cardiology">
                  Cardiology
                </option>

                <option value="Neurology">
                  Neurology
                </option>

                <option value="Orthopedics">
                  Orthopedics
                </option>

                <option value="Pediatrics">
                  Pediatrics
                </option>

                <option value="General Medicine">
                  General Medicine
                </option>
              </select>

            </div>

            {/* Doctor */}
            <div className="form-group">

              <label>
                Doctor
              </label>

              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                required
                disabled={loadingDoctors}
              >
                <option value="">
                  {loadingDoctors
                    ? "Loading doctors..."
                    : "Select doctor"}
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor._id}
                    value={doctor._id}
                  >
                    Dr. {doctor.name}
                    {doctor.specialization
                      ? ` — ${doctor.specialization}`
                      : ""}
                  </option>
                ))}
              </select>

            </div>

            {/* Date */}
            <div className="form-row">

              <div className="form-group">

                <label>
                  Appointment Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              {/* Time */}
              <div className="form-group">

                <label>
                  Preferred Time
                </label>

                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select time
                  </option>

                  <option value="09:00 AM">
                    09:00 AM
                  </option>

                  <option value="10:00 AM">
                    10:00 AM
                  </option>

                  <option value="10:30 AM">
                    10:30 AM
                  </option>

                  <option value="11:00 AM">
                    11:00 AM
                  </option>

                  <option value="12:00 PM">
                    12:00 PM
                  </option>

                  <option value="02:00 PM">
                    02:00 PM
                  </option>

                  <option value="03:00 PM">
                    03:00 PM
                  </option>

                  <option value="04:00 PM">
                    04:00 PM
                  </option>

                </select>

              </div>

            </div>

            {/* Reason */}
            <div className="form-group">

              <label>
                Reason for Visit
              </label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Briefly describe your concern..."
                rows="4"
              />

            </div>

            {/* Message */}
            {message && (
              <div
                className={
                  message.includes("successfully")
                    ? "appointment-success"
                    : "appointment-error"
                }
              >
                {message}
              </div>
            )}

            {/* Submit */}
              <button
                type="submit"
                className="book-submit-btn"
                disabled={booking}
              >
                {booking
                  ? "Processing Payment..."
                  : "Pay ₹500 & Book Appointment"}
              </button>

          </form>

          {/* Information card */}
          <div className="appointment-info-card">

            <div className="info-icon">
              📅
            </div>

            <h2>
              Your appointment
            </h2>

            <p>
              Select a doctor, date and time that
              works best for you.
            </p>

            <div className="info-item">
              <span>✓</span>
              Choose from available doctors
            </div>

            <div className="info-item">
              <span>✓</span>
              Select your preferred time
            </div>

            <div className="info-item">
              <span>✓</span>
              Receive confirmation after booking
            </div>

            <div className="appointment-note">
              <strong>Note</strong>

              <p>
                Appointment availability may depend
                on doctor schedules. Please arrive
                a few minutes before your appointment.
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default BookAppointment;