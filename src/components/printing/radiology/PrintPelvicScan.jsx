import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintPelvicScan({

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

  const pelvicOrgans = [

    ["Uterus", data.uterus],

    ["Uterine Size", data.uterineSize],

    ["Uterine Position", data.uterinePosition],

    ["Myometrium", data.myometrium],

    ["Endometrium", data.endometrium],

    ["Endometrial Thickness", data.endometrialThickness],

    ["Cervix", data.cervix],

    ["Right Ovary", data.rightOvary],

    ["Right Ovary Size", data.rightOvarySize],

    ["Left Ovary", data.leftOvary],

    ["Left Ovary Size", data.leftOvarySize],

    ["Adnexae", data.adnexae],

    ["Pouch of Douglas", data.pouchOfDouglas],

    ["Urinary Bladder", data.bladder],

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

              "PELVIC SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          PELVIC ORGANS
      ========================== */}

      <h3 className="section-title">

        Pelvic Findings

      </h3>

      <table className="premium-table">

        <tbody>

          {

            pelvicOrgans.map(

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