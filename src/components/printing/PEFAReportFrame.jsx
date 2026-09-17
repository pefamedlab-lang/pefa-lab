import React from "react";
import PEFADigitalLetterhead from "./PEFADigitalLetterhead";
import PEFAReportFooter from "./PEFAReportFooter";

export default function PEFAReportFrame({
  verificationId = "PEFA",
  children,
  showLetterhead = true,
}) {
  return (
    <article
      className={`pefa-report-document ${
        showLetterhead ? "is-digital" : "is-preprinted"
      }`}
    >
      {showLetterhead && (
        <PEFADigitalLetterhead
          verificationId={verificationId}
        />
      )}

      <div className="pefa-report-content">
        {children}
      </div>

      {showLetterhead && <PEFAReportFooter />}
    </article>
  );
}