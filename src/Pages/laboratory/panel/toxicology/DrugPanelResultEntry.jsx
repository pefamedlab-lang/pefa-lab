/*
 * PEFA LAB — DRUG PANEL RESULT ENTRY
 * Path:
 * src/pages/laboratory/panel/toxicology/DrugPanelResultEntry.jsx
 *
 * Dedicated 20-analyte qualitative drug-screen panel.
 * Persistence remains in LaboratoryResultEntry.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

const ANALYTES = [
  ["amphetamine", "AMP", "Amphetamine"],
  ["barbiturates", "BAR", "Barbiturates"],
  ["benzodiazepines", "BZO", "Benzodiazepines"],
  ["cannabinoids", "THC", "Cannabinoids"],
  ["cocaine", "COC", "Cocaine"],
  ["methamphetamine", "MET", "Methamphetamine"],
  ["methadone", "MTD", "Methadone"],
  ["opiates", "OPI", "Opiates"],
  ["oxycodone", "OXY", "Oxycodone"],
  ["phencyclidine", "PCP", "Phencyclidine"],
  ["tricyclic_antidepressants", "TCA", "Tricyclic Antidepressants"],
  ["buprenorphine", "BUP", "Buprenorphine"],
  ["fentanyl", "FEN", "Fentanyl"],
  ["tramadol", "TRA", "Tramadol"],
  ["ketamine", "KET", "Ketamine"],
  ["mdma", "MDMA", "MDMA / Ecstasy"],
  ["synthetic_cannabinoids", "K2/SPICE", "Synthetic Cannabinoids"],
  ["six_mam", "6-MAM", "6-Acetylmorphine"],
  ["methaqualone", "MQL", "Methaqualone"],
  ["propoxyphene", "PPX", "Propoxyphene"],
].map(([key, code, name], index) => ({
  key,
  code,
  name,
  order: index + 1,
}));

const RESULT_OPTIONS = [
  "",
  "Negative",
  "Positive",
  "Not Detected",
  "Detected",
  "Invalid",
];

const EMPTY = ANALYTES.reduce((acc, analyte) => {
  acc[analyte.key] = "";
  return acc;
}, {});

const text = (v) => String(v ?? "").trim();

const normalize = (v) =>
  text(v)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const readStored = (source) => {
  const candidates = [
    source?.result,
    source?.result_data,
    source?.result_json,
    source?.structured_result,
    source?.resultData,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return candidate;
    }

    if (typeof candidate === "string" && candidate.trim()) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Continue.
      }
    }
  }

  return {};
};

const normalizeResult = (value) => {
  const n = normalize(value);
  if (!n) return "";
  if (n === "negative") return "Negative";
  if (n === "positive") return "Positive";
  if (n === "not detected" || n === "notdetected") return "Not Detected";
  if (n === "detected") return "Detected";
  if (n === "invalid") return "Invalid";
  return text(value);
};

const hydrate = (source) => {
  const payload = readStored(source);
  const nested =
    payload?.analytes ||
    payload?.results ||
    payload?.parameters ||
    payload?.drugPanel ||
    payload?.drug_panel ||
    {};

  const values = { ...EMPTY };

  ANALYTES.forEach((analyte) => {
    const aliases = [
      analyte.key,
      analyte.code,
      analyte.name,
    ];

    for (const alias of aliases) {
      const value = payload?.[alias] ?? nested?.[alias];
      if (value !== undefined && value !== null && text(value) !== "") {
        values[analyte.key] = normalizeResult(value);
        break;
      }
    }
  });

  return {
    values,
    comment: text(payload?.comment ?? payload?.remarks),
  };
};

export default function DrugPanelResultEntry({
  title = "Drug Panel",
  panelName = "Drug Panel",
  value = null,
  result = null,
  initialResult = null,
  existingResult = null,
  patient = null,
  registration = null,
  test = null,
  onChange,
  onSave,
  onSaved,
  onCancel,
  onBack,
  readOnly = false,
  disabled = false,
  editMode = false,
  className = "",
}) {
  const source = value ?? result ?? initialResult ?? existingResult;
  const initial = useMemo(() => hydrate(source), [source]);

  const [values, setValues] = useState(initial.values);
  const [comment, setComment] = useState(initial.comment);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(initial.values);
    setComment(initial.comment);
  }, [initial]);

  const completed = useMemo(
    () => ANALYTES.every((analyte) => text(values[analyte.key]) !== ""),
    [values]
  );

  const positiveCount = useMemo(
    () =>
      ANALYTES.filter((analyte) => {
        const n = normalize(values[analyte.key]);
        return n === "positive" || n === "detected";
      }).length,
    [values]
  );

  const invalidCount = useMemo(
    () =>
      ANALYTES.filter(
        (analyte) => normalize(values[analyte.key]) === "invalid"
      ).length,
    [values]
  );

  const payload = useMemo(
    () => ({
      panel: "Drug Panel",
      panel_name: "Drug Panel",
      result_type: "Panel",
      result_category: "Drug Panel",
      specimen: "Urine",
      analytes: { ...values },
      results: { ...values },
      comment: text(comment),
      completed,
      analyte_count: ANALYTES.length,
      completed_analyte_count: ANALYTES.filter(
        (analyte) => text(values[analyte.key]) !== ""
      ).length,
      positive_count: positiveCount,
      invalid_count: invalidCount,
    }),
    [values, comment, completed, positiveCount, invalidCount]
  );

  useEffect(() => {
    onChange?.(payload);
  }, [payload, onChange]);

  const setAnalyte = (key, nextValue) => {
    setValues((current) => ({ ...current, [key]: nextValue }));
  };

  const reset = () => {
    if (readOnly || disabled) return;
    setValues({ ...EMPTY });
    setComment("");
  };

  const save = async () => {
    if (readOnly || disabled || saving) return;

    if (!completed) {
      window.alert("Please enter a result for all Drug Panel analytes before saving.");
      return;
    }

    if (invalidCount > 0) {
      window.alert("Invalid drug-screen results should be repeated/verified before final reporting.");
      return;
    }

    setSaving(true);
    try {
      if (onSaved) {
        await onSaved(payload);
      } else if (onSave) {
        await onSave(payload);
      }
    } finally {
      setSaving(false);
    }
  };

  const patientName =
    patient?.patient_name ||
    patient?.name ||
    registration?.patient_name ||
    registration?.patientName ||
    "";

  return (
    <section className={`pefa-special-panel pefa-drug-panel ${className}`}>
      <div className="pefa-special-panel__header">
        <div>
          <div className="pefa-special-panel__eyebrow">
            <ShieldAlert size={15} />
            PEFA DRUG SCREENING
          </div>
          <h2>{title}</h2>
          <p>
            Twenty-analyte qualitative drug screen
            {patientName ? ` • ${patientName}` : ""}
          </p>
        </div>

        <div className="pefa-special-panel__badge">
          {editMode ? "EDIT RESULT" : "NEW RESULT"}
        </div>
      </div>

      <div className="pefa-drug-panel__info">
        <ClipboardList size={18} />
        <span>
          Record the result reported by the screening method. Do not infer a
          positive result from clinical history.
        </span>
      </div>

      <div className="pefa-drug-panel__grid">
        {ANALYTES.map((analyte) => (
          <div className="pefa-drug-panel__card" key={analyte.key}>
            <div className="pefa-drug-panel__number">{analyte.order}</div>
            <div className="pefa-drug-panel__name">
              <strong>{analyte.name}</strong>
              <small>{analyte.code}</small>
            </div>
            <select
              value={values[analyte.key]}
              onChange={(event) =>
                setAnalyte(analyte.key, event.target.value)
              }
              disabled={readOnly || disabled || saving}
            >
              {RESULT_OPTIONS.map((option) => (
                <option key={option || "blank"} value={option}>
                  {option || "Select"}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <label className="pefa-special-panel__field">
        <span>Comment / Laboratory Remark</span>
        <textarea
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={readOnly || disabled || saving}
          placeholder="Optional laboratory comment..."
        />
      </label>

      <div className="pefa-drug-panel__summary">
        <div>
          <span>Completed</span>
          <strong>
            {payload.completed_analyte_count}/{ANALYTES.length}
          </strong>
        </div>
        <div>
          <span>Positive / Detected</span>
          <strong>{positiveCount}</strong>
        </div>
        <div>
          <span>Invalid</span>
          <strong>{invalidCount}</strong>
        </div>
      </div>

      {!readOnly && (
        <div className="pefa-special-panel__actions">
          <button type="button" onClick={onBack || onCancel} disabled={saving}>
            <ArrowLeft size={16} />
            Back
          </button>

          <button type="button" onClick={reset} disabled={saving}>
            <RotateCcw size={16} />
            Clear
          </button>

          <button
            type="button"
            className="primary"
            onClick={save}
            disabled={saving || !completed || invalidCount > 0}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
            {saving ? "Saving..." : editMode ? "Update Result" : "Save Result"}
          </button>
        </div>
      )}
    </section>
  );
}
