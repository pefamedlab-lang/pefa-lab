import {
  Navigate,
} from "react-router-dom";

export default function ProtectedRoute({

  children,

  allowedRoles,
}) {

  const user =
    JSON.parse(
      localStorage.getItem(
        "pefa_user"
      )
    );

  /* NO LOGIN */

  if (!user) {

    return (
      <Navigate to="/login" />
    );
  }

  /* INVALID ROLE */

  if (

    allowedRoles &&

    !allowedRoles.includes(
      user.role
    )

  ) {

    return (
      <Navigate to="/dashboard" />
    );
  }

  return children;
}