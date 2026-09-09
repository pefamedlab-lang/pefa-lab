/*
 * ==========================================================
 * PEFA ENTERPRISE LIS
 * PrintQuantitativeSingleResult.jsx
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Dedicated print renderer for:
 *
 *   QuantitativeSingleResultEntry.jsx
 *
 * IMPORTANT
 * ----------------------------------------------------------
 * This component is intentionally independent of PrintRouter.
 *
 * It renders ONE saved quantitative laboratory result as ONE
 * complete PEFA laboratory document:
 *
 *   Letterhead
 *   Patient Information
 *   Report Heading
 *   Result Table
 *   Interpretation
 *   Result Entered By
 *   Authorized By
 *   Verification
 *   Confidentiality Notice
 *   Footer
 *
 * It does NOT:
 *   - fetch Supabase data
 *   - mutate laboratory_results
 *   - group unrelated reports
 *   - render another report underneath itself
 *   - stringify result objects into JSON
 *
 * Compatible with the payload produced by:
 *   QuantitativeSingleResultEntry.jsx
 *
 * ==========================================================
 */

import React, { useMemo } from "react";

import {
  getDisplayUnit,
  getReferenceRange,
  getTestName,
  text,
} from "../../../services/laboratory/quantitativeResultMetadata";

/* ==========================================================
   SAFE HELPERS
   ========================================================== */

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }
  return "";
};

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeFlag = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const flagLabel = (value) => {
  const flag = normalizeFlag(value);

  if (flag === "H" || flag.includes("HIGH")) return "HIGH";
  if (flag === "L" || flag.includes("LOW")) return "LOW";
  if (flag === "N" || flag.includes("NORMAL")) return "NORMAL";
  if (flag.includes("CRITICAL")) return "CRITICAL";
  if (flag.includes("ABNORMAL")) return "ABNORMAL";

  return value ? String(value) : "—";
};

const flagTone = (value) => {
  const flag = normalizeFlag(value);

  if (flag.includes("CRITICAL")) {
    return {
      color: "#b91c1c",
      background: "#fef2f2",
    };
  }

  if (
    flag === "H" ||
    flag === "L" ||
    flag.includes("HIGH") ||
    flag.includes("LOW") ||
    flag.includes("ABNORMAL")
  ) {
    return {
      color: "#b45309",
      background: "#fffbeb",
    };
  }

  if (flag === "N" || flag.includes("NORMAL")) {
    return {
      color: "#166534",
      background: "#f0fdf4",
    };
  }

  return {
    color: "#475569",
    background: "#f8fafc",
  };
};

/* ==========================================================
   RESULT RESOLUTION
   ========================================================== */

const getSavedValue = (result = {}) => {
  const direct = firstValue(
    result.result,
    result.result_numeric,
    result.result_value,
    result.value,
    result.display_value,
    result.displayValue
  );

  if (direct !== "") return direct;

  const containers = [
    result.result_data,
    result.resultData,
    result.patient_results,
    result.patientResults,
    result.results,
  ];

  for (const container of containers) {
    let parsed = container;

    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        continue;
      }
    }

    if (!isObject(parsed)) continue;

    const nested = firstValue(
      parsed.result,
      parsed.result_numeric,
      parsed.result_value,
      parsed.value,
      parsed.display_value,
      parsed.displayValue
    );

    if (nested !== "") return nested;
  }

  return "—";
};

const resolveTestName = (test, result, title) =>
  firstValue(
    title,
    result?.test_name,
    result?.testName,
    result?.name,
    result?.test,
    test?.test_name,
    test?.testName,
    test?.name,
    test?.test,
    test?.masterTest?.test_name,
    test?.master_test?.test_name,
    test?.masterTest?.name,
    test?.master_test?.name,
    "Laboratory Investigation"
  );

