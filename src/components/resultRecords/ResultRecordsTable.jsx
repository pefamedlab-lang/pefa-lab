import React from "react";

/* ==========================================================
   HELPERS
========================================================== */

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

/* ==========================================================
   NORMALIZE
========================================================== */

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/* ==========================================================
   SAFE ARRAY
========================================================== */

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : [];
}

/* ==========================================================
   GET TEST NAME FROM A RESULT ROW
========================================================== */

function getDirectTestName(row = {}) {
  return firstValue(
    row?.test_name,
    row?.testName,

    row?.test_title,
    row?.testTitle,

    row?.test,

    row?.name,

    row?.title
  );
}

/* ==========================================================
   GET PANEL NAME
========================================================== */

function getPanelName(row = {}) {
  return firstValue(
    row?.panel_name,
    row?.panelName
  );
}

/* ==========================================================
   GET CHILD TEST NAME
========================================================== */

function getChildTestName(item = {}) {
  return firstValue(
    item?.test_name,
    item?.testName,

    item?.test_title,
    item?.testTitle,

    item?.test,

    item?.name,

    item?.title,

    item?.parameter_name,
    item?.parameterName,

    item?.parameter
  );
}

/* ==========================================================
   DETECT PANEL
========================================================== */

function isPanelReport(row = {}) {
  if (
    row?.is_panel === true ||
    row?.isPanel === true
  ) {
    return true;
  }

  if (
    row?.panel_id !== undefined &&
    row?.panel_id !== null &&
    String(row.panel_id).trim() !== ""
  ) {
    return true;
  }

  if (
    row?.panelId !== undefined &&
    row?.panelId !== null &&
    String(row.panelId).trim() !== ""
  ) {
    return true;
  }

  if (
    String(
      row?.panel_name ??
      row?.panelName ??
      ""
    ).trim() !== ""
  ) {
    return true;
  }

  if (
    normalize(
      row?.test_type ??
      row?.testType
    ) === "panel"
  ) {
    return true;
  }

  return false;
}

/* ==========================================================
   UNIQUE NAMES
========================================================== */

function uniqueNames(values = []) {
  const output = [];
  const seen = new Set();

  values.forEach((value) => {
    const text =
      String(value ?? "").trim();

    if (!text) {
      return;
    }

    const key =
      normalize(text);

    if (!key || seen.has(key)) {
      return;
    }

    seen.add(key);
    output.push(text);
  });

  return output;
}

/* ==========================================================
   AUTHORITATIVE DISPLAY TEST NAME

   PRIORITY:

   1. Explicit parent test_name
   2. Explicit parent panel_name
   3. Parent name/title
   4. Child test names
   5. Only as a LAST RESORT, test_type

   IMPORTANT:

   "test_type" is NOT normally the display name.

   Example:

     test_type = "Laboratory Test"
     test_name = "Gamma Glutamyl Transferase (GGT)"

   Display:

     Gamma Glutamyl Transferase (GGT)
========================================================== */

function getDisplayTestName(row = {}) {
  /* ========================================================
     1. DIRECT TEST NAME
  ======================================================== */

  const directTestName =
    getDirectTestName(row);

  if (directTestName) {
    return String(
      directTestName
    ).trim();
  }

  /* ========================================================
     2. PANEL NAME
  ======================================================== */

  const panelName =
    getPanelName(row);

  if (panelName) {
    return String(
      panelName
    ).trim();
  }

  /* ========================================================
     3. GENERIC GROUP NAME
  ======================================================== */

  const genericName =
    firstValue(
      row?.name,
      row?.title
    );

  if (genericName) {
    return String(
      genericName
    ).trim();
  }

  /* ========================================================
     4. CHILD RESULTS
  ======================================================== */

  const items =
    safeArray(
      row?.items
    );

  const childNames =
    uniqueNames(
      items.map(
        (item) =>
          getChildTestName(item)
      )
    );

  /* ========================================================
     PANEL WITH CHILDREN
  ======================================================== */

  if (
    isPanelReport(row) &&
    childNames.length > 0
  ) {
    /*
     * For a panel, the parent panel name should normally
     * have already been found above.
     *
     * If it does not exist, showing the child names gives
     * us useful diagnostic visibility rather than showing
     * "Laboratory Test".
     */

    return childNames.join(", ");
  }

  /* ========================================================
     SINGLE WITH ONE CHILD
  ======================================================== */

  if (
    childNames.length === 1
  ) {
    return childNames[0];
  }

  /* ========================================================
     MULTIPLE CHILDREN
  ======================================================== */

  if (
    childNames.length > 1
  ) {
    return childNames.join(", ");
  }

  /* ========================================================
     5. TEST TYPE

     This is intentionally LAST.

     We do NOT want:

       Laboratory Test

     to become the primary display name when an actual
     test name exists elsewhere.

     It is retained only for genuinely incomplete records.
  ======================================================== */

  const testType =
    firstValue(
      row?.test_type,
      row?.testType
    );

  if (testType) {
    return String(
      testType
    ).trim();
  }

  /* ========================================================
     6. FINAL
  ======================================================== */

  return "Unknown Test";
}

/* ==========================================================
   PATIENT NAME
========================================================== */

