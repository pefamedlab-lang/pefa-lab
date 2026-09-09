/* ==========================================================
   PEFA LAB
   QUALITATIVE RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/QualitativeResultEntry.jsx

   PURPOSE:
   - Standard result-entry form for qualitative laboratory
     tests.
   - Supports new result entry.
   - Supports existing-result display.
   - Supports Edit Mode.
   - Supports Save / Save Changes.
   - Supports Cancel Edit.
   - Safely handles the complete laboratory result object.
   - Does NOT query Supabase.
   - Does NOT resolve master_tests.
   - Does NOT directly save to Supabase.

   IMPORTANT:
   The "result" prop may be the COMPLETE laboratory result
   record, for example:

      {
        result,
        method,
        interpretation,
        comments,
        id,
        registration_id,
        ...
      }

   The component extracts only the actual fields needed
   for rendering.

   ========================================================== */

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlaskConical,
  CheckCircle2,
  Pencil,
  Save,
  X,
  ArrowLeft,
  ShieldCheck,
  FileText,
  ChevronRight,
} from "lucide-react";

/* ==========================================================
   CONSTANTS
   ========================================================== */

const RESULT_OPTIONS = [
  "Positive",
  "Negative",
  "Reactive",
  "Non-Reactive",
  "Detected",
  "Not Detected",
  "Present",
  "Absent",
  "Indeterminate",
  "Invalid",
];

const METHOD_OPTIONS = [
  "Rapid Test",
  "Rapid Diagnostic Test",
  "Immunochromatographic Method",
  "Lateral Flow Assay",
  "ELISA",
  "CLIA",
  "ECLIA",
  "Agglutination",
  "Latex Agglutination",
  "Immunoassay",
  "Other",
];

/* ==========================================================
   HELPERS
   ========================================================== */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const cleanString = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      return value;
    }
  }

  return "";
};

/* ==========================================================
   TEST NAME
   ========================================================== */

const getTestName = (test, result) =>
  firstNonEmpty(
    test?.test_name,
    test?.testName,
    test?.name,
    test?.test,
    test?.service_name,
    test?.serviceName,

    result?.test_name,
    result?.testName,

    test?.masterTest?.test_name,
    test?.master_test?.test_name,

    "Qualitative Test"
  );

/* ==========================================================
   SAFE RESULT EXTRACTION
   ----------------------------------------------------------
   THIS IS THE IMPORTANT FIX.

   result can be:

       "Positive"

   OR:

       {
         result: "Positive",
         method: "...",
         ...
       }

   We NEVER return the entire object as the field value.
   ========================================================== */

const extractResultValue = (source) => {
  if (
    source === null ||
    source === undefined
  ) {
    return "";
  }

  if (
    typeof source === "string" ||
    typeof source === "number" ||
    typeof source === "boolean"
  ) {
    return String(source);
  }

  if (Array.isArray(source)) {
    return "";
  }

  if (isObject(source)) {
    return firstNonEmpty(
      source.result,
      source.result_value,
      source.resultValue,
      source.qualitative_result,
      source.qualitativeResult,
      source.value
    );
  }

  return "";
};

/* ==========================================================
   RESULT RECORD NORMALIZATION
   ========================================================== */

const normalizeResultRecord = (
  result,
  test
) => {
  const source =
    isObject(result)
      ? result
      : {};

  return {
    result: extractResultValue(
      result
    ),

    method: cleanString(
      firstNonEmpty(
        source.method,
        source.test_method,
        source.testMethod
      )
    ),

    interpretation: cleanString(
      firstNonEmpty(
        source.interpretation,
        source.result_interpretation,
        source.resultInterpretation
      )
    ),

    comments: cleanString(
      firstNonEmpty(
        source.comments,
        source.comment,
        source.notes
      )
    ),

    test_name: getTestName(
      test,
      source
    ),
  };
};

/* ==========================================================
   DETERMINE WHETHER RESULT EXISTS
   ========================================================== */

const hasExistingResult = (result) => {
  if (!result) {
    return false;
  }

  if (
    typeof result === "string" ||
    typeof result === "number"
  ) {
    return String(result).trim() !== "";
  }

  if (!isObject(result)) {
    return false;
  }

  return Boolean(
    result.id ||
      extractResultValue(result) ||
      result.method ||
      result.interpretation ||
      result.comments
  );
};