const resolvePatient = (patient, registration, result) => ({
  name: firstValue(
    patient?.full_name,
    patient?.patient_name,
    patient?.name,
    registration?.full_name,
    registration?.patient_name,
    result?.patient_name,
    result?.patientName,
    "Patient"
  ),

  patientId: firstValue(
    patient?.patient_id,
    patient?.patientId,
    registration?.patient_id,
    registration?.patientId,
    result?.patient_id,
    result?.patientId
  ),

  labNumber: firstValue(
    result?.lab_number,
    result?.labNumber,
    registration?.lab_number,
    registration?.labNumber,
    patient?.lab_number,
    patient?.labNumber
  ),

  registrationNumber: firstValue(
    result?.registration_number,
    result?.registrationNumber,
    registration?.registration_number,
    registration?.registrationNumber
  ),

  age: firstValue(
    patient?.age,
    patient?.age_years,
    registration?.age,
    registration?.age_years,
    result?.age,
    result?.age_years
  ),

  sex: firstValue(
    patient?.sex,
    patient?.gender,
    registration?.sex,
    registration?.gender,
    result?.sex,
    result?.gender
  ),

  phone: firstValue(
    patient?.phone,
    registration?.phone,
    result?.phone
  ),

  referringDoctor: firstValue(
    patient?.referring_doctor,
    registration?.referring_doctor,
    registration?.referral_doctor,
    result?.referring_doctor,
    result?.referral_doctor
  ),

  referringHospital: firstValue(
    patient?.referring_hospital,
    registration?.referring_hospital,
    registration?.referral_hospital,
    result?.referring_hospital,
    result?.referral_hospital
  ),

  clinicalHistory: firstValue(
    patient?.clinical_history,
    registration?.clinical_history,
    result?.clinical_history
  ),

  sampleType: firstValue(
    result?.sample_type,
    result?.sampleType,
    registration?.sample_type
  ),

  collectionDate: firstValue(
    result?.collection_date,
    result?.collectionDate,
    result?.sample_collection_date,
    result?.sample_collected_at,
    registration?.collection_date
  ),

  reportDate: firstValue(
    result?.report_date,
    result?.reportDate,
    result?.released_at,
    result?.updated_at,
    result?.created_at
  ),
});

const resolveUnit = (test, result) =>
  firstValue(
    result?.unit,
    result?.result_unit,
    result?.resultUnit,
    result?.reporting_unit,
    result?.reportingUnit,
    test?.unit,
    test?.result_unit,
    test?.resultUnit,
    test?.reporting_unit,
    test?.reportingUnit,
    (() => {
      try {
        return getDisplayUnit(test || {}, result || {});
      } catch {
        return "";
      }
    })()
  );

const resolveReferenceRange = (test, patient, result) =>
  firstValue(
    result?.reference_range,
    result?.referenceRange,
    result?.reference_value,
    result?.referenceValue,
    test?.reference_range,
    test?.referenceRange,
    test?.reference_value,
    test?.referenceValue,
    (() => {
      try {
        return getReferenceRange(test || {}, patient || {}, result || {});
      } catch {
        return "";
      }
    })()
  );

const resolveFlag = (result) =>
  firstValue(
    result?.flag,
    result?.result_flag,
    result?.resultFlag,
    result?.status,
    result?.result_status,
    "Normal"
  );

const buildInterpretation = (flag) => {
  const normalized = normalizeFlag(flag);

  if (
    normalized.includes("CRITICAL")
  ) {
    return "The reported result is critically outside the expected laboratory reference interval. Urgent clinical review and appropriate clinical correlation are advised.";
  }

  if (
    normalized === "H" ||
    normalized.includes("HIGH")
  ) {
    return "The reported result is above the stated laboratory reference interval. Clinical correlation is advised.";
  }

  if (
    normalized === "L" ||
    normalized.includes("LOW")
  ) {
    return "The reported result is below the stated laboratory reference interval. Clinical correlation is advised.";
  }

  if (
    normalized === "ABNORMAL"
  ) {
    return "The reported result is outside the stated laboratory reference interval. Clinical correlation is advised.";
  }

  return "The reported result is within the stated laboratory reference interval. Laboratory findings should be interpreted alongside the patient's clinical findings.";
};

/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

