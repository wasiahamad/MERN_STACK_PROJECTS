import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "candidate" | "recruiter";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isCandidate, isRecruiter } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to auth with the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole === "candidate" && !isCandidate) {
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  if (requiredRole === "recruiter" && !isRecruiter) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
