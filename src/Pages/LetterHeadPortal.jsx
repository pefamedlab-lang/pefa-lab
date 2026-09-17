import { Printer, Download } from "lucide-react";

import PEFADigitalLetterhead from "../components/printing/PEFADigitalLetterhead";
import PEFAReportFooter from "../components/printing/PEFAReportFooter";
import PrintEngine from "../utils/PrintEngine";

import "../styles/LetterHeadPortal.css";

const PRINT_ID = "letterhead-print-root";

export default function LetterHeadPortal() {
  const handlePrint = () => {
    PrintEngine.print(PRINT_ID);
  };

  const handleDownload = async () => {
    await PrintEngine.download(
      PRINT_ID,
      "PEFA-LetterHead.pdf"
    );
  };

  return (
    <div className="letterhead-page">

      {/* =====================================================
          TOOLBAR — SCREEN ONLY
      ===================================================== */}
      <div className="letterhead-toolbar no-print">
        <div className="letterhead-info">
          <h2>PEFA Letter Head Printing</h2>
          <p>
            Print or download the official PEFA Medical
            Diagnostic Services letterhead.
          </p>
        </div>

        <div className="letterhead-actions">
          <button
            type="button"
            className="letterhead-download-btn"
            onClick={handleDownload}
          >
            <Download size={18} />
            Download PDF
          </button>

          <button
            type="button"
            className="letterhead-print-btn"
            onClick={handlePrint}
          >
            <Printer size={18} />
            Print Letter Head
          </button>
        </div>
      </div>

      {/* =====================================================
          OFFICIAL A4 LETTERHEAD
          -----------------------------------------------------
          IMPORTANT:
          The middle spacer is intentional.

          The footer is NOT part of the header.
          It is a separate element and is pushed to the
          physical bottom of the A4 page by flex: 1.
      ===================================================== */}
      <section
        id={PRINT_ID}
        className="letterhead-preview"
      >
        <article className="letterhead-a4">

          {/* TOP ONLY */}
          <PEFADigitalLetterhead
            verificationId="PEFA-LETTERHEAD"
          />

          {/* EMPTY FLEXIBLE PAGE AREA */}
          <div
            className="letterhead-middle-space"
            aria-hidden="true"
          />

          {/* BOTTOM ONLY */}
          <PEFAReportFooter />

        </article>
      </section>
    </div>
  );
}
