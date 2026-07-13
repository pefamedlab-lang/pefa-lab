import {
  getFullTestName,
} from "../../utils/fullTestName";

export default function PrintChemistrySingle({

  results = [],

}) {

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

    } catch {

      data = {};

    }

  }

  /* ======================================================
     TEST NAME
  ====================================================== */

  const testName = getFullTestName(

    report.test_type ||

    report.test_name ||

    data.parameter ||

    "Chemistry Test"

  );

  /* ======================================================
     FLAG CLASS
  ====================================================== */

  const getFlagClass = (flag) => {

    if (!flag) {

      return "flag-normal";

    }

    const value =

      String(flag)

        .toLowerCase()

        .trim();

    if (

      value.includes("high") ||

      value === "h"

    ) {

      return "flag-high";

    }

    if (

      value.includes("low") ||

      value === "l"

    ) {

      return "flag-low";

    }

    if (

      value.includes("critical") ||

      value === "c"

    ) {

      return "flag-critical";

    }

    return "flag-normal";

  };

  return (

    <div className="chemistry-report">

      {/* ==================================================
          RESULT TABLE
      ================================================== */}

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

            <td>

              {data.parameter || testName}

            </td>

            <td>

              <span

                className={getFlagClass(

                  data.flag

                )}

              >

                {data.result || "-"}

              </span>

            </td>

            <td>

              {data.unit || "-"}

            </td>

            <td>

              {data.reference_range || "-"}

            </td>

            <td>

              <span

                className={getFlagClass(

                  data.flag

                )}

              >

                {data.flag || "Normal"}

              </span>

            </td>

          </tr>

        </tbody>

      </table>

      {/* ==================================================
          OPTIONAL INTERPRETATION
          (Will later be handled by InterpretationSection)
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