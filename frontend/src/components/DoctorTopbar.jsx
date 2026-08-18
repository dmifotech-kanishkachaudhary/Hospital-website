import { useNavigate } from "react-router-dom";

function DoctorTopbar({
  title = "🏥 City Hospital",
  showLogout = false,
  showBack = false,
  backPath = "/doctor/dashboard",
  onLogout,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate("/doctor/login");
    }
  };

  return (
    <div className="doctor-topbar">
      <h2>{title}</h2>

      {showLogout && <button onClick={handleLogout}>Logout</button>}

      {showBack && (
        <button onClick={() => navigate(backPath)}>Back</button>
      )}
    </div>
  );
}

export default DoctorTopbar;
