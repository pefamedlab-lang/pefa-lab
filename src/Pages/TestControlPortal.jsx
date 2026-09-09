import "../styles/testcontrol.css";

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
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { supabase } from "../supabase";

export default function TestControlPortal() {
  /* =====================================================
     INITIAL FORM
  ====================================================== */

  const INITIAL_FORM = {
    department: "",
    panel_name: "",

    test_name: "",
    test_code: "",

    test_type: "Single",
    is_panel: false,

    result_type: "Quantitative",
    result_category: "",
    template_type: "",

    unit: "",

    single_test_price: "",
    panel_price: "",

    male_range: "",
    female_range: "",
    child_range: "",
    elderly_range: "",

    reference_value: "",

    critical_low: "",
    critical_high: "",

    options: "",
    result_template: "",

    specimen: "",
    specimen_container: "",
    container: "",

    turnaround_time: "",
    methodology: "",
    instrument: "",

    decimal_places: "",
    normal_low: "",
    normal_high: "",

    display_order: "",
    report_group: "",
    parent_panel: "",

    active: true,
    active_status: "Active",
  };

  /* =====================================================
     STATES
  ====================================================== */

  const [tests, setTests] = useState([]);
  const [panels, setPanels] = useState([]);

  /*
   * Structure:
   *
   * {
   *   panelId: [
   *     {
   *       ...panel_tests row,
   *       master_tests: {...}
   *     }
   *   ]
   * }
   */
  const [panelComponents, setPanelComponents] =
    useState({});

  const [loading, setLoading] = useState(false);
  const [loadingTests, setLoadingTests] = useState(true);
  const [loadingPanels, setLoadingPanels] = useState(true);

  const [search, setSearch] = useState("");
  const [panelSearch, setPanelSearch] = useState("");

  const [editId, setEditId] = useState(null);

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  /* =====================================================
     FETCH INDIVIDUAL TESTS
  ====================================================== */

  const fetchTests = async () => {
    try {
      setLoadingTests(true);

      const {
        data,
        error,
      } = await supabase
        .from("master_tests")
        .select("*")
        .eq("is_panel", false)
        .neq("test_type", "Panel")
        .order("test_name", {
          ascending: true,
        });

      if (error) {
        console.error(
          "FETCH INDIVIDUAL TESTS ERROR:",
          error
        );

        throw error;
      }

      setTests(data || []);
    } catch (error) {
      console.error(
        "FETCH TESTS ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to load laboratory tests."
      );
    } finally {
      setLoadingTests(false);
    }
  };

  /* =====================================================
     FETCH PANELS
  ====================================================== */

  const fetchPanels = async () => {
    try {
      setLoadingPanels(true);

      /*
       * IMPORTANT:
       *
       * Do not depend on getPanels().
       *
       * A panel is a master_tests record where:
       *
       * is_panel = true
       *
       * OR
       *
       * test_type = "Panel"
       */

      const {
        data: panelData,
        error: panelError,
      } = await supabase
        .from("master_tests")
        .select("*")
        .or(
          "is_panel.eq.true,test_type.eq.Panel"
        )
        .order("test_name", {
          ascending: true,
        });

      if (panelError) {
        throw panelError;
      }

      const normalizedPanels =
        panelData || [];

      setPanels(normalizedPanels);

      /*
       * No panels means there is nothing else
       * to load.
       */

      if (normalizedPanels.length === 0) {
        setPanelComponents({});
        return;
      }

      /* =================================================
         LOAD ALL PANEL MEMBERSHIP ROWS
      ================================================== */

      const panelIds =
        normalizedPanels.map(
          (panel) => panel.id
        );

      const {
        data: membershipRows,
        error: membershipError,
      } = await supabase
        .from("panel_tests")
        .select("*")
        .in("panel_id", panelIds);

      if (membershipError) {
        throw membershipError;
      }

      const memberships =
        membershipRows || [];

      /*
       * If panel_tests is empty, every panel correctly
       * gets an empty array.
       */

      if (memberships.length === 0) {
        const emptyMap = {};

        panelIds.forEach((id) => {
          emptyMap[id] = [];
        });

        setPanelComponents(emptyMap);

        return;
      }

      /* =================================================
         GET COMPONENT TEST IDS
      ================================================== */

      const testIds = [
        ...new Set(
          memberships
            .map((row) => row.test_id)
            .filter(Boolean)
        ),
      ];

      let componentTests = [];

      if (testIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("master_tests")
          .select("*")
          .in("id", testIds);

        if (error) {
          throw error;
        }

        componentTests = data || [];
      }

      /*
       * Convert tests into a quick lookup map.
       */

      const testMap = new Map();

      componentTests.forEach((test) => {
        testMap.set(
          String(test.id),
          test
        );
      });

      /* =================================================
         BUILD PANEL -> COMPONENT TEST MAP
      ================================================== */

      const componentMap = {};

      panelIds.forEach((panelId) => {
        componentMap[panelId] = [];
      });

      memberships.forEach((membership) => {
        const panelId =
          membership.panel_id;

        const test =
          testMap.get(
            String(
              membership.test_id
            )
          );

        /*
         * Preserve the panel_tests row and attach
         * the actual master test.
         */

        if (!componentMap[panelId]) {
          componentMap[panelId] = [];
        }

        componentMap[panelId].push({
          ...membership,
          master_tests:
            test || null,
        });
      });

      setPanelComponents(
        componentMap
      );
    } catch (error) {
      console.error(
        "FETCH PANELS ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to load panels."
      );

      setPanels([]);
      setPanelComponents({});
    } finally {
      setLoadingPanels(false);
    }
  };

  /* =====================================================
     REFRESH EVERYTHING
  ====================================================== */

  const fetchAll = async () => {
    await Promise.all([
      fetchTests(),
      fetchPanels(),
    ]);
  };

  /* =====================================================
     INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    fetchAll();
  }, []);

  /* =====================================================
     HANDLE FORM CHANGE
  ====================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
     RESET FORM
  ====================================================== */

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM,
    });

    setEditId(null);
  };

  /* =====================================================
     EDIT TEST / PANEL
  ====================================================== */

  const editTest = (test) => {
    const isPanel =
      test.is_panel === true ||
      test.test_type === "Panel";

    setEditId(test.id);

    setFormData({
      department:
        test.department || "",

      panel_name:
        test.panel_name || "",

      test_name:
        test.test_name || "",

      test_code:
        test.test_code || "",

      test_type:
        isPanel
          ? "Panel"
          : test.test_type || "Single",

      is_panel: isPanel,

      result_type:
        test.result_type ||
        "Quantitative",

      result_category:
        test.result_category || "",

      template_type:
        test.template_type || "",

      unit:
        test.unit || "",

      single_test_price:
        test.single_test_price ?? "",

      panel_price:
        test.panel_price ?? "",

      male_range:
        test.male_range || "",

      female_range:
        test.female_range || "",

      child_range:
        test.child_range || "",

      elderly_range:
        test.elderly_range || "",

      reference_value:
        test.reference_value || "",

      critical_low:
        test.critical_low || "",

      critical_high:
        test.critical_high || "",

      options:
        test.options || "",

      result_template:
        test.result_template || "",

      specimen:
        test.specimen || "",

      specimen_container:
        test.specimen_container || "",

      container:
        test.container || "",

      turnaround_time:
        test.turnaround_time || "",

      methodology:
        test.methodology || "",

      instrument:
        test.instrument || "",

      decimal_places:
        test.decimal_places ?? "",

      normal_low:
        test.normal_low ?? "",

      normal_high:
        test.normal_high ?? "",

      display_order:
        test.display_order ?? "",

      report_group:
        test.report_group || "",

      parent_panel:
        test.parent_panel || "",

      active:
        test.active !== false,

      active_status:
        test.active_status ||
        "Active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     NUMERIC VALUE
  ====================================================== */

  const numericValue = (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  };

  /* =====================================================
     SAVE TEST / PANEL
  ====================================================== */

  const saveTest = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (
        !formData.department.trim()
      ) {
        alert(
          "Please select a department."
        );
        return;
      }

      if (
        !formData.test_name.trim()
      ) {
        alert(
          "Please enter the test name."
        );
        return;
      }

      const isPanel =
        formData.test_type ===
          "Panel" ||
        formData.is_panel === true;

      const cleanedData = {
        department:
          formData.department.trim(),

        /*
         * panel_tests is the source of truth
         * for panel membership.
         */
        panel_name: null,

        test_name:
          formData.test_name.trim(),

        test_code:
          formData.test_code?.trim() ||
          null,

        test_type: isPanel
          ? "Panel"
          : "Single",

        is_panel: isPanel,

        result_type:
          formData.result_type ||
          "Quantitative",

        result_category:
          formData.result_category ||
          null,

        template_type:
          formData.template_type ||
          null,

        unit:
          formData.unit?.trim() ||
          null,

        single_test_price: isPanel
          ? 0
          : numericValue(
              formData.single_test_price
            ) ?? 0,

        panel_price: isPanel
          ? numericValue(
              formData.panel_price
            ) ?? 0
          : 0,

        male_range:
          formData.male_range?.trim() ||
          null,

        female_range:
          formData.female_range?.trim() ||
          null,

        child_range:
          formData.child_range?.trim() ||
          null,

        elderly_range:
          formData.elderly_range?.trim() ||
          null,

        reference_value:
          formData.reference_value?.trim() ||
          null,

        critical_low:
          formData.critical_low?.trim() ||
          null,

        critical_high:
          formData.critical_high?.trim() ||
          null,

        options:
          formData.options?.trim() ||
          null,

        result_template:
          formData.result_template?.trim() ||
          null,

        specimen:
          formData.specimen?.trim() ||
          null,

        specimen_container:
          formData.specimen_container?.trim() ||
          null,

        container:
          formData.container?.trim() ||
          null,

        turnaround_time:
          formData.turnaround_time?.trim() ||
          null,

        methodology:
          formData.methodology?.trim() ||
          null,

        instrument:
          formData.instrument?.trim() ||
          null,

        decimal_places:
          numericValue(
            formData.decimal_places
          ),

        normal_low:
          numericValue(
            formData.normal_low
          ),

        normal_high:
          numericValue(
            formData.normal_high
          ),

        display_order:
          numericValue(
            formData.display_order
          ),

        report_group:
          formData.report_group?.trim() ||
          null,

        parent_panel:
          formData.parent_panel?.trim() ||
          null,

        active:
          formData.active !== false,

        active_status:
          formData.active === false
            ? "Inactive"
            : "Active",
      };

      /* =================================================
         UPDATE
      ================================================== */

      if (editId) {
        const {
          error,
        } = await supabase
          .from("master_tests")
          .update(cleanedData)
          .eq("id", editId);

        if (error) {
          throw error;
        }

        alert(
          isPanel
            ? "Panel updated successfully."
            : "Test updated successfully."
        );
      }

      /* =================================================
         CREATE
      ================================================== */

      else {
        const {
          error,
        } = await supabase
          .from("master_tests")
          .insert([
            cleanedData,
          ]);

        if (error) {
          throw error;
        }

        alert(
          isPanel
            ? "Panel created successfully."
            : "Test created successfully."
        );
      }

      resetForm();

      await fetchAll();
    } catch (error) {
      console.error(
        "SAVE TEST ERROR:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while saving."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DELETE INDIVIDUAL TEST
  ====================================================== */

  const deleteTest = async (id) => {
    const test =
      tests.find(
        (item) => item.id === id
      );

    if (
      test?.is_panel === true ||
      test?.test_type === "Panel"
    ) {
      alert(
        "This is a panel. Please manage panels separately."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this test?"
      );

    if (!confirmed) return;

    try {
      setLoading(true);

      /*
       * Make sure the test is not currently
       * assigned to a panel.
       */

      const {
        data: panelRows,
        error: panelCheckError,
      } = await supabase
        .from("panel_tests")
        .select("id")
        .eq("test_id", id)
        .limit(1);

      if (panelCheckError) {
        throw panelCheckError;
      }

      if (
        panelRows &&
        panelRows.length > 0
      ) {
        alert(
          "This test is currently assigned to a panel. Remove it from the panel first before deleting the test."
        );

        return;
      }

      const {
        error,
      } = await supabase
        .from("master_tests")
        .delete()
        .eq("id", id)
        .eq("is_panel", false);

      if (error) {
        throw error;
      }

      if (editId === id) {
        resetForm();
      }

      alert(
        "Test deleted successfully."
      );

      await fetchAll();
    } catch (error) {
      console.error(
        "DELETE TEST ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to delete test."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FILTER MASTER TESTS
  ====================================================== */

  const filteredTests =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return tests;
      }

      return tests.filter(
        (test) => {
          const searchable = [
            test.test_name,
            test.test_code,
            test.department,
            test.result_type,
            test.result_category,
            test.template_type,
            test.unit,
            test.specimen,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            keyword
          );
        }
      );
    }, [tests, search]);

  /* =====================================================
     FILTER PANELS
  ====================================================== */

  const filteredPanels =
    useMemo(() => {
      const keyword =
        panelSearch
          .trim()
          .toLowerCase();

      if (!keyword) {
        return panels;
      }

      return panels.filter(
        (panel) => {
          const searchable = [
            panel.test_name,
            panel.test_code,
            panel.department,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            keyword
          );
        }
      );
    }, [
      panels,
      panelSearch,
    ]);

  /* =====================================================
     SAVE PANEL PRICE
  ====================================================== */

  const savePanelPrice = async (
    panel,
    price
  ) => {
    try {
      const numericPrice =
        numericValue(price) ?? 0;

      if (numericPrice < 0) {
        alert(
          "Panel price cannot be negative."
        );

        return;
      }

      setLoading(true);

      const {
        error,
      } = await supabase
        .from("master_tests")
        .update({
          panel_price:
            numericPrice,

          single_test_price: 0,

          test_type: "Panel",

          is_panel: true,
        })
        .eq("id", panel.id);

      if (error) {
        throw error;
      }

      alert(
        `${panel.test_name} panel price updated.`
      );

      await fetchPanels();
    } catch (error) {
      console.error(
        "SAVE PANEL PRICE ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to update panel price."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FORMAT PRICE
  ====================================================== */

  const formatPrice = (price) => {
    const value =
      Number(price || 0);

    return value.toLocaleString(
      "en-NG"
    );
  };

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div className="page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="test-header">

        <div>
          <h1>
            Test Control Portal
          </h1>

          <p>
            Laboratory Master Test
            Configuration
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
            type="button"
            onClick={fetchAll}
            disabled={
              loadingTests ||
              loadingPanels ||
              loading
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding:
                "10px 14px",
              borderRadius:
                "10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loadingTests ||
            loadingPanels ? (
              <Loader2
                size={16}
                className="spin"
              />
            ) : (
              <RefreshCw
                size={16}
              />
            )}

            Refresh
          </button>

          <div className="test-badge">
            <ShieldCheck
              size={18}
            />

            Dynamic LIS
          </div>
        </div>

      </div>

      {/* =================================================
          CREATE / EDIT TEST
      ================================================= */}

      <div className="test-card">

        <div className="section-title">

          {editId ? (
            <Edit size={20} />
          ) : (
            <Plus size={20} />
          )}

          <h2>
            {editId
              ? formData.is_panel
                ? "Edit Laboratory Panel"
                : "Edit Laboratory Test"
              : "Create Laboratory Test"}
          </h2>

        </div>

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <h3 className="form-subtitle">
          Basic Information
        </h3>

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
                Select Department
              </option>

              {[
                "Hematology",
                "Chemistry",
                "Microbiology",
                "Serology",
                "Immunology",
                "Hormonal",
                "Immunoassay",
                "Parasitology",
                "Molecular Biology",
                "Histology",
                "Histopathology",
                "Cytology",
                "Clinical Pathology",
                "Blood Bank",
                "Radiology",
              ].map(
                (department) => (
                  <option
                    key={
                      department
                    }
                    value={
                      department
                    }
                  >
                    {department}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label>
              Test Name / Panel Name
            </label>

            <input
              name="test_name"
              value={
                formData.test_name
              }
              onChange={
                handleChange
              }
              placeholder={
                formData.is_panel
                  ? "e.g. Complete Blood Count"
                  : "e.g. Hemoglobin"
              }
            />
          </div>

          <div>
            <label>
              Test / Panel Code
            </label>

            <input
              name="test_code"
              value={
                formData.test_code
              }
              onChange={
                handleChange
              }
              placeholder="e.g. CBC"
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
              onChange={(event) => {
                const value =
                  event.target.value;

                setFormData(
                  (previous) => ({
                    ...previous,
                    test_type:
                      value,
                    is_panel:
                      value ===
                      "Panel",
                  })
                );
              }}
            >
              <option value="Single">
                Single Test
              </option>

              <option value="Panel">
                Panel
              </option>
            </select>
          </div>

          <div>
            <label>
              Status
            </label>

            <select
              name="active_status"
              value={
                formData.active_status
              }
              onChange={(event) => {
                const value =
                  event.target.value;

                setFormData(
                  (previous) => ({
                    ...previous,
                    active_status:
                      value,
                    active:
                      value ===
                      "Active",
                  })
                );
              }}
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          {!formData.is_panel && (
            <div>
              <label>
                Single Test Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="single_test_price"
                value={
                  formData.single_test_price
                }
                onChange={
                  handleChange
                }
                placeholder="₦"
              />
            </div>
          )}

          {formData.is_panel && (
            <div>
              <label>
                Panel Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="panel_price"
                value={
                  formData.panel_price
                }
                onChange={
                  handleChange
                }
                placeholder="₦"
              />
            </div>
          )}

          <div>
            <label>
              Specimen
            </label>

            <input
              name="specimen"
              value={
                formData.specimen
              }
              onChange={
                handleChange
              }
              placeholder="e.g. Whole Blood"
            />
          </div>

          <div>
            <label>
              Specimen Container
            </label>

            <input
              name="specimen_container"
              value={
                formData.specimen_container
              }
              onChange={
                handleChange
              }
              placeholder="e.g. EDTA"
            />
          </div>

          <div>
            <label>
              Container
            </label>

            <input
              name="container"
              value={
                formData.container
              }
              onChange={
                handleChange
              }
              placeholder="e.g. Vacutainer"
            />
          </div>

          <div>
            <label>
              Turnaround Time
            </label>

            <input
              name="turnaround_time"
              value={
                formData.turnaround_time
              }
              onChange={
                handleChange
              }
              placeholder="e.g. 2 Hours"
            />
          </div>

          <div>
            <label>
              Methodology
            </label>

            <input
              name="methodology"
              value={
                formData.methodology
              }
              onChange={
                handleChange
              }
              placeholder="e.g. Automated"
            />
          </div>

          <div>
            <label>
              Instrument
            </label>

            <input
              name="instrument"
              value={
                formData.instrument
              }
              onChange={
                handleChange
              }
              placeholder="e.g. Mindray BC-6800"
            />
          </div>

        </div>

        {/* =================================================
            RESULT CONFIGURATION
        ================================================= */}

        <h3 className="form-subtitle">
          Result Configuration
        </h3>

        <div className="test-grid">

          <div>
            <label>
              Result Type
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
              <option value="Quantitative">
                Quantitative
              </option>

              <option value="Qualitative">
                Qualitative
              </option>
            </select>
          </div>

          <div>
            <label>
              Result Category
            </label>

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
                Microbiology
              </option>

              <option>
                Widal
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
                MCS
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

          <div>
            <label>
              Result Template
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

              <option value="quantitative_single">
                Quantitative Single
              </option>

              <option value="quantitative_panel">
                Quantitative Panel
              </option>

              <option value="qualitative">
                Qualitative
              </option>

              <option value="widal">
                Widal
              </option>

              <option value="mcs">
                MCS
              </option>

              <option value="urinalysis">
                Urinalysis
              </option>

              <option value="stool_analysis">
                Stool Analysis
              </option>

              <option value="sfa">
                Seminal Fluid Analysis
              </option>

              <option value="afb">
                AFB
              </option>

              <option value="genexpert">
                GeneXpert
              </option>

              <option value="histology">
                Histology
              </option>

              <option value="cytology">
                Cytology
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
              placeholder="e.g. g/dL"
            />
          </div>

          <div>
            <label>
              General Reference Value
            </label>

            <input
              name="reference_value"
              value={
                formData.reference_value
              }
              onChange={
                handleChange
              }
              placeholder="e.g. 12 - 16"
            />
          </div>

          <div>
            <label>
              Male Reference Range
            </label>

            <input
              name="male_range"
              value={
                formData.male_range
              }
              onChange={
                handleChange
              }
              placeholder="e.g. 13 - 17 g/dL"
            />
          </div>

          <div>
            <label>
              Female Reference Range
            </label>

            <input
              name="female_range"
              value={
                formData.female_range
              }
              onChange={
                handleChange
              }
              placeholder="e.g. 12 - 16 g/dL"
            />
          </div>

          <div>
            <label>
              Child Reference Range
            </label>

            <input
              name="child_range"
              value={
                formData.child_range
              }
              onChange={
                handleChange
              }
              placeholder="e.g. 11 - 14 g/dL"
            />
          </div>

          <div>
            <label>
              Elderly Reference Range
            </label>

            <input
              name="elderly_range"
              value={
                formData.elderly_range
              }
              onChange={
                handleChange
              }
              placeholder="Reference range"
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
              placeholder="Critical low value"
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
              placeholder="Critical high value"
            />
          </div>

          <div>
            <label>
              Result Options
            </label>

            <input
              name="options"
              value={
                formData.options
              }
              onChange={
                handleChange
              }
              placeholder="Positive, Negative"
            />
          </div>

          <div>
            <label>
              Decimal Places
            </label>

            <input
              type="number"
              min="0"
              name="decimal_places"
              value={
                formData.decimal_places
              }
              onChange={
                handleChange
              }
              placeholder="e.g. 2"
            />
          </div>

          <div>
            <label>
              Normal Low
            </label>

            <input
              type="number"
              name="normal_low"
              value={
                formData.normal_low
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div>
            <label>
              Normal High
            </label>

            <input
              type="number"
              name="normal_high"
              value={
                formData.normal_high
              }
              onChange={
                handleChange
              }
            />
          </div>

          <div>
            <label>
              Report Group
            </label>

            <input
              name="report_group"
              value={
                formData.report_group
              }
              onChange={
                handleChange
              }
              placeholder="e.g. CBC"
            />
          </div>

          <div>
            <label>
              Display Order
            </label>

            <input
              type="number"
              min="0"
              name="display_order"
              value={
                formData.display_order
              }
              onChange={
                handleChange
              }
            />
          </div>

        </div>

        {/* =================================================
            RESULT TEMPLATE
        ================================================= */}

        <div
          style={{
            marginTop: "20px",
          }}
        >
          <label>
            Result Template / Reporting
            Instructions
          </label>

          <textarea
            name="result_template"
            value={
              formData.result_template
            }
            onChange={
              handleChange
            }
            rows={5}
            placeholder="Enter reporting structure or instructions..."
            style={{
              width: "100%",
              resize: "vertical",
            }}
          />
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            className="save-test-btn"
            onClick={saveTest}
            disabled={loading}
          >
            {loading ? (
              <Loader2
                size={18}
                className="spin"
              />
            ) : (
              <Save size={18} />
            )}

            {loading
              ? "Saving..."
              : editId
              ? formData.is_panel
                ? "Update Panel"
                : "Update Test"
              : "Create Test"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "6px",
                padding:
                  "10px 16px",
                borderRadius:
                  "8px",
                border: "none",
                cursor:
                  "pointer",
              }}
            >
              <X size={17} />

              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* =================================================
          PANEL MANAGEMENT
      ================================================= */}

      <div className="test-card">

        <div className="section-title">

          <FlaskConical
            size={20}
          />

          <h2>
            Panel Management
          </h2>

        </div>

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search panels..."
            value={
              panelSearch
            }
            onChange={(event) =>
              setPanelSearch(
                event.target.value
              )
            }
          />

          {panelSearch && (
            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setPanelSearch("")
              }
            >
              <X size={15} />
            </button>
          )}

        </div>

        {loadingPanels ? (
          <div className="empty-search">

            <Loader2
              size={18}
              className="spin"
            />

            Loading panels...

          </div>
        ) : filteredPanels.length === 0 ? (
          <div className="empty-search">
            No panels found.
          </div>
        ) : (
          <div className="panel-price-grid">

            {filteredPanels.map(
              (panel) => (
                <PanelCard
                  key={panel.id}
                  panel={panel}
                  panelTests={
                    panelComponents[
                      panel.id
                    ] || []
                  }
                  formatPrice={
                    formatPrice
                  }
                  onSavePrice={
                    savePanelPrice
                  }
                  onEditPanel={
                    editTest
                  }
                  onEditTest={
                    editTest
                  }
                />
              )
            )}

          </div>
        )}

      </div>

      {/* =================================================
          MASTER TEST SEARCH
      ================================================= */}

      <div className="test-card">

        <div className="section-title">

          <Search size={20} />

          <h2>
            Test Master
          </h2>

        </div>

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search test, code, department, unit..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
            >
              <X size={15} />
            </button>
          )}

        </div>

        {!search ? (
          <div className="empty-search">
            Search the master test
            database to edit a test.
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="empty-search">
            No test found.
          </div>
        ) : (
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
                        {test.test_name}
                      </h3>

                      <p>
                        {test.department ||
                          "No department"}

                        {" • "}

                        {test.test_code ||
                          "No code"}
                      </p>

                    </div>

                    <span>
                      {test.active_status ||
                        "Active"}
                    </span>

                  </div>

                  <div className="master-test-details">

                    <span>
                      ₦
                      {formatPrice(
                        test.single_test_price
                      )}
                    </span>

                    <span>
                      {test.result_type ||
                        "—"}
                    </span>

                    <span>
                      {test.unit ||
                        "No unit"}
                    </span>

                    <span>
                      {test.template_type ||
                        "No template"}
                    </span>

                  </div>

                  <div
                    style={{
                      marginTop:
                        "10px",
                      fontSize:
                        "13px",
                    }}
                  >
                    <strong>
                      Reference:
                    </strong>{" "}

                    {test.reference_value ||
                      test.male_range ||
                      "Not configured"}
                  </div>

                  <div className="master-actions">

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() =>
                        editTest(test)
                      }
                    >
                      <Edit size={16} />

                      Edit
                    </button>

                    <button
                      type="button"
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
        )}

      </div>

    </div>
  );
}

/* =====================================================
   PANEL CARD
====================================================== */

function PanelCard({
  panel,
  panelTests,
  formatPrice,
  onSavePrice,
  onEditPanel,
  onEditTest,
}) {
  const [
    price,
    setPrice,
  ] = useState(
    panel.panel_price ?? ""
  );

  useEffect(() => {
    setPrice(
      panel.panel_price ?? ""
    );
  }, [panel.panel_price]);

  /*
   * Make absolutely sure only valid component
   * records are used.
   */

  const validPanelTests =
    Array.isArray(panelTests)
      ? panelTests.filter(
          (item) =>
            item &&
            item.test_id
        )
      : [];

  /*
   * Calculate the total from the actual
   * master_tests records.
   */

  const individualTotal =
    validPanelTests.reduce(
      (sum, item) => {
        const test =
          item.master_tests;

        return (
          sum +
          Number(
            test?.single_test_price ||
              0
          )
        );
      },
      0
    );

  const currentPanelPrice =
    Number(
      panel.panel_price || 0
    );

  const savings = Math.max(
    individualTotal -
      currentPanelPrice,
    0
  );

  return (
    <div className="panel-price-card">

      {/* =================================================
          PANEL HEADER
      ================================================= */}

      <div className="panel-price-top">

        <div>

          <h3>
            {panel.test_name}
          </h3>

          <p>
            {panel.department ||
              "No department"}

            {" • "}

            {panel.test_code ||
              "No code"}
          </p>

        </div>

        <strong>
          {validPanelTests.length}{" "}
          {validPanelTests.length === 1
            ? "test"
            : "tests"}
        </strong>

      </div>

      {/* =================================================
          EDIT PANEL
      ================================================= */}

      <button
        type="button"
        className="edit-btn"
        onClick={() =>
          onEditPanel(panel)
        }
        style={{
          marginTop: "10px",
        }}
      >
        <Edit size={14} />

        Edit Panel
      </button>

      {/* =================================================
          COMPONENT TESTS
      ================================================= */}

      <div
        style={{
          marginTop: "12px",
        }}
      >

        {validPanelTests.length === 0 ? (
          <div
            style={{
              fontSize: "13px",
              opacity: 0.7,
            }}
          >
            No component tests assigned.
          </div>
        ) : (
          validPanelTests.map(
            (item) => {
              const test =
                item.master_tests;

              return (
                <div
                  key={item.id}
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: "10px",
                    padding:
                      "7px 0",
                    borderBottom:
                      "1px solid #eee",
                  }}
                >

                  <div>

                    <strong>
                      {test?.test_name ||
                        "Unknown test"}
                    </strong>

                    <small
                      style={{
                        display:
                          "block",
                        opacity: 0.7,
                      }}
                    >
                      {test?.test_code ||
                        "No code"}

                      {" • "}

                      ₦
                      {formatPrice(
                        test?.single_test_price
                      )}
                    </small>

                  </div>

                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() =>
                      test &&
                      onEditTest(
                        test
                      )
                    }
                    title="Edit test"
                  >
                    <Edit
                      size={14}
                    />
                  </button>

                </div>
              );
            }
          )
        )}

      </div>

      {/* =================================================
          PANEL SUMMARY
      ================================================= */}

      <div
        style={{
          marginTop: "12px",
          display: "grid",
          gap: "5px",
          fontSize: "13px",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >
          <span>
            Individual Total
          </span>

          <strong>
            ₦
            {formatPrice(
              individualTotal
            )}
          </strong>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >
          <span>
            Current Panel Price
          </span>

          <strong>
            ₦
            {formatPrice(
              currentPanelPrice
            )}
          </strong>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >
          <span>
            Patient Savings
          </span>

          <strong>
            ₦
            {formatPrice(
              savings
            )}
          </strong>
        </div>

      </div>

      {/* =================================================
          PANEL PRICE
      ================================================= */}

      <div className="panel-price-body">

        <label>
          Panel Price
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) =>
            setPrice(
              event.target.value
            )
          }
        />

        <small>
          Current: ₦
          {formatPrice(
            currentPanelPrice
          )}
        </small>

      </div>

      <button
        type="button"
        className="save-panel-btn"
        onClick={() =>
          onSavePrice(
            panel,
            price
          )
        }
      >
        <Save size={16} />

        Save Panel Price
      </button>

    </div>
  );
}