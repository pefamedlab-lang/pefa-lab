import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Save,
  Copy,
  Trash2,
  FlaskConical,
  Loader2,
  X,
} from "lucide-react";

import {
  getPanels,
  getAvailableTests,
  getPanelTests,
  createPanel,
  updatePanel,
  deletePanel,
  clonePanel,
  addPanelTest,
  removePanelTest,
} from "../../services/panelService";

import "./panelbuilder.css";

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  test_name: "",
  test_code: "",
  department: "",
  panel_price: "",
  specimen: "",
  specimen_container: "",
  container: "",
  turnaround_time: "",
  methodology: "",
  instrument: "",
  active: true,
  active_status: "Active",
  is_panel: true,
  test_type: "Panel",
};

/* =========================================================
   DEPARTMENTS
========================================================= */

const DEPARTMENTS = [
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
];

/* =========================================================
   HELPER
   Normalize panel_tests rows.

   Your database has produced rows like:

   {
     id: 1,
     panel_id: 98,
     test_id: 4,
     master_test_id: 4,
     test_name: "PCV",
     ...
   }

   But Supabase can also return:

   {
     id: 1,
     panel_id: 98,
     test_id: 4,
     master_tests: {
       id: 4,
       test_name: "PCV",
       ...
     }
   }

   This helper supports BOTH.
========================================================= */

