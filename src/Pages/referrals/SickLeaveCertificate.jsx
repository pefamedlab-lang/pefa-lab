import { useState } from "react";

import PrintLayout from "../../components/printing/PrintLayout";

import "../../styles/clinicalDocuments.css";

export default function SickLeaveCertificate() {

  const [formData, setFormData] = useState({

    certificateNumber: "",

    issueDate: "",

    patientName: "",

    hospitalNumber: "",

    age: "",

    gender: "",

    employer: "",

    occupation: "",

    diagnosis: "",

    clinicalSummary: "",

    laboratorySummary: "",

    leaveFrom: "",

    leaveTo: "",

    resumeDate: "",

    recommendation: "",

    remarks: "",

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

        {/* ==========================================
            TITLE
        ========================================== */}

        <div className="document-title">

          <h2>

            MEDICAL SICK LEAVE CERTIFICATE

          </h2>

          <p>

            Official Medical Leave Recommendation

          </p>

        </div>

        {/* ==========================================
            CERTIFICATE INFORMATION
        ========================================== */}

        <section className="referral-section">

          <div className="section-header">

            Certificate Information

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Certificate Number

              </label>

              <input
                type="text"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Date Issued

              </label>

              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
              />

            </div>

          </div>

        </section>

        {/* ==========================================
            PATIENT INFORMATION
        ========================================== */}

        <section className="referral-section">

          <div className="section-header">

            Patient Information

          </div>

          <div className="patient-grid">

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

            <div className="form-group">

              <label>

                Employer / School

              </label>

              <input
                type="text"
                name="employer"
                value={formData.employer}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Occupation / Class

              </label>

              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />

            </div>

          </div>

        </section>

        {/* ==========================================
            MEDICAL INFORMATION
        ========================================== */}

        <section className="referral-section">

          <div className="section-header">

            Medical Assessment

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

              Clinical Summary

            </label>

            <textarea
              rows={4}
              name="clinicalSummary"
              value={formData.clinicalSummary}
              onChange={handleChange}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Laboratory Findings

            </label>

            <textarea
              rows={4}
              name="laboratorySummary"
              value={formData.laboratorySummary}
              onChange={handleChange}
            />

          </div>

        </section>

        {/* ==========================================
            LEAVE PERIOD
        ========================================== */}

        <section className="referral-section">

          <div className="section-header">

            Recommended Medical Leave

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Leave From

              </label>

              <input
                type="date"
                name="leaveFrom"
                value={formData.leaveFrom}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Leave To

              </label>

              <input
                type="date"
                name="leaveTo"
                value={formData.leaveTo}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Resume Date

              </label>

              <input
                type="date"
                name="resumeDate"
                value={formData.resumeDate}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="form-group full-width">

            <label>

              Medical Recommendation

            </label>

            <textarea
              rows={4}
              name="recommendation"
              value={formData.recommendation}
              onChange={handleChange}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Additional Remarks

            </label>

            <textarea
              rows={3}
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />

          </div>

        </section>

        {/* ==========================================
            AUTHORIZATION
        ========================================== */}

        <section className="referral-section">

          <div className="section-header">

            Authorized Medical Officer

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