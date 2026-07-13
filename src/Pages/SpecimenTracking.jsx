import "../styles/specimenTracking.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  TestTube2,
  Clock3,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";

import Barcode from "react-barcode";

import {
  supabase,
} from "../supabase";

import {
  logActivity,
} from "../utils/logActivity";

export default function SpecimenTracking() {

  /* =====================================================
     STATES
  ===================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    patients,
    setPatients,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

const [
  selectedPatient,
  setSelectedPatient,
] = useState(null);

const [
  showRejectModal,
  setShowRejectModal,
] = useState(false);

const [
  rejectPatient,
  setRejectPatient,
] = useState(null);

const [
  rejectionReason,
  setRejectionReason,
] = useState("");

const [
  showPatientModal,
  setShowPatientModal,
] = useState(false);

const [
  showHistoryModal,
  setShowHistoryModal,
] = useState(false);

const [
  showLabel,
  setShowLabel,
] = useState(false);

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {

    loadPatients();

  }, []);

  /* =====================================================
     LOAD PATIENTS
  ===================================================== */

  const loadPatients =
    async () => {

      try {

        setLoading(true);

        const {
          data,
          error,
        } = await supabase

          .from(
            "registrations"
          )

          .select("*")

          .order(
            "created_at",
            {
              ascending:false,
            }
          );

        if (error) {

          console.log(
            error
          );

          return;
        }

        setPatients(
          data || []
        );

      } catch (error) {

        console.log(
          error
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredPatients =
    useMemo(() => {

      return patients.filter(
        (item) =>

          item.full_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          item.lab_number
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    }, [
      patients,
      search,
    ]);

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const updateStatus =
    async (
      patient,
      status
    ) => {

      try {

        const user =
          JSON.parse(
            localStorage.getItem(
              "pefa_user"
            )
          );

        let payload = {

          specimen_status:
            status,
        };

        /* =====================================================
           COLLECTED
        ===================================================== */

        if (
          status ===
          "Collected"
        ) {

          payload = {

            ...payload,

            specimen_collected_by:
              user?.full_name,

            specimen_collection_time:
              new Date(),
          };
        }

        /* =====================================================
           RECEIVED
        ===================================================== */

        if (
          status ===
          "Received"
        ) {

          payload = {

            ...payload,

            specimen_received_by:
              user?.full_name,

            specimen_received_time:
              new Date(),
          };
        }

        /* =====================================================
           UPDATE
        ===================================================== */

        const {
          error,
        } = await supabase

          .from(
            "registrations"
          )

          .update(
            payload
          )

          .eq(
            "id",
            patient.id
          );

        if (error) {

          alert(
            error.message
          );

          return;
        }

        /* =====================================================
           AUDIT
        ===================================================== */

        await logActivity({

          action:
            `Specimen ${status}`,

          module:
            "Specimen Tracking",

          patientName:
            patient.full_name,

          labNumber:
            patient.lab_number,
        });

        /* =====================================================
           REFRESH
        ===================================================== */

        loadPatients();

      } catch (error) {

        console.log(
          error
        );
      }
    };

  /* =====================================================
     ACTIONS
  ===================================================== */
const getSpecimenType =
  (tests = []) => {

    const names =

      tests
        .map(
          test =>
            (
              test.test_name ||
              ""
            ).toLowerCase()
        )
        .join(" ");

    if (
      names.includes("urine")
    )
      return "Urine";

    if (
      names.includes("stool")
    )
      return "Stool";

    if (
      names.includes("sputum")
    )
      return "Sputum";

    if (
      names.includes("swab")
    )
      return "Swab";

    if (
      names.includes("semen")
    )
      return "Semen";

    return "Blood";
  };



const printLabel =
  (patient) => {

    const tests =

      (patient.tests || [])

        .map(
          test =>
            test.test_name
        )

        .join(", ");

    const printWindow =
      window.open(
        "",
        "_blank"
      );

    printWindow.document.write(`

      <html>

      <head>

        <title>
          Specimen Label
        </title>

        <style>

          body{
            font-family:Arial;
            padding:20px;
          }

          .label{

            width:350px;

            border:2px solid #000;

            padding:15px;

            margin:auto;

            text-align:center;
          }

          h2{
            margin:0;
          }

          p{
            margin:6px 0;
          }

        </style>

      </head>

      <body>

        <div class="label">

          <h2>
            PEFA MEDICAL
          </h2>

          <hr>

          <p>

            <strong>
              Lab No:
            </strong>

            ${patient.lab_number}

          </p>

          <p>

            <strong>
              Patient:
            </strong>

            ${patient.full_name}

          </p>

          <p>

            <strong>
              Tests:
            </strong>

            ${tests}

          </p>

        </div>

      </body>

      </html>

    `);

    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

  };

const rejectSpecimen =
  async () => {

    if (
      !rejectPatient
    )
      return;

    const {
      error,
    } = await supabase

      .from(
        "registrations"
      )

      .update({

        specimen_status:
          "Rejected",

        rejection_reason:
          rejectionReason,

      })

      .eq(
        "id",
        rejectPatient.id
      );

    if (error) {

      alert(
        error.message
      );

      return;
    }

    await logActivity({

      action:
        "Specimen Rejected",

      module:
        "Specimen Tracking",

      patientName:
        rejectPatient.full_name,

      description:
        rejectionReason,

    });

    setShowRejectModal(
      false
    );

    setRejectionReason(
      ""
    );

    loadPatients();

  };


const renderAction =
    (patient) => {

      const status =
        patient.specimen_status ||
        "Pending Collection";

      /* PENDING */

      if (
        status ===
        "Pending Collection"
      ) {

        return (

          <button
            className="collect-btn"
            onClick={() =>
              updateStatus(
                patient,
                "Collected"
              )
            }
          >

            Collect

          </button>
        );
      }

      /* COLLECTED */

      if (
        status ===
        "Collected"
      ) {

        return (

          <button
            className="receive-btn"
            onClick={() =>
              updateStatus(
                patient,
                "Received"
              )
            }
          >

            Receive

          </button>
        );
      }

      /* RECEIVED */

      if (
        status ===
        "Received"
      ) {

        return (

          <button
            className="processing-btn"
            onClick={() =>
              updateStatus(
                patient,
                "Processing"
              )
            }
          >

            Processing

          </button>
        );
      }

      /* PROCESSING */

      if (
        status ===
        "Processing"
      ) {

        return (

          <button
            className="complete-btn"
            onClick={() =>
              updateStatus(
                patient,
                "Completed"
              )
            }
          >

            Complete

          </button>
        );
      }

      /* COMPLETED */

      return (

        <div className="completed-badge">

          <CheckCircle2
            size={16}
          />

          Completed

        </div>
      );
    };

  return (

    <div className="dashboard-layout">

      
      <div className="dashboard-content">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="specimen-header">

          <div>

            <h1>
              Specimen Tracking
            </h1>

            <p>
              Enterprise Sample Workflow Management
            </p>

          </div>

        </div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="specimen-card">

          <div className="specimen-search">

            <Search
              size={18}
            />

            <input
              type="text"
              placeholder="Search Lab Number or Patient Name"
              value={
                search
              }
              onChange={(e) =>
                setSearch(
                  e.target
                    .value
                )
              }
            />

          </div>

        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="specimen-card">

          <div className="specimen-table">

            {/* HEADER */}

            <div className="specimen-table-header">

              <span>
                Lab Number
              </span>

              <span>
                Patient
              </span>

              <span>
                Tests
              </span>

              <span>
                Status
              </span>

              <span>
                Actions
              </span>

            </div>

            {/* BODY */}

            {
              loading ? (

                <div className="empty-state">

                  Loading...

                </div>

              ) : filteredPatients.length === 0 ? (

                <div className="empty-state">

                  No specimen found

                </div>

              ) : (

                filteredPatients.map(
                  (patient) => (

                    <div
                      key={
                        patient.id
                      }
                      className="specimen-row"
                    >

                      {/* LAB NUMBER */}

                      <div className="lab-id">

                        {
                          patient.lab_number
                        }

                      </div>

                      {/* PATIENT */}

                      <div>

                        <h4>
                          {
                            patient.full_name
                          }
                        </h4>

                        <p>
                          {
                            patient.sex
                          }
                          {" • "}
                          {
                            patient.age
                          } yrs
                        </p>

                      </div>

                      {/* TESTS */}

                      <div className="test-list">

                        {
                          (
                            patient.tests ||
                            []
                          )
                            .slice(
                              0,
                              2
                            )
                            .map(
                              (
                                test,
                                index
                              ) => (

                                <div
                                  key={
                                    index
                                  }
                                  className="test-badge"
                                >

                                  <FlaskConical
                                    size={14}
                                  />

                                  {
                                    test.test_name
                                  }

                                </div>
                              )
                            )
                        }

                        {
                          (
                            patient.tests ||
                            []
                          ).length > 2 && (

                            <span className="more-test">

                              +

                              {
                                (
                                  patient.tests ||
                                  []
                                ).length - 2
                              }

                              more

                            </span>
                          )
                        }

                      </div>

                      {/* STATUS */}

                      <div>

                        <div
                          className={`status-badge ${
                            (
                              patient.specimen_status ||
                              "Pending Collection"
                            )
                              .replaceAll(
                                " ",
                                "-"
                              )
                          }`}
                        >

                          <Clock3
                            size={15}
                          />

                          {
                            patient.specimen_status ||
                            "Pending Collection"
                          }

                        </div>

                      </div>

{/* ACTION */}

<button
  className="view-btn"
  onClick={() => {

    setSelectedPatient(
      patient
    );

    setShowPatientModal(
      true
    );

  }}
>

  View

</button>

<div className="action-box">

  {renderAction(patient)}

<button
  className="history-btn"
  onClick={() => {

    setSelectedPatient(
      patient
    );

    setShowHistoryModal(
      true
    );

  }}
>

  History

</button>

<button
  className="reject-btn"
  onClick={() => {

    setRejectPatient(
      patient
    );

    setShowRejectModal(
      true
    );

  }}
>

  Reject

</button>

  <button
  className="label-btn"
  onClick={() => {

    setSelectedPatient(
      patient
    );

    setShowLabel(
      true
    );

  }}
>
  Label
</button>

</div>

</div>           

                  )
                )
              )
            }

{showLabel && selectedPatient && (

  <div className="label-overlay">

    <div className="label-modal">

      <div className="label-header">

        <h2>
          PEFA MEDICAL
        </h2>

        <button
          className="close-btn"
          onClick={() =>
            setShowLabel(false)
          }
        >
          ×
        </button>

      </div>

      <div className="print-label" id="print-label">

  <h3>
    PEFA MEDICAL
  </h3>

  <div className="label-lab-number">

    {selectedPatient.lab_number}

  </div>

  <div className="label-patient">

    {selectedPatient.full_name}

  </div>

  <div className="label-specimen">

  {
    getSpecimenType(
      selectedPatient.tests
    )
  } Sample

</div>

  <Barcode
    value={
      selectedPatient.lab_number
    }
    width={1.5}
    height={50}
    fontSize={12}
  />

</div>


      <div className="label-footer">

       <button
  className="print-btn"
  onClick={() => {

    const label =

      document.getElementById(
        "print-label"
      ).innerHTML;

    const printWindow =
      window.open(
        "",
        "",
        "width=400,height=600"
      );

    printWindow.document.write(`

      <html>

      <head>

        <title>
          PEFA Label
        </title>

        <style>

          body{

            display:flex;

            justify-content:center;

            align-items:center;

            height:100vh;

            margin:0;

            font-family:Arial;
          }

          .print-label{

            width:300px;

            text-align:center;

            padding:15px;
          }

          .label-lab-number{

            font-size:20px;

            font-weight:bold;

            margin:10px 0;
          }

          .label-patient{

            margin-bottom:10px;
          }

        </style>

      </head>

      <body>

        <div class="print-label">

          ${label}

        </div>

      </body>

      </html>

    `);

    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

  }}
>
  Print Label
</button>

      </div>

    </div>

  </div>

)}


{showPatientModal &&
 selectedPatient && (

  <div className="modal-overlay">

    <div className="patient-modal">

      <div className="patient-modal-header">

        <h2>
          Patient Details
        </h2>

        <button
          className="close-btn"
          onClick={() =>
            setShowPatientModal(
              false
            )
          }
        >
          ×
        </button>

      </div>

      <div className="patient-modal-body">

        <p>

          <strong>
            Lab Number:
          </strong>

          {" "}

          {
            selectedPatient.lab_number
          }

        </p>

        <p>

          <strong>
            Patient:
          </strong>

          {" "}

          {
            selectedPatient.full_name
          }

        </p>

        <p>

          <strong>
            Sex:
          </strong>

          {" "}

          {
            selectedPatient.sex
          }

        </p>

        <p>

          <strong>
            Age:
          </strong>

          {" "}

          {
            selectedPatient.age
          }

        </p>

        <p>

          <strong>
            Phone:
          </strong>

          {" "}

          {
            selectedPatient.phone
          }

        </p>

        <p>

          <strong>
            Referral:
          </strong>

          {" "}

          {
            selectedPatient.referral_name ||
            "Direct Patient"
          }

        </p>

        <p>

          <strong>
            Clinical History:
          </strong>

          {" "}

          {
            selectedPatient.clinical_history ||
            "None"
          }

        </p>

        <hr />

        <h3>
          Requested Tests
        </h3>

        <ul>

          {(selectedPatient.tests || [])
            .map(
              (
                test,
                index
              ) => (

                <li
                  key={index}
                >

                  {
                    test.test_name
                  }

                </li>

              )
            )}

        </ul>

      </div>

    </div>

  </div>

)}

{showRejectModal && (

  <div className="modal-overlay">

    <div className="reject-modal">

      <h2>
        Reject Specimen
      </h2>

      <select
        value={
          rejectionReason
        }
        onChange={(e) =>
          setRejectionReason(
            e.target.value
          )
        }
      >

        <option value="">
          Select Reason
        </option>

        <option>
          Hemolysed Sample
        </option>

        <option>
          Clotted Sample
        </option>

        <option>
          Insufficient Volume
        </option>

        <option>
          Wrong Container
        </option>

        <option>
          Leaking Sample
        </option>

        <option>
          Unlabelled Sample
        </option>

      </select>

      <div className="reject-actions">

        <button
          className="cancel-btn"
          onClick={() =>
            setShowRejectModal(
              false
            )
          }
        >
          Cancel
        </button>

        <button
          className="reject-confirm-btn"
          onClick={
            rejectSpecimen
          }
        >
          Reject Sample
        </button>

      </div>

    </div>

  </div>

)}

{showHistoryModal &&
 selectedPatient && (

  <div className="modal-overlay">

    <div className="history-modal">

      <div className="history-header">

        <h2>

          Sample History

        </h2>

        <button
          className="close-btn"
          onClick={() =>
            setShowHistoryModal(
              false
            )
          }
        >
          ×
        </button>

      </div>

      <div className="history-body">

        <div className="history-item">

          <strong>
            Lab Number:
          </strong>

          {" "}

          {
            selectedPatient.lab_number
          }

        </div>

        <div className="history-item">

          <strong>
            Collected By:
          </strong>

          {" "}

          {
            selectedPatient.specimen_collected_by ||
            "Not Collected"
          }

        </div>

        <div className="history-item">

          <strong>
            Collection Time:
          </strong>

          {" "}

          {
            selectedPatient.specimen_collection_time
              ? new Date(
                  selectedPatient.specimen_collection_time
                ).toLocaleString()
              : "-"
          }

        </div>

        <div className="history-item">

          <strong>
            Received By:
          </strong>

          {" "}

          {
            selectedPatient.specimen_received_by ||
            "Not Received"
          }

        </div>

        <div className="history-item">

          <strong>
            Received Time:
          </strong>

          {" "}

          {
            selectedPatient.specimen_received_time
              ? new Date(
                  selectedPatient.specimen_received_time
                ).toLocaleString()
              : "-"
          }

        </div>

        <div className="history-item">

          <strong>
            Current Status:
          </strong>

          {" "}

          {
            selectedPatient.specimen_status
          }

        </div>

      </div>

    </div>

  </div>

)}

          </div>

        </div>

      </div>

    </div>
  );
}