import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/userAuth";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role, token } = useAuth();

  if (!token) {
    return <Navigate to="/" />;
  }

  const hasAccess = allowedRoles.includes(role);

  if (!hasAccess) {
    // Redirect based on role
    switch (role) {
      case "PM":
      case "DEPUTY":
        return <Navigate to="/tasks" />;
      case "PMO":
        return <Navigate to="/data-management" />;
      case "ADMIN":
        return <Navigate to="/admin" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
