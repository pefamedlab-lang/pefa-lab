export default function PrintDrugScreen({

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
     DRUG PANEL
  ====================================================== */

  const drugs = [

    {
      label: "Amphetamine",
      key: "amphetamine",
    },

    {
      label: "Methamphetamine",
      key: "methamphetamine",
    },

    {
      label: "Cannabis (THC)",
      key: "thc",
    },

    {
      label: "Cocaine",
      key: "cocaine",
    },

    {
      label: "Opiates",
      key: "opiates",
    },

    {
      label: "Morphine",
      key: "morphine",
    },

    {
      label: "Tramadol",
      key: "tramadol",
    },

    {
      label: "Benzodiazepines",
      key: "benzodiazepines",
    },

    {
      label: "Barbiturates",
      key: "barbiturates",
    },

    {
      label: "Phencyclidine (PCP)",
      key: "pcp",
    },

    {
      label: "MDMA (Ecstasy)",
      key: "mdma",
    },

  ];

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
     AVAILABLE DRUGS
  ====================================================== */

  const availableDrugs = drugs.filter(

    drug =>

      data[drug.key] !== undefined

  );

  /* ======================================================
     REPORT
  ====================================================== */

  return (

    <div className="toxicology-report">

      <table className="premium-table">

        <thead>

          <tr>

            <th>

              Drug

            </th>

            <th>

              Result

            </th>

          </tr>

        </thead>

        <tbody>

          {availableDrugs.length > 0 ? (

            availableDrugs.map((drug) => (

              <tr key={drug.key}>

                <td>

                  {drug.label}

                </td>

                <td>

                  <span

                    className={getResultClass(

                      data[drug.key]

                    )}

                  >

                    {data[drug.key] || "Negative"}

                  </span>

                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td

                colSpan={2}

                style={{

                  textAlign: "center",

                  padding: "20px",

                }}

              >

                No Drug Screening Result Available

              </td>

            </tr>

          )}

        </tbody>

      </table>

      {/* ==================================================
          COMMENT
      ================================================== */}

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

      {/* ==================================================
          IMPRESSION
      ================================================== */}

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

      {/* ==================================================
          SCIENTIST REMARK
      ================================================== */}

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