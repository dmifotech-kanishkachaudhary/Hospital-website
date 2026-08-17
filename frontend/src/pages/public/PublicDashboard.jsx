import { useState } from "react";
import { Link } from "react-router-dom";
import "./PublicDashboard.css";

function PublicDashboard() {
  const [selectedInfo, setSelectedInfo] = useState(null);

  // =====================================================
  // MODAL DATA
  // =====================================================

  const services = {
    "Emergency Care": {
      icon: "♡",
      title: "Emergency Care",
      subtitle: "Immediate medical assistance",
      description:
        "Our emergency care team provides immediate medical attention for urgent and critical medical situations.",
      points: [
        "24/7 emergency support",
        "Experienced emergency care team",
        "Immediate medical assessment",
        "Critical care support",
      ],
    },

    Diagnostics: {
      icon: "⌁",
      title: "Diagnostics",
      subtitle: "Accurate and reliable testing",
      description:
        "Our diagnostic services help patients receive accurate and reliable medical reports using modern healthcare facilities.",
      points: [
        "Reliable diagnostic services",
        "Modern testing facilities",
        "Accurate medical reports",
        "Professional healthcare support",
      ],
    },

    Pharmacy: {
      icon: "✚",
      title: "Pharmacy",
      subtitle: "Healthcare essentials",
      description:
        "Our pharmacy provides convenient access to prescribed medicines and essential healthcare products.",
      points: [
        "Prescribed medicines",
        "Healthcare essentials",
        "Convenient access",
        "Professional assistance",
      ],
    },

    "Online Consultation": {
      icon: "☏",
      title: "Online Consultation",
      subtitle: "Healthcare from your home",
      description:
        "Connect with qualified doctors from the comfort of your home through our online consultation services.",
      points: [
        "Consult qualified doctors",
        "Convenient online appointments",
        "Healthcare from home",
        "Easy access to medical guidance",
      ],
    },
  };

  const departments = {
    Cardiology: {
      icon: "♡",
      title: "Cardiology",
      subtitle: "Heart & cardiovascular care",
      description:
        "Our cardiology department focuses on heart and cardiovascular healthcare, helping patients receive specialized medical attention.",
      points: [
        "Heart health consultation",
        "Cardiovascular care",
        "Specialist medical guidance",
        "Patient-focused treatment",
      ],
    },

    Neurology: {
      icon: "◉",
      title: "Neurology",
      subtitle: "Brain & nervous system care",
      description:
        "Our neurology department provides specialized care related to the brain and nervous system.",
      points: [
        "Neurological consultation",
        "Brain health care",
        "Nervous system assessment",
        "Specialist guidance",
      ],
    },

    Orthopedics: {
      icon: "✦",
      title: "Orthopedics",
      subtitle: "Bones & joint care",
      description:
        "Our orthopedics department focuses on the health and treatment of bones, joints and related conditions.",
      points: [
        "Bone health consultation",
        "Joint care",
        "Orthopedic assessment",
        "Specialist medical guidance",
      ],
    },

    Pediatrics: {
      icon: "♧",
      title: "Pediatrics",
      subtitle: "Specialized child healthcare",
      description:
        "Our pediatrics department provides healthcare focused specifically on children and their medical needs.",
      points: [
        "Child healthcare",
        "Pediatric consultation",
        "Growth and health guidance",
        "Child-focused medical care",
      ],
    },
  };

  // =====================================================
  // OPEN MODAL
  // =====================================================

  const openModal = (data) => {
    setSelectedInfo(data);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    setSelectedInfo(null);
  };

  return (
    <div className="public-dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <Link
          to="/public/dashboard"
          className="logo"
        >
          <span className="logo-icon">
            ✚
          </span>

          <span>
            City Hospital
          </span>
        </Link>


        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#services">
            Services
          </a>

          <a href="#departments">
            Departments
          </a>

          <a href="#about">
            About
          </a>

        </div>


        <div className="nav-actions">

          <Link
            to="/login"
            className="login-btn"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="register-btn"
          >
            Register
          </Link>

        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-content">

          <span className="hero-tag">
            ✦ Trusted Healthcare Since 2005
          </span>

          <h1>
            Your Health,
            <br />
            <span>
              Our Priority.
            </span>
          </h1>

          <p>
            Compassionate care, experienced doctors and modern
            healthcare facilities — all under one roof.
          </p>


          <div className="hero-buttons">

            <Link
              to="/login"
              className="primary-btn"
            >
              Book an Appointment →
            </Link>

            <a
              href="#services"
              className="secondary-btn"
            >
              Explore Services
            </a>

          </div>


          <div className="trust-info">

            <div>
              <strong>50+</strong>
              <span>Expert Doctors</span>
            </div>

            <div>
              <strong>10+</strong>
              <span>Departments</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Emergency Care</span>
            </div>

          </div>

        </div>


        {/* HERO VISUAL */}

        <div className="hero-visual">

          <div className="circle-bg"></div>


          <button
            className="doctor-card"
            onClick={() =>
              openModal({
                icon: "👩‍⚕️",
                title: "Expert Care",
                subtitle:
                  "Experienced healthcare professionals",
                description:
                  "City Hospital provides compassionate healthcare through experienced doctors and dedicated medical professionals.",
                points: [
                  "Experienced medical professionals",
                  "Patient-focused healthcare",
                  "Modern healthcare facilities",
                  "Compassionate medical support",
                ],
              })
            }
          >

            <div className="doctor-avatar">
              👩‍⚕️
            </div>

            <div>
              <strong>
                Expert Care
              </strong>

              <p>
                Here for you, always.
              </p>
            </div>

          </button>


          <button
            className="floating-card"
            onClick={() =>
              openModal({
                icon: "♥",
                title: "24/7 Emergency Support",
                subtitle:
                  "Emergency healthcare assistance",
                description:
                  "Our emergency care service is available around the clock for urgent medical situations.",
                points: [
                  "Available 24/7",
                  "Immediate medical attention",
                  "Experienced emergency team",
                  "Urgent healthcare support",
                ],
              })
            }
          >

            <span className="heart-icon">
              ♥
            </span>

            <div>
              <strong>
                24/7
              </strong>

              <p>
                Emergency Support
              </p>
            </div>

          </button>


          <div className="medical-cross">
            ✚
          </div>

        </div>

      </section>


      {/* ================= SERVICES ================= */}

      <section
        className="section"
        id="services"
      >

        <div className="section-heading">

          <span>
            WHAT WE OFFER
          </span>

          <h2>
            Healthcare made simple.
          </h2>

          <p>
            Everything you need for a healthier and happier life.
          </p>

        </div>


        <div className="service-grid">

          {Object.values(services).map(
            (service, index) => (

              <button
                key={service.title}
                className={`service-card ${
                  index === 0
                    ? "featured"
                    : ""
                }`}
                onClick={() =>
                  openModal(service)
                }
              >

                <div className="service-icon">
                  {service.icon}
                </div>

                <h3>
                  {service.title}
                </h3>

                <p>
                  {service.description}
                </p>

                <span className="arrow">
                  →
                </span>

              </button>

            )
          )}

        </div>

      </section>


      {/* ================= DEPARTMENTS ================= */}

      <section
        className="departments-section"
        id="departments"
      >

        <div className="section-heading">

          <span>
            OUR SPECIALITIES
          </span>

          <h2>
            Care for every need.
          </h2>

        </div>


        <div className="department-grid">

          {Object.values(departments).map(
            (department) => (

              <button
                key={department.title}
                className="department-card"
                onClick={() =>
                  openModal(department)
                }
              >

                <span>
                  {department.icon}
                </span>

                <h3>
                  {department.title}
                </h3>

                <p>
                  {department.subtitle}
                </p>

              </button>

            )
          )}

        </div>

      </section>


      {/* ================= ABOUT ================= */}

      <section
        className="about-section"
        id="about"
      >

        <div>

          <span className="about-tag">
            WHY CITY HOSPITAL?
          </span>

          <h2>
            Healthcare that feels
            <span> personal.</span>
          </h2>

          <p>
            At City Hospital, we believe healthcare is more
            than just treatment. It's about listening,
            understanding and caring for every patient as
            an individual.
          </p>

          <Link
            to="/register"
            className="primary-btn"
          >
            Get Started →
          </Link>

        </div>


        <div className="about-box">

          <div className="about-number">
            20+
          </div>

          <p>
            Years of trusted healthcare
          </p>


          <div className="about-number">
            10K+
          </div>

          <p>
            Happy patients
          </p>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <Link
          to="/public/dashboard"
          className="footer-logo"
        >
          ✚ City Hospital
        </Link>

        <p>
          Compassionate care. Better health. Better life.
        </p>

        <div>
          Emergency:{" "}
          <a href="tel:108">
            <strong>108</strong>
          </a>
        </div>

      </footer>


      {/* =====================================================
          INFORMATION MODAL
      ===================================================== */}

      {selectedInfo && (

        <div
          className="public-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="public-info-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="public-modal-header">

              <div>

                <span className="public-modal-icon">
                  {selectedInfo.icon}
                </span>

                <div>

                  <span className="public-modal-label">
                    CITY HOSPITAL
                  </span>

                  <h2>
                    {selectedInfo.title}
                  </h2>

                  <p>
                    {selectedInfo.subtitle}
                  </p>

                </div>

              </div>


              <button
                className="public-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* MODAL CONTENT */}

            <div className="public-modal-body">

              <p className="public-modal-description">
                {selectedInfo.description}
              </p>


              <div className="public-modal-services">

                <span>
                  WHAT WE PROVIDE
                </span>

                <h3>
                  Quality healthcare for you.
                </h3>

              </div>


              <div className="public-modal-points">

                {selectedInfo.points.map(
                  (point) => (

                    <div
                      key={point}
                      className="public-modal-point"
                    >

                      <span>
                        ✓
                      </span>

                      <p>
                        {point}
                      </p>

                    </div>

                  )
                )}

              </div>


              <div className="public-modal-actions">

                <button
                  className="public-modal-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>

                <Link
                  to="/login"
                  className="public-modal-primary"
                  onClick={closeModal}
                >
                  Book an Appointment →
                </Link>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default PublicDashboard;