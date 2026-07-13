import { USER_ROLES } from "./userRoles";

export const navigationAccess = {
  [USER_ROLES.RECEPTIONIST]:
    [
      "/dashboard",
      "/registration",
      "/invoice",
    ],

  [USER_ROLES.SCIENTIST]:
    [
      "/dashboard",
      "/result-dashboard",
      "/hematology-report",
      "/chemistry-report",
      "/microbiology-report",
      "/blood-banking",
    ],

  [USER_ROLES.MANAGER]:
    [
      "/dashboard",
      "/registration",
      "/invoice",
      "/staff-manager",
    ],

  [USER_ROLES.ADMIN]:
    [
      "/dashboard",
      "/registration",
      "/invoice",
      "/result-dashboard",
      "/hematology-report",
      "/chemistry-report",
      "/microbiology-report",
      "/blood-banking",
      "/staff-manager",
    ],
};