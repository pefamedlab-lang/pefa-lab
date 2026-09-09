/*
 * PEFA PRINT DATA NORMALIZER
 * Shared by dedicated panel printers.
 * It displays saved values; it does not calculate or mutate them.
 */

export const isObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);

export const first = (...values) => {
  for (const v of values) {
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return "";
};

export const text = (v) =>
  v === null || v === undefined || String(v).trim() === "" ? "—" : String(v);

export const numberLike = (v) => {
  if (v === null || v === undefined || String(v).trim() === "") return "";
  return String(v);
};

export const humanizeKey = (v) =>
  String(v ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());

export const primitive = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  return "";
};

export const displayValue = (value, fallback = "") => {
  const p = primitive(value);
  if (p !== "") return p;
  if (Array.isArray(value)) return value.map((x) => displayValue(x)).filter(Boolean).join(", ");
  if (isObject(value)) {
    const parts = Object.entries(value)
      .map(([k, v]) => {
        const pv = primitive(v);
        return pv === "" ? "" : `${humanizeKey(k)}: ${pv}`;
      })
      .filter(Boolean);
    return parts.join(" • ");
  }
  return fallback || "—";
};

export const extractParameters = (row = {}) => {
  const containers = [
    row.parameters, row.parameter_results, row.parameterResults,
    row.results, row.result_data, row.resultData,
    row.values, row.analytes, row.analyte_results,
  ];
  for (const c of containers) {
    if (Array.isArray(c) && c.length) return c;
    if (isObject(c) && Object.keys(c).length) {
      return Object.entries(c).map(([key, value]) =>
        isObject(value) ? { key, ...value } : { key, result: value }
      );
    }
  }
  return [];
};

export const parameterName = (p = {}) =>
  first(
    p.parameter_name, p.parameterName, p.test_name, p.testName,
    p.name, p.label, p.parameter, p.key, p.code
  );

export const savedResult = (p = {}) =>
  first(
    p.result, p.result_value, p.resultValue, p.result_numeric,
    p.value, p.observed_value, p.observedValue, p.answer
  );

export const unit = (p = {}) =>
  first(p.unit, p.result_unit, p.resultUnit, p.uom, p.units);

export const referenceRange = (p = {}) =>
  first(
    p.reference_range, p.referenceRange, p.reference,
    p.ref_range, p.refRange, p.normal_range, p.normalRange
  );

export const flag = (p = {}) =>
  first(p.flag, p.result_flag, p.resultFlag, p.abnormal_flag, p.abnormalFlag);

export const flattenRowParameters = (row = {}) => {
  const params = extractParameters(row);
  if (params.length) return params;

  const name = parameterName(row);
  const value = savedResult(row);
  if (name || value !== "") return [row];
  return [];
};
