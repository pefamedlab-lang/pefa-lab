import { useState, useEffect } from "react";

export default function SFAForm({

  resultData,

  setResultData,

}) {

  const [form, setForm] = useState({

    /* ==========================
       SPECIMEN INFORMATION
    ========================== */

    collectionDate: "",

    receivedDate: "",

    processedDate: "",

    abstinenceDays: "",

    collectionMethod: "",

    /* ==========================
       PHYSICAL EXAMINATION
    ========================== */

    volume: "",

    colour: "",

    appearance: "",

    ph: "",

    viscosity: "",

    liquefactionTime: "",

    /* ==========================
       SPERM ANALYSIS
    ========================== */

    spermCount: "",

    totalMotility: "",

    progressiveMotility: "",

    nonProgressiveMotility: "",

    immotile: "",

    normalMorphology: "",

    vitality: "",

    /* ==========================
       MICROSCOPY
    ========================== */

    pusCells: "",

    rbc: "",

    epithelialCells: "",

    yeastCells: "",

    others: "",

    /* ==========================
       FINAL REPORT
    ========================== */

    impression: "",

    scientistRemark: "",

  });

  /* ==========================
     LOAD EXISTING DATA
  ========================== */

  useEffect(() => {

    if (

      resultData &&

      Object.keys(resultData).length

    ) {

      setForm(prev => ({

        ...prev,

        ...resultData,

      }));

    }

  }, [resultData]);

  /* ==========================
     UPDATE FIELD
  ========================== */

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

  /* ==========================
     RENDER INPUT ROW
  ========================== */

  const renderInputRows = (

    rows

  ) => (

    rows.map(

      ([label, key]) => (

        <tr key={key}>

          <td>

            {label}

          </td>

          <td>

            <input

              type="text"

              value={

                form[key]

              }

              onChange={(e) =>

                updateField(

                  key,

                  e.target.value

                )

              }

            />

          </td>

        </tr>

      )

    )

  );

  return (

    <div className="sfa-form">

      <h3>

        Seminal Fluid Analysis (SFA)

      </h3>

      {/* ==========================
          SPECIMEN INFORMATION
      ========================== */}

      <h4>

        Specimen Information

      </h4>

      <table className="result-table">

        <tbody>

          {renderInputRows([

            [

              "Collection Date/Time",

              "collectionDate",

            ],

            [

              "Received Date/Time",

              "receivedDate",

            ],

            [

              "Processed Date/Time",

              "processedDate",

            ],

            [

              "Days of Abstinence",

              "abstinenceDays",

            ],

            [

              "Method of Collection",

              "collectionMethod",

            ],

          ])}

        </tbody>

      </table>

      {/* ==========================
          PHYSICAL EXAMINATION
      ========================== */}

      <h4>

        Physical Examination

      </h4>

      <table className="result-table">

        <tbody>

          {renderInputRows([

            [

              "Volume (mL)",

              "volume",

            ],

            [

              "Colour",

              "colour",

            ],

            [

              "Appearance",

              "appearance",

            ],

            [

              "pH",

              "ph",

            ],

            [

              "Viscosity",

              "viscosity",

            ],

            [

              "Liquefaction Time",

              "liquefactionTime",

            ],

          ])}

        </tbody>

      </table>

      {/* ==========================
          SPERM ANALYSIS
      ========================== */}

      <h4>

        Sperm Analysis

      </h4>

      <table className="result-table">

        <tbody>

          {renderInputRows([

            [

              "Sperm Count (million/mL)",

              "spermCount",

            ],

            [

              "Total Motility (%)",

              "totalMotility",

            ],

            [

              "Progressive Motility (%)",

              "progressiveMotility",

            ],

            [

              "Non-Progressive Motility (%)",

              "nonProgressiveMotility",

            ],

            [

              "Immotile (%)",

              "immotile",

            ],

            [

              "Normal Morphology (%)",

              "normalMorphology",

            ],

            [

              "Vitality (%)",

              "vitality",

            ],

          ])}

        </tbody>

      </table>

      {/* ==========================
          MICROSCOPY
      ========================== */}

      <h4>

        Microscopy

      </h4>

      <table className="result-table">

        <tbody>

          {renderInputRows([

            [

              "Pus Cells",

              "pusCells",

            ],

            [

              "Red Blood Cells",

              "rbc",

            ],

            [

              "Epithelial Cells",

              "epithelialCells",

            ],

            [

              "Yeast Cells",

              "yeastCells",

            ],

            [

              "Others",

              "others",

            ],

          ])}

        </tbody>

      </table>

      {/* ==========================
          IMPRESSION
      ========================== */}

      <h4>

        Impression

      </h4>

      <textarea

        className="comment-box"

        rows={4}

        placeholder="Example: Normozoospermia"

        value={

          form.impression

        }

        onChange={(e) =>

          updateField(

            "impression",

            e.target.value

          )

        }

      />

      {/* ==========================
          SCIENTIST REMARK
      ========================== */}

      <h4>

        Scientist Remark

      </h4>

      <textarea

        className="comment-box"

        rows={4}

        placeholder="Additional laboratory remarks..."

        value={

          form.scientistRemark

        }

        onChange={(e) =>

          updateField(

            "scientistRemark",

            e.target.value

          )

        }

      />

    </div>

  );

}