import { useState } from "react";

import PrintLayout from "../../components/printing/PrintLayout";

import ReferralPatientDetails from "../../components/referrals/ReferralPatientDetails";
import ReferralDoctorDetails from "../../components/referrals/ReferralDoctorDetails";
import ReferralClinicalInfo from "../../components/referrals/ReferralClinicalInfo";
import ReferralSignature from "../../components/referrals/ReferralSignature";

import "../../styles/clinicalDocuments.css";

export default function PatientReferralForm() {

  const [formData, setFormData] = useState({

    /* ==========================================
       PATIENT DETAILS
    ========================================== */

    surname: "",
    firstName: "",
    otherName: "",
    gender: "",
    age: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    hospitalNumber: "",
    referralDate: "",
    priority: "",
    address: "",

    /* ==========================================
       REFERRAL DESTINATION
    ========================================== */

    referredHospital: "",
    referredDepartment: "",
    referredConsultant: "",
    referredAddress: "",

    /* ==========================================
       DOCTOR DETAILS
    ========================================== */

    doctorName: "",
    specialization: "",
    hospital: "",
    department: "",
    doctorPhone: "",
    doctorEmail: "",
    licenseNumber: "",
    doctorReferralDate: "",
    hospitalAddress: "",
    provisionalDiagnosis: "",
    referralReason: "",

    /* ==========================================
       CLINICAL INFORMATION
    ========================================== */

    chiefComplaint: "",
    historyOfPresentIllness: "",
    clinicalDiagnosis: "",
    clinicalFindings: "",
    previousInvestigations: "",
    currentMedication: "",
    allergies: "",
    specialInstructions: "",
    additionalNotes: "",

    /* ==========================================
       REFERRAL SUMMARY
    ========================================== */

    laboratoryFindings: "",
    treatmentGiven: "",
    referralObjective: "",
    recommendations: "",

    /* ==========================================
       SIGNATURE
    ========================================== */

    referringDoctor: "",
    doctorDesignation: "",
    doctorLicence: "",
    signatureDate: "",

    receivedBy: "",
    receivedDate: "",
    receivedTime: "",
    laboratoryNumber: "",

    specimenType: "",
    collectionDate: "",
    collectionTime: "",
    collectedBy: "",

    laboratoryRemarks: "",

  });

  const handleChange = (event) => {

    const { name, value } = event.target;

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

            PATIENT REFERRAL FORM

          </h2>

          <p>

            Referral of patient from PEFA Medical Diagnostic Services to another healthcare facility or specialist.

          </p>

        </div>

        {/* ======================================
            PATIENT DETAILS
        ====================================== */}

        <ReferralPatientDetails
          formData={formData}
          handleChange={handleChange}
        />

        {/* ======================================
            REFERRAL DESTINATION
        ====================================== */}

        <section className="referral-section">

          <div className="section-header">

            Receiving Hospital / Specialist

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Hospital / Healthcare Facility

              </label>

              <input
                type="text"
                name="referredHospital"
                value={formData.referredHospital}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Department

              </label>

              <input
                type="text"
                name="referredDepartment"
                value={formData.referredDepartment}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>

                Consultant / Receiving Doctor

              </label>

              <input
                type="text"
                name="referredConsultant"
                value={formData.referredConsultant}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="form-group full-width">

            <label>

              Hospital Address

            </label>

            <textarea
              name="referredAddress"
              value={formData.referredAddress}
              onChange={handleChange}
              rows={3}
            />

          </div>

        </section>

        {/* ======================================
            CLINICAL INFORMATION
        ====================================== */}

        <ReferralClinicalInfo
          formData={formData}
          handleChange={handleChange}
        />

        {/* ======================================
            REFERRAL SUMMARY
        ====================================== */}

        <section className="referral-section">

          <div className="section-header">

            Referral Summary

          </div>

          <div className="form-group full-width">

            <label>

              Laboratory Findings

            </label>

            <textarea
              name="laboratoryFindings"
              value={formData.laboratoryFindings}
              onChange={handleChange}
              rows={4}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Treatment Given

            </label>

            <textarea
              name="treatmentGiven"
              value={formData.treatmentGiven}
              onChange={handleChange}
              rows={4}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Purpose of Referral

            </label>

            <textarea
              name="referralObjective"
              value={formData.referralObjective}
              onChange={handleChange}
              rows={4}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Recommendation to Receiving Hospital

            </label>

            <textarea
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              rows={5}
            />

          </div>

        </section>

        {/* ======================================
            REFERRING DOCTOR
        ====================================== */}

        <ReferralDoctorDetails
          formData={formData}
          handleChange={handleChange}
        />

        {/* ======================================
            SIGNATURES
        ====================================== */}

        <ReferralSignature
          formData={formData}
          handleChange={handleChange}
        />

      </div>

    </PrintLayout>

  );

}