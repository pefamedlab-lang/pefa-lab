/* ==========================================================
   PEFA LAB
   DONOR SCREENING RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/DonorScreeningResultEntry.jsx

   PURPOSE
   ----------------------------------------------------------
   Structured donor screening result entry.

   ARCHITECTURE
   ----------------------------------------------------------
   Laboratory Result Record
          |
          |-- resultId
          |
          v
   DonorScreeningResultEntry
          |
          |-- Load existing result
          |-- Edit result
          |-- Save result
          |-- Update result
          |
          v
   laboratoryResultService

   IMPORTANT
   ----------------------------------------------------------
   - Standalone special-test component
   - Supports CREATE / EDIT mode
   - Existing result is authoritative when editing
   - No old Dashboard dependency
   - No old ResultEntry dependency
   - No old testService dependency
   - No old resultService dependency
   - Styling is embedded in this component
   ========================================================== */

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eraser,
  Loader2,
  Save,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

import {
  getLaboratoryResultById,
  updateLaboratoryResult,
} from "../../../services/laboratory/laboratoryResultService";

/* ==========================================================
   SCREENING PARAMETERS
   ========================================================== */

const SCREENING_OPTIONS = [
  {
    key: "hiv",
    label: "HIV 1 & 2",
    fullName: "Human Immunodeficiency Virus 1 & 2",
  },
  {
    key: "hbsag",
    label: "HBsAg",
    fullName: "Hepatitis B Surface Antigen",
  },
  {
    key: "hcv",
    label: "HCV",
    fullName: "Hepatitis C Virus",
  },
  {
    key: "syphilis",
    label: "Syphilis",
    fullName: "Treponema pallidum",
  },
  {
    key: "malaria",
    label: "Malaria",
    fullName: "Malaria Parasite",
  },
];

/* ==========================================================
   RESULT OPTIONS
   ========================================================== */

const RESULT_OPTIONS = [
  "",
  "Non-Reactive",
  "Reactive",
  "Positive",
  "Negative",
  "Indeterminate",
  "Invalid",
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
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(
    window.location.search
  );

  const id =
    params.get("result_id") ||
    params.get("resultId") ||
    params.get("id");

  if (!id) {
    return null;
  }

  const numericId = Number(id);

  return Number.isFinite(numericId)
    ? numericId
    : null;
};

/* ==========================================================
   EMPTY RESULTS
   ========================================================== */

const createEmptyResults = () => ({
  hiv: "",
  hbsag: "",
  hcv: "",
  syphilis: "",
  malaria: "",
});

/* ==========================================================
   EXTRACT STRUCTURED RESULT
   ========================================================== */

const getStructuredResult = (result) => {
  if (!result) {
    return {};
  }

  const candidates = [
    result?.result_data,
    result?.result_json,
    result?.structured_result,
    result?.result_value,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      return candidate;
    }
  }

  return {};
};

/* ==========================================================
   CREATE FORM FROM LABORATORY RESULT
   ========================================================== */

const createFormFromResult = (
  result = null
) => {
  const structured =
    getStructuredResult(result);

  const structuredResults =
    structured?.results &&
    typeof structured.results === "object"
      ? structured.results
      : {};

  return {
    patientName:
      structured?.patientName ||
      result?.patient_name ||
      result?.full_name ||
      "",

    patientId:
      structured?.patientId ||
      result?.patient_id ||
      "",

    labNumber:
      structured?.labNumber ||
      result?.lab_number ||
      "",

    sex:
      structured?.sex ||
      result?.sex ||
      "",

    age:
      structured?.age ||
      result?.age ||
      "",

    collectionDate:
      structured?.collectionDate ||
      result?.collection_date ||
      "",

    receivedDate:
      structured?.receivedDate ||
      result?.received_date ||
      "",

    results: {
      ...createEmptyResults(),

      ...(
        structuredResults &&
        typeof structuredResults === "object"
          ? structuredResults
          : {}
      ),

      ...(
        structured?.hiv !== undefined
          ? {
              hiv: structured.hiv,
            }
          : {}
      ),

      ...(
        structured?.hbsag !== undefined
          ? {
              hbsag: structured.hbsag,
            }
          : {}
      ),

      ...(
        structured?.hcv !== undefined
          ? {
              hcv: structured.hcv,
            }
          : {}
      ),

      ...(
        structured?.syphilis !== undefined
          ? {
              syphilis:
                structured.syphilis,
            }
          : {}
      ),

      ...(
        structured?.malaria !== undefined
          ? {
              malaria:
                structured.malaria,
            }
          : {}
      ),
    },

    notes:
      structured?.notes ||
      structured?.comment ||
      result?.comments ||
      result?.comment ||
      "",

    interpretation:
      structured?.interpretation ||
      result?.interpretation ||
      "",
  };
};

