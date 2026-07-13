import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintLiverScan({

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

  const liverFindings = [

    ["Liver Size", data.liverSize],

    ["Liver Echotexture", data.liverEcho],

    ["Liver Surface", data.liverSurface],

    ["Focal Lesions", data.focalLesions],

    ["Intrahepatic Bile Ducts", data.intrahepaticDucts],

    ["Portal Vein", data.portalVein],

    ["Hepatic Veins", data.hepaticVeins],

  ];

  const biliarySystem = [

    ["Gall Bladder", data.gallBladder],

    ["Gall Bladder Wall", data.gbWall],

    ["Gall Stones", data.gallStones],

    ["Common Bile Duct", data.cbd],

  ];

  const additionalFindings = [

    ["Pancreas", data.pancreas],

    ["Spleen", data.spleen],

    ["Ascites", data.ascites],

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

              "LIVER SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          LIVER FINDINGS
      ========================== */}

      <h3 className="section-title">

        Liver Findings

      </h3>

      <table className="premium-table">

        <tbody>

          {

            liverFindings.map(

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
          BILIARY SYSTEM
      ========================== */}

      <h3 className="section-title">

        Biliary System

      </h3>

      <table className="premium-table">

        <tbody>

          {

            biliarySystem.map(

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
          ADDITIONAL FINDINGS
      ========================== */}

      <h3 className="section-title">

        Additional Findings

      </h3>

      <table className="premium-table">

        <tbody>

          {

            additionalFindings.map(

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