export default function PrintWidal({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results.length) {

    return null;

  }

  const report = results[0];

  let data =

    report.result ||

    report.result_data ||

    {};

  /* ======================================================
     JSON SAFETY
  ====================================================== */

  if (typeof data === "string") {

    try {

      data = JSON.parse(data);

    }

    catch {

      data = {};

    }

  }

  /* ======================================================
     RESULT STYLE
  ====================================================== */

  const getResultClass = (value = "") => {

    const result =

      String(value)

        .toLowerCase()

        .trim();

    if (

      result.includes("positive") ||

      result.includes("reactive") ||

      result.includes("detected")

    ) {

      return "flag-high";

    }

    if (

      result.includes("negative") ||

      result.includes("non reactive") ||

      result.includes("not detected")

    ) {

      return "flag-normal";

    }

    return "result-value";

  };

  /* ======================================================
     MALARIA PARASITE
  ====================================================== */

  const mpRDT =

    data.mpRDT ||

    data.malariaRDT ||

    "";

  const mpMicroscopy =

    data.mpMicroscopy ||

    data.malariaMicroscopy ||

    "";

  const showMP =

    mpRDT ||

    mpMicroscopy;

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="widal-report">

      {/* ==========================================
          WIDAL TABLE
      ========================================== */}

      <table className="premium-table widal-table">

        <thead>

          <tr>

            <th>

              Salmonella Species

            </th>

            <th>

              O Antigen

            </th>

            <th>

              H Antigen

            </th>

          </tr>

        </thead>

        <tbody>

          <tr>

            <td>

              S. Typhi

            </td>

            <td>

              {data.typhiO || "-"}

            </td>

            <td>

              {data.typhiH || "-"}

            </td>

          </tr>

          <tr>

            <td>

              S. Paratyphi A

            </td>

            <td>

              {data.paraAO || "-"}

            </td>

            <td>

              {data.paraAH || "-"}

            </td>

          </tr>

          <tr>

            <td>

              S. Paratyphi B

            </td>

            <td>

              {data.paraBO || "-"}

            </td>

            <td>

              {data.paraBH || "-"}

            </td>

          </tr>

          <tr>

            <td>

              S. Paratyphi C

            </td>

            <td>

              {data.paraCO || "-"}

            </td>

            <td>

              {data.paraCH || "-"}

            </td>

          </tr>

        </tbody>

      </table>

      {/* ==========================================
          WIDAL NOTE
      ========================================== */}

      <div className="widal-note">

        Significant titre values should be interpreted
        in conjunction with the patient's clinical
        findings and previous baseline titres.

      </div>

      {/* ==========================================
          MALARIA PARASITE
      ========================================== */}

      {showMP && (

        <>

          <div className="sub-test-title">

            Malaria Parasite Test

          </div>

          <table className="premium-table mp-table">

            <tbody>

              {mpRDT && (

                <tr>

                  <td>

                    MP RDT

                  </td>

                  <td>

                    <span

                      className={getResultClass(

                        mpRDT

                      )}

                    >

                      {mpRDT}

                    </span>

                  </td>

                </tr>

              )}

              {mpMicroscopy && (

                <tr>

                  <td>

                    MP Microscopy

                  </td>

                  <td>

                    <span

                      className={getResultClass(

                        mpMicroscopy

                      )}

                    >

                      {mpMicroscopy}

                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </>

      )}

      {/* ==========================================
          INTERPRETATION
      ========================================== */}

      {data.interpretation && (

        <div className="report-comment">

          <h4>

            Interpretation

          </h4>

          <p>

            {data.interpretation}

          </p>

        </div>

      )}

      {/* ==========================================
          IMPRESSION
      ========================================== */}

      {data.impression && (

        <div className="report-comment">

          <h4>

            Impression

          </h4>

          <p>

            {data.impression}

          </p>

        </div>

      )}

      {/* ==========================================
          SCIENTIST REMARK
      ========================================== */}

      {(data.scientistRemark || data.remark) && (

        <div className="report-comment">

          <h4>

            Scientist Remark

          </h4>

          <p>

            {data.scientistRemark ||

             data.remark}

          </p>

        </div>

      )}

    </div>

  );

}