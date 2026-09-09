
/* ==========================================================
   PEFA LAB
   HEPATITIS B PANEL — RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/HepatitisBPanelResultEntry.jsx

   PURPOSE:
   - Structured Hepatitis B panel result entry
   - Supports NEW RESULT and EDIT RESULT modes
   - Loads existing laboratory result for editing
   - Uses laboratoryResultService
   - Preserves existing result_data payload structure
   - Does not require a separate CSS file
   - All styling is embedded in this component

   EDIT MODE ARCHITECTURE
   ----------------------------------------------------------
   NEW RESULT
       |
       +---- Enter parameters
       |
       +---- Save Result

   EXISTING RESULT
       |
       +---- Load laboratory result
       |
       +---- View saved result
       |
       +---- Edit Result
               |
               +---- Modify parameters
               |
               +---- Save Changes
               |
               +---- Cancel Edit

   DATABASE PAYLOAD
   ----------------------------------------------------------
   Existing database structure is preserved.

   result
   result_status
   result_data

   result_data contains:
   {
     testType,
     method,
     specimen,
     patientName,
     labNumber,
     patientId,
     sex,
     age,
     collectionDate,
     results,
     interpretation,
     comment
   }
   ========================================================== */

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Edit3,
  X,
  Loader2,
  Lock,
} from "lucide-react";

import {
  getLaboratoryResultById,
  updateLaboratoryResult,
} from "../../../services/laboratory/laboratoryResultService";

/* ==========================================================
   DEFAULT RESULT STRUCTURE
   ========================================================== */

const DEFAULT_RESULTS = {
  hbsag: "",
  hbeag: "",
  anti_hbc_total: "",
  anti_hbc_igm: "",
  anti_hbe: "",
  anti_hbs: "",
};

/* ==========================================================
   QUALITATIVE OPTIONS
   ========================================================== */

const QUALITATIVE_OPTIONS = [
  "Negative",
  "Positive",
  "Reactive",
  "Non-Reactive",
  "Indeterminate",
];

const HBSAG_OPTIONS = [
  "Negative",
  "Positive",
  "Reactive",
  "Non-Reactive",
  "Indeterminate",
];

const ANTI_HBS_OPTIONS = [
  "Negative",
  "Positive",
  "Reactive",
  "Non-Reactive",
  "Indeterminate",
];

/* ==========================================================
   TEST DEFINITIONS
   ========================================================== */

const TESTS = [
  {
    key: "hbsag",
    name: "HBsAg",
    fullName:
      "Hepatitis B Surface Antigen",
    description:
      "Indicates current Hepatitis B virus infection when detected.",
    options: HBSAG_OPTIONS,
  },

  {
    key: "hbeag",
    name: "HBeAg",
    fullName:
      "Hepatitis B e Antigen",
    description:
      "Serological marker associated with active viral replication.",
    options: QUALITATIVE_OPTIONS,
  },

  {
    key: "anti_hbc_total",
    name: "Anti-HBc Total",
    fullName:
      "Total Hepatitis B Core Antibody",
    description:
      "Total antibody response to the Hepatitis B core antigen.",
    options: QUALITATIVE_OPTIONS,
  },

  {
    key: "anti_hbc_igm",
    name: "Anti-HBc IgM",
    fullName:
      "Hepatitis B Core IgM Antibody",
    description:
      "IgM antibody to Hepatitis B core antigen.",
    options: QUALITATIVE_OPTIONS,
  },

  {
    key: "anti_hbe",
    name: "Anti-HBe",
    fullName:
      "Hepatitis B e Antibody",
    description:
      "Antibody directed against Hepatitis B e antigen.",
    options: QUALITATIVE_OPTIONS,
  },

  {
    key: "anti_hbs",
    name: "Anti-HBs",
    fullName:
      "Hepatitis B Surface Antibody",
    description:
      "Antibody against Hepatitis B surface antigen.",
    options: ANTI_HBS_OPTIONS,
  },
];

/* ==========================================================
   HELPERS
   ========================================================== */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/* ==========================================================
   RESULT ID RESOLUTION
   ========================================================== */

const getResultIdFromUrl = () => {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const value =
    params.get("result_id") ||
    params.get("resultId") ||
    params.get("id");

  if (!value) {
    return null;
  }

  return Number(value) || null;
};

/* ==========================================================
   INTERPRETATION
   ========================================================== */

