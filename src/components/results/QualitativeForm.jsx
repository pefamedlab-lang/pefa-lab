import { useState } from "react";

export default function QualitativeForm({

  test,

  resultData,

  setResultData,

}) {

  const testName =

    test?.test_name ||

    "Qualitative Test";

  const [

    form,

    setForm,

  ] = useState({

    parameter: testName,

    result: "",

    interpretation: "",

    impression: "",

    remark: "",

  });

  const options = [

    "",

    "Negative",

    "Positive",

    "Non Reactive",

    "Reactive",

    "Seen",

    "Not Seen",

    "A",

    "B",

    "AB",

    "O",

    "AA",

    "AS",

    "AC",

    "SS",

    "SC",

  ];

  const updateResult = (

    value

  ) => {

    let interpretation = "";

    let impression = "";

    const result =

      value.toLowerCase();

    if (

      result.includes(

        "negative"

      ) ||

      result.includes(

        "non reactive"

      ) ||

      result ===

        "not seen"

    ) {

      interpretation =

        `${testName} is negative.`;

      impression =

        "No significant abnormality detected.";

    }

    else if (

      result.includes(

        "positive"

      ) ||

      result.includes(

        "reactive"

      ) ||

      result ===

        "seen"

    ) {

      interpretation =

        `${testName} is positive.`;

      impression =

        "Clinical correlation is advised.";

    }

    const updated = {

      ...form,

      result: value,

      interpretation,

      impression,

    };

    setForm(updated);

    setResultData(updated);

  };

  return (

    <div>

      <h3>

        {testName}

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

          <tr>

            <td>

              {testName}

            </td>

            <td>

              <select

                value={form.result}

                onChange={(e) =>

                  updateResult(

                    e.target.value

                  )

                }

              >

                {options.map(

                  (item) => (

                    <option

                      key={item}

                      value={item}

                    >

                      {item || "Select"}

                    </option>

                  )

                )}

              </select>

            </td>

          </tr>

        </tbody>

      </table>

      <h4>

        Interpretation

      </h4>

      <textarea

        readOnly

        value={

          form.interpretation

        }

      />

      <h4>

        Impression

      </h4>

      <textarea

        readOnly

        value={

          form.impression

        }

      />

      <h4>

        Scientist Remark

      </h4>

      <textarea

        value={

          form.remark

        }

        onChange={(e) => {

          const updated = {

            ...form,

            remark:

              e.target.value,

          };

          setForm(updated);

          setResultData(updated);

        }}

      />

    </div>

  );

}