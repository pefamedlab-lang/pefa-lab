export default function PrintQualitative({

  results = [],

}) {

  if (!results.length) {

    return null;

  }

  /* ======================================================
     BUILD ROWS
  ====================================================== */

  const rows = [];

  results.forEach((report) => {

    let data =

      report.result ||

      report.result_data ||

      {};

    /* ==================================================
       JSON SAFETY
    ================================================== */

    if (typeof data === "string") {

      try {

        data = JSON.parse(data);

      } catch {

        data = {};

      }

    }

    /* ==================================================
       SINGLE QUALITATIVE RESULT
    ================================================== */

    if (data.parameter) {

      rows.push({

        test:

          data.parameter ||

          report.test_type ||

          "-",

        result:

          data.result ||

          "Pending",

      });

    }

    /* ==================================================
       OBJECT FORMAT
    ================================================== */

    else if (

      data &&

      typeof data === "object" &&

      !Array.isArray(data)

    ) {

      Object.entries(data).forEach(

        ([parameter, value]) => {

          rows.push({

            test:

              report.test_type ||

              parameter,

            result:

              typeof value === "object"

                ? (

                    value.result ||

                    "Pending"

                  )

                : (

                    value ||

                    "Pending"

                  ),

          });

        }

      );

    }

  });

  /* ======================================================
     RESULT STYLE
  ====================================================== */

  const getResultClass = (result = "") => {

    const value =

      String(result)

        .toLowerCase()

        .trim();

    if (

      value.includes("positive") ||

      value === "positive"

    ) {

      return "flag-high";

    }

    if (

      value.includes("negative") ||

      value === "negative"

    ) {

      return "flag-normal";

    }

    if (

      value.includes("reactive")

    ) {

      return "flag-high";

    }

    if (

      value.includes("non reactive")

    ) {

      return "flag-normal";

    }

    if (

      value.includes("detected")

    ) {

      return "flag-high";

    }

    if (

      value.includes("not detected")

    ) {

      return "flag-normal";

    }

    return "result-value";

  };

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="qualitative-report">

      <table className="premium-table">

        <thead>

          <tr>

            <th>

              Test

            </th>

            <th>

              Result

            </th>

          </tr>

        </thead>

        <tbody>

          {rows.map((row, index) => (

            <tr key={index}>

              <td>

                {row.test}

              </td>

              <td>

                <span

                  className={getResultClass(

                    row.result

                  )}

                >

                  {row.result}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}