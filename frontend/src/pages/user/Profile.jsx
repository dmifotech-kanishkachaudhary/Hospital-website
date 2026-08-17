import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",

    address: "",
    city: "",
    state: "",
    pincode: "",

    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelationship: "",

    bloodGroup: "",
    allergies: "",
    medicalConditions: "",
  });

  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // ==================================================
  // FETCH PROFILE
  // ==================================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch profile"
          );
        }

        const profile = data.user;

        setUser(profile);

        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",

          dateOfBirth: profile.dateOfBirth
            ? new Date(profile.dateOfBirth)
                .toISOString()
                .split("T")[0]
            : "",

          gender: profile.gender || "",

          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",

          emergencyContactName:
            profile.emergencyContactName ||
            "",

          emergencyContactNumber:
            profile.emergencyContactNumber ||
            "",

          emergencyContactRelationship:
            profile.emergencyContactRelationship ||
            "",

          bloodGroup:
            profile.bloodGroup || "",

          allergies:
            profile.allergies || "",

          medicalConditions:
            profile.medicalConditions || "",
        });
      } catch (error) {
        console.error(
          "Profile Error:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  // ==================================================
  // HANDLE CHANGE
  // ==================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // ==================================================
  // SAVE PROFILE
  // ==================================================

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      // Update state
      setUser(data.user);

      // Update localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setSuccess(
        "Profile updated successfully."
      );

      setEditing(false);

      // Hide success message
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error(
        "Update Profile Error:",
        error
      );

      setError(error.message);
    } finally {
      setSaving(false);
    }
  };


  // ==================================================
  // CANCEL EDIT
  // ==================================================

  const handleCancel = () => {
    setError("");
    setSuccess("");

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",

      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",

      gender: user.gender || "",

      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",

      emergencyContactName:
        user.emergencyContactName || "",

      emergencyContactNumber:
        user.emergencyContactNumber || "",

      emergencyContactRelationship:
        user.emergencyContactRelationship ||
        "",

      bloodGroup:
        user.bloodGroup || "",

      allergies:
        user.allergies || "",

      medicalConditions:
        user.medicalConditions || "",
    });

    setEditing(false);
  };


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="profile-page">

        <div className="profile-loading">
          Loading your profile...
        </div>

      </div>
    );
  }


  return (
    <div className="profile-page">

      {/* ================= TOP BAR ================= */}

      <div className="profile-topbar">

        <Link to="/user/dashboard">
          ← Dashboard
        </Link>

        <span>
          City Hospital • Patient Portal
        </span>

      </div>


      <main className="profile-container">


        {/* ================= HEADING ================= */}

        <div className="profile-heading">

          <span>
            ACCOUNT
          </span>

          <h1>
            My Profile
          </h1>

          <p>
            Manage your personal and healthcare
            information.
          </p>

        </div>


        {/* ================= MESSAGES ================= */}

        {error && (
          <div className="profile-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-message success">
            {success}
          </div>
        )}


        {/* ================= PROFILE CARD ================= */}

        <div className="profile-card">


          {/* HEADER */}

          <div className="profile-header">

            <div className="profile-avatar">

              {formData.name
                ? formData.name
                    .charAt(0)
                    .toUpperCase()
                : "P"}

            </div>


            <div>

              <h2>
                {formData.name ||
                  "Patient"}
              </h2>

              <p>
                City Hospital Patient
              </p>

            </div>


            {!editing && (
              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => {
                  setEditing(true);
                  setError("");
                  setSuccess("");
                }}
              >
                Edit Profile
              </button>
            )}

          </div>


          <div className="profile-divider"></div>


          {/* ================= FORM ================= */}

          <form onSubmit={handleSave}>


            {/* ================= PERSONAL ================= */}

            <div className="profile-section-title">

              <span>
                PERSONAL INFORMATION
              </span>

              <h3>
                Basic Details
              </h3>

            </div>


            <div className="profile-form-grid">


              {/* NAME */}

              <div className="profile-form-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="profile-form-field">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                />

                <small>
                  Email cannot be changed.
                </small>

              </div>


              {/* PHONE */}

              <div className="profile-form-field">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  maxLength="10"
                  required
                />

              </div>


              {/* DOB */}

              <div className="profile-form-field">

                <label>
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={
                    formData.dateOfBirth
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />

              </div>


              {/* GENDER */}

              <div className="profile-form-field">

                <label>
                  Gender
                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!editing}
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


              {/* ADDRESS */}

              <div className="profile-form-field full-width">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={
                    formData.address
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter your address"
                  rows="3"
                />

              </div>


              {/* CITY */}

              <div className="profile-form-field">

                <label>
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter city"
                />

              </div>


              {/* STATE */}

              <div className="profile-form-field">

                <label>
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter state"
                />

              </div>


              {/* PINCODE */}

              <div className="profile-form-field">

                <label>
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={
                    formData.pincode
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                    setFormData({
                      ...formData,
                      pincode: value,
                    });
                  }}
                  disabled={!editing}
                  placeholder="Enter pincode"
                />

              </div>

            </div>


            {/* ================= EMERGENCY ================= */}

            <div className="profile-section-title profile-section-spacing">

              <span>
                EMERGENCY CONTACT
              </span>

              <h3>
                Someone we can contact
              </h3>

            </div>


            <div className="profile-form-grid">


              <div className="profile-form-field">

                <label>
                  Contact Name
                </label>

                <input
                  type="text"
                  name="emergencyContactName"
                  value={
                    formData.emergencyContactName
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Emergency contact name"
                />

              </div>


              <div className="profile-form-field">

                <label>
                  Contact Number
                </label>

                <input
                  type="tel"
                  name="emergencyContactNumber"
                  value={
                    formData.emergencyContactNumber
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  maxLength="10"
                  placeholder="Emergency contact number"
                />

              </div>


              <div className="profile-form-field">

                <label>
                  Relationship
                </label>

                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={
                    formData.emergencyContactRelationship
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g. Father, Mother, Spouse"
                />

              </div>

            </div>


            {/* ================= MEDICAL ================= */}

            <div className="profile-section-title profile-section-spacing">

              <span>
                MEDICAL INFORMATION
              </span>

              <h3>
                Healthcare Details
              </h3>

            </div>


            <div className="profile-form-grid">


              {/* BLOOD GROUP */}

              <div className="profile-form-field">

                <label>
                  Blood Group
                </label>

                <select
                  name="bloodGroup"
                  value={
                    formData.bloodGroup
                  }
                  onChange={handleChange}
                  disabled={!editing}
                >

                  <option value="">
                    Select blood group
                  </option>

                  <option value="A+">
                    A+
                  </option>

                  <option value="A-">
                    A-
                  </option>

                  <option value="B+">
                    B+
                  </option>

                  <option value="B-">
                    B-
                  </option>

                  <option value="AB+">
                    AB+
                  </option>

                  <option value="AB-">
                    AB-
                  </option>

                  <option value="O+">
                    O+
                  </option>

                  <option value="O-">
                    O-
                  </option>

                </select>

              </div>


              {/* ALLERGIES */}

              <div className="profile-form-field">

                <label>
                  Allergies
                </label>

                <input
                  type="text"
                  name="allergies"
                  value={
                    formData.allergies
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g. Penicillin, None"
                />

              </div>


              {/* MEDICAL CONDITIONS */}

              <div className="profile-form-field full-width">

                <label>
                  Existing Medical Conditions
                </label>

                <textarea
                  name="medicalConditions"
                  value={
                    formData.medicalConditions
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Mention any existing medical conditions"
                  rows="3"
                />

              </div>

            </div>


            {/* ================= ACTIONS ================= */}

            {editing && (

              <div className="profile-actions">

                <button
                  type="button"
                  className="cancel-profile-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes →"}
                </button>

              </div>

            )}

          </form>

        </div>


        {/* ================= SECURITY ================= */}

        <div className="profile-security">

          <div>

            <span>
              ACCOUNT SECURITY
            </span>

            <h3>
              Your account is protected
            </h3>

            <p>
              Your personal information is securely
              associated with your hospital account.
            </p>

          </div>

          <div className="security-icon">
            🔒
          </div>

        </div>


      </main>

    </div>
  );
}

export default Profile;