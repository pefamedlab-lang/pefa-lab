import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintThyroidScan({

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

  const rightLobe = [

    ["Size", data.rightLobeSize],

    ["Echotexture", data.rightLobeEcho],

    ["Nodules", data.rightLobeNodules],

    ["Calcifications", data.rightLobeCalcifications],

    ["Vascularity", data.rightLobeVascularity],

  ];

  const leftLobe = [

    ["Size", data.leftLobeSize],

    ["Echotexture", data.leftLobeEcho],

    ["Nodules", data.leftLobeNodules],

    ["Calcifications", data.leftLobeCalcifications],

    ["Vascularity", data.leftLobeVascularity],

  ];

  const otherFindings = [

    ["Isthmus", data.isthmus],

    ["Cervical Lymph Nodes", data.cervicalNodes],

    ["Tracheal Position", data.trachea],

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

              "THYROID SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          RIGHT LOBE
      ========================== */}

      <h3 className="section-title">

        Right Thyroid Lobe

      </h3>

      <table className="premium-table">

        <tbody>

          {

            rightLobe.map(

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
          LEFT LOBE
      ========================== */}

      <h3 className="section-title">

        Left Thyroid Lobe

      </h3>

      <table className="premium-table">

        <tbody>

          {

            leftLobe.map(

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
          OTHER FINDINGS
      ========================== */}

      <h3 className="section-title">

        Other Findings

      </h3>

      <table className="premium-table">

        <tbody>

          {

            otherFindings.map(

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