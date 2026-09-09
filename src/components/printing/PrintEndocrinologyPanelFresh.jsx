/*
 * PEFA ENTERPRISE LIS
 * PrintEndocrinologyPanelFresh.jsx
 *
 * Dedicated renderer for EndocrinePanelResultEntry.jsx.
 * Saved/reference/flag fields are displayed as supplied.
 */

import React from "react";
import PEFAFormalReportShell from "./PEFAFormalReportShell";
import {
  text, parameterName, savedResult, unit, referenceRange, flag,
  displayValue, flattenRowParameters, first
} from "./printResultUtils";

export default function PrintEndocrinologyPanelFresh(props) {
  const {
    report = {}, rows,
    title, printMode = "full",
    clinicalHistory, interpretation,
    resultEnteredBy, authorizedBy, verificationId,
    verificationStatus, releasedBy, releasedAt,
  } = props;

  const sourceRows = Array.isArray(rows) ? rows : (Array.isArray(report.items) ? report.items : [report]);
  const parameters = sourceRows.flatMap(flattenRowParameters);

  return (
    <PEFAFormalReportShell
      report={report}
      title={first(title, report.panel_name, report.panelName, report.test_name, report.testName, "ENDOCRINOLOGY REPORT")}
      department="Endocrinology"
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
        <thead><tr><th>Parameter</th><th>Result</th><th>Unit</th><th>Reference Range</th><th>Flag</th></tr></thead>
        <tbody>
          {parameters.map((p, i) => (
            <tr key={`${parameterName(p)}-${i}`}>
              <td><b>{text(parameterName(p))}</b></td>
              <td>{displayValue(savedResult(p))}</td>
              <td>{text(unit(p))}</td>
              <td>{text(referenceRange(p))}</td>
              <td>{text(flag(p))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .pefa-results-table{width:100%;border-collapse:collapse;font-size:9.5pt}
        .pefa-results-table th,.pefa-results-table td{border:1px solid #222;padding:2.2mm;text-align:left}
        .pefa-results-table th{font-size:8pt;text-transform:uppercase}
      `}</style>
    </PEFAFormalReportShell>
  );
}
