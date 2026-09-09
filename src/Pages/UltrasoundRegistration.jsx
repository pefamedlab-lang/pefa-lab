import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

import { generateScanId } from "../utils/generateScanId";

import UltrasoundTemplateSelector
from "../components/ultrasound/templates/UltrasoundTemplateSelector";

import { generateAccessCode } from "../utils/accessCode";
import { generatePatientID } from "../utils/patientId";
import { generateVerificationToken } from "../utils/verificationToken";

import "../styles/ultrasoundRegistration.css";

export default function UltrasoundRegistration() {
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState([]);

  const [form, setForm] = useState({
    patient_name: "",
    patient_id: "",
    scan_number: "",

    referral_id: "",
    referral_name: "",

    scan_id: "",
    access_code: "",
    verification_code: "",

    dob: "",
    age: "",

    sex: "",
    phone: "",
    lmp: "",

    template_type: "",

    clinical_indication: "",
    referring_doctor: "",
    radiologist: "",

    priority: "Routine",

    payment_status: "Pending",
  });

  /* ==================================
      INITIALIZE PAGE
  =================================== */

  useEffect(() => {
  const load = async () => {
    await initializeForm();
    await loadReferrals();
  };

  load();
}, []);

 const initializeForm = async () => {
  const unique = Date.now().toString().slice(-8);

  const scanId = await generateScanId();

  setForm((prev) => ({
    ...prev,

    patient_id: generatePatientID(),

    scan_number: `SCAN${unique}`,

    scan_id: scanId,

    access_code: generateAccessCode(),

    verification_code: generateVerificationToken(),
  }));
};

  /* ==================================
      LOAD REFERRALS
  =================================== */

  const loadReferrals = async () => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setReferrals(data || []);
  };

  /* ==================================
      AGE CALCULATOR
  =================================== */

  const calculateAge = (dob) => {
    if (!dob) return "";

    const today = new Date();
    const birth = new Date(dob);

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff =
      today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  /* ==================================
      HANDLE INPUT
  =================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "dob") {
      setForm((prev) => ({
        ...prev,
        dob: value,
        age: calculateAge(value),
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ==================================
      TEMPLATE
  =================================== */

  const handleTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      template_type: template,
    }));
  };

  /* ==================================
      RESET FORM
  =================================== */

