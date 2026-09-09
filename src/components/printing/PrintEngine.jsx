/* ==========================================================
   PEFA LAB
   PRINT ENGINE
   ----------------------------------------------------------
   PATH:
   src/components/printing/PrintEngine.jsx

   RESPONSIBILITY:
   - Provide the common laboratory print surface.
   - Provide patient context to the print document.
   - Apply print mode.
   - Apply print ID.
   - Provide one common document wrapper.

   IMPORTANT:
   - NO ROUTING
   - NO SUPABASE
   - NO TEST LOOKUPS
   - NO MASTER_TEST LOOKUPS
   - NO PANEL_TEST LOOKUPS
   - NO RADIOLOGY
   - NO HISTOLOGY
   - NO SPECIALIZED PRINTER IMPORTS

   Architecture:

       PrintRouter
            |
            v
       PrintEngine
            |
            +-- LetterHeadDocument
            |
            +-- Patient information
            |
            +-- children
            |
            +-- footer / verification
   ========================================================== */

import React, {
  useMemo,
} from "react";

import LetterHeadDocument
  from "./LetterHeadDocument";

/* ==========================================================
   NORMALIZATION
   ========================================================== */

const text = (
  value
) =>
  String(
    value ?? ""
  ).trim();

/* ==========================================================
   PATIENT HELPERS
   ========================================================== */

const getPatientName = (
  patient = {}
) =>
  text(
    patient?.full_name ||
    patient?.patient_name ||
    patient?.patientName ||
    patient?.name ||
    patient?.registration?.full_name ||
    "Unknown Patient"
  );

const getPatientId = (
  patient = {}
) =>
  text(
    patient?.patient_id ||
    patient?.patientId ||
    patient?.id ||
    "—"
  );

const getLabNumber = (
  patient = {}
) =>
  text(
    patient?.lab_number ||
    patient?.labNumber ||
    ""
  );

const getRegistrationNumber = (
  patient = {}
) =>
  text(
    patient?.registration_number ||
    patient?.registrationNumber ||
    ""
  );

const getSex = (
  patient = {}
) =>
  text(
    patient?.sex ||
    patient?.gender ||
    ""
  );

const getAge = (
  patient = {}
) =>
  text(
    patient?.age ??
    patient?.age_years ??
    patient?.patient_age ??
    ""
  );

const getDoctor = (
  patient = {}
) =>
  text(
    patient?.doctor_name ||
    patient?.doctorName ||
    patient?.requesting_doctor ||
    patient?.requestingDoctor ||
    patient?.clinician ||
    ""
  );

/* ==========================================================
   PATIENT OBJECT
   ----------------------------------------------------------
   Normalize only for presentation.

   Existing database payload is NOT modified.
   ========================================================== */

const buildPatientContext = (
  patient
) => ({
  ...patient,

  full_name:
    getPatientName(
      patient
    ),

  patient_name:
    getPatientName(
      patient
    ),

  patient_id:
    getPatientId(
      patient
    ),

  lab_number:
    getLabNumber(
      patient
    ),

  registration_number:
    getRegistrationNumber(
      patient
    ),

  sex:
    getSex(
      patient
    ),

  age:
    getAge(
      patient
    ),

  doctor_name:
    getDoctor(
      patient
    ),
});

/* ==========================================================
   RESULT ARRAY
   ========================================================== */

const normalizeResults = (
  results
) => {
  if (
    Array.isArray(results)
  ) {
    return results.filter(
      Boolean
    );
  }

  if (
    results
  ) {
    return [
      results,
    ];
  }

  return [];
};

/* ==========================================================
   PRINT MODE
   ----------------------------------------------------------
   Supported existing modes:

      internal
      portal
      record
      full
      pdf

   "record" is treated as pre-printed letterhead.
   ========================================================== */

const normalizePrintMode = (
  mode
) => {
  const value =
    text(mode)
      .toLowerCase();

  if (
    value === "portal"
  ) {
    return "portal";
  }

  if (
    value === "record"
  ) {
    return "record";
  }

  if (
    value === "full"
  ) {
    return "full";
  }

  if (
    value === "pdf"
  ) {
    return "pdf";
  }

  return "internal";
};

/* ==========================================================
   PRINT MODE FLAGS
   ========================================================== */

