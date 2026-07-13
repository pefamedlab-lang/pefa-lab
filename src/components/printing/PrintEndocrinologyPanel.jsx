import {
  getFullTestName,
} from "../../utils/fullTestName";

export default function PrintEndocrinologyPanel({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results?.length) {

    return null;

  }

  /* ======================================================
     HELPERS
  ====================================================== */

  const parseData = (data) => {

    if (!data) {

      return {};

    }

    if (typeof data === "string") {

      try {

        return JSON.parse(data);

      }

      catch {

        return {};

      }

    }

    return data;

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

  /* ======================================================
     BUILD ROWS
  ====================================================== */

  const rows = [];

  results.forEach((item) => {

    const data = parseData(

      item.result ||

      item.result_data

    );

    /* ==========================================
       SINGLE TEST
    ========================================== */

    if (data?.parameter) {

      rows.push({

        parameter:

          getFullTestName(

            data.parameter ||

            item.test_type ||

            "-"

          ),

        result:

          data.result ??

          "-",

        unit:

          data.unit ||

          "-",

        referenceRange:

          data.reference_range ||

          data.referenceRange ||

          "-",

        flag:

          data.flag ||

          "Normal",

      });

    }

    /* ==========================================
       PANEL OBJECT
    ========================================== */

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

              referenceRange:

                value.reference_range ||

                value.referenceRange ||

                "-",

              flag:

                value.flag ||

                "Normal",

            });

          }

        }

      );

    }

    /* ==========================================
       ARRAY FORMAT
    ========================================== */

    else if (

      Array.isArray(data)

    ) {

      data.forEach((value) => {

        rows.push({

          parameter:

            getFullTestName(

              value.parameter ||

              value.name ||

              "-"

            ),

          result:

            value.result ??

            "-",

          unit:

            value.unit ||

            "-",

          referenceRange:

            value.reference_range ||

            value.referenceRange ||

            "-",

          flag:

            value.flag ||

            "Normal",

        });

      });

    }

  });

  /* ======================================================
     EMPTY TABLE
  ====================================================== */

  if (!rows.length) {

    return (

      <div className="endocrinology-report">

        <table className="premium-table">

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
     REPORT
  ====================================================== */

  return (

    <div className="endocrinology-report">

      <table className="premium-table">

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

              <td>

                {row.parameter}

              </td>

              <td>

                <span

                  className={getFlagClass(

                    row.flag

                  )}

                >

                  {row.result}

                </span>

              </td>

              <td>

                {row.unit}

              </td>

              <td>

                {row.referenceRange}

              </td>

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