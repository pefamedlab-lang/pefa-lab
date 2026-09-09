/*
 * PEFA LAB — HEPATITIS B PANEL RESULT ENTRY
 * Path:
 * src/pages/laboratory/panel/serology/HepatitisBPanelResultEntry.jsx
 *
 * Purpose:
 * - Dedicated six-marker Hepatitis B panel form
 * - Preserves the LaboratoryResultEntry persistence boundary
 * - Supports new entry and edit mode
 * - Returns one structured JSON object through onChange/onSaved
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

const MARKERS = [
  {
    key: "hbsag",
    code: "HBsAg",
    name: "Hepatitis B Surface Antigen (HBsAg)",
    shortName: "HBsAg",
    help: "Indicates current hepatitis B infection when reactive.",
  },
  {
    key: "hbeag",
    code: "HBeAg",
    name: "Hepatitis B e Antigen (HBeAg)",
    shortName: "HBeAg",
    help: "Marker associated with active viral replication/infectivity.",
  },
  {
    key: "anti_hbc_total",
    code: "Anti-HBc Total",
    name: "Hepatitis B Core Antibody Total (Anti-HBc)",
    shortName: "Anti-HBc Total",
    help: "Total antibody to hepatitis B core antigen.",
  },
  {
    key: "anti_hbc_igm",
    code: "Anti-HBc IgM",
    name: "Hepatitis B Core IgM Antibody (Anti-HBc IgM)",
    shortName: "Anti-HBc IgM",
    help: "IgM antibody to hepatitis B core antigen.",
  },
  {
    key: "anti_hbe",
    code: "Anti-HBe",
    name: "Hepatitis B e Antibody (Anti-HBe)",
    shortName: "Anti-HBe",
    help: "Antibody to hepatitis B e antigen.",
  },
  {
    key: "anti_hbs",
    code: "Anti-HBs",
    name: "Hepatitis B Surface Antibody (Anti-HBs)",
    shortName: "Anti-HBs",
    help: "Indicates immunity to hepatitis B in the appropriate clinical context.",
  },
];

const OPTIONS = ["", "Reactive", "Non-reactive", "Positive", "Negative", "Indeterminate"];

const EMPTY = MARKERS.reduce((acc, marker) => {
  acc[marker.key] = "";
  return acc;
}, {});

const text = (v) => String(v ?? "").trim();

const normalize = (v) =>
  text(v)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const firstObject = (...values) =>
  values.find(
    (value) =>
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
  ) || null;

const readStored = (source) => {
  if (!source) return {};

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
        // Keep looking.
      }
    }
  }

  return {};
};

const normalizeMarkerValue = (value) => {
  const n = normalize(value);
  if (!n) return "";
  if (n === "reactive") return "Reactive";
  if (n === "non reactive" || n === "nonreactive") return "Non-reactive";
  if (n === "positive") return "Positive";
  if (n === "negative") return "Negative";
  if (n === "indeterminate") return "Indeterminate";
  return text(value);
};

const hydrate = (source) => {
  const payload = readStored(source);
  const nested = firstObject(
    payload?.markers,
    payload?.results,
    payload?.parameters,
    payload?.hepatitisB,
    payload?.hepatitis_b,
  );

  const values = { ...EMPTY };

  MARKERS.forEach((marker) => {
    const aliases = [
      marker.key,
      marker.code,
      marker.shortName,
      marker.name,
    ];

    for (const alias of aliases) {
      const value =
        payload?.[alias] ??
        nested?.[alias];

      if (value !== undefined && value !== null && text(value) !== "") {
        values[marker.key] = normalizeMarkerValue(value);
        break;
      }
    }
  });

  return {
    values,
    comment: text(payload?.comment ?? payload?.remarks ?? payload?.interpretation),
  };
};

const getInterpretation = (values) => {
  const positive = Object.values(values).filter(
    (value) => normalize(value) === "reactive" || normalize(value) === "positive"
  ).length;

  if (!positive) {
    return "No hepatitis B serological marker is reactive in this panel.";
  }

  return "Hepatitis B serological profile contains reactive/positive marker(s); interpret with the complete marker pattern and clinical context.";
};

export default function HepatitisBPanelResultEntry({
  title = "Hepatitis B Panel",
  panelName = "Hepatitis B Panel",
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
    () => MARKERS.every((marker) => text(values[marker.key]) !== ""),
    [values]
  );

  const payload = useMemo(
    () => ({
      panel: "Hepatitis B Panel",
      panel_name: "Hepatitis B Panel",
      result_type: "Panel",
      result_category: "Serology",
      specimen: "Serum",
      markers: { ...values },
      results: { ...values },
      comment: text(comment),
      interpretation: getInterpretation(values),
      completed,
      marker_count: MARKERS.length,
      completed_marker_count: MARKERS.filter(
        (marker) => text(values[marker.key]) !== ""
      ).length,
    }),
    [values, comment, completed]
  );

  useEffect(() => {
    onChange?.(payload);
  }, [payload, onChange]);

  const setMarker = (key, nextValue) => {
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
      window.alert("Please enter a result for all six Hepatitis B markers before saving.");
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
    <section className={`pefa-special-panel pefa-hepb-panel ${className}`}>
      <div className="pefa-special-panel__header">
        <div>
          <div className="pefa-special-panel__eyebrow">
            <ShieldCheck size={15} />
            PEFA SEROLOGY
          </div>
          <h2>{title}</h2>
          <p>
            Six-marker Hepatitis B serological profile
            {patientName ? ` • ${patientName}` : ""}
          </p>
        </div>

        <div className="pefa-special-panel__badge">
          {editMode ? "EDIT RESULT" : "NEW RESULT"}
        </div>
      </div>

      <div className="pefa-hepb-panel__info">
        <ClipboardList size={18} />
        <span>
          Enter each marker exactly as reported by the test method. The panel is
          saved as one structured laboratory result.
        </span>
      </div>

      <div className="pefa-hepb-panel__table-wrap">
        <table className="pefa-hepb-panel__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Marker</th>
              <th>Result</th>
              <th>Clinical note</th>
            </tr>
          </thead>
          <tbody>
            {MARKERS.map((marker, index) => (
              <tr key={marker.key}>
                <td>{index + 1}</td>
                <td>
                  <strong>{marker.shortName}</strong>
                  <small>{marker.name}</small>
                </td>
                <td>
                  <select
                    value={values[marker.key]}
                    onChange={(event) =>
                      setMarker(marker.key, event.target.value)
                    }
                    disabled={readOnly || disabled || saving}
                  >
                    {OPTIONS.map((option) => (
                      <option key={option || "blank"} value={option}>
                        {option || "Select result"}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{marker.help}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

      <div className="pefa-hepb-panel__summary">
        <div>
          <span>Markers completed</span>
          <strong>
            {payload.completed_marker_count}/{MARKERS.length}
          </strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{completed ? "Ready to save" : "Incomplete"}</strong>
        </div>
      </div>

      {!readOnly && (
        <div className="pefa-special-panel__actions">
          <button
            type="button"
            onClick={onBack || onCancel}
            disabled={saving}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="button"
            onClick={reset}
            disabled={saving}
          >
            <RotateCcw size={16} />
            Clear
          </button>

          <button
            type="button"
            className="primary"
            onClick={save}
            disabled={saving || !completed}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
            {saving ? "Saving..." : editMode ? "Update Result" : "Save Result"}
          </button>
        </div>
      )}
    </section>
  );
}
