/*
 * PEFA ENTERPRISE LIS
 * PEFAFormalReportShell.jsx
 *
 * Presentation shell only. It never fetches, groups, mutates, or
 * reconstructs laboratory results.
 */

import React from "react";

const escText = (v) => {
  if (v === null || v === undefined || String(v).trim() === "") return "—";
  return String(v);
};

const first = (...values) => {
  for (const v of values) {
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return "";
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return escText(value);
  return d.toLocaleString();
};

export default function PEFAFormalReportShell({
  report = {},
  children,
  title = "LABORATORY REPORT",
  department = "",
  printMode = "full",
  clinicalHistory = "",
  interpretation = "",
  resultEnteredBy = "",
  authorizedBy = "",
  verificationId = "",
  verificationStatus = "",
  releasedBy = "",
  releasedAt = "",
}) {
  const patient = report.patient || report.patientInfo || {};
  const registration = report.registration || {};
  const labNumber = first(
    report.lab_number, report.labNumber, report.lab_no,
    registration.lab_number, registration.labNumber
  );
  const patientName = first(
    patient.patient_name, patient.patientName, patient.name,
    report.patient_name, report.patientName
  );
  const patientId = first(
    patient.patient_id, patient.patientId, patient.id,
    report.patient_id, report.patientId
  );
  const sex = first(patient.sex, patient.gender, report.sex, report.gender);
  const age = first(patient.age, report.age);
  const sampleType = first(
    report.specimen, report.sample_type, report.sampleType,
    registration.specimen, registration.sample_type
  );
  const requestedAt = first(
    report.requested_at, report.requestedAt,
    report.created_at, report.createdAt,
    registration.created_at
  );

  const preprinted = printMode === "preprinted";

  return (
    <div className={`pefa-formal-report ${preprinted ? "pefa-preprinted" : "pefa-full"}`}>
      {!preprinted && (
        <header className="pefa-letterhead">
          <div className="pefa-brand">PEFA MEDICAL</div>
          <div className="pefa-brand-sub">DIAGNOSTIC SERVICES</div>
          <div className="pefa-reg">REG NO 3450274</div>
          <div className="pefa-address">
            Head Office: 32 Ogunru-Ori, Pakuro Road, Mowe &nbsp; | &nbsp;
            Mowe Branch: 5 Olorombo Street, Imedu-Nla, Mowe
          </div>
          <div className="pefa-address">
            Orimerunmu Iya-Ijebu Junction, Ogun State &nbsp; | &nbsp;
            Tel: 0803 358 3555 &nbsp; | &nbsp; info@pefamedlab.com
          </div>
          <div className="pefa-web">www.pefamedlab.com</div>
          <div className="pefa-slogan">Leading the Way in Medical Excellence</div>
        </header>
      )}

      {preprinted && <div className="pefa-preprinted-space" />}

      <section className="pefa-report-heading">
        <div>
          <div className="pefa-report-title">{escText(title)}</div>
          {department && <div className="pefa-department">{escText(department)}</div>}
        </div>
        <div className="pefa-lab-number">
          <span>LAB NO</span>
          <strong>{escText(labNumber)}</strong>
        </div>
      </section>

      <section className="pefa-patient-grid">
        <div><b>Patient</b><span>{escText(patientName)}</span></div>
        <div><b>Patient ID</b><span>{escText(patientId)}</span></div>
        <div><b>Sex</b><span>{escText(sex)}</span></div>
        <div><b>Age</b><span>{escText(age)}</span></div>
        <div><b>Specimen</b><span>{escText(sampleType)}</span></div>
        <div><b>Requested</b><span>{formatDate(requestedAt)}</span></div>
      </section>

      {clinicalHistory && (
        <section className="pefa-note">
          <b>Clinical History</b>
          <div>{escText(clinicalHistory)}</div>
        </section>
      )}

      <main className="pefa-result-content">{children}</main>

      {interpretation && (
        <section className="pefa-note">
          <b>Interpretation</b>
          <div>{escText(interpretation)}</div>
        </section>
      )}

      <section className="pefa-signatures">
        <div><b>Result Entered By</b><span>{escText(resultEnteredBy)}</span></div>
        <div><b>Authorized By</b><span>{escText(authorizedBy)}</span></div>
      </section>

      <section className="pefa-verification">
        <div><b>Verification ID</b><span>{escText(verificationId)}</span></div>
        <div><b>Status</b><span>{escText(verificationStatus)}</span></div>
        <div><b>Released By</b><span>{escText(releasedBy)}</span></div>
        <div><b>Released At</b><span>{formatDate(releasedAt)}</span></div>
      </section>

      <footer className="pefa-footer">
        <div>This laboratory report is confidential and intended for the named patient/authorized recipient.</div>
        <div>For verification, use the laboratory number and verification details supplied by PEFA Medical Diagnostic Services.</div>
        <div>PEFA Medical Diagnostic Services — Leading the Way in Medical Excellence</div>
      </footer>

      <style>{`
        .pefa-formal-report {
          width: 210mm;
          min-height: 297mm;
          box-sizing: border-box;
          margin: 0 auto;
          padding: 12mm 12mm 10mm;
          background: #fff;
          color: #111;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10.5pt;
          line-height: 1.35;
        }
        .pefa-letterhead { text-align:center; border-bottom:2px solid #111; padding-bottom:5mm; }
        .pefa-brand { font-size:21pt; font-weight:800; letter-spacing:.8px; }
        .pefa-brand-sub { font-size:12pt; font-weight:700; letter-spacing:1.6px; }
        .pefa-reg,.pefa-address,.pefa-web,.pefa-slogan { font-size:8.5pt; margin-top:1mm; }
        .pefa-slogan { font-weight:700; font-style:italic; }
        .pefa-preprinted-space { height:42mm; }
        .pefa-report-heading {
          display:flex; justify-content:space-between; align-items:flex-end;
          border-bottom:1px solid #222; padding:4mm 0 2.5mm; margin-bottom:3mm;
        }
        .pefa-report-title { font-size:14pt; font-weight:800; }
        .pefa-department { font-size:9pt; text-transform:uppercase; margin-top:1mm; }
        .pefa-lab-number { text-align:right; }
        .pefa-lab-number span { display:block; font-size:7.5pt; }
        .pefa-lab-number strong { font-size:12pt; }
        .pefa-patient-grid {
          display:grid; grid-template-columns:repeat(3,1fr);
          border:1px solid #222; margin-bottom:4mm;
        }
        .pefa-patient-grid > div { padding:2mm; border-right:1px solid #222; border-bottom:1px solid #222; }
        .pefa-patient-grid > div:nth-child(3n) { border-right:0; }
        .pefa-patient-grid > div:nth-last-child(-n+3) { border-bottom:0; }
        .pefa-patient-grid b,.pefa-signatures b,.pefa-verification b { display:block; font-size:7.5pt; text-transform:uppercase; }
        .pefa-patient-grid span,.pefa-signatures span,.pefa-verification span { display:block; margin-top:1mm; }
        .pefa-note { border:1px solid #777; padding:2.5mm; margin:3mm 0; }
        .pefa-result-content { margin-top:2mm; }
        .pefa-signatures { display:grid; grid-template-columns:1fr 1fr; gap:10mm; margin-top:8mm; }
        .pefa-signatures > div { border-top:1px solid #222; padding-top:2mm; min-height:12mm; }
        .pefa-verification { display:grid; grid-template-columns:repeat(4,1fr); gap:3mm; border-top:1px solid #222; margin-top:5mm; padding-top:3mm; }
        .pefa-footer { border-top:1px solid #222; margin-top:7mm; padding-top:3mm; text-align:center; font-size:7.5pt; }
        @media print {
          @page { size:A4 portrait; margin:0; }
          .pefa-formal-report { margin:0; }
        }
      `}</style>
    </div>
  );
}
