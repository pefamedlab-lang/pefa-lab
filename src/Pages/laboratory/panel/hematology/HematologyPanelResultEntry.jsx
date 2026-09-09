/*
 * PEFA LAB — HEMATOLOGY PANEL RESULT ENTRY
 *
 * CBC / Coagulation Profile / Iron Profile
 *
 * CBC RULE:
 * MCV, MCH and MCHC are analyser-entry fields.
 * Their formulas are fallback-only and NEVER overwrite an
 * existing analyser/manual value.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPanelParameters } from "../../../../services/laboratory/panelParameterService";
import { normalizeText } from "../../../../services/laboratory/quantitativeResultMetadata";

const firstValue = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== "") return value;
  }
  return "";
};

const numberValue = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
};

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const normName = (v) => normalizeText(v).replace(/\s+/g, " ").trim();

const parameterKey = (p = {}) =>
  String(firstValue(
    p.key, p.parameter_key, p.id, p.test_id, p.test_name, p.testName,
    p.parameter_name, p.parameterName, p.name, p.label
  ))
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const parameterName = (p = {}) => firstValue(
  p.name, p.test_name, p.testName, p.parameter_name,
  p.parameterName, p.label, p.key, "Unnamed Parameter"
);

const ANALYSER_ENTRY_CALCULABLE = ["mcv", "mch", "mchc"];


const CBC_REQUIRED_METADATA = {
  wbc: { unit: "×10⁹/L", reference_range: "4.0 - 11.0" },
  "neutrophils": { unit: "%", reference_range: "40 - 75" },
  "lymphocytes": { unit: "%", reference_range: "20 - 45" },
  "monocytes": { unit: "%", reference_range: "2 - 10" },
  "eosinophils": { unit: "%", reference_range: "1 - 6" },
  "basophils": { unit: "%", reference_range: "0 - 1" },
  "platelet count": { unit: "×10⁹/L", reference_range: "150 - 450" },
  mcv: { unit: "fL", reference_range: "80 - 100" },
  mch: { unit: "pg", reference_range: "27 - 33" },
  mchc: { unit: "g/dL", reference_range: "32 - 36" },
  "rdw-cv": { unit: "%", reference_range: "11.5 - 14.5" },
  "rdw-sd": { unit: "fL", reference_range: "39 - 46" },
};

const CBC_REQUIRED_PARAMETERS = [
  ["wbc", "WBC"],
  ["neutrophils", "Neutrophils"],
  ["lymphocytes", "Lymphocytes"],
  ["monocytes", "Monocytes"],
  ["eosinophils", "Eosinophils"],
  ["basophils", "Basophils"],
  ["platelet count", "Platelet Count"],
  ["mcv", "MCV"],
  ["mch", "MCH"],
  ["mchc", "MCHC"],
  ["rdw-cv", "RDW-CV"],
  ["rdw-sd", "RDW-SD"],
];

const enrichCBCParameter = (parameter = {}) => {
  const name = normName(
    parameter.name || parameter.test_name || parameter.parameter_name || parameter.key
  );
  const meta = CBC_REQUIRED_METADATA[name];
  if (!meta) return parameter;

  return {
    ...parameter,
    unit: firstValue(parameter.unit, parameter.result_unit, meta.unit),
    result_unit: firstValue(parameter.result_unit, parameter.unit, meta.unit),
    reference_range: firstValue(
      parameter.reference_range,
      parameter.referenceRange,
      parameter.reference_value,
      meta.reference_range
    ),
    reference_value: firstValue(parameter.reference_value, meta.reference_range),
  };
};

const ensureCBCParameters = (rows = []) => {
  const existing = new Map(
    rows.map((row) => [normName(row.name || row.test_name || row.key), row])
  );

  const output = rows.map(enrichCBCParameter);

  CBC_REQUIRED_PARAMETERS.forEach(([key, name]) => {
    if (existing.has(key)) return;
    const meta = CBC_REQUIRED_METADATA[key];
    if (!meta) return;

    output.push({
      key,
      name,
      test_name: name,
      parameter_name: name,
      unit: meta.unit,
      result_unit: meta.unit,
      reference_range: meta.reference_range,
      reference_value: meta.reference_range,
      calculated: false,
      readOnly: false,
      display_order: output.length + 1,
    });
  });

  return output;
};



const ABSOLUTE_DIFFERENTIALS = [
  "neutrophils absolute", "absolute neutrophils",
  "lymphocytes absolute", "absolute lymphocytes",
  "monocytes absolute", "absolute monocytes",
  "eosinophils absolute", "absolute eosinophils",
  "basophils absolute", "absolute basophils",
];

const isAnalyserEntryCalculable = (p) =>
  ANALYSER_ENTRY_CALCULABLE.includes(normName(parameterName(p)));

const isAbsoluteDifferential = (p) =>
  ABSOLUTE_DIFFERENTIALS.includes(normName(parameterName(p)));

const isCalculatedParameter = (p) => {
  if (isAnalyserEntryCalculable(p)) return false;
  if (p.calculated === true || p.isCalculated === true || p.readOnly === true || p.read_only === true) return true;
  return isAbsoluteDifferential(p);
};

const normalizeParameter = (parameter = {}, index = 0) => {
  const nested = parameter.master_tests || parameter.master_test || parameter.masterTest || parameter.test || null;
  const source = isObject(nested)
    ? {
        ...parameter,
        ...nested,
        panel_test_id: parameter.panel_test_id ?? parameter.id,
        test_id: parameter.test_id ?? nested.id,
        display_order: parameter.display_order ?? nested.display_order,
      }
    : parameter;

  const key = parameterKey(source);
  if (!key) return null;

  const analyserEntryCalculable = isAnalyserEntryCalculable(source);
  const calculated = isCalculatedParameter(source);

  return {
    ...source,
    key,
    name: parameterName(source),
    test_name: firstValue(source.test_name, source.name, source.label),
    unit: firstValue(source.unit, source.units, source.result_unit, source.resultUnit, source.reporting_unit, source.reportingUnit),
    result_unit: firstValue(source.result_unit, source.resultUnit, source.unit, source.units),
    reporting_unit: firstValue(source.reporting_unit, source.reportingUnit, source.unit, source.units),
    reference_range: firstValue(
      source.reference_range, source.referenceRange, source.normal_range,
      source.normalRange, source.reference_value, source.referenceValue
    ),
    reference_value: firstValue(
      source.reference_value, source.referenceValue, source.reference_range,
      source.referenceRange, source.normal_range, source.normalRange
    ),
    male_range: firstValue(source.male_range, source.maleRange),
    female_range: firstValue(source.female_range, source.femaleRange),
    child_range: firstValue(source.child_range, source.childRange),
    elderly_range: firstValue(source.elderly_range, source.elderlyRange),
    critical_low: firstValue(source.critical_low, source.criticalLow),
    critical_high: firstValue(source.critical_high, source.criticalHigh),
    display_order: source.display_order ?? index + 1,

    analyser_entry_calculable: analyserEntryCalculable,

    /* MCV/MCH/MCHC deliberately remain editable. */
    calculated: analyserEntryCalculable ? false : calculated,
    readOnly: analyserEntryCalculable ? false : calculated,
    read_only: analyserEntryCalculable ? false : calculated,
  };
};

