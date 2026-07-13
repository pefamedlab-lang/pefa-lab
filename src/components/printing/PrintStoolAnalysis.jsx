import {
  getFullTestName,
} from "../../utils/fullTestName";

export default function PrintStoolAnalysis({

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
     DISPLAY NAME
  ====================================================== */

  const testName =

    getFullTestName(

      report.test_type ||

      report.test_name ||

      "Stool Analysis"

    );

  /* ======================================================
     DATA GROUPS
  ====================================================== */

  const physical = [

    ["Colour", data.colour],

    ["Consistency", data.consistency],

    ["Mucus", data.mucus],

    ["Blood", data.blood],

    ["Adult Worm", data.adultWorm],

  ];

  const microscopy = [

    ["Pus Cells", data.pusCells],

    ["Red Blood Cells", data.rbc],

    ["Yeast Cells", data.yeastCells],

    ["Fat Globules", data.fatGlobules],

    ["Starch Granules", data.starchGranules],

    ["Muscle Fibres", data.muscleFibres],

    ["Vegetable Cells", data.vegetableCells],

  ];

  const parasites = [

    ["Ova", data.ova],

    ["Cysts", data.cysts],

    ["Trophozoites", data.trophozoites],

    ["Parasites Seen", data.parasites],

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

    const pairedRows = [];

    for (

      let i = 0;

      i < cleaned.length;

      i += 2

    ) {

      pairedRows.push([

        cleaned[i],

        cleaned[i + 1] || ["", ""],

      ]);

    }

    return (

      <table className="premium-table compact-four-table">

        <tbody>

          {pairedRows.map(

            (

              [left, right],

              index

            ) => (

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

            )

          )}

        </tbody>

      </table>

    );

  };

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="stool-report">

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
          MICROSCOPY
      ========================================== */}

      <div className="sub-test-title">

        Microscopy

      </div>

      {renderFourColumnTable(

        microscopy

      )}

      {/* ==========================================
          OVA, CYSTS & PARASITES
      ========================================== */}

      <div className="sub-test-title">

        Ova, Cysts & Parasites

      </div>

      {renderFourColumnTable(

        parasites

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

      {data.remark && (

        <div className="report-comment">

          <h4>

            Scientist Remark

          </h4>

          <p>

            {data.remark}

          </p>

        </div>

      )}

    </div>

  );

}