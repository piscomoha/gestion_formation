import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/auth/AuthContext";
import type { UserRole } from "@/types";

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
