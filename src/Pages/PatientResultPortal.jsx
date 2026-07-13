import PrintRouter
from "../components/printing/PrintRouter";

import "../styles/patientResultPortal.css";

import PrintEngine
from "../utils/PrintEngine";

import groupResultRecords
from "../utils/groupResultRecords";

import filterPatientResults
from "../utils/filterPatientResults";


import {
  useState,
} from "react";

import {
  Search,
  ShieldCheck,
  Download,
  Printer,
} from "lucide-react";

import {
  supabase,
} from "../supabase";


export default function PatientResultPortal() {

  /* =====================================================
     STATES
  ===================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
  results,
  setResults,
] = useState([]);

  const [
    patient,
    setPatient,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({

    labNumber: "",

    accessCode: "",

    dob: "",
  });

  /* =====================================================
     HANDLE CHANGE
  ===================================================== */

  const handleChange =
    (e) => {

      setForm({

        ...form,

        [e.target.name]:
          e.target.value,
      });
    };

  /* =====================================================
     SEARCH RESULT
  ===================================================== */

  const searchResult =
    async () => {

      try {

        setLoading(true);



        /* =====================================================
           VERIFY PATIENT
        ===================================================== */

        const {

          data: registration,

          error:
            registrationError,

        } = await supabase

          .from(
            "registrations"
          )

          .select("*")

          .eq(
            "lab_number",
            form.labNumber
          )

          .eq(
            "access_code",
            form.accessCode
          )

          .eq(
            "dob",
            form.dob
          )

          .single();

        /* =====================================================
           INVALID
        ===================================================== */

        if (

          registrationError ||

          !registration

        ) {

          alert(
            "Invalid Credentials"
          );

          return;
        }

        /* =====================================================
           FETCH RESULT
        ===================================================== */

      const {
  data: patientResults,
  error: resultError,
} = await supabase

  .from("patient_results")

  .select("*")

  .eq(
    "lab_number",
    form.labNumber
  );

        /* =====================================================
           NO RESULT
        ===================================================== */



if (

  resultError ||

  !patientResults ||

  patientResults.length === 0

) {

          alert(
            "Result not yet released"
          );

          return;
        }

        /* =====================================================
           SUCCESS
        ===================================================== */

        setPatient(
          registration
        );

     setResults(
  patientResults
);

const groupedResults =

  groupResultRecords(
    patientResults
  );

const firstReleasedIndex =

  groupedResults.findIndex(

    r =>

      r.release_status ===
      "Released"

  );

setSelectedResult(
  firstReleasedIndex >= 0
    ? firstReleasedIndex
    : 0
);

      } catch (error) {

        console.log(
          error
        );

      } finally {

        setLoading(false);
      }
    };



const [
  selectedResult,
  setSelectedResult,
] = useState(null);

const groupedResults =
  groupResultRecords(results);

  return (

    <div className="patient-result-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="patient-result-header">

        <ShieldCheck
          size={42}
        />

        <h1>
          Patient Result Portal
        </h1>

        <p>
          Secure Online Result Verification
        </p>

      </div>

      {/* =====================================================
          SEARCH CARD
      ===================================================== */}

      <div className="patient-result-card">

        <div className="search-grid">

          {/* LAB NUMBER */}

          <div className="form-group">

            <label>
              Lab Number
            </label>

            <input
              type="text"
              name="labNumber"
              placeholder="PMDS/26/001"
              value={
                form.labNumber
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* ACCESS CODE */}

          <div className="form-group">

            <label>
              Access Code
            </label>

            <input
              type="text"
              name="accessCode"
              placeholder="PEFA-XXXX"
              value={
                form.accessCode
              }
              onChange={
                handleChange
              }
            />

          </div>

          {/* DOB */}

          <div className="form-group">

            <label>
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              value={
                form.dob
              }
              onChange={
                handleChange
              }
            />

          </div>

        </div>

        {/* BUTTON */}

       <button
  className="search-btn"
  onClick={searchResult}
  disabled={loading}
>

  <Search size={18} />

  {
    loading
      ? "Searching..."
      : "View Result"
  }

</button>

      </div>

<div className="patient-portal-home">

  <div className="welcome-card">

    <h2>

  Welcome back,
  <span className="patient-name">

    {patient?.full_name}

  </span>

</h2>

<p>

  Access your laboratory reports securely
  through the PEFA Medical Diagnostic
  Services Patient Portal.

  All released results can be viewed,
  downloaded, and printed instantly.

</p>

  </div>

 <div className="report-selector-wrapper">

  <h3>

    Available Laboratory Reports

  </h3>

  <div className="report-selector">

    {groupResultRecords(results).map(

  (test, index) => (

    <button

      key={index}

      className={`report-chip ${
  selectedResult === index
    ? "active"
    : ""
}`}

      onClick={() =>
        setSelectedResult(index)
      }

    >

      {

        test.release_status ===
        "Released"

          ? "✓ "

          : "⏳ "

      }

      {test.test_type}

    </button>

  )

)}

  </div>

</div>

</div>

{/* ==========================================
   REPORT DISPLAY
========================================== */}

{selectedResult !== null && (

groupedResults[selectedResult]?.release_status ===
  "Released"

    ? (

      <div
  id="print-root"
  className="report-print-container"
>

  <PrintRouter
    department={
      filterPatientResults(
        results,
        groupedResults[selectedResult]
      )[0]?.department
    }

    results={
      filterPatientResults(
        results,
        groupedResults[selectedResult]
      )
    }

    patient={patient}

    printMode="portal"
  />

</div>

    )

    : (

      <div className="pending-release-card">

        <h3>

          Result Not Yet Released

        </h3>

        <p>

          This result has not yet been
          released by the laboratory.

        </p>

      </div>

    )

)}

{/* ==========================================
   REPORT ACTIONS
========================================== */}

{selectedResult !== null && (

  <div className="report-actions">

    {/* DOWNLOAD PDF */}

   <button
  className="report-action-btn download-btn"
  onClick={() =>

   PrintEngine.download(

  "print-root",

  `${
    groupedResults[selectedResult]
      ?.test_type || "Report"
  }.pdf`

)

  }
>

  <Download size={18} />

  Download PDF

</button>

 {/* PRINT REPORT */}


<button
  className="report-action-btn print-btn"
  onClick={() =>

   PrintEngine.print(

  "print-root",

  "PEFA Medical Report"

)

  }
>

  <Printer size={18} />

  Print Report

</button>


    

  </div>

)}


    </div>
  );
}
