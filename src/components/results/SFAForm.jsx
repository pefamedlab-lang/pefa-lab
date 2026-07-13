import { useState } from "react";

export default function SFAForm({

  resultData,

  setResultData,

}) {

  const [

    form,

    setForm,

  ] = useState({

    colour: "",

    consistency: "",

    mucus: "",

    blood: "",

    pusCells: "",

    rbcs: "",

    ova: "",

    cysts: "",

    trophozoites: "",

    helminths: "",

    fatGlobules: "",

    reducingSubstance: "",

    occultBlood: "",

    yeastCells: "",

    parasites: "",

    others: "",

    comment: "",

    impression: "",

  });

  const updateField = (

    field,

    value

  ) => {

    const updated = {

      ...form,

      [field]: value,

    };

    const autoReport =

      generateComment(

        updated

      );

    updated.comment =

      autoReport.comment;

    updated.impression =

      autoReport.impression;

    setForm(

      updated

    );

    setResultData(

      updated

    );

  };

  const generateComment = (

    data

  ) => {

    const parasites = [];

    if (

      data.ova !== "" &&

      data.ova !== "Nil"

    ) {

      parasites.push(

        data.ova

      );

    }

    if (

      data.cysts !== "" &&

      data.cysts !== "Nil"

    ) {

      parasites.push(

        data.cysts

      );

    }

    if (

      data.trophozoites !== "" &&

      data.trophozoites !== "Nil"

    ) {

      parasites.push(

        data.trophozoites

      );

    }

    if (

      data.helminths !== "" &&

      data.helminths !== "Nil"

    ) {

      parasites.push(

        data.helminths

      );

    }

    if (

      parasites.length > 0

    ) {

      return {

        comment:

          `Parasitic elements detected: ${parasites.join(", ")}.`,

        impression:

          "Intestinal parasitic infestation present.",

      };

    }

    if (

      data.occultBlood ===

      "Positive"

    ) {

      return {

        comment:

          "Occult blood detected in stool.",

        impression:

          "Further gastrointestinal evaluation is recommended.",

      };

    }

    if (

      data.reducingSubstance ===

      "Positive"

    ) {

      return {

        comment:

          "Reducing substances detected.",

        impression:

          "Possible carbohydrate malabsorption syndrome.",

      };

    }

    return {

      comment:

        "No significant abnormality detected.",

      impression:

        "Stool analysis findings are within normal limits.",

    };

  };

  return (

    <div>

      <h3>

        Stool Analysis (SFA)

      </h3>

      {/* ======================
          MACROSCOPY
      ====================== */}

      <h4>

        Macroscopy

      </h4>

      <table className="result-table">

        <tbody>

          <tr>

            <td>

              Colour

            </td>

            <td>

              <select

                value={

                  form.colour

                }

                onChange={(e)=>

                  updateField(

                    "colour",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>

                  Brown

                </option>

                <option>

                  Yellow

                </option>

                <option>

                  Green

                </option>

                <option>

                  Black

                </option>

                <option>

                  Pale

                </option>

                <option>

                  Red

                </option>

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Consistency

            </td>

            <td>

              <select

                value={

                  form.consistency

                }

                onChange={(e)=>

                  updateField(

                    "consistency",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>

                  Formed

                </option>

                <option>

                  Semi-Formed

                </option>

                <option>

                  Loose

                </option>

                <option>

                  Watery

                </option>

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Mucus

            </td>

            <td>

              <select

                value={

                  form.mucus

                }

                onChange={(e)=>

                  updateField(

                    "mucus",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>

                  Absent

                </option>

                <option>

                  Present

                </option>

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Blood

            </td>

            <td>

              <select

                value={

                  form.blood

                }

                onChange={(e)=>

                  updateField(

                    "blood",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>

                  Absent

                </option>

                <option>

                  Present

                </option>

              </select>

            </td>

          </tr>

        </tbody>

      </table>

      {/* ======================
          MICROSCOPY
      ====================== */}

      <h4>

        Microscopy

      </h4>

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

          {[
            ["Pus Cells", "pusCells"],
            ["RBC", "rbcs"],
            ["Ova", "ova"],
            ["Cysts", "cysts"],
            ["Trophozoites", "trophozoites"],
            ["Helminths", "helminths"],
            ["Fat Globules", "fatGlobules"],
            ["Reducing Substance", "reducingSubstance"],
            ["Occult Blood", "occultBlood"],
            ["Yeast Cells", "yeastCells"],
            ["Parasites", "parasites"],

          ].map(

            ([label, key]) => (

              <tr key={key}>

                <td>

                  {label}

                </td>

                <td>

                  <input

                    value={

                      form[key]

                    }

                    onChange={(e)=>

                      updateField(

                        key,

                        e.target.value

                      )

                    }

                  />

                </td>

              </tr>

            )

          )}

        </tbody>

      </table>

      {/* ======================
          OTHERS
      ====================== */}

      <h4>

        Others

      </h4>

      <textarea

        value={

          form.others

        }

        onChange={(e)=>

          updateField(

            "others",

            e.target.value

          )

        }

      />

      {/* ======================
          COMMENT
      ====================== */}

      <h4>

        Laboratory Comment

      </h4>

      <textarea

        className="comment-box"

        value={

          form.comment

        }

        readOnly

      />

      <h4>

        Impression

      </h4>

      <textarea

        className="comment-box"

        value={

          form.impression

        }

        readOnly

      />

    </div>

  );

}