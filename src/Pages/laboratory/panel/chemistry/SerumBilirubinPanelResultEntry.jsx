/* PEFA LAB — SERUM BILIRUBIN PANEL RESULT ENTRY
   React lifecycle-safe update.
   The critical fix is that parent onChange is NEVER called from
   inside a React state updater function. */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Clock3, Info, Save } from "lucide-react";

import {
  calculateIndirectBilirubin,
  getAgeAwareBilirubinResult,
  getBirthTime,
  resolveNeonatalBilirubinContext,
} from "../../../../services/laboratory/neonatalBilirubinReferenceEngine";

const text = (value) => String(value ?? "").trim();

const normalize = (value) =>
  text(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").toLowerCase();

const firstValue = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && text(value) !== "") return value;
  }
  return "";
};

const PARAMETER_DEFINITIONS = [
  { key: "total_bilirubin", name: "Total Bilirubin", unit: "mg/dL", editable: true },
  { key: "direct_bilirubin", name: "Direct Bilirubin", unit: "mg/dL", editable: true },
  { key: "indirect_bilirubin", name: "Indirect Bilirubin", unit: "mg/dL", editable: false, calculated: true },
];

const getRegistrationDob = (registration, patient, sourceResult) =>
  firstValue(
    registration?.dob, registration?.date_of_birth, registration?.dateOfBirth,
    registration?.patient_dob, registration?.patientDob, registration?._dob,
    registration?.patient?.dob, registration?.patient?.date_of_birth,
    registration?.patient?.dateOfBirth, patient?.dob, patient?.date_of_birth,
    patient?.dateOfBirth, patient?.patient_dob, patient?.patientDob,
    patient?._dob, patient?.patient?.dob, patient?.patient?.date_of_birth,
    patient?.patient?.dateOfBirth, sourceResult?.dob, sourceResult?.date_of_birth,
    sourceResult?.dateOfBirth
  );

const getSourceResult = (result, initialResult, existingResult) =>
  result || initialResult || existingResult || {};

const getStoredParameterMap = (source) => {
  const candidates = [source?.parameters, source?.parameter_results, source?.parameterResults];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) return candidate;
  }
  return {};
};

const getStoredValue = (source, key, aliases = []) => {
  const names = [key, ...aliases];
  const map = getStoredParameterMap(source);

  for (const name of names) {
    const value = map?.[name];
    if (value && typeof value === "object") {
      const candidate = firstValue(value.value, value.result, value.result_value, value.resultValue);
      if (text(candidate) !== "") return candidate;
    }
    if (value !== null && value !== undefined && text(value) !== "") return value;
  }

  const payload = source?.result && typeof source.result === "object" ? source.result : null;
  if (payload) {
    for (const name of names) {
      const value = payload?.[name];
      if (value && typeof value === "object") {
        const candidate = firstValue(value.value, value.result, value.result_value);
        if (text(candidate) !== "") return candidate;
      }
      if (value !== null && value !== undefined && text(value) !== "") return value;
    }
  }
  return "";
};