function getPatientName(row = {}) {
  return firstValue(
    row?.patient_name,
    row?.patientName,

    row?.full_name,
    row?.fullName,

    row?.name
  ) || "Unknown Patient";
}

/* ==========================================================
   LAB NUMBER
========================================================== */

function getLabNumber(row = {}) {
  return firstValue(
    row?.lab_number,
    row?.labNumber,

    row?.registration_number,
    row?.registrationNumber
  ) || "-";
}

/* ==========================================================
   REPORTED DATE
========================================================== */

function getReportedDate(row = {}) {
  const value =
    firstValue(
      row?.reported_at,
      row?.reportedAt,

      row?.result_date,
      row?.resultDate,

      row?.created_at,
      row?.createdAt
    );

  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString();
}

/* ==========================================================
   AUTHORIZATION STATUS
========================================================== */

function getAuthorizationStatus(
  row = {}
) {
  return (
    firstValue(
      row?.authorization_status,
      row?.authorizationStatus
    ) ||
    "Pending"
  );
}

/* ==========================================================
   RELEASE STATUS
========================================================== */

function getReleaseStatus(
  row = {}
) {
  return (
    firstValue(
      row?.release_status,
      row?.releaseStatus
    ) ||
    "Pending"
  );
}

/* ==========================================================
   COMPONENT
========================================================== */

export default function ResultRecordsTable({
  results = [],
  onView,
}) {
  const safeResults =
    safeArray(results);

  /* ========================================================
     EMPTY STATE
  ======================================================== */

  if (
    safeResults.length === 0
  ) {
    return (
      <div
        className="result-records-empty"
        style={{
          padding: "24px",
          textAlign: "center",
          color: "#6b7280",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          fontSize: "13px",
        }}
      >
        No result records found.
      </div>
    );
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div
      className="result-records-table-wrapper"
      style={{
        width: "100%",
        overflowX: "auto",
      }}
    >
      <table
        className="records-table"
      >
        <thead>
          <tr>
            <th>
              Lab No
            </th>

            <th>
              Patient
            </th>

            <th>
              Test
            </th>

            <th>
              Reported
            </th>

            <th>
              Auth
            </th>

            <th>
              Release
            </th>

            <th>
              Prints
            </th>

            <th>
              Downloads
            </th>

            <th>
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {safeResults.map(
            (row, index) => {
              const testName =
                getDisplayTestName(
                  row
                );

              const patientName =
                getPatientName(
                  row
                );

              const labNumber =
                getLabNumber(
                  row
                );

              const reportedDate =
                getReportedDate(
                  row
                );

              const authorizationStatus =
                getAuthorizationStatus(
                  row
                );

              const releaseStatus =
                getReleaseStatus(
                  row
                );

              const printCount =
                Number(
                  row?.print_count ??
                  row?.printCount ??
                  0
                );

              const downloadCount =
                Number(
                  row?.download_count ??
                  row?.downloadCount ??
                  0
                );

              const rowKey =
                row?.id ??
                `${labNumber}-${testName}-${index}`;

              return (
                <tr
                  key={rowKey}
                >
                  {/* ========================================
                      LAB NUMBER
                  ======================================== */}

                  <td>
                    {labNumber}
                  </td>

                  {/* ========================================
                      PATIENT
                  ======================================== */}

                  <td>
                    {patientName}
                  </td>

                  {/* ========================================
                      ACTUAL TEST NAME

                      THIS IS THE IMPORTANT FIX.

                      Previously:

                        {row.test_type}

                      which produced:

                        Laboratory Test

                      Now:

                        {testName}

                      which resolves the actual report/test.
                  ======================================== */}

                  <td
                    className="result-test-name"
                    style={{
                      fontWeight: 600,
                      color: "#111827",
                      minWidth: "190px",
                    }}
                    title={testName}
                  >
                    {testName}
                  </td>

                  {/* ========================================
                      REPORTED
                  ======================================== */}

                  <td>
                    {reportedDate}
                  </td>

                  {/* ========================================
                      AUTHORIZATION
                  ======================================== */}

                  <td>
                    <span
                      className={
                        authorizationStatus ===
                        "Authorized"
                          ? "status-authorized"
                          : "status-pending"
                      }
                    >
                      {
                        authorizationStatus
                      }
                    </span>
                  </td>

                  {/* ========================================
                      RELEASE
                  ======================================== */}

                  <td>
                    <span
                      className={
                        releaseStatus ===
                        "Released"
                          ? "status-released"
                          : "status-pending"
                      }
                    >
                      {
                        releaseStatus
                      }
                    </span>
                  </td>

                  {/* ========================================
                      PRINT COUNT
                  ======================================== */}

                  <td>
                    {
                      Number.isFinite(
                        printCount
                      )
                        ? printCount
                        : 0
                    }
                  </td>

                  {/* ========================================
                      DOWNLOAD COUNT
                  ======================================== */}

                  <td>
                    {
                      Number.isFinite(
                        downloadCount
                      )
                        ? downloadCount
                        : 0
                    }
                  </td>

                  {/* ========================================
                      ACTION
                  ======================================== */}

                  <td>
                    <div
                      className="action-buttons"
                    >
                      <button
                        type="button"
                        className="view-btn"
                        onClick={() => {
                          if (
                            typeof onView ===
                            "function"
                          ) {
                            onView(
                              row
                            );
                          }
                        }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}