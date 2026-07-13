import { useState } from "react";

import PrintLayout from "../../components/printing/PrintLayout";

import "../../styles/clinicalDocuments.css";

export default function MedicalCertificate() {

  const [formData, setFormData] = useState({

    certificateNumber: "",

    issueDate: "",

    patientName: "",

    hospitalNumber: "",

    age: "",

    gender: "",

    address: "",

    diagnosis: "",

    examinationFindings: "",

    laboratoryFindings: "",

    periodFrom: "",

    periodTo: "",

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

            MEDICAL CERTIFICATE

          </h2>

          <p>

            Official Medical Certificate

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
            PATIENT DETAILS
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

          </div>

          <div className="form-group full-width">

            <label>

              Residential Address

            </label>

            <textarea
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

          </div>

        </section>

        {/* ==========================================
            MEDICAL FINDINGS
        ========================================== */}

        <section className="referral-section">

          <div className="section-header">

            Medical Findings

          </div>

          <div className="form-group full-width">

            <label>

              Diagnosis

            </label>

            <textarea
              rows={4}
              name="diagnosis"
              value={formData.diagnosis}
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

        </section>

        {/* ==========================================
            CERTIFICATION
        ========================================== */}

        <section className="referral-section">

          <div className="section-header">

            Certification

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
              placeholder="Example: The patient is advised to rest for the period stated below."
            />

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Recommended From

              </label>

              <input
                type="date"
                name="periodFrom"
                value={formData.periodFrom}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Recommended Until

              </label>

              <input
                type="date"
                name="periodTo"
                value={formData.periodTo}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="form-group full-width">

            <label>

              Additional Remarks

            </label>

            <textarea
              rows={4}
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

            Medical Officer

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