import "../styles/dashboard.css";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../supabase";

import {
  FlaskConical,
  Save,
  Trash2,
} from "lucide-react";

export default function TestManager() {
  // STATES

  const [tests,
    setTests] =
    useState([]);

  const [testName,
    setTestName] =
    useState("");

  const [department,
    setDepartment] =
    useState("");

  const [panelName,
    setPanelName] =
    useState("");

  const [category,
    setCategory] =
    useState("");

  const [unit,
    setUnit] =
    useState("");

  const [price,
    setPrice] =
    useState("");

  const [maleRange,
    setMaleRange] =
    useState("");

  const [femaleRange,
    setFemaleRange] =
    useState("");

  const [childRange,
    setChildRange] =
    useState("");

  const [elderlyRange,
    setElderlyRange] =
    useState("");

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
        .order(
          "id",
          {
            ascending:
              false,
          }
        );

      if (error) {
        alert(
          error.message
        );

        return;
      }

      setTests(data || []);
    };

  // LOAD

  useEffect(() => {
    fetchTests();
  }, []);

  // SAVE TEST

  const saveTest =
    async () => {
      if (
        !testName ||
        !department
      ) {
        alert(
          "Test Name and Department are required"
        );

        return;
      }

      const {
        error,
      } = await supabase
        .from(
          "master_tests"
        )
        .insert([
          {
            test_name:
              testName,

            department,

            panel_name:
              panelName,

            category,

            unit,

            price,

            male_range:
              maleRange,

            female_range:
              femaleRange,

            child_range:
              childRange,

            elderly_range:
              elderlyRange,

            report_type:
              department,
          },
        ]);

      if (error) {
        alert(
          error.message
        );

        return;
      }

      alert(
        "Test Added Successfully"
      );

      // RESET

      setTestName("");
      setDepartment("");
      setPanelName("");
      setCategory("");
      setUnit("");
      setPrice("");
      setMaleRange("");
      setFemaleRange("");
      setChildRange("");
      setElderlyRange("");

      fetchTests();
    };

  // DELETE TEST

  const deleteTest =
    async (id) => {
      const confirmDelete =
        window.confirm(
          "Delete this test?"
        );

      if (
        !confirmDelete
      )
        return;

      const {
        error,
      } = await supabase
        .from(
          "master_tests"
        )
        .delete()
        .eq("id", id);

      if (error) {
        alert(
          error.message
        );

        return;
      }

      fetchTests();
    };

  return (
    <div className="dashboard-page">
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>
            Test Manager
          </h1>

          <p>
            Enterprise
            Laboratory
            Test Setup
          </p>
        </div>
      </div>

      {/* FORM */}

      <div className="welcome-card">
        <div
          style={{
            display: "flex",

            alignItems:
              "center",

            gap: "10px",

            marginBottom:
              "25px",
          }}
        >
          <FlaskConical
            size={28}
          />

          <h2>
            Add Laboratory
            Test
          </h2>
        </div>

        <div className="dashboard-grid">
          {/* TEST NAME */}

          <div>
            <label>
              Test Name
            </label>

            <input
              value={
                testName
              }
              onChange={(e) =>
                setTestName(
                  e.target
                    .value
                )
              }
            />
          </div>

          {/* DEPARTMENT */}

          <div>
            <label>
              Department
            </label>

            <select
              value={
                department
              }
              onChange={(e) =>
                setDepartment(
                  e.target
                    .value
                )
              }
            >
              <option value="">
                Select
              </option>

              <option>
                Chemistry
              </option>

              <option>
                Hematology
              </option>

              <option>
                Microbiology
              </option>

              <option>
                Serology
              </option>

              <option>
                Endocrinology
              </option>

              <option>
                Blood Banking
              </option>
            </select>
          </div>

          {/* PANEL */}

          <div>
            <label>
              Panel Name
            </label>

            <input
              value={
                panelName
              }
              onChange={(e) =>
                setPanelName(
                  e.target
                    .value
                )
              }
            />
          </div>

          {/* CATEGORY */}

          <div>
            <label>
              Category
            </label>

            <select
              value={
                category
              }
              onChange={(e) =>
                setCategory(
                  e.target
                    .value
                )
              }
            >
              <option value="">
                Select
              </option>

              <option>
                Quantitative
              </option>

              <option>
                Qualitative
              </option>
            </select>
          </div>

          {/* UNIT */}

          <div>
            <label>
              Unit
            </label>

            <input
              value={unit}
              onChange={(e) =>
                setUnit(
                  e.target
                    .value
                )
              }
            />
          </div>

          {/* PRICE */}

          <div>
            <label>
              Price
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target
                    .value
                )
              }
            />
          </div>

          {/* MALE */}

          <div>
            <label>
              Male Range
            </label>

            <input
              value={
                maleRange
              }
              onChange={(e) =>
                setMaleRange(
                  e.target
                    .value
                )
              }
            />
          </div>

          {/* FEMALE */}

          <div>
            <label>
              Female Range
            </label>

            <input
              value={
                femaleRange
              }
              onChange={(e) =>
                setFemaleRange(
                  e.target
                    .value
                )
              }
            />
          </div>

          {/* CHILD */}

          <div>
            <label>
              Child Range
            </label>

            <input
              value={
                childRange
              }
              onChange={(e) =>
                setChildRange(
                  e.target
                    .value
                )
              }
            />
          </div>

          {/* ELDERLY */}

          <div>
            <label>
              Elderly Range
            </label>

            <input
              value={
                elderlyRange
              }
              onChange={(e) =>
                setElderlyRange(
                  e.target
                    .value
                )
              }
            />
          </div>
        </div>

        {/* BUTTON */}

        <div
          style={{
            marginTop:
              "25px",
          }}
        >
          <button
            className="save-btn"
            onClick={
              saveTest
            }
          >
            <Save
              size={18}
            />

            Save Test
          </button>
        </div>
      </div>

      {/* TEST TABLE */}

      <div className="welcome-card">
        <h2>
          Existing Tests
        </h2>

        <table className="hema-table">
          <thead>
            <tr>
              <th>
                Test Name
              </th>

              <th>
                Department
              </th>

              <th>
                Panel
              </th>

              <th>
                Category
              </th>

              <th>
                Price
              </th>

              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {tests.map(
              (test) => (
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
                    {
                      test.department
                    }
                  </td>

                  <td>
                    {
                      test.panel_name
                    }
                  </td>

                  <td>
                    {
                      test.category
                    }
                  </td>

                  <td>
                    ₦
                    {
                      test.price
                    }
                  </td>

                  <td>
                    <button
                      className="print-btn"
                      onClick={() =>
                        deleteTest(
                          test.id
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />

                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}