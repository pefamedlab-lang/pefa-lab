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

const testName = (row) =>
  firstValue(
    row?.test_name,
    row?.testName,
    row?.parameter,
    row?.parameter_name,
    row?.name,
    row?.test_type,
    "Laboratory Test"
  );

const getRows = (results) => {
  const rows = [];

  (Array.isArray(results) ? results : []).forEach((report) => {
    const data = parseResult(
      report?.result ??
      report?.result_data ??
      report?.resultData
    );

    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      (data.parameter !== undefined || data.result !== undefined)
    ) {
      rows.push({
        parameter: firstValue(data.parameter, testName(report)),
        result: firstValue(data.result, ""),
        unit: firstValue(data.unit, data.result_unit, report?.unit, ""),
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

    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data)
    ) {
      const entries = Object.entries(data);

      if (entries.length) {
        entries.forEach(([parameter, value]) => {
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
          } else {
            rows.push({
              parameter,
              result: firstValue(value, ""),
              unit: firstValue(report?.unit, ""),
              referenceRange: firstValue(
                report?.reference_range,
                report?.referenceRange,
                ""
              ),
              flag: firstValue(report?.flag, ""),
            });
          }
        });
        return;
      }
    }

    rows.push({
      parameter: testName(report),
      result: firstValue(
        report?.result_value,
        report?.value,
        data?.result,
        ""
      ),
      unit: firstValue(report?.unit, data?.unit, ""),
      referenceRange: firstValue(
        report?.reference_range,
        report?.referenceRange,
        data?.reference_range,
        data?.referenceRange,
        ""
      ),
      flag: firstValue(report?.flag, data?.flag, ""),
    });
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

export default function PrintSingleTestGroup({
  results = [],
  patient = {},
  title = "LABORATORY RESULTS",
  department = "",
}) {
  const rows = useMemo(() => getRows(results), [results]);

  if (!rows.length) return null;

  return (
    <PrintPage className="pefa-single-group">
      <header className="pefa-section-heading">
        <div className="pefa-section-heading__department">
          {department || "LABORATORY"}
        </div>
        <h2>{title}</h2>
      </header>

      <table className="pefa-result-table">
        <thead>
          <tr>
            <th>TEST / PARAMETER</th>
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
