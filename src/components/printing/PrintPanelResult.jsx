import React, { useMemo } from "react";
import PrintPage from "./PrintPage";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const firstValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && !value.trim()) continue;
    return value;
  }
  return "";
};

const parseResult = (value) => {
  if (value === null || value === undefined) return {};
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return {};
};

const prettyTitle = (name) => {
  const n = normalize(name);
  if (n === "lft" || n.includes("liver function")) return "LIVER FUNCTION TEST";
  if (n === "rft" || n === "kft" || n.includes("renal function")) return "RENAL FUNCTION TEST";
  if (n === "flp" || n.includes("lipid profile")) return "LIPID PROFILE";
  if (n === "cbc" || n === "fbc" || n.includes("full blood count")) return "FULL BLOOD COUNT";
  if (n.includes("coagulation")) return "COAGULATION PROFILE";
  if (n.includes("iron profile") || n.includes("iron studies")) return "IRON PROFILE";
  if (n.includes("electrolyte")) return "SERUM ELECTROLYTES";
  if (n.includes("bilirubin")) return "SERUM BILIRUBIN";
  if (n.includes("calcium")) return "SERUM CALCIUM";
  return String(name || "LABORATORY PANEL").toUpperCase();
};

const rowsFrom = (results) => {
  const rows = [];

  (Array.isArray(results) ? results : []).forEach((report) => {
    const data = parseResult(
      report?.result ??
      report?.result_data ??
      report?.resultData
    );

    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (data.parameter !== undefined || data.result !== undefined) {
        rows.push({
          parameter: firstValue(data.parameter, report?.test_type, report?.test_name),
          result: firstValue(data.result, ""),
          unit: firstValue(data.unit, data.result_unit, ""),
          referenceRange: firstValue(
            data.reference_range,
            data.referenceRange,
            report?.reference_range,
            report?.referenceRange,
            ""
          ),
          flag: firstValue(data.flag, report?.flag, ""),
        });
        return;
      }

      Object.entries(data).forEach(([parameter, value]) => {
        if (value && typeof value === "object") {
          rows.push({
            parameter,
            result: firstValue(value.result, value.value, ""),
            unit: firstValue(value.unit, value.result_unit, ""),
            referenceRange: firstValue(
              value.reference_range,
              value.referenceRange,
              ""
            ),
            flag: firstValue(value.flag, ""),
          });
        }
      });
    }
  });

  return rows;
};

const flagClass = (flag) => {
  const value = normalize(flag);
  if (value.includes("critical")) return "pefa-flag pefa-flag--critical";
  if (value.includes("high")) return "pefa-flag pefa-flag--high";
  if (value.includes("low")) return "pefa-flag pefa-flag--low";
  return "pefa-flag";
};

export default function PrintPanelResult({
  results = [],
  patient = {},
  panelName = "",
  department = "",
}) {
  const rows = useMemo(() => rowsFrom(results), [results]);
  if (!rows.length) return null;

  const title = prettyTitle(panelName || results[0]?.panel_name || results[0]?.test_type);

  return (
    <PrintPage className="pefa-panel-page">
      <header className="pefa-section-heading">
        <div className="pefa-section-heading__department">
          {department || results[0]?.department || "LABORATORY"}
        </div>
        <h2>{title}</h2>
      </header>

      <table className="pefa-result-table pefa-result-table--panel">
        <thead>
          <tr>
            <th>PARAMETER</th>
            <th>RESULT</th>
            <th>UNIT</th>
            <th>REFERENCE RANGE</th>
            <th>FLAG</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.parameter}-${index}`}>
              <td>{row.parameter}</td>
              <td className="pefa-result-value">{row.result || "—"}</td>
              <td>{row.unit || "—"}</td>
              <td>{row.referenceRange || "—"}</td>
              <td>
                <span className={flagClass(row.flag)}>
                  {row.flag || ""}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pefa-report-note">
        <strong>Patient:</strong>{" "}
        {firstValue(patient?.patient_name, patient?.name, "")}
      </div>
    </PrintPage>
  );
}
