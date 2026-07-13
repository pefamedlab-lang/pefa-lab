export default function PrintSFA({

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
     SPECIMEN INFORMATION
  ====================================================== */

  const specimenInfo = [

    ["Collection Date/Time", data.collectionDate],

    ["Received Date/Time", data.receivedDate],

    ["Processed Date/Time", data.processedDate],

    ["Days of Abstinence", data.abstinenceDays],

    ["Collection Method", data.collectionMethod],

  ];

  /* ======================================================
     PHYSICAL EXAMINATION
  ====================================================== */

  const physical = [

    ["Volume (mL)", data.volume],

    ["Colour", data.colour],

    ["Appearance", data.appearance],

    ["pH", data.ph],

    ["Viscosity", data.viscosity],

    ["Liquefaction Time", data.liquefactionTime],

  ];

  /* ======================================================
     SPERM ANALYSIS
  ====================================================== */

  const spermAnalysis = [

    ["Sperm Count", data.spermCount],

    ["Total Motility", data.totalMotility],

    ["Progressive Motility", data.progressiveMotility],

    ["Non-Progressive Motility", data.nonProgressiveMotility],

    ["Immotile", data.immotile],

    ["Normal Morphology", data.normalMorphology],

    ["Vitality", data.vitality],

  ];

  /* ======================================================
     MICROSCOPY
  ====================================================== */

  const microscopy = [

    ["Pus Cells", data.pusCells],

    ["Red Blood Cells", data.rbc],

    ["Epithelial Cells", data.epithelialCells],

    ["Yeast Cells", data.yeastCells],

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

    <div className="sfa-report">

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
          PHYSICAL EXAMINATION
      ========================================== */}

      <div className="sub-test-title">

        Physical Examination

      </div>

      {renderFourColumnTable(

        physical

      )}

      {/* ==========================================
          SPERM ANALYSIS
      ========================================== */}

      <div className="sub-test-title">

        Sperm Analysis

      </div>

      {renderFourColumnTable(

        spermAnalysis

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