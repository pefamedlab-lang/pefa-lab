import { Printer, Download } from "lucide-react";

import LetterHeadDocument from "../components/printing/LetterHeadDocument";
import PrintEngine from "../utils/PrintEngine";

import "../styles/LetterHeadPortal.css";

export default function LetterHeadPortal() {

  return (

    <div className="letterhead-page">

      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="letterhead-toolbar">

        <div className="letterhead-info">

          <h2>

            PEFA Letter Head Printing

          </h2>

          <p>

            Print or download the official PEFA Medical Diagnostic
            Services letterhead.

          </p>

        </div>

        <div className="letterhead-actions">

          {/* ==================================================
              DOWNLOAD PDF
          ================================================== */}

          <button
            className="letterhead-download-btn"
            onClick={() =>
              PrintEngine.download(
                "print-root",
                "PEFA-LetterHead.pdf"
              )
            }
          >

            <Download size={18} />

            Download PDF

          </button>

          {/* ==================================================
              PRINT LETTERHEAD
          ================================================== */}

          <button
            className="letterhead-print-btn"
            onClick={() =>
              PrintEngine.print("print-root")
            }
          >

            <Printer size={18} />

            Print Letter Head

          </button>

        </div>

      </div>

      {/* ======================================================
          PRINT PREVIEW
      ====================================================== */}

      <div
        id="print-root"
        className="letterhead-preview"
      >

        <div className="letterhead-a4">

          <LetterHeadDocument />

        </div>

      </div>

    </div>

  );

}