function buildInterpretation(results) {
  const {
    hbsag,
    hbeag,
    anti_hbc_total,
    anti_hbc_igm,
    anti_hbe,
    anti_hbs,
  } = results;

  if (!hbsag) {
    return {
      title: "Incomplete Panel",
      text:
        "Complete the Hepatitis B panel before interpretation.",
      tone: "pending",
    };
  }

  if (
    hbsag === "Negative" &&
    anti_hbs === "Positive" &&
    anti_hbc_total === "Negative"
  ) {
    return {
      title:
        "Pattern Suggestive of Immunity",
      text:
        "HBsAg negative with Anti-HBs positive and Anti-HBc total negative. Correlate with vaccination history and clinical findings.",
      tone: "success",
    };
  }

  if (
    hbsag === "Negative" &&
    anti_hbc_total === "Negative" &&
    anti_hbs === "Negative"
  ) {
    return {
      title:
        "No Serological Evidence Detected",
      text:
        "The tested markers do not demonstrate serological evidence of current or previous Hepatitis B infection. Correlate clinically.",
      tone: "neutral",
    };
  }

  if (
    hbsag === "Positive" ||
    hbsag === "Reactive"
  ) {
    if (
      hbeag === "Positive" ||
      hbeag === "Reactive"
    ) {
      return {
        title: "HBsAg Detected",
        text:
          "HBsAg is detected and HBeAg is also detected. This pattern may be associated with active viral replication. Clinical correlation and appropriate confirmatory testing are required.",
        tone: "warning",
      };
    }

    return {
      title: "HBsAg Detected",
      text:
        "HBsAg is detected. Correlate with other Hepatitis B markers, clinical findings and appropriate confirmatory testing.",
      tone: "warning",
    };
  }

  if (
    anti_hbc_igm === "Positive" ||
    anti_hbc_igm === "Reactive"
  ) {
    return {
      title:
        "Anti-HBc IgM Detected",
      text:
        "Anti-HBc IgM is detected. Correlate with HBsAg and other Hepatitis B markers to determine the serological pattern.",
      tone: "warning",
    };
  }

  if (
    anti_hbc_total === "Positive" ||
    anti_hbc_total === "Reactive"
  ) {
    return {
      title: "Anti-HBc Detected",
      text:
        "Total Anti-HBc is detected. Interpretation requires correlation with HBsAg, Anti-HBs and other markers.",
      tone: "neutral",
    };
  }

  if (
    anti_hbe === "Positive" ||
    anti_hbe === "Reactive"
  ) {
    return {
      title: "Anti-HBe Detected",
      text:
        "Anti-HBe is detected. Interpret together with HBsAg, HBeAg and other Hepatitis B markers.",
      tone: "neutral",
    };
  }

  return {
    title: "Panel Result",
    text:
      "Interpretation should be based on the complete Hepatitis B serological profile and clinical context.",
    tone: "neutral",
  };
}

/* ==========================================================
   EXTRACT RESULT DATA
   ========================================================== */

const getResultMetadata = (
  result
) => {
  if (
    result?.result_data &&
    typeof result.result_data ===
      "object" &&
    !Array.isArray(result.result_data)
  ) {
    return result.result_data;
  }

  if (
    result?.result_json &&
    typeof result.result_json ===
      "object" &&
    !Array.isArray(result.result_json)
  ) {
    return result.result_json;
  }

  if (
    result?.structured_result &&
    typeof result.structured_result ===
      "object" &&
    !Array.isArray(
      result.structured_result
    )
  ) {
    return result.structured_result;
  }

  return {};
};

/* ==========================================================
   INITIAL FORM
   ========================================================== */

