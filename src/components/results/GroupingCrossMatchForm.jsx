import { useState } from "react";

export default function GroupingCrossMatchForm({

  resultData,

  setResultData,

}) {

  const [form, setForm] = useState({

    recipientGroup: "",

    recipientRh: "",

    donorGroup: "",

    donorRh: "",

    unitNumber: "",

    donorHb: "",

    crossMatch: "",

    screeningStatus: "",

    interpretation: "",

    remark: "",

    impression: "",

  });

  const bloodGroups = [

    "",

    "A",

    "B",

    "AB",

    "O",

  ];

  const rhOptions = [

    "",

    "Positive",

    "Negative",

  ];

  const crossOptions = [

    "",

    "Compatible",

    "Incompatible",

  ];

  const updateField = (

    field,

    value

  ) => {

    const updated = {

      ...form,

      [field]: value,

    };

    /* AUTO INTERPRETATION */

    if (

      field === "crossMatch"

    ) {

      if (

        value ===

        "Compatible"

      ) {

        updated.interpretation =

          "Compatible blood unit for transfusion.";

        updated.impression =

          "Suitable donor blood available.";

      }

      else if (

        value ===

        "Incompatible"

      ) {

        updated.interpretation =

          "Cross match incompatible.";

        updated.impression =

          "Alternative donor unit required.";

      }

    }

    setForm(updated);

    setResultData(updated);

  };

  return (

    <div>

      <h3>

        Grouping & Cross Matching

      </h3>

      <table className="result-table">

        <tbody>

          <tr>

            <td>

              Recipient Group

            </td>

            <td>

              <select

                value={

                  form.recipientGroup

                }

                onChange={(e) =>

                  updateField(

                    "recipientGroup",

                    e.target.value

                  )

                }

              >

                {

                  bloodGroups.map(

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

                  )

                }

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Recipient Rh

            </td>

            <td>

              <select

                value={

                  form.recipientRh

                }

                onChange={(e) =>

                  updateField(

                    "recipientRh",

                    e.target.value

                  )

                }

              >

                {

                  rhOptions.map(

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

                  )

                }

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Donor Group

            </td>

            <td>

              <select

                value={

                  form.donorGroup

                }

                onChange={(e) =>

                  updateField(

                    "donorGroup",

                    e.target.value

                  )

                }

              >

                {

                  bloodGroups.map(

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

                  )

                }

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Donor Rh

            </td>

            <td>

              <select

                value={

                  form.donorRh

                }

                onChange={(e) =>

                  updateField(

                    "donorRh",

                    e.target.value

                  )

                }

              >

                {

                  rhOptions.map(

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

                  )

                }

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Unit Number

            </td>

            <td>

              <input

                value={

                  form.unitNumber

                }

                onChange={(e) =>

                  updateField(

                    "unitNumber",

                    e.target.value

                  )

                }

              />

            </td>

          </tr>

          <tr>

            <td>

              Donor Hb

            </td>

            <td>

              <input

                value={

                  form.donorHb

                }

                onChange={(e) =>

                  updateField(

                    "donorHb",

                    e.target.value

                  )

                }

                placeholder="14.5 g/dL"

              />

            </td>

          </tr>

          <tr>

            <td>

              Cross Match

            </td>

            <td>

              <select

                value={

                  form.crossMatch

                }

                onChange={(e) =>

                  updateField(

                    "crossMatch",

                    e.target.value

                  )

                }

              >

                {

                  crossOptions.map(

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

                  )

                }

              </select>

            </td>

          </tr>

          <tr>

            <td>

              Screening Status

            </td>

            <td>

              <input

                value={

                  form.screeningStatus

                }

                onChange={(e) =>

                  updateField(

                    "screeningStatus",

                    e.target.value

                  )

                }

                placeholder="All mandatory tests negative"

              />

            </td>

          </tr>

        </tbody>

      </table>

      <textarea

        readOnly

        value={

          form.interpretation

        }

        placeholder="Interpretation"

      />

      <textarea

        value={

          form.remark

        }

        onChange={(e) =>

          updateField(

            "remark",

            e.target.value

          )

        }

        placeholder="Scientist Remark"

      />

      <textarea

        readOnly

        value={

          form.impression

        }

        placeholder="Impression"

      />

    </div>

  );

}