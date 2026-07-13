import "../styles/hematology.css";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../supabase";

import {
  Microscope,
  Save,
  Printer,
} from "lucide-react";

export default function HematologyDashboard() {
  // STATES

  const [labNumber,
    setLabNumber] =
    useState("");

  const [patient,
    setPatient] =
    useState(null);

  const [panels,
    setPanels] =
    useState([]);

  const [selectedPanel,
    setSelectedPanel] =
    useState("");

  const [tests,
    setTests] =
    useState([]);

  const [results,
    setResults] =
    useState({});

  const [comment,
    setComment] =
    useState("");

  // FETCH PANELS

  const fetchPanels =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from(
          "master_tests"
        )
        .select(
          "panel_name"
        )
        .eq(
          "department",
          "Hematology"
        );

      if (error) {
        alert(
          error.message
        );

        return;
      }

      const uniquePanels =
        [
          ...new Set(
            data.map(
              (
                item
              ) =>
                item.panel_name
            )
          ),
        ];

      setPanels(
        uniquePanels
      );
    };

  // FETCH PATIENT

  const fetchPatient =
    async () => {
      if (!labNumber)
        return;

      const {
        data,
        error,
      } = await supabase
        .from("patients")
        .select("*")
        .eq(
          "lab_number",
          labNumber
        )
        .single();

      if (error) {
        alert(
          "Patient not found"
        );

        return;
      }

      setPatient(data);
    };

  // FETCH TESTS

  const fetchTests =
    async (
      panel
    ) => {
      const {
        data,
        error,
      } = await supabase
        .from(
          "master_tests"
        )
        .select("*")
        .eq(
          "panel_name",
          panel
        )
        .order(
          "test_name",
          {
            ascending:
              true,
          }
        );

      if (error) {
        alert(
          error.message
        );

        return;
      }

      setTests(data);
    };

  // LOAD PANELS

  useEffect(() => {
    fetchPanels();
  }, []);

  // PANEL CHANGE

  useEffect(() => {
    if (
      selectedPanel
    ) {
      fetchTests(
        selectedPanel
      );
    }
  }, [
    selectedPanel,
  ]);

  // GET RANGE

  const getReferenceRange =
    (test) => {
      if (!patient)
        return "-";

      const age =
        Number(
          patient.age
        );

      const sex =
        patient.sex;

      if (age <= 15) {
        return (
          test.child_range ||
          "-"
        );
      }

      if (age >= 60) {
        return (
          test.elderly_range ||
          "-"
        );
      }

      if (
        sex === "Male"
      ) {
        return (
          test.male_range ||
          "-"
        );
      }

      if (
        sex ===
        "Female"
      ) {
        return (
          test.female_range ||
          "-"
        );
      }

      return "-";
    };

  // FLAG ENGINE

  const handleResultChange = (
    index,
    value,
    range
  ) => {
    let flag = "Normal";

    const parts =
      range.split("-");

    if (parts.length === 2) {
      const low =
        parseFloat(
          parts[0]
        );

      const high =
        parseFloat(
          parts[1]
        );

      const numericValue =
        parseFloat(value);

      if (
        numericValue > high
      ) {
        flag = "High";
      }

      else if (
        numericValue < low
      ) {
        flag = "Low";
      }
    }

    setResults({
      ...results,

      [index]: {
        value,
        flag,
      },
    });
  };

  // SAVE REPORT

  const saveReport =
    async () => {
      if (!patient) {
        alert(
          "Load patient first"
        );

        return;
      }

      const reportData =
        JSON.stringify(
          results
        );

      const { error } =
        await supabase
          .from("patients")
          .update({
            result:
              reportData,

            status:
              "Completed",

            report_date:
              new Date().toLocaleDateString(),
          })
          .eq(
            "lab_number",
            patient.lab_number
          );

      if (error) {
        alert(
          error.message
        );

        return;
      }

      alert(
        "Hematology Report Saved Successfully"
      );
    };

  return (
    <div className="hema-page">
      {/* HEADER */}

      <div className="hema-header">
        <Microscope
          size={45}
        />

        <div>
          <h1>
            PEFA MEDICAL
            DIAGNOSTIC
            SERVICES
          </h1>

          <p>
            Smart
            Hematology
            Dashboard
          </p>
        </div>
      </div>

      {/* LOAD PATIENT */}

      <div className="hema-card">
        <h3>
          Load Patient
        </h3>

        <div
          style={{
            display: "flex",
            gap: "15px",
          }}
        >
          <input
            type="text"
            placeholder="Enter Lab Number"
            value={
              labNumber
            }
            onChange={(e) =>
              setLabNumber(
                e.target.value
              )
            }
          />

          <button
            className="save-btn"
            onClick={
              fetchPatient
            }
          >
            Load Patient
          </button>
        </div>
      </div>

      {/* PATIENT */}

      {patient && (
        <>
          <div className="hema-card">
            <h3>
              Patient
              Information
            </h3>

            <div className="hema-grid">
              <div>
                <label>
                  Full Name
                </label>

                <input
                  value={
                    patient.full_name
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Sex
                </label>

                <input
                  value={
                    patient.sex
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Age
                </label>

                <input
                  value={
                    patient.age
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Lab Number
                </label>

                <input
                  value={
                    patient.lab_number
                  }
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* PANEL SELECT */}

          <div className="hema-card">
            <h3>
              Select
              Hematology
              Panel
            </h3>

            <select
              value={
                selectedPanel
              }
              onChange={(e) =>
                setSelectedPanel(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Panel
              </option>

              {panels.map(
                (
                  panel,
                  index
                ) => (
                  <option
                    key={index}
                  >
                    {panel}
                  </option>
                )
              )}
            </select>
          </div>

          {/* RESULTS */}

          {tests.length >
            0 && (
            <div className="hema-card">
              <h3>
                {
                  selectedPanel
                }{" "}
                Results
              </h3>

              <table className="hema-table">
                <thead>
                  <tr>
                    <th>
                      Parameter
                    </th>

                    <th>
                      Result
                    </th>

                    <th>
                      Unit
                    </th>

                    <th>
                      Reference
                      Range
                    </th>

                    <th>
                      Flag
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tests.map(
                    (
                      test,
                      index
                    ) => {
                      const range =
                        getReferenceRange(
                          test
                        );

                      return (
                        <tr
                          key={
                            index
                          }
                        >
                          <td>
                            {
                              test.test_name
                            }
                          </td>

                          <td>
                            <input
                              type="number"
                              value={
                                results[
                                  index
                                ]
                                  ?.value ||
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                handleResultChange(
                                  index,
                                  e
                                    .target
                                    .value,
                                  range
                                )
                              }
                            />
                          </td>

                          <td>
                            {
                              test.unit
                            }
                          </td>

                          <td>
                            {
                              range
                            }
                          </td>

                          <td
                            className={
                              results[
                                index
                              ]
                                ?.flag ===
                              "High"
                                ? "high"
                                : results[
                                      index
                                    ]
                                        ?.flag ===
                                      "Low"
                                  ? "low"
                                  : "normal"
                            }
                          >
                            {results[
                              index
                            ]?.flag ||
                              "Normal"}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* COMMENT */}

          <div className="hema-card">
            <h3>
              Laboratory
              Comment
            </h3>

            <textarea
              rows="5"
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
            />
          </div>

          {/* BUTTONS */}

          <div className="hema-buttons">
            <button
              className="save-btn"
              onClick={
                saveReport
              }
            >
              <Save size={18} />

              Save Report
            </button>

            <button
              className="print-btn"
              onClick={() =>
                window.print()
              }
            >
              <Printer
                size={18}
              />

              Print Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}