import {
  calculatedParameters,
} from "../../data/calculatedParameters";

import {
  panelReference,
} from "../../data/panelReference";

import { useState, useEffect } from "react";

import {
  panelTemplates,
} from "../../data/panelTemplates";

export default function GenericPanel({

  test,

patient,

  resultData,

  setResultData,

}) {

  const [
    results,
    setResults,
  ] = useState({});


  const parameters =

    panelTemplates[
      test?.test_name
    ] || [];

console.log(
  "PARAMETERS:",
  JSON.stringify(
    parameters,
    null,
    2
  )
);
  useEffect(() => {

  setResults(
    resultData || {}
  );

}, [resultData]);

const getFlag =
(
  value,
  low,
  high
) => {

  const num =
    Number(value);

  if (
    isNaN(num)
  )
    return "";

  if (
    num < low
  )
    return "Low";

  if (
    num > high
  )
    return "High";

  return "Normal";

};

const getReferenceRange =
(
  parameter
) => {

  const config =
    panelReference[
      parameter
    ];

  if (!config)
    return null;

  const age =
    Number(
      patient?.age
    );

  const sex =
    (
      patient?.sex || ""
    ).toLowerCase();

  if (
    age < 14
  )
    return config.child;

  if (
    sex ===
    "female"
  )
    return config.female;

  return config.male;

};


const getUnit =
(
  parameter
) => {

  return (
    panelReference[
      parameter
    ]?.unit || ""
  );

};


 const updateResult =
(
  parameter,
  value
) => {

  const reference =
    getReferenceRange(
      parameter
    );

  const updated = {

    ...results,

    [parameter]: {

      result:
        value,

      unit:
  getUnit(
    parameter
  ),

      reference_range:
        reference

          ?

          `${reference.low}-${reference.high}`

          :

          "",

      flag:
        reference

          ?

          getFlag(
              value,
              reference.low,
              reference.high
            )

          :

          "",

    },

  };

/* =========================
   AUTO CALCULATED PARAMETERS
========================= */

Object.entries(
  calculatedParameters
).forEach(

  ([parameterName, calculator]) => {

    const result =
      calculator(
        updated
      );

    if (
      result === null
    )
      return;

    const reference =
      getReferenceRange(
        parameterName
      );

    updated[
      parameterName
    ] = {

      result,

      unit:
        getUnit(
          parameterName
        ),

      reference_range:
        reference

          ?

          `${reference.low}-${reference.high}`

          :

          "",

      flag:
        reference

          ?

          getFlag(
            result,
            reference.low,
            reference.high
          )

          :

          "",

    };

  }

);



  setResults(
    updated
  );

  setResultData(
    updated
  );

};

  return (

    <div className="panel-result-wrapper">

      <h3
        className="panel-title"
      >

        {test?.test_name}

      </h3>

      <table
        className="result-table"
      >

       <thead>

  <tr>

    <th>
      Parameter
    </th>

    <th>
      Result
    </th>

    <th>
      Unit
    </th>

    <th>
      Reference
    </th>

    <th>
      Flag
    </th>

  </tr>

</thead>

        <tbody>

          {

            parameters.length === 0

            ? (

              <tr>

                <td
                  colSpan="5"
                  style={{
                    textAlign:
                      "center",
                  }}
                >

                  No parameters
                  configured.

                </td>

              </tr>

            )

            : (

              parameters.map(
                (
                  parameter,
                  index
                ) => (

                  <tr
                    key={index}
                  >

                    <td>

                      {
                        parameter
                      }

                    </td>

<td>

  <input

    type="number"

    value={
  results[
    parameter
  ]?.result || ""
}

    onChange={(
      e
    ) =>

      updateResult(

        parameter,

        e.target.value

      )

    }

    className="panel-input"

  />

</td>

<td>

  {
  getUnit(
    parameter
  ) || "-"
}

</td>



<td>

  {

    getReferenceRange(
      parameter
    )

      ?

      `${getReferenceRange(
        parameter
      ).low}
      -
      ${getReferenceRange(
        parameter
      ).high}`

      :

      "-"

  }

</td>

<td>

  {

    results[
      parameter
    ]?.flag || ""

  }

</td>

      </tr>

                )
              )

            )

          }

        </tbody>

      </table>

    </div>

  );

}