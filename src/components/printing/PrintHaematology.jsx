import React from "react";
import getReportTitle from "../../utils/printing/getReportTitle";
import { getFullTestName } from "../../utils/fullTestName";
import interpretHaematology from "../../utils/interpretation/Haematology";

export default function PrintHaematology({
    results = [],
}) {

    /* ======================================================
       NO RESULT
    ====================================================== */

    if (!results?.length) {
        return null;
    }

    const firstReport = results[0] || {};

    const reportTitle = getReportTitle(
        firstReport,
        results
    );

    /* ======================================================
       HELPERS
    ====================================================== */

    const parseData = (data) => {

        if (!data) return {};

        if (typeof data === "string") {

            try {
                return JSON.parse(data);
            } catch {
                return {};
            }

        }

        return data;

    };

    const getFlagClass = (flag = "") => {

        const value = String(flag)
            .toLowerCase()
            .trim();

        if (value === "high" || value === "h") {
            return "flag-high";
        }

        if (value === "low" || value === "l") {
            return "flag-low";
        }

        if (value === "critical" || value === "c") {
            return "flag-critical";
        }

        return "flag-normal";

    };

const commentStyles = {
    container: {
        width: "100%",
        marginTop: "10px",
        border: "1px solid #d1d5db",
        borderCollapse: "collapse",
        fontSize: "11px",
    },

    row: {
        display: "flex",
        borderBottom: "1px solid #e5e7eb",
        minHeight: "28px",
    },

    lastRow: {
        display: "flex",
        minHeight: "28px",
    },

    title: {
        width: "120px",
        minWidth: "120px",
        padding: "6px 8px",
        fontWeight: 700,
        background: "#f8fafc",
        borderRight: "1px solid #e5e7eb",
    },

    value: {
        flex: 1,
        padding: "6px 8px",
        lineHeight: 1.35,
        whiteSpace: "normal",
        wordBreak: "break-word",
    },
};
    /* ======================================================
       CBC GROUPS
    ====================================================== */

    const parameterGroups = {
    "Erythrocyte Series": [
        "PCV",
        "Hemoglobin",
        "Haemoglobin",
        "RBC",
        "MCV",
        "MCH",
        "MCHC",
    ],

    "Leucocyte Series": [
        "WBC",
        "Neutrophils",
        "Lymphocytes",
        "Monocytes",
        "Eosinophils",
        "Basophils",
    ],

    "Platelet Series": [
        "Platelets",
    ],
};

    /* ======================================================
       BUILD ROWS
    ====================================================== */

    const rows = [];

    results.forEach((report) => {

        const data = parseData(
            report.result ||
            report.result_data
        );

        /* ===========================
           SINGLE TEST
        =========================== */

        if (data?.parameter) {

            rows.push({

                parameter:
                    data.parameter ||
                    report.test_type ||
                    "-",

                result:
                    data.result ?? "-",

                unit:
                    data.unit || "-",

                referenceRange:
                    data.reference_range ||
                    data.referenceRange ||
                    "-",

                flag:
                    data.flag || "Normal",

            });

        }

        /* ===========================
           PANEL OBJECT
        =========================== */

        else if (
            data &&
            typeof data === "object" &&
            !Array.isArray(data)
        ) {

            Object.entries(data).forEach(
                ([parameter, value]) => {

                    if (
                        value &&
                        typeof value === "object" &&
                        "result" in value
                    ) {

                        rows.push({

                            parameter,

                            result:
                                value.result ?? "-",

                            unit:
                                value.unit || "-",

                            referenceRange:
                                value.reference_range ||
                                value.referenceRange ||
                                "-",

                            flag:
                                value.flag || "Normal",

                        });

                    }

                }
            );

        }

        /* ===========================
           ARRAY FORMAT
        =========================== */

        else if (Array.isArray(data)) {

            data.forEach((item) => {

                rows.push({

                    parameter:
                        item.parameter ||
                        item.name ||
                        "-",

                    result:
                        item.result ?? "-",

                    unit:
                        item.unit || "-",

                    referenceRange:
                        item.reference_range ||
                        item.referenceRange ||
                        "-",

                    flag:
                        item.flag || "Normal",

                });

            });

        }

    });

  /* ======================================================
   EMPTY TABLE
====================================================== */

if (!rows.length) {
    return (
        <div className="haematology-report">

            <table className="print-result-table">

                <thead>

                    <tr className="report-title-row">
                        <th colSpan={5}>

                            <div className="table-department-title">
                                HAEMATOLOGY
                            </div>

                            {reportTitle.showTestTitle && (
                                <div className="table-test-title">
                                    {getFullTestName(reportTitle.title)}
                                </div>
                            )}

                        </th>
                    </tr>

                    <tr>
    <th style={{ width: "38%" }}>Parameter</th>
    <th style={{ width: "15%" }}>Result</th>
    <th style={{ width: "13%" }}>Unit</th>
    <th style={{ width: "24%" }}>Reference Range</th>
    <th style={{ width: "10%" }}>Flag</th>
</tr>

                </thead>

                <tbody>

                    <tr>
                        <td
                            colSpan={5}
                            style={{
                                textAlign: "center",
                                padding: "20px",
                            }}
                        >
                            No Result Available
                        </td>
                    </tr>

                </tbody>

            </table>

        </div>
    );
}

/* ======================================================
   INTERPRETATION
====================================================== */

const parsedResults = {};

rows.forEach((row) => {
    parsedResults[row.parameter] = {
        result: row.result,
        unit: row.unit,
        reference_range: row.referenceRange,
        flag: row.flag,
    };
});

const interpretation =
    interpretHaematology(firstReport, parsedResults) || {};

const remarks = results
    .map((report) => {

        const data = parseData(
            report.result || report.result_data
        );

        return (
            report.remark ||
            data.remark ||
            data["Scientist Remark"] ||
            null
        );

    })
    .filter(Boolean);



/* ======================================================
   REPORT
====================================================== */

return (

    <div className="haematology-report">

        <table className="print-result-table">

            <thead>

                <tr className="report-title-row">

                    <th colSpan={5}>

                        <div className="table-department-title">
                            HAEMATOLOGY
                        </div>

                        {reportTitle.showTestTitle && (
                            <div className="table-test-title">
                                {getFullTestName(reportTitle.title)}
                            </div>
                        )}

                    </th>

                </tr>

                <tr>

                    <th>Parameter</th>
                    <th>Result</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                    <th>Flag</th>

                </tr>

            </thead>

<tbody>
  {Object.entries(parameterGroups).map(
    ([section, parameters]) => {
      const sectionRows = rows.filter((row) =>
        parameters.includes(row.parameter)
      );

      if (sectionRows.length === 0) {
        return null;
      }

      return (
        <React.Fragment key={section}>
          {/* ==========================================
              SECTION HEADER
          ========================================== */}

          <tr className="section-header">
            <td
              colSpan={5}
              style={{
                fontWeight: 700,
                background: "#f3f4f6",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {section}
            </td>
          </tr>

          {/* ==========================================
              SECTION RESULTS
          ========================================== */}

          {sectionRows.map((row, index) => {
            const flag =
              row?.flag || "Normal";

            const rowKey =
              `${section}-${row?.parameter || "parameter"}-${index}`;

            return (
              <tr
                key={rowKey}
                className={`result-row-${String(flag)
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {/* PARAMETER */}
                <td>
                  <div
                    className="cell-wrap"
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row?.parameter || "-"}
                  </div>
                </td>

                {/* RESULT */}
                <td className={getFlagClass(flag)}>
                  <div className="cell-wrap">
                    {row?.result ?? "-"}
                  </div>
                </td>

                {/* UNIT */}
                <td>
                  <div className="cell-wrap">
                    {row?.unit || "-"}
                  </div>
                </td>

                {/* REFERENCE RANGE */}
                <td>
                  <div className="cell-wrap">
                    {row?.referenceRange || "-"}
                  </div>
                </td>

                {/* FLAG */}
                <td>
                  <div className="cell-wrap">
                    <span
                      className={getFlagClass(flag)}
                    >
                      {flag}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </React.Fragment>
      );
    }
  )}
</tbody>

        </table>

      {/* ==========================================
    REPORT COMMENTS
========================================== */}

{(
    interpretation?.interpretation ||
    interpretation?.impression ||
    interpretation?.comment ||
    interpretation?.recommendation ||
    remarks?.length > 0
) && (

    <div
        style={{
            ...commentStyles.container,
            marginTop: "6px",
            fontSize: "10px",
        }}
    >

        {[
            {
                title: "Interpretation",
                value: interpretation?.interpretation,
            },
            {
                title: "Impression",
                value: interpretation?.impression,
            },
            {
                title: "Comment",
                value: interpretation?.comment,
            },
            {
                title: "Recommendation",
                value: interpretation?.recommendation,
            },
        ]
            .filter(item => item.value)
            .map((item) => (

                <div
                    key={item.title}
                    style={{
                        ...commentStyles.row,
                        minHeight: "22px",
                    }}
                >

                    <div
                        style={{
                            ...commentStyles.title,
                            padding: "4px 6px",
                        }}
                    >
                        {item.title}
                    </div>

                    <div
                        style={{
                            ...commentStyles.value,
                            padding: "4px 6px",
                            lineHeight: 1.2,
                        }}
                    >
                        {item.value}
                    </div>

                </div>

            ))}

        {remarks.length > 0 && (

            <div
                style={{
                    ...commentStyles.lastRow,
                    minHeight: "22px",
                }}
            >

                <div
                    style={{
                        ...commentStyles.title,
                        padding: "4px 6px",
                    }}
                >
                    Scientist Remark
                </div>

                <div
                    style={{
                        ...commentStyles.value,
                        padding: "4px 6px",
                        lineHeight: 1.2,
                    }}
                >

                    {remarks.map((remark, index) => (

                        <div key={index}>
                            {remark}
                        </div>

                    ))}

                </div>

            </div>

        )}

    </div>

)}

</div>

);
}