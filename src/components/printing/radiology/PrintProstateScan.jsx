import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintProstateScan({

  results = [],

}) {

  if (!results.length) {

    return null;

  }

  const report =
    results[0];

  let data =

    report.result ||

    report.result_data ||

    {};

  /* ==========================
     JSON SAFETY
  ========================== */

  if (

    typeof data ===
    "string"

  ) {

    try {

      data =
        JSON.parse(data);

    }

    catch {

      data = {};

    }

  }

  const prostateFindings = [

    ["Dimensions", data.dimensions],

    ["Volume", data.volume],

    ["Echotexture", data.echotexture],

    ["Capsule", data.capsule],

    ["Nodules", data.nodules],

    ["Calcifications", data.calcifications],

  ];

  const associatedFindings = [

    ["Seminal Vesicles", data.seminalVesicles],

    ["Urinary Bladder", data.bladder],

    ["Post-Void Residual Volume", data.residualUrine],

    ["Ureters", data.ureters],

  ];

  return (

    <div className="ultrasound-report">

      {/* ==========================
          DEPARTMENT
      ========================== */}

      <div className="department-title">

        RADIOLOGY DEPARTMENT

      </div>

      {/* ==========================
          TEST HEADER
      ========================== */}

      <div className="test-header">

        <div className="test-header-title radiology">

          {

            reportTitle(

              report.test_type ||

              "PROSTATE SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          PROSTATE FINDINGS
      ========================== */}

      <h3 className="section-title">

        Prostate Findings

      </h3>

      <table className="premium-table">

        <tbody>

          {

            prostateFindings.map(

              ([label, value]) => (

                <tr key={label}>

                  <td>

                    {label}

                  </td>

                  <td>

                    {value || "-"}

                  </td>

                </tr>

              )

            )

          }

        </tbody>

      </table>

      {/* ==========================
          ASSOCIATED FINDINGS
      ========================== */}

      <h3 className="section-title">

        Associated Findings

      </h3>

      <table className="premium-table">

        <tbody>

          {

            associatedFindings.map(

              ([label, value]) => (

                <tr key={label}>

                  <td>

                    {label}

                  </td>

                  <td>

                    {value || "-"}

                  </td>

                </tr>

              )

            )

          }

        </tbody>

      </table>

      {/* ==========================
          IMPRESSION
      ========================== */}

      {

        data.impression && (

          <div className="laboratory-comment">

            <div className="impression-row">

              <div className="impression-label">

                Impression

              </div>

              <div className="impression-value">

                {

                  data.impression

                }

              </div>

            </div>

          </div>

        )

      }

      {/* ==========================
          RECOMMENDATION
      ========================== */}

      {

        data.recommendation && (

          <div className="laboratory-comment">

            <div className="interpretation-row">

              <div className="interpretation-label">

                Recommendation

              </div>

              <div className="interpretation-value">

                {

                  data.recommendation

                }

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}