/*
 * PEFA ENTERPRISE LIS
 * PrintUrinalysis.jsx
 *
 * Dedicated special-result printer.
 * This component renders the saved payload supplied by the selected
 * report. It does NOT use PrintRouter, Supabase, grouping, or JSON dumps.
 */

import React from "react";
import PEFAFormalReportShell from "./PEFAFormalReportShell";
import { first, text, readable, fields, resultObject } from "./PrintSpecialUtils";

const KNOWN_FIELDS = ['colour', 'color', 'appearance', 'ph', 'specific_gravity', 'protein', 'glucose', 'ketone', 'bilirubin', 'urobilinogen', 'nitrite', 'blood', 'leukocytes', 'pus_cells', 'rbc', 'epithelial_cells', 'casts', 'crystals', 'bacteria'];

export default function PrintUrinalysis({
  report = {},
  rows,
  printMode = "full",
  clinicalHistory,
  interpretation,
  resultEnteredBy,
  authorizedBy,
  verificationId,
  verificationStatus,
  releasedBy,
  releasedAt,
}) {
  const source = Array.isArray(rows)
    ? rows
    : (Array.isArray(report.items) ? report.items : [report]);

  const row = source[0] || report;
  const payload = resultObject(row);

  const entries = Object.entries(payload).filter(([key, value]) =>
    !["id","created_at","updated_at","status","result_type"].includes(key) &&
    (typeof value !== "object" || value === null)
  );

  const direct = fields(row, [
    "id","created_at","updated_at","lab_number","labNumber",
    "patient_id","patientId","test_id","master_test_id",
    "result","result_value","result_numeric","value",
    "result_data","resultData","result_flag","flag",
    "reference_range","referenceRange","unit"
  ]);

  const displayed = entries.length
    ? entries.map(([key, value]) => ({ name: key.replace(/[_-]+/g, " "), value: readable(value) }))
    : direct.filter((x) => !["Department","Test Name"].includes(x.name));

  return (
    <PEFAFormalReportShell
      report={report}
      title={first(titleFallback(), report.test_name, report.testName, "ROUTINE URINALYSIS")}
      department={first(report.department, "Clinical Laboratory")}
      printMode={printMode}
      clinicalHistory={clinicalHistory || first(report.clinical_history, report.clinicalHistory)}
      interpretation={interpretation || first(report.interpretation, report.interpretation_text)}
      resultEnteredBy={resultEnteredBy || first(report.result_entered_by, report.entered_by)}
      authorizedBy={authorizedBy || first(report.authorized_by, report.authorizedBy)}
      verificationId={verificationId || first(report.verification_id, report.verificationId)}
      verificationStatus={verificationStatus || first(report.status)}
      releasedBy={releasedBy || first(report.released_by, report.releasedBy)}
      releasedAt={releasedAt || first(report.released_at, report.releasedAt)}
    >
      <table className="pefa-special-table">
        <thead><tr><th>Examination / Parameter</th><th>Result</th></tr></thead>
        <tbody>
          {displayed.map((item, index) => (
            <tr key={`${item.name}-${index}`}>
              <td><b>{text(item.name)}</b></td>
              <td>{text(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .pefa-special-table {
          width:100%;
          border-collapse:collapse;
          font-size:9.5pt;
        }
        .pefa-special-table th,
        .pefa-special-table td {
          border:1px solid #222;
          padding:2.5mm;
          text-align:left;
          vertical-align:top;
        }
        .pefa-special-table th {
          font-size:8pt;
          text-transform:uppercase;
        }
      `}</style>
    </PEFAFormalReportShell>
  );

  function titleFallback() {
    return "ROUTINE URINALYSIS";
  }
}
