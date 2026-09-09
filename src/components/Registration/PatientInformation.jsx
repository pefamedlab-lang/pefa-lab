import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { supabase } from "../../supabase";

export default function PatientInformation({
  patient = {},
  setPatient,
  mode = "Laboratory",
}) {
  const [referrals, setReferrals] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [referralError, setReferralError] = useState("");

  /* =========================================================
     LOAD ACTIVE REFERRALS
  ========================================================= */

  const loadReferrals = async () => {
    setLoadingReferrals(true);
    setReferralError("");

    try {
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          id,
          referral_code,
          name,
          type,
          contact_person,
          phone,
          email,
          address,
          commission_rate,
          credit_limit,
          status
        `)
        .eq("status", "Active")
        .order("name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setReferrals(data || []);
    } catch (error) {
      console.error(
        "Error loading referrals:",
        error
      );

      setReferralError(
        error?.message ||
          "Unable to load referrals."
      );

      setReferrals([]);
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  /* =========================================================
     GENERIC INPUT
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPatient((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     REFERRAL
  ========================================================= */

  const handleReferralChange = (event) => {
    const referralId =
      String(event.target.value || "").trim();

    if (!referralId) {
      setPatient((previous) => ({
        ...previous,

        referral_id: "",
        referral_name: "",
        referral_code: "",
        referral_type: "",
        referral_contact: "",
        referral_phone: "",
        referral_commission_rate: 0,
      }));

      return;
    }

    const selectedReferral = referrals.find(
      (referral) =>
        String(referral.id) === referralId
    );

    if (!selectedReferral) {
      console.warn(
        "Referral not found:",
        referralId
      );

      return;
    }

    setPatient((previous) => ({
      ...previous,

      referral_id:
        String(selectedReferral.id),

      referral_name:
        selectedReferral.name || "",

      referral_code:
        selectedReferral.referral_code || "",

      referral_type:
        selectedReferral.type || "",

      referral_contact:
        selectedReferral.contact_person || "",

      referral_phone:
        selectedReferral.phone || "",

      referral_commission_rate:
        Number(
          selectedReferral.commission_rate || 0
        ),
    }));
  };

  /* =========================================================
     DOB / AGE
  ========================================================= */

  const handleDobChange = (event) => {
    const dob = event.target.value;

    let age = "";

    if (dob) {
      const birthDate =
        new Date(`${dob}T00:00:00`);

      const today = new Date();

      age =
        today.getFullYear() -
        birthDate.getFullYear();

      const monthDifference =
        today.getMonth() -
        birthDate.getMonth();

      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() <
            birthDate.getDate()
        )
      ) {
        age -= 1;
      }

      if (age < 0) {
        age = "";
      }
    }

    setPatient((previous) => ({
      ...previous,
      dob,
      age,
    }));
  };

  /* =========================================================
     SELECTED REFERRAL
  ========================================================= */

  const selectedReferralId =
    String(patient?.referral_id || "");

  /*
   * Normally the selected referral will already exist in
   * `referrals`.
   *
   * The fallback option protects the UI if the parent already
   * contains a referral that isn't in the current query result.
   */

  const referralExists = referrals.some(
    (referral) =>
      String(referral.id) ===
      selectedReferralId
  );

  const referralOptions = [...referrals];

  if (
    selectedReferralId &&
    !referralExists &&
    patient?.referral_name
  ) {
    referralOptions.unshift({
      id: selectedReferralId,
      referral_code:
        patient.referral_code || "",
      name:
        patient.referral_name || "",
      type:
        patient.referral_type || "",
      contact_person:
        patient.referral_contact || "",
      phone:
        patient.referral_phone || "",
      commission_rate:
        patient.referral_commission_rate || 0,
      status: "Active",
    });
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="registration-card">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="section-title">
        <h2>Patient Information</h2>
      </div>

      <div className="registration-grid">

        {/* =================================================
            PATIENT NAME
        ================================================= */}

        <div className="form-group">
          <label>Patient Name</label>

          <input
            type="text"
            name="patient_name"
            value={
              patient?.patient_name || ""
            }
            onChange={handleChange}
            placeholder="Patient Full Name"
            autoComplete="off"
          />
        </div>

        {/* =================================================
            PATIENT ID
        ================================================= */}

        <div className="form-group">
          <label>Patient ID</label>

          <input
            type="text"
            name="patient_id"
            value={
              patient?.patient_id || ""
            }
            onChange={handleChange}
            placeholder="Patient ID"
            autoComplete="off"
          />
        </div>

        {/* =================================================
            DOB
        ================================================= */}

        <div className="form-group">
          <label>Date of Birth</label>

          <input
            type="date"
            name="dob"
            value={
              patient?.dob || ""
            }
            onChange={handleDobChange}
          />
        </div>

        {/* =================================================
            AGE
        ================================================= */}

        <div className="form-group">
          <label>Age</label>

          <input
            type="number"
            value={
              patient?.age ?? ""
            }
            readOnly
            placeholder="Age"
          />
        </div>

        {/* =================================================
            SEX
        ================================================= */}

        <div className="form-group">
          <label>Sex</label>

          <select
            name="sex"
            value={
              patient?.sex || ""
            }
            onChange={handleChange}
          >
            <option value="">
              Select Sex
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>
          </select>
        </div>

        {/* =================================================
            BRANCH
        ================================================= */}

        <div className="form-group">
          <label>Registration Branch</label>

          <select
            name="branch"
            value={patient?.branch || ""}
            onChange={handleChange}
          >
            <option value="">Select Branch</option>
            <option value="Head Office">Head Office</option>
            <option value="Mowe Branch">Mowe Branch</option>
            <option value="Orimerunmu Branch">Orimerunmu Branch</option>
            <option value="Home">Home</option>
          </select>
        </div>

        {/* =================================================
            BRANCH NUMBER PREVIEW
            Populated by RegistrationPortal after a branch is selected.
        ================================================= */}

        <div className="form-group">
          <label>Branch Number</label>

          <input
            type="text"
            value={patient?.branch_number || ""}
            readOnly
            placeholder="Select a branch"
          />
        </div>

        {/* =================================================
            PHONE
        ================================================= */}

        <div className="form-group">
          <label>Phone Number</label>

          <input
            type="tel"
            name="phone"
            value={
              patient?.phone || ""
            }
            onChange={handleChange}
            placeholder="Phone Number"
            autoComplete="tel"
          />
        </div>

        {/* =================================================
            ADDRESS
        ================================================= */}

        <div
          className="form-group"
          style={{
            gridColumn: "1 / -1",
          }}
        >
          <label>Address</label>

          <input
            type="text"
            name="address"
            value={
              patient?.address || ""
            }
            onChange={handleChange}
            placeholder="Patient Address"
            autoComplete="street-address"
          />
        </div>

        {/* =================================================
            REFERRAL
        ================================================= */}

        <div className="form-group">
          <label>Select Referral</label>

          <select
            name="referral_id"
            value={selectedReferralId}
            onChange={handleReferralChange}
            disabled={
              loadingReferrals &&
              referralOptions.length === 0
            }
          >
            <option value="">
              {loadingReferrals
                ? "Loading referrals..."
                : referralOptions.length === 0
                  ? "No referrals available"
                  : "Select Referral"}
            </option>

            {referralOptions.map(
              (referral) => (
                <option
                  key={String(referral.id)}
                  value={String(referral.id)}
                >
                  {referral.name}
                  {referral.referral_code
                    ? ` — ${referral.referral_code}`
                    : ""}
                </option>
              )
            )}
          </select>

          {/* Selected referral summary */}

          {patient?.referral_id &&
            patient?.referral_name && (
              <div className="selected-referral-display">
                <strong>
                  {patient.referral_name}
                </strong>

                {patient.referral_code && (
                  <span>
                    {patient.referral_code}
                  </span>
                )}
              </div>
            )}

          {referralError && (
            <div className="referral-error">
              <span>
                {referralError}
              </span>

              <button
                type="button"
                onClick={loadReferrals}
                disabled={loadingReferrals}
                aria-label="Reload referrals"
              >
                <RefreshCw
                  size={15}
                  className={
                    loadingReferrals
                      ? "spin"
                      : ""
                  }
                />
              </button>
            </div>
          )}
        </div>

        {/* =================================================
            REFERRING DOCTOR
        ================================================= */}

        <div className="form-group">
          <label>Referring Doctor</label>

          <input
            type="text"
            name="referring_doctor"
            value={
              patient?.referring_doctor || ""
            }
            onChange={handleChange}
            placeholder="Referring Doctor"
            autoComplete="off"
          />
        </div>

        {/* =================================================
            CLINICAL HISTORY
        ================================================= */}

        <div
          className="form-group"
          style={{
            gridColumn: "1 / -1",
          }}
        >
          <label>Clinical History</label>

          <textarea
            rows={4}
            name="clinical_history"
            value={
              patient?.clinical_history || ""
            }
            onChange={handleChange}
            placeholder="Clinical History"
          />
        </div>

        {/* =================================================
            LMP
        ================================================= */}

        {(mode === "Ultrasound" ||
          mode === "Both") && (
          <div className="form-group">
            <label>LMP</label>

            <input
              type="date"
              name="lmp"
              value={
                patient?.lmp || ""
              }
              onChange={handleChange}
            />
          </div>
        )}

      </div>
    </div>
  );
}