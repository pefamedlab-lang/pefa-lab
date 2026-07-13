export default function PrintUrinalysis({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results.length) {

    return null;

  }

  const report = results[0];

  let data =

    report.result ||

    report.result_data ||

    {};

  /* ======================================================
     JSON SAFETY
  ====================================================== */

  if (typeof data === "string") {

    try {

      data = JSON.parse(data);

    }

    catch {

      data = {};

    }

  }

  /* ======================================================
     DATA GROUPS
  ====================================================== */

  const physical = [

    ["Colour", data.colour],

    ["Appearance", data.appearance],

    ["Specific Gravity", data.specificGravity],

    ["pH", data.ph],

  ];

  const chemical = [

    ["Protein", data.protein],

    ["Glucose", data.glucose],

    ["Ketone", data.ketone],

    ["Bilirubin", data.bilirubin],

    ["Urobilinogen", data.urobilinogen],

    ["Blood", data.blood],

    ["Nitrite", data.nitrite],

    ["Leucocytes", data.leucocytes],

  ];

  const microscopy = [

    ["Pus Cells", data.pusCells],

    ["Red Blood Cells", data.rbc],

    ["Epithelial Cells", data.epithelialCells],

    ["Casts", data.casts],

    ["Crystals", data.crystals],

    ["Yeast Cells", data.yeastCells],

    ["Parasites", data.parasites],

    ["Others", data.others],

  ];

  /* ======================================================
     FOUR COLUMN TABLE
  ====================================================== */

  const renderFourColumnTable = (rows = []) => {

    const cleaned = rows.filter(

      ([, value]) =>

        value !== undefined &&

        value !== null &&

        value !== ""

    );

    if (!cleaned.length) {

      return null;

    }

    const paired = [];

    for (

      let i = 0;

      i < cleaned.length;

      i += 2

    ) {

      paired.push([

        cleaned[i],

        cleaned[i + 1] || ["", ""],

      ]);

    }

    return (

      <table className="premium-table compact-four-table">

        <tbody>

          {paired.map(([left, right], index) => (

            <tr key={index}>

              <td className="label-cell">

                {left[0]}

              </td>

              <td>

                {left[1] || "-"}

              </td>

              <td className="label-cell">

                {right[0]}

              </td>

              <td>

                {right[1] || ""}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    );

  };

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="urinalysis-report">

      {/* ==========================================
          PHYSICAL EXAMINATION
      ========================================== */}

      <div className="sub-test-title">

        Physical Examination

      </div>

      {renderFourColumnTable(

        physical

      )}

      {/* ==========================================
          CHEMICAL EXAMINATION
      ========================================== */}

      <div className="sub-test-title">

        Chemical Examination

      </div>

      {renderFourColumnTable(

        chemical

      )}

      {/* ==========================================
          MICROSCOPY
      ========================================== */}

      <div className="sub-test-title">

        Microscopy

      </div>

      {renderFourColumnTable(

        microscopy

      )}

      {/* ==========================================
          INTERPRETATION
      ========================================== */}

      {data.interpretation && (

        <div className="report-comment">

          <h4>

            Interpretation

          </h4>

          <p>

            {data.interpretation}

          </p>

        </div>

      )}

      {/* ==========================================
          SCIENTIST REMARK
      ========================================== */}

      {(data.scientistRemark || data.remark) && (

        <div className="report-comment">

          <h4>

            Scientist Remark

          </h4>

          <p>

            {

              data.scientistRemark ||

              data.remark

            }

          </p>

        </div>

      )}

    </div>

  );

}