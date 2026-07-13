import "./PrintStyles.css";

import LetterHead from "./LetterHead";
import PatientInfoSection from "./PatientInfoSection";
import DepartmentTitle from "./DepartmentTitle";
import TestTitle from "./TestTitle";
import InterpretationSection from "./InterpretationSection";
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

  const report = results?.[0] || {};

const hasResults = results.length > 0;

  /* ======================================================
   PRINT MODES
====================================================== */

const isLetterHead = printMode === "letterhead";

const isPortal = printMode === "portal";

const isRecord = printMode === "record";

const isPDF = printMode === "pdf";

const isFull = printMode === "full";

/* ======================================================
   DISPLAY RULES
====================================================== */

// Internal / Portal / PDF use the printed PEFA letterhead

// Result Records leave blank space for
// the laboratory's pre-printed letterhead

// Everything else is always shown
const showPatientInfo = true;
const showReportBody = true;
const showSignature = true;
const showVerification = true;
const showFooter = !isRecord;
const showWatermark = isPDF;

  /* ======================================================
     PAGE
  ====================================================== */

  return (

    <div
      id="print-root"
      className={`report-page ${printMode}`}
    >

      {/* ==================================================
    LETTERHEAD / PREPRINTED SPACE
================================================== */}

<LetterHead hidden={isRecord} />

      {/* ==================================================
          PATIENT INFORMATION
      ================================================== */}

      {showPatientInfo && (

        <PatientInfoSection

          patient={patient}

          report={report}

        />

      )}

      {/* ==================================================
          REPORT BODY
      ================================================== */}

      {showReportBody && (

        <main className="report-body">

          {/* ==============================================
              REPORT HEADING
          ============================================== */}

          <section className="report-heading">

            <DepartmentTitle

              report={report}

            />

            <TestTitle

              report={report}

            />

          </section>

          {/* ==============================================
              RESULT
          ============================================== */}

          <section className="report-content">

            {children}

          </section>

          {/* ==============================================
              INTERPRETATION / IMPRESSION
          ============================================== */}

          {hasResults && (

  <InterpretationSection

    report={report}

  />

)}

        </main>

      )}

      {/* ==================================================
          SIGNATURE
      ================================================== */}

{showSignature && hasResults && (

  <SignatureSection

    report={report}

  />

)}
      {/* ==================================================
          VERIFICATION
      ================================================== */}

      {showVerification && hasResults && (

  <VerificationSection

    report={report}

  />

)}

      {/* ==================================================
          FOOTER
      ================================================== */}

      {showFooter && (

        <PrintFooter

          showTagline

        />

      )}

      {/* ==================================================
          WATERMARK
      ================================================== */}

      {showWatermark && (

        <div className="report-watermark">

          AUTHORIZED COPY

        </div>

      )}

    </div>

  );

}