const getPrintModeFlags = (
  mode
) => {
  const normalized =
    normalizePrintMode(
      mode
    );

  return {
    mode:
      normalized,

    isPreprinted:
      normalized ===
      "record",

    isPortal:
      normalized ===
      "portal",

    isFullLetterhead:
      normalized ===
      "full" ||
      normalized ===
      "internal",

    isPdf:
      normalized ===
      "pdf",
  };
};

/* ==========================================================
   ENGINE
   ========================================================== */

export default function PrintEngine({
  children,
  patient = {},
  results = [],
  printMode = "internal",
  printId = "print-root",
  showHeader = true,
  showFooter = true,
}) {
  const normalizedPatient =
    useMemo(
      () =>
        buildPatientContext(
          patient
        ),
      [
        patient,
      ]
    );

  const normalizedResults =
    useMemo(
      () =>
        normalizeResults(
          results
        ),
      [
        results,
      ]
    );

  const modeFlags =
    useMemo(
      () =>
        getPrintModeFlags(
          printMode
        ),
      [
        printMode,
      ]
    );

  /*
   * The engine deliberately does not inspect test metadata.
   *
   * It does not decide:
   * - Chemistry
   * - Haematology
   * - Panel
   * - MCS
   * - Widal
   * - etc.
   *
   * That responsibility belongs to PrintRouter/resolvers.
   */

  return (
    <article
      id={printId}
      className={[
        "pefa-print-engine",
        `pefa-print-mode-${modeFlags.mode}`,
        modeFlags.isPreprinted
          ? "pefa-print-preprinted"
          : "",
        modeFlags.isFullLetterhead
          ? "pefa-print-full-letterhead"
          : "",
        modeFlags.isPortal
          ? "pefa-print-portal"
          : "",
        modeFlags.isPdf
          ? "pefa-print-pdf"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-print-mode={
        modeFlags.mode
      }
      data-print-id={
        printId
      }
    >
      <LetterHeadDocument
        patient={
          normalizedPatient
        }
        results={
          normalizedResults
        }
        printMode={
          modeFlags.mode
        }
        showHeader={
          showHeader
        }
        showFooter={
          showFooter
        }
      >
        <div
          className="pefa-print-engine__document"
          data-print-surface="laboratory"
        >
          {/* ==================================================
              PATIENT CONTEXT
             ================================================== */}

          <section
            className="pefa-print-engine__patient"
            aria-label="Patient information"
          >
            <div className="pefa-print-engine__patient-main">
              <div className="pefa-print-engine__patient-name">
                {
                  normalizedPatient.full_name
                }
              </div>

              <div className="pefa-print-engine__patient-meta">
                <span>
                  Patient ID:{" "}
                  {
                    normalizedPatient.patient_id ||
                    "—"
                  }
                </span>

                <span>
                  Lab No:{" "}
                  {
                    normalizedPatient.lab_number ||
                    "—"
                  }
                </span>

                <span>
                  Registration:{" "}
                  {
                    normalizedPatient.registration_number ||
                    "—"
                  }
                </span>

                <span>
                  Sex:{" "}
                  {
                    normalizedPatient.sex ||
                    "—"
                  }
                </span>

                <span>
                  Age:{" "}
                  {
                    normalizedPatient.age ||
                    "—"
                  }
                </span>
              </div>
            </div>

            {normalizedPatient.doctor_name && (
              <div className="pefa-print-engine__doctor">
                <span>
                  Requesting Clinician
                </span>

                <strong>
                  {
                    normalizedPatient.doctor_name
                  }
                </strong>
              </div>
            )}
          </section>

          {/* ==================================================
              REPORT CONTENT
             ================================================== */}

          <main
            className="pefa-print-engine__content"
            data-result-count={
              normalizedResults.length
            }
          >
            {children}
          </main>
        </div>
      </LetterHeadDocument>
    </article>
  );
}

/* ==========================================================
   NAMED HELPERS
   ----------------------------------------------------------
   Exported for existing printing components that may need
   common patient information without importing a router.
   ========================================================== */

export {
  buildPatientContext,
  normalizeResults,
  normalizePrintMode,
  getPrintModeFlags,
  getPatientName,
  getPatientId,
  getLabNumber,
  getRegistrationNumber,
  getSex,
  getAge,
  getDoctor,
};