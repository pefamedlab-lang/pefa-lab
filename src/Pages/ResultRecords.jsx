import { useEffect, useState } from "react";
import "../styles/resultRecords.css";
import PrintRouter from "../components/printing/PrintRouter";
import PrintEngine from "../utils/PrintEngine";

import groupResultRecords from "../utils/groupResultRecords";
import filterPatientResults from "../utils/filterPatientResults";
import { logAudit } from "../utils/auditLogger";

import {
  getResults,
  authorizeResult as authorizeResultService,
  releaseResult as releaseResultService,
  updatePrintCount,
  updateDownloadCount,
} from "../utils/resultService";

import ResultRecordsTable from "../components/resultRecords/ResultRecordsTable";
import ResultPreviewModal from "../components/resultRecords/ResultPreviewModal";

export default function ResultRecords() {
  /* =====================================================
     USER
  ===================================================== */

  const user = JSON.parse(
    localStorage.getItem("pefa_user") || "{}"
  );

  /* =====================================================
     STATES
  ===================================================== */

  const [results, setResults] = useState([]);

  const [selectedResult, setSelectedResult] =
    useState(null);

  const [showResultModal, setShowResultModal] =
    useState(false);

  const [search, setSearch] = useState("");

  


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchResults();
  }, []);

  /* =====================================================
     LOAD RESULTS
  ===================================================== */

  const fetchResults = async () => {
    const { data, error } =
      await getResults();

    if (error) {
      console.error(error);
      return;
    }

    setResults(data || []);
  };

  /* =====================================================
     AUTHORIZE RESULT
  ===================================================== */

  const authorizeResult = async (id) => {
    const { error } =
      await authorizeResultService(
        id,
        user
      );

    if (error) {
      alert(error.message);
      return;
    }

    await logAudit({
      action: "AUTHORIZE RESULT",
      module: "Result Records",
      description: `ID ${id}`,
    });

    await fetchResults();

const updated = (await getResults()).data?.find(
  (r) => r.id === id
);

if (updated) {
  setSelectedResult(updated);
}

    alert("Result Authorized");
  };

  /* =====================================================
     RELEASE RESULT
  ===================================================== */

  const releaseResult = async (id) => {
    const { error } =
      await releaseResultService(
        id,
        user
      );

    if (error) {
      alert(error.message);
      return;
    }

    await logAudit({
      action: "RELEASE RESULT",
      module: "Result Records",
      description: `ID ${id}`,
    });

    await fetchResults();

const updated = (await getResults()).data?.find(
  (r) => r.id === id
);

if (updated) {
  setSelectedResult(updated);
}

    alert("Result Released");
  };

  /* =====================================================
     PRINT RESULT
  ===================================================== */

 const printResult = async (row) => {
  PrintEngine.print("print-root");

  await updatePrintCount(row, user);

  await fetchResults();

  const updated = (await getResults()).data?.find(
    (r) => r.id === row.id
  );

  if (updated) {
    setSelectedResult(updated);
  }
};

  /* =====================================================
     DOWNLOAD PDF
  ===================================================== */

 const downloadPDF = async (
  realResult = selectedResult
) => {

  await PrintEngine.download(
    "print-root",
    `${realResult.lab_number || "result"}.pdf`
  );

  await updateDownloadCount(
    realResult,
    user
  );

  await fetchResults();

  const updated = (await getResults()).data?.find(
    (r) => r.id === realResult.id
  );

  if (updated) {
    setSelectedResult(updated);
  }

};


  /* =====================================================
     FILTER RESULTS
  ===================================================== */

  const filteredResults =
    groupResultRecords(
      results.filter((item) => {
        const keyword =
          search.toLowerCase();

        return (
          item.lab_number
            ?.toLowerCase()
            .includes(keyword) ||

          item.patient_name
            ?.toLowerCase()
            .includes(keyword) ||

          item.test_type
            ?.toLowerCase()
            .includes(keyword)
        );
      })
    );

  /* =====================================================
     SELECTED PATIENT RESULTS
  ===================================================== */

  const patientResults =
    filterPatientResults(
      results,
      selectedResult
    );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="result-records-page">

      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="result-records-header">

        <h2>Result Records</h2>

  

      </div>

      {/* ===============================================
          SEARCH
      =============================================== */}

      <input
        className="result-search"
        placeholder="Search Lab No, Patient, Test"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      {/* ===============================================
          RESULTS TABLE
      =============================================== */}

     <ResultRecordsTable
  results={filteredResults}
  onView={(row) => {
    setSelectedResult(row);
    setShowResultModal(true);
  }}
/>


<ResultPreviewModal
  open={showResultModal}
  onClose={() => {
    setShowResultModal(false);
    setSelectedResult(null);
  }}

  selectedResult={patientResults[0]}

  onAuthorize={authorizeResult}

  onRelease={releaseResult}

  onPrint={printResult}

  onDownload={downloadPDF}
>

  {patientResults.length > 0 && (

    <PrintRouter
      department={patientResults[0].department}
      results={patientResults}
      patient={patientResults[0]}
      printMode="record"
    />

  )}

</ResultPreviewModal>
         
    </div>
  );
}

