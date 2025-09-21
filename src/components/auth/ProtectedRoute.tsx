import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Optionally render a loading spinner or skeleton here
    return <div>Loading authentication...</div>; // Or a more sophisticated loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
