import "../styles/testControl.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlaskConical,
  Save,
  Search,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

import {
  pefaTestLibrary,
} from "../data/pefaTestLibrary";

export default function TestControlPortal() {

  /* =========================================
     STATES
  ========================================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    tests,
    setTests,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    panelSearch,
    setPanelSearch,
  ] = useState("");

  const [
    editId,
    setEditId,
  ] = useState(null);

const initializeLibrary =
  async () => {

    try {

      const result =
        await supabase

          .from(
            "master_tests"
          )

         .upsert(
  pefaTestLibrary,
  {
    onConflict:
      "test_name",
  }
)

          .select();

      if (
        result.error
      ) {

        alert(
          result.error.message
        );

        return;
      }

      alert(
        `Inserted ${
          result.data?.length || 0
        } tests`
      );

      await fetchTests();

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Import Failed"
      );
    }
  };

  /* =========================================
     INITIAL FORM
  ========================================= */

  const initialForm = {

    department: "",

    panel_name: "",

    test_name: "",

    test_type:
      "Single",

    result_type:
      "Quantitative",

    unit: "",

    panel_price: "",

    single_test_price:
      "",

    male_range: "",

    female_range:
      "",

    child_range: "",

    elderly_range:
      "",

    reference_value:
      "",

    critical_low: "",

    critical_high:
      "",

    options: "",

    template_type:
      "",
result_category: "",

    active_status:
      "Active",
  };

  const [
    formData,
    setFormData,
  ] = useState(
    initialForm
  );

  /* =========================================
     FETCH TESTS
  ========================================= */

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

      setTests(
        data || []
      );
    };

  useEffect(() => {
    fetchTests();
  }, []);

  /* =========================================
     FILTER TESTS
  ========================================= */

  const filteredTests =
    useMemo(() => {

      return tests.filter(
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

    }, [
      tests,
      search,
    ]);

  /* =========================================
     UNIQUE PANELS
  ========================================= */

  const uniquePanels = [

    ...new Map(

      tests

        .filter(
          (item) =>

            item.panel_name &&

            item.panel_name
              .trim() !== ""
        )

        .map(
          (item) => [

            item.panel_name,

            item,
          ]
        )

    ).values(),
  ];

  /* =========================================
     HANDLE INPUT CHANGE
  ========================================= */

  const handleChange =
    (e) => {

      setFormData({
        ...formData,

        [e.target.name]:
          e.target.value,
      });
    };

  /* =========================================
     SAVE TEST
  ========================================= */

  const saveTest =
    async () => {

      try {

        setLoading(true);

        /* VALIDATION */

        if (
          !formData.department ||
          !formData.test_name
        ) {

          alert(
            "Department and Test Name required"
          );

          return;
        }

        /* CLEAN DATA */

        const cleanedData = {

          ...formData,

          panel_price:

            formData.panel_price === ""

              ? null

              : Number(
                  formData.panel_price
                ),

          single_test_price:

            formData.single_test_price === ""

              ? null

              : Number(
                  formData.single_test_price
                ),
        };

        /* CREATE */

        if (!editId) {

          const {
            error,
          } = await supabase
            .from(
              "master_tests"
            )
            .insert([
              cleanedData,
            ]);

          if (error) {

            console.log(
              error
            );

            alert(
              error.message
            );

            return;
          }

          alert(
            "Test Created Successfully"
          );
        }

        /* UPDATE */

        else {

          const {
            error,
          } = await supabase
            .from(
              "master_tests"
            )
            .update(
              cleanedData
            )
            .eq(
              "id",
              editId
            );

          if (error) {

            console.log(
              error
            );

            alert(
              error.message
            );

            return;
          }

          alert(
            "Test Updated Successfully"
          );
        }

        /* RESET */

        setFormData(
          initialForm
        );

        setEditId(null);

        fetchTests();

      } catch (error) {

        console.log(
          error
        );

        alert(
          "Something went wrong"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =========================================
     EDIT TEST
  ========================================= */

  const editTest =
    (test) => {

      setEditId(
        test.id
      );

      setFormData({

        department:
          test.department ||
          "",

        panel_name:
          test.panel_name ||
          "",

        test_name:
          test.test_name ||
          "",

        test_type:
          test.test_type ||
          "Single",

        result_type:
          test.result_type ||
          "Quantitative",

        unit:
          test.unit ||
          "",

        panel_price:
          test.panel_price ||
          "",

        single_test_price:
          test.single_test_price ||
          "",

        male_range:
          test.male_range ||
          "",

        female_range:
          test.female_range ||
          "",

        child_range:
          test.child_range ||
          "",

        elderly_range:
          test.elderly_range ||
          "",

        reference_value:
          test.reference_value ||
          "",

        critical_low:
          test.critical_low ||
          "",

        critical_high:
          test.critical_high ||
          "",

        options:
          test.options ||
          "",

        template_type:
  test.template_type ||
  "",

result_category:
  test.result_category ||
  "",

active_status:
  test.active_status ||
  "Active",
      });
    };

  /* =========================================
     DELETE TEST
  ========================================= */

  const deleteTest =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this test?"
        );

      if (
        !confirmDelete
      ) return;

      const {
        error,
      } = await supabase
        .from(
          "master_tests"
        )
        .delete()
        .eq(
          "id",
          id
        );

      if (error) {

        alert(
          error.message
        );

        return;
      }

      fetchTests();
    };

  return (

    <div className="page">

      {/* =========================================
          HEADER
      ========================================= */}

<div className="test-header">

  <div>

    <h1>
      Test Control Portal
    </h1>

    <p>
      Enterprise Master
      Test Engine
    </p>

  </div>

  <div
    style={{
      display: "flex",
      gap: "10px",
      alignItems: "center",
    }}
  >

    <button
      onClick={
        initializeLibrary
      }
      style={{
        padding:
          "10px 16px",
        border: "none",
        borderRadius:
          "10px",
        cursor: "pointer",
        fontWeight: "600",
      }}
    >

      Initialize PEFA
      Library

    </button>

    <div
      className="test-badge"
    >

      <ShieldCheck
        size={18}
      />

      Dynamic LIS

    </div>

  </div>

</div>

      {/* =========================================
          CREATE / EDIT TEST
      ========================================= */}

      <div className="test-card">

        <div className="section-title">

          <Plus
            size={20}
          />

          <h2>
            Create / Edit Test
          </h2>

        </div>

        <div className="test-grid">

          <div>

            <label>
              Department
            </label>

            <select
              name="department"
              value={
                formData.department
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Select
              </option>

              <option>
                Hematology
              </option>

              <option>
                Chemistry
              </option>

              <option>
                Microbiology
              </option>

              <option>
                Serology
              </option>

              <option>
                Hormonal
              </option>

              <option>
                Ultrasound
              </option>

            </select>

          </div>

          <div>

            <label>
              Panel Name
            </label>

            <input
              name="panel_name"
              placeholder="CBC, LFT..."
              value={
                formData.panel_name
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Test Name
            </label>

            <input
              name="test_name"
              placeholder="Hemoglobin"
              value={
                formData.test_name
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Test Type
            </label>

            <select
              name="test_type"
              value={
                formData.test_type
              }
              onChange={
                handleChange
              }
            >

              <option>
                Single
              </option>

              <option>
                Panel
              </option>

            </select>

          </div>

          <div>

            <label>
              Result Type

<div>

  <label>
    Result Category
  </label>

<div>

  <label>
    Template Type
  </label>

  <select
    name="template_type"
    value={
      formData.template_type
    }
    onChange={
      handleChange
    }
  >

    <option value="">
      Select Template
    </option>

    <option>
      quantitative_single
    </option>

    <option>
      quantitative_panel
    </option>

    <option>
      qualitative
    </option>

    <option>
      widal
    </option>

    <option>
      mcs
    </option>

    <option>
      urinalysis
    </option>

    <option>
      stool_analysis
    </option>

    <option>
      sfa
    </option>

    <option>
      afb
    </option>

    <option>
      genexpert
    </option>

    <option>
      histology
    </option>

    <option>
      cytology
    </option>

  </select>

</div>

  <select
    name="result_category"
    value={
      formData.result_category
    }
    onChange={
      handleChange
    }
  >

    <option value="">
      Select Category
    </option>

    <option>
      Quantitative Single
    </option>

    <option>
      Quantitative Panel
    </option>

    <option>
      Qualitative
    </option>

    <option>
      Widal
    </option>

    <option>
      Microbiology
    </option>

    <option>
      Urinalysis
    </option>

    <option>
      Stool Analysis
    </option>

    <option>
      SFA
    </option>

    <option>
      AFB
    </option>

    <option>
      GeneXpert
    </option>

    <option>
      Histology
    </option>

    <option>
      Cytology
    </option>

  </select>

</div>
            </label>

            <select
              name="result_type"
              value={
                formData.result_type
              }
              onChange={
                handleChange
              }
            >

              <option>
                Quantitative
              </option>

              <option>
                Qualitative
              </option>

            </select>

          </div>

          <div>

            <label>
              Unit
            </label>

            <input
              name="unit"
              value={
                formData.unit
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Panel Price
            </label>

            <input
              type="number"
              name="panel_price"
              value={
                formData.panel_price
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Single Test Price
            </label>

            <input
              type="number"
              name="single_test_price"
              value={
                formData.single_test_price
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Male Range
            </label>

            <input
              name="male_range"
              value={
                formData.male_range
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Female Range
            </label>

            <input
              name="female_range"
              value={
                formData.female_range
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Child Range
            </label>

            <input
              name="child_range"
              value={
                formData.child_range
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Elderly Range
            </label>

            <input
              name="elderly_range"
              value={
                formData.elderly_range
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Reference Value
            </label>

            <input
              name="reference_value"
              value={
                formData.reference_value
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Critical Low
            </label>

            <input
              name="critical_low"
              value={
                formData.critical_low
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div>

            <label>
              Critical High
            </label>

            <input
              name="critical_high"
              value={
                formData.critical_high
              }
              onChange={
                handleChange
              }
            />

          </div>

        </div>

        <button
          className="save-test-btn"
          onClick={
            saveTest
          }
          disabled={
            loading
          }
        >

          <Save
            size={18}
          />

          {loading
            ? "Saving..."
            : editId
            ? "Update Test"
            : "Create Test"}

        </button>

      </div>

      {/* =========================================
          PANEL TEST PRICING
      ========================================= */}

      <div className="test-card">

        <div className="section-title">

          <FlaskConical
            size={20}
          />

          <h2>
            Panel Test Pricing
          </h2>

        </div>

        <div className="search-box">

          <Search
            size={18}
          />

          <input
            type="text"
            placeholder="Search panel..."
            value={
              panelSearch
            }
            onChange={(e) =>
              setPanelSearch(
                e.target.value
              )
            }
          />

        </div>

        {panelSearch ? (

          <div className="panel-price-grid">

            {uniquePanels

              .filter(
                (panel) =>

                  panel.panel_name
                    ?.toLowerCase()
                    .includes(
                      panelSearch.toLowerCase()
                    )
              )

              .map(
                (panel) => (

                  <div
                    key={panel.id}
                    className="panel-price-card"
                  >

                    <div className="panel-price-top">

                      <div>

                        <h3>
                          {
                            panel.panel_name
                          }
                        </h3>

                        <p>
                          {
                            panel.department
                          }
                        </p>

                      </div>

                    </div>

                    <div className="panel-price-body">

                      <label>
                        Panel Price
                      </label>

                      <input
                        type="number"

                        value={
                          panel.panel_price || ""
                        }

                        onChange={(e) => {

                          const value =
                            e.target.value;

                          setTests(

                            tests.map(
                              (item) =>

                                item.panel_name ===
                                panel.panel_name

                                  ? {
                                      ...item,
                                      panel_price:value,
                                    }

                                  : item
                            )
                          );
                        }}
                      />

                    </div>

                    <button

                      className="save-panel-btn"

                      onClick={async () => {

                        await supabase
                          .from(
                            "master_tests"
                          )
                          .update({
                            panel_price:
                              panel.panel_price,
                          })
                          .eq(
                            "panel_name",
                            panel.panel_name
                          );

                        alert(
                          "Panel price updated"
                        );

                        fetchTests();
                      }}
                    >

                      <Save
                        size={16}
                      />

                      Save Price

                    </button>

                  </div>
                )
              )}

          </div>

        ) : (

          <div className="empty-search">

            Search panel
            test to edit
            pricing

          </div>
        )}

      </div>

      {/* =========================================
          SEARCH TESTS
      ========================================= */}

      <div className="test-card">

        <div className="section-title">

          <Search
            size={20}
          />

          <h2>
            Search Master Tests
          </h2>

        </div>

        <div className="search-box">

          <Search
            size={18}
          />

          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        {search ? (

          filteredTests.length >
          0 ? (

            <div className="master-tests">

              {filteredTests.map(
                (test) => (

                  <div
                    key={test.id}
                    className="master-test-card"
                  >

                    <div className="master-test-top">

                      <div>

                        <h3>
                          {
                            test.test_name
                          }
                        </h3>

                        <p>

                          {
                            test.panel_name
                          }

                          {" • "}

                          {
                            test.department
                          }

                        </p>

                      </div>

                    </div>

                    <div className="master-test-details">

                      <span>

                        ₦

                        {Number(

                          test.test_type ===
                          "Panel"

                            ? test.panel_price

                            : test.single_test_price

                        ).toLocaleString()}

                      </span>

                      <span>
                        {
                          test.result_type
                        }
                      </span>

                      <span>
                        {
                          test.test_type
                        }
                      </span>

                    </div>

                    <div className="master-actions">

                      <button
                        className="edit-btn"
                        onClick={() =>
                          editTest(
                            test
                          )
                        }
                      >

                        <Edit
                          size={16}
                        />

                        Edit

                      </button>

                      <button
                        className="delete-btn"
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

                    </div>

                  </div>
                )
              )}

            </div>

          ) : (

            <div className="empty-search">

              No test found

            </div>
          )

        ) : null}

      </div>

    </div>
  );
}