import { useMemo } from "react";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Printer, Download } from "lucide-react";

import { supabase } from "../supabase";

import LetterHeadDocument from "../components/printing/LetterHeadDocument";
import UltrasoundReport
from "../components/ultrasound/templates/UltrasoundReport";

import PrintEngine from "../utils/PrintEngine";

import "../styles/letterHeadPortal.css";

export default function UltrasoundReportPrint() {

  const [searchParams] = useSearchParams();

  const reportId = searchParams.get("id");

  const printRef = useRef(null);

  const [patient, setPatient] = useState(null);

const printDate = useMemo(() => {
  return new Date().toLocaleString();
}, []);

  useEffect(() => {

    loadReport();

  }, [reportId]);

  async function loadReport() {

    const { data, error } = await supabase

      .from("ultrasound_results")

      .select("*")

      .eq("id", reportId)

      .single();

    if (error) {

      alert(error.message);

      return;

    }

    setPatient(data);

  }

  if (!patient)

    return <h2>Loading report...</h2>;

  return (

    <div className="letterhead-page">

      {/* =======================================
          TOOLBAR
      ======================================= */}

      <div className="letterhead-toolbar">

        <div className="letterhead-info">

         <h2>
{patient.test_type}
</h2>

<p>
Scan ID: {patient.scan_id}
</p>

          <p>

            Print or download the report.

          </p>

<p>

Status :

<strong>

{patient.release_status}

</strong>

</p>

        </div>

        <div className="letterhead-actions">

          <button

            className="letterhead-download-btn"

            onClick={() =>

              PrintEngine.download(
    "print-root",
    `${patient.scan_id}.pdf`
)

            }

          >

            <Download size={18} />

            Download PDF

          </button>

         <button

className="letterhead-print-btn"

disabled={

patient.release_status !== "Released"

}

onClick={()=>

PrintEngine.print("print-root")

}
>

            <Printer size={18} />

            Print

          </button>

        </div>

      </div>

      {/* =======================================
          REPORT
      ======================================= */}

     <div id="print-root" ref={printRef}>

  <LetterHeadDocument>

    <div className="report-meta">
      <div>
        Printed: {printDate}
      </div>

      <div>
        Report Status: {patient.release_status}
      </div>
    </div>

    <UltrasoundReport
      patient={patient}
      data={patient.result || {}}
    />

  </LetterHeadDocument>

</div>

    </div>

  );

}