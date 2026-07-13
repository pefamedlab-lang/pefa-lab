export default function PrintSpecialGroup({

  results = [],

}) {

  if (!results.length) {

    return null;

  }

  return (

    <div className="special-group-report">

      <h2 className="report-title">

        SPECIAL LABORATORY TESTS

      </h2>

      {results.map(

        (

          report,

          index

        ) => {

          let data =

            report.result ||

            report.result_data ||

            {};

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

          return (

            <div

              key={index}

              className="special-test-block"

            >

              <h3 className="section-title">

                {

                  report.test_type ||

                  report.test_name

                }

              </h3>

              <table className="result-table">

                <tbody>

                  {Object.entries(data)

                    .filter(

                      ([key]) =>

                        ![

                          "interpretation",

                          "impression",

                          "remark",

                        ].includes(key)

                    )

                    .map(

                      ([

                        key,

                        value,

                      ]) => (

                        <tr key={key}>

                          <td>

                            {key}

                          </td>

                          <td>

                            {typeof value ===

                            "object"

                              ? value.result ||

                                "-"

                              : value ||

                                "-"}

                          </td>

                        </tr>

                      )

                    )}

                </tbody>

              </table>

              {data.interpretation && (

                <div className="report-comment">

                  <h4>

                    Interpretation

                  </h4>

                  <p>

                    {

                      data.interpretation

                    }

                  </p>

                </div>

              )}

              {data.impression && (

                <div className="report-comment">

                  <h4>

                    Impression

                  </h4>

                  <p>

                    {

                      data.impression

                    }

                  </p>

                </div>

              )}

              {data.remark && (

                <div className="report-comment">

                  <h4>

                    Scientist Remark

                  </h4>

                  <p>

                    {data.remark}

                  </p>

                </div>

              )}

            </div>

          );

        }

      )}

    </div>

  );

}