import "./ReferralPatientDetails.css";

export default function ReferralPatientDetails({
  formData,
  handleChange,
}) {
  return (
    <section className="referral-section">

      {/* ==========================================
          SECTION TITLE
      ========================================== */}

      <div className="section-header">
        Patient Details
      </div>

      <div className="patient-grid">

        {/* ======================================
            SURNAME
        ====================================== */}

        <div className="form-group">
          <label>
            Surname
          </label>

          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Enter surname"
          />
        </div>

        {/* ======================================
            FIRST NAME
        ====================================== */}

        <div className="form-group">
          <label>
            First Name
          </label>

          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
          />
        </div>

        {/* ======================================
            OTHER NAME
        ====================================== */}

        <div className="form-group">
          <label>
            Other Name
          </label>

          <input
            type="text"
            name="otherName"
            value={formData.otherName}
            onChange={handleChange}
            placeholder="Enter other name"
          />
        </div>

        {/* ======================================
            GENDER
        ====================================== */}

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
              Select Gender
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>
          </select>
        </div>

        {/* ======================================
            AGE
        ====================================== */}

        <div className="form-group">
          <label>
            Age
          </label>

          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Years"
          />
        </div>

        {/* ======================================
            DATE OF BIRTH
        ====================================== */}

        <div className="form-group">
          <label>
            Date of Birth
          </label>

          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
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
            name="phone"
            value={formData.phone}
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
          />
        </div>

        {/* ======================================
            HOSPITAL NUMBER
        ====================================== */}

        <div className="form-group">
          <label>
            Hospital Number
          </label>

          <input
            type="text"
            name="hospitalNumber"
            value={formData.hospitalNumber}
            onChange={handleChange}
            placeholder="Hospital Number"
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
            name="referralDate"
            value={formData.referralDate}
            onChange={handleChange}
          />
        </div>

        {/* ======================================
            URGENCY
        ====================================== */}

        <div className="form-group">
          <label>
            Priority
          </label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="">
              Select Priority
            </option>

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

      </div>

      {/* ==========================================
          ADDRESS
      ========================================== */}

      <div className="form-group full-width">

        <label>
          Residential Address
        </label>

        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          placeholder="Enter patient's residential address"
        />

      </div>

    </section>
  );
}