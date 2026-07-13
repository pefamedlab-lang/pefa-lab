import { useEffect, useState } from "react";

export default function ChemistrySingleForm({

  test = {},

  patient = {},

  resultData,

  setResultData,

}) {

  const testName = (

    test.test_name ||

    ""

  ).toUpperCase();

  const TEST_CONFIG = {

    FBS: {

      unit: "mmol/L",

      male: "3.9 - 5.5",

      female: "3.9 - 5.5",

      child: "3.3 - 5.6",

    },

    RBS: {

      unit: "mmol/L",

      male: "4.0 - 7.8",

      female: "4.0 - 7.8",

      child: "4.0 - 7.8",

    },

    HBA1C: {

      unit: "%",

      male: "4.0 - 5.6",

      female: "4.0 - 5.6",

      child: "4.0 - 5.6",

    },

    UREA: {

      unit: "mmol/L",

      male: "2.5 - 7.1",

      female: "2.5 - 7.1",

      child: "1.8 - 6.4",

    },

    CREATININE: {

      unit: "µmol/L",

      male: "62 - 115",

      female: "53 - 97",

      child: "27 - 88",

    },

    URIC_ACID: {

      unit: "µmol/L",

      male: "210 - 420",

      female: "150 - 360",

      child: "120 - 320",

    },

    CALCIUM: {

      unit: "mmol/L",

      male: "2.10 - 2.60",

      female: "2.10 - 2.60",

      child: "2.10 - 2.70",

    },

    MAGNESIUM: {

      unit: "mmol/L",

      male: "0.70 - 1.10",

      female: "0.70 - 1.10",

      child: "0.65 - 1.05",

    },

    PHOSPHORUS: {

      unit: "mmol/L",

      male: "0.80 - 1.50",

      female: "0.80 - 1.50",

      child: "1.20 - 2.10",

    },

    PSA: {

      unit: "ng/mL",

      male: "0 - 4",

      female: "N/A",

      child: "N/A",

    },

  };

  const config =

    TEST_CONFIG[testName] ||

    {

      unit:

        test.unit || "",

      male:

        test.male_range || "",

      female:

        test.female_range || "",

      child:

        test.child_range || "",

    };

  const getReferenceRange = () => {

    const age = Number(

      patient?.age || 0

    );

    const sex = (

      patient?.sex ||

      ""

    ).toLowerCase();

    if (

      age < 18 &&

      config.child

    ) {

      return config.child;

    }

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

    setForm(

      prev => ({

        ...prev,

        parameter:

          testName,

        unit:

          config.unit,

        reference_range:

          getReferenceRange(),

      })

    );

  }, [

    testName,

    patient?.sex,

    patient?.age,

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

      range?.match(

        /\d+(\.\d+)?/g

      );

    if (

      !numbers ||

      numbers.length < 2

    ) {

      return "Normal";

    }

    const low =

      Number(numbers[0]);

    const high =

      Number(numbers[1]);

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

  const generateComment = (

    flag

  ) => {

    if (

      flag === "Low"

    ) {

      return {

        interpretation:

          `${testName} is below the reference range.`,

        impression:

          "Reduced value detected. Clinical correlation is advised.",

      };

    }

    if (

      flag === "High"

    ) {

      return {

        interpretation:

          `${testName} is above the reference range.`,

        impression:

          "Elevated value detected. Clinical correlation is advised.",

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

      generateComment(

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

        Chemistry Result Entry

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

                type="number"

                step="any"

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

              <span

                className={`flag-${

                  form.flag.toLowerCase()

                }`}

              >

                {form.flag}

              </span>

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