import React from "react";

export default function UltrasoundReport({
  patient,
  data,
}) {
  return (
    <div className="ultrasound-report">

      {/* =======================================
          PATIENT INFORMATION
      ======================================= */}

      <table className="patient-info-table">
        <tbody>

          <tr>
            <td><strong>Patient:</strong></td>
            <td>{patient.patient_name}</td>

            <td><strong>Lab No:</strong></td>
            <td>{patient.lab_number}</td>
          </tr>

          <tr>
            <td><strong>Age:</strong></td>
            <td>{patient.age}</td>

            <td><strong>Sex:</strong></td>
            <td>{patient.sex}</td>
          </tr>

          <tr>
            <td><strong>Investigation:</strong></td>
            <td>{patient.test_type}</td>

            <td><strong>Date:</strong></td>
            <td>
              {new Date(patient.created_at).toLocaleDateString()}
            </td>
          </tr>

          <tr>
            <td><strong>Clinical Details:</strong></td>
            <td colSpan={3}>
              {patient.clinical_indication || "-"}
            </td>
          </tr>

        </tbody>
      </table>

      {/* =======================================
          FINDINGS
      ======================================= */}

      <section className="report-section">

        <h3>FINDINGS</h3>

        <pre className="report-text">
          {data.report_text || "No findings entered."}
        </pre>

      </section>

      {/* =======================================
          IMPRESSION
      ======================================= */}

      <section className="report-section">

        <h3>IMPRESSION</h3>

        <pre className="report-text">
          {data.impression || "No impression."}
        </pre>

      </section>

      {/* =======================================
          RECOMMENDATION
      ======================================= */}

      <section className="report-section">

        <h3>RECOMMENDATION</h3>

        <pre className="report-text">
          {data.recommendation || "None"}
        </pre>

      </section>

      {/* =======================================
          SIGNATURES
      ======================================= */}

      <div className="signature-row">

        <div>
          __________________________
          <br />
          <strong>Reporting Radiologist</strong>
          <br />
          {patient.radiologist || ""}
        </div>

        <div>
          __________________________
          <br />
          <strong>Date</strong>
          <br />
          {new Date().toLocaleDateString()}
        </div>

      </div>

    </div>
  );
}