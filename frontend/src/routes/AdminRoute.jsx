/**
 * @file AdminRoute.jsx
 * @description Higher-Order Component route guard enforcing Admin role privileges.
 */

import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;