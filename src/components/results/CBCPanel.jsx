import { useState } from "react";

export default function CBCPanel({

  resultData,

  setResultData,

}) {

  const [

    results,

    setResults,

  ] = useState({});

  const parameters = [

    "PCV",

    "Hemoglobin",

    "RBC",

    "MCV",

    "MCH",

    "MCHC",

    "Platelets",

    "WBC",

    "Neutrophils",

    "Lymphocytes",

    "Monocytes",

    "Eosinophils",

    "Basophils",

  ];

  const updateResult = (

    parameter,

    value

  ) => {

    const updated = {

      ...results,

      [parameter]: value,

    };

    setResults(

      updated

    );

    setResultData(

      updated

    );

  };

  return (

    <div>

      <h3>

        Complete Blood Count

      </h3>

      <table className="result-table">

        <thead>

          <tr>

            <th>

              Parameter

            </th>

            <th>

              Result

            </th>

          </tr>

        </thead>

        <tbody>

          {parameters.map(

            (

              parameter

            ) => (

              <tr

                key={parameter}

              >

                <td>

                  {parameter}

                </td>

                <td>

                  <input

                    type="text"

                    value={

                      results[

                        parameter

                      ] || ""

                    }

                    onChange={(e) =>

                      updateResult(

                        parameter,

                        e.target

                          .value

                      )

                    }

                  />

                </td>

              </tr>

            )

          )}

        </tbody>

      </table>

    </div>

  );

}