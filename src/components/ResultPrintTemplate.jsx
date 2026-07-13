import "../styles/printResult.css";

export default function ResultPrintTemplate({
  patientResults,

  patientInfo,
}) {
  /* =========================
     GROUP TESTS
  ========================= */

  const groupedTests = {};

  patientResults.forEach(
    (result) => {
      if (
        !groupedTests[
          result.test_name
        ]
      ) {
        groupedTests[
          result.test_name
        ] = [];
      }

      groupedTests[
        result.test_name
      ].push(result);
    }
  );

  return (
    <div className="print-container">
      {/* =========================
         HEADER
      ========================= */}

      <div className="print-header">
        <div className="print-logo-section">
          <img
            src="/logo.png"
            alt="Logo"
            className="print-logo"
          />

          <div>
            <h1>
              PEFA MEDICAL
              DIAGNOSTIC
              SERVICES
            </h1>

            <p>
              Enterprise
              Laboratory
              Information
              System
            </p>

            <span>
              Mowe,
              Ogun State,
              Nigeria
            </span>
          </div>
        </div>

        <div className="report-title">
          LABORATORY
          REPORT
        </div>
      </div>

      {/* =========================
         PATIENT INFO
      ========================= */}

      <div className="patient-info-grid">
        <div>
          <strong>
            Patient Name:
          </strong>

          <span>
            {
              patientInfo?.name
            }
          </span>
        </div>

        <div>
          <strong>
            Lab Number:
          </strong>

          <span>
            {
              patientInfo?.labNumber
            }
          </span>
        </div>

        <div>
          <strong>
            Age:
          </strong>

          <span>
            {
              patientInfo?.age
            }
          </span>
        </div>

        <div>
          <strong>
            Sex:
          </strong>

          <span>
            {
              patientInfo?.sex
            }
          </span>
        </div>

        <div>
          <strong>
            Consultant:
          </strong>

          <span>
            {
              patientInfo?.consultant
            }
          </span>
        </div>

        <div>
          <strong>
            Date:
          </strong>

          <span>
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* =========================
         RESULTS
      ========================= */}

      {Object.keys(
        groupedTests
      ).map((testName) => (
        <div
          key={testName}
          className="print-test-section"
        >
          <div className="test-heading">
            {testName}
          </div>

          <table className="print-table">
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

                <th>
                  Flag
                </th>
              </tr>
            </thead>

            <tbody>
              {groupedTests[
                testName
              ].map(
                (
                  result
                ) => (
                  <tr
                    key={
                      result.id
                    }
                  >
                    <td>
                      {
                        result.parameter_name
                      }
                    </td>

                    <td>
                      {
                        result.result_value
                      }
                    </td>

                    <td>
                      {
                        result.unit
                      }
                    </td>

                    <td>
                      {
                        result.reference_value
                      }
                    </td>

                    <td
                      className={`flag ${(
                        result.flag ||
                        ""
                      ).toLowerCase()}`}
                    >
                      {
                        result.flag
                      }
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ))}

      {/* =========================
         SIGNATURES
      ========================= */}

      <div className="signature-section">
        <div className="signature-box">
          <div className="signature-line" />

          <p>
            Medical
            Laboratory
            Scientist
          </p>
        </div>

        <div className="signature-box">
          <div className="signature-line" />

          <p>
            Authorized By
          </p>
        </div>
      </div>

      {/* =========================
         FOOTER
      ========================= */}

      <div className="print-footer">
        <p>
          This report is
          electronically
          generated by
          PEFA LIS.
        </p>

        <span>
          PEFA Medical
          Diagnostic
          Services
        </span>
      </div>
    </div>
  );
}