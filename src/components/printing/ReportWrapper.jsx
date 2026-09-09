import "../../styles/printing/printing.css";

import LetterHead from "./LetterHead";
import PatientHeader from "./PatientHeader";
import SignatureSection from "./SignatureSection";
import VerificationSection from "./VerificationSection";
import PrintFooter from "./PrintFooter";

export default function ReportWrapper({

  printMode = "internal",

  patient = {},

  results = [],

  children,

}) {

  /* ======================================================
     CURRENT REPORT
  ====================================================== */

  const report = results?.[0] ?? {};

  const hasResults = results.length > 0;

  /* ======================================================
     PRINT MODES
  ====================================================== */

  const isRecord = printMode === "record";
  const isPDF = printMode === "pdf";

  /* ======================================================
     PAGE
  ====================================================== */

  return (

    <article className={`report-page ${printMode}`}>

      {/* ==================================================
          LETTERHEAD
      ================================================== */}

      <div className="report-header-space">

        {!isRecord && <LetterHead />}

      </div>

      {/* ==================================================
          REPORT BODY
      ================================================== */}

      <main className="report-body">

        {/* ==============================================
            PATIENT INFORMATION
        ============================================== */}

        <section className="patient-section">

          <PatientHeader
            patient={patient}
            results={results}
          />

        </section>

        {/* ==============================================
            REPORT CONTENT
        ============================================== */}

        <section className="report-content compact">

          {children}

        </section>

        {/* ==============================================
            SIGNATURE
        ============================================== */}

        {hasResults && (

          <SignatureSection
            report={report}
          />

        )}

        {/* ==============================================
            VERIFICATION
        ============================================== */}

        {hasResults && (

          <VerificationSection
            report={report}
          />

        )}

      </main>

      {/* ==================================================
          ENTERPRISE FOOTER
      ================================================== */}

      <footer className="report-footer-space">

        {!isRecord && (

          <PrintFooter />

        )}

      </footer>

      {/* ==================================================
          PDF WATERMARK
      ================================================== */}

      {isPDF && (

        <div className="report-watermark">

          AUTHORIZED COPY

        </div>

      )}

    </article>

  );

}