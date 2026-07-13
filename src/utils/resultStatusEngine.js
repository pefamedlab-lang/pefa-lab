export const RESULT_STATUS = {
  PENDING: "Pending",

  REVIEWED: "Reviewed",

  AUTHORIZED:
    "Authorized",

  RELEASED:
    "Released",
};

/* =========================
   STATUS LABEL
========================= */

export const getStatusLabel =
  (status) => {
    switch (status) {
      case RESULT_STATUS.PENDING:
        return "Pending";

      case RESULT_STATUS.REVIEWED:
        return "Reviewed";

      case RESULT_STATUS.AUTHORIZED:
        return "Authorized";

      case RESULT_STATUS.RELEASED:
        return "Released";

      default:
        return "Pending";
    }
  };

/* =========================
   STATUS COLOR
========================= */

export const getStatusColor =
  (status) => {
    switch (status) {
      case RESULT_STATUS.PENDING:
        return "#f59e0b";

      case RESULT_STATUS.REVIEWED:
        return "#2563eb";

      case RESULT_STATUS.AUTHORIZED:
        return "#16a34a";

      case RESULT_STATUS.RELEASED:
        return "#7c3aed";

      default:
        return "#64748b";
    }
  };

/* =========================
   NEXT STATUS
========================= */

export const getNextStatus =
  (status) => {
    switch (status) {
      case RESULT_STATUS.PENDING:
        return RESULT_STATUS.REVIEWED;

      case RESULT_STATUS.REVIEWED:
        return RESULT_STATUS.AUTHORIZED;

      case RESULT_STATUS.AUTHORIZED:
        return RESULT_STATUS.RELEASED;

      default:
        return RESULT_STATUS.RELEASED;
    }
  };