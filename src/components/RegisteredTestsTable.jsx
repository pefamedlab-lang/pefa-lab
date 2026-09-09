import {
  CheckCircle2,
  Circle,
  FileText,
  FlaskConical,
  Layers3,
} from "lucide-react";

import { isPanelTest } from "../services/testService";

/* ==========================================================
   REGISTERED TESTS TABLE
   ----------------------------------------------------------
   CLEAN NEW VERSION
   ----------------------------------------------------------
   Responsibilities:
   - Display tests registered for the patient
   - Clearly distinguish PANEL vs SINGLE tests
   - Show whether a result already exists
   - Pass the complete selected test object upward
   - Do NOT resolve tests
   - Do NOT modify result data
   - Do NOT save results
   - Do NOT contain old panel-routing logic
========================================================== */

/* ==========================================================
   HELPERS
========================================================== */

function getTestName(test = {}) {
  return (
    test?.test_name ||
    test?.testName ||
    test?.name ||
    "Unnamed Test"
  );
}

function getDepartment(test = {}) {
  return (
    test?.department ||
    "Laboratory"
  );
}

function getTestType(test = {}) {
  return (
    test?.test_type ||
    test?.testType ||
    ""
  );
}

function getPanelName(test = {}) {
  return (
    test?.panel_name ||
    test?.panelName ||
    getTestName(test)
  );
}

function getMasterTestId(test = {}) {
  return (
    test?.master_test_id ??
    test?.masterTestId ??
    null
  );
}

function getPanelId(test = {}) {
  return (
    test?.panel_id ??
    test?.panelId ??
    test?.parent_panel_id ??
    test?.parentPanelId ??
    null
  );
}

function getParameters(test = {}) {
  if (
    Array.isArray(test?.parameters)
  ) {
    return test.parameters;
  }

  if (
    Array.isArray(test?.groupedTests)
  ) {
    return test.groupedTests;
  }

  if (
    Array.isArray(test?.grouped_tests)
  ) {
    return test.grouped_tests;
  }

  if (
    Array.isArray(test?.panelTests)
  ) {
    return test.panelTests;
  }

  if (
    Array.isArray(test?.panel_tests)
  ) {
    return test.panel_tests;
  }

  return [];
}

/* ==========================================================
   RESULT MATCHING
   ----------------------------------------------------------
   Existing results can contain:
     - verification_id
     - test_type
     - result.parameter
     - result.result
========================================================== */

function resultBelongsToTest(
  result,
  test
) {
  if (!result || !test) {
    return false;
  }

  const testName =
    String(
      getTestName(test)
    )
      .trim()
      .toLowerCase();

  const resultTestType =
    String(
      result?.test_type ||
        result?.test_name ||
        ""
    )
      .trim()
      .toLowerCase();

  /* ------------------------------------------
     DIRECT TEST NAME MATCH
  ------------------------------------------ */

  if (
    resultTestType &&
    resultTestType === testName
  ) {
    return true;
  }

  /* ------------------------------------------
     VERIFICATION ID MATCH
  ------------------------------------------ */

  const verificationId =
    String(
      result?.verification_id ||
        ""
    )
      .trim()
      .toLowerCase();

  if (
    verificationId &&
    testName &&
    verificationId.includes(
      testName.replace(/\s+/g, "")
    )
  ) {
    return true;
  }

  /* ------------------------------------------
     PANEL CHILD MATCH
  ------------------------------------------ */

  const parameters =
    getParameters(test);

  if (
    parameters.length > 0
  ) {
    return parameters.some(
      (parameter) => {
        const parameterName =
          String(
            parameter?.test_name ||
              parameter?.testName ||
              parameter?.name ||
              ""
          )
            .trim()
            .toLowerCase();

        if (
          !parameterName
        ) {
          return false;
        }

        if (
          resultTestType ===
          parameterName
        ) {
          return true;
        }

        if (
          verificationId.includes(
            parameterName.replace(
              /\s+/g,
              ""
            )
          )
        ) {
          return true;
        }

        return false;
      }
    );
  }

  return false;
}

function hasExistingResult(
  test,
  existingResults
) {
  if (
    !Array.isArray(
      existingResults
    ) ||
    existingResults.length === 0
  ) {
    return false;
  }

  return existingResults.some(
    (result) =>
      resultBelongsToTest(
        result,
        test
      )
  );
}

/* ==========================================================
   PREPARE SELECTED TEST
   ----------------------------------------------------------
   We intentionally preserve the complete object supplied
   by ResultDashboard.

   The table does NOT attempt to rebuild or resolve it.
========================================================== */

function prepareSelectedTest(
  test
) {
  if (!test) {
    return null;
  }

  const panel =
    isPanelTest(test);

  const parameters =
    getParameters(test);

  return {
    ...test,

    test_name:
      getTestName(test),

    test_type:
      getTestType(test),

    department:
      getDepartment(test),

    master_test_id:
      getMasterTestId(test),

    masterTestId:
      getMasterTestId(test),

    panel_id:
      getPanelId(test),

    panelId:
      getPanelId(test),

    is_panel:
      panel,

    isPanel:
      panel,

    parameters,

    groupedTests:
      parameters,

    grouped_tests:
      parameters,

    panelTests:
      parameters,

    panel_tests:
      parameters,
  };
}

/* ==========================================================
   TEST TYPE BADGE
========================================================== */

