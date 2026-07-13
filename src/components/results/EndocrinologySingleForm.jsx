import { useState, useEffect } from "react";

export default function EndocrinologySingleForm({

  test = {},

  patient = {},

  resultData,

  setResultData,

}) {

  const testName = (

    test.test_name ||

    ""

  ).toUpperCase();

  const ENDO_TESTS = {

    TSH: {

      unit: "µIU/mL",

      male: "0.4 - 4.5",

      female: "0.4 - 4.5",

    },

    FT3: {

      unit: "pg/mL",

      male: "2.3 - 4.2",

      female: "2.3 - 4.2",

    },

    FT4: {

      unit: "ng/dL",

      male: "0.8 - 1.8",

      female: "0.8 - 1.8",

    },

    PROLACTIN: {

      unit: "ng/mL",

      male: "4 - 15",

      female: "5 - 25",

    },

    PROGESTERONE: {

      unit: "ng/mL",

      male: "<1.0",

      female: "Variable by cycle phase",

    },

    TESTOSTERONE: {

      unit: "ng/dL",

      male: "300 - 1000",

      female: "15 - 70",

    },

    FSH: {

      unit: "mIU/mL",

      male: "1.5 - 12.4",

      female: "Variable by cycle phase",

    },

    LH: {

      unit: "mIU/mL",

      male: "1.7 - 8.6",

      female: "Variable by cycle phase",

    },

    ESTRADIOL: {

      unit: "pg/mL",

      male: "10 - 40",

      female: "Variable by cycle phase",

    },

    AMH: {

      unit: "ng/mL",

      male: "N/A",

      female: "1.0 - 4.0",

    },

    "BETA HCG": {

      unit: "mIU/mL",

      male: "<5",

      female: "<5 (non-pregnant)",

    },

    CORTISOL: {

      unit: "µg/dL",

      male: "5 - 25",

      female: "5 - 25",

    },

    INSULIN: {

      unit: "µIU/mL",

      male: "2 - 25",

      female: "2 - 25",

    },

    "C-PEPTIDE": {

      unit: "ng/mL",

      male: "0.8 - 3.1",

      female: "0.8 - 3.1",

    },

    PSA: {

      unit: "ng/mL",

      male: "0 - 4",

      female: "N/A",

    },

    FERRITIN: {

      unit: "ng/mL",

      male: "30 - 400",

      female: "13 - 150",

    },

    "VITAMIN D": {

      unit: "ng/mL",

      male: "30 - 100",

      female: "30 - 100",

    },

  };

  const config =

    ENDO_TESTS[testName] ||

    {

      unit: "",

      male: "",

      female: "",

    };

  const getReferenceRange = () => {

    const sex = (

      patient?.sex ||

      ""

    ).toLowerCase();

    return sex === "female"

      ? config.female

      : config.male;

  };

  const [

    form,

    setForm,

  ] = useState({

    parameter: testName,

    result: "",

    unit: config.unit,

    reference_range:

      getReferenceRange(),

    flag: "Normal",

    interpretation: "",

    impression: "",

    remark: "",

  });

  useEffect(() => {

    setForm((prev) => ({

      ...prev,

      parameter: testName,

      unit: config.unit,

      reference_range:

        getReferenceRange(),

    }));

  }, [

    testName,

    patient?.sex,

  ]);

  const determineFlag = (

    value,

    range

  ) => {

    const numericValue =

      Number(value);

    if (

      isNaN(

        numericValue

      )

    ) {

      return "Normal";

    }

    const numbers =

      range.match(

        /\d+(\.\d+)?/g

      );

    if (

      !numbers ||

      numbers.length < 2

    ) {

      return "Normal";

    }

    const low =

      Number(

        numbers[0]

      );

    const high =

      Number(

        numbers[1]

      );

    if (

      numericValue < low

    ) {

      return "Low";

    }

    if (

      numericValue > high

    ) {

      return "High";

    }

    return "Normal";

  };

  const autoComment = (

    flag

  ) => {

    if (

      flag === "High"

    ) {

      return {

        interpretation:

          `${testName} is elevated.`,

        impression:

          "Clinical correlation is advised.",

      };

    }

    if (

      flag === "Low"

    ) {

      return {

        interpretation:

          `${testName} is reduced.`,

        impression:

          "Further evaluation may be required.",

      };

    }

    return {

      interpretation:

        `${testName} is within normal limits.`,

      impression:

        "No significant abnormality detected.",

    };

  };

  const updateResult = (

    value

  ) => {

    const flag =

      determineFlag(

        value,

        form.reference_range

      );

    const comments =

      autoComment(

        flag

      );

    const updated = {

      ...form,

      result: value,

      flag,

      interpretation:

        comments.interpretation,

      impression:

        comments.impression,

    };

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

        Endocrinology Result Entry

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

            <th>

              Unit

            </th>

            <th>

              Reference Range

            </th>

            <th>

              Flag

            </th>

          </tr>

        </thead>

        <tbody>

          <tr>

            <td>

              {form.parameter}

            </td>

            <td>

              <input

                value={

                  form.result

                }

                onChange={(e) =>

                  updateResult(

                    e.target.value

                  )

                }

              />

            </td>

            <td>

              {form.unit}

            </td>

            <td>

              {

                form.reference_range

              }

            </td>

            <td>

              {form.flag}

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

          setForm(

            updated

          );

          setResultData(

            updated

          );

        }}

      />

    </div>

  );

}