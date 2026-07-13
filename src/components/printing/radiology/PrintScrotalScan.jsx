import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintScrotalScan({

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

  const rightTestis = [

    ["Size", data.rightTestisSize],

    ["Echotexture", data.rightTestisEcho],

    ["Masses", data.rightTestisMass],

  ];

  const leftTestis = [

    ["Size", data.leftTestisSize],

    ["Echotexture", data.leftTestisEcho],

    ["Masses", data.leftTestisMass],

  ];

  const epididymis = [

    ["Right Epididymis", data.rightEpididymis],

    ["Left Epididymis", data.leftEpididymis],

  ];

  const additionalFindings = [

    ["Spermatic Cords", data.spermaticCords],

    ["Hydrocele", data.hydrocele],

    ["Varicocele", data.varicocele],

    ["Doppler Flow", data.dopplerFlow],

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

              "SCROTAL SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          RIGHT TESTIS
      ========================== */}

      <h3 className="section-title">

        Right Testis

      </h3>

      <table className="premium-table">

        <tbody>

          {

            rightTestis.map(

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
          LEFT TESTIS
      ========================== */}

      <h3 className="section-title">

        Left Testis

      </h3>

      <table className="premium-table">

        <tbody>

          {

            leftTestis.map(

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
          EPIDIDYMIS
      ========================== */}

      <h3 className="section-title">

        Epididymis

      </h3>

      <table className="premium-table">

        <tbody>

          {

            epididymis.map(

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