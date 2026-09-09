import { Printer, Download } from "lucide-react";

import LetterHeadDocument from "../components/printing/LetterHeadDocument";
import PrintEngine from "../utils/PrintEngine";

import "../styles/LetterHeadPortal.css";

export default function LetterHeadPortal() {
  const PRINT_ID = "letterhead-print-root";

  const handlePrint = () => {
    PrintEngine.print(PRINT_ID);
  };

  const handleDownload = () => {
    PrintEngine.download(
      PRINT_ID,
      "PEFA-LetterHead.pdf"
    );
  };

  return (
    <div className="letterhead-page">

      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <header className="letterhead-toolbar">

        <div className="letterhead-info">

          <h2>
            PEFA Letter Head Printing
          </h2>

          <p>
            Print or download the official PEFA Medical Diagnostic
            Services letterhead. This template should be used as the
            reference when configuring report spacing for record copies.
          </p>

        </div>

        <div className="letterhead-actions">

          {/* ==================================================
              DOWNLOAD PDF
          ================================================== */}

          <button
            type="button"
            className="letterhead-download-btn"
            onClick={handleDownload}
          >
            <Download size={18} />
            <span>Download PDF</span>
          </button>

          {/* ==================================================
              PRINT LETTERHEAD
          ================================================== */}

          <button
            type="button"
            className="letterhead-print-btn"
            onClick={handlePrint}
          >
            <Printer size={18} />
            <span>Print Letter Head</span>
          </button>

        </div>

      </header>

      {/* ======================================================
          PRINT PREVIEW
      ====================================================== */}

      <section
        id={PRINT_ID}
        className="letterhead-preview"
      >

        {/* ==================================================
            A4 SHEET
        ================================================== */}

        <article className="letterhead-a4">

          <LetterHeadDocument />

        </article>

      </section>

    </div>
  );
}