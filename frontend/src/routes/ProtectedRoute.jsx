/**
 * @file ProtectedRoute.jsx
 * @description Higher-Order Component route guard checking JWT token existence in local storage.
 */

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;