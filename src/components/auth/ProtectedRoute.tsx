import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import React from "react";
import { Spinner } from "@/components/ui/spinner"; // Import Spinner component

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  // if (isInitializing) {
  //   // Optionally render a loading spinner or skeleton here
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <Spinner size={40} />
  //     </div>
  //   );
  // }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
