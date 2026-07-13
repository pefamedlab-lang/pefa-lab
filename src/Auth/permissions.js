import { USER_ROLES } from "./userRoles";

/* =========================
   ROLE PERMISSIONS
========================= */

export const permissions = {
  /* =========================
     RECEPTIONIST
  ========================= */

  [USER_ROLES.RECEPTIONIST]:
    {
      registerPatient:
        true,

      invoicing: true,

      printReceipt:
        true,

      resultEntry:
        false,

      reviewResult:
        false,

      authorizeResult:
        false,

      releaseResult:
        false,

      inventory:
        false,

      audit:
        false,

      manageUsers:
        false,

      editPrices:
        false,

      editReference:
        false,

      fullAccess:
        false,
    },

  /* =========================
     SCIENTIST
  ========================= */

  [USER_ROLES.SCIENTIST]:
    {
      registerPatient:
        false,

      invoicing: false,

      printReceipt:
        false,

      resultEntry:
        true,

      reviewResult:
        true,

      authorizeResult:
        false,

      releaseResult:
        false,

      inventory:
        false,

      audit:
        false,

      manageUsers:
        false,

      editPrices:
        false,

      editReference:
        false,

      fullAccess:
        false,
    },

  /* =========================
     MANAGER
  ========================= */

  [USER_ROLES.MANAGER]:
    {
      registerPatient:
        true,

      invoicing: true,

      printReceipt:
        true,

      resultEntry:
        false,

      reviewResult:
        false,

      authorizeResult:
        false,

      releaseResult:
        false,

      inventory:
        true,

      audit: true,

      manageUsers:
        false,

      editPrices:
        false,

      editReference:
        false,

      fullAccess:
        false,
    },

  /* =========================
     ADMIN
  ========================= */

  [USER_ROLES.ADMIN]:
    {
      registerPatient:
        true,

      invoicing: true,

      printReceipt:
        true,

      resultEntry:
        true,

      reviewResult:
        true,

      authorizeResult:
        true,

      releaseResult:
        true,

      inventory:
        true,

      audit: true,

      manageUsers:
        true,

      editPrices:
        true,

      editReference:
        true,

      fullAccess:
        true,
    },
};

/* =========================
   CHECK PERMISSION
========================= */

export function hasPermission(
  role,
  permission
) {
  if (
    !permissions[role]
  ) {
    return false;
  }

  return (
    permissions[role][
      permission
    ] || false
  );
}