function TestTypeBadge({
  panel,
}) {
  if (panel) {
    return (
      <span className="registered-test-badge panel">
        <Layers3
          size={14}
        />

        PANEL
      </span>
    );
  }

  return (
    <span className="registered-test-badge single">
      <FlaskConical
        size={14}
      />

      SINGLE
    </span>
  );
}

/* ==========================================================
   RESULT STATUS
========================================================== */

function ResultStatus({
  completed,
}) {
  if (completed) {
    return (
      <span className="registered-test-result completed">
        <CheckCircle2
          size={16}
        />

        Result Available
      </span>
    );
  }

  return (
    <span className="registered-test-result pending">
      <Circle
        size={16}
      />

      Awaiting Result
    </span>
  );
}

/* ==========================================================
   EMPTY STATE
========================================================== */

function EmptyTests() {
  return (
    <div className="registered-tests-empty">
      <FileText
        size={36}
      />

      <div>
        <strong>
          No registered tests
        </strong>

        <p>
          No laboratory tests were found
          for this patient.
        </p>
      </div>
    </div>
  );
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function RegisteredTestsTable({
  tests = [],
  existingResults = [],
  onSelect,
}) {
  /* ========================================================
     VALIDATION
  ======================================================== */

  const safeTests =
    Array.isArray(tests)
      ? tests
      : [];

  /* ========================================================
     EMPTY
  ======================================================== */

  if (
    safeTests.length === 0
  ) {
    return (
      <section className="dashboard-card registered-tests-card">
        <div className="registered-tests-header">
          <div>
            <h2>
              Registered Tests
            </h2>

            <p>
              Laboratory investigations
              registered for this patient.
            </p>
          </div>
        </div>

        <EmptyTests />
      </section>
    );
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <section className="dashboard-card registered-tests-card">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="registered-tests-header">

        <div>
          <h2>
            Registered Tests
          </h2>

          <p>
            Select a test to enter or amend
            the laboratory result.
          </p>
        </div>

        <div className="registered-tests-count">
          {safeTests.length}{" "}
          {safeTests.length === 1
            ? "Test"
            : "Tests"}
        </div>

      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="registered-tests-table-wrapper">

        <table className="registered-tests-table">

          <thead>
            <tr>
              <th>
                #
              </th>

              <th>
                Test
              </th>

              <th>
                Department
              </th>

              <th>
                Type
              </th>

              <th>
                Parameters
              </th>

              <th>
                Result
              </th>

              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {safeTests.map(
              (
                test,
                index
              ) => {
                const panel =
                  isPanelTest(
                    test
                  );

                const parameters =
                  getParameters(
                    test
                  );

                const completed =
                  hasExistingResult(
                    test,
                    existingResults
                  );

                const displayName =
                  panel
                    ? getPanelName(
                        test
                      )
                    : getTestName(
                        test
                      );

                const selectTest =
                  () => {
                    if (
                      typeof onSelect !==
                      "function"
                    ) {
                      return;
                    }

                    const prepared =
                      prepareSelectedTest(
                        test
                      );

                    onSelect(
                      prepared
                    );
                  };

                return (
                  <tr
                    key={
                      test?.id ??
                      test?.master_test_id ??
                      `${displayName}-${index}`
                    }
                    className={
                      completed
                        ? "result-completed"
                        : ""
                    }
                  >

                    {/* =================================
                        NUMBER
                    ================================= */}

                    <td>
                      <span className="registered-test-number">
                        {index + 1}
                      </span>
                    </td>

                    {/* =================================
                        TEST
                    ================================= */}

                    <td>

                      <div className="registered-test-name">

                        <strong>
                          {displayName}
                        </strong>

                        {panel &&
                          getPanelName(
                            test
                          ) !==
                            getTestName(
                              test
                            ) && (
                            <span>
                              {getTestName(
                                test
                              )}
                            </span>
                          )}

                      </div>

                    </td>

                    {/* =================================
                        DEPARTMENT
                    ================================= */}

                    <td>
                      <span className="registered-test-department">
                        {getDepartment(
                          test
                        )}
                      </span>
                    </td>

                    {/* =================================
                        TYPE
                    ================================= */}

                    <td>
                      <TestTypeBadge
                        panel={
                          panel
                        }
                      />
                    </td>

                    {/* =================================
                        PARAMETERS
                    ================================= */}

                    <td>

                      {panel ? (
                        <div className="registered-test-parameters">

                          <strong>
                            {
                              parameters.length
                            }
                          </strong>

                          <span>
                            {parameters.length ===
                            1
                              ? "parameter"
                              : "parameters"}
                          </span>

                        </div>
                      ) : (
                        <span className="registered-test-na">
                          —
                        </span>
                      )}

                    </td>

                    {/* =================================
                        RESULT STATUS
                    ================================= */}

                    <td>
                      <ResultStatus
                        completed={
                          completed
                        }
                      />
                    </td>

                    {/* =================================
                        ACTION
                    ================================= */}

                    <td>

                      <button
                        type="button"
                        className={
                          completed
                            ? "registered-test-action amend"
                            : "registered-test-action enter"
                        }
                        onClick={
                          selectTest
                        }
                      >
                        <FileText
                          size={16}
                        />

                        {completed
                          ? "View / Amend"
                          : "Enter Result"}
                      </button>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}