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

          sample_status:
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

            sample_collected_by:
              user?.full_name,

            sample_collected_at:
              new Date().toISOString(),

            /* Keep the existing specimen fields populated for
               backward compatibility with the tracking module. */
            specimen_collected_by:
              user?.full_name,

            specimen_collection_time:
              new Date().toISOString(),
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

                      <div className="action-box">

                        {
                          renderAction(
                            patient
                          )
                        }

                      </div>

                    </div>
                  )
                )
              )
            }

          </div>

        </div>

      </div>

    </div>
  );
}