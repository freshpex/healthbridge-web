import { Navigate } from "react-router-dom";
import { useAuth } from "../app/auth/hooks/use-auth";
import type { Role } from "../types/domain";
import { canAccessRoute } from "../utilities/rbac";
import type { ReactElement } from "react";

export function ProtectedRoute({ allowed, children }: { allowed: Role[]; children: ReactElement }) {
  const { booting, user } = useAuth();
  if (booting) return <main className="state-page"><div className="loading-state">Checking secure session...</div></main>;
  if (!user) return <Navigate to="/signin" replace />;
  if (!canAccessRoute(user.role, allowed)) return <Navigate to="/" replace />;
  return children;
}
