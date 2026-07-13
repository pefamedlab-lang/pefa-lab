export default function PrintRadiology({

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

    <div className="radiology-report">

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
                CLINICAL INFORMATION
            ========================================== */}

            {data.clinicalInformation && (

              <div className="report-comment">

                <h4>

                  Clinical Information

                </h4>

                <p>

                  {data.clinicalInformation}

                </p>

              </div>

            )}

            {/* ==========================================
                EXAMINATION
            ========================================== */}

            {data.examination && (

              <div className="report-comment">

                <h4>

                  Examination

                </h4>

                <p>

                  {data.examination}

                </p>

              </div>

            )}

            {/* ==========================================
                FINDINGS
            ========================================== */}

            {data.findings && (

              <div className="report-comment">

                <h4>

                  Findings

                </h4>

                <p>

                  {data.findings}

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
                RADIOLOGIST COMMENT
            ========================================== */}

            {data.comment && (

              <div className="report-comment">

                <h4>

                  Radiologist Comment

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