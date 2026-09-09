import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  allowedRoles,
}) {
  let user = null;

  try {
    const storedUser = localStorage.getItem("pefa_user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("[ProtectedRoute] Invalid pefa_user:", error);
    localStorage.removeItem("pefa_user");
  }

  /* ==========================================================
     NO LOGIN
     ========================================================== */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* ==========================================================
     NORMALIZE USER ROLE
     ========================================================== */

  const normalizeRole = (role) =>
    String(role || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

  const userRole = normalizeRole(user.role);

  /* ==========================================================
     NORMALIZE ALLOWED ROLES
     ========================================================== */

  const normalizedAllowedRoles = Array.isArray(allowedRoles)
    ? allowedRoles.map(normalizeRole)
    : [];

  /* ==========================================================
     ROLE ALIASES
     Supports existing PEFA LIS role naming variations.
     ========================================================== */

  const roleAliases = {
    receptionist: ["receptionist"],
    scientist: [
      "scientist",
      "lab scientist",
      "laboratory scientist",
      "medical laboratory scientist",
    ],
    manager: ["manager", "lab manager", "laboratory manager"],
    admin: [
      "admin",
      "administrator",
      "director",
      "director admin",
    ],
  };

  /* ==========================================================
     RESOLVE USER ROLE GROUP
     ========================================================== */

  let resolvedUserRoles = [userRole];

  for (const [roleGroup, aliases] of Object.entries(roleAliases)) {
    if (aliases.includes(userRole)) {
      resolvedUserRoles = [
        ...resolvedUserRoles,
        roleGroup,
        ...aliases,
      ];
    }
  }

  /* ==========================================================
     INVALID ROLE
     ========================================================== */

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.some((allowedRole) =>
      resolvedUserRoles.includes(allowedRole)
    )
  ) {
    console.warn("[ProtectedRoute] Access denied:", {
      userRole: user.role,
      normalizedUserRole: userRole,
      allowedRoles,
    });

    return <Navigate to="/dashboard" replace />;
  }

  /* ==========================================================
     AUTHORIZED
     ========================================================== */

  return children;
}