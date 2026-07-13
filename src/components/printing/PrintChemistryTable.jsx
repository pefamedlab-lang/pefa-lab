import {
  getChemistryInterpretation,
} from "../../utils/chemistryInterpretation";

import {
  generateAutoInterpretation,
} from "../../utils/generateAutoInterpretation";

export default function PrintChemistryTable({

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

    if (!data) return {};

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

    const value = String(flag)

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
     BUILD TABLE ROWS
  ====================================================== */

  const rows = [];

  results.forEach((report) => {

    const data = parseData(

      report.result ||

      report.result_data

    );

    /* ==========================================
       SINGLE TEST
    ========================================== */

    if (data?.parameter) {

      rows.push({

        parameter:

          data.parameter ||

          report.test_type ||

          "-",

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

              parameter,

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

      data.forEach((item) => {

        rows.push({

          parameter:

            item.parameter ||

            item.name ||

            "-",

          result:

            item.result ??

            "-",

          unit:

            item.unit ||

            "-",

          referenceRange:

            item.reference_range ||

            item.referenceRange ||

            "-",

          flag:

            item.flag ||

            "Normal",

        });

      });

    }

  });

  /* ======================================================
     EMPTY TABLE
  ====================================================== */

  if (rows.length === 0) {

    return (

      <div className="chemistry-report">

        <table className="result-table">

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
   AUTO INTERPRETATION
====================================================== */

const firstReport = results[0] || {};

const testName =
  firstReport.test_type ||
  firstReport.test_name ||
  "";

/* Convert table rows into interpretation engine format */

const parsedResults = {};

rows.forEach((row) => {

  parsedResults[row.parameter] = {

    result: row.result,

    unit: row.unit,

    reference_range: row.referenceRange,

    flag: row.flag,

  };

});

let autoInterpretation = "";

let autoImpression = "";

if (

  [

    "LFT",

    "KFT",

    "Lipid Profile",

    "Diabetes Profile",

    "Liver Function Test",

    "Kidney Function Test",

    "Fasting Lipid Profile",

  ].includes(testName)

) {

  const output =

    getChemistryInterpretation(

      testName,

      parsedResults

    );

  autoInterpretation =
    output?.interpretation ||
    "Results are within normal laboratory reference limits.";

  autoImpression =
    output?.impression ||
    "No significant laboratory abnormality detected.";

}

else {

  autoInterpretation =
    generateAutoInterpretation(
      parsedResults
    );

  autoImpression =
    "Clinical correlation is advised.";

}

  /* ======================================================
     SCIENTIST REMARKS
  ====================================================== */

  const remarks =

    results

      .map((report) => {

        const data = parseData(

          report.result ||

          report.result_data

        );

        return (

          report.remark ||

          data.remark ||

          null

        );

      })

      .filter(Boolean);

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="chemistry-report">

      {/* ==========================================
          RESULT TABLE
      ========================================== */}

      <table className="result-table">

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

            (

              row,

              index

            ) => (

              <tr

                key={index}

                className={`result-row-${(

                  row.flag ||

                  "normal"

                )

                  .toLowerCase()

                  .replace(

                    /\s+/g,

                    "-"

                  )}`}

              >

                <td>

                  {row.parameter}

                </td>

                <td>

                  <span

                    className={

                      getFlagClass(

                        row.flag

                      )

                    }

                  >

                    {row.result}

                  </span>

                </td>

                <td>

                  {row.unit}

                </td>

                <td>

                  {

                    row.referenceRange

                  }

                </td>

                <td>

                  <span

                    className={

                      getFlagClass(

                        row.flag

                      )

                    }

                  >

                    {row.flag}

                  </span>

                </td>

              </tr>

            )

          )}

        </tbody>

      </table>

     


    </div>

  );

}