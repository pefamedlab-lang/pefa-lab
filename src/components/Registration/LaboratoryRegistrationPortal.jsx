/* ==========================================================
   PEFA LAB
   LABORATORY REGISTRATION PORTAL
   ----------------------------------------------------------
   PATH:
   src/components/Registration/LaboratoryRegistrationPortal.jsx

   PURPOSE:
   - Load laboratory catalogue from master_tests
   - Use LIS master_tests.department as authoritative
   - Show active primary catalogue records
   - Allow panel children to ALSO remain standalone tests
   - Support laboratory panels
   - Bill panels once using panel_price
   - Preserve standalone child-test pricing
   - Keep panel components available for Result Entry
   - Prevent duplicate selections
   - Prevent panel + child double billing
   - Preserve existing RegistrationPortal interface
   ========================================================== */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
} from "lucide-react";

import { supabase } from "../../supabase";

export default function LaboratoryRegistrationPortal({
  form,
  setForm,
  selectedTests,
  setSelectedTests,
}) {
  /* ==========================================================
     SEARCH
  ========================================================== */

  const [search, setSearch] = useState("");

  /* ==========================================================
     MASTER TEST CATALOGUE
  ========================================================== */

  const [tests, setTests] = useState([]);

  const [loadingTests, setLoadingTests] =
    useState(true);

  /* ==========================================================
     EXPANDED PANELS
  ========================================================== */

  const [expandedPanels, setExpandedPanels] =
    useState({});

  /* ==========================================================
     LOAD MASTER TESTS
  ========================================================== */

  const loadTests = async () => {
    console.log(
      "[PEFA REGISTRATION] Loading master_tests..."
    );

    try {
      setLoadingTests(true);

      const {
        data,
        error,
      } = await supabase
        .from("master_tests")
        .select("*")
        .eq("active", true)
        .order("department")
        .order("display_order", {
          ascending: true,
          nullsFirst: false,
        })
        .order("test_name");

      if (error) {
        throw error;
      }

      console.log(
        "[PEFA REGISTRATION] master_tests loaded:",
        data
      );

      setTests(data || []);
    } catch (error) {
      console.error(
        "[PEFA REGISTRATION] LOAD MASTER TESTS ERROR:",
        error
      );

      setTests([]);
    } finally {
      setLoadingTests(false);
    }
  };

  /* ==========================================================
     LOAD ON PAGE OPEN
  ========================================================== */

  useEffect(() => {
    loadTests();
  }, []);

  /* ==========================================================
     PRIMARY CATALOGUE
     
     IMPORTANT:
     A panel child MAY ALSO BE PRIMARY.

     Example:
     
       HBsAg
         is_primary = true
         parent_panel = Blood Donation Workup

     This allows HBsAg to remain a standalone service
     while also functioning as a component of the panel.

     The panel itself remains the billable parent.
  ========================================================== */

  const primaryTests = useMemo(() => {
    return tests.filter(
      (test) =>
        test.active === true &&
        test.is_primary === true
    );
  }, [tests]);

  /* ==========================================================
     PANEL CHILDREN MAP
  ========================================================== */

  const panelChildrenMap = useMemo(() => {
    const map = {};

    tests.forEach((test) => {
      if (
        test.active !== true ||
        !test.parent_panel
      ) {
        return;
      }

      const key =
        String(test.parent_panel)
          .trim()
          .toLowerCase();

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(test);
    });

    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        const aOrder =
          Number(a.display_order ?? 999999);

        const bOrder =
          Number(b.display_order ?? 999999);

        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }

        return String(
          a.test_name || ""
        ).localeCompare(
          String(b.test_name || "")
        );
      });
    });

    return map;
  }, [tests]);

  /* ==========================================================
     GET PANEL CHILDREN
  ========================================================== */

  const getPanelChildren = (test) => {
    const panelName =
      test.panel_name ||
      test.test_name ||
      "";

    const key =
      String(panelName)
        .trim()
        .toLowerCase();

    return (
      panelChildrenMap[key] || []
    );
  };

  /* ==========================================================
     DETERMINE PANEL
  ========================================================== */

  const isPanel = (test) => {
    return (
      test.is_panel === true ||
      String(
        test.test_type || ""
      ).toLowerCase() === "panel" ||
      String(
        test.result_type || ""
      ).toLowerCase() === "panel"
    );
  };

  /* ==========================================================
     PRICE
  ========================================================== */

  const getTestPrice = (test) => {
    if (isPanel(test)) {
      return Number(
        test.panel_price || 0
      );
    }

    return Number(
      test.single_test_price || 0
    );
  };

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredTests = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    // Keep the complete catalogue hidden until the user searches.
    // Selected tests remain visible in the Selected Tests section below.
    if (!keyword) {
      return [];
    }

    return primaryTests.filter(
      (test) => {
        const panelChildren =
          isPanel(test)
            ? getPanelChildren(test)
            : [];

        const childNames =
          panelChildren
            .map(
              (child) =>
                child.test_name
            )
            .filter(Boolean)
            .join(" ");

        const searchable = [
          test.test_name,
          test.test_code,
          test.department,
          test.panel_name,
          test.specimen,
          test.specimen_container,
          test.test_type,
          childNames,
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
    search,
    primaryTests,
    panelChildrenMap,
  ]);

  /* ==========================================================
     CHECK DIRECT SELECTION
  ========================================================== */

  const isSelected = (test) => {
    return selectedTests.some(
      (item) =>
        String(item.id) ===
        String(test.id)
    );
  };

  /* ==========================================================
     FIND PANEL PARENT FOR A CHILD
  ========================================================== */

  const getChildPanelName = (test) => {
    return (
      test.parent_panel ||
      test.panel_name ||
      null
    );
  };

  /* ==========================================================
     CHECK WHETHER A CHILD IS ALREADY COVERED
     BY A SELECTED PANEL
  ========================================================== */

  const isCoveredBySelectedPanel = (
    test
  ) => {
    if (!test.parent_panel) {
      return false;
    }

    const parentKey =
      String(test.parent_panel)
        .trim()
        .toLowerCase();

    return selectedTests.some(
      (selected) => {
        if (
          !(
            selected.isPanel ||
            selected.is_panel
          )
        ) {
          return false;
        }

        const selectedPanelName =
          selected.panelName ||
          selected.panel_name ||
          selected.testName ||
          selected.test_name ||
          "";

        return (
          String(
            selectedPanelName
          )
            .trim()
            .toLowerCase() ===
          parentKey
        );
      }
    );
  };

  /* ==========================================================
     CHECK WHETHER A PANEL CONFLICTS WITH A SELECTED CHILD
     
     Example:
       HBsAg already selected
       User attempts Blood Donation Workup

     Prevent double billing.
  ========================================================== */

  const panelHasSelectedChild = (
    panel
  ) => {
    const children =
      getPanelChildren(panel);

    if (
      children.length === 0
    ) {
      return false;
    }

    const childIds =
      new Set(
        children.map(
          (child) =>
            String(child.id)
        )
      );

    return selectedTests.some(
      (selected) =>
        childIds.has(
          String(selected.id)
        )
    );
  };

  /* ==========================================================
     PANEL CONFLICT MESSAGE
  ========================================================== */

  const getSelectionConflict = (
    test
  ) => {
    const panel =
      isPanel(test);

    if (panel) {
      if (
        panelHasSelectedChild(
          test
        )
      ) {
        return (
          "One or more panel components " +
          "are already selected separately."
        );
      }

      return null;
    }

    if (
      isCoveredBySelectedPanel(
        test
      )
    ) {
      return (
        "This test is already included " +
        "in the selected panel."
      );
    }

    return null;
  };

  /* ==========================================================
     ADD TEST
  ========================================================== */

  const addTest = (test) => {
    console.log(
      "[PEFA REGISTRATION] Adding test:",
      test
    );

    if (isSelected(test)) {
      return;
    }

    const conflict =
      getSelectionConflict(test);

    if (conflict) {
      console.warn(
        "[PEFA REGISTRATION]",
        conflict
      );

      return;
    }

    const panel =
      isPanel(test);

    const price =
      getTestPrice(test);

    const components =
      panel
        ? getPanelChildren(test)
        : [];

    /* ======================================================
       REGISTRATION ITEM
    ====================================================== */

    const registrationTest = {
      id: test.id,

      testCode:
        test.test_code || null,

      testName:
        test.test_name,

      name:
        test.test_name,

      test_name:
        test.test_name,

      category:
        test.department ||
        test.panel_name ||
        "Laboratory",

      department:
        test.department || null,

      panelName:
        test.panel_name ||
        null,

      panel_name:
        test.panel_name ||
        null,

      parentPanel:
        test.parent_panel ||
        null,

      parent_panel:
        test.parent_panel ||
        null,

      testType:
        test.test_type ||
        null,

      test_type:
        test.test_type ||
        null,

      resultType:
        test.result_type ||
        null,

      result_type:
        test.result_type ||
        null,

      specimen:
        test.specimen ||
        null,

      specimenContainer:
        test.specimen_container ||
        test.container ||
        null,

      specimen_container:
        test.specimen_container ||
        test.container ||
        null,

      unit:
        test.unit ||
        null,

      referenceRange:
        test.reference_value ||
        null,

      reference_range:
        test.reference_value ||
        null,

      maleRange:
        test.male_range ||
        null,

      femaleRange:
        test.female_range ||
        null,

      childRange:
        test.child_range ||
        null,

      elderlyRange:
        test.elderly_range ||
        null,

      turnaroundTime:
        test.turnaround_time ||
        null,

      turnaround_time:
        test.turnaround_time ||
        null,

      methodology:
        test.methodology ||
        null,

      instrument:
        test.instrument ||
        null,

      templateType:
        test.template_type ||
        null,

      template_type:
        test.template_type ||
        null,

      resultCategory:
        test.result_category ||
        null,

      result_category:
        test.result_category ||
        null,

      resultTemplate:
        test.result_template ||
        null,

      result_template:
        test.result_template ||
        null,

      isPanel:
        panel,

      is_panel:
        panel,

      panelPrice:
        panel
          ? price
          : 0,

      panel_price:
        panel
          ? price
          : 0,

      singleTestPrice:
        panel
          ? 0
          : price,

      single_test_price:
        panel
          ? 0
          : price,

      /* ====================================================
         BILLABLE PRICE

         Parent panel:
           panel_price

         Standalone:
           single_test_price
      ==================================================== */

      price,

      quantity: 1,

      /* ====================================================
         PANEL COMPONENTS
      ==================================================== */

      panelComponents:
        components.map(
          (child) => ({
            id: child.id,

            testCode:
              child.test_code ||
              null,

            testName:
              child.test_name,

            test_name:
              child.test_name,

            department:
              child.department ||
              null,

            panelName:
              child.panel_name ||
              null,

            panel_name:
              child.panel_name ||
              null,

            parentPanel:
              child.parent_panel ||
              null,

            parent_panel:
              child.parent_panel ||
              null,

            testType:
              child.test_type ||
              null,

            test_type:
              child.test_type ||
              null,

            resultType:
              child.result_type ||
              null,

            result_type:
              child.result_type ||
              null,

            unit:
              child.unit ||
              null,

            specimen:
              child.specimen ||
              null,

            specimenContainer:
              child.specimen_container ||
              child.container ||
              null,

            specimen_container:
              child.specimen_container ||
              child.container ||
              null,

            maleRange:
              child.male_range ||
              null,

            femaleRange:
              child.female_range ||
              null,

            childRange:
              child.child_range ||
              null,

            elderlyRange:
              child.elderly_range ||
              null,

            referenceRange:
              child.reference_value ||
              null,

            reference_value:
              child.reference_value ||
              null,

            templateType:
              child.template_type ||
              null,

            template_type:
              child.template_type ||
              null,

            resultCategory:
              child.result_category ||
              null,

            result_category:
              child.result_category ||
              null,

            resultTemplate:
              child.result_template ||
              null,

            result_template:
              child.result_template ||
              null,

            methodology:
              child.methodology ||
              null,

            instrument:
              child.instrument ||
              null,

            turnaroundTime:
              child.turnaround_time ||
              null,

            turnaround_time:
              child.turnaround_time ||
              null,

            displayOrder:
              child.display_order ||
              null,

            /* --------------------------------------------
               IMPORTANT:
               Child standalone price is retained in
               metadata but is NOT added to panel price.
            -------------------------------------------- */

            standalonePrice:
              Number(
                child.single_test_price ||
                  0
              ),
          })
        ),
    };

    setSelectedTests([
      ...selectedTests,
      registrationTest,
    ]);

    setSearch("");
  };

  /* ==========================================================
     REMOVE TEST
  ========================================================== */

  const removeTest = (id) => {
    setSelectedTests(
      selectedTests.filter(
        (item) =>
          String(item.id) !==
          String(id)
      )
    );
  };

  /* ==========================================================
     UPDATE QUANTITY
  ========================================================== */

  const updateQuantity = (
    id,
    quantity
  ) => {
    const numericQuantity =
      Number(quantity);

    setSelectedTests(
      selectedTests.map(
        (test) =>
          String(test.id) ===
          String(id)
            ? {
                ...test,
                quantity:
                  Number.isFinite(
                    numericQuantity
                  ) &&
                  numericQuantity >= 1
                    ? numericQuantity
                    : 1,
              }
            : test
      )
    );
  };

  /* ==========================================================
     PANEL EXPAND / COLLAPSE
  ========================================================== */

  const togglePanel = (test) => {
    setExpandedPanels(
      (previous) => ({
        ...previous,

        [test.id]:
          !previous[test.id],
      })
    );
  };

  /* ==========================================================
     SUBTOTAL
     
     Only selected parent/standalone items are billed.
     
     Panel children are metadata only.
  ========================================================== */

  const subtotal =
    selectedTests.reduce(
      (sum, test) => {
        const quantity =
          Number(
            test.quantity || 1
          );

        const price =
          Number(
            test.price || 0
          );

        return (
          sum +
          price * quantity
        );
      },
      0
    );

  /* ==========================================================
     UPDATE FORM AMOUNT
  ========================================================== */

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      amount: subtotal,
    }));
  }, [
    subtotal,
    setForm,
  ]);

  /* ==========================================================
     FORMAT PRICE
  ========================================================== */

  const formatPrice = (value) => {
    return Number(
      value || 0
    ).toLocaleString();
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          LABORATORY INFORMATION
      ====================================================== */}

      <div className="registration-card">

        <div className="section-title">
          <h2>
            Laboratory Investigation
          </h2>
        </div>

        {/* ====================================================
            LAB INFORMATION
        ==================================================== */}

        <div className="registration-grid">

          <input
            type="text"
            value={
              form.registration_number ||
              ""
            }
            placeholder="Registration Number"
            readOnly
          />

          <input
            type="text"
            value={
              form.lab_number ||
              ""
            }
            placeholder="Laboratory Number"
            readOnly
          />

          <input
            type="text"
            value={
              form.access_code ||
              ""
            }
            placeholder="Access Code"
            readOnly
          />

        </div>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder={`Search ${primaryTests.length} laboratory tests by name, code, department...`}
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            autoComplete="off"
          />

        </div>

        {/* ====================================================
            SEARCH RESULTS
        ==================================================== */}

        <div className="search-results">

          {loadingTests ? (

            <div className="empty-text">
              Loading laboratory
              catalogue...
            </div>

          ) : primaryTests.length === 0 ? (

            <div className="empty-text">
              No active laboratory
              tests are available.
            </div>

          ) : !search.trim() ? (

            <div className="empty-text">
              Start typing to search
              laboratory tests.
            </div>

          ) : (

            <>

              <div
                style={{
                  padding:
                    "10px 15px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#555",
                  borderBottom:
                    "1px solid #eee",
                  marginBottom: 8,
                }}
              >
                {filteredTests.length} Test
                {filteredTests.length !==
                1
                  ? "s"
                  : ""}{" "}
                found for "{search}"
              </div>

              {filteredTests.length ===
              0 ? (

                <div className="empty-text">
                  No matching laboratory
                  test found.
                </div>

              ) : (

                filteredTests.map(
                  (test) => {

                    const panel =
                      isPanel(test);

                    const price =
                      getTestPrice(
                        test
                      );

                    const components =
                      panel
                        ? getPanelChildren(
                            test
                          )
                        : [];

                    const selected =
                      isSelected(
                        test
                      );

                    const conflict =
                      getSelectionConflict(
                        test
                      );

                    const expanded =
                      Boolean(
                        expandedPanels[
                          test.id
                        ]
                      );

                    return (
                      <div
                        key={test.id}
                        className="test-result"
                        style={{
                          alignItems:
                            "flex-start",
                        }}
                      >

                        {/* ==================================
                            ICON
                        ================================== */}

                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius:
                              10,
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              panel
                                ? "#eef6ff"
                                : "#f4f7f9",
                            flexShrink: 0,
                          }}
                        >
                          <FlaskConical
                            size={18}
                          />
                        </div>

                        {/* ==================================
                            INFORMATION
                        ================================== */}

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 8,
                              flexWrap:
                                "wrap",
                            }}
                          >

                            <h4
                              style={{
                                marginBottom:
                                  4,
                              }}
                            >
                              {
                                test.test_name
                              }
                            </h4>

                            {panel && (
                              <span
                                style={{
                                  fontSize:
                                    11,
                                  fontWeight:
                                    700,
                                  padding:
                                    "3px 7px",
                                  borderRadius:
                                    999,
                                  background:
                                    "#e8f3ff",
                                  color:
                                    "#145ea8",
                                }}
                              >
                                PANEL
                              </span>
                            )}

                            {test.parent_panel &&
                              !panel && (
                              <span
                                style={{
                                  fontSize:
                                    10,
                                  fontWeight:
                                    700,
                                  padding:
                                    "3px 7px",
                                  borderRadius:
                                    999,
                                  background:
                                    "#f1f5f9",
                                  color:
                                    "#64748b",
                                }}
                              >
                                PANEL COMPONENT
                              </span>
                            )}

                          </div>

                          <small
                            style={{
                              display:
                                "block",
                              color:
                                "#666",
                              marginBottom:
                                4,
                            }}
                          >
                            {test.test_code ||
                              "No test code"}
                            {" • "}
                            {test.department ||
                              "Unclassified"}
                            {test.specimen
                              ? ` • ${test.specimen}`
                              : ""}
                          </small>

                          {test.parent_panel &&
                            !panel && (
                            <small
                              style={{
                                display:
                                  "block",
                                color:
                                  "#64748b",
                                marginTop:
                                  3,
                              }}
                            >
                              Also included in:{" "}
                              <strong>
                                {
                                  test.parent_panel
                                }
                              </strong>
                            </small>
                          )}

                          {panel &&
                            components.length >
                              0 && (
                              <div
                                style={{
                                  marginTop:
                                    8,
                                }}
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    togglePanel(
                                      test
                                    )
                                  }
                                  style={{
                                    border:
                                      "none",
                                    background:
                                      "transparent",
                                    padding:
                                      0,
                                    cursor:
                                      "pointer",
                                    fontSize:
                                      12,
                                    fontWeight:
                                      700,
                                    color:
                                      "#2563eb",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: 4,
                                  }}
                                >

                                  {expanded ? (
                                    <ChevronUp
                                      size={
                                        15
                                      }
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={
                                        15
                                      }
                                    />
                                  )}

                                  {components.length}{" "}
                                  component
                                  {components.length !==
                                  1
                                    ? "s"
                                    : ""}

                                </button>

                                {expanded && (
                                  <div
                                    style={{
                                      marginTop:
                                        7,
                                      padding:
                                        "8px 10px",
                                      borderRadius:
                                        8,
                                      background:
                                        "#f7f9fb",
                                      border:
                                        "1px solid #e8edf2",
                                    }}
                                  >

                                    {components.map(
                                      (
                                        child
                                      ) => (
                                        <div
                                          key={
                                            child.id
                                          }
                                          style={{
                                            fontSize:
                                              12,
                                            padding:
                                              "3px 0",
                                            color:
                                              "#555",
                                          }}
                                        >
                                          •{" "}
                                          {
                                            child.test_name
                                          }
                                        </div>
                                      )
                                    )}

                                  </div>
                                )}

                              </div>
                            )}

                          <p
                            style={{
                              fontWeight:
                                700,
                              color:
                                "#0b7a3d",
                              margin:
                                "8px 0 0",
                            }}
                          >
                            ₦
                            {formatPrice(
                              price
                            )}
                          </p>

                          {conflict && (
                            <small
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  5,
                                color:
                                  "#b45309",
                                fontWeight:
                                  600,
                              }}
                            >
                              {conflict}
                            </small>
                          )}

                        </div>

                        {/* ==================================
                            ADD BUTTON
                        ================================== */}

                        <button
                          type="button"
                          className="add-btn"
                          onClick={() =>
                            addTest(
                              test
                            )
                          }
                          disabled={
                            selected ||
                            Boolean(
                              conflict
                            )
                          }
                          title={
                            selected
                              ? "Already selected"
                              : conflict ||
                                "Add Test"
                          }
                          style={{
                            opacity:
                              selected ||
                              conflict
                                ? 0.45
                                : 1,
                          }}
                        >
                          <Plus
                            size={18}
                          />
                        </button>

                      </div>
                    );
                  }
                )

              )}

            </>

          )}

        </div>

        {/* ====================================================
            SELECTED TESTS
        ==================================================== */}

        <div className="selected-tests">

          {selectedTests.length ===
          0 ? (

            <div className="empty-text">
              No Laboratory Test
              Selected
            </div>

          ) : (

            selectedTests.map(
              (test) => {

                const panel =
                  Boolean(
                    test.isPanel ||
                    test.is_panel
                  );

                const components =
                  Array.isArray(
                    test.panelComponents
                  )
                    ? test.panelComponents
                    : [];

                return (
                  <div
                    key={test.id}
                    className="selected-test-card"
                    style={{
                      alignItems:
                        "flex-start",
                    }}
                  >

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >

                      <strong>
                        {
                          test.testName
                        }
                      </strong>

                      {panel && (
                        <span
                          style={{
                            display:
                              "inline-block",
                            marginLeft: 8,
                            fontSize:
                              10,
                            fontWeight:
                              800,
                            padding:
                              "3px 6px",
                            borderRadius:
                              999,
                            background:
                              "#e8f3ff",
                            color:
                              "#145ea8",
                          }}
                        >
                          PANEL
                        </span>
                      )}

                      <br />

                      <small>
                        {test.testCode ||
                          "No test code"}
                        {" • "}
                        {test.department ||
                          "Unclassified"}
                      </small>

                      {panel &&
                        components.length >
                          0 && (
                          <div
                            style={{
                              marginTop:
                                6,
                              fontSize:
                                12,
                              color:
                                "#666",
                            }}
                          >
                            <strong>
                              Components:
                            </strong>{" "}
                            {components
                              .map(
                                (
                                  child
                                ) =>
                                  child.test_name
                              )
                              .join(
                                ", "
                              )}
                          </div>
                        )}

                    </div>

                    {/* ========================================
                        QUANTITY
                    ======================================== */}

                    <input
                      type="number"
                      min={1}
                      value={
                        test.quantity ||
                        1
                      }
                      onChange={(e) =>
                        updateQuantity(
                          test.id,
                          e.target.value
                        )
                      }
                      style={{
                        width: 70,
                      }}
                    />

                    {/* ========================================
                        PRICE
                    ======================================== */}

                    <strong>
                      ₦
                      {formatPrice(
                        Number(
                          test.price ||
                            0
                        ) *
                          Number(
                            test.quantity ||
                              1
                          )
                      )}
                    </strong>

                    {/* ========================================
                        REMOVE
                    ======================================== */}

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        removeTest(
                          test.id
                        )
                      }
                      title="Remove Test"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>

                  </div>
                );
              }
            )

          )}

        </div>

        {/* ====================================================
            BILLING
        ==================================================== */}

        <div className="billing-card">

          <div>
            <strong>
              Selected Tests
            </strong>

            <p>
              {selectedTests.length}
            </p>
          </div>

          <div>
            <strong>
              Sub Total
            </strong>

            <h2>
              ₦
              {subtotal.toLocaleString()}
            </h2>
          </div>

        </div>

      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="registration-summary">

        <div>
          <strong>
            Total Tests
          </strong>

          <h3>
            {selectedTests.length}
          </h3>
        </div>

        <div>
          <strong>
            Laboratory Amount
          </strong>

          <h2>
            ₦
            {subtotal.toLocaleString()}
          </h2>
        </div>

      </div>
    </>
  );
}