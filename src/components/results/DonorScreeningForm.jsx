// src/components/results/DonorScreeningForm.jsx

import { useState } from "react";

export default function DonorScreeningForm({

  resultData,

  setResultData,

}) {

  const [

    form,

    setForm,

  ] = useState({

    hiv: "",

    hbsag: "",

    hcv: "",

    vdrl: "",

    malaria: "",

    bloodGroup: "",

    genotype: "",

    comment: "",

  });

  const options = [

    "",

    "Negative",

    "Positive",

    "Non Reactive",

    "Reactive",

  ];

  const updateField = (

    field,

    value

  ) => {

    const updated = {

      ...form,

      [field]: value,

    };

    setForm(updated);

    setResultData(updated);

  };

  return (

    <div>

      <h3>

        Donor Screening Panel

      </h3>

      <table className="result-table">

        <thead>

          <tr>

            <th>

              Test

            </th>

            <th>

              Result

            </th>

          </tr>

        </thead>

        <tbody>

          {[
            ["HIV I & II", "hiv"],
            ["HBsAg", "hbsag"],
            ["HCV", "hcv"],
            ["VDRL", "vdrl"],
            ["Malaria Parasite", "malaria"],

          ].map(

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

                    {options.map(

                      item => (

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

            )

          )}

          <tr>

            <td>

              Blood Group

            </td>

            <td>

              <select

                value={

                  form.bloodGroup

                }

                onChange={(e)=>

                  updateField(

                    "bloodGroup",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>A</option>

                <option>B</option>

                <option>AB</option>

                <option>O</option>

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Genotype

            </td>

            <td>

              <select

                value={

                  form.genotype

                }

                onChange={(e)=>

                  updateField(

                    "genotype",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>AA</option>

                <option>AS</option>

                <option>AC</option>

                <option>SS</option>

                <option>SC</option>

              </select>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  );

}