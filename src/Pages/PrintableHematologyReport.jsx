import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  ShieldCheck,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

import "../styles/printableReport.css";

export default function PrintableHematologyReport() {
  const [
    searchParams,
  ] = useSearchParams();

  const patientId =
    searchParams.get("id");

  const [
    patient,
    setPatient,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* FETCH */

  useEffect(() => {
    fetchPatient();
  }, []);

  const fetchPatient =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from(
          "patient_results"
        )
        .select("*")
        .eq("id", patientId)
        .single();

      if (!error) {
        setPatient(data);
      }

      setLoading(false);
    };

  /* LOADING */

  if (loading) {
    return (
      <div className="print-loading">
        Loading report...
      </div>
    );
  }

  /* SECURITY */

  if (
    patient.authorization_status !==
    "Authorized"
  ) {
    return (
      <div className="print-blocked">
        <h2>
          Report Not
          Authorized
        </h2>

        <p>
          This report is
          awaiting
          authorization and
          cannot be printed.
        </p>
      </div>
    );
  }

  return (
    <div className="print-page">
      {/* PRINT ACTION */}

      <div className="print-actions">
        <button
          onClick={() =>
            window.print()
          }
        >
          Print Report
        </button>
      </div>

      {/* REPORT */}

      <div className="print-report">
        {/* VERIFIED */}

        <div className="verified-banner">
          <ShieldCheck
            size={18}
          />

          Authorized &
          Digitally Verified
          Laboratory Report
        </div>

        {/* HEADER */}

        <div className="report-header">
          <img
            src="/logo.png"
            alt="PEFA Logo"
          />

          <div>
            <h1>
              PEFA MEDICAL
              DIAGNOSTIC
              SERVICES
            </h1>

            <p>
              Leading the way
              in medical
              excellence
              through timely,
              accurate,
              affordable and
              precision
              testing.
            </p>

            <div className="header-contact">
              <span>
                32,
                Ogunru-Ori,
                Pakuro Road,
                Mowe, Ogun
                State
              </span>

              <span>
                08086618621 /
                09052853701
              </span>

              <span>
                pefa.medlab@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* TITLE */}

        <div className="report-title">
          HEMATOLOGY REPORT
        </div>

        {/* PATIENT */}

        <div className="patient-section">
          <div>
            <strong>
              Patient Name
            </strong>

            <span>
              {
                patient.patient_name
              }
            </span>
          </div>

          <div>
            <strong>
              Sex
            </strong>

            <span>
              {patient.sex}
            </span>
          </div>

          <div>
            <strong>
              Age
            </strong>

            <span>
              {patient.age}
            </span>
          </div>

          <div>
            <strong>
              Lab Number
            </strong>

            <span>
              {
                patient.lab_number
              }
            </span>
          </div>

          <div>
            <strong>
              Branch
            </strong>

            <span>
              {
                patient.branch
              }
            </span>
          </div>

          <div>
            <strong>
              Sample Type
            </strong>

            <span>
              {
                patient.sample_type
              }
            </span>
          </div>

          <div>
            <strong>
              Entry Date
            </strong>

            <span>
              {
                patient.collection_date
              }
            </span>
          </div>

          <div>
            <strong>
              Report Date
            </strong>

            <span>
              {
                patient.report_date
              }
            </span>
          </div>
        </div>

        {/* CLINICAL HISTORY */}

        <div className="clinical-box">
          <strong>
            Clinical History
          </strong>

          <p>
            {
              patient.clinical_history ||
              "-"
            }
          </p>
        </div>

        {/* RESULT TABLE */}

        <table className="print-table">
          <thead>
            <tr>
              <th>
                Parameter
              </th>

              <th>Result</th>

              <th>Unit</th>

              <th>
                Reference
                Range
              </th>

              <th>Flag</th>
            </tr>
          </thead>

          <tbody>
            {Object.values(
              patient.result_data ||
                {}
            ).map(
              (
                item,
                index
              ) => (
                <tr
                  key={index}
                >
                  <td>
                    {
                      item.parameter
                    }
                  </td>

                  <td>
                    {
                      item.result
                    }
                  </td>

                  <td>
                    {item.unit}
                  </td>

                  <td>
                    {
                      item.reference_range
                    }
                  </td>

                  <td
                    className={`flag ${
                      item.flag ===
                      "H"
                        ? "high"
                        : item.flag ===
                          "L"
                        ? "low"
                        : "normal"
                    }`}
                  >
                    {item.flag}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* AUTH */}

        <div className="authorization-section">
          <div>
            <strong>
              Authorized By
            </strong>

            <span>
              {
                patient.authorized_by
              }
            </span>
          </div>

          <div>
            <strong>
              Authorization
              Date
            </strong>

            <span>
              {
                patient.authorization_date
              }
            </span>
          </div>

          <div>
            <strong>
              Status
            </strong>

            <span className="verified-status">
              VERIFIED
            </span>
          </div>
        </div>

        {/* FOOTER */}

        <div className="report-footer">
          This report is
          electronically
          verified and
          authorized by PEFA
          Medical Diagnostic
          Services.
        </div>
      </div>
    </div>
  );
}