export default function PrintQuantitativeSingleResult({
  test = null,
  result = null,
  patient = null,
  registration = null,
  title = "",
  department = "Chemical Pathology",
  printMode = "full",
  showVerification = true,
}) {
  const safeTest = test || {};
  const safeResult = result || {};

  const report = useMemo(() => {
    const resolvedPatient = resolvePatient(
      patient,
      registration,
      safeResult
    );

    const testName = resolveTestName(
      safeTest,
      safeResult,
      title
    );

    const value = getSavedValue(safeResult);
    const unit = resolveUnit(
      safeTest,
      safeResult
    );

    const referenceRange =
      resolveReferenceRange(
        safeTest,
        resolvedPatient,
        safeResult
      );

    const flag = resolveFlag(
      safeResult
    );

    return {
      patient: resolvedPatient,
      testName,
      value,
      unit,
      referenceRange,
      flag,
      interpretation:
        firstValue(
          safeResult.interpretation,
          safeResult.interpretation_text,
          safeResult.interpretationText
        ) || buildInterpretation(flag),
    };
  }, [
    safeTest,
    safeResult,
    patient,
    registration,
    title,
  ]);

  const enteredBy = firstValue(
    safeResult.entered_by,
    safeResult.enteredBy,
    safeResult.performed_by,
    safeResult.performedBy,
    "Laboratory Scientist"
  );

  const authorizedBy = firstValue(
    safeResult.authorized_by,
    safeResult.authorizedBy,
    "Chief Medical Laboratory Scientist"
  );

  const releasedBy = firstValue(
    safeResult.released_by,
    safeResult.releasedBy,
    authorizedBy
  );

  const verificationId = firstValue(
    safeResult.verification_id,
    safeResult.verificationId,
    safeResult.result_verification_id,
    `${report.patient.labNumber || "PEFA"}-${safeResult.id || "RESULT"}`
  );

  const status = firstValue(
    safeResult.release_status,
    safeResult.result_status,
    safeResult.authorization_status,
    "Entered"
  );

  const isPreprinted =
    String(printMode).toLowerCase() === "preprinted" ||
    String(printMode).toLowerCase() === "record";

  const styles = {
    page: {
      width: "100%",
      maxWidth: 794,
      margin: "0 auto",
      background: "#fff",
      color: "#172033",
      fontFamily:
        '"Arial", "Helvetica Neue", sans-serif',
      fontSize: 12,
      lineHeight: 1.45,
      boxSizing: "border-box",
    },

    letterhead: {
      borderBottom: "2px solid #0f766e",
      paddingBottom: 12,
      marginBottom: 14,
    },

    brandRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 18,
    },

    brand: {
      flex: 1,
    },

    logoText: {
      margin: 0,
      fontSize: 25,
      lineHeight: 1,
      fontWeight: 900,
      letterSpacing: "0.08em",
      color: "#0f3d4c",
    },

    diagnostic: {
      margin: "4px 0 0",
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: "0.16em",
      color: "#0f766e",
    },

    slogan: {
      margin: "5px 0 0",
      fontSize: 10,
      fontWeight: 700,
      color: "#64748b",
    },

    registrationBox: {
      textAlign: "right",
      fontSize: 9,
      color: "#475569",
      lineHeight: 1.5,
      maxWidth: 270,
    },

    serviceStrip: {
      marginTop: 10,
      padding: "5px 8px",
      borderTop: "1px solid #dbe3ec",
      borderBottom: "1px solid #dbe3ec",
      fontSize: 8.5,
      color: "#475569",
      textAlign: "center",
      letterSpacing: "0.04em",
    },

    heading: {
      margin: "0 0 12px",
      textAlign: "center",
      fontSize: 16,
      fontWeight: 900,
      letterSpacing: "0.08em",
      color: "#0f172a",
    },

    department: {
      margin: "-7px 0 12px",
      textAlign: "center",
      fontSize: 10,
      fontWeight: 800,
      color: "#0f766e",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },

    sectionTitle: {
      padding: "6px 9px",
      background: "#f1f5f9",
      border: "1px solid #dbe3ec",
      borderBottom: 0,
      fontSize: 10,
      fontWeight: 900,
      color: "#334155",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },

    patientTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: 15,
    },

    patientCell: {
      border: "1px solid #dbe3ec",
      padding: "7px 8px",
      verticalAlign: "top",
    },

    patientLabel: {
      display: "block",
      marginBottom: 2,
      fontSize: 8.5,
      fontWeight: 800,
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },

    patientValue: {
      fontSize: 10.5,
      fontWeight: 700,
      color: "#172033",
    },

    resultTable: {
      width: "100%",
      borderCollapse: "collapse",
      tableLayout: "fixed",
    },

    th: {
      border: "1px solid #cbd5e1",
      padding: "8px 7px",
      background: "#e2e8f0",
      color: "#172033",
      fontSize: 9,
      fontWeight: 900,
      textAlign: "left",
      textTransform: "uppercase",
    },

    td: {
      border: "1px solid #cbd5e1",
      padding: "9px 7px",
      fontSize: 10.5,
      verticalAlign: "middle",
    },

    resultValue: {
      fontWeight: 900,
      fontSize: 12,
    },

    flag: {
      display: "inline-block",
      minWidth: 58,
      padding: "3px 6px",
      borderRadius: 4,
      textAlign: "center",
      fontSize: 8.5,
      fontWeight: 900,
    },

    interpretation: {
      marginTop: 13,
      border: "1px solid #dbe3ec",
      padding: 10,
    },

    interpretationTitle: {
      marginBottom: 4,
      fontSize: 9,
      fontWeight: 900,
      color: "#334155",
      letterSpacing: "0.06em",
    },

    interpretationBody: {
      fontSize: 10,
      color: "#334155",
    },

    history: {
      marginTop: 12,
      padding: 9,
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      fontSize: 9.5,
    },

    signatureGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 25,
      marginTop: 30,
    },

    signature: {
      minHeight: 55,
      borderTop: "1px solid #475569",
      paddingTop: 5,
    },

    signatureName: {
      fontSize: 10,
      fontWeight: 800,
    },

    signatureRole: {
      fontSize: 8.5,
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },

    verification: {
      marginTop: 18,
      border: "1px solid #cbd5e1",
      padding: 9,
      display: "flex",
      justifyContent: "space-between",
      gap: 15,
      fontSize: 8.5,
    },

    footer: {
      marginTop: 20,
      paddingTop: 9,
      borderTop: "2px solid #0f766e",
      textAlign: "center",
      color: "#64748b",
      fontSize: 8.5,
    },

    confidential: {
      marginTop: 5,
      fontWeight: 800,
      color: "#475569",
    },
  };

  return (
    <article
      className="pefa-formal-quantitative-report"
      data-report-type="quantitative-single"
      data-print-mode={printMode}
      style={styles.page}
    >
      {/* =====================================================
          DIGITAL LETTERHEAD
          ===================================================== */}

      {!isPreprinted && (
        <header style={styles.letterhead}>
          <div style={styles.brandRow}>
            <div style={styles.brand}>
              <h1 style={styles.logoText}>
                PEFA MEDICAL
              </h1>

              <div style={styles.diagnostic}>
                DIAGNOSTIC SERVICES
              </div>

              <div style={styles.slogan}>
                Leading the Way in Medical Excellence
              </div>
            </div>

            <div style={styles.registrationBox}>
              <strong>REG NO: 3450274</strong>
              <br />
              Head Office: 32 Ogunru-Ori, Pakuro Road, Mowe
              <br />
              Mowe Branch: 5 Olorombo Street, Imedu-Nla, Mowe
              <br />
              Orimerunmu Iya-Ijebu Junction, Ogun State
              <br />
              Tel: 0803 358 3555
              <br />
              Email: info@pefamedlab.com
              <br />
              Website: www.pefamedlab.com
            </div>
          </div>

          <div style={styles.serviceStrip}>
            CLINICAL CHEMISTRY • HAEMATOLOGY • MICROBIOLOGY •
            SEROLOGY & IMMUNOLOGY • BLOOD BANKING •
            ULTRASOUND • MEDICAL RESEARCH
          </div>
        </header>
      )}

      {/* =====================================================
          PRE-PRINTED HEADER SPACING
          ===================================================== */}

      {isPreprinted && (
        <div
          style={{
            height: 100,
            marginBottom: 10,
          }}
          aria-hidden="true"
        />
      )}

      <h2 style={styles.heading}>
        LABORATORY REPORT
      </h2>

      <div style={styles.department}>
        {department || "Laboratory"}
      </div>

      {/* =====================================================
          PATIENT INFORMATION
          ===================================================== */}

      <div style={styles.sectionTitle}>
        PATIENT INFORMATION
      </div>

      <table style={styles.patientTable}>
        <tbody>
          <tr>
            <td style={styles.patientCell} colSpan={2}>
              <span style={styles.patientLabel}>
                Patient Name
              </span>
              <span style={styles.patientValue}>
                {report.patient.name}
              </span>
            </td>

            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Laboratory Number
              </span>
              <span style={styles.patientValue}>
                {report.patient.labNumber || "—"}
              </span>
            </td>

            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Patient ID
              </span>
              <span style={styles.patientValue}>
                {report.patient.patientId || "—"}
              </span>
            </td>
          </tr>

          <tr>
            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Age
              </span>
              <span style={styles.patientValue}>
                {report.patient.age || "—"}
              </span>
            </td>

            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Sex
              </span>
              <span style={styles.patientValue}>
                {report.patient.sex || "—"}
              </span>
            </td>

            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Registration No.
              </span>
              <span style={styles.patientValue}>
                {report.patient.registrationNumber || "—"}
              </span>
            </td>

            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Sample Type
              </span>
              <span style={styles.patientValue}>
                {report.patient.sampleType || "—"}
              </span>
            </td>
          </tr>

          <tr>
            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Sample Collection
              </span>
              <span style={styles.patientValue}>
                {formatDate(report.patient.collectionDate)}
              </span>
            </td>

            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Report Date
              </span>
              <span style={styles.patientValue}>
                {formatDate(report.patient.reportDate)}
              </span>
            </td>

            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Referring Doctor
              </span>
              <span style={styles.patientValue}>
                {report.patient.referringDoctor || "—"}
              </span>
            </td>

            <td style={styles.patientCell}>
              <span style={styles.patientLabel}>
                Referring Hospital
              </span>
              <span style={styles.patientValue}>
                {report.patient.referringHospital || "—"}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* =====================================================
          EXAMINATION
          ===================================================== */}

      <div style={styles.sectionTitle}>
        EXAMINATION
      </div>

      <table style={styles.resultTable}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: "30%" }}>
              Parameter
            </th>
            <th style={{ ...styles.th, width: "22%" }}>
              Result
            </th>
            <th style={{ ...styles.th, width: "14%" }}>
              Unit
            </th>
            <th style={{ ...styles.th, width: "22%" }}>
              Reference Range
            </th>
            <th style={{ ...styles.th, width: "12%" }}>
              Flag
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td style={styles.td}>
              <strong>{report.testName}</strong>
            </td>

            <td style={styles.td}>
              <span style={styles.resultValue}>
                {String(report.value)}
              </span>
            </td>

            <td style={styles.td}>
              {report.unit || "—"}
            </td>

            <td style={styles.td}>
              {report.referenceRange || "Not configured"}
            </td>

            <td style={styles.td}>
              <span
                style={{
                  ...styles.flag,
                  ...flagTone(report.flag),
                }}
              >
                {flagLabel(report.flag)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* =====================================================
          CLINICAL HISTORY
          ===================================================== */}

      {report.patient.clinicalHistory && (
        <div style={styles.history}>
          <strong>Clinical History:</strong>{" "}
          {report.patient.clinicalHistory}
        </div>
      )}

      {/* =====================================================
          INTERPRETATION
          ===================================================== */}

      <section style={styles.interpretation}>
        <div style={styles.interpretationTitle}>
          INTERPRETATION
        </div>

        <div style={styles.interpretationBody}>
          {report.interpretation}
        </div>
      </section>

      {/* =====================================================
          SIGNATURES / WORKFLOW
          ===================================================== */}

      <div style={styles.signatureGrid}>
        <div style={styles.signature}>
          <div style={styles.signatureName}>
            {enteredBy}
          </div>
          <div style={styles.signatureRole}>
            RESULT ENTERED BY
          </div>
        </div>

        <div style={styles.signature}>
          <div style={styles.signatureName}>
            {authorizedBy}
          </div>
          <div style={styles.signatureRole}>
            AUTHORIZED BY
          </div>
        </div>
      </div>

      {showVerification && (
        <div style={styles.verification}>
          <div>
            <strong>Verification ID:</strong>{" "}
            {verificationId}
          </div>

          <div>
            <strong>Status:</strong>{" "}
            {status}
          </div>

          <div>
            <strong>Released By:</strong>{" "}
            {releasedBy}
          </div>

          <div>
            <strong>Released:</strong>{" "}
            {formatDateTime(
              safeResult.released_at ||
              safeResult.releasedAt ||
              safeResult.updated_at
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer style={styles.footer}>
        <div>
          PEFA Medical Diagnostic Services
        </div>

        <div>
          Laboratory findings should be interpreted by a
          qualified clinician in conjunction with clinical
          findings and other relevant investigations.
        </div>

        <div style={styles.confidential}>
          CONFIDENTIAL MEDICAL DOCUMENT — FOR THE
          INTENDED RECIPIENT ONLY
        </div>
      </footer>
    </article>
  );
}
