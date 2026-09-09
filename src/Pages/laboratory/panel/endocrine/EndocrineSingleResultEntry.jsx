import React, { useEffect, useMemo, useState } from "react";
import {
  getAgeInYears,
  normalizeSex,
  normalizePregnancyStatus,
  normalizeTrimester,
  normalizeCyclePhase,
  resolveReferenceRange,
  flagResult,
} from "./EndocrineReferenceRangeEngine";

import {
  getAvailableMethods,
  getEndocrineFallbackForParameter,
} from "./EndocrinePanelRegistry";

const firstValue = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

const text = (v) => String(v ?? "").trim();

export default function EndocrineSingleResultEntry({
  parameter = {},
  value = null,
  result = null,
  patient = null,
  registration = null,
  onChange,
  onSaved,
  onCancel,
  onBack,
  readOnly = false,
  disabled = false,
  editMode = false,
  title,
}) {
  const incoming =
    result && typeof result === "object"
      ? result
      : value && typeof value === "object"
        ? value
        : {};

  const effectiveParameter = useMemo(() => {
    const fallback = getEndocrineFallbackForParameter(parameter);
    if (!fallback) return parameter;

    return {
      ...fallback,
      ...parameter,
      referenceRanges:
        Array.isArray(parameter.referenceRanges) && parameter.referenceRanges.length
          ? parameter.referenceRanges
          : fallback.referenceRanges || [],
      unit: firstValue(parameter.unit, parameter.result_unit, fallback.unit),
    };
  }, [parameter]);

  const buildContext = () => ({
    sex: normalizeSex(
      firstValue(patient?.sex, patient?.gender, incoming.sex, "")
    ),
    age: getAgeInYears({
      age: firstValue(patient?.age, incoming.age),
      dob: firstValue(patient?.dob, incoming.dob),
    }),
    pregnancyStatus: normalizePregnancyStatus(
      firstValue(
        patient?.pregnancy_status,
        patient?.pregnancyStatus,
        incoming.pregnancy_status,
        ""
      )
    ),
    trimester: normalizeTrimester(
      firstValue(
        patient?.trimester,
        incoming.trimester,
        ""
      )
    ),
    cyclePhase: normalizeCyclePhase(
      firstValue(
        patient?.cycle_phase,
        patient?.cyclePhase,
        incoming.cycle_phase,
        /day\s*3/i.test(String(title || "")) ? "day_3" :
        /day\s*21/i.test(String(title || "")) ? "day_21" :
        ""
      )
    ),
  });

  const [context, setContext] = useState(buildContext);

  const [form, setForm] = useState({
    value: firstValue(
      incoming.value,
      incoming.result,
      incoming.result_value,
      incoming.result_numeric,
      ""
    ),
    method: incoming.method ?? "",
    manual_reference_range:
      incoming.manual_reference_range ?? "",
  });

  useEffect(() => {
    setContext(buildContext());
  }, [
    patient?.sex,
    patient?.gender,
    patient?.age,
    patient?.dob,
    patient?.pregnancy_status,
    patient?.pregnancyStatus,
    patient?.trimester,
    patient?.cycle_phase,
    patient?.cyclePhase,
    incoming.sex,
    incoming.age,
    incoming.dob,
    incoming.pregnancy_status,
    incoming.trimester,
    incoming.cycle_phase,
  ]);

  const range = useMemo(
    () =>
      resolveReferenceRange({
        parameter: effectiveParameter,
        context,
        manualRange: form.manual_reference_range,
      }),
    [effectiveParameter, context, form.manual_reference_range]
  );

  const flag = useMemo(
    () => flagResult(form.value, range),
    [form.value, range]
  );

  const disabledAll = disabled || readOnly;

  const buildPayload = (nextForm, nextContext = context) => {
    const nextRange = resolveReferenceRange({
      parameter,
      context: nextContext,
      manualRange: nextForm.manual_reference_range,
    });

    return {
      ...nextForm,
      result: nextForm.value,
      unit: firstValue(
        nextForm.unit,
        parameter.unit,
        parameter.result_unit,
        parameter.masterTest?.unit,
        parameter.master_test?.unit,
        ""
      ),
      reference_range: nextRange.text,
      reference_source: nextRange.source,
      flag: flagResult(nextForm.value, nextRange),
      sex: nextContext.sex,
      age: nextContext.age,
      pregnancy_status: nextContext.pregnancyStatus,
      trimester: nextContext.trimester,
      cycle_phase: nextContext.cyclePhase,
      editMode: Boolean(editMode),
    };
  };

  const publish = (nextForm, nextContext = context) => {
    onChange?.(buildPayload(nextForm, nextContext));
  };

  const updateForm = (patch) => {
    const next = { ...form, ...patch };
    setForm(next);
    publish(next);
  };

  const updateContext = (patch) => {
    const nextContext = { ...context, ...patch };
    setContext(nextContext);
    publish(form, nextContext);
  };

  const save = () => {
    onSaved?.(buildPayload(form));
  };

  const flagClass = text(flag).toUpperCase().includes("CRITICAL")
    ? "critical"
    : flag === "LOW" || flag === "HIGH"
      ? "abnormal"
      : flag === "NORMAL"
        ? "normal"
        : "";

  return (
    <div className="pefa-endocrine-single">
      <style>{`
        .pefa-endocrine-single{font-family:Inter,system-ui,sans-serif;color:#172033}
        .pefa-endocrine-single *{box-sizing:border-box}
        .es-card{border:1px solid #dbe3ea;border-radius:12px;padding:16px;background:#fff}
        .es-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:12px 0}
        .es-grid label,.es-row label{font-size:10px;font-weight:750}
        .es-grid input,.es-grid select,.es-row input,.es-row select{width:100%;margin-top:4px;padding:9px;border:1px solid #cfd8e3;border-radius:7px;font-size:11px}
        .es-row{display:grid;grid-template-columns:1.5fr 1fr 1fr 1.4fr .9fr .95fr;gap:10px;align-items:end}
        .es-value{margin-top:4px;min-height:35px;display:flex;align-items:center}
        .es-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}
        .es-actions button{padding:9px 13px;border:1px solid #cfd8e3;border-radius:7px;background:#fff;font-weight:750}
        .es-actions .primary{background:#7c3aed;color:#fff;border-color:#7c3aed}
        .es-flag{font-weight:800}.es-flag.normal{color:#15803d}.es-flag.abnormal{color:#b45309}.es-flag.critical{color:#b91c1c}
        .es-edit{display:inline-block;margin-top:7px;padding:4px 7px;border-radius:5px;background:#f3e8ff;color:#6d28d9;font-size:9px;font-weight:800}
        @media(max-width:900px){.es-grid{grid-template-columns:repeat(2,1fr)}.es-row{grid-template-columns:1fr 1fr}}
      `}</style>

      <div className="es-card">
        <div style={{fontSize:10,fontWeight:800,color:"#7c3aed"}}>
          ENDOCRINOLOGY
        </div>

        <h2 style={{margin:"4px 0 8px"}}>
          {title || parameter.name || "Endocrine Test"}
        </h2>

        {editMode && <div className="es-edit">EDIT MODE</div>}

        <div className="es-grid">
          <label>
            Sex
            <select
              disabled={disabledAll}
              value={context.sex}
              onChange={(e) =>
                updateContext({ sex: e.target.value })
              }
            >
              <option value="unknown">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label>
            Age
            <input
              disabled={disabledAll}
              type="number"
              min="0"
              value={context.age ?? ""}
              onChange={(e) =>
                updateContext({ age: e.target.value })
              }
            />
          </label>

          <label>
            Pregnancy
            <select
              disabled={disabledAll}
              value={context.pregnancyStatus}
              onChange={(e) =>
                updateContext({
                  pregnancyStatus: e.target.value,
                })
              }
            >
              <option value="not_pregnant">Not pregnant</option>
              <option value="pregnant">Pregnant</option>
            </select>
          </label>

          <label>
            Trimester
            <select
              disabled={
                disabledAll ||
                context.pregnancyStatus !== "pregnant"
              }
              value={context.trimester}
              onChange={(e) =>
                updateContext({
                  trimester: e.target.value,
                })
              }
            >
              <option value="">—</option>
              <option value="first">1st</option>
              <option value="second">2nd</option>
              <option value="third">3rd</option>
            </select>
          </label>

          <label>
            Cycle
            <select
              disabled={
                disabledAll ||
                context.sex !== "female"
              }
              value={context.cyclePhase}
              onChange={(e) =>
                updateContext({
                  cyclePhase: e.target.value,
                })
              }
            >
              <option value="unspecified">Unspecified</option>
              <option value="day_3">Day 3</option>
              <option value="follicular">Follicular</option>
              <option value="ovulatory">Ovulatory</option>
              <option value="day_21">Day 21</option>
              <option value="luteal">Luteal</option>
            </select>
          </label>
        </div>

        <div className="es-row">
          <label>
            Parameter
            <div className="es-value">
              {effectiveParameter.name || parameter.name || ""}
            </div>
          </label>

          <label>
            Result
            <input
              disabled={disabledAll}
              value={form.value}
              onChange={(e) =>
                updateForm({ value: e.target.value })
              }
            />
          </label>

          <label>
            Unit
            <div className="es-value">
              {firstValue(
                effectiveParameter.unit,
                effectiveParameter.result_unit,
                effectiveParameter.masterTest?.unit,
                effectiveParameter.master_test?.unit,
                "—"
              )}
            </div>
          </label>

          <label>
            Reference range
            <input
              disabled={disabledAll}
              value={
                form.manual_reference_range ||
                range.text
              }
              onChange={(e) =>
                updateForm({
                  manual_reference_range:
                    e.target.value,
                })
              }
              title="Leave blank to use the automatic range"
            />
          </label>

          <label>
            Flag
            <div className={`es-value es-flag ${flagClass}`}>
              {flag || "—"}
            </div>
          </label>

          <label>
            Method
            <select
              disabled={disabledAll}
              value={form.method || ""}
              onChange={(e) => updateForm({ method: e.target.value })}
            >
              <option value="">Select method</option>
              {getAvailableMethods(effectiveParameter).map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{marginTop:8,fontSize:9,color:"#64748b"}}>
          Range source: {range.source || "not configured"}
        </div>

        {!readOnly && (
          <div className="es-actions">
            {onBack && (
              <button
                type="button"
                disabled={disabled}
                onClick={onBack}
              >
                Back
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                disabled={disabled}
                onClick={onCancel}
              >
                Cancel
              </button>
            )}

            {onSaved && (
              <button
                type="button"
                className="primary"
                disabled={disabled}
                onClick={save}
              >
                Save Result
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
