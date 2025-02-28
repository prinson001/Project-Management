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
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
