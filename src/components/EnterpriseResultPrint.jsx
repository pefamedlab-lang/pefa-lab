import "../styles/enterpriseResultPrint.css";

import logo from "../assets/logo.png";

export default function EnterpriseResultPrint({

  patient,

  results,

  allTests = [],

  comment,

  releaseStatus,

  enteredBy,

  validatedBy,
}) {

  /* =====================================================
     DATE
  ===================================================== */

  const today =
    new Date().toLocaleDateString();

  /* =====================================================
     REFERENCE
  ===================================================== */

  const getReference =
    (master) => {

      if (!master)
        return "-";

      if (
        patient.sex ===
        "Male"
      ) {

        return (
          master.male_range ||
          "-"
        );
      }

      return (
        master.female_range ||
        "-"
      );
    };

  /* =====================================================
     REPORT TITLE
  ===================================================== */

  const reportTitle =
    patient?.tests?.[0]
      ?.panel_name ||

    patient?.tests?.[0]
      ?.test_name ||

    "LABORATORY REPORT";

  return (

    <div className="enterprise-print-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="enterprise-print-header">

        {/* LOGO */}

        <div className="enterprise-logo-box">

          <img
            src={logo}
            alt="PEFA Logo"
            className="enterprise-logo"
          />

        </div>

        {/* CENTER */}

        <div className="enterprise-center">

          <h1>
            PEFA MEDICAL DIAGNOSTIC SERVICES
          </h1>

          {/* ADDRESS */}

          <p className="branch-line">

            <strong>
              Head Office:
            </strong>

            {" "}
            32, Ogunru-ori,
            Pakuro Road,
            Mowe,
            Ogun State.

          </p>

          <p className="branch-line">

            <strong>
              Mowe Branch:
            </strong>

            {" "}
            5, Olorombo Street,
            Imedu-Nla,
            Mowe,
            Ogun State.

          </p>

          <p className="branch-line">

            <strong>
              Orimerunmu Branch:
            </strong>

            {" "}
            Iya-Ijebu Bus Stop,
            Vital Foam,
            Orimerunmu,
            Ogun State.

          </p>

          {/* CONTACT */}

          <div className="enterprise-contact">

            <span>
              Email:
              pefa.medlab@gmail.com
            </span>

            <span>
              Website:
              pefamedlab.com
            </span>

            <span>
              Phone:
              08086618221 /
              08088336440
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          PATIENT INFORMATION
      ===================================================== */}

      <div className="enterprise-patient-info">

        {/* ROW 1 */}

        <div className="patient-row">

          <span>

            <strong>
              Surname First Name:
            </strong>

            {" "}
            {
              patient.full_name
            }

          </span>

          <span>

            <strong>
              Lab ID:
            </strong>

            {" "}
            {
              patient.lab_number
            }

          </span>

        </div>

        {/* ROW 2 */}

        <div className="patient-row">

          <span>

            <strong>
              Sex:
            </strong>

            {" "}
            {
              patient.sex
            }

          </span>

          <span>

            <strong>
              Age:
            </strong>

            {" "}
            {
              patient.age
            }

          </span>

        </div>

        {/* ROW 3 */}

        <div className="patient-row">

          <span>

            <strong>
              Department/Hospital:
            </strong>

            {" "}
            {
              patient.referral_hospital ||
              "PRIVATE"
            }

          </span>

          <span>

            <strong>
              Physician:
            </strong>

            {" "}
            {
              patient.referral_doctor ||
              "PRIVATE"
            }

          </span>

        </div>

        {/* ROW 4 */}

        <div className="patient-row">

          <span>

            <strong>
              Branch:
            </strong>

            {" "}
            {
              patient.branch ||
              "-"
            }

          </span>

          <span>

            <strong>
              Reported Date:
            </strong>

            {" "}
            {
              today
            }

          </span>

        </div>

        {/* ROW 5 */}

        <div className="patient-row">

          <span>

            <strong>
              Clinical History:
            </strong>

            {" "}
            {
              patient.clinical_history ||
              "-"
            }

          </span>

          <span>

            <strong>
              Access Code:
            </strong>

            {" "}
            {
              patient.access_code ||
              "-"
            }

          </span>

        </div>

      </div>

      {/* =====================================================
          REPORT TITLE
      ===================================================== */}

      <h2 className="report-title">

        {
          reportTitle
        }

      </h2>

      {/* =====================================================
          RESULT TABLE
      ===================================================== */}

      <div className="enterprise-result-table">

        {/* TABLE HEADER */}

        <div className="enterprise-table-header">

          <span>
            Parameter
          </span>

          <span>
            Result
          </span>

          <span>
            Unit
          </span>

          <span>
            Flag
          </span>

          <span>
            Reference Value
          </span>

        </div>

        {/* TABLE BODY */}

        {
          Object.entries(
            results
          ).map(
            ([
              testName,
              result,
            ]) => {

              const master =
                allTests.find(
                  (item) =>
                    item.test_name ===
                    testName
                );

              return (

                <div
                  key={testName}
                  className="enterprise-table-row"
                >

                  {/* PARAMETER */}

                  <span>
                    {
                      testName
                    }
                  </span>

                  {/* RESULT */}

                  <span className="bold-result">

                    {
                      result.value ||
                      "-"
                    }

                  </span>

                  {/* UNIT */}

                  <span>

                    {
                      master?.unit ||
                      "-"
                    }

                  </span>

                  {/* FLAG */}

                  <span
                    className={`result-flag ${result.flag}`}
                  >

                    {
                      result.flag ||
                      "Normal"
                    }

                  </span>

                  {/* REFERENCE */}

                  <span>

                    {
                      getReference(
                        master
                      )
                    }

                  </span>

                </div>
              );
            }
          )
        }

      </div>

      {/* =====================================================
          COMMENT
      ===================================================== */}

      {
        comment && (

          <div className="enterprise-comment">

            <h3>
              Clinical Comment
            </h3>

            <p>
              {comment}
            </p>

          </div>
        )
      }

      {/* =====================================================
          SIGNATORY
      ===================================================== */}

      <div className="enterprise-signatory">

        {/* LAB SCIENTIST */}

        <div>

          <h4>
            Lab Scientist
          </h4>

          <p>
            {
              enteredBy ||
              "................"
            }
          </p>

        </div>

        {/* AUTHORIZED */}

        <div>

          <h4>
            Authorized By
          </h4>

          <p>
            {
              validatedBy ||
              "................"
            }
          </p>

        </div>

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="enterprise-footer">

        <p>
          Leading the way in medical excellence
          through timely, accurate, affordable
          and precision testing
        </p>

      </div>

    </div>
  );
}