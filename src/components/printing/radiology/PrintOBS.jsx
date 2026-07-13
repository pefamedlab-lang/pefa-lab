import { reportTitle }
from "../../../utils/reportTitle";

export default function PrintOBS({

  results = [],

}) {

  if (!results.length) {

    return null;

  }

  const report = results[0];

  let data =

    report.result ||

    report.result_data ||

    {};

  /* ==========================
     JSON SAFETY
  ========================== */

  if (

    typeof data === "string"

  ) {

    try {

      data = JSON.parse(data);

    }

    catch {

      data = {};

    }

  }

  const bioParameters = [

    ["Gestational Age", data.gestationalAge],

    ["Estimated Due Date (EDD)", data.edd],

    ["BPD", data.bpd],

    ["HC", data.hc],

    ["AC", data.ac],

    ["FL", data.fl],

    ["Estimated Fetal Weight", data.efw],

    ["Fetal Heart Rate", data.fhr],

  ];

  const placentaStatus = [

    ["Placental Location", data.placentaLocation],

    ["Placental Grade", data.placentaGrade],

    ["Placenta Previa", data.placentaPrevia],

    ["Placental Maturity", data.placentaMaturity],

  ];

  const fetalStatus = [

    ["Presentation", data.presentation],

    ["Lie", data.lie],

    ["Number of Fetuses", data.numberOfFetuses],

    ["Amniotic Fluid Index", data.afi],

    ["Fetal Movement", data.fetalMovement],

    ["Fetal Viability", data.fetalViability],

    ["Congenital Anomalies", data.congenitalAnomalies],

  ];

  const cervix = [

    ["Cervical Length", data.cervicalLength],

    ["Internal Os", data.internalOs],

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

              "OBSTETRIC SCAN"

            )

          }

        </div>

      </div>

      {/* ==========================
          BIO PARAMETERS
      ========================== */}

      <h3 className="section-title">

        Bio-Parameters

      </h3>

      <table className="premium-table">

        <tbody>

          {bioParameters.map(

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

          )}

        </tbody>

      </table>

      {/* ==========================
          PLACENTA STATUS
      ========================== */}

      <h3 className="section-title">

        Placenta Status

      </h3>

      <table className="premium-table">

        <tbody>

          {placentaStatus.map(

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

          )}

        </tbody>

      </table>

      {/* ==========================
          FETAL STATUS
      ========================== */}

      <h3 className="section-title">

        Fetal Status

      </h3>

      <table className="premium-table">

        <tbody>

          {fetalStatus.map(

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

          )}

        </tbody>

      </table>

      {/* ==========================
          CERVIX
      ========================== */}

      <h3 className="section-title">

        Cervix

      </h3>

      <table className="premium-table">

        <tbody>

          {cervix.map(

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

          )}

        </tbody>

      </table>

      {/* ==========================
          IMPRESSION
      ========================== */}

      {data.impression && (

        <div className="laboratory-comment">

          <div className="impression-row">

            <div className="impression-label">

              Impression

            </div>

            <div className="impression-value">

              {data.impression}

            </div>

          </div>

        </div>

      )}

      {/* ==========================
          RECOMMENDATION
      ========================== */}

      {data.recommendation && (

        <div className="laboratory-comment">

          <div className="interpretation-row">

            <div className="interpretation-label">

              Recommendation

            </div>

            <div className="interpretation-value">

              {data.recommendation}

            </div>

          </div>

        </div>

      )}

    </div>

  );

}