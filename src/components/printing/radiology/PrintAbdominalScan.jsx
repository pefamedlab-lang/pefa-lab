import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintAbdominalScan({

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

  const abdominalOrgans = [

    ["Liver", data.liver],

    ["Gall Bladder", data.gallBladder],

    ["Common Bile Duct", data.cbd],

    ["Pancreas", data.pancreas],

    ["Spleen", data.spleen],

    ["Right Kidney", data.rightKidney],

    ["Right Kidney Size", data.rightKidneySize],

    ["Left Kidney", data.leftKidney],

    ["Left Kidney Size", data.leftKidneySize],

    ["Abdominal Aorta", data.aorta],

    ["Inferior Vena Cava", data.ivc],

    ["Urinary Bladder", data.bladder],

    ["Free Fluid", data.freeFluid],

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

              "ABDOMINAL SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          ABDOMINAL ORGANS
      ========================== */}

      <h3 className="section-title">

        Abdominal Findings

      </h3>

      <table className="premium-table">

        <tbody>

          {

            abdominalOrgans.map(

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