import { useEffect, useState } from "react";

export default function ChemistryPanelForm({

  test = {},

  patient = {},

  resultData,

  setResultData,

}) {

  const panelType = (

    test.template_type ||

    ""

  ).toLowerCase();

  const PANELS = {

  /* =========================
     LFT
  ========================= */

  liver_function_test: [

    ["AST", "U/L", "0 - 40"],
    ["ALT", "U/L", "0 - 41"],
    ["ALP", "U/L", "40 - 129"],
    ["Total Protein", "g/L", "60 - 80"],
    ["Albumin", "g/L", "35 - 50"],
    ["Total Bilirubin", "µmol/L", "3 - 21"],
    ["Direct Bilirubin", "µmol/L", "0 - 7"],
    ["GGT", "U/L", "10 - 71"],

  ],

  lft: [

    ["AST", "U/L", "0 - 40"],
    ["ALT", "U/L", "0 - 41"],
    ["ALP", "U/L", "40 - 129"],
    ["Total Protein", "g/L", "60 - 80"],
    ["Albumin", "g/L", "35 - 50"],
    ["Total Bilirubin", "µmol/L", "3 - 21"],
    ["Direct Bilirubin", "µmol/L", "0 - 7"],
    ["GGT", "U/L", "10 - 71"],

  ],

  /* =========================
     KFT
  ========================= */

  kidney_function_test: [

    ["Urea", "mmol/L", "2.5 - 7.1"],
    ["Creatinine", "µmol/L", "62 - 115"],
    ["Sodium", "mmol/L", "135 - 145"],
    ["Potassium", "mmol/L", "3.5 - 5.1"],
    ["Chloride", "mmol/L", "98 - 107"],
    ["Bicarbonate", "mmol/L", "22 - 29"],

  ],

  kft: [

    ["Urea", "mmol/L", "2.5 - 7.1"],
    ["Creatinine", "µmol/L", "62 - 115"],
    ["Sodium", "mmol/L", "135 - 145"],
    ["Potassium", "mmol/L", "3.5 - 5.1"],
    ["Chloride", "mmol/L", "98 - 107"],
    ["Bicarbonate", "mmol/L", "22 - 29"],

  ],

  /* =========================
     LIPID PROFILE
  ========================= */

  lipid_profile: [

    ["Total Cholesterol", "mmol/L", "<5.2"],
    ["HDL Cholesterol", "mmol/L", ">1.0"],
    ["LDL Cholesterol", "mmol/L", "<3.4"],
    ["Triglyceride", "mmol/L", "<1.7"],
    ["VLDL", "mmol/L", "Calculated"],

  ],

  /* =========================
     HORMONES
  ========================= */

  hormonal_profile: [

    ["FSH", "mIU/mL", "Variable"],
    ["LH", "mIU/mL", "Variable"],
    ["Prolactin", "ng/mL", "Variable"],
    ["Progesterone", "ng/mL", "Variable"],
    ["Estradiol", "pg/mL", "Variable"],
    ["Testosterone", "ng/dL", "Variable"],

  ],

  /* =========================
     TFT
  ========================= */

  free_tft: [

    ["TSH", "µIU/mL", "0.4 - 4.5"],
    ["FT3", "pg/mL", "2.3 - 4.2"],
    ["FT4", "ng/dL", "0.8 - 1.8"],

  ],

  total_tft: [

    ["TSH", "µIU/mL", "0.4 - 4.5"],
    ["T3", "ng/mL", "0.8 - 2.0"],
    ["T4", "µg/dL", "4.5 - 12.5"],

  ],

};

  const parameters =

    PANELS[panelType] ||

    [];

  const [

    results,

    setResults,

  ] = useState({});

  useEffect(() => {

    setResultData(results);

  }, [

    results,

    setResultData,

  ]);

  const determineFlag = (

    value,

    range

  ) => {

    if (

      !range ||

      range.includes("<") ||

      range.includes(">") ||

      range === "Variable" ||

      range === "Calculated"

    ) {

      return "Normal";

    }

    const number =

      Number(value);

    if (

      isNaN(number)

    ) {

      return "Normal";

    }

    const values =

      range.match(

        /\d+(\.\d+)?/g

      );

    if (

      !values ||

      values.length < 2

    ) {

      return "Normal";

    }

    const low =

      Number(values[0]);

    const high =

      Number(values[1]);

    if (

      number < low

    ) {

      return "Low";

    }

    if (

      number > high

    ) {

      return "High";

    }

    return "Normal";

  };

  const updateResult = (

    parameter,

    value,

    unit,

    referenceRange

  ) => {

    let updated = {

      ...results,

      [parameter]: {

        result: value,

        unit,

        reference_range:

          referenceRange,

        flag:

          determineFlag(

            value,

            referenceRange

          ),

      },

    };

    /* ======================
       AUTO VLDL
    ====================== */

    if (

      panelType ===

      "lipid_profile"

    ) {

      const tg = Number(

        updated

          .Triglyceride

          ?.result || 0

      );

      if (tg > 0) {

        updated.VLDL = {

          result:

            (

              tg / 2.2

            ).toFixed(2),

          unit:

            "mmol/L",

          reference_range:

            "Calculated",

          flag:

            "Normal",

        };

      }

    }

    /* ======================
       AUTO GLOBULIN + A/G
    ====================== */

    if (

      panelType ===

      "liver_function_test"

    ) {

      const tp = Number(

        updated

          ["Total Protein"]

          ?.result || 0

      );

      const alb = Number(

        updated

          .Albumin

          ?.result || 0

      );

      if (

        tp > 0 &&

        alb > 0

      ) {

        const glob =

          tp - alb;

        updated

          .Globulin = {

          result:

            glob.toFixed(1),

          unit:

            "g/L",

          reference_range:

            "20 - 35",

          flag:

            determineFlag(

              glob,

              "20 - 35"

            ),

        };

        updated

          ["A/G Ratio"] = {

          result:

            (

              alb / glob

            ).toFixed(2),

          unit: "",

          reference_range:

            "1.0 - 2.2",

          flag:

            determineFlag(

              alb / glob,

              "1.0 - 2.2"

            ),

        };

      }

    }

    setResults(updated);

    setResultData(updated);

  };

  return (

    <div>

      <h3>

        {test.test_name}

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

          {parameters.map(

            ([

              parameter,

              unit,

              range,

            ]) => (

              <tr

                key={parameter}

              >

                <td>

                  {parameter}

                </td>

                <td>

                  <input

                    type="number"

                    step="any"

                    value={

                      results[
                        parameter
                      ]?.result ||

                      ""

                    }

                    disabled={

                      range ===

                      "Calculated"

                    }

                    onChange={(e) =>

                      updateResult(

                        parameter,

                        e.target.value,

                        unit,

                        range

                      )

                    }

                  />

                </td>

                <td>

                  {unit}

                </td>

                <td>

                  {range}

                </td>

                <td>

                  {

                    results[
                      parameter
                    ]?.flag ||

                    "Normal"

                  }

                </td>

              </tr>

            )

          )}

        </tbody>
      </table>

      {/* AUTO-CALCULATED PARAMETERS */}

      {Object.keys(results).some(

        item =>

          item ===

            "Globulin" ||

          item ===

            "A/G Ratio"

      ) && (

        <>

          <h4>

            Calculated Parameters

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

              {["Globulin", "A/G Ratio"]

                .filter(

                  item =>

                    results[item]

                )

                .map(

                  item => (

                    <tr

                      key={item}

                    >

                      <td>

                        {item}

                      </td>

                      <td>

                        {

                          results[
                            item
                          ]?.result

                        }

                      </td>

                      <td>

                        {

                          results[
                            item
                          ]?.unit

                        }

                      </td>

                      <td>

                        {

                          results[
                            item
                          ]

                          ?.reference_range

                        }

                      </td>

                      <td>

                        {

                          results[
                            item
                          ]?.flag

                        }

                      </td>

                    </tr>

                  )

                )}

            </tbody>

          </table>

        </>

      )}

    </div>

  );

}