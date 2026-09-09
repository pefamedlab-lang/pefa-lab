/*
 * PEFA ENTERPRISE LIS
 * PrintChemistryPanel.jsx
 *
 * Dedicated renderer for ChemistryPanelResultEntry.jsx.
 * The selected report supplies the rows. This file only renders them.
 *
 * IMPORTANT:
 * - no Supabase
 * - no report grouping
 * - no recalculation
 * - no JSON result output
 */

import React from "react";
import PEFAFormalReportShell from "./PEFAFormalReportShell";
import {
  text, parameterName, savedResult, unit, referenceRange, flag,
  displayValue, flattenRowParameters, first
} from "./printResultUtils";

const flagClass = (value) => {
  const f = String(value || "").toUpperCase();
  if (f.includes("CRIT")) return "crit";
  if (f.includes("HIGH") || f === "H") return "high";
  if (f.includes("LOW") || f === "L") return "low";
  return "";
};

export default function PrintChemistryPanel({
  report = {},
  rows,
  title,
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
  const sourceRows = Array.isArray(rows) ? rows : (Array.isArray(report.items) ? report.items : [report]);
  const parameters = sourceRows.flatMap(flattenRowParameters);

  const reportTitle = first(
    title, report.panel_name, report.panelName, report.test_name, report.testName
  ) || "CHEMICAL PATHOLOGY";

  return (
    <PEFAFormalReportShell
      report={report}
      title={reportTitle}
      department={first(report.department, "Chemical Pathology")}
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
      <table className="pefa-results-table">
        <thead>
          <tr>
            <th>Parameter</th><th>Result</th><th>Unit</th><th>Reference Range</th><th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((p, i) => {
            const f = flag(p);
            return (
              <tr key={`${parameterName(p)}-${i}`}>
                <td><b>{text(parameterName(p))}</b></td>
                <td>{displayValue(savedResult(p))}</td>
                <td>{text(unit(p))}</td>
                <td>{text(referenceRange(p))}</td>
                <td className={flagClass(f)}>{text(f)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <style>{`
        .pefa-results-table { width:100%; border-collapse:collapse; font-size:9.5pt; }
        .pefa-results-table th,.pefa-results-table td { border:1px solid #222; padding:2.2mm; vertical-align:middle; }
        .pefa-results-table th { text-align:left; font-size:8pt; text-transform:uppercase; }
        .pefa-results-table td:nth-child(2) { font-weight:700; }
        .pefa-results-table .high,.pefa-results-table .low,.pefa-results-table .crit { font-weight:800; }
      `}</style>
    </PEFAFormalReportShell>
  );
}
