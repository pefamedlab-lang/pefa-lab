import "./ReferralClinicalInfo.css";

export default function ReferralClinicalInfo({
  formData,
  handleChange,
}) {

  return (

    <section className="referral-section">

      {/* ==========================================
          SECTION HEADER
      ========================================== */}

      <div className="section-header">

        Clinical Information

      </div>

      {/* ==========================================
          CHIEF COMPLAINT
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Chief Complaint

        </label>

        <textarea
          name="chiefComplaint"
          value={formData.chiefComplaint}
          onChange={handleChange}
          rows={3}
          placeholder="State the patient's chief complaint"
        />

      </div>

      {/* ==========================================
          HISTORY OF PRESENT ILLNESS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          History of Present Illness

        </label>

        <textarea
          name="historyOfPresentIllness"
          value={formData.historyOfPresentIllness}
          onChange={handleChange}
          rows={5}
          placeholder="Provide a brief clinical history"
        />

      </div>

      {/* ==========================================
          PROVISIONAL DIAGNOSIS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Provisional Diagnosis

        </label>

        <textarea
          name="clinicalDiagnosis"
          value={formData.clinicalDiagnosis}
          onChange={handleChange}
          rows={3}
          placeholder="Enter provisional diagnosis"
        />

      </div>

      {/* ==========================================
          CLINICAL FINDINGS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Clinical Findings

        </label>

        <textarea
          name="clinicalFindings"
          value={formData.clinicalFindings}
          onChange={handleChange}
          rows={4}
          placeholder="Relevant examination findings"
        />

      </div>

      {/* ==========================================
          PREVIOUS INVESTIGATIONS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Previous Investigations / Results

        </label>

        <textarea
          name="previousInvestigations"
          value={formData.previousInvestigations}
          onChange={handleChange}
          rows={4}
          placeholder="Summarize previous investigations and results"
        />

      </div>

      {/* ==========================================
          CURRENT MEDICATIONS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Current Medications

        </label>

        <textarea
          name="currentMedication"
          value={formData.currentMedication}
          onChange={handleChange}
          rows={3}
          placeholder="List current medications"
        />

      </div>

      {/* ==========================================
          ALLERGIES
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Drug / Food Allergies

        </label>

        <textarea
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          rows={3}
          placeholder="State known allergies"
        />

      </div>

      {/* ==========================================
          SPECIAL INSTRUCTIONS
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Special Instructions

        </label>

        <textarea
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleChange}
          rows={3}
          placeholder="Special handling instructions or precautions"
        />

      </div>

      {/* ==========================================
          ADDITIONAL NOTES
      ========================================== */}

      <div className="form-group full-width">

        <label>

          Additional Notes

        </label>

        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleChange}
          rows={5}
          placeholder="Any additional information"
        />

      </div>

    </section>

  );

}