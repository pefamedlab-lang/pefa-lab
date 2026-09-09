import {
  CalendarDays,
  ClipboardList,
  Hash,
  User,
} from "lucide-react";

/* ==========================================================
   PATIENT CARD
   ----------------------------------------------------------
   Responsibilities:
   - Display patient information supplied by ResultDashboard
   - No database calls
   - No patient searching
   - No result logic
   - No test logic
========================================================== */

export default function PatientCard({
  patient = null,
}) {
  /* ========================================================
     EMPTY STATE
  ======================================================== */

  if (!patient) {
    return null;
  }

  /* ========================================================
     HELPERS
  ======================================================== */

  const displayValue = (
    value,
    fallback = "—"
  ) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    ) {
      return fallback;
    }

    return String(value).trim();
  };

  const getPatientName = () => {
    return displayValue(
      patient?.full_name ||
        patient?.patient_name ||
        patient?.name,
      "Unknown Patient"
    );
  };

  const getLabNumber = () => {
    return displayValue(
      patient?.lab_number ||
        patient?.labNumber,
      "—"
    );
  };

  const getPatientId = () => {
    return displayValue(
      patient?.patient_id ||
        patient?.patientId ||
        patient?.pat_number ||
        patient?.patNumber,
      "—"
    );
  };

  const getRegistrationNumber = () => {
    return displayValue(
      patient?.registration_number ||
        patient?.registrationNumber ||
        patient?.reg_no ||
        patient?.regNo,
      "—"
    );
  };

  const getAge = () => {
    if (
      patient?.age !== null &&
      patient?.age !== undefined &&
      String(patient.age).trim() !== ""
    ) {
      return patient.age;
    }

    return "—";
  };

  const getSex = () => {
    return displayValue(
      patient?.sex ||
        patient?.gender,
      "—"
    );
  };

  const getPhone = () => {
    return displayValue(
      patient?.phone ||
        patient?.phone_number ||
        patient?.phoneNumber ||
        patient?.mobile,
      "—"
    );
  };

  const getDateOfBirth = () => {
    return displayValue(
      patient?.date_of_birth ||
        patient?.dateOfBirth ||
        patient?.dob,
      "—"
    );
  };

  const getReferringDoctor = () => {
    return displayValue(
      patient?.referring_doctor ||
        patient?.referringDoctor ||
        patient?.doctor ||
        patient?.physician,
      "—"
    );
  };

  const getReferringHospital = () => {
    return displayValue(
      patient?.referral_name ||
        patient?.referring_hospital ||
        patient?.referringHospital ||
        patient?.hospital,
      "—"
    );
  };

  /* ========================================================
     INFO ITEM
  ======================================================== */

  const InfoItem = ({
    icon,
    label,
    value,
    emphasis = false,
  }) => (
    <div className="patient-info-item">

      <div className="patient-info-icon">
        {icon}
      </div>

      <div className="patient-info-content">

        <span className="patient-info-label">
          {label}
        </span>

        <span
          className={
            emphasis
              ? "patient-info-value emphasis"
              : "patient-info-value"
          }
        >
          {value}
        </span>

      </div>

    </div>
  );

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <section className="dashboard-card patient-card">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="patient-card-header">

        <div className="patient-card-heading">

          <div className="patient-card-avatar">
            <User size={23} />
          </div>

          <div>
            <h2>
              Patient Information
            </h2>

            <p>
              Patient record loaded successfully.
            </p>
          </div>

        </div>

        <div className="patient-card-status">
          <span className="patient-status-dot" />
          Patient Loaded
        </div>

      </div>

      {/* ==================================================
          PATIENT NAME
      ================================================== */}

      <div className="patient-primary">

        <div className="patient-primary-icon">
          <User size={26} />
        </div>

        <div>

          <span className="patient-primary-label">
            Patient Name
          </span>

          <h3>
            {getPatientName()}
          </h3>

        </div>

      </div>

      {/* ==================================================
          INFORMATION GRID
      ================================================== */}

      <div className="patient-info-grid">

        <InfoItem
          icon={
            <Hash size={17} />
          }
          label="Lab Number"
          value={getLabNumber()}
          emphasis
        />

        <InfoItem
          icon={
            <ClipboardList size={17} />
          }
          label="Registration Number"
          value={getRegistrationNumber()}
        />

        <InfoItem
          icon={
            <Hash size={17} />
          }
          label="Patient ID"
          value={getPatientId()}
        />

        <InfoItem
          icon={
            <User size={17} />
          }
          label="Age"
          value={getAge()}
        />

        <InfoItem
          icon={
            <User size={17} />
          }
          label="Sex"
          value={getSex()}
        />

        <InfoItem
          icon={
            <CalendarDays size={17} />
          }
          label="Date of Birth"
          value={getDateOfBirth()}
        />

        <InfoItem
          icon={
            <Hash size={17} />
          }
          label="Phone"
          value={getPhone()}
        />

        <InfoItem
          icon={
            <ClipboardList size={17} />
          }
          label="Referring Doctor"
          value={getReferringDoctor()}
        />

        <InfoItem
          icon={
            <ClipboardList size={17} />
          }
          label="Referring Facility"
          value={getReferringHospital()}
        />

      </div>

    </section>
  );
}