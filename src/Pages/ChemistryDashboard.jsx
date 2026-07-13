import "../styles/chemistry.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

import {
  FlaskConical,
  Save,
  Printer,
  Search,
  TestTube2,
} from "lucide-react";

export default function ChemistryDashboard() {
  /* =========================
     STATES
  ========================= */

  const [
    labNumber,
    setLabNumber,
  ] = useState("");

  const [
    patient,
    setPatient,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    chemistryTests,
    setChemistryTests,
  ] = useState([]);

  const [
    filteredTests,
    setFilteredTests,
  ] = useState([]);

  const [
    selectedTests,
    setSelectedTests,
  ] = useState([]);

  const [
    results,
    setResults,
  ] = useState({});

  const [
    comment,
    setComment,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =========================
     LOAD TESTS
  ========================= */

  useEffect(() => {
    loadChemistryTests();
  }, []);

  const loadChemistryTests =
    async () => {
      try {
        const {
          data,
          error,
        } = await supabase
          .from(
            "master_tests"
          )
          .select("*")
          .eq(
            "department",
            "Chemistry"
          )
          .order(
            "test_name",
            {
              ascending:
                true,
            }
          );

        if (error) {
          console.log(
            error
          );

          return;
        }

        setChemistryTests(
          data || []
        );

        setFilteredTests(
          data || []
        );
      } catch (error) {
        console.log(
          error
        );
      }
    };

  /* =========================
     SEARCH TESTS
  ========================= */

  useEffect(() => {
    const filtered =
      chemistryTests.filter(
        (item) =>
          item.test_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          item.panel_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    setFilteredTests(
      filtered
    );
  }, [
    search,
    chemistryTests,
  ]);

  /* =========================
     LOAD PATIENT
  ========================= */

  const loadPatient =
    async () => {
      try {
        setLoading(true);

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

        if (
          error ||
          !data
        ) {
          alert(
            "Patient not found"
          );

          return;
        }

        setPatient(data);
      } catch (error) {
        console.log(
          error
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================
     ADD TEST
  ========================= */

  const addTest =
    (test) => {
      const exists =
        selectedTests.find(
          (item) =>
            item.id ===
            test.id
        );

      if (exists)
        return;

      setSelectedTests([
        ...selectedTests,
        test,
      ]);
    };

  /* =========================
     REMOVE TEST
  ========================= */

  const removeTest =
    (id) => {
      setSelectedTests(
        selectedTests.filter(
          (item) =>
            item.id !== id
        )
      );
    };

  /* =========================
     REFERENCE RANGE
  ========================= */

  const getReferenceRange =
    (test) => {
      if (!patient)
        return "-";

      const age =
        Number(
          patient.age
        );

      const gender =
        patient.gender;

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
        gender ===
        "Male"
      ) {
        return (
          test.male_range ||
          "-"
        );
      }

      if (
        gender ===
        "Female"
      ) {
        return (
          test.female_range ||
          "-"
        );
      }

      return "-";
    };

  /* =========================
     AUTO FLAG ENGINE
  ========================= */

  const handleResultChange =
    (
      testId,
      value,
      range
    ) => {
      let flag =
        "Normal";

      const parts =
        range.split("-");

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

        const numericValue =
          parseFloat(
            value
          );

        if (
          numericValue >
          high
        ) {
          flag = "High";
        }

        else if (
          numericValue <
          low
        ) {
          flag = "Low";
        }
      }

      setResults({
        ...results,

        [testId]: {
          value,
          flag,
        },
      });
    };

  /* =========================
     SAVE REPORT
  ========================= */

  const saveReport =
    async () => {
      try {
        if (!patient) {
          alert(
            "Load patient first"
          );

          return;
        }

        const payload =
          {
            lab_number:
              patient.lab_number,

            patient_name:
              patient.patient_name,

            department:
              "Chemistry",

            results,

            comment,

            status:
              "Completed",

            created_at:
              new Date(),
          };

        const {
          error,
        } = await supabase
          .from(
            "chemistry_results"
          )
          .insert([
            payload,
          ]);

        if (error) {
          alert(
            error.message
          );

          return;
        }

        alert(
          "Chemistry report saved successfully"
        );
      } catch (error) {
        console.log(
          error
        );
      }
    };

  /* =========================
     TOTAL COST
  ========================= */

  const totalCost =
    useMemo(() => {
      return selectedTests.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.price ||
              0
          ),
        0
      );
    }, [selectedTests]);

  return (
    <div className="chem-page">
      {/* =========================
          HEADER
      ========================= */}

      <div className="chem-header">
        <FlaskConical
          size={45}
        />

        <div>
          <h1>
            PEFA MEDICAL
            DIAGNOSTIC
            SERVICES
          </h1>

          <p>
            Enterprise
            Chemistry
            Dashboard
          </p>
        </div>
      </div>

      {/* =========================
          LOAD PATIENT
      ========================= */}

      <div className="chem-card">
        <h3>
          Load Patient
        </h3>

        <div className="chem-load">
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
            onClick={
              loadPatient
            }
          >
            <Search
              size={18}
            />

            {loading
              ? "Loading..."
              : "Load Patient"}
          </button>
        </div>
      </div>

      {/* =========================
          PATIENT INFO
      ========================= */}

      {patient && (
        <div className="chem-card">
          <h3>
            Patient
            Information
          </h3>

          <div className="chem-grid">
            <div>
              <label>
                Patient Name
              </label>

              <input
                value={
                  patient.patient_name
                }
                readOnly
              />
            </div>

            <div>
              <label>
                Gender
              </label>

              <input
                value={
                  patient.gender
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
      )}

      {/* =========================
          SEARCH TESTS
      ========================= */}

      <div className="chem-card">
        <h3>
          Search Chemistry
          Tests
        </h3>

        <div className="search-box">
          <Search
            size={18}
          />

          <input
            type="text"
            placeholder="Search LFT, KFT, Uric Acid, Calcium, Electrolytes..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        {/* TESTS UNDER SEARCH BOX */}

        {search && (
          <div className="test-search-results">
            {filteredTests.map(
              (test) => (
                <div
                  key={
                    test.id
                  }
                  className="test-result-item"
                >
                  <div>
                    <strong>
                      {
                        test.test_name
                      }
                    </strong>

                    <p>
                      {
                        test.panel_name
                      }{" "}
                      • ₦
                      {Number(
                        test.price ||
                          0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      addTest(
                        test
                      )
                    }
                  >
                    Add
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* =========================
          SELECTED TESTS
      ========================= */}

      {selectedTests.length >
        0 && (
        <div className="chem-card">
          <h3>
            Selected
            Chemistry Tests
          </h3>

          <table className="chem-table">
            <thead>
              <tr>
                <th>
                  Test
                </th>

                <th>
                  Result
                </th>

                <th>
                  Unit
                </th>

                <th>
                  Reference
                </th>

                <th>
                  Flag
                </th>

                <th>
                  Price
                </th>

                <th>
                  Remove
                </th>
              </tr>
            </thead>

            <tbody>
              {selectedTests.map(
                (test) => {
                  const range =
                    getReferenceRange(
                      test
                    );

                  return (
                    <tr
                      key={
                        test.id
                      }
                    >
                      <td>
                        {
                          test.test_name
                        }
                      </td>

                      <td>
                        <input
                          type="text"
                          value={
                            results[
                              test.id
                            ]
                              ?.value ||
                            ""
                          }
                          onChange={(
                            e
                          ) =>
                            handleResultChange(
                              test.id,
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
                            test.id
                          ]
                            ?.flag ===
                          "High"
                            ? "high"
                            : results[
                                  test
                                    .id
                                ]
                                    ?.flag ===
                                  "Low"
                              ? "low"
                              : "normal"
                        }
                      >
                        {results[
                          test.id
                        ]?.flag ||
                          "Normal"}
                      </td>

                      <td>
                        ₦
                        {Number(
                          test.price ||
                            0
                        ).toLocaleString()}
                      </td>

                      <td>
                        <button
                          className="remove-btn"
                          onClick={() =>
                            removeTest(
                              test.id
                            )
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>

          {/* TOTAL */}

          <div className="total-cost">
            Total Cost: ₦
            {Number(
              totalCost
            ).toLocaleString()}
          </div>
        </div>
      )}

      {/* =========================
          COMMENTS
      ========================= */}

      <div className="chem-card">
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

      {/* =========================
          ACTIONS
      ========================= */}

      <div className="chem-buttons">
        <button
          className="save-btn"
          onClick={
            saveReport
          }
        >
          <Save
            size={18}
          />

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

      {/* =========================
          COMMON TEST PANELS
      ========================= */}

      <div className="chem-card">
        <h3>
          Common Chemistry
          Profiles
        </h3>

        <div className="profile-grid">
          {[
            "Liver Function Test",
            "Kidney Function Test",
            "Electrolytes",
            "Lipid Profile",
            "Cardiac Enzymes",
            "Diabetic Profile",
            "Calcium",
            "Phosphorous",
            "Uric Acid",
            "Iron Studies",
            "Hormonal Assay",
            "Tumor Markers",
            "CRP",
            "HbA1c",
          ].map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                className="profile-card"
              >
                <TestTube2
                  size={18}
                />

                <span>
                  {item}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}