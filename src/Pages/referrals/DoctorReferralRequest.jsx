import { useState } from "react";

import PrintLayout from "../../components/printing/PrintLayout";

import ReferralPatientDetails from "../../components/referrals/ReferralPatientDetails";
import ReferralDoctorDetails from "../../components/referrals/ReferralDoctorDetails";
import ReferralClinicalInfo from "../../components/referrals/ReferralClinicalInfo";
import InvestigationSelector from "../../components/referrals/InvestigationSelector";
import ReferralSignature from "../../components/referrals/ReferralSignature";

import "./DoctorReferralRequest.css";

export default function DoctorReferralRequest() {

  const [selectedTests, setSelectedTests] = useState([]);

  const [formData, setFormData] = useState({

    /* ======================================
       PATIENT DETAILS
    ====================================== */

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

    /* ======================================
       DOCTOR DETAILS
    ====================================== */

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

    /* ======================================
       CLINICAL INFORMATION
    ====================================== */

    chiefComplaint: "",
    historyOfPresentIllness: "",
    clinicalDiagnosis: "",
    clinicalFindings: "",
    previousInvestigations: "",
    currentMedication: "",
    allergies: "",
    specialInstructions: "",
    additionalNotes: "",

    /* ======================================
       SIGNATURE
    ====================================== */

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

      <div className="doctor-referral-request">

        <div className="document-title">

          <h2>

            LABORATORY INVESTIGATION REQUEST FORM

          </h2>

          <p>

            Complete this form before submitting specimens to PEFA Medical Diagnostic Services.

          </p>

        </div>

        <ReferralPatientDetails
          formData={formData}
          handleChange={handleChange}
        />

        <ReferralDoctorDetails
          formData={formData}
          handleChange={handleChange}
        />

        <ReferralClinicalInfo
          formData={formData}
          handleChange={handleChange}
        />

        <InvestigationSelector
          selectedTests={selectedTests}
          setSelectedTests={setSelectedTests}
        />

        <ReferralSignature
          formData={formData}
          handleChange={handleChange}
        />

      </div>

    </PrintLayout>

  );

}