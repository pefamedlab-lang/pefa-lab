import {
  getFullTestName,
} from "../../utils/fullTestName";

export default function PrintEndocrinologySingle({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results.length) {

    return null;

  }

  const report = results[0];

  let data =

    report.result ||

    report.result_data ||

    {};

  /* ======================================================
     JSON SAFETY
  ====================================================== */

  if (typeof data === "string") {

    try {

      data = JSON.parse(data);

    }

    catch {

      data = {};

    }

  }

  /* ======================================================
     FLAG HELPERS
  ====================================================== */

  const getRowClass = (flag = "") => {

    const value =

      String(flag)

        .toLowerCase()

        .trim();

    if (

      value === "high" ||

      value === "h"

    ) {

      return "result-row-high";

    }

    if (

      value === "low" ||

      value === "l"

    ) {

      return "result-row-low";

    }

    if (

      value === "critical" ||

      value === "c"

    ) {

      return "result-row-critical";

    }

    return "result-row-normal";

  };

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

    return "result-value";

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
     DISPLAY NAME
  ====================================================== */

  const parameter =

    getFullTestName(

      data.parameter ||

      report.test_type ||

      report.test_name ||

      "-"

    );

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="endocrinology-report">

      <table className="premium-table">

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

          <tr

            className={getRowClass(

              data.flag

            )}

          >

            <td>

              {parameter}

            </td>

            <td>

              <span

                className={getResultClass(

                  data.flag

                )}

              >

                {

                  data.result ||

                  "-"

                }

              </span>

            </td>

            <td>

              {

                data.unit ||

                "-"

              }

            </td>

            <td>

              {

                data.reference_range ||

                data.referenceRange ||

                "-"

              }

            </td>

            <td>

              <span

                className={getFlagClass(

                  data.flag

                )}

              >

                {

                  data.flag ||

                  "Normal"

                }

              </span>

            </td>

          </tr>

        </tbody>

      </table>

      {/* ==================================================
          INTERPRETATION
      ================================================== */}

      {data.interpretation && (

        <div className="report-comment">

          <h4>

            Interpretation

          </h4>

          <p>

            {data.interpretation}

          </p>

        </div>

      )}

      {/* ==================================================
          IMPRESSION
      ================================================== */}

      {data.impression && (

        <div className="report-comment">

          <h4>

            Impression

          </h4>

          <p>

            {data.impression}

          </p>

        </div>

      )}

      {/* ==================================================
          SCIENTIST REMARK
      ================================================== */}

      {data.remark && (

        <div className="report-comment">

          <h4>

            Scientist Remark

          </h4>

          <p>

            {data.remark}

          </p>

        </div>

      )}

    </div>

  );

}