const getCollectionInput = (source, registration, patient) => {
  const raw = firstValue(
    source?.sample_collection_date_time, source?.sampleCollectionDateTime,
    source?.specimen_collection_time, source?.specimenCollectionTime,
    source?.collection_datetime, source?.collectionDateTime,
    registration?.sample_collection_date_time, registration?.sampleCollectionDateTime,
    patient?.sample_collection_date_time, patient?.sampleCollectionDateTime
  );
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoFromLocalInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const flagClass = (flag) => {
  const value = normalize(flag);
  if (value === "high") return "sbr-flag sbr-flag-high";
  if (value === "low") return "sbr-flag sbr-flag-low";
  if (value === "normal") return "sbr-flag sbr-flag-normal";
  return "sbr-flag";
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function SerumBilirubinPanelResultEntry({
  test = null, result = null, initialResult = null, existingResult = null,
  registration = null, patient = null, parameters = [], panelParameters = [],
  analytes = [], demographics = null, onChange, onSave, onSaved, onCancel,
  onBack, readOnly = false, disabled = false, editMode = false,
  title = "Serum Bilirubin",
}) {
  const sourceResult = getSourceResult(result, initialResult, existingResult);

  const initialCollection = useMemo(
    () => getCollectionInput(sourceResult, registration, patient),
    [sourceResult, registration, patient]
  );

  const [collectionDateTime, setCollectionDateTime] = useState(initialCollection);

  const [values, setValues] = useState(() => ({
    total_bilirubin: getStoredValue(sourceResult, "total_bilirubin", ["total bilirubin", "totalBilirubin"]),
    direct_bilirubin: getStoredValue(sourceResult, "direct_bilirubin", ["direct bilirubin", "directBilirubin"]),
    indirect_bilirubin: getStoredValue(sourceResult, "indirect_bilirubin", ["indirect bilirubin", "indirectBilirubin"]),
  }));

  /*
   * HYDRATION
   * Kept exactly as an effect. It does not call the parent's onChange.
   */
  useEffect(() => {
    const nextCollection = getCollectionInput(sourceResult, registration, patient);
    setCollectionDateTime(nextCollection);
    setValues({
      total_bilirubin: getStoredValue(sourceResult, "total_bilirubin", ["total bilirubin", "totalBilirubin"]),
      direct_bilirubin: getStoredValue(sourceResult, "direct_bilirubin", ["direct bilirubin", "directBilirubin"]),
      indirect_bilirubin: getStoredValue(sourceResult, "indirect_bilirubin", ["indirect bilirubin", "indirectBilirubin"]),
    });
  }, [sourceResult, registration, patient]);

  const neonatalContext = useMemo(() => {
    return resolveNeonatalBilirubinContext({
      patient, registration, test, row: sourceResult,
      collectionDateTime: toIsoFromLocalInput(collectionDateTime),
    });
  }, [patient, registration, test, sourceResult, collectionDateTime]);

  const indirect = useMemo(
    () => calculateIndirectBilirubin(values.total_bilirubin, values.direct_bilirubin),
    [values.total_bilirubin, values.direct_bilirubin]
  );

  const finalValues = useMemo(
    () => ({ ...values, indirect_bilirubin: indirect }),
    [values, indirect]
  );

  const displayRows = useMemo(() => PARAMETER_DEFINITIONS.map((definition) => {
    const value = finalValues[definition.key];
    const ageAware = getAgeAwareBilirubinResult({
      parameterKey: definition.key, value, patient, registration, test,
      row: sourceResult, collectionDateTime: toIsoFromLocalInput(collectionDateTime),
    });
    return { ...definition, value, reference: ageAware.reference, flag: ageAware.flag };
  }), [finalValues, patient, registration, test, sourceResult, collectionDateTime]);

  /*
   * Builds and publishes the same structured payload as before.
   * This function is only called from event handlers, never from
   * inside a setState updater.
   */
  const publishChange = useCallback((nextValues, nextCollectionDateTime = collectionDateTime) => {
    if (typeof onChange !== "function") return;

    const nextIndirect = calculateIndirectBilirubin(
      nextValues.total_bilirubin, nextValues.direct_bilirubin
    );

    const next = { ...nextValues, indirect_bilirubin: nextIndirect };
    const collectionIso = toIsoFromLocalInput(nextCollectionDateTime);
    const parameterPayload = {};

    PARAMETER_DEFINITIONS.forEach((definition) => {
      const value = next[definition.key] ?? "";
      const ageAware = getAgeAwareBilirubinResult({
        parameterKey: definition.key, value, patient, registration, test,
        row: sourceResult, collectionDateTime: collectionIso,
      });

      parameterPayload[definition.key] = {
        key: definition.key, name: definition.name, parameter_name: definition.name,
        value, result: value, unit: definition.unit,
        referenceRange: ageAware.reference?.text || "",
        reference_range: ageAware.reference?.text || "",
        flag: ageAware.flag || "",
        calculated: Boolean(definition.calculated),
        readOnly: Boolean(!definition.editable),
      };
    });

    onChange({
      ...sourceResult,
      parameters: parameterPayload,
      parameter_results: parameterPayload,
      panel_name: "Serum Bilirubin",
      panelName: "Serum Bilirubin",
      sample_collection_date_time: collectionIso || null,
      neonatal_bilirubin: {
        dob: neonatalContext.dob || null,
        birth_datetime: neonatalContext.birthDateTime?.toISOString?.() ||
          neonatalContext.birthDateTime || null,
        birth_time: neonatalContext.birthTime || null,
        collection_date_time: collectionIso || null,
        age_days: neonatalContext.ageDays,
        age_hours: neonatalContext.ageHours,
        age_display: neonatalContext.age?.display || null,
        reference_source: "Age-specific bilirubin reference profile",
      },
      patient, registration, test, editMode: Boolean(editMode),
    });
  }, [
    onChange, patient, registration, test, sourceResult, collectionDateTime,
    neonatalContext, editMode,
  ]);

  const handleChange = (key, value) => {
    if (disabled || readOnly || key === "indirect_bilirubin") return;

    /*
     * CRITICAL FIX:
     * Do NOT call publishChange inside setValues(previous => ...).
     * React may execute that updater while rendering. publishChange()
     * calls the parent's onChange(), which creates the render-phase
     * state update warning/error.
     */
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);
    publishChange(nextValues, collectionDateTime);
  };

  const handleCollectionChange = (value) => {
    if (disabled || readOnly) return;
    setCollectionDateTime(value);
    publishChange(values, value);
  };

  const buildPayload = () => {
    const parameterPayload = {};
    displayRows.forEach((row) => {
      parameterPayload[row.key] = {
        key: row.key, name: row.name, parameter_name: row.name,
        value: row.value, result: row.value, unit: row.unit,
        referenceRange: row.reference?.text || "",
        reference_range: row.reference?.text || "",
        flag: row.flag || "",
        calculated: Boolean(row.calculated),
        readOnly: Boolean(!row.editable),
      };
    });

    return {
      ...sourceResult,
      parameters: parameterPayload,
      parameter_results: parameterPayload,
      panel_name: "Serum Bilirubin",
      panelName: "Serum Bilirubin",
      sample_collection_date_time: toIsoFromLocalInput(collectionDateTime) || null,
      neonatal_bilirubin: {
        dob: neonatalContext.dob || null,
        birth_datetime: neonatalContext.birthDateTime?.toISOString?.() ||
          neonatalContext.birthDateTime || null,
        birth_time: neonatalContext.birthTime || null,
        collection_date_time: toIsoFromLocalInput(collectionDateTime) || null,
        age_days: neonatalContext.ageDays,
        age_hours: neonatalContext.ageHours,
        age_display: neonatalContext.age?.display || null,
        reference_source: "Age-specific bilirubin reference profile",
      },
      patient, registration, test, editMode: Boolean(editMode),
    };
  };

  const handleSave = () => {
    if (disabled || readOnly) return;
    const payload = buildPayload();
    if (typeof onSaved === "function") onSaved(payload);
    else if (typeof onSave === "function") onSave(payload);
  };

  const dob = getRegistrationDob(registration, patient, sourceResult);
  const birthTime = getBirthTime(patient, registration, sourceResult);
  const hasAge = Number.isFinite(neonatalContext.ageDays);
  const isNeonatal = hasAge && neonatalContext.ageDays < 28;

  return (
    <div className="pefa-serum-bilirubin-panel" style={styles.shell}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>CLINICAL CHEMISTRY · QUANTITATIVE PANEL</div>
          <h2 style={styles.title}>{title}</h2>
          <div style={styles.subtitle}>
            Neonatal / paediatric bilirubin assessment with age-aware laboratory reference intervals
          </div>
        </div>
        <div style={styles.mode}>{editMode ? "EDIT MODE" : "NEW RESULT"}</div>
      </div>

      <div style={styles.contextGrid}>
        <div style={styles.contextCard}><CalendarDays size={16} /><div><span>DOB</span><strong>{dob ? formatDate(dob) : "Not available"}</strong></div></div>
        <div style={styles.contextCard}><Clock3 size={16} /><div><span>Birth time</span><strong>{birthTime || "Not recorded"}</strong></div></div>
        <div style={styles.contextCard}><CalendarDays size={16} /><div><span>Postnatal age</span><strong>{neonatalContext.age?.display || "Awaiting DOB"}</strong></div></div>
      </div>

      <div style={styles.collectionRow}>
        <label style={styles.collectionLabel}>
          Sample collection date/time
          <input
            type="datetime-local"
            value={collectionDateTime}
            onChange={(event) => handleCollectionChange(event.target.value)}
            disabled={disabled || readOnly}
            style={styles.input}
          />
        </label>
        <div style={styles.infoBox}>
          <Info size={17} />
          <div>
            <strong>{isNeonatal ? "Neonatal age-aware mode" : "Age-aware mode"}</strong>
            <span>The selected laboratory reference interval is determined from DOB and the sample collection time.</span>
          </div>
        </div>
      </div>

      <div style={styles.notice}>
        <AlertTriangle size={18} />
        <div>
          <strong>Clinical decision-support boundary</strong>
          <span>
            The reference intervals shown here are laboratory reference intervals. They are not phototherapy or exchange-transfusion thresholds. Treatment decisions for newborn hyperbilirubinaemia require clinical assessment and hour-specific TSB interpretation.
          </span>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead><tr>
            <th style={styles.th}>Parameter</th><th style={styles.th}>Result</th>
            <th style={styles.th}>Unit</th><th style={styles.th}>Age-specific reference</th>
            <th style={styles.th}>Flag</th>
          </tr></thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.key}>
                <td style={styles.td}>
                  <strong>{row.name}</strong>
                  {row.calculated && <small style={styles.calculated}>Calculated</small>}
                </td>
                <td style={styles.td}>
                  <input
                    type="number" step="0.01" value={row.value ?? ""}
                    onChange={(event) => handleChange(row.key, event.target.value)}
                    disabled={disabled || readOnly || !row.editable}
                    style={{ ...styles.resultInput, ...(row.calculated ? styles.calculatedInput : {}) }}
                    placeholder="—"
                  />
                </td>
                <td style={styles.td}>{row.unit}</td>
                <td style={styles.td}>
                  {row.reference?.text || "No age-specific range available"}
                  {row.reference?.label && <small style={styles.rangeLabel}>{row.reference.label}</small>}
                </td>
                <td style={styles.td}><span className={flagClass(row.flag)}>{row.flag || "—"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!hasAge && (
        <div style={styles.warning}>
          <AlertTriangle size={17} />
          <span>DOB is required to select an age-specific bilirubin reference interval. No age-specific flag will be invented without valid age data.</span>
        </div>
      )}

      <div style={styles.footer}>
        <span>Reference profile: age-specific published paediatric laboratory intervals; validate locally before clinical use.</span>
        <div style={styles.actions}>
          {onBack && <button type="button" onClick={onBack} style={styles.secondary}>Back</button>}
          {onCancel && <button type="button" onClick={onCancel} style={styles.secondary}>Cancel</button>}
          <button type="button" onClick={handleSave} disabled={disabled || readOnly} style={styles.primary}>
            <Save size={16} /> Save Result
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  shell:{width:"100%",background:"#fff",border:"1px solid #dbe3ec",borderRadius:14,overflow:"hidden",color:"#172033"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,padding:"20px 22px",borderBottom:"1px solid #e5eaf0",background:"#f8fafc"},
  kicker:{fontSize:10,fontWeight:800,letterSpacing:".08em",color:"#64748b"},
  title:{margin:"5px 0 2px",fontSize:21,fontWeight:800},
  subtitle:{fontSize:12,color:"#64748b"},
  mode:{padding:"6px 9px",borderRadius:999,background:"#dbeafe",color:"#1d4ed8",fontSize:10,fontWeight:800,whiteSpace:"nowrap"},
  contextGrid:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,padding:"14px 18px 0"},
  contextCard:{display:"flex",alignItems:"flex-start",gap:9,padding:12,border:"1px solid #e2e8f0",borderRadius:10,background:"#fff"},
  collectionRow:{display:"grid",gridTemplateColumns:"minmax(260px,360px) 1fr",gap:12,padding:"14px 18px"},
  collectionLabel:{display:"grid",gap:6,fontSize:11,fontWeight:800,color:"#475569"},
  input:{width:"100%",boxSizing:"border-box",padding:"10px 11px",border:"1px solid #cbd5e1",borderRadius:8,background:"#fff",color:"#172033"},
  infoBox:{display:"flex",gap:9,alignItems:"flex-start",padding:11,borderRadius:9,background:"#eff6ff",color:"#1e40af",fontSize:11},
  notice:{margin:"0 18px 14px",display:"flex",gap:9,padding:12,borderRadius:9,background:"#fff7ed",border:"1px solid #fed7aa",color:"#9a3412",fontSize:11,lineHeight:1.5},
  tableWrap:{margin:"0 18px",overflowX:"auto",border:"1px solid #dbe3ec",borderRadius:10},
  table:{width:"100%",borderCollapse:"collapse",minWidth:720},
  th:{padding:"10px 11px",textAlign:"left",background:"#172033",color:"#fff",fontSize:10,textTransform:"uppercase",letterSpacing:".04em"},
  td:{padding:"10px 11px",borderTop:"1px solid #e2e8f0",fontSize:12,verticalAlign:"middle"},
  resultInput:{width:120,padding:"9px 10px",border:"1px solid #cbd5e1",borderRadius:7,fontWeight:700,boxSizing:"border-box"},
  calculatedInput:{background:"#f8fafc",color:"#475569"},
  calculated:{display:"block",marginTop:3,color:"#64748b",fontSize:9},
  rangeLabel:{display:"block",marginTop:3,color:"#64748b",fontSize:9},
  warning:{display:"flex",gap:8,margin:"12px 18px",padding:10,borderRadius:8,background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b",fontSize:11},
  footer:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"14px 18px 18px",fontSize:10,color:"#64748b"},
  actions:{display:"flex",gap:8},
  primary:{display:"inline-flex",alignItems:"center",gap:7,border:0,borderRadius:8,padding:"10px 14px",background:"#176b9d",color:"#fff",fontWeight:800,cursor:"pointer"},
  secondary:{border:"1px solid #cbd5e1",borderRadius:8,padding:"10px 13px",background:"#fff",color:"#334155",fontWeight:700,cursor:"pointer"},
};
