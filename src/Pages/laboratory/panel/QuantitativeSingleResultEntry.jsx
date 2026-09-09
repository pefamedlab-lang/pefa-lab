import React, { useEffect, useMemo, useState } from "react";
import {
  calculateQuantitativeFlag,
  getDisplayUnit,
  getReferenceRange,
  getCriticalLow,
  getCriticalHigh,
  getTestName,
  text,
} from "../../../services/laboratory/quantitativeResultMetadata";

const parseStoredValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") return value;
  const raw = value.trim();
  if (!raw) return "";
  if ((raw.startsWith("{") && raw.endsWith("}")) || (raw.startsWith("[") && raw.endsWith("]"))) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed.result ?? parsed.value ?? parsed.result_value ?? parsed.result_numeric ?? "";
      }
    } catch { /* keep original scalar string */ }
  }
  return value;
};

const getInitialValue = (result = {}) =>
  parseStoredValue(result.result ?? result.result_numeric ?? result.result_value ?? result.value ?? "");

const getResultType = (test = {}) =>
  test.result_type ?? test.resultType ?? test.masterTest?.result_type ??
  test.master_test?.result_type ?? "Quantitative";

const flagColor = (flag) => {
  const value = text(flag).toUpperCase();
  if (value.includes("CRITICAL")) return "#b91c1c";
  if (value === "LOW" || value === "HIGH" || value.includes("ABNORMAL") || value === "L" || value === "H") return "#b45309";
  if (value === "NORMAL" || value === "N") return "#15803d";
  return "#64748b";
};

export default function QuantitativeSingleResultEntry({
  department = "Laboratory",
  title = "",
  test = null,
  result = null,
  registration = null,
  patient = null,
  readOnly = false,
  disabled = false,
  editMode = false,
  onResultChange,
  onSaved,
  onCancel,
  onBack,
}) {
  const safeTest = test || {};
  const safeResult = result || {};
  const resolvedPatient = patient || registration || {};
  const [value, setValue] = useState(getInitialValue(safeResult));

  useEffect(() => {
    setValue(getInitialValue(safeResult));
  }, [safeResult?.id, safeResult?.result, safeResult?.result_numeric, safeResult?.result_value, safeResult?.value]);

  const metadata = useMemo(() => {
    const unit = getDisplayUnit(safeTest, safeResult);
    const referenceRange = getReferenceRange(safeTest, resolvedPatient, safeResult);
    const criticalLow = getCriticalLow(safeTest, safeResult);
    const criticalHigh = getCriticalHigh(safeTest, safeResult);
    const flag = calculateQuantitativeFlag({ value, referenceRange, criticalLow, criticalHigh });
    return { unit, referenceRange, criticalLow, criticalHigh, flag };
  }, [safeTest, safeResult, resolvedPatient, value]);

  const emitValue = (nextValue) => {
    setValue(nextValue);
    if (typeof onResultChange === "function") {
      onResultChange({
        value: nextValue,
        result: nextValue,
        unit: metadata.unit,
        reference_range: metadata.referenceRange,
        referenceRange: metadata.referenceRange,
        flag: calculateQuantitativeFlag({
          value: nextValue,
          referenceRange: metadata.referenceRange,
          criticalLow: metadata.criticalLow,
          criticalHigh: metadata.criticalHigh,
        }),
      });
    }
  };

  const handleSave = () => {
    const flag = calculateQuantitativeFlag({
      value,
      referenceRange: metadata.referenceRange,
      criticalLow: metadata.criticalLow,
      criticalHigh: metadata.criticalHigh,
    });
    const numeric = value === "" ? null : Number(value);
    const payload = {
      ...safeResult,
      result: value,
      result_numeric: Number.isFinite(numeric) ? numeric : null,
      value,
      unit: metadata.unit,
      reference_range: metadata.referenceRange,
      referenceRange: metadata.referenceRange,
      flag,
      result_flag: flag,
      editMode: Boolean(editMode),
    };
    if (typeof onSaved === "function") onSaved(payload);
  };

  const styles = {
    wrapper: { width: "100%", border: "1px solid #dbe3ec", borderRadius: 12, background: "#fff", overflow: "hidden" },
    header: { padding: "16px 18px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" },
    title: { margin: 0, color: "#0f172a", fontSize: 18, fontWeight: 700 },
    subtitle: { margin: "5px 0 0", color: "#64748b", fontSize: 12 },
    body: { padding: 18, overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
    th: { textAlign: "left", padding: "10px 12px", background: "#f1f5f9", borderBottom: "1px solid #cbd5e1", fontSize: 12, color: "#334155" },
    td: { padding: "12px", borderBottom: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", verticalAlign: "middle" },
    input: { width: "100%", height: 38, boxSizing: "border-box", padding: "7px 9px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 14, background: "#fff" },
    readonly: { background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" },
    actions: { display: "flex", justifyContent: "flex-end", gap: 8, padding: 14, borderTop: "1px solid #e2e8f0", background: "#f8fafc" },
    button: { border: 0, borderRadius: 7, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  };

  return (
    <div className="quantitative-single-result-entry" style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title || getTestName(safeTest)}</h2>
        <p style={styles.subtitle}>{editMode ? `EDIT MODE — ${department} quantitative result` : `Enter the measured ${department.toLowerCase()} result.`}</p>
      </div>
      <div style={styles.body}>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Parameter</th><th style={styles.th}>Result</th><th style={styles.th}>Unit</th><th style={styles.th}>Reference Range</th><th style={styles.th}>Flag</th></tr></thead>
          <tbody><tr>
            <td style={styles.td}><strong>{getTestName(safeTest)}</strong></td>
            <td style={styles.td}><input type="text" inputMode="decimal" value={value} readOnly={readOnly} disabled={disabled || readOnly} onChange={(event) => emitValue(event.target.value)} style={{ ...styles.input, ...(disabled || readOnly ? styles.readonly : {}) }} aria-label={`${getTestName(safeTest)} result`} /></td>
            <td style={styles.td}>{metadata.unit || "—"}</td>
            <td style={styles.td}>{metadata.referenceRange || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not configured</span>}</td>
            <td style={{ ...styles.td, color: flagColor(metadata.flag), fontWeight: 800 }}>{metadata.flag || "—"}</td>
          </tr></tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>Result Type: <strong>{getResultType(safeTest)}</strong></div>
      </div>
      {(onSaved || onCancel || onBack) && <div style={styles.actions}>
        {typeof onBack === "function" && <button type="button" onClick={onBack} style={{ ...styles.button, background: "#e2e8f0", color: "#334155" }}>Back</button>}
        {typeof onCancel === "function" && <button type="button" onClick={onCancel} style={{ ...styles.button, background: "#e2e8f0", color: "#334155" }}>Cancel</button>}
        {typeof onSaved === "function" && <button type="button" onClick={handleSave} disabled={disabled || readOnly || !text(value)} style={{ ...styles.button, background: "#0f766e", color: "#fff", opacity: disabled || readOnly || !text(value) ? 0.55 : 1 }}>{editMode ? "Update Result" : "Save Result"}</button>}
      </div>}
    </div>
  );
}
