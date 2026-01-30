import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "candidate" | "recruiter";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isCandidate, isRecruiter, authInitializing } = useAuth();
  const location = useLocation();

  if (authInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/40 p-6">
          <div className="flex items-center gap-4">
            <SkeletonLoader className="h-12 w-12 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader className="h-4 w-40 rounded" />
              <SkeletonLoader className="h-3 w-64 rounded" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <SkeletonLoader className="h-10 w-full rounded-lg" />
            <SkeletonLoader className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

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
