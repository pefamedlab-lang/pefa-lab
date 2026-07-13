export default function ReportFormatter({
  testType,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius:
          "15px",
        marginTop: "30px",
      }}
    >
      <h2>
        Smart Report
        Formatter
      </h2>

      {/* QUALITATIVE */}

      {testType ===
        "Qualitative" && (
        <div
          style={{
            marginTop:
              "25px",
          }}
        >
          <h3>
            Qualitative
            Report
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
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
              <tr>
                <td>
                  HBsAg
                </td>

                <td>
                  Negative
                </td>
              </tr>

              <tr>
                <td>HCV</td>

                <td>
                  Non-Reactive
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* QUANTITATIVE */}

      {testType ===
        "Quantitative" && (
        <div
          style={{
            marginTop:
              "25px",
          }}
        >
          <h3>
            Quantitative
            Report
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr>
                <th>
                  Test
                </th>

                <th>
                  Result
                </th>

                <th>
                  Unit
                </th>

                <th>
                  Reference
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  HbA1c
                </td>

                <td>5.6</td>

                <td>%</td>

                <td>4–6</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* PROFILE */}

      {testType ===
        "Profile" && (
        <div
          style={{
            marginTop:
              "25px",
          }}
        >
          <h3>
            Full Blood Count
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr>
                <th>
                  Parameter
                </th>

                <th>
                  Result
                </th>

                <th>
                  Unit
                </th>

                <th>
                  Reference
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>WBC</td>

                <td>5.4</td>

                <td>
                  x10⁹/L
                </td>

                <td>4–11</td>
              </tr>

              <tr>
                <td>Hb</td>

                <td>13.2</td>

                <td>g/dL</td>

                <td>12–16</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* MICROBIOLOGY */}

      {testType ===
        "Microbiology" && (
        <div
          style={{
            marginTop:
              "25px",
          }}
        >
          <h3>
            Microbiology
            Report
          </h3>

          <p>
            <strong>
              Organism:
            </strong>{" "}
            Escherichia coli
          </p>

          <p>
            <strong>
              Colony Count:
            </strong>{" "}
            Significant Growth
          </p>

          <h4>
            Antibiotic
            Sensitivity
          </h4>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
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
              <tr>
                <td>
                  Ciprofloxacin
                </td>

                <td>
                  Sensitive
                </td>
              </tr>

              <tr>
                <td>
                  Ceftriaxone
                </td>

                <td>
                  Resistant
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}