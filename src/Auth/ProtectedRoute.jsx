import {
  Navigate,
} from "react-router-dom";

import {
  getUserSession,
} from "./authSession";

export default function ProtectedRoute({
  children,
}) {
  const user =
    getUserSession();

  /* =========================
     NO SESSION
  ========================= */

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================
     AUTHORIZED
  ========================= */

  return children;
}