const normalizeAnalytes = (rows = []) => {
  const map = new Map();
  if (!Array.isArray(rows)) return [];

  rows.forEach((row, index) => {
    const p = normalizeParameter(row, index);
    if (!p) return;

    const existing = map.get(p.key);
    map.set(p.key, existing
      ? {
          ...existing,
          ...p,
          display_order: existing.display_order ?? p.display_order,
          analyser_entry_calculable:
            existing.analyser_entry_calculable || p.analyser_entry_calculable,
        }
      : p);
  });

  return Array.from(map.values()).sort((a, b) => {
    const ao = Number(a.display_order), bo = Number(b.display_order);
    if (Number.isFinite(ao) && Number.isFinite(bo)) return ao - bo;
    if (Number.isFinite(ao)) return -1;
    if (Number.isFinite(bo)) return 1;
    return String(a.name).localeCompare(String(b.name));
  });
};

const extractExistingParameters = (result) => {
  if (!isObject(result)) return {};
  const source = result.parameters || result.parameter_results ||
    result.result_parameters || result.results || {};
  return isObject(source) ? source : {};
};

const getExistingParameter = (source, parameter) => {
  if (!isObject(source)) return {};

  const candidates = [
    parameter.key, parameter.id, parameter.test_id,
    parameter.name, parameter.test_name,
  ].filter((v) => v !== null && v !== undefined);

  for (const candidate of candidates) {
    const value = source[candidate];
    if (isObject(value)) return value;
    if (value !== undefined && value !== null) return { value };
  }

  const wanted = normName(parameter.name);
  for (const [key, value] of Object.entries(source)) {
    if (
      normName(key) === wanted ||
      normName(value?.name) === wanted ||
      normName(value?.test_name) === wanted
    ) {
      return isObject(value) ? value : { value };
    }
  }
  return {};
};

