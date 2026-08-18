import { Link } from "react-router-dom";

function AdminNavbar({
  activePage = "",
  className = "admin-page-navbar",
  logoClassName = "admin-page-logo",
  navClassName = "admin-page-nav",
  logoutClassName = "admin-logout",
}) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className={className}>
      <Link to="/admin/dashboard" className={logoClassName}>
        <span>✚</span>
        <div>
          <strong>City Hospital</strong>
          <small>Admin Portal</small>
        </div>
      </Link>

      <div className={navClassName}>
        <Link
          to="/admin/dashboard"
          className={activePage === "dashboard" ? "active" : ""}
        >
          Dashboard
        </Link>

        <Link
          to="/admin/patients"
          className={activePage === "patients" ? "active" : ""}
        >
          Patients
        </Link>

        <Link
          to="/admin/doctors"
          className={activePage === "doctors" ? "active" : ""}
        >
          Doctors
        </Link>

        <Link
          to="/admin/appointments"
          className={activePage === "appointments" ? "active" : ""}
        >
          Appointments
        </Link>

        <Link
          to="/admin/reports"
          className={activePage === "reports" ? "active" : ""}
        >
          Reports
        </Link>
      </div>

      <button className={logoutClassName} onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default AdminNavbar;
