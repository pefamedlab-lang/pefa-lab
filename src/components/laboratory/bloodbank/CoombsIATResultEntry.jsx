/* ============================================================
   PEFA LAB — INDIRECT ANTIGLOBULIN TEST RESULT ENTRY
   PATH:
   src/components/laboratory/bloodbank/CoombsIATResultEntry.jsx
   ============================================================ */

import React, { useEffect, useMemo, useState } from "react";

import {
  COOMBS_REACTION_GRADES,
  QUALITATIVE_OPTIONS,
  getIATFinalResult,
  getIATInterpretation,
} from "./coombsResultUtils";

const EMPTY_RESULT = {
  screeningCellI: "",
  screeningCellII: "",
  screeningCellIII: "",
  ahgPhase: "",
  reactionGrade: "",
  finalResult: "",
  interpretation: "",
  comment: "",
};

function Field({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="pefa-coombs-field">
      <label>{label}</label>

      <select value={value || ""} onChange={onChange}>
        <option value="">Select result</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CoombsIATResultEntry({
  registration = {},
  initialResult = null,
  existingResult = null,
  editMode = false,
  onSave,
  onCancel,
}) {
  const suppliedResult = initialResult || existingResult;

  const [result, setResult] = useState({
    ...EMPTY_RESULT,
    ...(suppliedResult || {}),
  });

  useEffect(() => {
    if (suppliedResult) {
      setResult({
        ...EMPTY_RESULT,
        ...suppliedResult,
      });
    }
  }, [suppliedResult]);

  const finalResult = useMemo(
    () =>
      getIATFinalResult({
        screeningCellI: result.screeningCellI,
        screeningCellII: result.screeningCellII,
        screeningCellIII: result.screeningCellIII,
        ahgPhase: result.ahgPhase,
      }),
    [
      result.screeningCellI,
      result.screeningCellII,
      result.screeningCellIII,
      result.ahgPhase,
    ]
  );

  const interpretation = useMemo(
    () => getIATInterpretation(finalResult),
    [finalResult]
  );

  useEffect(() => {
    setResult((previous) => ({
      ...previous,
      finalResult,
      interpretation,
    }));
  }, [finalResult, interpretation]);

  const update = (field, value) => {
    setResult((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const payload = {
      ...result,
      finalResult,
      interpretation,

      testName: "Indirect Coombs Test (IAT)",
      shortName: "IAT",
      department: "Blood Bank",
      category: "Immunohematology",
      specimen: "Serum/Plasma",
      resultType: "qualitative",

      registrationId:
        registration.id ||
        registration.registration_id ||
        registration.lab_no ||
        null,

      labNo:
        registration.labNo ||
        registration.lab_no ||
        "",

      patientName:
        registration.patientName ||
        registration.patient_name ||
        "",

      editMode,
    };

    if (typeof onSave === "function") {
      onSave(payload);
    }
  };

  return (
    <div className="pefa-coombs-result-entry">

      <div className="pefa-coombs-header">
        <div>
          <h2>Indirect Coombs Test (IAT)</h2>
          <p>Indirect Antiglobulin Test</p>
        </div>

        <div className="pefa-coombs-status">
          {editMode ? "EDIT RESULT" : "NEW RESULT"}
        </div>
      </div>

      <div className="pefa-coombs-patient">

        <div>
          <span>Lab No.</span>
          <strong>
            {registration.labNo ||
              registration.lab_no ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Patient</span>
          <strong>
            {registration.patientName ||
              registration.patient_name ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Specimen</span>
          <strong>Serum / Plasma</strong>
        </div>

      </div>

      <section className="pefa-coombs-section">

        <h3>Antibody Screening</h3>

        <div className="pefa-coombs-grid">

          <Field
            label="Screening Cell I"
            value={result.screeningCellI}
            onChange={(e) =>
              update(
                "screeningCellI",
                e.target.value
              )
            }
            options={QUALITATIVE_OPTIONS}
          />

          <Field
            label="Screening Cell II"
            value={result.screeningCellII}
            onChange={(e) =>
              update(
                "screeningCellII",
                e.target.value
              )
            }
            options={QUALITATIVE_OPTIONS}
          />

          <Field
            label="Screening Cell III"
            value={result.screeningCellIII}
            onChange={(e) =>
              update(
                "screeningCellIII",
                e.target.value
              )
            }
            options={QUALITATIVE_OPTIONS}
          />

          <Field
            label="AHG Phase"
            value={result.ahgPhase}
            onChange={(e) =>
              update(
                "ahgPhase",
                e.target.value
              )
            }
            options={QUALITATIVE_OPTIONS}
          />

          <Field
            label="Reaction Grade"
            value={result.reactionGrade}
            onChange={(e) =>
              update(
                "reactionGrade",
                e.target.value
              )
            }
            options={COOMBS_REACTION_GRADES}
          />

        </div>
      </section>

      <section className="pefa-coombs-result-card">

        <span>FINAL IAT RESULT</span>

        <strong
          className={
            finalResult === "Positive"
              ? "positive"
              : finalResult === "Negative"
              ? "negative"
              : ""
          }
        >
          {finalResult || "Pending"}
        </strong>

      </section>

      <section className="pefa-coombs-section">

        <h3>Interpretation</h3>

        <textarea
          value={interpretation}
          onChange={(e) =>
            update(
              "interpretation",
              e.target.value
            )
          }
          rows={4}
          placeholder="Interpretation will be generated automatically..."
        />

      </section>

      <section className="pefa-coombs-section">

        <h3>Additional Comment</h3>

        <textarea
          value={result.comment}
          onChange={(e) =>
            update("comment", e.target.value)
          }
          rows={3}
          placeholder="Optional laboratory comment..."
        />

      </section>

      <div className="pefa-coombs-actions">

        {onCancel && (
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          className="primary"
          onClick={handleSave}
          disabled={
            !result.screeningCellI &&
            !result.screeningCellII &&
            !result.screeningCellIII &&
            !result.ahgPhase
          }
        >
          {editMode
            ? "Update IAT Result"
            : "Save IAT Result"}
        </button>

      </div>

    </div>
  );
}