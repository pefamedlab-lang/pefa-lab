import { useState } from "react";

import PrintLayout from "../../components/printing/PrintLayout";

import "../../styles/clinicalDocuments.css";

export default function ReferralLetter() {

  const [formData, setFormData] = useState({

    /* ==========================================
       DATE
    ========================================== */

    date: "",

    /* ==========================================
       RECEIVING HOSPITAL
    ========================================== */

    hospitalName: "",
    department: "",
    consultant: "",
    hospitalAddress: "",

    /* ==========================================
       PATIENT DETAILS
    ========================================== */

    patientName: "",
    hospitalNumber: "",
    age: "",
    gender: "",

    /* ==========================================
       CLINICAL DETAILS
    ========================================== */

    clinicalHistory: "",
    examinationFindings: "",
    laboratoryFindings: "",
    diagnosis: "",
    treatmentGiven: "",
    reasonForReferral: "",
    recommendation: "",

    /* ==========================================
       REFERRING DOCTOR
    ========================================== */

    doctorName: "",
    designation: "",
    licenceNumber: "",

  });

  const handleChange = ({ target }) => {

    const { name, value } = target;

    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };

  return (

    <PrintLayout>

      <div className="clinical-document">

        {/* ======================================
            TITLE
        ====================================== */}

        <div className="document-title">

          <h2>

            MEDICAL REFERRAL LETTER

          </h2>

          <p>

            Official referral correspondence.

          </p>

        </div>

        {/* ======================================
            DATE
        ====================================== */}

        <section className="referral-section">

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Date

              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />

            </div>

          </div>

        </section>

        {/* ======================================
            RECIPIENT
        ====================================== */}

        <section className="referral-section">

          <div className="section-header">

            Receiving Hospital / Specialist

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Hospital / Institution

              </label>

              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Department

              </label>

              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Consultant / Receiving Doctor

              </label>

              <input
                type="text"
                name="consultant"
                value={formData.consultant}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="form-group full-width">

            <label>

              Hospital Address

            </label>

            <textarea
              rows={3}
              name="hospitalAddress"
              value={formData.hospitalAddress}
              onChange={handleChange}
            />

          </div>

        </section>

        {/* ======================================
            LETTER BODY
        ====================================== */}

        <section className="referral-section">

          <div className="section-header">

            Letter

          </div>

          <div className="letter-body">

            <p>

              <strong>

                Dear Doctor,

              </strong>

            </p>

            <p>

              <strong>

                RE: REFERRAL OF PATIENT

              </strong>

            </p>

            <div className="form-group">

              <label>

                Patient Name

              </label>

              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
              />

            </div>

            <div className="patient-grid">

              <div className="form-group">

                <label>

                  Hospital Number

                </label>

                <input
                  type="text"
                  name="hospitalNumber"
                  value={formData.hospitalNumber}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>

                  Age

                </label>

                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                />

              </div>

              <div className="form-group">

                <label>

                  Gender

                </label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >

                  <option value="">
                    Select
                  </option>

                  <option>
                    Male
                  </option>

                  <option>
                    Female
                  </option>

                </select>

              </div>

            </div>

            <div className="form-group full-width">

              <label>

                Clinical History

              </label>

              <textarea
                rows={5}
                name="clinicalHistory"
                value={formData.clinicalHistory}
                onChange={handleChange}
              />

            </div>

            <div className="form-group full-width">

              <label>

                Examination Findings

              </label>

              <textarea
                rows={4}
                name="examinationFindings"
                value={formData.examinationFindings}
                onChange={handleChange}
              />

            </div>

            <div className="form-group full-width">

              <label>

                Laboratory Findings

              </label>

              <textarea
                rows={4}
                name="laboratoryFindings"
                value={formData.laboratoryFindings}
                onChange={handleChange}
              />

            </div>

            <div className="form-group full-width">

              <label>

                Diagnosis

              </label>

              <textarea
                rows={3}
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
              />

            </div>

            <div className="form-group full-width">

              <label>

                Treatment Given

              </label>

              <textarea
                rows={4}
                name="treatmentGiven"
                value={formData.treatmentGiven}
                onChange={handleChange}
              />

            </div>

            <div className="form-group full-width">

              <label>

                Reason For Referral

              </label>

              <textarea
                rows={5}
                name="reasonForReferral"
                value={formData.reasonForReferral}
                onChange={handleChange}
              />

            </div>

            <div className="form-group full-width">

              <label>

                Recommendation

              </label>

              <textarea
                rows={5}
                name="recommendation"
                value={formData.recommendation}
                onChange={handleChange}
              />

            </div>

            <p>

              Kindly evaluate and manage this patient as you consider appropriate.

            </p>

            <p>

              Thank you for your professional assistance.

            </p>

            <p>

              Yours faithfully,

            </p>

          </div>

        </section>

        {/* ======================================
            SIGNATORY
        ====================================== */}

        <section className="referral-section">

          <div className="section-header">

            Referring Medical Officer

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Doctor's Name

              </label>

              <input
                type="text"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Designation

              </label>

              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                MDCN Licence Number

              </label>

              <input
                type="text"
                name="licenceNumber"
                value={formData.licenceNumber}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="signature-row">

            <div className="signature-box">

              <label>

                Signature

              </label>

              <div className="signature-line"></div>

            </div>

            <div className="signature-box">

              <label>

                Official Stamp

              </label>

              <div className="signature-line"></div>

            </div>

          </div>

        </section>

      </div>

    </PrintLayout>

  );

}