/* ==========================================================
   RESULT STATUS
   ========================================================== */

const isPositiveLike = (value) => {
  const normalized = cleanString(
    value
  ).toLowerCase();

  return [
    "positive",
    "reactive",
    "detected",
    "present",
  ].includes(normalized);
};

const isNegativeLike = (value) => {
  const normalized = cleanString(
    value
  ).toLowerCase();

  return [
    "negative",
    "non-reactive",
    "non reactive",
    "not detected",
    "absent",
  ].includes(normalized);
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function QualitativeResultEntry({
  test,
  result = null,

  registration = null,
  patient = null,

  /*
   * Parent persistence callback.
   *
   * Expected usage:
   *
   * onSaved(nextForm, context)
   *
   * The parent may persist the returned data.
   */
  onSaved,

  /*
   * Optional live change callback.
   */
  onChange,

  onCancel,
  onBack,

  disabled = false,

  /*
   * Existing results are read-only initially unless:
   *
   * editMode === true
   */
  readOnly = false,
  editMode = false,

  /*
   * Optional explicit initial form value.
   */
  value = null,
}) {
  /* ========================================================
     NORMALIZE INCOMING RESULT
     ======================================================== */

  const normalizedIncoming = useMemo(
    () =>
      normalizeResultRecord(
        result ?? value,
        test
      ),
    [result, value, test]
  );

  /* ========================================================
     EXISTING RESULT
     ======================================================== */

  const existingResult = useMemo(
    () =>
      hasExistingResult(
        result ?? value
      ),
    [result, value]
  );

  /* ========================================================
     LOCAL FORM STATE
     ======================================================== */

  const [form, setForm] = useState(
    normalizedIncoming
  );

  /* ========================================================
     EDIT MODE
     ======================================================== */

  const [isEditing, setIsEditing] =
    useState(
      !existingResult &&
        !readOnly
        ? true
        : Boolean(editMode)
    );

  /* ========================================================
     SAVING STATE
     ======================================================== */

  const [isSaving, setIsSaving] =
    useState(false);

  /* ========================================================
     SAVE ERROR
     ======================================================== */

  const [saveError, setSaveError] =
    useState("");

  /* ========================================================
     SUCCESS MESSAGE
     ======================================================== */

  const [saveMessage, setSaveMessage] =
    useState("");

  /* ========================================================
     SYNC WHEN RESULT CHANGES
     ======================================================== */

  useEffect(() => {
    const next =
      normalizeResultRecord(
        result ?? value,
        test
      );

    setForm(next);

    setSaveError("");
    setSaveMessage("");

    /*
     * Existing result:
     * remain in view mode unless parent explicitly
     * requests editMode.
     */
    setIsEditing(
      !hasExistingResult(
        result ?? value
      ) &&
        !readOnly
        ? true
        : Boolean(editMode)
    );
  }, [
    result,
    value,
    test,
    readOnly,
    editMode,
  ]);

  /* ========================================================
     EFFECTIVE DISABLED STATE
     ======================================================== */

  const isDisabled =
    disabled ||
    readOnly ||
    (!isEditing && existingResult);

  /* ========================================================
     UPDATE FIELD
     ======================================================== */

  const updateField = (
    field,
    fieldValue
  ) => {
    if (isDisabled) {
      return;
    }

    const next = {
      ...form,
      [field]:
        typeof fieldValue === "string"
          ? fieldValue
          : "",
    };

    setForm(next);

    setSaveError("");
    setSaveMessage("");

    onChange?.(next);
  };

  /* ========================================================
     ENTER EDIT MODE
     ======================================================== */

  const handleEdit = () => {
    if (disabled) {
      return;
    }

    setSaveError("");
    setSaveMessage("");

    setIsEditing(true);
  };

  /* ========================================================
     CANCEL EDIT
     ======================================================== */

  const handleCancelEdit = () => {
    const original =
      normalizeResultRecord(
        result ?? value,
        test
      );

    setForm(original);

    setSaveError("");
    setSaveMessage("");

    /*
     * Existing result returns to view mode.
     *
     * New result remains editable unless parent
     * explicitly supplied readOnly.
     */
    if (
      hasExistingResult(
        result ?? value
      )
    ) {
      setIsEditing(false);
    } else {
      setIsEditing(!readOnly);
    }
  };

  /* ========================================================
     VALIDATION
     ======================================================== */

  const validate = () => {
    if (!cleanString(form.result)) {
      return "Please select a qualitative result.";
    }

    return "";
  };

  /* ========================================================
     SAVE
     ======================================================== */

  const handleSave = async () => {
    if (isDisabled || isSaving) {
      return;
    }

    setSaveError("");
    setSaveMessage("");

    const validationError =
      validate();

    if (validationError) {
      setSaveError(
        validationError
      );

      return;
    }

    /*
     * Never pass a React object as the result value.
     *
     * The payload has a scalar `result`.
     */
    const payload = {
      ...form,

      /*
       * Explicitly guarantee these fields.
       */
      result: cleanString(
        form.result
      ),
      method: cleanString(
        form.method
      ),
      interpretation:
        cleanString(
          form.interpretation
        ),
      comments: cleanString(
        form.comments
      ),

      /*
       * Preserve useful context without replacing
       * the scalar result field.
       */
      test_name:
        getTestName(
          test,
          result
        ),
    };

    setIsSaving(true);

    try {
      /*
       * Parent controls persistence.
       *
       * We await the callback so the UI does not switch
       * to view mode until the parent accepts the save.
       */
      if (typeof onSaved === "function") {
        await onSaved(
          payload,
          {
            test,
            registration,
            patient,
            existingResult,
            editMode:
              existingResult,
          }
        );
      }

      /*
       * Existing result:
       * return to view mode after successful save.
       */
      setIsEditing(false);

      setSaveMessage(
        existingResult
          ? "Result changes saved successfully."
          : "Result saved successfully."
      );
    } catch (error) {
      console.error(
        "QualitativeResultEntry save failed:",
        error
      );

      setSaveError(
        error?.message ||
          "Unable to save the qualitative result."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* ========================================================
     DISPLAY VALUES
     ======================================================== */

  const testName =
    getTestName(
      test,
      result
    );

  const resultValue =
    cleanString(form.result);

  const positive =
    isPositiveLike(
      resultValue
    );

  const negative =
    isNegativeLike(
      resultValue
    );

  /* ========================================================
     SECTION HEADER
     ======================================================== */

  const SectionHeader = ({
    number,
    icon,
    title,
    description,
  }) => (
    <div className="pefa-qual__section-header">
      <div className="pefa-qual__section-number">
        {number}
      </div>

      <div className="pefa-qual__section-icon">
        {icon}
      </div>

      <div className="pefa-qual__section-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <ChevronRight
        size={18}
        className="pefa-qual__section-chevron"
      />
    </div>
  );

  /* ========================================================
     SELECT FIELD
     ======================================================== */

  const SelectField = ({
    label,
    field,
    options,
    placeholder = "Select",
    required = false,
  }) => {
    const inputId =
      `qualitative-${field}`;

    return (
      <div className="pefa-qual__field">
        <label htmlFor={inputId}>
          <span>{label}</span>

          {required && (
            <span className="pefa-qual__required">
              *
            </span>
          )}
        </label>

        <select
          id={inputId}
          value={form[field] || ""}
          disabled={isDisabled}
          autoComplete="off"
          onChange={(event) =>
            updateField(
              field,
              event.target.value
            )
          }
        >
          <option value="">
            {placeholder}
          </option>

          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      </div>
    );
  };

  /* ========================================================
     TEXT AREA
     ======================================================== */

  const TextAreaField = ({
    label,
    field,
    placeholder = "",
    rows = 4,
  }) => {
    const inputId =
      `qualitative-${field}`;

    return (
      <div className="pefa-qual__field pefa-qual__field--full">
        <label htmlFor={inputId}>
          {label}
        </label>

        <textarea
          id={inputId}
          value={
            typeof form[field] ===
            "string"
              ? form[field]
              : ""
          }
          disabled={isDisabled}
          autoComplete="off"
          placeholder={placeholder}
          rows={rows}
          onChange={(event) =>
            updateField(
              field,
              event.target.value
            )
          }
        />
      </div>
    );
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <>
      <style>{`
        /* =====================================================
           PEFA LAB
           QUALITATIVE RESULT ENTRY
           ===================================================== */

        .pefa-qual {
          --pefa-primary: #0f766e;
          --pefa-primary-dark: #115e59;
          --pefa-primary-soft: #ecfdf5;
          --pefa-primary-border: #a7f3d0;

          --pefa-text: #172033;
          --pefa-muted: #64748b;
          --pefa-label: #334155;

          --pefa-border: #dbe3ea;
          --pefa-border-light: #e8edf2;

          --pefa-surface: #ffffff;
          --pefa-surface-soft: #f8fafc;

          --pefa-danger: #dc2626;
          --pefa-danger-soft: #fef2f2;

          width: 100%;
          box-sizing: border-box;

          color: var(--pefa-text);

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .pefa-qual *,
        .pefa-qual *::before,
        .pefa-qual *::after {
          box-sizing: border-box;
        }

        /* =====================================================
           HEADER
           ===================================================== */

        .pefa-qual__header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 18px;

          padding: 19px 21px;
          margin-bottom: 17px;

          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f8fafc 100%
            );

          border: 1px solid var(--pefa-border);
          border-radius: 12px;

          box-shadow:
            0 1px 2px
              rgba(15, 23, 42, 0.04),
            0 8px 24px
              rgba(15, 23, 42, 0.05);
        }

        .pefa-qual__header-main {
          display: flex;
          align-items: center;

          gap: 13px;
          min-width: 0;
        }

        .pefa-qual__header-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 46px;
          height: 46px;
          flex: 0 0 46px;

          color: var(--pefa-primary);

          background:
            var(--pefa-primary-soft);

          border:
            1px solid
            var(--pefa-primary-border);

          border-radius: 11px;
        }

        .pefa-qual__eyebrow {
          margin-bottom: 3px;

          color: var(--pefa-primary);

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .pefa-qual__title {
          margin: 0;

          color: var(--pefa-text);

          font-size: 21px;
          line-height: 1.25;

          font-weight: 750;
          letter-spacing: -0.015em;
        }

        .pefa-qual__subtitle {
          margin: 4px 0 0;

          color: var(--pefa-muted);

          font-size: 12px;
          line-height: 1.45;
        }

        .pefa-qual__badge {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          padding: 7px 11px;

          color:
            var(--pefa-primary-dark);

          background:
            var(--pefa-primary-soft);

          border:
            1px solid
            var(--pefa-primary-border);

          border-radius: 999px;

          font-size: 11px;
          font-weight: 750;

          white-space: nowrap;
        }

        /* =====================================================
           MODE BAR
           ===================================================== */

        .pefa-qual__modebar {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding: 10px 13px;
          margin-bottom: 16px;

          background: #ffffff;

          border: 1px solid var(--pefa-border);
          border-radius: 10px;
        }

        .pefa-qual__mode {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          color: var(--pefa-muted);

          font-size: 11px;
          font-weight: 700;
        }

        .pefa-qual__mode--edit {
          color: var(--pefa-primary-dark);
        }

        .pefa-qual__mode--view {
          color: #475569;
        }

        .pefa-qual__actions {
          display: flex;
          align-items: center;

          gap: 8px;
        }

        /* =====================================================
           BUTTONS
           ===================================================== */

        .pefa-qual__button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          min-height: 35px;

          padding: 0 12px;

          border-radius: 8px;

          font-family: inherit;
          font-size: 11px;
          font-weight: 750;

          cursor: pointer;

          transition:
            background 0.16s ease,
            border-color 0.16s ease,
            transform 0.16s ease,
            opacity 0.16s ease;
        }

        .pefa-qual__button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .pefa-qual__button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .pefa-qual__button--primary {
          color: #ffffff;

          background:
            var(--pefa-primary);

          border:
            1px solid
            var(--pefa-primary);
        }

        .pefa-qual__button--primary:hover:not(:disabled) {
          background:
            var(--pefa-primary-dark);

          border-color:
            var(--pefa-primary-dark);
        }

        .pefa-qual__button--secondary {
          color: #475569;

          background: #ffffff;

          border:
            1px solid
            #cbd5e1;
        }

        .pefa-qual__button--secondary:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .pefa-qual__button--edit {
          color:
            var(--pefa-primary-dark);

          background:
            var(--pefa-primary-soft);

          border:
            1px solid
            var(--pefa-primary-border);
        }

        .pefa-qual__button--back {
          color: #475569;

          background: #ffffff;

          border:
            1px solid #cbd5e1;
        }

        /* =====================================================
           MESSAGE
           ===================================================== */

        .pefa-qual__message {
          display: flex;
          align-items: flex-start;

          gap: 9px;

          padding: 11px 13px;
          margin-bottom: 15px;

          border-radius: 9px;

          font-size: 11px;
          line-height: 1.45;
        }

        .pefa-qual__message--success {
          color: #166534;

          background: #f0fdf4;

          border:
            1px solid #bbf7d0;
        }

        .pefa-qual__message--error {
          color: #991b1b;

          background:
            var(--pefa-danger-soft);

          border:
            1px solid #fecaca;
        }

        /* =====================================================
           SECTION
           ===================================================== */

        .pefa-qual__section {
          margin-bottom: 16px;

          overflow: hidden;

          background:
            var(--pefa-surface);

          border:
            1px solid
            var(--pefa-border);

          border-radius: 12px;

          box-shadow:
            0 1px 2px
              rgba(15, 23, 42, 0.03),
            0 5px 18px
              rgba(15, 23, 42, 0.035);
        }

        .pefa-qual__section-header {
          display: flex;
          align-items: center;

          gap: 11px;

          min-height: 66px;

          padding: 13px 17px;

          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #fafcfd 100%
            );

          border-bottom:
            1px solid
            var(--pefa-border-light);
        }

        .pefa-qual__section-number {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 26px;
          height: 26px;

          color:
            var(--pefa-primary-dark);

          background:
            var(--pefa-primary-soft);

          border:
            1px solid
            var(--pefa-primary-border);

          border-radius: 7px;

          font-size: 11px;
          font-weight: 800;
        }

        .pefa-qual__section-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          color:
            var(--pefa-primary);

          background: #f0fdfa;

          border-radius: 8px;
        }

        .pefa-qual__section-heading {
          min-width: 0;
          flex: 1;
        }

        .pefa-qual__section-heading h3 {
          margin: 0;

          color:
            var(--pefa-text);

          font-size: 14px;
          line-height: 1.3;

          font-weight: 750;
        }

        .pefa-qual__section-heading p {
          margin: 3px 0 0;

          color:
            var(--pefa-muted);

          font-size: 11px;
          line-height: 1.4;
        }

        .pefa-qual__section-chevron {
          color: #94a3b8;
        }

        /* =====================================================
           FORM
           ===================================================== */

        .pefa-qual__grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 14px;

          padding: 17px;
        }

        .pefa-qual__grid--single {
          grid-template-columns: 1fr;
        }

        .pefa-qual__field {
          min-width: 0;
        }

        .pefa-qual__field--full {
          grid-column: 1 / -1;
        }

        .pefa-qual__field label {
          display: flex;
          align-items: center;

          gap: 3px;

          margin-bottom: 6px;

          color:
            var(--pefa-label);

          font-size: 11px;
          line-height: 1.35;

          font-weight: 700;
        }

        .pefa-qual__required {
          color:
            var(--pefa-danger);

          font-weight: 800;
        }

        .pefa-qual__field input,
        .pefa-qual__field select,
        .pefa-qual__field textarea {
          width: 100%;

          color:
            var(--pefa-text);

          background: #ffffff;

          border:
            1px solid #cfd8e3;

          border-radius: 8px;

          font-family: inherit;
          font-size: 12px;

          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease;
        }

        .pefa-qual__field select,
        .pefa-qual__field input {
          height: 39px;
          padding: 0 11px;
        }

        .pefa-qual__field textarea {
          min-height: 94px;

          padding: 10px 11px;

          resize: vertical;

          line-height: 1.5;
        }

        .pefa-qual__field select:focus,
        .pefa-qual__field input:focus,
        .pefa-qual__field textarea:focus {
          outline: none;

          border-color:
            var(--pefa-primary);

          box-shadow:
            0 0 0 3px
              rgba(
                15,
                118,
                110,
                0.10
              );
        }

        .pefa-qual__field select:disabled,
        .pefa-qual__field input:disabled,
        .pefa-qual__field textarea:disabled {
          color: #64748b;

          background:
            #f8fafc;

          cursor: not-allowed;

          opacity: 0.9;
        }

        /* =====================================================
           RESULT SUMMARY
           ===================================================== */

        .pefa-qual__summary {
          display: flex;
          align-items: center;

          gap: 10px;

          padding: 14px 17px;

          border-top:
            1px solid
            var(--pefa-border-light);

          background:
            #fafcfd;
        }

        .pefa-qual__summary-label {
          color:
            var(--pefa-muted);

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pefa-qual__result-badge {
          display: inline-flex;
          align-items: center;

          min-height: 30px;

          padding: 0 11px;

          border-radius: 999px;

          font-size: 11px;
          font-weight: 800;
        }

        .pefa-qual__result-badge--positive {
          color: #991b1b;

          background:
            #fef2f2;

          border:
            1px solid #fecaca;
        }

        .pefa-qual__result-badge--negative {
          color: #166534;

          background:
            #f0fdf4;

          border:
            1px solid #bbf7d0;
        }

        .pefa-qual__result-badge--neutral {
          color: #475569;

          background:
            #f1f5f9;

          border:
            1px solid #cbd5e1;
        }

        /* =====================================================
           FOOTER ACTIONS
           ===================================================== */

        .pefa-qual__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding: 14px 0 2px;
        }

        .pefa-qual__footer-left,
        .pefa-qual__footer-right {
          display: flex;
          align-items: center;

          gap: 8px;
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 760px) {
          .pefa-qual__header {
            align-items: flex-start;
          }

          .pefa-qual__badge {
            display: none;
          }

          .pefa-qual__grid {
            grid-template-columns: 1fr;
          }

          .pefa-qual__field--full {
            grid-column: auto;
          }

          .pefa-qual__modebar {
            align-items: flex-start;
            flex-direction: column;
          }

          .pefa-qual__actions {
            width: 100%;
          }

          .pefa-qual__actions
          .pefa-qual__button {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .pefa-qual__header {
            padding: 15px;
          }

          .pefa-qual__header-icon {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .pefa-qual__title {
            font-size: 18px;
          }

          .pefa-qual__section-header {
            padding: 12px;
          }

          .pefa-qual__grid {
            padding: 12px;
          }

          .pefa-qual__section-number {
            display: none;
          }

          .pefa-qual__footer {
            flex-direction: column;
            align-items: stretch;
          }

          .pefa-qual__footer-left,
          .pefa-qual__footer-right {
            width: 100%;
          }

          .pefa-qual__footer .pefa-qual__button {
            flex: 1;
          }
        }
      `}</style>

      <div
        className="pefa-qual"
        aria-label="Qualitative Result Entry"
      >
        {/* ==================================================
            HEADER
           ================================================== */}

        <header className="pefa-qual__header">
          <div className="pefa-qual__header-main">
            <div className="pefa-qual__header-icon">
              <FlaskConical size={21} />
            </div>

            <div>
              <div className="pefa-qual__eyebrow">
                LABORATORY
              </div>

              <h2 className="pefa-qual__title">
                {testName}
              </h2>

              <p className="pefa-qual__subtitle">
                Qualitative laboratory result entry
              </p>
            </div>
          </div>

          <div className="pefa-qual__badge">
            <ShieldCheck size={15} />
            <span>
              Qualitative
            </span>
          </div>
        </header>

        {/* ==================================================
            MODE / ACTION BAR
           ================================================== */}

        <div className="pefa-qual__modebar">
          <div
            className={
              isEditing
                ? "pefa-qual__mode pefa-qual__mode--edit"
                : "pefa-qual__mode pefa-qual__mode--view"
            }
          >
            {isEditing ? (
              <>
                <Pencil size={14} />
                <span>
                  {existingResult
                    ? "Edit Mode"
                    : "New Result"}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>
                  Result View Mode
                </span>
              </>
            )}
          </div>

          <div className="pefa-qual__actions">
            {existingResult &&
              !isEditing &&
              !readOnly &&
              !disabled && (
                <button
                  type="button"
                  className="pefa-qual__button pefa-qual__button--edit"
                  onClick={handleEdit}
                >
                  <Pencil size={14} />
                  Edit Result
                </button>
              )}

            {existingResult &&
              isEditing &&
              !disabled && (
                <button
                  type="button"
                  className="pefa-qual__button pefa-qual__button--secondary"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={isSaving}
                >
                  <X size={14} />
                  Cancel Edit
                </button>
              )}
          </div>
        </div>

        {/* ==================================================
            SUCCESS MESSAGE
           ================================================== */}

        {saveMessage && (
          <div className="pefa-qual__message pefa-qual__message--success">
            <CheckCircle2
              size={16}
            />

            <span>
              {saveMessage}
            </span>
          </div>
        )}

        {/* ==================================================
            ERROR MESSAGE
           ================================================== */}

        {saveError && (
          <div className="pefa-qual__message pefa-qual__message--error">
            <X size={16} />

            <span>
              {saveError}
            </span>
          </div>
        )}

        {/* ==================================================
            RESULT
           ================================================== */}

        <section className="pefa-qual__section">
          <SectionHeader
            number="01"
            icon={
              <CheckCircle2
                size={18}
              />
            }
            title="Qualitative Result"
            description="Record the qualitative laboratory finding."
          />

          <div className="pefa-qual__grid">
            <SelectField
              label="Result"
              field="result"
              options={
                RESULT_OPTIONS
              }
              placeholder="Select result"
              required
            />

            <SelectField
              label="Method"
              field="method"
              options={
                METHOD_OPTIONS
              }
              placeholder="Select method"
            />
          </div>

          {/* ================================================
              RESULT SUMMARY
             ================================================= */}

          <div className="pefa-qual__summary">
            <span className="pefa-qual__summary-label">
              Current Result
            </span>

            {resultValue ? (
              <span
                className={
                  positive
                    ? "pefa-qual__result-badge pefa-qual__result-badge--positive"
                    : negative
                    ? "pefa-qual__result-badge pefa-qual__result-badge--negative"
                    : "pefa-qual__result-badge pefa-qual__result-badge--neutral"
                }
              >
                {resultValue}
              </span>
            ) : (
              <span className="pefa-qual__result-badge pefa-qual__result-badge--neutral">
                Not Entered
              </span>
            )}
          </div>
        </section>

        {/* ==================================================
            INTERPRETATION
           ================================================== */}

        <section className="pefa-qual__section">
          <SectionHeader
            number="02"
            icon={
              <FileText
                size={18}
              />
            }
            title="Interpretation & Comments"
            description="Document the laboratory interpretation and additional comments."
          />

          <div className="pefa-qual__grid pefa-qual__grid--single">
            <TextAreaField
              label="Interpretation"
              field="interpretation"
              placeholder="Enter laboratory interpretation..."
              rows={4}
            />

            <TextAreaField
              label="Comments"
              field="comments"
              placeholder="Enter additional laboratory comments..."
              rows={4}
            />
          </div>
        </section>

        {/* ==================================================
            FOOTER ACTIONS
           ================================================== */}

        <div className="pefa-qual__footer">
          <div className="pefa-qual__footer-left">
            {onBack && (
              <button
                type="button"
                className="pefa-qual__button pefa-qual__button--back"
                onClick={onBack}
                disabled={isSaving}
              >
                <ArrowLeft
                  size={14}
                />
                Back
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                className="pefa-qual__button pefa-qual__button--secondary"
                onClick={onCancel}
                disabled={isSaving}
              >
                <X size={14} />
                Cancel
              </button>
            )}
          </div>

          <div className="pefa-qual__footer-right">
            {isEditing &&
              !isDisabled && (
                <button
                  type="button"
                  className="pefa-qual__button pefa-qual__button--primary"
                  onClick={
                    handleSave
                  }
                  disabled={
                    isSaving
                  }
                >
                  <Save
                    size={14}
                  />

                  <span>
                    {isSaving
                      ? "Saving..."
                      : existingResult
                      ? "Save Changes"
                      : "Save Result"}
                  </span>
                </button>
              )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==========================================================
   PUBLIC OPTIONS
   ========================================================== */

export {
  RESULT_OPTIONS,
  METHOD_OPTIONS,
  extractResultValue,
  normalizeResultRecord,
};