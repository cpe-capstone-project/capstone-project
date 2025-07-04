import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface RequireRoleProps {
  allowedRoles: string[];
  children: JSX.Element;
}

const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unknown" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireRole;