export default function PrintMicrobiologyMCS({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results.length) {

    return null;

  }

  const report =

    results[0];

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
     DATA SECTIONS
  ====================================================== */

  const specimenInfo = [

    ["Specimen", data.specimen],

    ["Appearance", data.appearance],

    ["Collection Date", data.collectionDate],

    ["Received Date", data.receivedDate],

  ];

  const microscopy = [

    ["Pus Cells", data.pusCells],

    ["Red Blood Cells", data.rbc],

    ["Epithelial Cells", data.epithelialCells],

    ["Yeast Cells", data.yeastCells],

    ["Others", data.others],

  ];

  const culture = [

    [

      "Organism Isolated",

      data.organism ||

      data.organismIsolated ||

      "No Growth",

    ],

    [

      "Colony Count",

      data.colonyCount,

    ],

  ];

  const sensitivity =

    Array.isArray(data.sensitivity)

      ? data.sensitivity

      : [];

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="mcs-report">

      {/* ==========================================
          SPECIMEN INFORMATION
      ========================================== */}

      <div className="sub-test-title">

        Specimen Information

      </div>

      {renderFourColumnTable(

        specimenInfo

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
          CULTURE FINDINGS
      ========================================== */}

      <div className="sub-test-title">

        Culture Findings

      </div>

      {renderFourColumnTable(

        culture

      )}

      {/* ==========================================
          ANTIBIOTIC SENSITIVITY
      ========================================== */}

      {sensitivity.length > 0 && (

        <>

          <div className="sub-test-title">

            Antibiotic Sensitivity

          </div>

          <table className="premium-table">

            <thead>

              <tr>

                <th>

                  Antibiotic

                </th>

                <th>

                  Result

                </th>

              </tr>

            </thead>

            <tbody>

              {sensitivity.map(

                (item, index) => (

                  <tr key={index}>

                    <td>

                      {item.antibiotic || "-"}

                    </td>

                    <td>

                      {item.result || "-"}

                    </td>

                  </tr>

                )

              )}

            </tbody>

          </table>

        </>

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
          IMPRESSION
      ========================================== */}

      {data.impression && (

        <div className="report-comment">

          <h4>

            Impression

          </h4>

          <p>

            {data.impression}

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