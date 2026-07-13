import "./ReferralDoctorDetails.css";

export default function ReferralDoctorDetails({
  formData,
  handleChange,
}) {

  return (

    <section className="referral-section">

      {/* ==========================================
          SECTION HEADER
      ========================================== */}

      <div className="section-header">

        Referring Doctor / Hospital Details

      </div>


      <div className="patient-grid">

        {/* ======================================
            DOCTOR NAME
        ====================================== */}

        <div className="form-group">

          <label>

            Doctor's Name

          </label>

          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
            placeholder="Dr. John Doe"
          />

        </div>


        {/* ======================================
            SPECIALIZATION
        ====================================== */}

        <div className="form-group">

          <label>

            Specialty

          </label>

          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="Consultant Physician"
          />

        </div>


        {/* ======================================
            HOSPITAL
        ====================================== */}

        <div className="form-group">

          <label>

            Hospital / Clinic

          </label>

          <input
            type="text"
            name="hospital"
            value={formData.hospital}
            onChange={handleChange}
            placeholder="Hospital or Clinic Name"
          />

        </div>


        {/* ======================================
            DEPARTMENT
        ====================================== */}

        <div className="form-group">

          <label>

            Department

          </label>

          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Medical Department"
          />

        </div>


        {/* ======================================
            PHONE
        ====================================== */}

        <div className="form-group">

          <label>

            Phone Number

          </label>

          <input
            type="tel"
            name="doctorPhone"
            value={formData.doctorPhone}
            onChange={handleChange}
            placeholder="+234..."
          />

        </div>


        {/* ======================================
            EMAIL
        ====================================== */}

        <div className="form-group">

          <label>

            Email Address

          </label>

          <input
            type="email"
            name="doctorEmail"
            value={formData.doctorEmail}
            onChange={handleChange}
            placeholder="doctor@email.com"
          />

        </div>


        {/* ======================================
            MEDICAL LICENSE
        ====================================== */}

        <div className="form-group">

          <label>

            Medical Licence No.

          </label>

          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="MDCN Licence Number"
          />

        </div>


        {/* ======================================
            REFERRAL DATE
        ====================================== */}

        <div className="form-group">

          <label>

            Referral Date

          </label>

          <input
            type="date"
            name="doctorReferralDate"
            value={formData.doctorReferralDate}
            onChange={handleChange}
          />

        </div>

      </div>


      {/* ==========================================
          HOSPITAL ADDRESS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Hospital / Clinic Address

        </label>

        <textarea
          name="hospitalAddress"
          value={formData.hospitalAddress}
          onChange={handleChange}
          rows={3}
          placeholder="Hospital or Clinic Address"
        />

      </div>


      {/* ==========================================
          DOCTOR'S DIAGNOSIS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Provisional Diagnosis

        </label>

        <textarea
          name="provisionalDiagnosis"
          value={formData.provisionalDiagnosis}
          onChange={handleChange}
          rows={3}
          placeholder="Enter provisional diagnosis"
        />

      </div>


      {/* ==========================================
          REFERRAL REASON
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Reason For Referral

        </label>

        <textarea
          name="referralReason"
          value={formData.referralReason}
          onChange={handleChange}
          rows={4}
          placeholder="State why the patient is being referred to PEFA Medical Diagnostic Services"
        />

      </div>

    </section>

  );

}