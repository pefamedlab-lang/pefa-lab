export default function PrintDonorScreening({

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
     RESULT STYLE
  ====================================================== */

  const getResultClass = (value = "") => {

    const result =

      String(value)

        .toLowerCase()

        .trim();

    if (

      result.includes("positive") ||

      result.includes("reactive") ||

      result.includes("detected")

    ) {

      return "flag-high";

    }

    if (

      result.includes("negative") ||

      result.includes("non reactive") ||

      result.includes("not detected")

    ) {

      return "flag-normal";

    }

    return "result-value";

  };

  /* ======================================================
     DATA
  ====================================================== */

  const donorTests = [

    ["HIV I & II", data.hiv],

    ["HBsAg", data.hbsag],

    ["HCV", data.hcv],

    ["VDRL", data.vdrl],

    ["Malaria Parasite", data.mp],

  ];

  const donorProfile = [

    ["Blood Group", data.bloodGroup],

    ["Rhesus Factor", data.rhesus],

    ["Genotype", data.genotype],

    ["PCV", data.pcv],

    ["Weight", data.weight],

    ["Blood Pressure", data.bp],

  ];

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="donor-screening-report">

      {/* ==========================================
          INFECTIOUS DISEASE SCREENING
      ========================================== */}

      <div className="sub-test-title">

        Infectious Disease Screening

      </div>

      <table className="premium-table">

        <thead>

          <tr>

            <th>

              Test

            </th>

            <th>

              Result

            </th>

          </tr>

        </thead>

        <tbody>

          {donorTests.map(([label, value]) => (

            <tr key={label}>

              <td>

                {label}

              </td>

              <td>

                <span

                  className={getResultClass(

                    value

                  )}

                >

                  {value || "-"}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* ==========================================
          DONOR PROFILE
      ========================================== */}

      <div className="sub-test-title">

        Donor Profile

      </div>

      {renderFourColumnTable(

        donorProfile

      )}

      {/* ==========================================
          DONOR ELIGIBILITY
      ========================================== */}

      {data.eligibility && (

        <div className="report-comment">

          <h4>

            Donor Eligibility

          </h4>

          <p>

            {data.eligibility}

          </p>

        </div>

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