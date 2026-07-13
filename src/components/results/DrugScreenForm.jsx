import { useState } from "react";

export default function DrugScreenForm({

  resultData,

  setResultData,

}) {

  const [form, setForm] = useState({

    amphetamine: "",

    methamphetamine: "",

    thc: "",

    cocaine: "",

    opiates: "",

    morphine: "",

    tramadol: "",

    benzodiazepines: "",

    barbiturates: "",

    pcp: "",

    mdma: "",

    comment: "",

    impression: "",

  });

  const options = [

    "",

    "Negative",

    "Positive",

  ];

  const updateField = (

    field,

    value

  ) => {

    const updated = {

      ...form,

      [field]: value,

    };

    const positives = Object.entries(

      updated

    )

      .filter(

        ([key, value]) =>

          value === "Positive"

      )

      .map(

        ([key]) => key
      );

    updated.impression =

      positives.length > 0

        ? `Positive for: ${positives.join(", ")}`

        : "No drug detected.";

    setForm(updated);

    setResultData(updated);

  };

  const drugs = [

    ["Amphetamine", "amphetamine"],

    ["Methamphetamine", "methamphetamine"],

    ["Cannabis (THC)", "thc"],

    ["Cocaine", "cocaine"],

    ["Opiates", "opiates"],

    ["Morphine", "morphine"],

    ["Tramadol", "tramadol"],

    ["Benzodiazepines", "benzodiazepines"],

    ["Barbiturates", "barbiturates"],

    ["PCP", "pcp"],

    ["MDMA", "mdma"],

  ];

  return (

    <div>

      <h3>

        Drug Screening Panel

      </h3>

      <table className="result-table">

        <thead>

          <tr>

            <th>

              Drug

            </th>

            <th>

              Result

            </th>

          </tr>

        </thead>

        <tbody>

          {

            drugs.map(

              ([label, key]) => (

                <tr key={key}>

                  <td>

                    {label}

                  </td>

                  <td>

                    <select

                      value={form[key]}

                      onChange={(e) =>

                        updateField(

                          key,

                          e.target.value

                        )

                      }

                    >

                      {

                        options.map(

                          (option) => (

                            <option

                              key={option}

                              value={option}

                            >

                              {

                                option ||

                                "Select"

                              }

                            </option>

                          )

                        )

                      }

                    </select>

                  </td>

                </tr>

              )

            )

          }

        </tbody>

      </table>

      <textarea

        placeholder="Comment"

        value={form.comment}

        onChange={(e) =>

          updateField(

            "comment",

            e.target.value

          )

        }

      />

      <textarea

        readOnly

        value={form.impression}

      />

    </div>

  );

}