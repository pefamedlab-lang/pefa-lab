export const ROLE_PERMISSIONS =
  {
    Receptionist: [
      "/dashboard",
      "/dashboard/registration",
    ],

    Phlebotomist: [
      "/dashboard",
    ],

    Scientist: [
      "/dashboard",
      "/dashboard/results",
    ],

    Manager: [
      "/dashboard",
      "/dashboard/results",
      "/dashboard/analytics",
    ],

    "Director/Admin":
      ["*"],
  };

export const canAccess =
  (
    role,
    route
  ) => {
    const permissions =
      ROLE_PERMISSIONS[
        role
      ];

    if (
      !permissions
    ) {
      return false;
    }

    if (
      permissions.includes(
        "*"
      )
    ) {
      return true;
    }

    return permissions.includes(
      route
    );
  };