const getInitialForm = (
  result = null,
  fallback = {}
) => {
  const metadata =
    getResultMetadata(result);

  const metadataResults =
    metadata?.results &&
    typeof metadata.results ===
      "object"
      ? metadata.results
      : {};

  return {
    patientName:
      metadata.patientName ||
      result?.patient_name ||
      result?.full_name ||
      fallback.patientName ||
      fallback.patient_name ||
      "",

    labNumber:
      metadata.labNumber ||
      result?.lab_number ||
      fallback.labNumber ||
      fallback.lab_number ||
      "",

    patientId:
      metadata.patientId ||
      result?.patient_id ||
      fallback.patientId ||
      fallback.patient_id ||
      "",

    sex:
      metadata.sex ||
      result?.sex ||
      fallback.sex ||
      "",

    age:
      metadata.age ||
      result?.age ||
      fallback.age ||
      "",

    collectionDate:
      metadata.collectionDate ||
      result?.collection_date ||
      fallback.collectionDate ||
      "",

    specimen:
      metadata.specimen ||
      "Serum",

    method:
      metadata.method ||
      "Immunochromatographic / Serological Assay",

    results: {
      ...DEFAULT_RESULTS,
      ...metadataResults,
    },

    comment:
      metadata.comment || "",

    interpretation:
      metadata.interpretation || "",
  };
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function HepatitisBPanelResultEntry({
  resultId = null,

  initialResults = {},

  onChange,
  onSave,
  onReset,
  onCancel,

  patient = null,

  labNumber = "",

  readOnly = false,
}) {
  /* ========================================================
     RESULT ID
     ======================================================== */

  const resolvedResultId =
    useMemo(() => {
      if (
        resultId !== null &&
        resultId !== undefined
      ) {
        return (
          Number(resultId) || null
        );
      }

      return getResultIdFromUrl();
    }, [resultId]);

  /* ========================================================
     INITIAL FALLBACK
     ======================================================== */

  const fallbackInitialForm =
    useMemo(
      () =>
        getInitialForm(
          null,
          {
            ...patient,
            labNumber:
              labNumber ||
              patient?.lab_number ||
              "",
            patientName:
              patient?.patient_name ||
              patient?.full_name ||
              "",
          }
        ),
      [patient, labNumber]
    );

  /* ========================================================
     STATE
     ======================================================== */

  const [
    resultRecord,
    setResultRecord,
  ] = useState(null);

  const [form, setForm] =
    useState(() => ({
      ...fallbackInitialForm,

      results: {
        ...DEFAULT_RESULTS,
        ...initialResults,
      },
    }));

  const [
    originalForm,
    setOriginalForm,
  ] = useState(null);

  const [loading, setLoading] =
    useState(
      Boolean(resolvedResultId)
    );

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(
      !resolvedResultId &&
        !readOnly
    );

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* ========================================================
     LOAD EXISTING RESULT
     ======================================================== */

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      if (!resolvedResultId) {
        setLoading(false);

        if (!readOnly) {
          setEditing(true);
        }

        return;
      }

      setLoading(true);
      setError("");
      setMessage("");

      try {
        const result =
          await getLaboratoryResultById(
            resolvedResultId
          );

        if (!mounted) {
          return;
        }

        if (!result) {
          throw new Error(
            "The Hepatitis B laboratory result could not be found."
          );
        }

        const loadedForm =
          getInitialForm(
            result,
            fallbackInitialForm
          );

        setResultRecord(result);
        setForm(loadedForm);
        setOriginalForm(
          loadedForm
        );

        /*
         * Existing records start in VIEW MODE.
         * User must deliberately click Edit Result.
         */
        setEditing(false);
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "HepatitisBPanelResultEntry: failed to load result",
          err
        );

        setError(
          err?.message ||
            "Unable to load Hepatitis B result."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      mounted = false;
    };
  }, [
    resolvedResultId,
    fallbackInitialForm,
    readOnly,
  ]);

  /* ========================================================
     COMPLETION
     ======================================================== */

  const completedCount =
    useMemo(
      () =>
        TESTS.filter(
          (test) =>
            String(
              form.results?.[
                test.key
              ] ?? ""
            ).trim() !== ""
        ).length,
      [form.results]
    );

  const complete =
    completedCount ===
    TESTS.length;

  /* ========================================================
     INTERPRETATION
     ======================================================== */

  const interpretation =
    useMemo(
      () =>
        buildInterpretation(
          form.results
        ),
      [form.results]
    );

  /* ========================================================
     CHANGE
     ======================================================== */

  const handleChange = (
    key,
    value
  ) => {
    if (
      readOnly ||
      !editing
    ) {
      return;
    }

    const nextResults = {
      ...form.results,
      [key]: value,
    };

    const nextForm = {
      ...form,
      results: nextResults,
    };

    setForm(nextForm);
    setMessage("");
    setError("");

    if (
      typeof onChange ===
      "function"
    ) {
      onChange(nextResults);
    }
  };

  /* ========================================================
     COMMENT CHANGE
     ======================================================== */

  const handleCommentChange = (
    value
  ) => {
    if (
      readOnly ||
      !editing
    ) {
      return;
    }

    setForm((current) => ({
      ...current,
      comment: value,
    }));

    setMessage("");
    setError("");
  };

  /* ========================================================
     START EDIT
     ======================================================== */

  const handleEdit = () => {
    if (readOnly) {
      return;
    }

    setError("");
    setMessage("");
    setEditing(true);
  };

  /* ========================================================
     CANCEL EDIT
     ======================================================== */

  const handleCancelEdit = () => {
    if (!originalForm) {
      setEditing(false);
      return;
    }

    setForm({
      ...originalForm,
      results: {
        ...DEFAULT_RESULTS,
        ...(originalForm.results ||
          {}),
      },
    });

    setEditing(false);
    setError("");
    setMessage(
      "Changes discarded."
    );
  };

  /* ========================================================
     RESET
     ======================================================== */

  const handleReset = () => {
    if (
      readOnly ||
      !editing
    ) {
      return;
    }

    const nextResults = {
      ...DEFAULT_RESULTS,
    };

    setForm((current) => ({
      ...current,
      results: nextResults,
      comment: "",
    }));

    setMessage("");
    setError("");

    if (
      typeof onChange ===
      "function"
    ) {
      onChange(nextResults);
    }

    if (
      typeof onReset ===
      "function"
    ) {
      onReset(nextResults);
    }
  };

  /* ========================================================
     SAVE
     ======================================================== */

  const handleSave = async (
    event
  ) => {
    event?.preventDefault();

    if (
      readOnly ||
      saving
    ) {
      return;
    }

    if (!complete) {
      setError(
        "Complete all Hepatitis B panel parameters before saving."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      /*
       * Preserve the established structured
       * result_data payload.
       */
      const structuredResult = {
        testType:
          "Hepatitis B Panel",

        method:
          form.method ||
          "Immunochromatographic / Serological Assay",

        specimen:
          form.specimen ||
          "Serum",

        patientName:
          form.patientName || "",

        labNumber:
          form.labNumber || "",

        patientId:
          form.patientId || "",

        sex:
          form.sex || "",

        age:
          form.age || "",

        collectionDate:
          form.collectionDate || "",

        results: {
          ...form.results,
        },

        interpretation:
          interpretation.text,

        comment:
          form.comment || "",
      };

      /*
       * Preserve compact result column.
       */
      const compactResult =
        TESTS.map(
          (test) =>
            `${test.name}: ${
              form.results?.[
                test.key
              ] || "Not done"
            }`
        ).join("; ");

      /*
       * Preserve existing database payload
       * structure:
       *
       * result
       * result_status
       * result_data
       */
      const payload = {
        result:
          compactResult,

        result_status:
          complete
            ? "Entered"
            : "Pending",

        result_data:
          structuredResult,
      };

      let saved =
        resultRecord;

      /*
       * EXISTING RESULT
       * ----------------
       * Update the existing laboratory result.
       */
      if (resolvedResultId) {
        saved =
          await updateLaboratoryResult(
            resolvedResultId,
            payload
          );
      }

      /*
       * NEW RESULT
       * -----------
       * Parent remains responsible for creation.
       *
       * This preserves compatibility with the
       * existing parent registration/result workflow.
       */
      if (
        !resolvedResultId &&
        typeof onSave ===
          "function"
      ) {
        const parentSaved =
          await onSave(
            structuredResult,
            payload
          );

        if (parentSaved) {
          saved =
            parentSaved;
        }
      }

      setResultRecord(
        saved || resultRecord
      );

      /*
       * Keep a clean snapshot so that
       * Cancel Edit returns to the
       * latest successfully saved state.
       */
      setOriginalForm({
        ...form,
        results: {
          ...form.results,
        },
      });

      setEditing(false);

      setMessage(
        resolvedResultId
          ? "Hepatitis B panel changes saved successfully."
          : "Hepatitis B panel saved successfully."
      );

      if (
        typeof onSave ===
          "function" &&
        resolvedResultId
      ) {
        await onSave(
          saved || resultRecord
        );
      }
    } catch (saveError) {
      console.error(
        "HepatitisBPanelResultEntry save failed:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to save Hepatitis B panel."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================
     LOADING
     ======================================================== */

  if (loading) {
    return (
      <div className="hepatitis-b-entry">
        <style>
          {STYLES}
        </style>

        <div className="hepatitis-b-entry__loading">
          <Loader2
            size={26}
            className="hepatitis-b-entry__spin"
          />

          <span>
            Loading Hepatitis B result...
          </span>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="hepatitis-b-entry">
      <style>
        {STYLES}
      </style>

      {/* ====================================================
          HEADER
         ==================================================== */}

      <header className="hepatitis-b-entry__header">
        <div className="hepatitis-b-entry__title-area">
          <div className="hepatitis-b-entry__icon">
            <ShieldCheck
              size={24}
            />
          </div>

          <div>
            <div className="hepatitis-b-entry__eyebrow">
              PEFA LABORATORY • SEROLOGY
            </div>

            <h2>
              Hepatitis B Panel
            </h2>

            <p>
              Structured Hepatitis B
              serological result entry
            </p>
          </div>
        </div>

        <div className="hepatitis-b-entry__header-actions">
          {resolvedResultId &&
            !editing &&
            !readOnly && (
              <button
                type="button"
                className="hepatitis-b-entry__button hepatitis-b-entry__button--edit"
                onClick={
                  handleEdit
                }
              >
                <Edit3
                  size={17}
                />

                Edit Result
              </button>
            )}

          {editing &&
            resolvedResultId &&
            !readOnly && (
              <button
                type="button"
                className="hepatitis-b-entry__button hepatitis-b-entry__button--cancel"
                onClick={
                  handleCancelEdit
                }
                disabled={saving}
              >
                <X size={17} />

                Cancel Edit
              </button>
            )}
        </div>
      </header>

      {/* ====================================================
          MODE INDICATOR
         ==================================================== */}

      <div
        className={`hepatitis-b-entry__mode ${
          editing
            ? "is-editing"
            : "is-viewing"
        }`}
      >
        {editing ? (
          <>
            <Edit3 size={15} />

            <span>
              {resolvedResultId
                ? "EDIT MODE — You are editing the saved laboratory result."
                : "NEW RESULT MODE — Enter the Hepatitis B panel results."}
            </span>
          </>
        ) : (
          <>
            <Lock size={15} />

            <span>
              VIEW MODE — Click
              <strong>
                {" "}
                Edit Result{" "}
              </strong>
              to modify this result.
            </span>
          </>
        )}
      </div>

      {/* ====================================================
          MESSAGES
         ==================================================== */}

      {error && (
        <div className="hepatitis-b-entry__message is-error">
          <AlertCircle
            size={18}
          />

          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="hepatitis-b-entry__message is-success">
          <CheckCircle2
            size={18}
          />

          <span>{message}</span>
        </div>
      )}

      {/* ====================================================
          PATIENT INFORMATION
         ==================================================== */}

      <section className="hepatitis-b-entry__patient">
        <PatientItem
          label="Patient"
          value={
            form.patientName ||
            "—"
          }
        />

        <PatientItem
          label="Lab Number"
          value={
            form.labNumber ||
            "—"
          }
        />

        <PatientItem
          label="Patient ID"
          value={
            form.patientId ||
            "—"
          }
        />

        <PatientItem
          label="Sex"
          value={
            form.sex || "—"
          }
        />

        <PatientItem
          label="Age"
          value={
            form.age || "—"
          }
        />
      </section>

      {/* ====================================================
          FORM
         ==================================================== */}

      <form
        onSubmit={handleSave}
      >
        {/* ==================================================
            TEST INFORMATION
           ================================================== */}

        <section className="hepatitis-b-entry__card">
          <div className="hepatitis-b-entry__card-header">
            <div>
              <h3>
                <ShieldCheck
                  size={17}
                />

                Test Information
              </h3>

              <p>
                Specimen and collection
                information.
              </p>
            </div>
          </div>

          <div className="hepatitis-b-entry__controls">
            <FormField label="Collection Date">
              <input
                type="date"
                value={
                  form.collectionDate ||
                  ""
                }
                disabled={
                  !editing
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      collectionDate:
                        event.target
                          .value,
                    })
                  )
                }
              />
            </FormField>

            <FormField label="Specimen">
              <input
                type="text"
                value={
                  form.specimen ||
                  "Serum"
                }
                disabled
                readOnly
              />
            </FormField>

            <FormField label="Method">
              <input
                type="text"
                value={
                  form.method ||
                  "Immunochromatographic / Serological Assay"
                }
                disabled
                readOnly
              />
            </FormField>
          </div>
        </section>

        {/* ==================================================
            RESULT TABLE
           ================================================== */}

        <section className="hepatitis-b-entry__table-card">
          <div className="hepatitis-b-entry__table-header">
            <div>
              <span>
                TEST PARAMETER
              </span>
            </div>

            <div>
              <span>
                RESULT
              </span>
            </div>
          </div>

          <div className="hepatitis-b-entry__rows">
            {TESTS.map((test) => {
              const value =
                form.results?.[
                  test.key
                ] || "";

              const entered =
                String(
                  value
                ).trim() !== "";

              return (
                <div
                  className={`hepatitis-b-entry__row ${
                    entered
                      ? "is-complete"
                      : ""
                  }`}
                  key={test.key}
                >
                  <div className="hepatitis-b-entry__parameter">
                    <div className="hepatitis-b-entry__parameter-name">
                      {test.name}
                    </div>

                    <div className="hepatitis-b-entry__parameter-full">
                      {
                        test.fullName
                      }
                    </div>

                    <div className="hepatitis-b-entry__parameter-description">
                      {
                        test.description
                      }
                    </div>
                  </div>

                  <div className="hepatitis-b-entry__result">
                    <select
                      value={value}
                      disabled={
                        !editing ||
                        readOnly
                      }
                      onChange={(
                        event
                      ) =>
                        handleChange(
                          test.key,
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Select result
                      </option>

                      {test.options.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {
                              option
                            }
                          </option>
                        )
                      )}
                    </select>

                    {entered && (
                      <CheckCircle2
                        size={
                          17
                        }
                        className="hepatitis-b-entry__check"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================
            COMPLETION
           ================================================== */}

        <section className="hepatitis-b-entry__progress">
          <div>
            <span>
              Panel Completion
            </span>

            <strong>
              {completedCount}/
              {TESTS.length}
            </strong>
          </div>

          <div className="hepatitis-b-entry__progress-bar">
            <span
              style={{
                width: `${
                  (completedCount /
                    TESTS.length) *
                  100
                }%`,
              }}
            />
          </div>
        </section>

        {/* ==================================================
            INTERPRETATION
           ================================================== */}

        <section
          className={`hepatitis-b-entry__interpretation hepatitis-b-entry__interpretation--${interpretation.tone}`}
        >
          <div className="hepatitis-b-entry__interpretation-icon">
            {interpretation.tone ===
            "warning" ? (
              <AlertCircle
                size={20}
              />
            ) : (
              <ShieldCheck
                size={20}
              />
            )}
          </div>

          <div>
            <span>
              SEROLOGICAL
              INTERPRETATION
            </span>

            <h3>
              {
                interpretation.title
              }
            </h3>

            <p>
              {
                interpretation.text
              }
            </p>
          </div>
        </section>

        {/* ==================================================
            COMMENT
           ================================================== */}

        <section className="hepatitis-b-entry__card">
          <div className="hepatitis-b-entry__card-header">
            <div>
              <h3>
                Laboratory Comment
              </h3>

              <p>
                Add an authorised
                laboratory comment
                where required.
              </p>
            </div>
          </div>

          <div className="hepatitis-b-entry__comment">
            <textarea
              value={
                form.comment || ""
              }
              disabled={
                !editing ||
                readOnly
              }
              placeholder="Enter laboratory comment..."
              onChange={(event) =>
                handleCommentChange(
                  event.target.value
                )
              }
            />
          </div>
        </section>

        {/* ==================================================
            ACTIONS
           ================================================== */}

        <section className="hepatitis-b-entry__actions">
          {editing &&
            !readOnly && (
              <>
                <button
                  type="button"
                  className="hepatitis-b-entry__button hepatitis-b-entry__button--secondary"
                  onClick={
                    handleReset
                  }
                  disabled={
                    saving
                  }
                >
                  <RotateCcw
                    size={17}
                  />

                  Reset
                </button>

                {resolvedResultId && (
                  <button
                    type="button"
                    className="hepatitis-b-entry__button hepatitis-b-entry__button--cancel"
                    onClick={
                      handleCancelEdit
                    }
                    disabled={
                      saving
                    }
                  >
                    <X
                      size={17}
                    />

                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="hepatitis-b-entry__button hepatitis-b-entry__button--primary"
                  disabled={
                    saving ||
                    !complete
                  }
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="hepatitis-b-entry__spin"
                    />
                  ) : (
                    <Save
                      size={17}
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : resolvedResultId
                      ? "Save Changes"
                      : "Save Hepatitis B Panel"}
                </button>
              </>
            )}

          {!editing &&
            resolvedResultId &&
            !readOnly && (
              <button
                type="button"
                className="hepatitis-b-entry__button hepatitis-b-entry__button--edit"
                onClick={
                  handleEdit
                }
              >
                <Edit3
                  size={17}
                />

                Edit Result
              </button>
            )}

          {onCancel &&
            !editing && (
              <button
                type="button"
                className="hepatitis-b-entry__button hepatitis-b-entry__button--secondary"
                onClick={
                  onCancel
                }
              >
                Close
              </button>
            )}
        </section>
      </form>
    </div>
  );
}

/* ==========================================================
   PATIENT ITEM
   ========================================================== */

function PatientItem({
  label,
  value,
}) {
  return (
    <div className="hepatitis-b-entry__patient-item">
      <span className="hepatitis-b-entry__patient-label">
        {label}
      </span>

      <strong className="hepatitis-b-entry__patient-value">
        {value}
      </strong>
    </div>
  );
}

/* ==========================================================
   FORM FIELD
   ========================================================== */

function FormField({
  label,
  children,
}) {
  return (
    <div className="hepatitis-b-entry__field">
      <label>{label}</label>

      {children}
    </div>
  );
}

/* ==========================================================
   EMBEDDED STYLES
   ========================================================== */

const STYLES = `
.hepatitis-b-entry {
  --hb-primary: #075985;
  --hb-primary-dark: #0c4a6e;
  --hb-border: #dbe4ea;
  --hb-border-light: #e9eef2;
  --hb-text: #17212b;
  --hb-muted: #667580;
  --hb-bg: #f6f8fa;
  --hb-white: #ffffff;
  --hb-success: #15803d;
  --hb-warning: #b45309;
  --hb-danger: #b91c1c;

  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;

  color: var(--hb-text);
  background: var(--hb-bg);

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.hepatitis-b-entry *,
.hepatitis-b-entry *::before,
.hepatitis-b-entry *::after {
  box-sizing: border-box;
}

.hepatitis-b-entry__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  padding: 22px 24px;

  background: var(--hb-white);
  border: 1px solid var(--hb-border);
  border-radius: 16px;

  box-shadow:
    0 4px 14px rgba(15, 23, 42, 0.05);
}

.hepatitis-b-entry__title-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.hepatitis-b-entry__icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--hb-primary);
  background: #e0f2fe;

  border-radius: 12px;
}

.hepatitis-b-entry__eyebrow {
  margin-bottom: 4px;

  color: var(--hb-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.hepatitis-b-entry h2 {
  margin: 0;

  font-size: 23px;
  line-height: 1.2;
  font-weight: 800;
}

.hepatitis-b-entry__header p {
  margin: 5px 0 0;

  color: var(--hb-muted);
  font-size: 13px;
}

.hepatitis-b-entry__header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hepatitis-b-entry__mode {
  display: flex;
  align-items: center;
  gap: 8px;

  margin: 14px 0;
  padding: 11px 14px;

  border-radius: 10px;
  border: 1px solid var(--hb-border);

  font-size: 12px;
  font-weight: 600;
}

.hepatitis-b-entry__mode.is-editing {
  color: #075985;
  background: #eff8ff;
  border-color: #bae6fd;
}

.hepatitis-b-entry__mode.is-viewing {
  color: #475569;
  background: #f8fafc;
}

.hepatitis-b-entry__mode strong {
  font-weight: 800;
}

.hepatitis-b-entry__message {
  display: flex;
  align-items: center;
  gap: 9px;

  margin: 12px 0;
  padding: 12px 15px;

  border-radius: 10px;

  font-size: 13px;
  font-weight: 600;
}

.hepatitis-b-entry__message.is-error {
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.hepatitis-b-entry__message.is-success {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.hepatitis-b-entry__patient {
  display: grid;
  grid-template-columns:
    1.5fr
    1fr
    1fr
    0.7fr
    0.7fr;

  gap: 1px;

  margin-bottom: 16px;

  overflow: hidden;

  background: var(--hb-border);
  border: 1px solid var(--hb-border);
  border-radius: 14px;
}

.hepatitis-b-entry__patient-item {
  min-width: 0;

  padding: 14px 16px;

  background: var(--hb-white);
}

.hepatitis-b-entry__patient-label {
  display: block;

  margin-bottom: 5px;

  color: var(--hb-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hepatitis-b-entry__patient-value {
  display: block;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-size: 13px;
}

.hepatitis-b-entry__card {
  margin-top: 16px;

  background: var(--hb-white);
  border: 1px solid var(--hb-border);
  border-radius: 14px;

  overflow: hidden;
}

.hepatitis-b-entry__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 17px 19px;

  border-bottom: 1px solid var(--hb-border-light);
}

.hepatitis-b-entry__card-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;

  margin: 0;

  color: var(--hb-text);
  font-size: 14px;
  font-weight: 800;
}

.hepatitis-b-entry__card-header p {
  margin: 4px 0 0;

  color: var(--hb-muted);
  font-size: 12px;
}

.hepatitis-b-entry__controls {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 15px;

  padding: 18px;
}

.hepatitis-b-entry__field {
  min-width: 0;
}

.hepatitis-b-entry__field label {
  display: block;

  margin-bottom: 7px;

  color: #475569;
  font-size: 11px;
  font-weight: 750;
}

.hepatitis-b-entry__field input,
.hepatitis-b-entry__field select,
.hepatitis-b-entry__field textarea,
.hepatitis-b-entry__result select,
.hepatitis-b-entry__comment textarea {
  width: 100%;

  border: 1px solid #cfd9df;
  border-radius: 9px;

  background: #fff;

  color: #17212b;

  font-family: inherit;
  font-size: 13px;

  outline: none;

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.hepatitis-b-entry__field input,
.hepatitis-b-entry__field select {
  height: 40px;
  padding: 0 11px;
}

.hepatitis-b-entry__field input:focus,
.hepatitis-b-entry__field select:focus,
.hepatitis-b-entry__result select:focus,
.hepatitis-b-entry__comment textarea:focus {
  border-color: #38a3d1;
  box-shadow:
    0 0 0 3px rgba(14, 165, 233, 0.12);
}

.hepatitis-b-entry__field input:disabled,
.hepatitis-b-entry__field select:disabled,
.hepatitis-b-entry__result select:disabled,
.hepatitis-b-entry__comment textarea:disabled {
  color: #475569;
  background: #f8fafc;
  cursor: not-allowed;
}

.hepatitis-b-entry__table-card {
  margin-top: 16px;

  background: var(--hb-white);
  border: 1px solid var(--hb-border);
  border-radius: 14px;

  overflow: hidden;
}

.hepatitis-b-entry__table-header {
  display: grid;
  grid-template-columns: 1fr 330px;

  padding: 13px 19px;

  color: #64748b;
  background: #f8fafc;

  border-bottom: 1px solid var(--hb-border);

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.hepatitis-b-entry__rows {
  display: flex;
  flex-direction: column;
}

.hepatitis-b-entry__row {
  display: grid;
  grid-template-columns: 1fr 330px;

  min-height: 96px;

  border-bottom: 1px solid var(--hb-border-light);

  transition:
    background 0.15s ease;
}

.hepatitis-b-entry__row:last-child {
  border-bottom: 0;
}

.hepatitis-b-entry__row:hover {
  background: #fbfdff;
}

.hepatitis-b-entry__row.is-complete {
  background: #fbfffc;
}

.hepatitis-b-entry__parameter {
  padding: 16px 19px;
}

.hepatitis-b-entry__parameter-name {
  font-size: 14px;
  font-weight: 800;
}

.hepatitis-b-entry__parameter-full {
  margin-top: 3px;

  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.hepatitis-b-entry__parameter-description {
  max-width: 650px;

  margin-top: 6px;

  color: #7b8794;
  font-size: 11px;
  line-height: 1.45;
}

.hepatitis-b-entry__result {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 16px 19px;

  border-left: 1px solid var(--hb-border-light);
}

.hepatitis-b-entry__result select {
  height: 40px;
  padding: 0 11px;
}

.hepatitis-b-entry__check {
  flex: 0 0 auto;
  color: var(--hb-success);
}

.hepatitis-b-entry__progress {
  margin-top: 16px;
  padding: 15px 18px;

  background: var(--hb-white);
  border: 1px solid var(--hb-border);
  border-radius: 14px;
}

.hepatitis-b-entry__progress > div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 9px;
}

.hepatitis-b-entry__progress span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hepatitis-b-entry__progress strong {
  color: var(--hb-primary);
  font-size: 13px;
}

.hepatitis-b-entry__progress-bar {
  height: 7px;

  overflow: hidden;

  background: #e2e8f0;
  border-radius: 99px;
}

.hepatitis-b-entry__progress-bar span {
  display: block;

  height: 100%;

  background: var(--hb-primary);

  border-radius: inherit;

  transition: width 0.25s ease;
}

.hepatitis-b-entry__interpretation {
  display: flex;
  gap: 13px;

  margin-top: 16px;
  padding: 18px;

  border: 1px solid var(--hb-border);
  border-radius: 14px;

  background: #fff;
}

.hepatitis-b-entry__interpretation-icon {
  display: flex;
  align-items: flex-start;
  justify-content: center;

  flex: 0 0 auto;
}

.hepatitis-b-entry__interpretation--success {
  color: #166534;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.hepatitis-b-entry__interpretation--warning {
  color: #92400e;
  background: #fffbeb;
  border-color: #fde68a;
}

.hepatitis-b-entry__interpretation--neutral {
  color: #334155;
  background: #f8fafc;
}

.hepatitis-b-entry__interpretation--pending {
  color: #475569;
  background: #f8fafc;
}

.hepatitis-b-entry__interpretation span {
  display: block;

  margin-bottom: 4px;

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.hepatitis-b-entry__interpretation h3 {
  margin: 0 0 5px;

  font-size: 15px;
  font-weight: 800;
}

.hepatitis-b-entry__interpretation p {
  margin: 0;

  font-size: 12px;
  line-height: 1.55;
}

.hepatitis-b-entry__comment {
  padding: 18px;
}

.hepatitis-b-entry__comment textarea {
  min-height: 100px;

  padding: 12px;

  resize: vertical;
  line-height: 1.5;
}

.hepatitis-b-entry__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;

  margin-top: 18px;
  padding: 16px;

  background: var(--hb-white);

  border: 1px solid var(--hb-border);
  border-radius: 14px;
}

.hepatitis-b-entry__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-height: 40px;

  padding: 0 15px;

  border-radius: 9px;

  font-family: inherit;
  font-size: 12px;
  font-weight: 750;

  cursor: pointer;

  border: 1px solid transparent;

  transition:
    transform 0.12s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.hepatitis-b-entry__button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.hepatitis-b-entry__button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hepatitis-b-entry__button--primary {
  color: #fff;
  background: var(--hb-primary);
  border-color: var(--hb-primary);
}

.hepatitis-b-entry__button--primary:hover:not(:disabled) {
  background: var(--hb-primary-dark);
}

.hepatitis-b-entry__button--edit {
  color: #075985;
  background: #e0f2fe;
  border-color: #bae6fd;
}

.hepatitis-b-entry__button--edit:hover:not(:disabled) {
  background: #bae6fd;
}

.hepatitis-b-entry__button--secondary {
  color: #334155;
  background: #fff;
  border-color: #cbd5e1;
}

.hepatitis-b-entry__button--secondary:hover:not(:disabled) {
  background: #f8fafc;
}

.hepatitis-b-entry__button--cancel {
  color: #991b1b;
  background: #fff;
  border-color: #fecaca;
}

.hepatitis-b-entry__button--cancel:hover:not(:disabled) {
  background: #fef2f2;
}

.hepatitis-b-entry__loading {
  min-height: 300px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  color: #475569;

  background: #fff;

  border: 1px solid var(--hb-border);
  border-radius: 14px;

  font-size: 13px;
  font-weight: 650;
}

.hepatitis-b-entry__spin {
  animation:
    hepatitis-b-entry-spin
    0.9s linear infinite;
}

@keyframes hepatitis-b-entry-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .hepatitis-b-entry__patient {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .hepatitis-b-entry__controls {
    grid-template-columns: 1fr;
  }

  .hepatitis-b-entry__table-header,
  .hepatitis-b-entry__row {
    grid-template-columns: 1fr;
  }

  .hepatitis-b-entry__result {
    border-left: 0;
    border-top: 1px solid var(--hb-border-light);
  }
}

@media (max-width: 600px) {
  .hepatitis-b-entry {
    padding: 12px;
  }

  .hepatitis-b-entry__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .hepatitis-b-entry__header-actions {
    width: 100%;
  }

  .hepatitis-b-entry__header-actions
    .hepatitis-b-entry__button {
    width: 100%;
  }

  .hepatitis-b-entry__patient {
    grid-template-columns: 1fr;
  }

  .hepatitis-b-entry__actions {
    flex-direction: column;
  }

  .hepatitis-b-entry__actions
    .hepatitis-b-entry__button {
    width: 100%;
  }

  .hepatitis-b-entry__parameter {
    padding: 14px;
  }

  .hepatitis-b-entry__result {
    padding: 12px 14px;
  }
}
`;