import {
  getChemistryComment,
} from "../../utils/chemistryCommentEngine";

export default function PrintGenericPanel({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results.length) {

    return null;

  }

  /* ======================================================
     FLAG STYLE
  ====================================================== */

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

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="generic-report">

      {results.map((test, index) => {

        let data =

          test.result_data ||

          test.result ||

          {};

        if (typeof data === "string") {

          try {

            data = JSON.parse(data);

          }

          catch {

            data = {};

          }

        }

        const rows =

          Object.entries(data);

        const report =

          getChemistryComment(

            test.test_type,

            data

          );

        return (

          <div

            key={index}

            className="chemistry-section"

          >

            {/* ======================================
                RESULT TABLE
            ====================================== */}

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

                {rows.map(

                  ([parameter, item]) => (

                    <tr key={parameter}>

                      <td>

                        {parameter}

                      </td>

                      <td>

                        <span

                          className={getResultClass(

                            item?.flag

                          )}

                        >

                          {

                            item?.result ??

                            "-"

                          }

                        </span>

                      </td>

                      <td>

                        {

                          item?.unit ||

                          "-"

                        }

                      </td>

                      <td>

                        {

                          item?.reference_range ||

                          item?.referenceRange ||

                          "-"

                        }

                      </td>

                      <td>

                        <span

                          className={getFlagClass(

                            item?.flag

                          )}

                        >

                          {

                            item?.flag ||

                            "Normal"

                          }

                        </span>

                      </td>

                    </tr>

                  )

                )}

              </tbody>

            </table>

            {/* ======================================
                INTERPRETATION
            ====================================== */}

            {report?.interpretation && (

              <div className="report-comment">

                <h4>

                  Interpretation

                </h4>

                <p>

                  {

                    report.interpretation

                  }

                </p>

              </div>

            )}

            {/* ======================================
                IMPRESSION
            ====================================== */}

            {report?.impression && (

              <div className="report-comment">

                <h4>

                  Impression

                </h4>

                <p>

                  {

                    report.impression

                  }

                </p>

              </div>

            )}

          </div>

        );

      })}

    </div>

  );

}