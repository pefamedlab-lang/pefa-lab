import { useState } from "react";

import PrintLayout from "../../components/printing/PrintLayout";

import "../../styles/clinicalDocuments.css";

export default function FitnessCertificate() {

  const [formData, setFormData] = useState({

    certificateNumber: "",
    issueDate: "",

    patientName: "",
    hospitalNumber: "",
    age: "",
    gender: "",
    address: "",
    phone: "",

    purpose: "",

    examinationDate: "",
    examinationSummary: "",
    laboratorySummary: "",

    fitnessStatus: "FIT",

    restrictions: "",

    recommendation: "",

    validUntil: "",

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

        <div className="document-title">

          <h2>

            MEDICAL FITNESS CERTIFICATE

          </h2>

          <p>

            Official Certificate of Medical Fitness

          </p>

        </div>

        {/* ========================================= */}

        <section className="referral-section">

          <div className="section-header">

            Certificate Information

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Certificate No.

              </label>

              <input
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

        {/* ========================================= */}

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

                <option value="">Select</option>

                <option>Male</option>

                <option>Female</option>

              </select>

            </div>

            <div className="form-group">

              <label>

                Phone Number

              </label>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />

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

        {/* ========================================= */}

        <section className="referral-section">

          <div className="section-header">

            Fitness Assessment

          </div>

          <div className="form-group">

            <label>

              Purpose of Certificate

            </label>

            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
            >

              <option value="">Select Purpose</option>

              <option>Employment</option>

              <option>School Admission</option>

              <option>Travel</option>

              <option>Sports</option>

              <option>Visa Application</option>

              <option>Driving</option>

              <option>General Fitness</option>

              <option>Other</option>

            </select>

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Examination Date

              </label>

              <input
                type="date"
                name="examinationDate"
                value={formData.examinationDate}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Fitness Status

              </label>

              <select
                name="fitnessStatus"
                value={formData.fitnessStatus}
                onChange={handleChange}
              >

                <option>

                  FIT

                </option>

                <option>

                  FIT WITH RESTRICTIONS

                </option>

                <option>

                  TEMPORARILY UNFIT

                </option>

                <option>

                  UNFIT

                </option>

              </select>

            </div>

          </div>

          <div className="form-group full-width">

            <label>

              Clinical Examination Summary

            </label>

            <textarea
              rows={5}
              name="examinationSummary"
              value={formData.examinationSummary}
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

          <div className="form-group full-width">

            <label>

              Restrictions (If Any)

            </label>

            <textarea
              rows={3}
              name="restrictions"
              value={formData.restrictions}
              onChange={handleChange}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Recommendation

            </label>

            <textarea
              rows={4}
              name="recommendation"
              value={formData.recommendation}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>

              Certificate Valid Until

            </label>

            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
            />

          </div>

        </section>

        {/* ========================================= */}

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