import {

  useEffect,
  useState,

} from "react";

import { supabase } from "../supabase";

import "../styles/ultrasoundDashboard.css";


import OBSForm
from "../components/ultrasound/forms/OBSForm";

import PelvicScanForm
from "../components/ultrasound/forms/PelvicScanForm";

import AbdominalScanForm
from "../components/ultrasound/forms/AbdominalScanForm";

import AbdominoPelvicScanForm
from "../components/ultrasound/forms/AbdominoPelvicScanForm";

import BreastScanForm
from "../components/ultrasound/forms/BreastScanForm";

import ScrotalScanForm
from "../components/ultrasound/forms/ScrotalScanForm";

import KidneyScanForm
from "../components/ultrasound/forms/KidneyScanForm";

import LiverScanForm
from "../components/ultrasound/forms/LiverScanForm";

import ThyroidScanForm
from "../components/ultrasound/forms/ThyroidScanForm";

import ProstateScanForm
from "../components/ultrasound/forms/ProstateScanForm";

import SoftTissueScanForm
from "../components/ultrasound/forms/SoftTissueScanForm";

export default function UltrasoundResultDashboard() {

  const [

    patients,

    setPatients,

  ] = useState([]);

  const [

    selectedPatient,

    setSelectedPatient,

  ] = useState(null);

  const [

    resultData,

    setResultData,

  ] = useState({});



  /* ==========================
     LOAD PENDING SCANS
  ========================== */

  useEffect(() => {

    loadPatients();

  }, []);

  const loadPatients =

    async () => {

      const {

        data,

      } = await supabase

        .from(

          "ultrasound_results"

        )

        .select("*")

        .order(

          "created_at",

          {

            ascending:false,

          }

        );

      setPatients(

        data || []

      );

    };

  /* ==========================
     SELECT PATIENT
  ========================== */

  const selectPatient = (

    patient

  ) => {

    setSelectedPatient(

      patient

    );

    setResultData(

      patient.result ||

      {}

    );

  };

  /* ==========================
     CHANGE HANDLER
  ========================== */

  const handleChange = (

    key,

    value

  ) => {

    setResultData(

      prev => ({

        ...prev,

        [key]:value,

      })

    );

  };

  /* ==========================
     SAVE REPORT
  ========================== */

 const saveReport = async () => {
  if (!selectedPatient) return;

  const { error } = await supabase
    .from("ultrasound_results")
    .update({
      result: resultData,
      report_status: "Completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", selectedPatient.id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Report saved successfully.");

  await loadPatients();

  setSelectedPatient((prev) => ({
    ...prev,
    result: resultData,
    report_status: "Completed",
  }));
};

const releaseReport = async () => {

  if (!selectedPatient) return;

  const { error } = await supabase

    .from("ultrasound_results")

    .update({

      result: resultData,

      report_status: "Completed",

      release_status: "Released",

      released_at: new Date().toISOString(),

    })

    .eq("id", selectedPatient.id);

  if (error) {

    alert(error.message);

    return;

  }

  alert("Report Released Successfully");

  await loadPatients();

  setSelectedPatient((prev) => ({
    ...prev,
    result: resultData,
    report_status: "Completed",
    release_status: "Released",
  }));

};

  return (

    <div className="ultrasound-dashboard">

      {/* =====================
          LEFT PANEL
      ===================== */}

      <div

        className="patient-list"

      >

        <h2>

          Ultrasound Queue

        </h2>

        {

          patients.map(

            patient => (

              <button

                key={

                  patient.id

                }

                className="patient-item"

                onClick={()=>

                  selectPatient(

                    patient

                  )

                }

              >

<strong>
  {patient.patient_name}
</strong>

<div className="queue-scan-id">
  {patient.scan_id}
</div>

<div className="queue-test">
  {patient.test_type}
</div>

              </button>

            )

          )

        }

      </div>

      {/* =====================
          RESULT PANEL
      ===================== */}

      <div

        className="result-editor"

      >

        {

          selectedPatient && (

            <>

              <h1>

                {

                  selectedPatient

                    .test_type

                }

              </h1>

<div className="scan-information">

  <p>
    <strong>Scan ID:</strong> {selectedPatient.scan_id}
  </p>

  <p>
    <strong>Patient:</strong> {selectedPatient.patient_name}
  </p>

  <p>
    <strong>Age/Sex:</strong> {selectedPatient.age} / {selectedPatient.sex}
  </p>

  <p>
    <strong>Referring Doctor:</strong> {selectedPatient.referring_doctor}
  </p>

</div>

              {/* OBS */}

              {

                selectedPatient

                  .template_type ===

                "obs_scan" && (

                  <OBSForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* PELVIC */}

              {

                selectedPatient

                  .template_type ===

                "pelvic_scan" && (

                  <PelvicScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* ABDOMINAL */}

              {

                selectedPatient

                  .template_type ===

                "abdominal_scan" && (

               <AbdominalScanForm
  patient={selectedPatient}
  data={resultData}
  onChange={handleChange}
/>

                )

              }

              {/* ABDOMINO PELVIC */}

              {

                selectedPatient

                  .template_type ===

                "abdomino_pelvic_scan" && (

                  <AbdominoPelvicScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* BREAST */}

              {

                selectedPatient

                  .template_type ===

                "breast_scan" && (

                  <BreastScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* SCROTAL */}

              {

                selectedPatient

                  .template_type ===

                "scrotal_scan" && (

                  <ScrotalScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* KIDNEY */}

              {

                selectedPatient

                  .template_type ===

                "kidney_scan" && (

                  <KidneyScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* LIVER */}

              {

                selectedPatient

                  .template_type ===

                "liver_scan" && (

                  <LiverScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* THYROID */}

              {

                selectedPatient

                  .template_type ===

                "thyroid_scan" && (

                  <ThyroidScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* PROSTATE */}

              {

                selectedPatient

                  .template_type ===

                "prostate_scan" && (

                  <ProstateScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              {/* SOFT TISSUE */}

              {

                selectedPatient

                  .template_type ===

                "soft_tissue_scan" && (

                  <SoftTissueScanForm

                    data={

                      resultData

                    }

                    onChange={

                      handleChange

                    }

                  />

                )

              }

              <div className="report-actions">

  <button

    className="save-btn"

    onClick={saveReport}

  >

    Save Draft

  </button>

  <button

    className="release-btn"

    onClick={releaseReport}

  >

    Release Report

  </button>

</div>

            </>

          )

        }

      </div>

    </div>

  );

}