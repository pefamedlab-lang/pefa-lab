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

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="haematology-analyzer-report">

      <table className="premium-result-table">

        <thead>

          <tr>

            <th>

              Parameter

            </th>

            <th>

              Result

            </th>

            <th>

              Unit

            </th>

            <th>

              Reference Range

            </th>

            <th>

              Flag

            </th>

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

                  className={getResultClass(

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

                {row.reference}

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