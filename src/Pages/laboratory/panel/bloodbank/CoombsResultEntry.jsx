/* ============================================================
   PEFA LAB
   COOMBS / ANTIGLOBULIN TEST RESULT ENTRY
   ------------------------------------------------------------
   PATH:
   src/pages/laboratory/panel/bloodbank/CoombsResultEntry.jsx

   SUPPORTS:
   - Direct Coombs Test (DAT)
   - Indirect Coombs Test (IAT)

   ARCHITECTURE:
   - UI-only component
   - Does NOT query Supabase
   - Does NOT create laboratory_results rows
   - Does NOT update laboratory_results directly
   - LaboratoryResultEntry remains the persistence boundary
   ============================================================ */

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./CoombsResultEntry.css";

/* ============================================================
   CONSTANTS
   ============================================================ */

const QUALITATIVE_OPTIONS = [
  "Positive",
  "Negative",
  "Not Tested",
];

const REACTION_GRADES = [
  "Negative",
  "±",
  "1+",
  "2+",
  "3+",
  "4+",
];

const EMPTY_DAT = {
  testType: "DAT",
  polyspecificAHG: "",
  antiIgG: "",
  antiC3d: "",
  reactionGrade: "",
  finalResult: "",
  interpretation: "",
  comment: "",
};

const EMPTY_IAT = {
  testType: "IAT",
  screeningCellI: "",
  screeningCellII: "",
  screeningCellIII: "",
  ahgPhase: "",
  reactionGrade: "",
  finalResult: "",
  interpretation: "",
  comment: "",
};

/* ============================================================
   HELPERS
   ============================================================ */

const text = (value) =>
  String(value ?? "").trim();

const normalizeText = (value) =>
  text(value)
    .replace(/\s+/g, " ")
    .toLowerCase();

const isPositive = (value) => {
  const normalized = normalizeText(value);

  return (
    normalized === "positive" ||
    normalized === "1+" ||
    normalized === "2+" ||
    normalized === "3+" ||
    normalized === "4+"
  );
};

const isNegative = (value) =>
  normalizeText(value) === "negative";

/* ============================================================
   RESULT CALCULATION — DAT
   ============================================================ */

const calculateDATFinalResult = ({
  polyspecificAHG,
  antiIgG,
  antiC3d,
}) => {
  const iggPositive = isPositive(antiIgG);
  const c3Positive = isPositive(antiC3d);
  const polyspecificPositive =
    isPositive(polyspecificAHG);

  if (iggPositive && c3Positive) {
    return "Positive — IgG + Complement";
  }

  if (iggPositive) {
    return "Positive — IgG";
  }

  if (c3Positive) {
    return "Positive — Complement";
  }

  if (polyspecificPositive) {
    return "Positive";
  }

  if (
    isNegative(polyspecificAHG) &&
    (isNegative(antiIgG) ||
      antiIgG === "Not Tested") &&
    (isNegative(antiC3d) ||
      antiC3d === "Not Tested")
  ) {
    return "Negative";
  }

  return "";
};

const getDATInterpretation = (
  finalResult
) => {
  switch (finalResult) {
    case "Positive — IgG":
      return "IgG detected on the patient's red blood cells. Clinical correlation and further immunohematological investigation are recommended.";

    case "Positive — Complement":
      return "Complement detected on the patient's red blood cells. Clinical correlation and further immunohematological investigation are recommended.";

    case "Positive — IgG + Complement":
      return "IgG and complement detected on the patient's red blood cells. Clinical correlation and further immunohematological investigation are recommended.";

    case "Positive":
      return "A positive Direct Antiglobulin Test was obtained. Clinical correlation and further immunohematological investigation may be indicated.";

    case "Negative":
      return "No detectable IgG and/or complement coating of the patient's red blood cells was detected by the method used.";

    default:
      return "";
  }
};

/* ============================================================
   RESULT CALCULATION — IAT
   ============================================================ */

const calculateIATFinalResult = ({
  screeningCellI,
  screeningCellII,
  screeningCellIII,
  ahgPhase,
}) => {
  if (
    isPositive(screeningCellI) ||
    isPositive(screeningCellII) ||
    isPositive(screeningCellIII) ||
    isPositive(ahgPhase)
  ) {
    return "Positive";
  }

  if (
    isNegative(screeningCellI) &&
    isNegative(screeningCellII) &&
    isNegative(screeningCellIII) &&
    isNegative(ahgPhase)
  ) {
    return "Negative";
  }

  return "";
};

const getIATInterpretation = (
  finalResult
) => {
  switch (finalResult) {
    case "Positive":
      return "An antibody capable of reacting with the reagent red cells was detected. Further antibody identification and compatibility testing may be indicated.";

    case "Negative":
      return "No detectable unexpected red-cell antibodies were detected by the method used.";

    default:
      return "";
  }
};

