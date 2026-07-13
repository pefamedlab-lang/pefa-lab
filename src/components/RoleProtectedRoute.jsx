import {
  Navigate,
} from "react-router-dom";

export default function RoleProtectedRoute({
  children,

  allowedRoles,
}) {
  const user =
    JSON.parse(
      localStorage.getItem(
        "pefa_user"
      )
    );

  if (!user) {
    return (
      <Navigate
        to="/login"
      />
    );
  }

  if (
    !allowedRoles.includes(
      user.role
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
      />
    );
  }

  return children;
}