const resetForm = async () => {
  const unique = Date.now().toString().slice(-8);

  setForm({
    patient_name: "",

    patient_id: generatePatientID(),

    scan_number: `SCAN${unique}`,

    referral_id: "",
    referral_name: "",

    scan_id: await generateScanId(),

    access_code: generateAccessCode(),

    verification_code: generateVerificationToken(),

    dob: "",
    age: "",

    sex: "",
    phone: "",
    lmp: "",

    template_type: "",

    clinical_indication: "",

    referring_doctor: "",

    radiologist: "",

    priority: "Routine",

    payment_status: "Pending",
  });
};


  /* ==================================
      SAVE REQUEST
  =================================== */

  const saveRequest = async () => {
    if (
      !form.patient_name ||
      !form.age ||
      !form.sex ||
      !form.template_type ||
      !form.clinical_indication ||
      !form.referring_doctor
    ) {
      alert("Please complete all required fields.");
      return;
    }

   const payload = {
  ...form,

  scan_id: form.scan_id,

  test_type: form.template_type
    .replaceAll("_", " ")
    .toUpperCase(),

  report_status: "Pending",

  release_status: "Pending",

  result: {},
};

    const {
      data: ultrasound,
      error: insertError,
    } = await supabase
      .from("ultrasound_results")
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      alert(insertError.message);
      return;
    }

    if (form.referral_id) {
    const { error: invoiceError } = await supabase
  .from("referral_invoices")
  .insert([
    {
      referral_id: form.referral_id,
      referral_name: form.referral_name,
      patient_name: form.patient_name,
      scan_id: form.scan_id,
      tests: form.template_type.replaceAll("_", " ").toUpperCase(),
      total_amount: 0,
      discount_amount: 0,
      final_amount: 0,
      amount_paid: 0,
      balance: 0,
      payment_status: "Outstanding",
      payment_plan: "Monthly",
      invoice_period: new Date().toISOString().split("T")[0],
      generated_by: "System",
    },
  ]);

if (invoiceError) {
  console.log(invoiceError);
}
    }

    navigate(
  `/payment-portal?id=${ultrasound.id}&type=ultrasound`
);

   await resetForm();
  };

  return (

<div className="ultrasound-registration">

  {/* ==========================
      HEADER
  ========================== */}

  <div className="registration-header">
    <h1>Ultrasound Registration</h1>
    <p>Enterprise Radiology Request Portal</p>
  </div>

  {/* ==========================
      PATIENT INFORMATION
  ========================== */}

  <div className="registration-card">

    <h2>Patient Information</h2>

    <div className="registration-grid">

     <input
  type="text"
  name="scan_id"
  value={form.scan_id}
  placeholder="Scan ID"
  readOnly
/>

      <input
        type="text"
        name="patient_id"
        value={form.patient_id}
        placeholder="Patient ID"
        readOnly
      />

      <input
        type="text"
        name="scan_number"
        value={form.scan_number}
        placeholder="Scan Number"
        readOnly
      />

      <input
        type="text"
        name="scan_id"
        value={form.scan_id}
        placeholder="Lab Number"
        readOnly
      />

      <input
        type="date"
        name="dob"
        value={form.dob}
        onChange={handleChange}
      />

      <input
        type="text"
        name="age"
        value={form.age}
        placeholder="Age"
        readOnly
      />

      <select
        name="sex"
        value={form.sex}
        onChange={handleChange}
      >
        <option value="">
          Select Gender *
        </option>

        <option value="Male">
          Male
        </option>

        <option value="Female">
          Female
        </option>
      </select>

      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
      />

      {form.sex === "Female" && (
        <input
          type="date"
          name="lmp"
          value={form.lmp}
          onChange={handleChange}
        />
      )}

    </div>

  </div>

  {/* ==========================
      SCAN REQUEST
  ========================== */}

  <div className="registration-card">

    <h2>Scan Request</h2>

    <UltrasoundTemplateSelector
      value={form.template_type}
      onChange={handleTemplate}
    />

  </div>

  {/* ==========================
      CLINICAL INFORMATION
  ========================== */}

  <div className="registration-card">

    <h2>Clinical Information</h2>

    <div className="registration-grid">

      <div className="form-group">

        <label>Hospital / Clinic</label>

        <select
          name="referral_id"
          value={form.referral_id}
          onChange={(e) => {

            const referral = referrals.find(
              (item) =>
                String(item.id) === e.target.value
            );

            setForm((prev) => ({
              ...prev,

              referral_id: referral?.id || "",

              referral_name: referral?.name || "",
            }));

          }}
        >

          <option value="">
            Select Referral
          </option>

          {referrals.map((item) => (

            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>

          ))}

        </select>

      </div>

      <input
        type="text"
        name="referring_doctor"
        placeholder="Referring Doctor *"
        value={form.referring_doctor}
        onChange={handleChange}
      />

      <input
        type="text"
        name="radiologist"
        placeholder="Radiologist"
        value={form.radiologist}
        onChange={handleChange}
      />

      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
      >
        <option value="Routine">
          Routine
        </option>

        <option value="Urgent">
          Urgent
        </option>

        <option value="Emergency">
          Emergency
        </option>

      </select>

    </div>

    <textarea
      rows={5}
      name="clinical_indication"
      placeholder="Clinical Indication *"
      value={form.clinical_indication}
      onChange={handleChange}
    />

  </div>

  {/* ==========================
      SYSTEM INFORMATION
  ========================== */}

  <div className="registration-card">

    <h2>System Information</h2>

    <div className="registration-grid">

      <input
        type="text"
        value={form.access_code}
        placeholder="Access Code"
        readOnly
      />

      <input
        type="text"
        value={form.verification_code}
        placeholder="Verification Code"
        readOnly
      />

    </div>

  </div>

  {/* ==========================
      ACTION BUTTONS
  ========================== */}

  <div className="registration-actions">

    <button
      type="button"
      className="save-request-btn"
      onClick={saveRequest}
    >
      Create Ultrasound Request
    </button>

    <button
      type="button"
      className="reset-request-btn"
      onClick={resetForm}
    >
      Reset
    </button>

  </div>

</div>

  );

}