function getComponentTest(row) {
  if (!row) {
    return null;
  }

  if (
    row.master_tests &&
    typeof row.master_tests === "object"
  ) {
    return row.master_tests;
  }

  if (
    row.master_test &&
    typeof row.master_test === "object"
  ) {
    return row.master_test;
  }

  return {
    id:
      row.master_test_id ??
      row.test_id ??
      null,

    test_name:
      row.test_name ??
      "",

    test_code:
      row.test_code ??
      null,

    department:
      row.department ??
      null,

    unit:
      row.unit ??
      null,

    result_type:
      row.result_type ??
      null,

    single_test_price:
      row.single_test_price ??
      0,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function PanelBuilder() {
  /* =======================================================
     STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [panels, setPanels] =
    useState([]);

  const [availableTests, setAvailableTests] =
    useState([]);

  const [selectedPanel, setSelectedPanel] =
    useState(null);

  const [panelTests, setPanelTests] =
    useState([]);

  const [panelSearch, setPanelSearch] =
    useState("");

  const [testSearch, setTestSearch] =
    useState("");

  const [form, setForm] =
    useState(INITIAL_FORM);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        panelData,
        testData,
      ] = await Promise.all([
        getPanels(),
        getAvailableTests(),
      ]);

      setPanels(
        Array.isArray(panelData)
          ? panelData
          : []
      );

      setAvailableTests(
        Array.isArray(testData)
          ? testData
          : []
      );
    } catch (error) {
      console.error(
        "PANEL BUILDER LOAD ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to load panel data."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     OPEN PANEL
  ======================================================= */

  async function openPanel(panel) {
    if (!panel) return;

    try {
      setSelectedPanel(panel);

      setForm({
        ...INITIAL_FORM,
        ...panel,

        test_name:
          panel.test_name ?? "",

        test_code:
          panel.test_code ?? "",

        department:
          panel.department ?? "",

        panel_price:
          panel.panel_price ?? "",

        specimen:
          panel.specimen ?? "",

        specimen_container:
          panel.specimen_container ?? "",

        container:
          panel.container ?? "",

        turnaround_time:
          panel.turnaround_time ?? "",

        methodology:
          panel.methodology ?? "",

        instrument:
          panel.instrument ?? "",

        active:
          panel.active !== false,

        active_status:
          panel.active_status ||
          "Active",

        is_panel: true,

        test_type: "Panel",
      });

      const rows =
        await getPanelTests(panel.id);

      setPanelTests(
        Array.isArray(rows)
          ? rows
          : []
      );
    } catch (error) {
      console.error(
        "OPEN PANEL ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to open panel."
      );
    }
  }

  /* =======================================================
     INPUT
  ======================================================= */

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /* =======================================================
     NEW PANEL
  ======================================================= */

  function newPanel() {
    setSelectedPanel(null);
    setPanelTests([]);
    setPanelSearch("");
    setTestSearch("");

    setForm({
      ...INITIAL_FORM,
    });
  }

  /* =======================================================
     FILTER PANELS
  ======================================================= */

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

  /* =======================================================
     FILTER TESTS
  ======================================================= */

  const filteredTests =
    useMemo(() => {
      const keyword =
        testSearch
          .trim()
          .toLowerCase();

      if (!keyword) {
        return availableTests;
      }

      return availableTests.filter(
        (test) => {
          const searchable = [
            test.test_name,
            test.test_code,
            test.department,
            test.unit,
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
      availableTests,
      testSearch,
    ]);

  /* =======================================================
     GROUP TESTS BY DEPARTMENT
  ======================================================= */

  const groupedTests =
    useMemo(() => {
      return filteredTests.reduce(
        (groups, test) => {
          const department =
            test.department ||
            "Others";

          if (!groups[department]) {
            groups[department] = [];
          }

          groups[department].push(
            test
          );

          return groups;
        },
        {}
      );
    }, [filteredTests]);

  /* =======================================================
     SAVE PANEL
  ======================================================= */

  async function savePanel() {
    if (saving) return;

    const panelName =
      String(
        form.test_name || ""
      ).trim();

    const department =
      String(
        form.department || ""
      ).trim();

    if (!panelName) {
      alert(
        "Panel Name is required."
      );
      return;
    }

    if (!department) {
      alert(
        "Department is required."
      );
      return;
    }

    const numericPrice =
      form.panel_price === "" ||
      form.panel_price === null ||
      form.panel_price === undefined
        ? 0
        : Number(form.panel_price);

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice < 0
    ) {
      alert(
        "Please enter a valid panel price."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        test_name:
          panelName,

        test_code:
          form.test_code?.trim() ||
          null,

        department,

        panel_price:
          numericPrice,

        specimen:
          form.specimen?.trim() ||
          null,

        specimen_container:
          form.specimen_container?.trim() ||
          null,

        container:
          form.container?.trim() ||
          null,

        turnaround_time:
          form.turnaround_time?.trim() ||
          null,

        methodology:
          form.methodology?.trim() ||
          null,

        instrument:
          form.instrument?.trim() ||
          null,

        is_panel: true,

        test_type: "Panel",

        active:
          form.active !== false,

        active_status:
          form.active !== false
            ? "Active"
            : "Inactive",

        single_test_price: 0,
      };

      let savedPanel;

      if (selectedPanel) {
        savedPanel =
          await updatePanel(
            selectedPanel.id,
            payload
          );
      } else {
        savedPanel =
          await createPanel(
            payload
          );
      }

      await loadData();

      await openPanel(
        savedPanel
      );

      alert(
        selectedPanel
          ? "Panel updated successfully."
          : "Panel created successfully."
      );
    } catch (error) {
      console.error(
        "SAVE PANEL ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to save panel."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE PANEL
  ======================================================= */

  async function removePanel() {
    if (!selectedPanel) return;

    const confirmed =
      window.confirm(
        `Delete "${selectedPanel.test_name}"?\n\nThis will also remove all tests assigned to this panel.`
      );

    if (!confirmed) return;

    try {
      setSaving(true);

      await deletePanel(
        selectedPanel.id
      );

      setSelectedPanel(null);
      setPanelTests([]);

      setForm({
        ...INITIAL_FORM,
      });

      await loadData();

      alert(
        "Panel deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE PANEL ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete panel."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     CLONE PANEL
  ======================================================= */

  async function duplicatePanel() {
    if (!selectedPanel) return;

    try {
      setSaving(true);

      const cloned =
        await clonePanel(
          selectedPanel,
          panelTests
        );

      await loadData();

      await openPanel(
        cloned
      );

      alert(
        "Panel cloned successfully."
      );
    } catch (error) {
      console.error(
        "CLONE PANEL ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to clone panel."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     ADD TEST
  ======================================================= */

  async function handleAddTest(test) {
    if (!selectedPanel) {
      alert(
        "Please save the panel first."
      );
      return;
    }

    const exists =
      panelTests.some(
        (row) => {
          const existingTestId =
            row.master_test_id ??
            row.test_id ??
            getComponentTest(row)?.id;

          return (
            Number(existingTestId) ===
            Number(test.id)
          );
        }
      );

    if (exists) {
      alert(
        "Test already exists in this panel."
      );
      return;
    }

    try {
      setSaving(true);

      await addPanelTest(
        selectedPanel.id,
        test.id,
        panelTests.length + 1
      );

      const rows =
        await getPanelTests(
          selectedPanel.id
        );

      setPanelTests(
        Array.isArray(rows)
          ? rows
          : []
      );
    } catch (error) {
      console.error(
        "ADD PANEL TEST ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to add test."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     REMOVE TEST
  ======================================================= */

  async function handleRemoveTest(
    testId
  ) {
    if (!selectedPanel) return;

    try {
      setSaving(true);

      await removePanelTest(
        selectedPanel.id,
        testId
      );

      const rows =
        await getPanelTests(
          selectedPanel.id
        );

      setPanelTests(
        Array.isArray(rows)
          ? rows
          : []
      );
    } catch (error) {
      console.error(
        "REMOVE PANEL TEST ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to remove test."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const totalTests =
    panelTests.length;

  const panelPrice =
    Number(
      form.panel_price || 0
    );

  const individualTotal =
    panelTests.reduce(
      (sum, row) => {
        const test =
          getComponentTest(row);

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

  const savings =
    Math.max(
      individualTotal -
        panelPrice,
      0
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="panel-builder">

      {/* =================================================
          HEADER
      ================================================== */}

      <div className="panel-header">

        <div>
          <h1>
            <FlaskConical size={24} />
            Panel Builder
          </h1>

          <p>
            Create laboratory panels
            and manage their component
            tests.
          </p>
        </div>

        <button
          type="button"
          className="new-panel-btn"
          onClick={newPanel}
          disabled={saving}
        >
          <Plus size={18} />
          New Panel
        </button>
      </div>

      {/* =================================================
          BODY
      ================================================== */}

      <div className="panel-body">

        {/* ===============================================
            LEFT SIDEBAR
        ================================================ */}

        <aside className="panel-sidebar">

          <div className="sidebar-title">
            <strong>
              Laboratory Panels
            </strong>

            <span>
              {panels.length}
            </span>
          </div>

          <div className="search-box">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search panels..."
              value={panelSearch}
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

          {loading ? (
            <div className="loading-box">

              <Loader2
                size={22}
                className="spin"
              />

              Loading panels...
            </div>
          ) : (
            <div className="panel-list">

              {filteredPanels.length ===
              0 ? (
                <div className="empty-box">
                  No panels found.
                </div>
              ) : (
                filteredPanels.map(
                  (panel) => (
                    <button
                      type="button"
                      key={panel.id}
                      className={`panel-list-item ${
                        selectedPanel?.id ===
                        panel.id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        openPanel(panel)
                      }
                    >
                      <div>

                        <strong>
                          {panel.test_name}
                        </strong>

                        <small>
                          {panel.test_code ||
                            "No code"}
                        </small>

                        <small>
                          {panel.department ||
                            "No department"}
                        </small>

                      </div>

                      <span>
                        ₦
                        {Number(
                          panel.panel_price ||
                            0
                        ).toLocaleString(
                          "en-NG"
                        )}
                      </span>
                    </button>
                  )
                )
              )}

            </div>
          )}

        </aside>

        {/* ===============================================
            RIGHT CONTENT
        ================================================ */}

        <main className="panel-content">

          {/* =============================================
              PANEL INFORMATION
          ============================================== */}

          <section className="panel-card">

            <div className="card-heading">

              <div>

                <h2>
                  {selectedPanel
                    ? "Edit Panel"
                    : "Create Panel"}
                </h2>

                <p>
                  Configure the laboratory
                  panel information.
                </p>

              </div>

              {selectedPanel && (
                <span className="editing-badge">
                  Editing
                </span>
              )}

            </div>

            <div className="panel-grid">

              {/* PANEL NAME */}

              <div className="form-group">

                <label>
                  Panel Name
                </label>

                <input
                  name="test_name"
                  value={
                    form.test_name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Complete Blood Count"
                />

              </div>

              {/* CODE */}

              <div className="form-group">

                <label>
                  Panel Code
                </label>

                <input
                  name="test_code"
                  value={
                    form.test_code
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="CBC"
                />

              </div>

              {/* DEPARTMENT */}

              <div className="form-group">

                <label>
                  Department
                </label>

                <select
                  name="department"
                  value={
                    form.department
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select Department
                  </option>

                  {DEPARTMENTS.map(
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

              {/* PANEL PRICE */}

              <div className="form-group">

                <label>
                  Panel Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="panel_price"
                  value={
                    form.panel_price
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                />

              </div>

              {/* SPECIMEN */}

              <div className="form-group">

                <label>
                  Specimen
                </label>

                <input
                  name="specimen"
                  value={
                    form.specimen
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Whole Blood"
                />

              </div>

              {/* SPECIMEN CONTAINER */}

              <div className="form-group">

                <label>
                  Specimen Container
                </label>

                <input
                  name="specimen_container"
                  value={
                    form.specimen_container
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="EDTA"
                />

              </div>

              {/* CONTAINER */}

              <div className="form-group">

                <label>
                  Container
                </label>

                <input
                  name="container"
                  value={
                    form.container
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Vacutainer"
                />

              </div>

              {/* TURNAROUND */}

              <div className="form-group">

                <label>
                  Turnaround Time
                </label>

                <input
                  name="turnaround_time"
                  value={
                    form.turnaround_time
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="2 Hours"
                />

              </div>

              {/* METHODOLOGY */}

              <div className="form-group">

                <label>
                  Methodology
                </label>

                <input
                  name="methodology"
                  value={
                    form.methodology
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Automated"
                />

              </div>

              {/* INSTRUMENT */}

              <div className="form-group">

                <label>
                  Instrument
                </label>

                <input
                  name="instrument"
                  value={
                    form.instrument
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Mindray BC-6800"
                />

              </div>

              {/* STATUS */}

              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  name="active"
                  value={
                    form.active
                      ? "Active"
                      : "Inactive"
                  }
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,

                        active:
                          event.target
                            .value ===
                          "Active",

                        active_status:
                          event.target
                            .value,
                      })
                    )
                  }
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="panel-actions">

              <button
                type="button"
                className="save-btn"
                onClick={
                  savePanel
                }
                disabled={saving}
              >

                {saving ? (
                  <Loader2
                    size={18}
                    className="spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {saving
                  ? "Saving..."
                  : selectedPanel
                  ? "Update Panel"
                  : "Save Panel"}

              </button>

              {selectedPanel && (
                <>
                  <button
                    type="button"
                    className="clone-btn"
                    onClick={
                      duplicatePanel
                    }
                    disabled={saving}
                  >
                    <Copy size={18} />
                    Clone
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={
                      removePanel
                    }
                    disabled={saving}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}

              {selectedPanel && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={newPanel}
                  disabled={saving}
                >
                  <X size={18} />
                  New
                </button>
              )}

            </div>

          </section>

          {/* =============================================
              COMPONENTS
          ============================================== */}

          <div className="panel-components">

            {/* ===========================================
                AVAILABLE TESTS
            ============================================ */}

            <section className="component-card">

              <div className="card-heading">

                <div>

                  <h2>
                    Available Tests
                  </h2>

                  <p>
                    Add individual
                    laboratory tests to
                    this panel.
                  </p>

                </div>

                <span className="count-badge">
                  {availableTests.length}
                </span>

              </div>

              <div className="search-box">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search laboratory tests..."
                  value={
                    testSearch
                  }
                  onChange={(event) =>
                    setTestSearch(
                      event.target.value
                    )
                  }
                />

                {testSearch && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() =>
                      setTestSearch("")
                    }
                  >
                    <X size={15} />
                  </button>
                )}

              </div>

              <div className="available-tests">

                {Object.entries(
                  groupedTests
                ).length === 0 ? (
                  <div className="empty-box">
                    No tests found.
                  </div>
                ) : (
                  Object.entries(
                    groupedTests
                  ).map(
                    ([
                      department,
                      tests,
                    ]) => (

                      <div
                        key={
                          department
                        }
                        className="department-group"
                      >

                        <h3>
                          {department}

                          <span>
                            {tests.length}
                          </span>
                        </h3>

                        {tests.map(
                          (test) => {

                            const alreadyAdded =
                              panelTests.some(
                                (item) => {

                                  const existingId =
                                    item.master_test_id ??
                                    item.test_id ??
                                    getComponentTest(
                                      item
                                    )?.id;

                                  return (
                                    Number(
                                      existingId
                                    ) ===
                                    Number(
                                      test.id
                                    )
                                  );
                                }
                              );

                            return (

                              <div
                                key={
                                  test.id
                                }
                                className="available-test-row"
                              >

                                <div>

                                  <strong>
                                    {
                                      test.test_name
                                    }
                                  </strong>

                                  <small>

                                    {test.test_code ||
                                      "No code"}

                                    {" • "}

                                    ₦
                                    {Number(
                                      test.single_test_price ||
                                        0
                                    ).toLocaleString(
                                      "en-NG"
                                    )}

                                  </small>

                                </div>

                                {alreadyAdded ? (

                                  <span className="added-tag">
                                    Added
                                  </span>

                                ) : (

                                  <button
                                    type="button"
                                    className="add-test-btn"
                                    onClick={() =>
                                      handleAddTest(
                                        test
                                      )
                                    }
                                    disabled={
                                      !selectedPanel ||
                                      saving
                                    }
                                    title={
                                      !selectedPanel
                                        ? "Save the panel first"
                                        : "Add test"
                                    }
                                  >

                                    <Plus
                                      size={18}
                                    />

                                  </button>

                                )}

                              </div>
                            );
                          }
                        )}

                      </div>
                    )
                  )
                )}

              </div>

            </section>

            {/* =========================================
                PANEL COMPONENTS
            ========================================== */}

            <section className="component-card">

              <div className="card-heading">

                <div>

                  <h2>
                    Panel Components
                  </h2>

                  <p>
                    Tests currently
                    included in this
                    panel.
                  </p>

                </div>

                <span className="panel-count">
                  {totalTests} Test
                  {totalTests === 1
                    ? ""
                    : "s"}
                </span>

              </div>

              <div className="selected-tests">

                {panelTests.length ===
                0 ? (

                  <div className="empty-box">

                    {selectedPanel
                      ? "No tests added yet."
                      : "Save the panel before adding tests."}

                  </div>

                ) : (

                  panelTests.map(
                    (
                      item,
                      index
                    ) => {

                      const test =
                        getComponentTest(
                          item
                        );

                      const testId =
                        item.master_test_id ??
                        item.test_id ??
                        test?.id;

                      return (

                        <div
                          key={
                            item.id
                          }
                          className="selected-test-row"
                        >

                          <div className="selected-test-left">

                            <div className="test-number">
                              {index + 1}
                            </div>

                            <div>

                              <strong>
                                {test?.test_name ||
                                  "Unknown test"}
                              </strong>

                              <p>

                                {test?.test_code ||
                                  "No code"}

                                {" • "}

                                {test?.department ||
                                  "No department"}

                              </p>

                              <small>

                                {test?.unit ||
                                  test?.result_type ||
                                  "-"}

                              </small>

                            </div>

                          </div>

                          <div className="selected-test-right">

                            <span>

                              ₦
                              {Number(
                                test?.single_test_price ||
                                  0
                              ).toLocaleString(
                                "en-NG"
                              )}

                            </span>

                            <button
                              type="button"
                              className="remove-test-btn"
                              onClick={() =>
                                handleRemoveTest(
                                  testId
                                )
                              }
                              disabled={
                                saving
                              }
                              title="Remove test"
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

                          </div>

                        </div>
                      );
                    }
                  )
                )}

              </div>

              <hr />

              {/* SUMMARY */}

              <div className="panel-summary">

                <div>

                  <strong>
                    Total Tests
                  </strong>

                  <span>
                    {totalTests}
                  </span>

                </div>

                <div>

                  <strong>
                    Panel Price
                  </strong>

                  <span>

                    ₦
                    {panelPrice.toLocaleString(
                      "en-NG"
                    )}

                  </span>

                </div>

                <div>

                  <strong>
                    Individual Total
                  </strong>

                  <span>

                    ₦
                    {individualTotal.toLocaleString(
                      "en-NG"
                    )}

                  </span>

                </div>

                <div>

                  <strong>
                    Patient Savings
                  </strong>

                  <span>

                    ₦
                    {savings.toLocaleString(
                      "en-NG"
                    )}

                  </span>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}