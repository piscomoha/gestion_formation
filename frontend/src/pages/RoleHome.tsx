import { Navigate } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { useAuth } from "@/auth/AuthContext";

export function RoleHome() {
  const { user } = useAuth();

  if (user?.role === "formateur") return <Navigate to="/formateur/dashboard" replace />;
  if (user?.role === "stagiaire") return <Navigate to="/stagiaire/dashboard" replace />;

  return <Dashboard />;
}
