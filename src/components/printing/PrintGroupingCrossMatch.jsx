export default function PrintGroupingCrossMatch({

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
     FOUR COLUMN TABLE
  ====================================================== */

  const renderFourColumnTable = (rows = []) => {

    const filtered = rows.filter(

      ([, value]) =>

        value !== undefined &&

        value !== null &&

        value !== ""

    );

    if (!filtered.length) {

      return null;

    }

    const pairedRows = [];

    for (

      let i = 0;

      i < filtered.length;

      i += 2

    ) {

      pairedRows.push([

        filtered[i],

        filtered[i + 1] || ["", ""],

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
     DATA
  ====================================================== */

  const grouping = [

    [

      "Blood Group",

      data.bloodGroup,

    ],

    [

      "Rhesus Factor",

      data.rhesus,

    ],

    [

      "Genotype",

      data.genotype,

    ],

  ];

  const crossMatch = [

    [

      "Cross Match Status",

      data.crossMatch,

    ],

    [

      "Compatibility",

      data.compatibility,

    ],

    [

      "Blood Unit Number",

      data.unitNumber,

    ],

    [

      "Blood Type Issued",

      data.bloodType,

    ],

  ];

  const donorInfo = [

    [

      "Donor Name",

      data.donorName,

    ],

    [

      "Donor ID",

      data.donorId,

    ],

    [

      "Collection Date",

      data.collectionDate,

    ],

    [

      "Expiry Date",

      data.expiryDate,

    ],

  ];

  const hasDonorInfo = donorInfo.some(

    ([, value]) => value

  );

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="crossmatch-report">

      {/* ==========================================
          BLOOD GROUPING
      ========================================== */}

      <div className="sub-test-title">

        Blood Grouping

      </div>

      {renderFourColumnTable(

        grouping

      )}

      {/* ==========================================
          CROSS MATCH RESULT
      ========================================== */}

      <div className="sub-test-title">

        Cross Match Result

      </div>

      {renderFourColumnTable(

        crossMatch

      )}

      {/* ==========================================
          DONOR INFORMATION
      ========================================== */}

      {hasDonorInfo && (

        <>

          <div className="sub-test-title">

            Donor Information

          </div>

          {renderFourColumnTable(

            donorInfo

          )}

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