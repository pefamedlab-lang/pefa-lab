
export default function PrintMicrobiologyMCS({
  results = [],
}) {

  /* =====================================================
     NO RESULT
  ===================================================== */

  if (!results?.length) {
    return null;
  }

  const report = results[0];

  /* =====================================================
     SAFE DATA PARSER
  ===================================================== */

  let data = {};

  try {

    const raw =
      report?.result_data ??
      report?.result ??
      {};

    if (typeof raw === "string") {

      try {
        data = JSON.parse(raw);
      } catch {
        data = {};
      }

    } else {

      data = raw || {};

    }

  } catch (error) {

    console.error(
      "PrintMicrobiologyMCS data error:",
      error
    );

    data =
      report?.result_data ||
      {};

  }

  /* =====================================================
     TITLES
  ===================================================== */

  const department =
    report?.department ||
    "Microbiology";

  const testTitle =
    report?.test_name ||
    report?.test_type ||
    "Urine MCS";

  /* =====================================================
     HELPERS
  ===================================================== */

  const valueExists = (value) => {

    return (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    );

  };

  const display = (value) => {

    if (!valueExists(value)) {
      return "-";
    }

    /*
      IMPORTANT:
      Never allow an object to reach JSX directly.
    */

    if (
      typeof value === "object"
    ) {

      if (
        value.antibiotic !== undefined ||
        value.result !== undefined
      ) {

        return [
          value.antibiotic,
          value.result
        ]
          .filter(Boolean)
          .join(" — ");

      }

      return JSON.stringify(value);

    }

    return String(value);

  };

  /* =====================================================
     PREMIUM INLINE STYLES
  ===================================================== */

  const styles = {

    container: {
      width: "100%",
      boxSizing: "border-box",
      fontFamily:
        "Arial, Helvetica, sans-serif",
      fontSize: "12px",
      lineHeight: "1.4",
      color: "#222",
      background: "#fff",
    },

    department: {
      textAlign: "center",
      fontSize: "16px",
      fontWeight: "800",
      letterSpacing: "1.2px",
      textTransform: "uppercase",
      marginBottom: "3px",
    },

    testTitle: {
      textAlign: "center",
      fontSize: "13px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.7px",
      paddingBottom: "7px",
      marginBottom: "10px",
      borderBottom:
        "2px solid #222",
    },

    section: {
      marginTop: "11px",
      marginBottom: "5px",
      padding:
        "6px 9px",
      fontSize: "12px",
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      background: "#f1f3f5",
      borderLeft:
        "4px solid #222",
    },

    table: {
      width: "100%",
      borderCollapse:
        "collapse",
      tableLayout: "fixed",
      fontSize: "12px",
    },

    th: {
      border:
        "1px solid #aaa",
      padding:
        "6px 7px",
      background: "#e9ecef",
      fontWeight: "700",
      textAlign: "left",
    },

    td: {
      border:
        "1px solid #c5c5c5",
      padding:
        "6px 7px",
      verticalAlign: "top",
    },

    label: {
      width: "22%",
      fontWeight: "700",
      background: "#fafafa",
    },

    value: {
      width: "28%",
    },

    statement: {
      border:
        "1px solid #c5c5c5",
      padding:
        "7px 10px",
      marginTop: "6px",
      background: "#fff",
      pageBreakInside:
        "avoid",
    },

    statementLabel: {
      fontWeight: "800",
      marginRight: "7px",
    },

    organism: {
      border:
        "1.5px solid #333",
      padding:
        "8px 10px",
      marginTop: "7px",
      background: "#fafafa",
      pageBreakInside:
        "avoid",
    },

    organismLabel: {
      fontWeight: "800",
      marginRight: "10px",
    },

    organismValue: {
      fontWeight: "700",
    },

    sensitivityTable: {
      width: "100%",
      borderCollapse:
        "collapse",
      fontSize: "12px",
      marginTop: "4px",
    },

    sensitivityHeader: {
      border:
        "1px solid #aaa",
      padding:
        "6px 7px",
      background: "#e9ecef",
      fontWeight: "700",
    },

    sensitivityCell: {
      border:
        "1px solid #c5c5c5",
      padding:
        "6px 7px",
    },

  };

  /* =====================================================
     FOUR COLUMN TABLE
  ===================================================== */

  const renderFourColumnTable = (
    rows = []
  ) => {

    if (!rows.length) {
      return null;
    }

    const pairs = [];

    for (
      let i = 0;
      i < rows.length;
      i += 2
    ) {

      pairs.push([
        rows[i],
        rows[i + 1] || ["", ""]
      ]);

    }

    return (

      <table
        style={styles.table}
      >

        <tbody>

          {pairs.map(
            ([left, right], index) => (

              <tr key={index}>

                <td
                  style={{
                    ...styles.td,
                    ...styles.label,
                  }}
                >
                  {display(left?.[0])}
                </td>

                <td
                  style={{
                    ...styles.td,
                    ...styles.value,
                  }}
                >
                  {display(left?.[1])}
                </td>

                <td
                  style={{
                    ...styles.td,
                    ...styles.label,
                  }}
                >
                  {display(right?.[0])}
                </td>

                <td
                  style={{
                    ...styles.td,
                    ...styles.value,
                  }}
                >
                  {display(right?.[1])}
                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    );

  };

  /* =====================================================
     SPECIMEN
  ===================================================== */

  const specimenRows = [

    [
      "Specimen Type",
      data.specimenType
    ],

    [
      "Collection Date / Time",
      data.collectionDate
    ],

    [
      "Received Date / Time",
      data.receivedDate
    ],

    [
      "Processed Date / Time",
      data.processedDate
    ],

    [
      "Specimen Condition",
      data.specimenCondition
    ],

  ].filter(
    ([, value]) =>
      valueExists(value)
  );

  /* =====================================================
     MACROSCOPY
  ===================================================== */

  const macroscopyRows = [

    [
      "Colour",
      data.colour
    ],

    [
      "Appearance",
      data.appearance
    ],

    [
      "Odour",
      data.odour
    ],

    [
      "Volume",
      data.volume
    ],

  ].filter(
    ([, value]) =>
      valueExists(value)
  );

  /* =====================================================
     MICROSCOPY
  ===================================================== */

  const microscopyRows = [

    [
      "Pus Cells",
      data.pusCells
    ],

    [
      "Red Blood Cells",
      data.redBloodCells ||
      data.rbcs ||
      data.rbc
    ],

    [
      "Epithelial Cells",
      data.epithelialCells
    ],

    [
      "Casts",
      data.casts
    ],

    [
      "Crystals",
      data.crystals
    ],

    [
      "Yeast Cells",
      data.yeastCells
    ],

    [
      "Parasites",
      data.parasites
    ],

    [
      "Bacteria Seen",
      data.bacteriaSeen ||
      data.bacteria
    ],

    [
      "Others",
      data.others
    ],

  ].filter(
    ([, value]) =>
      valueExists(value)
  );

  /* =====================================================
     CULTURE
  ===================================================== */

  const cultureRows = [

    [
      "Culture Growth",
      data.cultureGrowth ||
      data.culture
    ],

    [
      "Colony Count",
      data.colonyCount
    ],

  ].filter(
    ([, value]) =>
      valueExists(value)
  );

  /* =====================================================
     ORGANISM
  ===================================================== */

  const organism =
    data.organismIsolated ||
    data.organism ||
    "";

  /* =====================================================
     ANTIBIOTICS

     MCSForm stores:

     {
       antibiotic: "...",
       result: "Sensitive"
     }

     We explicitly render each property.
  ===================================================== */

  let antibiotics = [];

  if (
    Array.isArray(
      data.antibiotics
    )
  ) {

    antibiotics =
      data.antibiotics;

  } else if (
    Array.isArray(
      data.sensitivity
    )
  ) {

    antibiotics =
      data.sensitivity;

  }

  const testedAntibiotics =
    antibiotics.filter(
      (item) => {

        if (
          !item ||
          typeof item !== "object"
        ) {
          return false;
        }

        const antibiotic =
          item.antibiotic ||
          item.customAntibiotic;

        return (
          valueExists(
            antibiotic
          ) &&
          valueExists(
            item.result
          )
        );

      }
    );

  /* =====================================================
     SENSITIVITY RESULT CLASS
  ===================================================== */

  const sensitivityStyle = (
    result
  ) => {

    const value =
      String(
        result || ""
      ).toLowerCase();

    if (
      value === "sensitive"
    ) {

      return {
        fontWeight: "700",
      };

    }

    if (
      value === "resistant"
    ) {

      return {
        fontWeight: "700",
      };

    }

    return {
      fontWeight: "600",
    };

  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div
      className="microbiology-mcs-print"
      style={styles.container}
    >

      {/* ================================================
          DEPARTMENT TITLE
      ================================================ */}

      <div
        style={
          styles.department
        }
      >
        {department}
      </div>

      {/* ================================================
          TEST TITLE
      ================================================ */}

      <div
        style={
          styles.testTitle
        }
      >
        {testTitle}
      </div>


      {/* ================================================
          SPECIMEN INFORMATION
      ================================================ */}

      {specimenRows.length > 0 && (

        <>

          <div
            style={
              styles.section
            }
          >
            Specimen Information
          </div>

          {renderFourColumnTable(
            specimenRows
          )}

        </>

      )}


      {/* ================================================
          MACROSCOPIC EXAMINATION
      ================================================ */}

      {macroscopyRows.length > 0 && (

        <>

          <div
            style={
              styles.section
            }
          >
            Macroscopic Examination
          </div>

          {renderFourColumnTable(
            macroscopyRows
          )}

        </>

      )}


      {/* ================================================
          MICROSCOPIC EXAMINATION
      ================================================ */}

      {microscopyRows.length > 0 && (

        <>

          <div
            style={
              styles.section
            }
          >
            Microscopic Examination
          </div>

          {renderFourColumnTable(
            microscopyRows
          )}

        </>

      )}


      {/* ================================================
          AFB
      ================================================ */}

      {valueExists(
        data.afb
      ) && (

        <div
          style={
            styles.statement
          }
        >

          <span
            style={
              styles.statementLabel
            }
          >
            AFB Result:
          </span>

          {display(
            data.afb
          )}

        </div>

      )}


      {/* ================================================
          CULTURE
      ================================================ */}

      {cultureRows.length > 0 && (

        <>

          <div
            style={
              styles.section
            }
          >
            Culture
          </div>

          {renderFourColumnTable(
            cultureRows
          )}

        </>

      )}


      {/* ================================================
          ISOLATED ORGANISM
      ================================================ */}

      {valueExists(
        organism
      ) && (

        <div
          style={
            styles.organism
          }
        >

          <span
            style={
              styles.organismLabel
            }
          >
            Isolated Organism
          </span>

          <span
            style={
              styles.organismValue
            }
          >
            {display(
              organism
            )}
          </span>

        </div>

      )}


      {/* ================================================
          ANTIMICROBIAL SENSITIVITY
      ================================================ */}

      {testedAntibiotics.length > 0 && (

        <>

          <div
            style={
              styles.section
            }
          >
            Antimicrobial
            Susceptibility
          </div>

          <table
            style={
              styles.sensitivityTable
            }
          >

            <thead>

              <tr>

                <th
                  style={
                    styles.sensitivityHeader
                  }
                >
                  Antibiotic
                </th>

                <th
                  style={
                    styles.sensitivityHeader
                  }
                >
                  Result
                </th>

              </tr>

            </thead>

            <tbody>

              {testedAntibiotics.map(
                (item, index) => {

                  const antibiotic =
                    item.antibiotic ===
                    "__CUSTOM__"
                      ? item.customAntibiotic
                      : item.antibiotic;

                  return (

                    <tr
                      key={`${antibiotic}-${index}`}
                    >

                      <td
                        style={
                          styles.sensitivityCell
                        }
                      >
                        {display(
                          antibiotic
                        )}
                      </td>

                      <td
                        style={{
                          ...styles.sensitivityCell,
                          ...sensitivityStyle(
                            item.result
                          ),
                        }}
                      >
                        {display(
                          item.result
                        )}
                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </>

      )}


      {/* ================================================
          COMMENT
      ================================================ */}

      {valueExists(
        data.comment
      ) && (

        <div
          style={
            styles.statement
          }
        >

          <span
            style={
              styles.statementLabel
            }
          >
            Comment:
          </span>

          {display(
            data.comment
          )}

        </div>

      )}


      {/* ================================================
          IMPRESSION
      ================================================ */}

      {valueExists(
        data.impression
      ) && (

        <div
          style={
            styles.statement
          }
        >

          <span
            style={
              styles.statementLabel
            }
          >
            Impression:
          </span>

          {display(
            data.impression
          )}

        </div>

      )}


      {/* ================================================
          SCIENTIST REMARK
      ================================================ */}

      {valueExists(
        data.scientistRemark ||
        data.remark
      ) && (

        <div
          style={
            styles.statement
          }
        >

          <span
            style={
              styles.statementLabel
            }
          >
            Scientist Remark:
          </span>

          {display(
            data.scientistRemark ||
            data.remark
          )}

        </div>

      )}

    </div>

  );

}