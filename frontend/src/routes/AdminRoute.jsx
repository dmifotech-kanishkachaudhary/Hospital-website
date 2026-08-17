import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Login nahi hai
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Login hai but admin nahi hai
  if (user?.role !== "admin") {
    return <Navigate to="/user/dashboard" replace />;
  }

  // Admin hai
  return children;
}

export default AdminRoute;