import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintKidneyScan({

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

  const rightKidney = [

    ["Size", data.rightKidneySize],

    ["Echotexture", data.rightKidneyEcho],

    ["Corticomedullary Differentiation", data.rightCMD],

    ["Pelvicalyceal System", data.rightPCS],

    ["Calculi", data.rightCalculi],

    ["Masses", data.rightMass],

  ];

  const leftKidney = [

    ["Size", data.leftKidneySize],

    ["Echotexture", data.leftKidneyEcho],

    ["Corticomedullary Differentiation", data.leftCMD],

    ["Pelvicalyceal System", data.leftPCS],

    ["Calculi", data.leftCalculi],

    ["Masses", data.leftMass],

  ];

  const urinarySystem = [

    ["Right Ureter", data.rightUreter],

    ["Left Ureter", data.leftUreter],

    ["Urinary Bladder", data.bladder],

    ["Residual Urine", data.residualUrine],

    ["Prostate", data.prostate],

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

              "KIDNEY SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          RIGHT KIDNEY
      ========================== */}

      <h3 className="section-title">

        Right Kidney

      </h3>

      <table className="premium-table">

        <tbody>

          {

            rightKidney.map(

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
          LEFT KIDNEY
      ========================== */}

      <h3 className="section-title">

        Left Kidney

      </h3>

      <table className="premium-table">

        <tbody>

          {

            leftKidney.map(

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
          URINARY SYSTEM
      ========================== */}

      <h3 className="section-title">

        Urinary System

      </h3>

      <table className="premium-table">

        <tbody>

          {

            urinarySystem.map(

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