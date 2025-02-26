import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/userAuth";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { roles, token } = useAuth();

  if (!token) {
    return <Navigate to="/" />;
  }

  const hasAccess = allowedRoles.includes(roles);

  if (!hasAccess) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
