import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *   children  — component to render when access is granted
 *   role      — (optional) required role, e.g. "jobseeker" | "recruiter"
 *
 * • Not logged in  → /login  (with `from` preserved)
 * • Wrong role     → /       (silent redirect)
 * • OK             → render children
 */
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
