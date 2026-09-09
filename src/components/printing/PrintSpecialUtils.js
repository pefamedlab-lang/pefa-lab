/*
 * PEFA FRESH SPECIAL PRINTING UTILITIES
 * Renders saved structured payloads as readable laboratory values.
 * Never calculates, groups, mutates, or persists results.
 */

export const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export const first = (...values) => {
  for (const v of values) {
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return "";
};

export const text = (v) =>
  v === null || v === undefined || String(v).trim() === "" ? "—" : String(v);

export const humanize = (key) =>
  String(key ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());

export const primitive = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" || typeof v === "number") return String(v);
  return "";
};

export const readable = (v) => {
  const p = primitive(v);
  if (p !== "") return p;
  if (Array.isArray(v)) return v.map(readable).filter(Boolean).join(", ");
  if (isObject(v)) {
    return Object.entries(v)
      .map(([k, val]) => {
        const x = primitive(val);
        return x === "" ? "" : `${humanize(k)}: ${x}`;
      })
      .filter(Boolean)
      .join(" • ");
  }
  return "—";
};

export const fields = (obj = {}, excluded = []) =>
  Object.entries(obj)
    .filter(([k, v]) => !excluded.includes(k) && primitive(v) !== "")
    .map(([k, v]) => ({ name: humanize(k), value: primitive(v) }));

export const resultObject = (row = {}) => {
  const containers = [
    row.result_data, row.resultData, row.result,
    row.result_value, row.value, row.results,
    row.parameters, row.parameter_results, row.parameterResults
  ];
  for (const c of containers) if (isObject(c)) return c;
  return {};
};
