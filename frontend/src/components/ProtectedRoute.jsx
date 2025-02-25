import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/userAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { roles } = useAuth();
  console.log("roles in ProtectedRoute", roles);
  const hasAccess = allowedRoles.includes(roles);

  if (!hasAccess) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
