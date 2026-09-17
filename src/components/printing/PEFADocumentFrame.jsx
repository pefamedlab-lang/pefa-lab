import React from "react";
import PEFADigitalLetterhead from "./PEFADigitalLetterhead";
import PEFAReportFooter from "./PEFAReportFooter";
import "../../styles/pefaReportPrinting.css";

/** Single document shell for all PEFA digital invoices, receipts and reports. */
export default function PEFADocumentFrame({ verificationId, children, className = "" }) {
  return (
    <article className={`pefa-report-document is-digital ${className}`.trim()}>
      <PEFADigitalLetterhead verificationId={verificationId} />
      <div className="pefa-report-content">{children}</div>
      <PEFAReportFooter />
    </article>
  );
}
