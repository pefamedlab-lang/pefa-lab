import {
  useLocation,
} from "react-router-dom";

import {
  Printer,
} from "lucide-react";

import "../styles/preview.css";

import { labProfile } from "../Data/labProfile";

import { cbcParameters } from "../Hematology/cbcParameters";

import { cbcReferenceRanges } from "../Hematology/cbcReferenceRanges";

import { getCBCFlag } from "../Hematology/getCBCFlag";

export default function HematologyPreview() {
  const location =
    useLocation();

  const patient =
    location.state?.patient || {};

  const results =
    patient.result_data ||
    {};

  /* =========================
     RANGE ENGINE
  ========================= */

  const getReferenceRange =
    (parameterCode) => {
      const parameter =
        cbcReferenceRanges[
          parameterCode
        ];

      if (!parameter)
        return "";

      const age =
        Number(
          patient.age
        );

      /* INFANT */

      if (
        age < 1 &&
        parameter.infant
      ) {
        return `${parameter.infant.min} - ${parameter.infant.max}`;
      }

      /* CHILD */

      if (
        age < 18 &&
        parameter.child
      ) {
        return `${parameter.child.min} - ${parameter.child.max}`;
      }

      /* ADULT */

      if (
        parameter[
          patient.sex
        ]
      ) {
        return `${parameter[patient.sex].min} - ${parameter[patient.sex].max}`;
      }

      return "";
    };

  return (
    <div className="preview-page">
      {/* REPORT */}

<div className="preview-toolbar no-print">
  <button
    className="print-btn"
    onClick={() =>
      window.print()
    }
  >
    <Printer size={18} />

    Print Report
  </button>
</div>

      <div className="report-sheet">
        {/* HEADER */}

        <div
          className="report-header-preview"
          style={{
            background:
              labProfile.header_gradient,
          }}
        >
          {/* LOGO */}

          <div className="report-logo">
            <img
              src={
                labProfile.logo
              }
              alt="logo"
            />
          </div>

          {/* LAB INFO */}

          <div className="report-header-info">
            <h1>
              {
                labProfile.laboratory_name
              }
            </h1>

            <p>
              {
                labProfile.slogan
              }
            </p>

            <div className="report-contact">
              <span>
                {
                  labProfile.address
                }
              </span>

              <span>
                {
                  labProfile.phone
                }
              </span>

              <span>
                {
                  labProfile.email
                }
              </span>

              <span>
                {
                  labProfile.website
                }
              </span>
            </div>
          </div>
        </div>

        {/* TITLE */}

        <div className="report-title">
          HEMATOLOGY REPORT
        </div>

        {/* PATIENT DETAILS */}

        <div className="patient-preview-grid">
          <div>
            <strong>
              Patient Name:
            </strong>{" "}
            {
              patient.patient_name
            }
          </div>

          <div>
            <strong>
              Age:
            </strong>{" "}
            {patient.age}
          </div>

          <div>
            <strong>
              Sex:
            </strong>{" "}
            {patient.sex}
          </div>

          <div>
            <strong>
              Lab Number:
            </strong>{" "}
            {
              patient.lab_number
            }
          </div>

          <div>
            <strong>
              Hospital:
            </strong>{" "}
            {patient.hospital ||
              "-"}
          </div>

          <div>
            <strong>
              Doctor:
            </strong>{" "}
            {patient.doctor ||
              "-"}
          </div>

          <div>
            <strong>
              Clinical
              History:
            </strong>{" "}
            {patient.clinical_history ||
              "-"}
          </div>

          <div>
            <strong>
              Entry Date:
            </strong>{" "}
            {patient.created_at
              ? new Date(
                  patient.created_at
                ).toLocaleString()
              : "-"}
          </div>

          <div>
            <strong>
              Report Date:
            </strong>{" "}
            {new Date().toLocaleString()}
          </div>
        </div>

        {/* RESULT TABLE */}

        <div className="preview-table-wrapper">
          <table className="preview-table">
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
                  Range
                </th>

                <th>
                  Flag
                </th>
              </tr>
            </thead>

            <tbody>
              {cbcParameters.map(
                (
                  parameter
                ) => {
                  const value =
                    results[
                      parameter
                        .code
                    ] || "";

                  const flag =
                    getCBCFlag(
                      parameter.code,
                      value,
                      patient.sex,
                      patient.age
                    );

                  return (
                    <tr
                      key={
                        parameter.code
                      }
                    >
                      <td>
                        {
                          parameter.name
                        }
                      </td>

                      <td>
                        {value}
                      </td>

                      <td>
                        {
                          parameter.unit
                        }
                      </td>

                      <td>
                        {getReferenceRange(
                          parameter.code
                        )}
                      </td>

                      <td
                        className={
                          flag ===
                            "H" ||
                          flag ===
                            "L"
                            ? "preview-flag-high"
                            : "preview-flag-normal"
                        }
                      >
                        {flag}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* SIGNATURES */}

        <div className="signature-grid">
          <div>
            <strong>
              Scientist
            </strong>

            <p>
              _________________
            </p>
          </div>

          <div>
            <strong>
              Reviewer
            </strong>

            <p>
              _________________
            </p>
          </div>

          <div>
            <strong>
              Authorizer
            </strong>

            <p>
              _________________
            </p>
          </div>
        </div>

{/* =========================
    AUDIT HISTORY
========================= */}

<div className="audit-panel">
  <h2>
    Workflow Audit Trail
  </h2>

  <div className="audit-grid">
    {/* ENTERED */}

    <div className="audit-card">
      <span>
        Entered By
      </span>

      <strong>
        {patient.entered_by ||
          "-"}
      </strong>
    </div>

    {/* REVIEWED */}

    <div className="audit-card">
      <span>
        Reviewed By
      </span>

      <strong>
        {patient.reviewed_by ||
          "-"}
      </strong>
    </div>

    {/* AUTHORIZED */}

    <div className="audit-card">
      <span>
        Authorized By
      </span>

      <strong>
        {patient.authorized_by ||
          "-"}
      </strong>
    </div>

    {/* RELEASED */}

    <div className="audit-card">
      <span>
        Released By
      </span>

      <strong>
        {patient.released_by ||
          "-"}
      </strong>
    </div>

    {/* REVIEW DATE */}

    <div className="audit-card">
      <span>
        Reviewed At
      </span>

      <strong>
        {patient.reviewed_at
          ? new Date(
              patient.reviewed_at
            ).toLocaleString()
          : "-"}
      </strong>
    </div>

    {/* AUTHORIZED DATE */}

    <div className="audit-card">
      <span>
        Authorized At
      </span>

      <strong>
        {patient.authorized_date
          ? new Date(
              patient.authorized_date
            ).toLocaleString()
          : "-"}
      </strong>
    </div>

    {/* RELEASED DATE */}

    <div className="audit-card">
      <span>
        Released At
      </span>

      <strong>
        {patient.released_at
          ? new Date(
              patient.released_at
            ).toLocaleString()
          : "-"}
      </strong>
    </div>

    {/* STATUS */}

    <div className="audit-card">
      <span>
        Workflow Status
      </span>

      <strong>
        {patient.authorization_status ||
          "Pending"}
      </strong>
    </div>
  </div>
</div>

        {/* FOOTER */}

        <div
          className="report-footer"
          style={{
            background:
              labProfile.footer_color,
          }}
        >
          <p>
            {
              labProfile.disclaimer
            }
          </p>

          <div className="footer-contact">
            <span>
              {
                labProfile.phone
              }
            </span>

            <span>
              {
                labProfile.email
              }
            </span>

            <span>
              {
                labProfile.website
              }
            </span>
          </div>

          <div className="access-code">
            Access Code:
            PEFA-XXXXXX
          </div>
        </div>
      </div>
    </div>
  );
}