const parseRange = (value) => {
  const m = String(value ?? "").trim().match(/-?\d+(?:\.\d+)?/g);
  if (!m || m.length < 2) return { low: null, high: null };
  const a = Number(m[0]), b = Number(m[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return { low: null, high: null };
  return { low: Math.min(a, b), high: Math.max(a, b) };
};

const flagValue = (value, referenceRange) => {
  const n = numberValue(value);
  if (n === null || !referenceRange) return "";
  const { low, high } = parseRange(referenceRange);
  if (low === null && high === null) return "";
  if (low !== null && n < low) return "L";
  if (high !== null && n > high) return "H";
  return "N";
};

/*
 * Analyser-first CBC calculation:
 * an existing MCV/MCH/MCHC is preserved;
 * calculation is only supplied when the field is blank.
 */
const calculateCBC = (parameters) => {
  const output = { ...parameters };

  const get = (...names) => {
    const wanted = names.map(normName);
    for (const key of Object.keys(output)) {
      const item = output[key];
      if (wanted.includes(normName(item?.name || key))) {
        const n = numberValue(item?.value);
        if (n !== null) return { key, value: n };
      }
    }
    return null;
  };

  const wbc = get(
    "white blood cell", "white blood cells", "wbc",
    "total wbc", "total white blood cell", "total white blood cells",
    "leucocyte count", "leukocyte count"
  );

  const differentials = [
    ["neutrophils absolute", ["neutrophils", "neutrophil"]],
    ["lymphocytes absolute", ["lymphocytes", "lymphocyte"]],
    ["monocytes absolute", ["monocytes", "monocyte"]],
    ["eosinophils absolute", ["eosinophils", "eosinophil"]],
    ["basophils absolute", ["basophils", "basophil"]],
  ];

  if (wbc) {
    differentials.forEach(([absoluteName, percentageNames]) => {
      const pct = get(...percentageNames);
      const abs = get(absoluteName);
      if (pct && abs && numberValue(output[abs.key]?.value) === null) {
        output[abs.key] = {
          ...output[abs.key],
          value: Number((wbc.value * pct.value / 100).toFixed(2)),
          calculation_fallback: true,
        };
      }
    });
  }

  const hct = get("haematocrit", "hematocrit", "pcv", "hct");
  const rbc = get("red blood cell", "red blood cells", "rbc", "red cell count", "erythrocyte count");
  const hb = get("haemoglobin", "hemoglobin", "hb");

  const mcv = get("mcv");
  if (mcv && numberValue(output[mcv.key]?.value) === null && hct && rbc && rbc.value !== 0) {
    output[mcv.key] = {
      ...output[mcv.key],
      value: Number((hct.value / rbc.value * 10).toFixed(2)),
      calculation_fallback: true,
    };
  }

  const mch = get("mch");
  if (mch && numberValue(output[mch.key]?.value) === null && hb && rbc && rbc.value !== 0) {
    output[mch.key] = {
      ...output[mch.key],
      value: Number((hb.value / rbc.value * 10).toFixed(2)),
      calculation_fallback: true,
    };
  }

  const mchc = get("mchc");
  if (mchc && numberValue(output[mchc.key]?.value) === null && hb && hct && hct.value !== 0) {
    output[mchc.key] = {
      ...output[mchc.key],
      value: Number((hb.value / hct.value * 100).toFixed(2)),
      calculation_fallback: true,
    };
  }

  return output;
};

const resolveReference = (parameter, age, sex, current) => {
  const manual = firstValue(current?.manual_reference_range, current?.manualReferenceRange);
  if (manual) return manual;

  if (age !== null && age < 18 && parameter.child_range) return parameter.child_range;
  if (age !== null && age >= 65 && parameter.elderly_range) return parameter.elderly_range;

  if (["male", "m"].includes(sex) && parameter.male_range) return parameter.male_range;
  if (["female", "f"].includes(sex) && parameter.female_range) return parameter.female_range;

  return firstValue(parameter.reference_range, parameter.reference_value);
};

export default function HematologyPanelResultEntry({
  title = "Hematology Panel",
  panelName = "",
  analytes = [],
  parameters = [],
  panelParameters = [],
  patient = null,
  registration = null,
  test = null,
  result = null,
  initialResult = null,
  existingResult = null,
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
  const suppliedAnalytes = useMemo(() => {
    const candidates = [analytes, parameters, panelParameters];
    const supplied = candidates.find((c) => Array.isArray(c) && c.length) || [];
    return ensureCBCParameters(supplied);
  }, [analytes, parameters, panelParameters]);

  const resolvedPanelName = useMemo(() => {
    const raw = panelName || test?.panel_name || test?.panelName ||
      test?.test_name || test?.testName || title || "";
    const n = normalizeText(raw);
    if (n.includes("full blood") || n.includes("complete blood") || n === "cbc" || n === "fbc")
      return "Complete Blood Count";
    if (n.includes("coagulation") || n.includes("coag profile"))
      return "Coagulation Profile";
    if (n.includes("iron profile") || n === "iron studies")
      return "Iron Profile";
    return String(raw).trim();
  }, [panelName, test?.panel_name, test?.panelName, test?.test_name, test?.testName, title]);

  const panelId =
    test?.panel_id ?? test?.panelId ??
    test?.masterTest?.panel_id ?? test?.master_test?.panel_id ?? null;

  const sourceResult = result || initialResult || existingResult || {};
  const [databaseAnalytes, setDatabaseAnalytes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    getPanelParameters({
      test,
      panelName: resolvedPanelName,
      panelId,
      demographics: {
        sex: patient?.sex || patient?.gender || registration?.sex || registration?.gender,
        age: patient?.age ?? patient?.patient_age ?? registration?.age ?? registration?.patient_age ?? null,
      },
    })
      .then((response) => {
        if (cancelled) return;
        const rows = Array.isArray(response?.parameters)
          ? response.parameters
          : Array.isArray(response?.data) ? response.data : [];
        setDatabaseAnalytes(rows);
        if (!rows.length && !suppliedAnalytes.length) setLoadError(response?.error || `No parameters found for ${resolvedPanelName}.`);
      })
      .catch((error) => {
        if (cancelled) return;
        setDatabaseAnalytes([]);
        setLoadError(error?.message || `Unable to load parameters for ${resolvedPanelName}.`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [
    resolvedPanelName, panelId, test,
    patient?.sex, patient?.gender, patient?.age, patient?.patient_age,
    registration?.sex, registration?.gender, registration?.age, registration?.patient_age,
  ]);

  const effectiveAnalytes = useMemo(
    () => normalizeAnalytes(ensureCBCParameters([...suppliedAnalytes, ...databaseAnalytes])),
    [suppliedAnalytes, databaseAnalytes]
  );

  const displayAnalytes = useMemo(
    () => effectiveAnalytes.filter((p) => !isAbsoluteDifferential(p)),
    [effectiveAnalytes]
  );

  const buildInitialState = useCallback(() => {
    const existing = extractExistingParameters(sourceResult);
    const state = {};

    effectiveAnalytes.forEach((parameter) => {
      const old = getExistingParameter(existing, parameter);
      const oldValue = firstValue(old?.value, old?.result, "");

      state[parameter.key] = {
        ...parameter,
        ...old,
        key: parameter.key,
        name: parameter.name,
        value: oldValue,

        /*
         * Explicitly restore analyser-entry status after spreading
         * old database/result data.
         */
        analyser_entry_calculable:
          parameter.analyser_entry_calculable === true,

        calculated:
          parameter.analyser_entry_calculable
            ? false
            : parameter.calculated || old?.calculated === true,

        readOnly:
          parameter.analyser_entry_calculable
            ? false
            : parameter.readOnly || old?.readOnly === true,
      };
    });

    return state;
  }, [effectiveAnalytes, sourceResult]);

  const [values, setValues] = useState({});
  const initializedSignatureRef = useRef("");
  const lastPublishedRef = useRef("");

  useEffect(() => {
    const signature = JSON.stringify({
      panel: resolvedPanelName,
      parameterKeys: effectiveAnalytes.map((p) => p.key),
      result: sourceResult,
    });

    if (initializedSignatureRef.current === signature) return;

    initializedSignatureRef.current = signature;
    setValues(buildInitialState());
    lastPublishedRef.current = "";
  }, [resolvedPanelName, effectiveAnalytes, sourceResult, buildInitialState]);

  const calculatedValues = useMemo(() => {
    const current = Object.fromEntries(
      Object.values(values).map((item) => [item.key, item])
    );

    try {
      return calculateCBC(current);
    } catch (error) {
      console.error("[PEFA HEMATOLOGY] Calculation error:", error);
      return current;
    }
  }, [values]);

  const patientSex = normalizeText(
    patient?.sex || patient?.gender || registration?.sex || registration?.gender || ""
  );

  const patientAge = numberValue(
    patient?.age ?? patient?.patient_age ??
    registration?.age ?? registration?.patient_age
  );

  const rows = useMemo(
    () => displayAnalytes.map((parameter) => {
      const current = values[parameter.key] || parameter;
      const analyserEntry = current.analyser_entry_calculable === true;
      const calculated = !analyserEntry && (current.calculated || current.readOnly);

      const storedValue = current.value ?? "";
      const fallbackValue = calculatedValues[current.key]?.value ?? "";

      /*
       * Analyser-first:
       * entered MCV/MCH/MCHC wins;
       * fallback calculation is used only when blank.
       */
      const value = analyserEntry
        ? (String(storedValue).trim() !== "" ? storedValue : fallbackValue)
        : calculated
          ? (fallbackValue !== "" ? fallbackValue : storedValue)
          : storedValue;

      const referenceRange = resolveReference(parameter, patientAge, patientSex, current);

      return {
        ...parameter,
        ...current,
        value,
        unit: firstValue(current.unit, parameter.unit, current.result_unit, parameter.result_unit),
        referenceRange,
        flag: flagValue(value, referenceRange),
        analyser_entry_calculable: analyserEntry,
        calculated,
        readOnly: calculated,
      };
    }),
    [displayAnalytes, values, calculatedValues, patientAge, patientSex]
  );

  const interpretation = useMemo(() => {
    const abnormal = rows.filter((r) => r.flag === "H" || r.flag === "L");
    if (!rows.some((r) => numberValue(r.value) !== null)) return "";

    if (!abnormal.length)
      return "Haematology results reviewed. No abnormal parameters identified based on the configured reference ranges.";

    return `Abnormal haematology parameters noted: ${abnormal
      .map((r) => `${r.name}: ${r.flag === "H" ? "High" : "Low"}`)
      .join("; ")}. Clinical correlation is advised.`;
  }, [rows]);

  const buildPayload = useCallback((nextRows = rows) => {
    const allRows = effectiveAnalytes.map((parameter) => {
      const visible = nextRows.find((r) => r.key === parameter.key);
      if (visible) return visible;

      const current = values[parameter.key] || parameter;
      const calc = calculatedValues[parameter.key]?.value;
      const value = String(current.value ?? "").trim() !== "" ? current.value : (calc ?? "");
      const referenceRange = resolveReference(parameter, patientAge, patientSex, current);

      return {
        ...parameter,
        ...current,
        value,
        unit: firstValue(current.unit, parameter.unit),
        referenceRange,
        flag: flagValue(value, referenceRange),
      };
    });

    const parameterResults = Object.fromEntries(
      allRows.map((row) => [row.key, {
        ...row,
        result: row.value ?? "",
        value: row.value ?? "",
        unit: row.unit ?? "",
        reference_range: row.referenceRange ?? "",
        referenceRange: row.referenceRange ?? "",
        flag: row.flag ?? "",
        result_flag: row.flag ?? "",
        analyser_entry_calculable: row.analyser_entry_calculable === true,
        calculation_fallback: row.calculation_fallback === true,
      }])
    );

    return {
      ...sourceResult,
      parameters: parameterResults,
      parameter_results: parameterResults,
      interpretation,
      patient,
      registration,
      test,
    };
  }, [
    rows, effectiveAnalytes, values, calculatedValues, patientAge, patientSex,
    sourceResult, interpretation, patient, registration, test,
  ]);

  const handleChange = useCallback((key, value) => {
    if (readOnly || disabled) return;

    setValues((current) => {
      const parameter = current[key];
      if (!parameter) return current;

      /*
       * MCV/MCH/MCHC are intentionally editable.
       */
      if (
        parameter.calculated &&
        !parameter.analyser_entry_calculable
      ) return current;

      if (
        parameter.readOnly &&
        !parameter.analyser_entry_calculable
      ) return current;

      return {
        ...current,
        [key]: {
          ...parameter,
          value,
          calculation_fallback: false,
        },
      };
    });
  }, [readOnly, disabled]);

  useEffect(() => {
    if (typeof onChange !== "function" || !effectiveAnalytes.length) return;

    const payload = buildPayload(rows);
    let serialized;

    try {
      serialized = JSON.stringify(payload);
    } catch {
      return;
    }

    if (lastPublishedRef.current === serialized) return;
    lastPublishedRef.current = serialized;
    onChange(payload);
  }, [rows, buildPayload, onChange, effectiveAnalytes.length]);

  const handleSave = useCallback(() => {
    const payload = buildPayload(rows);
    if (typeof onSave === "function") onSave(payload);
    if (typeof onSaved === "function") onSaved(payload);
  }, [buildPayload, rows, onSave, onSaved]);

  const locked = disabled || readOnly;

  return (
    <div
      className={`hematology-panel-result-entry ${className}`}
      style={{
        width: "100%",
        maxWidth: 860,
        border: "1px solid #d9e1ea",
        borderRadius: 10,
        background: "#fff",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div style={{
        padding: "12px 14px",
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              {resolvedPanelName || title}
            </div>
            {editMode && (
              <div style={{ marginTop: 3, fontSize: 10, color: "#2563eb", fontWeight: 700 }}>
                EDIT MODE — Review or update the panel results.
              </div>
            )}
          </div>
          {loading && <div style={{ fontSize: 10, color: "#64748b" }}>Loading...</div>}
        </div>

        {loadError && (
          <div style={{
            marginTop: 8,
            padding: 8,
            borderRadius: 7,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: 11,
          }}>
            {loadError}
          </div>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          minWidth: 650,
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}>
          <colgroup>
            <col style={{ width: "27%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "32%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>

          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={thStyle}>Parameter</th>
              <th style={thStyle}>Result</th>
              <th style={thStyle}>Unit</th>
              <th style={thStyle}>Reference Range</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Flag</th>
            </tr>
          </thead>

          <tbody>
            {loading && !rows.length && (
              <tr>
                <td colSpan={5} style={emptyStyle}>Loading hematology parameters...</td>
              </tr>
            )}

            {!loading && !rows.length && (
              <tr>
                <td colSpan={5} style={emptyStyle}>No hematology parameters found.</td>
              </tr>
            )}

            {rows.map((row) => {
              const editable = !locked &&
                (row.analyser_entry_calculable || (!row.calculated && !row.readOnly));

              const flagColor =
                row.flag === "H" ? "#dc2626" :
                row.flag === "L" ? "#2563eb" :
                row.flag === "N" ? "#15803d" : "#64748b";

              return (
                <tr key={row.key}>
                  <td style={tdStyle}>
                    <div style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }} title={row.name}>
                      {row.name}
                    </div>

                    {row.analyser_entry_calculable && (
                      <div style={{
                        marginTop: 1,
                        fontSize: 8,
                        color: "#64748b",
                      }}>
                        ANALYSER / FALLBACK
                      </div>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.value ?? ""}
                      readOnly={!editable}
                      disabled={!editable}
                      onChange={(e) => handleChange(row.key, e.target.value)}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        height: 32,
                        padding: "6px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        outline: "none",
                        background: editable ? "#fff" : "#f8fafc",
                        color: "#0f172a",
                        fontSize: 12,
                        boxSizing: "border-box",
                      }}
                    />
                  </td>

                  <td style={tdStyle}>{row.unit || "—"}</td>

                  <td style={tdStyle}>
                    {row.referenceRange || (
                      <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                        Not configured
                      </span>
                    )}
                  </td>

                  <td style={{
                    ...tdStyle,
                    textAlign: "center",
                    fontWeight: 800,
                    color: flagColor,
                  }}>
                    {row.flag || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {interpretation && (
        <div style={{
          padding: "10px 14px",
          borderTop: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}>
          <div style={{
            fontSize: 9,
            fontWeight: 800,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: ".05em",
            marginBottom: 4,
          }}>
            Interpretation
          </div>
          <div style={{
            fontSize: 11,
            color: "#334155",
            lineHeight: 1.45,
          }}>
            {interpretation}
          </div>
        </div>
      )}

      {(onSave || onSaved || onCancel || onBack) && (
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          padding: "10px 14px",
          borderTop: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}>
          {typeof onBack === "function" && (
            <button type="button" onClick={onBack} disabled={disabled} style={secondaryButtonStyle}>
              Back
            </button>
          )}

          {typeof onCancel === "function" && (
            <button type="button" onClick={onCancel} disabled={disabled} style={secondaryButtonStyle}>
              Cancel
            </button>
          )}

          {(typeof onSave === "function" || typeof onSaved === "function") && (
            <button
              type="button"
              onClick={handleSave}
              disabled={locked || loading || !rows.length}
              style={{
                ...primaryButtonStyle,
                opacity: locked || loading || !rows.length ? 0.55 : 1,
              }}
            >
              {editMode ? "Update Result" : "Save Result"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const emptyStyle = {
  padding: 24,
  textAlign: "center",
  color: "#64748b",
  fontSize: 11,
};

const thStyle = {
  padding: "8px 9px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 700,
  color: "#334155",
  borderBottom: "1px solid #cbd5e1",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "6px 9px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: 11,
  color: "#334155",
  verticalAlign: "middle",
};

const secondaryButtonStyle = {
  border: "none",
  borderRadius: 6,
  padding: "8px 13px",
  background: "#e2e8f0",
  color: "#334155",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 11,
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: 6,
  padding: "8px 15px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 11,
};
