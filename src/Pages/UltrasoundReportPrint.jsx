import { useMemo, useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Printer, Download } from "lucide-react";

import { supabase } from "../supabase";

import UltrasoundReport from "../components/ultrasound/templates/UltrasoundReport";
import PEFADocumentFrame from "../components/printing/PEFADocumentFrame";

import PrintEngine from "../utils/PrintEngine";

import "../styles/pefaReportPrinting.css";
import "../styles/LetterHeadPortal.css";

export default function UltrasoundReportPrint() {
  const [searchParams] = useSearchParams();

  const reportId = searchParams.get("id");

  const printRef = useRef(null);

  const [patient, setPatient] = useState(null);

  const printDate = useMemo(() => {
    return new Date().toLocaleString("en-NG");
  }, []);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  async function loadReport() {
    if (!reportId) {
      alert("No ultrasound report ID was supplied.");
      return;
    }

    const { data, error } = await supabase
      .from("ultrasound_results")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error) {
      console.error("Ultrasound report loading error:", error);
      alert(error.message);
      return;
    }

    setPatient(data);
  }

  if (!patient) {
    return (
      <div className="letterhead-page">
        <div className="letterhead-loading">
          <h2>Loading report...</h2>
        </div>
      </div>
    );
  }

  const verificationId =
    patient.verification_id ||
    patient.verificationId ||
    patient.scan_id ||
    `US-${patient.id}`;

  const isReleased =
    String(patient.release_status || "").trim().toLowerCase() ===
    "released";

  return (
    <div className="letterhead-page">
      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="letterhead-toolbar">
        <div className="letterhead-info">
          <h2>{patient.test_type || "Ultrasound Report"}</h2>

          <p>
            Scan ID: <strong>{patient.scan_id || "-"}</strong>
          </p>

          <p>Print or download the report.</p>

          <p>
            Status:{" "}
            <strong>{patient.release_status || "Pending"}</strong>
          </p>
        </div>

        <div className="letterhead-actions">
          <button
            type="button"
            className="letterhead-download-btn"
            onClick={() =>
              PrintEngine.download(
                "print-root",
                `${patient.scan_id || "ultrasound-report"}.pdf`
              )
            }
          >
            <Download size={18} />
            Download PDF
          </button>

          <button
            type="button"
            className="letterhead-print-btn"
            disabled={!isReleased}
            onClick={() => PrintEngine.print("print-root")}
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* =====================================================
          SHARED PEFA REPORT
          -----------------------------------------------------
          IMPORTANT:
          LetterHeadDocument has been completely removed.

          This report now uses the SAME:
          - PEFA Digital Letterhead
          - QR verification
          - Report content wrapper
          - PEFA Footer

          used by the other connected PEFA reports.
      ===================================================== */}

      <div id="print-root" ref={printRef}>
        <PEFADocumentFrame
          verificationId={verificationId}
          className="pefa-ultrasound-report"
        >
          <div className="report-meta">
            <div>
              Printed: {printDate}
            </div>

            <div>
              Report Status: {patient.release_status || "Pending"}
            </div>
          </div>

          <UltrasoundReport
            patient={patient}
            data={patient.result || {}}
          />
        </PEFADocumentFrame>
      </div>
    </div>
  );
}