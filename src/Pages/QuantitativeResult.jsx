import "../styles/hematology.css";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../supabase";

import {
  ClipboardList,
  Save,
  Printer,
} from "lucide-react";

export default function QuantitativeResult() {
  // STATES

  const [labNumber,
    setLabNumber] =
    useState("");

  const [patient,
    setPatient] =
    useState(null);

  const [tests,
    setTests] =
    useState([]);

  const [selectedTest,
    setSelectedTest] =
    useState("");

  const [result,
    setResult] =
    useState("");

  const [unit,
    setUnit] =
    useState("");

  const [referenceRange,
    setReferenceRange] =
    useState("");

  const [flag,
    setFlag] =
    useState("Normal");

  const [comment,
    setComment] =
    useState("");

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
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from(
          "master_tests"
        )
        .select("*")
        .eq(
          "category",
          "Quantitative"
        );

      if (error) {
        alert(
          error.message
        );

        return;
      }

      setTests(data || []);
    };

  // LOAD TESTS

  useEffect(() => {
    fetchTests();
  }, []);

  // HANDLE TEST

  const handleTestSelect =
    (value) => {
      setSelectedTest(
        value
      );

      const test =
        tests.find(
          (item) =>
            item.test_name ===
            value
        );

      if (
        !test ||
        !patient
      )
        return;

      setUnit(
        test.unit
      );

      // RANGE

      let range = "";

      const age =
        Number(
          patient.age
        );

      if (age <= 15) {
        range =
          test.child_range;
      }

      else if (
        age >= 60
      ) {
        range =
          test.elderly_range;
      }

      else if (
        patient.sex ===
        "Male"
      ) {
        range =
          test.male_range;
      }

      else {
        range =
          test.female_range;
      }

      setReferenceRange(
        range
      );
    };

  // FLAG ENGINE

  const handleResultChange =
    (value) => {
      setResult(value);

      const parts =
        referenceRange.split(
          "-"
        );

      if (
        parts.length ===
        2
      ) {
        const low =
          parseFloat(
            parts[0]
          );

        const high =
          parseFloat(
            parts[1]
          );

        const numeric =
          parseFloat(
            value
          );

        if (
          numeric > high
        ) {
          setFlag(
            "High"
          );
        }

        else if (
          numeric < low
        ) {
          setFlag(
            "Low"
          );
        }

        else {
          setFlag(
            "Normal"
          );
        }
      }
    };

  // SAVE RESULT

  const saveReport =
    async () => {
      if (!patient) {
        alert(
          "Load patient first"
        );

        return;
      }

      const report =
        JSON.stringify({
          test:
            selectedTest,

          result,

          unit,

          reference_range:
            referenceRange,

          flag,

          comment,
        });

      const { error } =
        await supabase
          .from("patients")
          .update({
            result:
              report,

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
        "Quantitative Result Saved Successfully"
      );
    };

  return (
    <div className="hema-page">
      {/* HEADER */}

      <div className="hema-header">
        <ClipboardList
          size={45}
        />

        <div>
          <h1>
            PEFA MEDICAL
            DIAGNOSTIC
            SERVICES
          </h1>

          <p>
            Quantitative
            Result Engine
          </p>
        </div>
      </div>

      {/* LOAD */}

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

          {/* TEST */}

          <div className="hema-card">
            <h3>
              Quantitative
              Result
            </h3>

            <div className="hema-grid">
              <div>
                <label>
                  Select Test
                </label>

                <select
                  value={
                    selectedTest
                  }
                  onChange={(e) =>
                    handleTestSelect(
                      e.target
                        .value
                    )
                  }
                >
                  <option value="">
                    Select Test
                  </option>

                  {tests.map(
                    (
                      test,
                      index
                    ) => (
                      <option
                        key={index}
                      >
                        {
                          test.test_name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label>
                  Result
                </label>

                <input
                  type="number"
                  value={
                    result
                  }
                  onChange={(e) =>
                    handleResultChange(
                      e.target
                        .value
                    )
                  }
                />
              </div>

              <div>
                <label>
                  Unit
                </label>

                <input
                  value={
                    unit
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Reference
                  Range
                </label>

                <input
                  value={
                    referenceRange
                  }
                  readOnly
                />
              </div>

              <div>
                <label>
                  Flag
                </label>

                <input
                  value={
                    flag
                  }
                  readOnly
                />
              </div>
            </div>
          </div>

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

              Save Result
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

              Print Result
            </button>
          </div>
        </>
      )}
    </div>
  );
}