/* ==========================================================
   REACTIVE CHECK
   ========================================================== */

const isReactiveResult = (value) => {
  const normalized =
    normalizeText(value);

  return (
    normalized === "reactive" ||
    normalized === "positive"
  );
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function DonorScreeningResultEntry({
  resultId = null,
  result = null,
  patient = null,
  registration = null,
  onSaved,
  onSave,
  onCancel,
  readOnly = false,
}) {
  /* ========================================================
     RESULT ID
     ======================================================== */

  const resolvedResultId = useMemo(() => {
    if (
      resultId !== null &&
      resultId !== undefined &&
      resultId !== ""
    ) {
      const numericId =
        Number(resultId);

      return Number.isFinite(numericId)
        ? numericId
        : null;
    }

    if (result?.id) {
      const numericId =
        Number(result.id);

      return Number.isFinite(numericId)
        ? numericId
        : null;
    }

    return getResultIdFromUrl();
  }, [resultId, result]);

  /* ========================================================
     STATE
     ======================================================== */

  const [resultRecord, setResultRecord] =
    useState(result);

  const [form, setForm] = useState(() =>
    createFormFromResult(result)
  );

  const [loading, setLoading] =
    useState(Boolean(resolvedResultId));

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ========================================================
     EDIT MODE
     ======================================================== */

  const isEditMode =
    Boolean(resolvedResultId);

  /* ========================================================
     LOAD EXISTING RESULT
     ======================================================== */

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      if (!resolvedResultId) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const existingResult =
          await getLaboratoryResultById(
            resolvedResultId
          );

        if (!mounted) {
          return;
        }

        if (!existingResult) {
          throw new Error(
            "The donor screening laboratory result could not be found."
          );
        }

        setResultRecord(
          existingResult
        );

        setForm(
          createFormFromResult(
            existingResult
          )
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "DonorScreeningResultEntry: failed to load result",
          err
        );

        setError(
          err?.message ||
            "Unable to load donor screening result."
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
  }, [resolvedResultId]);

  /* ========================================================
     OPTIONAL INITIAL RESULT SYNCHRONIZATION
     ======================================================== */

  useEffect(() => {
    if (
      !resolvedResultId &&
      result
    ) {
      setResultRecord(result);
      setForm(
        createFormFromResult(result)
      );
    }
  }, [
    result,
    resolvedResultId,
  ]);

  /* ========================================================
     PATIENT DISPLAY
     ======================================================== */

  const patientName =
    form.patientName ||
    patient?.full_name ||
    patient?.patient_name ||
    registration?.full_name ||
    registration?.patient_name ||
    "";

  const patientId =
    form.patientId ||
    patient?.patient_id ||
    registration?.patient_id ||
    "";

  const labNumber =
    form.labNumber ||
    patient?.lab_number ||
    registration?.lab_number ||
    "";

  /* ========================================================
     RESULT STATISTICS
     ======================================================== */

  const statistics = useMemo(() => {
    const values =
      SCREENING_OPTIONS.map(
        ({ key }) =>
          form.results?.[key] || ""
      );

    const completed =
      values.filter(
        (value) =>
          String(value).trim() !== ""
      ).length;

    const reactive =
      values.filter(
        isReactiveResult
      ).length;

    const negative =
      values.filter((value) => {
        const normalized =
          normalizeText(value);

        return (
          normalized ===
            "negative" ||
          normalized ===
            "non-reactive"
        );
      }).length;

    const invalid =
      values.filter(
        (value) =>
          normalizeText(value) ===
          "invalid"
      ).length;

    return {
      total: SCREENING_OPTIONS.length,
      completed,
      pending:
        SCREENING_OPTIONS.length -
        completed,
      reactive,
      negative,
      invalid,
    };
  }, [form.results]);

  /* ========================================================
     COMPLETION
     ======================================================== */

  const isComplete =
    statistics.completed ===
    statistics.total;

  /* ========================================================
     AUTOMATIC INTERPRETATION
     ======================================================== */

  const automaticInterpretation =
    useMemo(() => {
      if (
        statistics.completed === 0
      ) {
        return {
          title: "Pending",
          text:
            "No donor screening result has been entered.",
          tone: "pending",
        };
      }

      if (statistics.invalid > 0) {
        return {
          title: "Invalid Result Present",
          text:
            "One or more screening markers are marked invalid. Review the test and specimen before final reporting.",
          tone: "warning",
        };
      }

      if (statistics.reactive > 0) {
        return {
          title:
            "Reactive / Positive Result Detected",
          text:
            "One or more screening markers are reactive or positive. Donor screening results should be interpreted according to the laboratory-approved testing algorithm and appropriate confirmatory procedures.",
          tone: "warning",
        };
      }

      if (isComplete) {
        return {
          title:
            "No Reactive Marker Detected",
          text:
            "All entered donor screening markers are non-reactive or negative. Interpret according to the approved donor-screening algorithm and applicable laboratory SOP.",
          tone: "success",
        };
      }

      return {
        title:
          "Partial Screening Result",
        text:
          "Some donor screening markers are still pending.",
        tone: "neutral",
      };
    }, [
      statistics,
      isComplete,
    ]);

  /* ========================================================
     FORM UPDATE
     ======================================================== */

  const updateForm = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================================
     RESULT UPDATE
     ======================================================== */

  const updateResult = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,

      results: {
        ...current.results,
        [key]: value,
      },
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================================
     CLEAR
     ======================================================== */

  const handleClear = () => {
    if (
      readOnly ||
      saving
    ) {
      return;
    }

    setForm((current) => ({
      ...current,

      results:
        createEmptyResults(),

      notes: "",

      interpretation: "",
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================================
     RESET EDIT FORM
     ======================================================== */

  const handleReset = () => {
    if (
      readOnly ||
      saving
    ) {
      return;
    }

    if (resultRecord) {
      setForm(
        createFormFromResult(
          resultRecord
        )
      );
    } else {
      setForm(
        createFormFromResult()
      );
    }

    setError("");
    setSuccess("");
  };

  /* ========================================================
     BUILD STRUCTURED RESULT
     ======================================================== */

  const buildStructuredResult =
    () => ({
      testType:
        "Donor Screening",

      panelName:
        "Donor Screening",

      patientName,

      patientId,

      labNumber,

      sex: form.sex,

      age: form.age,

      collectionDate:
        form.collectionDate,

      receivedDate:
        form.receivedDate,

      results: {
        ...form.results,
      },

      interpretation:
        automaticInterpretation.text,

      interpretationTitle:
        automaticInterpretation.title,

      notes:
        String(
          form.notes || ""
        ).trim(),
    });

  /* ========================================================
     BUILD SERVICE PAYLOAD
     ======================================================== */

  const buildPayload = () => {
    const structuredResult =
      buildStructuredResult();

    const compactResult =
      SCREENING_OPTIONS.map(
        ({ key, label }) =>
          `${label}: ${
            form.results?.[key] ||
            "Not done"
          }`
      ).join("; ");

    return {
      result: compactResult,

      result_status:
        isComplete
          ? "Entered"
          : "Pending",

      result_data:
        structuredResult,
    };
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

    setError("");
    setSuccess("");

    const hasResult =
      Object.values(
        form.results || {}
      ).some(
        (value) =>
          String(value ?? "").trim() !== ""
      );

    if (!hasResult) {
      setError(
        "Enter at least one donor screening result before saving."
      );

      return;
    }

    setSaving(true);

    try {
      const payload =
        buildPayload();

      let savedResult =
        resultRecord;

      /* ----------------------------------------------------
         EXISTING LABORATORY RESULT
         ---------------------------------------------------- */

      if (resolvedResultId) {
        savedResult =
          await updateLaboratoryResult(
            resolvedResultId,
            payload
          );
      }

      /* ----------------------------------------------------
         OPTIONAL PARENT SAVE
         ---------------------------------------------------- */

      if (
        typeof onSave === "function"
      ) {
        const parentResult =
          await onSave(
            payload,
            savedResult
          );

        if (parentResult) {
          savedResult =
            parentResult;
        }
      }

      setResultRecord(
        savedResult ||
          resultRecord
      );

      setSuccess(
        isEditMode
          ? "Donor screening result updated successfully."
          : "Donor screening result saved successfully."
      );

      if (
        typeof onSaved ===
        "function"
      ) {
        onSaved(
          savedResult ||
            resultRecord
        );
      }
    } catch (err) {
      console.error(
        "DonorScreeningResultEntry: save failed",
        err
      );

      setError(
        err?.message ||
          "Unable to save donor screening result."
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
      <>
        <style>{DONOR_SCREENING_STYLES}</style>

        <section className="donor-screening-result-entry">
          <div className="donor-screening-result-entry__loading">
            <Loader2
              size={26}
              className="donor-screening-result-entry__spin"
            />

            <span>
              Loading donor screening result...
            </span>
          </div>
        </section>
      </>
    );
  }

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <>
      <style>{DONOR_SCREENING_STYLES}</style>

      <section className="donor-screening-result-entry">

        {/* ==================================================
            HEADER
           ================================================== */}

        <header className="donor-screening-result-entry__header">

          <div className="donor-screening-result-entry__title">

            <div className="donor-screening-result-entry__icon">
              <ShieldCheck
                size={24}
              />
            </div>

            <div>
              <div className="donor-screening-result-entry__eyebrow">
                PEFA LABORATORY • SPECIAL TEST
              </div>

              <h1>
                Donor Screening
              </h1>

              <p>
                Structured donor screening
                result entry
              </p>
            </div>

          </div>

          <div className="donor-screening-result-entry__mode">

            <span
              className={
                isEditMode
                  ? "is-edit"
                  : "is-new"
              }
            >
              {isEditMode
                ? "EDIT MODE"
                : "NEW RESULT"}
            </span>

          </div>

        </header>

        {/* ==================================================
            PATIENT INFORMATION
           ================================================== */}

        <section className="donor-screening-result-entry__patient">

          <div>
            <span>
              Patient
            </span>

            <strong>
              {patientName || "—"}
            </strong>
          </div>

          <div>
            <span>
              Patient ID
            </span>

            <strong>
              {patientId || "—"}
            </strong>
          </div>

          <div>
            <span>
              Lab Number
            </span>

            <strong>
              {labNumber || "—"}
            </strong>
          </div>

          <div>
            <span>
              Test
            </span>

            <strong>
              Donor Screening
            </strong>
          </div>

        </section>

        {/* ==================================================
            ALERTS
           ================================================== */}

        {error && (
          <div className="donor-screening-result-entry__message donor-screening-result-entry__message--error">

            <AlertCircle
              size={18}
            />

            <span>
              {error}
            </span>

          </div>
        )}

        {success && (
          <div className="donor-screening-result-entry__message donor-screening-result-entry__message--success">

            <CheckCircle2
              size={18}
            />

            <span>
              {success}
            </span>

          </div>
        )}

        {/* ==================================================
            SUMMARY
           ================================================== */}

        <section className="donor-screening-result-entry__summary">

          <div>
            <span>
              PARAMETERS
            </span>

            <strong>
              {statistics.total}
            </strong>
          </div>

          <div>
            <span>
              COMPLETED
            </span>

            <strong>
              {statistics.completed}
            </strong>
          </div>

          <div>
            <span>
              PENDING
            </span>

            <strong>
              {statistics.pending}
            </strong>
          </div>

          <div
            className={
              statistics.reactive >
              0
                ? "is-alert"
                : ""
            }
          >
            <span>
              REACTIVE / POSITIVE
            </span>

            <strong>
              {statistics.reactive}
            </strong>
          </div>

        </section>

        {/* ==================================================
            COMPLETION BAR
           ================================================== */}

        <section className="donor-screening-result-entry__progress">

          <div className="donor-screening-result-entry__progress-head">

            <span>
              Screening Completion
            </span>

            <strong>
              {statistics.completed}/
              {statistics.total}
            </strong>

          </div>

          <div className="donor-screening-result-entry__progress-track">

            <span
              style={{
                width: `${
                  (statistics.completed /
                    statistics.total) *
                  100
                }%`,
              }}
            />

          </div>

        </section>

        {/* ==================================================
            TEST INFORMATION
           ================================================== */}

        <section className="donor-screening-result-entry__card">

          <div className="donor-screening-result-entry__card-header">

            <div>
              <span>
                TEST INFORMATION
              </span>

              <h2>
                Collection Details
              </h2>
            </div>

            <ShieldCheck
              size={19}
            />

          </div>

          <div className="donor-screening-result-entry__grid">

            <div className="donor-screening-result-entry__field">
              <label>
                Collection Date
              </label>

              <input
                type="datetime-local"
                value={
                  form.collectionDate ||
                  ""
                }
                disabled={
                  readOnly ||
                  saving
                }
                onChange={(event) =>
                  updateForm(
                    "collectionDate",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="donor-screening-result-entry__field">
              <label>
                Received Date
              </label>

              <input
                type="datetime-local"
                value={
                  form.receivedDate ||
                  ""
                }
                disabled={
                  readOnly ||
                  saving
                }
                onChange={(event) =>
                  updateForm(
                    "receivedDate",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="donor-screening-result-entry__field">
              <label>
                Sex
              </label>

              <input
                type="text"
                value={
                  form.sex || ""
                }
                disabled
                placeholder="—"
              />
            </div>

            <div className="donor-screening-result-entry__field">
              <label>
                Age
              </label>

              <input
                type="text"
                value={
                  form.age || ""
                }
                disabled
                placeholder="—"
              />
            </div>

          </div>

        </section>

        {/* ==================================================
            SCREENING TABLE
           ================================================== */}

        <section className="donor-screening-result-entry__card">

          <div className="donor-screening-result-entry__card-header">

            <div>
              <span>
                DONOR SCREENING
              </span>

              <h2>
                Screening Results
              </h2>
            </div>

            <div className="donor-screening-result-entry__count">
              {statistics.completed}/
              {statistics.total}
            </div>

          </div>

          <div className="donor-screening-result-entry__table-wrapper">

            <table className="donor-screening-result-entry__table">

              <thead>
                <tr>
                  <th>
                    #
                  </th>

                  <th>
                    SCREENING MARKER
                  </th>

                  <th>
                    RESULT
                  </th>

                  <th>
                    ASSESSMENT
                  </th>
                </tr>
              </thead>

              <tbody>

                {SCREENING_OPTIONS.map(
                  (
                    item,
                    index
                  ) => {
                    const value =
                      form.results?.[
                        item.key
                      ] || "";

                    const normalized =
                      normalizeText(
                        value
                      );

                    const reactive =
                      isReactiveResult(
                        value
                      );

                    const invalid =
                      normalized ===
                      "invalid";

                    const completed =
                      String(
                        value
                      ).trim() !== "";

                    return (
                      <tr
                        key={
                          item.key
                        }
                        className={
                          reactive
                            ? "is-reactive"
                            : invalid
                            ? "is-invalid"
                            : completed
                            ? "is-complete"
                            : ""
                        }
                      >

                        <td>
                          <span className="donor-screening-result-entry__number">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        </td>

                        <td>

                          <div className="donor-screening-result-entry__marker">

                            <strong>
                              {
                                item.label
                              }
                            </strong>

                            <small>
                              {
                                item.fullName
                              }
                            </small>

                          </div>

                        </td>

                        <td>

                          <select
                            value={
                              value
                            }
                            disabled={
                              readOnly ||
                              saving
                            }
                            onChange={(
                              event
                            ) =>
                              updateResult(
                                item.key,
                                event
                                  .target
                                  .value
                              )
                            }
                          >

                            <option value="">
                              Select result
                            </option>

                            {RESULT_OPTIONS
                              .filter(
                                Boolean
                              )
                              .map(
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

                        </td>

                        <td>

                          {!completed && (
                            <span className="donor-screening-result-entry__status donor-screening-result-entry__status--pending">
                              Pending
                            </span>
                          )}

                          {completed &&
                            reactive && (
                              <span className="donor-screening-result-entry__status donor-screening-result-entry__status--reactive">
                                <AlertCircle
                                  size={15}
                                />
                                Reactive /
                                Positive
                              </span>
                            )}

                          {completed &&
                            invalid && (
                              <span className="donor-screening-result-entry__status donor-screening-result-entry__status--invalid">
                                <AlertCircle
                                  size={15}
                                />
                                Invalid
                              </span>
                            )}

                          {completed &&
                            !reactive &&
                            !invalid && (
                              <span className="donor-screening-result-entry__status donor-screening-result-entry__status--normal">
                                <CheckCircle2
                                  size={15}
                                />
                                {value}
                              </span>
                            )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ==================================================
            AUTOMATIC INTERPRETATION
           ================================================== */}

        <section
          className={`donor-screening-result-entry__interpretation donor-screening-result-entry__interpretation--${automaticInterpretation.tone}`}
        >

          <div className="donor-screening-result-entry__interpretation-icon">

            {automaticInterpretation.tone ===
            "warning" ? (
              <AlertCircle
                size={21}
              />
            ) : (
              <ShieldCheck
                size={21}
              />
            )}

          </div>

          <div>

            <span>
              AUTOMATIC SCREENING ASSESSMENT
            </span>

            <h3>
              {
                automaticInterpretation.title
              }
            </h3>

            <p>
              {
                automaticInterpretation.text
              }
            </p>

          </div>

        </section>

        {/* ==================================================
            NOTES
           ================================================== */}

        <section className="donor-screening-result-entry__card">

          <div className="donor-screening-result-entry__card-header">

            <div>
              <span>
                REPORTING
              </span>

              <h2>
                Laboratory Notes
              </h2>
            </div>

          </div>

          <div className="donor-screening-result-entry__field">

            <label>
              Notes / Comments
            </label>

            <textarea
              rows={5}
              value={
                form.notes || ""
              }
              disabled={
                readOnly ||
                saving
              }
              placeholder="Enter relevant laboratory observations, comments or reporting notes..."
              onChange={(event) =>
                updateForm(
                  "notes",
                  event.target.value
                )
              }
            />

          </div>

        </section>

        {/* ==================================================
            ACTIONS
           ================================================== */}

        {!readOnly && (
          <section className="donor-screening-result-entry__actions">

            <div className="donor-screening-result-entry__actions-left">

              <button
                type="button"
                className="donor-screening-result-entry__button donor-screening-result-entry__button--secondary"
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

              <button
                type="button"
                className="donor-screening-result-entry__button donor-screening-result-entry__button--secondary"
                onClick={
                  handleClear
                }
                disabled={
                  saving
                }
              >
                <Eraser
                  size={17}
                />

                Clear Results
              </button>

              {typeof onCancel ===
                "function" && (
                <button
                  type="button"
                  className="donor-screening-result-entry__button donor-screening-result-entry__button--ghost"
                  onClick={
                    onCancel
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>
              )}

            </div>

            <button
              type="button"
              className="donor-screening-result-entry__button donor-screening-result-entry__button--primary"
              onClick={
                handleSave
              }
              disabled={
                saving
              }
            >

              {saving ? (
                <Loader2
                  size={18}
                  className="donor-screening-result-entry__spin"
                />
              ) : (
                <Save
                  size={18}
                />
              )}

              {saving
                ? "Saving..."
                : isEditMode
                ? "Update Donor Screening"
                : "Save Donor Screening"}

            </button>

          </section>
        )}

      </section>
    </>
  );
}

/* ==========================================================
   EMBEDDED STYLES
   ========================================================== */

const DONOR_SCREENING_STYLES = `
.donor-screening-result-entry {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  background:
    linear-gradient(
      180deg,
      #f8fafc 0%,
      #ffffff 100%
    );
  color: #172033;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* ==========================================================
   HEADER
   ========================================================== */

.donor-screening-result-entry__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px;
  border: 1px solid #dce3ec;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 8px 28px rgba(15, 23, 42, 0.06);
}

.donor-screening-result-entry__title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.donor-screening-result-entry__icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef6ff;
  color: #1261a8;
  border: 1px solid #d6e9fb;
}

.donor-screening-result-entry__eyebrow {
  margin-bottom: 5px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  color: #64748b;
}

.donor-screening-result-entry h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
  color: #172033;
}

.donor-screening-result-entry__title p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.donor-screening-result-entry__mode span {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.8px;
}

.donor-screening-result-entry__mode .is-edit {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.donor-screening-result-entry__mode .is-new {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

/* ==========================================================
   PATIENT
   ========================================================== */

.donor-screening-result-entry__patient {
  display: grid;
  grid-template-columns:
    minmax(200px, 1.6fr)
    minmax(150px, 1fr)
    minmax(150px, 1fr)
    minmax(160px, 1fr);
  gap: 1px;
  margin-top: 14px;
  overflow: hidden;
  border: 1px solid #dce3ec;
  border-radius: 14px;
  background: #dce3ec;
}

.donor-screening-result-entry__patient > div {
  padding: 13px 15px;
  background: #ffffff;
}

.donor-screening-result-entry__patient span {
  display: block;
  margin-bottom: 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #64748b;
}

.donor-screening-result-entry__patient strong {
  display: block;
  font-size: 13px;
  color: #172033;
}

/* ==========================================================
   MESSAGES
   ========================================================== */

.donor-screening-result-entry__message {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 14px;
  padding: 12px 15px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;
}

.donor-screening-result-entry__message--error {
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.donor-screening-result-entry__message--success {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

/* ==========================================================
   SUMMARY
   ========================================================== */

.donor-screening-result-entry__summary {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.donor-screening-result-entry__summary > div {
  padding: 15px 17px;
  border: 1px solid #dce3ec;
  border-radius: 13px;
  background: #ffffff;
}

.donor-screening-result-entry__summary span {
  display: block;
  margin-bottom: 6px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #64748b;
}

.donor-screening-result-entry__summary strong {
  font-size: 21px;
  font-weight: 800;
  color: #172033;
}

.donor-screening-result-entry__summary .is-alert {
  border-color: #fecaca;
  background: #fff7f7;
}

.donor-screening-result-entry__summary .is-alert strong {
  color: #b91c1c;
}

/* ==========================================================
   PROGRESS
   ========================================================== */

.donor-screening-result-entry__progress {
  margin-top: 14px;
  padding: 14px 17px;
  border: 1px solid #dce3ec;
  border-radius: 13px;
  background: #ffffff;
}

.donor-screening-result-entry__progress-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 9px;
}

.donor-screening-result-entry__progress-head span {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}

.donor-screening-result-entry__progress-head strong {
  font-size: 11px;
  color: #172033;
}

.donor-screening-result-entry__progress-track {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #e8edf3;
}

.donor-screening-result-entry__progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #1677c8;
  transition: width 0.25s ease;
}

/* ==========================================================
   CARD
   ========================================================== */

.donor-screening-result-entry__card {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #dce3ec;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 5px 20px rgba(15, 23, 42, 0.035);
}

.donor-screening-result-entry__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 17px 19px;
  border-bottom: 1px solid #e5eaf0;
}

.donor-screening-result-entry__card-header span {
  display: block;
  margin-bottom: 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #64748b;
}

.donor-screening-result-entry__card-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #172033;
}

.donor-screening-result-entry__card-header > svg {
  color: #1261a8;
}

/* ==========================================================
   FORM GRID
   ========================================================== */

.donor-screening-result-entry__grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 16px;
  padding: 19px;
}

.donor-screening-result-entry__field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.donor-screening-result-entry__field label {
  font-size: 11px;
  font-weight: 800;
  color: #475569;
}

.donor-screening-result-entry input,
.donor-screening-result-entry select,
.donor-screening-result-entry textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cfd8e3;
  border-radius: 9px;
  background: #ffffff;
  color: #172033;
  font-family: inherit;
  font-size: 12px;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.donor-screening-result-entry input,
.donor-screening-result-entry select {
  min-height: 40px;
  padding: 0 11px;
}

.donor-screening-result-entry textarea {
  min-height: 110px;
  padding: 11px;
  resize: vertical;
}

.donor-screening-result-entry input:focus,
.donor-screening-result-entry select:focus,
.donor-screening-result-entry textarea:focus {
  border-color: #1677c8;
  box-shadow:
    0 0 0 3px rgba(22, 119, 200, 0.1);
}

.donor-screening-result-entry input:disabled,
.donor-screening-result-entry select:disabled,
.donor-screening-result-entry textarea:disabled {
  background: #f5f7fa;
  color: #64748b;
  cursor: not-allowed;
}

/* ==========================================================
   TABLE
   ========================================================== */

.donor-screening-result-entry__table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.donor-screening-result-entry__table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.donor-screening-result-entry__table th {
  padding: 11px 15px;
  text-align: left;
  background: #f6f8fb;
  border-bottom: 1px solid #dce3ec;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.7px;
  color: #64748b;
}

.donor-screening-result-entry__table td {
  padding: 13px 15px;
  border-bottom: 1px solid #edf1f5;
  vertical-align: middle;
  font-size: 12px;
}

.donor-screening-result-entry__table tbody tr:last-child td {
  border-bottom: none;
}

.donor-screening-result-entry__table tbody tr:hover {
  background: #fbfdff;
}

.donor-screening-result-entry__table tbody tr.is-reactive {
  background: #fff8f8;
}

.donor-screening-result-entry__table tbody tr.is-invalid {
  background: #fffaf0;
}

.donor-screening-result-entry__number {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
}

.donor-screening-result-entry__marker {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.donor-screening-result-entry__marker strong {
  font-size: 13px;
  color: #172033;
}

.donor-screening-result-entry__marker small {
  font-size: 10px;
  color: #94a3b8;
}

.donor-screening-result-entry__table select {
  min-width: 175px;
}

.donor-screening-result-entry__count {
  min-width: 45px;
  padding: 7px 10px;
  border-radius: 8px;
  background: #eef6ff;
  color: #1261a8;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}

/* ==========================================================
   STATUS
   ========================================================== */

.donor-screening-result-entry__status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.donor-screening-result-entry__status--pending {
  background: #f1f5f9;
  color: #64748b;
}

.donor-screening-result-entry__status--reactive {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.donor-screening-result-entry__status--invalid {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.donor-screening-result-entry__status--normal {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

/* ==========================================================
   INTERPRETATION
   ========================================================== */

.donor-screening-result-entry__interpretation {
  display: flex;
  gap: 13px;
  margin-top: 16px;
  padding: 18px;
  border-radius: 15px;
  border: 1px solid #dce3ec;
  background: #ffffff;
}

.donor-screening-result-entry__interpretation-icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
}

.donor-screening-result-entry__interpretation > div:last-child {
  flex: 1;
}

.donor-screening-result-entry__interpretation span {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #64748b;
}

.donor-screening-result-entry__interpretation h3 {
  margin: 5px 0 5px;
  font-size: 15px;
  color: #172033;
}

.donor-screening-result-entry__interpretation p {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
  color: #64748b;
}

.donor-screening-result-entry__interpretation--warning {
  border-color: #fed7aa;
  background: #fffaf5;
}

.donor-screening-result-entry__interpretation--warning
  .donor-screening-result-entry__interpretation-icon {
  background: #fff7ed;
  color: #c2410c;
}

.donor-screening-result-entry__interpretation--success {
  border-color: #bbf7d0;
  background: #f6fff8;
}

.donor-screening-result-entry__interpretation--success
  .donor-screening-result-entry__interpretation-icon {
  background: #ecfdf5;
  color: #15803d;
}

.donor-screening-result-entry__interpretation--pending {
  border-color: #cbd5e1;
  background: #f8fafc;
}

/* ==========================================================
   ACTIONS
   ========================================================== */

.donor-screening-result-entry__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #dce3ec;
  border-radius: 15px;
  background: #ffffff;
}

.donor-screening-result-entry__actions-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.donor-screening-result-entry__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 15px;
  border-radius: 9px;
  border: 1px solid transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.donor-screening-result-entry__button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.donor-screening-result-entry__button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.donor-screening-result-entry__button--primary {
  color: #ffffff;
  background: #1261a8;
  border-color: #1261a8;
  box-shadow:
    0 5px 14px rgba(18, 97, 168, 0.18);
}

.donor-screening-result-entry__button--primary:hover:not(:disabled) {
  background: #0f5492;
}

.donor-screening-result-entry__button--secondary {
  color: #334155;
  background: #ffffff;
  border-color: #cfd8e3;
}

.donor-screening-result-entry__button--secondary:hover:not(:disabled) {
  background: #f8fafc;
}

.donor-screening-result-entry__button--ghost {
  color: #64748b;
  background: transparent;
  border-color: transparent;
}

/* ==========================================================
   LOADING
   ========================================================== */

.donor-screening-result-entry__loading {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #dce3ec;
  border-radius: 16px;
  background: #ffffff;
}

/* ==========================================================
   SPINNER
   ========================================================== */

.donor-screening-result-entry__spin {
  animation:
    donor-screening-result-entry-spin
    0.9s linear infinite;
}

@keyframes donor-screening-result-entry-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* ==========================================================
   RESPONSIVE
   ========================================================== */

@media (max-width: 900px) {
  .donor-screening-result-entry {
    padding: 15px;
  }

  .donor-screening-result-entry__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .donor-screening-result-entry__patient {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .donor-screening-result-entry__summary {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .donor-screening-result-entry__grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .donor-screening-result-entry__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .donor-screening-result-entry__actions-left {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .donor-screening-result-entry {
    padding: 10px;
  }

  .donor-screening-result-entry__header {
    padding: 17px;
  }

  .donor-screening-result-entry__title {
    align-items: flex-start;
  }

  .donor-screening-result-entry h1 {
    font-size: 20px;
  }

  .donor-screening-result-entry__patient {
    grid-template-columns: 1fr;
  }

  .donor-screening-result-entry__summary {
    grid-template-columns: 1fr 1fr;
  }

  .donor-screening-result-entry__grid {
    grid-template-columns: 1fr;
    padding: 15px;
  }

  .donor-screening-result-entry__actions-left {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .donor-screening-result-entry__actions
    > .donor-screening-result-entry__button--primary {
    width: 100%;
  }

  .donor-screening-result-entry__button {
    min-height: 42px;
  }
}
`;