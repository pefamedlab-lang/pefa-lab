import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintBreastScan({

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

  const rightBreast = [

    ["Skin", data.rightSkin],

    ["Nipple", data.rightNipple],

    ["Parenchyma", data.rightParenchyma],

    ["Ducts", data.rightDucts],

    ["Masses", data.rightMasses],

    ["Calcifications", data.rightCalcifications],

  ];

  const leftBreast = [

    ["Skin", data.leftSkin],

    ["Nipple", data.leftNipple],

    ["Parenchyma", data.leftParenchyma],

    ["Ducts", data.leftDucts],

    ["Masses", data.leftMasses],

    ["Calcifications", data.leftCalcifications],

  ];

  const axillaryNodes = [

    ["Right Axilla", data.rightAxilla],

    ["Left Axilla", data.leftAxilla],

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

              "BREAST SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          RIGHT BREAST
      ========================== */}

      <h3 className="section-title">

        Right Breast

      </h3>

      <table className="premium-table">

        <tbody>

          {

            rightBreast.map(

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
          LEFT BREAST
      ========================== */}

      <h3 className="section-title">

        Left Breast

      </h3>

      <table className="premium-table">

        <tbody>

          {

            leftBreast.map(

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
          AXILLARY LYMPH NODES
      ========================== */}

      <h3 className="section-title">

        Axillary Lymph Nodes

      </h3>

      <table className="premium-table">

        <tbody>

          {

            axillaryNodes.map(

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

          <tr>

            <td>

              BI-RADS Category

            </td>

            <td>

              {

                data.birads ||

                "-"

              }

            </td>

          </tr>

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