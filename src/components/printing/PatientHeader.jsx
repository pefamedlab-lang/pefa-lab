/* ==========================================================
   PEFA ENTERPRISE PATIENT HEADER
   ----------------------------------------------------------
   SINGLE COMPACT 4-ROW REPORT HEADER

   ROW 1
   Patient Name | Lab No | Patient ID

   ROW 2
   Status | Sex | Age

   ROW 3
   Branch | Referral Hospital | Referral Doctor

   ROW 4
   Register Date/Time | Sample Collection Date/Time | Report Date/Time

   Clinical History
   Full-width compact line below the 4-row grid.

   This component is shared by:
   - Result Records
   - Patient Report Portal
   - Print / PDF reports
========================================================== */

export default function PatientHeader({
  patient = {},
  results = [],
}) {
  /* ======================================================
     CURRENT REPORT
  ====================================================== */

  const report = results?.[0] || {};

  /* ======================================================
     FIRST AVAILABLE VALUE
  ====================================================== */

  const firstValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return "-";
  };

  /* ======================================================
     DATE FORMATTER
  ====================================================== */

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ======================================================
     AGE CALCULATION
     ------------------------------------------------------
     Supports:
       age
       patient_age
       DOB / date_of_birth
  ====================================================== */

  const calculateAgeFromDob = (dob) => {
    if (!dob) {
      return null;
    }

    const birthDate = new Date(dob);

    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const month =
      today.getMonth() -
      birthDate.getMonth();

    if (
      month < 0 ||
      (
        month === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {
      age--;
    }

    return age >= 0
      ? `${age} years`
      : null;
  };

  /* ======================================================
     PATIENT NAME
  ====================================================== */

  const patientName = firstValue(
    patient?.full_name,
    patient?.patient_name,
    patient?.name,
    report?.patient_name,
    report?.full_name
  );

  /* ======================================================
     LAB NUMBER
  ====================================================== */

  const labNumber = firstValue(
    patient?.lab_number,
    patient?.lab_no,
    report?.lab_number,
    report?.lab_no
  );

  /* ======================================================
     PATIENT ID
  ====================================================== */

  const patientId = firstValue(
    patient?.patient_id,
    patient?.patientId,
    report?.patient_id,
    report?.patientId
  );

  /* ======================================================
     SEX
  ====================================================== */

  const sex = firstValue(
    patient?.sex,
    patient?.gender,
    report?.sex,
    report?.gender
  );

  /* ======================================================
     AGE
  ====================================================== */

  const age = firstValue(
    patient?.age,
    patient?.patient_age,
    report?.age,
    report?.patient_age,
    calculateAgeFromDob(
      patient?.date_of_birth ||
      patient?.dob ||
      report?.date_of_birth ||
      report?.dob
    )
  );

  /* ======================================================
     STATUS
  ====================================================== */

  const status = firstValue(
    patient?.status,
    report?.status
  );

  /* ======================================================
     BRANCH
  ====================================================== */

  const branch = firstValue(
    patient?.branch,
    patient?.branch_name,
    report?.branch,
    report?.branch_name
  );

  /* ======================================================
     REFERRAL HOSPITAL
  ====================================================== */

  const referralHospital = firstValue(
    patient?.referral_hospital,
    patient?.referral_name,
    patient?.hospital,
    patient?.hospital_name,
    patient?.clinic,
    report?.referral_hospital,
    report?.referral_name,
    report?.hospital,
    report?.hospital_name
  );

  /* ======================================================
     REFERRAL DOCTOR
  ====================================================== */

  const referralDoctor = firstValue(
    patient?.referral_doctor,
    patient?.referring_doctor,
    patient?.referringDoctor,
    report?.referral_doctor,
    report?.referring_doctor
  );

  /* ======================================================
     REGISTER DATE / TIME
  ====================================================== */

  const registerDateTime = formatDateTime(
    firstValue(
      patient?.register_date_time,
      patient?.registration_date_time,
      patient?.created_at,
      report?.register_date_time,
      report?.registration_date_time
    )
  );

  /* ======================================================
     SAMPLE COLLECTION DATE / TIME
  ====================================================== */

  const collectionDateTime = formatDateTime(
    firstValue(
      patient?.sample_collection_date_time,
      patient?.specimen_collection_time,
      patient?.collection_datetime,
      patient?.collection_date_time,
      patient?.collection_date,
      report?.sample_collection_date_time,
      report?.collection_datetime,
      report?.collection_date_time,
      report?.collection_date
    )
  );

  /* ======================================================
     REPORT DATE / TIME
  ====================================================== */

  const reportDateTime = formatDateTime(
    firstValue(
      patient?.report_date_time,
      patient?.report_date,
      report?.report_date_time,
      report?.reported_at,
      report?.released_at,
      report?.authorized_at,
      report?.updated_at,
      report?.created_at
    )
  );

  /* ======================================================
     CLINICAL HISTORY
  ====================================================== */

  const clinicalHistory = firstValue(
    patient?.clinical_history,
    patient?.clinicalHistory,
    report?.clinical_history,
    report?.clinicalHistory
  );

  /* ======================================================
     FIELD COMPONENT
     ------------------------------------------------------
     Deliberately lightweight.
     No individual card.
  ====================================================== */

  const Field = ({
    label,
    value,
    className = "",
  }) => (
    <div
      className={`patient-header-field ${className}`.trim()}
    >
      <span className="patient-header-label">
        {label}
      </span>

      <span className="patient-header-value">
        {value}
      </span>
    </div>
  );

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <section className="patient-header">

      {/* ==================================================
          ROW 1
      ================================================== */}

      <div className="patient-header-row">

        <Field
          label="Patient Name"
          value={patientName}
          className="patient-name-field"
        />

        <Field
          label="Lab No"
          value={labNumber}
        />

        <Field
          label="Patient ID"
          value={patientId}
        />

      </div>

      {/* ==================================================
          ROW 2
      ================================================== */}

      <div className="patient-header-row">

        <Field
          label="Status"
          value={status}
          className="status-field"
        />

        <Field
          label="Sex"
          value={sex}
        />

        <Field
          label="Age"
          value={age}
        />

      </div>

      {/* ==================================================
          ROW 3
      ================================================== */}

      <div className="patient-header-row">

        <Field
          label="Branch"
          value={branch}
        />

        <Field
          label="Referral Hospital"
          value={referralHospital}
        />

        <Field
          label="Referral Doctor"
          value={referralDoctor}
        />

      </div>

      {/* ==================================================
          ROW 4
      ================================================== */}

      <div className="patient-header-row">

        <Field
          label="Register Date/Time"
          value={registerDateTime}
        />

        <Field
          label="Sample Collection Date/Time"
          value={collectionDateTime}
        />

        <Field
          label="Report Date/Time"
          value={reportDateTime}
        />

      </div>

      {/* ==================================================
          CLINICAL HISTORY
          --------------------------------------------------
          Not counted as another patient-information row.
      ================================================== */}

      <div className="patient-clinical-history">

        <span className="patient-header-label">
          Clinical History
        </span>

        <span className="patient-header-value patient-clinical-history-value">
          {clinicalHistory}
        </span>

      </div>

    </section>
  );
}