/* ============================================================
   FORM FIELD
   ============================================================ */

function ResultField({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div className="pefa-coombs__field">
      <label>
        {label}
        {required && (
          <span className="pefa-coombs__required">
            *
          </span>
        )}
      </label>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">
          Select result
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CoombsResultEntry({
  test = {},
  registration = {},
  patient = {},
  result = null,
  mode,
  testMode,
  onSaved,
  onCancel,
  onBack,
  readOnly = false,
  disabled = false,
  editMode = false,
}) {
  const resolvedTestName = text(
    test?.test_name ||
      test?.testName ||
      test?.name ||
      test?.masterTest?.test_name ||
      test?.master_test?.test_name
  );

  const normalizedTestName =
    normalizeText(resolvedTestName);

  const resolvedMode =
    normalizeText(
      mode ||
        testMode ||
        test?.coombs_type ||
        test?.coombsType ||
        test?.test_mode ||
        test?.testMode
    ) === "iat" ||
    normalizedTestName.includes(
      "indirect coombs"
    ) ||
    normalizedTestName.includes(
      "indirect antiglobulin"
    ) ||
    normalizedTestName === "iat"
      ? "IAT"
      : "DAT";

  const storedPayload =
    result?.result &&
    typeof result.result === "object" &&
    !Array.isArray(result.result)
      ? result.result
      : null;

  const initialState = useMemo(
    () =>
      resolvedMode === "IAT"
        ? {
            ...EMPTY_IAT,
            ...(storedPayload || {}),
            testType: "IAT",
          }
        : {
            ...EMPTY_DAT,
            ...(storedPayload || {}),
            testType: "DAT",
          },
    [resolvedMode, result?.id]
  );

  const [
    form,
    setForm,
  ] = useState(initialState);

  useEffect(() => {
    setForm(initialState);
  }, [initialState]);

  const finalResult = useMemo(() => {
    if (resolvedMode === "IAT") {
      return calculateIATFinalResult({
        screeningCellI:
          form.screeningCellI,
        screeningCellII:
          form.screeningCellII,
        screeningCellIII:
          form.screeningCellIII,
        ahgPhase:
          form.ahgPhase,
      });
    }

    return calculateDATFinalResult({
      polyspecificAHG:
        form.polyspecificAHG,
      antiIgG:
        form.antiIgG,
      antiC3d:
        form.antiC3d,
    });
  }, [
    resolvedMode,
    form.polyspecificAHG,
    form.antiIgG,
    form.antiC3d,
    form.screeningCellI,
    form.screeningCellII,
    form.screeningCellIII,
    form.ahgPhase,
  ]);

  const interpretation = useMemo(
    () =>
      resolvedMode === "IAT"
        ? getIATInterpretation(finalResult)
        : getDATInterpretation(finalResult),
    [resolvedMode, finalResult]
  );

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      finalResult,
      interpretation,
    }));
  }, [finalResult, interpretation]);

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const patientName =
    registration?.full_name ||
    registration?.patient_name ||
    registration?.patientName ||
    patient?.full_name ||
    patient?.patient_name ||
    "Unknown Patient";

  const labNumber =
    registration?.lab_number ||
    registration?.labNumber ||
    "—";

  const registrationNumber =
    registration?.registration_number ||
    registration?.registrationNumber ||
    "—";

  const handleSave = () => {
    if (disabled || readOnly) return;

    if (!finalResult) {
      return;
    }

    const payload = {
      ...form,
      testType: resolvedMode,
      testName:
        resolvedMode === "IAT"
          ? "Indirect Coombs Test (IAT)"
          : "Direct Coombs Test (DAT)",
      shortName: resolvedMode,
      department: "Blood Bank",
      category: "Immunohematology",
      specimen:
        resolvedMode === "IAT"
          ? "Serum/Plasma"
          : "EDTA Whole Blood",
      resultType: "Qualitative",
      finalResult,
      interpretation,
      comment: form.comment || "",
      labNumber,
      registrationNumber,
      patientName,
    };

    if (typeof onSaved === "function") {
      onSaved(payload);
    }
  };

  const finalClass =
    finalResult === "Negative"
      ? "pefa-coombs__final-value pefa-coombs__final-value--negative"
      : finalResult
      ? "pefa-coombs__final-value pefa-coombs__final-value--positive"
      : "pefa-coombs__final-value";

  return (
    <div className="pefa-coombs">
      <div className="pefa-coombs__header">
        <div>
          <div className="pefa-coombs__eyebrow">
            PEFA BLOOD BANK • IMMUNOHAEMATOLOGY
          </div>

          <h2>
            {resolvedMode === "IAT"
              ? "Indirect Coombs Test (IAT)"
              : "Direct Coombs Test (DAT)"}
          </h2>

          <p>
            {resolvedMode === "IAT"
              ? "Indirect Antiglobulin Test"
              : "Direct Antiglobulin Test"}
          </p>
        </div>

        <div className="pefa-coombs__mode">
          {editMode
            ? "EDIT RESULT"
            : "NEW RESULT"}
        </div>
      </div>

      <div className="pefa-coombs__patient">
        <div>
          <span>Lab Number</span>
          <strong>{labNumber}</strong>
        </div>

        <div>
          <span>Registration Number</span>
          <strong>{registrationNumber}</strong>
        </div>

        <div>
          <span>Patient</span>
          <strong>{patientName}</strong>
        </div>

        <div>
          <span>Specimen</span>
          <strong>
            {resolvedMode === "IAT"
              ? "Serum / Plasma"
              : "EDTA Whole Blood"}
          </strong>
        </div>
      </div>

      {resolvedMode === "DAT" ? (
        <section className="pefa-coombs__section">
          <h3>
            Direct Antiglobulin Testing
          </h3>

          <div className="pefa-coombs__grid">
            <ResultField
              label="Polyspecific AHG"
              value={form.polyspecificAHG}
              onChange={(value) =>
                updateField(
                  "polyspecificAHG",
                  value
                )
              }
              options={QUALITATIVE_OPTIONS}
              required
            />

            <ResultField
              label="Anti-IgG"
              value={form.antiIgG}
              onChange={(value) =>
                updateField(
                  "antiIgG",
                  value
                )
              }
              options={QUALITATIVE_OPTIONS}
            />

            <ResultField
              label="Anti-C3d"
              value={form.antiC3d}
              onChange={(value) =>
                updateField(
                  "antiC3d",
                  value
                )
              }
              options={QUALITATIVE_OPTIONS}
            />

            <ResultField
              label="Reaction Grade"
              value={form.reactionGrade}
              onChange={(value) =>
                updateField(
                  "reactionGrade",
                  value
                )
              }
              options={REACTION_GRADES}
            />
          </div>
        </section>
      ) : (
        <section className="pefa-coombs__section">
          <h3>
            Indirect Antiglobulin Testing
          </h3>

          <div className="pefa-coombs__grid">
            <ResultField
              label="Screening Cell I"
              value={form.screeningCellI}
              onChange={(value) =>
                updateField(
                  "screeningCellI",
                  value
                )
              }
              options={QUALITATIVE_OPTIONS}
            />

            <ResultField
              label="Screening Cell II"
              value={form.screeningCellII}
              onChange={(value) =>
                updateField(
                  "screeningCellII",
                  value
                )
              }
              options={QUALITATIVE_OPTIONS}
            />

            <ResultField
              label="Screening Cell III"
              value={form.screeningCellIII}
              onChange={(value) =>
                updateField(
                  "screeningCellIII",
                  value
                )
              }
              options={QUALITATIVE_OPTIONS}
            />

            <ResultField
              label="AHG Phase"
              value={form.ahgPhase}
              onChange={(value) =>
                updateField(
                  "ahgPhase",
                  value
                )
              }
              options={QUALITATIVE_OPTIONS}
            />

            <ResultField
              label="Reaction Grade"
              value={form.reactionGrade}
              onChange={(value) =>
                updateField(
                  "reactionGrade",
                  value
                )
              }
              options={REACTION_GRADES}
            />
          </div>
        </section>
      )}

      <section className="pefa-coombs__final">
        <div className="pefa-coombs__final-label">
          FINAL RESULT
        </div>

        <div className={finalClass}>
          {finalResult || "Pending"}
        </div>
      </section>

      <section className="pefa-coombs__section">
        <h3>Interpretation</h3>

        <textarea
          value={
            form.interpretation ||
            interpretation ||
            ""
          }
          onChange={(event) =>
            updateField(
              "interpretation",
              event.target.value
            )
          }
          rows={4}
          disabled={
            disabled || readOnly
          }
        />
      </section>

      <section className="pefa-coombs__section">
        <h3>Laboratory Comment</h3>

        <textarea
          value={form.comment || ""}
          onChange={(event) =>
            updateField(
              "comment",
              event.target.value
            )
          }
          rows={3}
          placeholder="Optional laboratory comment..."
          disabled={
            disabled || readOnly
          }
        />
      </section>

      <div className="pefa-coombs__actions">
        {typeof onBack === "function" && (
          <button
            type="button"
            className="pefa-coombs__button pefa-coombs__button--secondary"
            onClick={onBack}
            disabled={disabled}
          >
            Back
          </button>
        )}

        {typeof onCancel === "function" && (
          <button
            type="button"
            className="pefa-coombs__button pefa-coombs__button--secondary"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          className="pefa-coombs__button pefa-coombs__button--primary"
          onClick={handleSave}
          disabled={
            disabled ||
            readOnly ||
            !finalResult
          }
        >
          {editMode
            ? "Update Coombs Result"
            : "Save Coombs Result"}
        </button>
      </div>
    </div>
  );
}
