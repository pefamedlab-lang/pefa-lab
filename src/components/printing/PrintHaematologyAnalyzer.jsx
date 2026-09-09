import {
  getFullTestName,
} from "../../utils/fullTestName";

export default function PrintHaematologyAnalyzer({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results?.length) {

    return null;

  }

  /* ======================================================
     BUILD ROWS
  ====================================================== */

  const rows = [];

  results.forEach((test) => {

    let data =

      test.result_data ||

      test.result ||

      {};

/* ======================================================
   DEPARTMENT / TEST TITLE
====================================================== */

const department =
    results[0]?.department_name ||
    results[0]?.department ||
    "Haematology";

const showTestTitle = results.length === 1;

const testTitle = showTestTitle
    ? (
        results[0]?.test_name ||
        getFullTestName(
            results[0]?.test_type || ""
        )
      )
    : null;

    /* ==================================================
       JSON SAFETY
    ================================================== */

    if (typeof data === "string") {

      try {

        data = JSON.parse(data);

      }

      catch {

        data = {};

      }

    }

    Object.entries(data).forEach(

      ([parameter, value]) => {

        if (

          !value ||

          typeof value !== "object"

        ) {

          return;

        }

        rows.push({

          parameter:

            getFullTestName(

              parameter

            ),

          result:

            value.result ??

            "-",

          unit:

            value.unit ||

            "-",

          reference:

            value.reference_range ||

            value.referenceRange ||

            "-",

          flag:

            value.flag ||

            "Normal",

        });

      }

    );

  });

  /* ======================================================
     EMPTY REPORT
  ====================================================== */

  if (!rows.length) {

    return null;

  }

  /* ======================================================
     FLAG STYLE
  ====================================================== */

  const getResultClass = (flag = "") => {

    const value =

      String(flag)

        .toLowerCase()

        .trim();

    if (

      value === "high" ||

      value === "h"

    ) {

      return "result-high";

    }

    if (

      value === "low" ||

      value === "l"

    ) {

      return "result-low";

    }

    if (

      value === "critical" ||

      value === "c"

    ) {

      return "result-critical";

    }

    return "result-normal";

  };

  const getFlagClass = (flag = "") => {

    const value =

      String(flag)

        .toLowerCase()

        .trim();

    if (

      value === "high" ||

      value === "h"

    ) {

      return "flag-high";

    }

    if (

      value === "low" ||

      value === "l"

    ) {

      return "flag-low";

    }

    if (

      value === "critical" ||

      value === "c"

    ) {

      return "flag-critical";

    }

    return "flag-normal";

  };

return (

    <div className="haematology-analyzer-report">

        {/* ==========================================
            DEPARTMENT
        ========================================== */}

        <div
            className="department-title"
            style={{
                fontSize: "15px",
                fontWeight: "700",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: ".6px",
                padding: "8px",
                marginBottom: "8px",
                background: "#eef4ff",
                border: "2px solid #2f5597",
                color: "#1d3557",
            }}
        >
            {department}
        </div>

        {/* ==========================================
            TEST TITLE
        ========================================== */}

        {showTestTitle && testTitle && (

            <div
                className="test-title"
                style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    textAlign: "center",
                    textTransform: "uppercase",
                    padding: "7px",
                    marginBottom: "12px",
                    background: "#f8f9fa",
                    border: "1px solid #bfc8d4",
                    color: "#2c3e50",
                }}
            >
                {testTitle}
            </div>

        )}

        <table
            className="premium-result-table"
            style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                border: "2px solid #6c757d",
                fontSize: "10px",
            }}
        >

            <thead>

                <tr>

                    <th>Parameter</th>

                    <th>Result</th>

                    <th>Unit</th>

                    <th>Reference Range</th>

                    <th>Flag</th>

                </tr>

            </thead>

            <tbody>

                {rows.map((row, index) => (

                    <tr
                        key={index}
                        className={`result-row-${(
                            row.flag ||
                            "normal"
                        )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                    >

                        <td>{row.parameter}</td>

                        <td>

                            <span
                                className={getResultClass(
                                    row.flag
                                )}
                            >
                                {row.result}
                            </span>

                        </td>

                        <td>{row.unit}</td>

                        <td>{row.reference}</td>

                        <td>

                            <span
                                className={getFlagClass(
                                    row.flag
                                )}
                            >
                                {row.flag}
                            </span>

                        </td>

                    </tr>

                ))}

            </tbody>

        </table>

    </div>

);

}