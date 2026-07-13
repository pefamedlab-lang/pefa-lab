import "./ReferralSignature.css";

export default function ReferralSignature({
  formData,
  handleChange,
}) {

  return (

    <section className="referral-section">

      {/* ==========================================
          SECTION HEADER
      ========================================== */}

      <div className="section-header">

        Authorization & Signatures

      </div>


      <div className="signature-grid">

        {/* ======================================
            REFERRING DOCTOR
        ====================================== */}

        <div className="form-group">

          <label>

            Referring Doctor

          </label>

          <input
            type="text"
            name="referringDoctor"
            value={formData.referringDoctor}
            onChange={handleChange}
            placeholder="Doctor's Full Name"
          />

        </div>


        {/* ======================================
            DESIGNATION
        ====================================== */}

        <div className="form-group">

          <label>

            Designation

          </label>

          <input
            type="text"
            name="doctorDesignation"
            value={formData.doctorDesignation}
            onChange={handleChange}
            placeholder="Consultant, Medical Officer..."
          />

        </div>


        {/* ======================================
            MDCN NUMBER
        ====================================== */}

        <div className="form-group">

          <label>

            MDCN Licence No.

          </label>

          <input
            type="text"
            name="doctorLicence"
            value={formData.doctorLicence}
            onChange={handleChange}
            placeholder="Licence Number"
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
            name="signatureDate"
            value={formData.signatureDate}
            onChange={handleChange}
          />

        </div>

      </div>


      {/* ==========================================
          SIGNATURES
      ========================================== */}

      <div className="signature-row">

        <div className="signature-box">

          <label>

            Doctor's Signature

          </label>

          <div className="signature-line"></div>

        </div>


        <div className="signature-box">

          <label>

            Hospital Stamp

          </label>

          <div className="signature-line"></div>

        </div>

      </div>


      {/* ==========================================
          PEFA USE ONLY
      ========================================== */}

      <div className="section-header">

        For PEFA Medical Diagnostic Services Use Only

      </div>


      <div className="signature-grid">

        <div className="form-group">

          <label>

            Received By

          </label>

          <input
            type="text"
            name="receivedBy"
            value={formData.receivedBy}
            onChange={handleChange}
            placeholder="Receiving Staff"
          />

        </div>


        <div className="form-group">

          <label>

            Date Received

          </label>

          <input
            type="date"
            name="receivedDate"
            value={formData.receivedDate}
            onChange={handleChange}
          />

        </div>


        <div className="form-group">

          <label>

            Time Received

          </label>

          <input
            type="time"
            name="receivedTime"
            value={formData.receivedTime}
            onChange={handleChange}
          />

        </div>


        <div className="form-group">

          <label>

            Laboratory Number

          </label>

          <input
            type="text"
            name="laboratoryNumber"
            value={formData.laboratoryNumber}
            onChange={handleChange}
            placeholder="Lab Number"
          />

        </div>

      </div>


      {/* ==========================================
          SPECIMEN INFORMATION
      ========================================== */}

      <div className="section-header">

        Specimen Information

      </div>


      <div className="signature-grid">

        <div className="form-group">

          <label>

            Specimen Type

          </label>

          <select
            name="specimenType"
            value={formData.specimenType}
            onChange={handleChange}
          >

            <option value="">
              Select
            </option>

            <option>
              Blood
            </option>

            <option>
              Urine
            </option>

            <option>
              Stool
            </option>

            <option>
              Semen
            </option>

            <option>
              Sputum
            </option>

            <option>
              Swab
            </option>

            <option>
              Tissue
            </option>

            <option>
              Other
            </option>

          </select>

        </div>


        <div className="form-group">

          <label>

            Date Collected

          </label>

          <input
            type="date"
            name="collectionDate"
            value={formData.collectionDate}
            onChange={handleChange}
          />

        </div>


        <div className="form-group">

          <label>

            Time Collected

          </label>

          <input
            type="time"
            name="collectionTime"
            value={formData.collectionTime}
            onChange={handleChange}
          />

        </div>


        <div className="form-group">

          <label>

            Collected By

          </label>

          <input
            type="text"
            name="collectedBy"
            value={formData.collectedBy}
            onChange={handleChange}
            placeholder="Staff Name"
          />

        </div>

      </div>


      {/* ==========================================
          REMARKS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Laboratory Remarks

        </label>

        <textarea
          name="laboratoryRemarks"
          value={formData.laboratoryRemarks}
          onChange={handleChange}
          rows={4}
          placeholder="Additional laboratory remarks..."
        />

      </div>

    </section>

  );

}