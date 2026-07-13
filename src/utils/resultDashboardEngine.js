import {
  RESULT_STATUS,
  getNextStatus,
} from "./resultStatusEngine";

/* =========================
   CRITICAL CHECK
========================= */

export const isCriticalResult =
  (patient) => {
    const hb =
      Number(
        patient?.result_data
          ?.hb
      );

    const platelet =
      Number(
        patient?.result_data
          ?.platelet
      );

    return (
      hb < 6 ||
      platelet < 20
    );
  };

/* =========================
   SUMMARY COUNTS
========================= */

export const getSummaryCounts =
  (patients) => {
    return {
      pending:
        patients.filter(
          (p) =>
            p.authorization_status ===
            RESULT_STATUS.PENDING
        ).length,

      reviewed:
        patients.filter(
          (p) =>
            p.authorization_status ===
            RESULT_STATUS.REVIEWED
        ).length,

      authorized:
        patients.filter(
          (p) =>
            p.authorization_status ===
            RESULT_STATUS.AUTHORIZED
        ).length,

      released:
        patients.filter(
          (p) =>
            p.authorization_status ===
            RESULT_STATUS.RELEASED
        ).length,

      critical:
        patients.filter(
          isCriticalResult
        ).length,
    };
  };

/* =========================
   FILTER ENGINE
========================= */

export const filterPatients =
  (
    patients,
    search,
    filter
  ) => {
    return patients.filter(
      (patient) => {
        const matchesSearch =
          patient.patient_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          patient.lab_number
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          patient.phone
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesFilter =
          filter === "ALL"
            ? true
            : filter ===
              "CRITICAL"
            ? isCriticalResult(
                patient
              )
            : patient.authorization_status ===
              filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  };

/* =========================
   ROLE ACCESS
========================= */

export const canAdvanceWorkflow =
  (
    role,
    status
  ) => {
    if (
      role ===
        "Scientist" &&
      status ===
        RESULT_STATUS.PENDING
    ) {
      return true;
    }

    if (
      role ===
        "Manager" &&
      status ===
        RESULT_STATUS.REVIEWED
    ) {
      return true;
    }

    if (
      role ===
        "Admin" &&
      status ===
        RESULT_STATUS.AUTHORIZED
    ) {
      return true;
    }

    return false;
  };

/* =========================
   NEXT WORKFLOW
========================= */

export const moveWorkflow =
  async (
    supabase,
    patient
  ) => {
    const nextStatus =
      getNextStatus(
        patient.authorization_status
      );

    return await supabase
      .from(
        "patient_results"
      )
      .update({
        authorization_status:
          nextStatus,
      })
      .eq(
        "id",
        patient.id
      );
  };