import SensitivityPrintTable from "./SensitivityPrintTable";

export default function PrintMicrobiology({

  results = [],

}) {

  /* ======================================================
     NO RESULT
  ====================================================== */

  if (!results.length) {

    return null;

  }

  const report = results[0];

  let data = {};

  /* ======================================================
     JSON SAFETY
  ====================================================== */

  try {

    data =

      typeof report?.result === "string"

        ? JSON.parse(report.result)

        : report?.result ||

          report?.result_data ||

          {};

  }

  catch {

    data =

      report?.result_data ||

      {};

  }

  /* ======================================================
     FOUR COLUMN TABLE
  ====================================================== */

  const renderFourColumnTable = (rows = []) => {

    if (!rows.length) {

      return null;

    }

    const pairedRows = [];

    for (

      let i = 0;

      i < rows.length;

      i += 2

    ) {

      pairedRows.push([

        rows[i],

        rows[i + 1] || ["", ""],

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

                  {left?.[0] || ""}

                </td>

                <td>

                  {left?.[1] || "-"}

                </td>

                <td className="label-cell">

                  {right?.[0] || ""}

                </td>

                <td>

                  {right?.[1] || ""}

                </td>

              </tr>

            )

          )}

        </tbody>

      </table>

    );

  };

  /* ======================================================
     DATA SECTIONS
  ====================================================== */

  const macroscopyRows = [

    ["Colour", data.colour],

    ["Appearance", data.appearance],

    ["Consistency", data.consistency],

  ].filter(([, value]) => value);

  const microscopyRows = [

    ["Pus Cells", data.pusCells],

    ["Red Blood Cells", data.rbcs || data.rbc],

    ["Epithelial Cells", data.epithelialCells],

    ["Yeast Cells", data.yeastCells],

    ["Trichomonas", data.trichomonas],

    ["Casts", data.casts],

    ["Crystals", data.crystals],

    ["Bacteria", data.bacteria],

    ["Parasites", data.parasites],

    ["Others", data.others],

  ].filter(([, value]) => value);

  /* ======================================================
     SENSITIVITY RULE
  ====================================================== */

  const hideSensitivity =

    !data.sensitivity ||

    data.culture === "No Growth" ||

    data.organism === "Candida spp" ||

    data.organism === "Candida Species";

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="microbiology-report">

      {/* ==========================================
          MACROSCOPIC EXAMINATION
      ========================================== */}

      {macroscopyRows.length > 0 && (

        <>

          <div className="sub-test-title">

            Macroscopic Examination

          </div>

          {renderFourColumnTable(

            macroscopyRows

          )}

        </>

      )}

      {/* ==========================================
          MICROSCOPIC EXAMINATION
      ========================================== */}

      {microscopyRows.length > 0 && (

        <>

          <div className="sub-test-title">

            Microscopic Examination

          </div>

          {renderFourColumnTable(

            microscopyRows

          )}

        </>

      )}

      {/* ==========================================
          AFB RESULT
      ========================================== */}

      {data.afb && (

        <div className="report-comment">

          <h4>

            AFB Result

          </h4>

          <p>

            {data.afb}

          </p>

        </div>

      )}

      {/* ==========================================
          CULTURE
      ========================================== */}

      {data.culture && (

        <div className="report-comment">

          <h4>

            Culture

          </h4>

          <p>

            {data.culture}

          </p>

        </div>

      )}

      {/* ==========================================
          ISOLATED ORGANISM
      ========================================== */}

      {data.organism && (

        <div className="report-comment">

          <h4>

            Isolated Organism

          </h4>

          <p className="isolated-organism">

            {data.organism}

          </p>

        </div>

      )}

      {/* ==========================================
          ANTIMICROBIAL SENSITIVITY
      ========================================== */}

      {!hideSensitivity && (

        <SensitivityPrintTable

          data={data.sensitivity}

        />

      )}

      {/* ==========================================
          COMMENT
      ========================================== */}

      {data.comment && (

        <div className="report-comment">

          <h4>

            Comment

          </h4>

          <p>

            {data.comment}

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