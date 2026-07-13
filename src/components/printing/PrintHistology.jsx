export default function PrintHistology({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results?.length) {

    return null;

  }

  /* ======================================================
     JSON SAFETY
  ====================================================== */

  const parseData = (data) => {

    if (!data) {

      return {};

    }

    if (typeof data === "string") {

      try {

        return JSON.parse(data);

      }

      catch {

        return {};

      }

    }

    return data;

  };

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="histology-report">

      {results.map((item, index) => {

        const data = parseData(

          item.result ||

          item.result_data

        );

        return (

          <div

            key={index}

            className="report-block"

          >

            {/* ==========================================
                CLINICAL DETAILS
            ========================================== */}

            {data.clinicalDetails && (

              <div className="report-comment">

                <h4>

                  Clinical Details

                </h4>

                <p>

                  {data.clinicalDetails}

                </p>

              </div>

            )}

            {/* ==========================================
                SPECIMEN RECEIVED
            ========================================== */}

            {data.specimen && (

              <div className="report-comment">

                <h4>

                  Specimen Received

                </h4>

                <p>

                  {data.specimen}

                </p>

              </div>

            )}

            {/* ==========================================
                GROSS DESCRIPTION
            ========================================== */}

            {data.grossDescription && (

              <div className="report-comment">

                <h4>

                  Gross Description

                </h4>

                <p>

                  {data.grossDescription}

                </p>

              </div>

            )}

            {/* ==========================================
                MICROSCOPIC EXAMINATION
            ========================================== */}

            {data.microscopy && (

              <div className="report-comment">

                <h4>

                  Microscopic Examination

                </h4>

                <p>

                  {data.microscopy}

                </p>

              </div>

            )}

            {/* ==========================================
                HISTOPATHOLOGICAL DIAGNOSIS
            ========================================== */}

            {data.diagnosis && (

              <div className="report-comment">

                <h4>

                  Histopathological Diagnosis

                </h4>

                <p>

                  {data.diagnosis}

                </p>

              </div>

            )}

            {/* ==========================================
                RECOMMENDATION
            ========================================== */}

            {data.recommendation && (

              <div className="report-comment">

                <h4>

                  Recommendation

                </h4>

                <p>

                  {data.recommendation}

                </p>

              </div>

            )}

            {/* ==========================================
                PATHOLOGIST COMMENT
            ========================================== */}

            {data.comment && (

              <div className="report-comment">

                <h4>

                  Pathologist Comment

                </h4>

                <p>

                  {data.comment}

                </p>

              </div>

            )}

          </div>

        );

      })}

    </div>

  );

}