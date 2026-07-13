import { useState } from "react";

export default function UrinalysisForm({

  resultData,

  setResultData,

}) {

  const [

    form,

    setForm,

  ] = useState({

    /* PHYSICAL */

    colour: "",

    appearance: "",

    specificGravity: "",

    ph: "",

    /* CHEMICAL */

    protein: "",

    glucose: "",

    ketone: "",

    bilirubin: "",

    leucocyte: "",

    nitrite: "",

    blood: "",

    urobilinogen: "",

    /* MICROSCOPY */

    pusCells: "",

    rbc: "",

    epithelialCells: "",

    casts: "",

    crystals: "",

    yeastCells: "",

    bacteria: "",

    parasites: "",

    /* AUTO COMMENT */

    comment: "",

    impression: "",

  });

  const chemistryOptions = [

    "",

    "Negative",

    "Trace",

    "+",

    "++",

    "+++",

    "++++",

  ];

  const generateComment = (

    data

  ) => {

    if (

      data.protein === "Negative" &&

      data.glucose === "Negative" &&

      data.pusCells === "Nil" &&

      data.rbc === "Nil" &&

      data.bacteria === "Nil" &&

      (

        data.leucocyte ===

        "Negative" ||

        data.leucocyte === ""

      )

    ) {

      return {

        comment:

          "Urinalysis findings are within normal limits.",

        impression:

          "No significant abnormality detected.",

      };

    }

    if (

      data.pusCells === "Numerous" ||

      data.bacteria === "Numerous" ||

      [

        "+",

        "++",

        "+++",

        "++++",

      ].includes(

        data.leucocyte

      )

    ) {

      return {

        comment:

          "Findings suggest urinary tract infection.",

        impression:

          "Probable urinary tract infection. Clinical correlation is advised.",

      };

    }

    if (

      [

        "+",

        "++",

        "+++",

        "++++",

      ].includes(

        data.glucose

      )

    ) {

      return {

        comment:

          "Glycosuria detected.",

        impression:

          "Recommend fasting blood glucose evaluation.",

      };

    }

    if (

      [

        "+",

        "++",

        "+++",

        "++++",

      ].includes(

        data.protein

      )

    ) {

      return {

        comment:

          "Proteinuria detected.",

        impression:

          "Renal assessment is recommended.",

      };

    }

    if (

      data.blood &&

      data.blood !== "Negative"

    ) {

      return {

        comment:

          "Blood detected in urine.",

          impression:

          "Haematuria present. Clinical correlation advised.",

      };

    }

    return {

      comment: "",

      impression: "",

    };

  };

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

  return (

    <div>

      <h3>

        Urinalysis Report

      </h3>

      {/* =========================
          PHYSICAL EXAMINATION
      ========================= */}

      <h4>

        Physical Examination

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

                  Select Colour

                </option>

                <option>

                  Pale Yellow

                </option>

                <option>

                  Straw

                </option>

                <option>

                  Yellow

                </option>

                <option>

                  Deep Yellow

                </option>

                <option>

                  Amber

                </option>

                <option>

                  Orange

                </option>

                <option>

                  Red

                </option>

                <option>

                  Brown

                </option>

                <option>

                  Green

                </option>

                <option>

                  Black

                </option>

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Appearance

            </td>

            <td>

              <select

                value={

                  form.appearance

                }

                onChange={(e)=>

                  updateField(

                    "appearance",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select Appearance

                </option>

                <option>

                  Clear

                </option>

                <option>

                  Slightly Hazy

                </option>

                <option>

                  Hazy

                </option>

                <option>

                  Cloudy

                </option>

                <option>

                  Turbid

                </option>

                <option>

                  Milky

                </option>

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Specific Gravity

            </td>

            <td>

              <input

                value={

                  form.specificGravity

                }

                onChange={(e)=>

                  updateField(

                    "specificGravity",

                    e.target.value

                  )

                }

                placeholder="1.015"

              />

            </td>

          </tr>

          <tr>

            <td>

              pH

            </td>

            <td>

              <input

                value={

                  form.ph

                }

                onChange={(e)=>

                  updateField(

                    "ph",

                    e.target.value

                  )

                }

                placeholder="6.0"

              />

            </td>

          </tr>

        </tbody>

      </table>

      {/* =========================
          CHEMICAL EXAMINATION
      ========================= */}

      <h4>

        Chemical Examination

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
            ["Protein", "protein"],
            ["Glucose", "glucose"],
            ["Ketone", "ketone"],
            ["Bilirubin", "bilirubin"],
            ["Leucocyte Esterase", "leucocyte"],
            ["Blood", "blood"],

          ].map(([label, key]) => (

            <tr key={key}>

              <td>

                {label}

              </td>

              <td>

                <select

                  value={

                    form[key]

                  }

                  onChange={(e)=>

                    updateField(

                      key,

                      e.target.value

                    )

                  }

                >

                  {chemistryOptions.map(

                    item => (

                      <option

                        key={item}

                        value={item}

                      >

                        {

                          item ||

                          "Select"

                        }

                      </option>

                    )

                  )}

                </select>

              </td>

            </tr>

          ))}

          <tr>

            <td>

              Nitrite

            </td>

            <td>

              <select

                value={

                  form.nitrite

                }

                onChange={(e)=>

                  updateField(

                    "nitrite",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>

                  Negative

                </option>

                <option>

                  Positive

                </option>

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Urobilinogen

            </td>

            <td>

              <select

                value={

                  form.urobilinogen

                }

                onChange={(e)=>

                  updateField(

                    "urobilinogen",

                    e.target.value

                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>

                  Normal

                </option>

                <option>

                  Increased

                </option>

                <option>

                  Markedly Increased

                </option>

              </select>

            </td>

          </tr>

        </tbody>

      </table>

      {/* =========================
          MICROSCOPY
      ========================= */}

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
            [

              "Pus Cells",

              "pusCells",

              [

                "Nil",

                "0–2 /HPF",

                "3–5 /HPF",

                "6–10 /HPF",

                "11–20 /HPF",

                "Numerous",

              ],

            ],

            [

              "RBC",

              "rbc",

              [

                "Nil",

                "0–2 /HPF",

                "3–5 /HPF",

                "6–10 /HPF",

                "Numerous",

              ],

            ],

            [

              "Epithelial Cells",

              "epithelialCells",

              [

                "Nil",

                "Few",

                "Moderate",

                "Numerous",

              ],

            ],

            [

              "Casts",

              "casts",

              [

                "Nil",

                "Hyaline Casts Present",

                "Granular Casts Present",

                "Few Casts Seen",

              ],

            ],

            [

              "Crystals",

              "crystals",

              [

                "Nil",

                "Calcium Oxalate",

                "Uric Acid",

                "Triple Phosphate",

                "Amorphous Urates",

              ],

            ],

            [

              "Yeast Cells",

              "yeastCells",

              [

                "Nil",

                "Few",

                "Moderate",

                "Numerous",

              ],

            ],

            [

              "Bacteria",

              "bacteria",

              [

                "Nil",

                "Few",

                "Moderate",

                "Numerous",

              ],

            ],

            [

              "Parasites",

              "parasites",

              [

                "Nil",

                "Schistosoma haematobium Seen",

                "Trichomonas vaginalis Seen",

              ],

            ],

          ].map(

            ([label, key, options]) => (

              <tr key={key}>

                <td>

                  {label}

                </td>

                <td>

                  <select

                    value={

                      form[key]

                    }

                    onChange={(e)=>

                      updateField(

                        key,

                        e.target.value

                      )

                    }

                  >

                    <option value="">

                      Select

                    </option>

                    {options.map(

                      item => (

                        <option

                          key={item}

                        >

                          {item}

                        </option>

                      )

                    )}

                  </select>

                </td>

              </tr>

            )

          )}

        </tbody>

      </table>

      {/* =========================
          COMMENT
      ========================= */}

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