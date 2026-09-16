import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import "../styles/testRequest.css";

const INITIAL_FORM = {
  requestor_type: "Patient",
  requestor_name: "",
  requestor_phone: "",
  requestor_email: "",

  patient_name: "",
  patient_dob: "",
  patient_age: "",
  patient_sex: "",
  patient_phone: "",
  patient_address: "",

  referral_id: "",
  referral_name: "",
  referring_doctor: "",
  referring_doctor_phone: "",
  referring_doctor_email: "",

  presenting_complaint: "",
  clinical_history: "",
  provisional_diagnosis: "",
  relevant_medical_history: "",
  current_medications: "",

  pregnancy_status: "",
  lmp: "",

  priority: "Routine",
  service_type: "Laboratory",

  specimen_collected: "",
  specimen_type: "",
  fasting_status: "",
  last_meal_time: "",

  laboratory_clinical_notes: "",

  ultrasound_clinical_indication: "",
  scan_type: "",

  additional_notes: "",
};

const SCAN_TYPES = [
  "Abdominal Ultrasound",
  "Pelvic Ultrasound",
  "Obstetric Ultrasound",
  "Transvaginal Ultrasound",
  "Breast Ultrasound",
  "Thyroid Ultrasound",
  "Prostate Ultrasound",
  "Renal Ultrasound",
  "Hepatobiliary Ultrasound",
  "Scrotal Ultrasound",
  "Musculoskeletal Ultrasound",
  "Other",
];

function calculateAge(dob) {
  if (!dob) return "";

  const birthDate = new Date(`${dob}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : "";
}

function Required() {
  return <span className="required-mark">*</span>;
}

export default function TestRequest() {
  const [form, setForm] = useState(INITIAL_FORM);

  const [referrals, setReferrals] = useState([]);
  const [tests, setTests] = useState([]);

  const [selectedTests, setSelectedTests] = useState([]);

  const [scanRows, setScanRows] = useState([
    {
      scan_type: "",
      quantity: 1,
    },
  ]);

  const [searchTest, setSearchTest] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  /* ============================================================
     LOAD PUBLIC CATALOGUES

     IMPORTANT:
     - Test names/codes come from the public RPC.
     - Prices are intentionally NOT loaded or submitted here.
     - Authoritative pricing is resolved later by the staff-side
       Registration Portal from master_tests.
     ============================================================ */

  useEffect(() => {
    loadCatalogue();
  }, []);

  /* ============================================================
     AUTO-CALCULATE AGE
     ============================================================ */

  useEffect(() => {
    if (!form.patient_dob) {
      setForm((prev) => ({
        ...prev,
        patient_age: "",
      }));

      return;
    }

    const age = calculateAge(form.patient_dob);

    setForm((prev) => ({
      ...prev,
      patient_age: age,
    }));
  }, [form.patient_dob]);

  /* ============================================================
     LOAD REFERRALS + TESTS
     ============================================================ */

  const loadCatalogue = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        referralResponse,
        testResponse,
      ] = await Promise.all([
        supabase.rpc(
          "get_public_test_request_referrals"
        ),
        supabase.rpc(
          "get_public_test_request_tests"
        ),
      ]);

      if (referralResponse.error) {
        throw referralResponse.error;
      }

      if (testResponse.error) {
        throw testResponse.error;
      }

      setReferrals(
        referralResponse.data || []
      );

      setTests(
        testResponse.data || []
      );
    } catch (err) {
      console.error(
        "Test Request catalogue error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load the test request form. Please refresh and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     SEARCH RESULTS
     IMPORTANT:
     NO TESTS ARE DISPLAYED UNTIL USER SEARCHES.
     ============================================================ */

  const filteredTests = useMemo(() => {
    const search = searchTest
      .trim()
      .toLowerCase();

    if (!search) {
      return [];
    }

    return tests
      .filter((test) => {
        const testName =
          test.test_name?.toLowerCase() || "";

        const testCode =
          test.test_code?.toLowerCase() || "";

        const department =
          test.department?.toLowerCase() || "";

        return (
          testName.includes(search) ||
          testCode.includes(search) ||
          department.includes(search)
        );
      })
      .slice(0, 50);
  }, [tests, searchTest]);

  /* ============================================================
     SERVICE CONDITIONS
     ============================================================ */

  const isFemale =
    form.patient_sex === "Female";

  const isPregnancyRelated =
    form.pregnancy_status === "Pregnant" ||
    form.pregnancy_status ===
      "Possibly Pregnant";

  const needsLaboratory =
    form.service_type === "Laboratory" ||
    form.service_type === "Both";

  const needsUltrasound =
    form.service_type === "Ultrasound" ||
    form.service_type === "Both";

  /* ============================================================
     UPDATE FORM
     ============================================================ */

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ============================================================
     REFERRAL SELECTION
     ============================================================ */

  const handleReferralChange = (value) => {
    const referral = referrals.find(
      (item) =>
        String(item.id) === String(value)
    );

    setForm((prev) => ({
      ...prev,
      referral_id: value,
      referral_name:
        referral?.name || "",
    }));
  };

  /* ============================================================
     TEST SELECTION
     ============================================================ */

  const toggleTest = (test) => {
    const testId = Number(test.id);

    const exists = selectedTests.some(
      (item) =>
        Number(item.id) === testId
    );

    if (exists) {
      setSelectedTests((prev) =>
        prev.filter(
          (item) =>
            Number(item.id) !== testId
        )
      );

      return;
    }

    setSelectedTests((prev) => [
      ...prev,
      {
        id: testId,
        test_name: test.test_name,
        test_code:
          test.test_code || "",
        department:
          test.department || "Other",
        test_type:
          test.test_type || "",
        result_type:
          test.result_type || "",
        is_panel:
          Boolean(test.is_panel),
        quantity: 1,
      },
    ]);

    /*
     * Keep search active so the user can
     * immediately search for another test.
     */
  };

  const isTestSelected = (id) =>
    selectedTests.some(
      (item) =>
        Number(item.id) === Number(id)
    );

  /* ============================================================
     REMOVE SELECTED TEST
     ============================================================ */

  const removeSelectedTest = (id) => {
    setSelectedTests((prev) =>
      prev.filter(
        (item) =>
          Number(item.id) !== Number(id)
      )
    );
  };

  /* ============================================================
     ULTRASOUND ROWS
     ============================================================ */

  const updateScanRow = (
    index,
    field,
    value
  ) => {
    setScanRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const addScanRow = () => {
    setScanRows((prev) => [
      ...prev,
      {
        scan_type: "",
        quantity: 1,
      },
    ]);
  };

  const removeScanRow = (index) => {
    setScanRows((prev) =>
      prev.filter(
        (_, rowIndex) =>
          rowIndex !== index
      )
    );
  };

  /* ============================================================
     FORM VALIDATION
     ============================================================ */

  const validateForm = () => {
    const requiredFields = [
      [
        "requestor_name",
        "Requestor name",
      ],
      [
        "requestor_phone",
        "Requestor phone",
      ],
      [
        "patient_name",
        "Patient full name",
      ],
      [
        "patient_dob",
        "Date of birth",
      ],
      [
        "patient_sex",
        "Sex",
      ],
      [
        "patient_phone",
        "Patient phone",
      ],
      [
        "patient_address",
        "Patient address",
      ],
      [
        "referral_id",
        "Referral hospital",
      ],
      [
        "referring_doctor",
        "Referring doctor",
      ],
      [
        "referring_doctor_phone",
        "Referring doctor phone",
      ],
      [
        "presenting_complaint",
        "Presenting complaint",
      ],
      [
        "clinical_history",
        "Clinical history",
      ],
      [
        "provisional_diagnosis",
        "Provisional/clinical diagnosis",
      ],
      [
        "relevant_medical_history",
        "Relevant medical history",
      ],
      [
        "current_medications",
        "Current medication/treatment",
      ],
      [
        "priority",
        "Request priority",
      ],
      [
        "service_type",
        "Service type",
      ],
    ];

    for (
      const [field, label]
      of requiredFields
    ) {
      if (
        !String(form[field] || "")
          .trim()
      ) {
        return `${label} is required.`;
      }
    }

    /* Female pregnancy information */

    if (
      isFemale &&
      !form.pregnancy_status
    ) {
      return (
        "Pregnancy status is required for female patients."
      );
    }

    if (
      isFemale &&
      isPregnancyRelated &&
      !form.lmp
    ) {
      return (
        "LMP is required for pregnant or possibly pregnant patients."
      );
    }

    /* Laboratory */

    if (needsLaboratory) {
      if (!selectedTests.length) {
        return (
          "Please search for and select at least one laboratory test."
        );
      }

      const invalidTest = selectedTests.find(
        (test) =>
          !Number.isInteger(Number(test?.id)) ||
          Number(test?.id) <= 0
      );

      if (invalidTest) {
        return (
          "One or more selected laboratory tests could not be identified. Please remove them and select the tests again."
        );
      }

      if (!form.specimen_collected) {
        return (
          "Please indicate whether the specimen has already been collected."
        );
      }

      if (
        form.specimen_collected ===
          "Yes" &&
        !form.specimen_type.trim()
      ) {
        return (
          "Please specify the specimen type."
        );
      }

      if (!form.fasting_status) {
        return (
          "Please indicate the patient's fasting status."
        );
      }

      if (
        (
          form.fasting_status ===
            "Fasting" ||
          form.fasting_status ===
            "Non-fasting"
        ) &&
        !form.last_meal_time
      ) {
        return (
          "Please provide the patient's last meal time."
        );
      }

      if (
        !form.laboratory_clinical_notes.trim()
      ) {
        return (
          "Laboratory clinical notes are required. Enter 'None' if not applicable."
        );
      }
    }

    /* Ultrasound */

    if (needsUltrasound) {
      const validScans =
        scanRows.filter(
          (row) =>
            row.scan_type.trim()
        );

      if (!validScans.length) {
        return (
          "Please select at least one ultrasound scan."
        );
      }

      if (
        !form
          .ultrasound_clinical_indication
          .trim()
      ) {
        return (
          "Ultrasound clinical indication is required."
        );
      }
    }

    return "";
  };

  /* ============================================================
     SUBMIT
     ============================================================ */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess(null);

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setSubmitting(true);

    try {
      const requestedTests = needsLaboratory
        ? selectedTests.map((test) => ({
            id: Number(test.id),
            test_name: test.test_name || "",
            test_code: test.test_code || "",
            department: test.department || "Other",
            test_type: test.test_type || "",
            result_type: test.result_type || "",
            is_panel: Boolean(test.is_panel),
            quantity: Number(test.quantity || 1),
          }))
        : [];

      const requestedScans =
        needsUltrasound
          ? scanRows.filter(
              (row) =>
                row.scan_type.trim()
            )
          : [];

      const { error: insertError } =
        await supabase
          .from("test_requests")
          .insert({
            /* Requestor */

            requestor_type:
              form.requestor_type,

            requestor_name:
              form.requestor_name.trim(),

            requestor_phone:
              form.requestor_phone.trim(),

            requestor_email:
              form.requestor_email.trim() ||
              null,

            /* Patient */

            patient_name:
              form.patient_name.trim(),

            patient_dob:
              form.patient_dob || null,

            patient_age:
              form.patient_age
                ? Number(form.patient_age)
                : null,

            patient_sex:
              form.patient_sex,

            patient_phone:
              form.patient_phone.trim(),

            patient_address:
              form.patient_address.trim(),

            /* Referral */

            referral_id:
              form.referral_id || null,

            referral_name:
              form.referral_name.trim(),

            referring_doctor:
              form.referring_doctor.trim(),

            referring_doctor_phone:
              form.referring_doctor_phone.trim(),

            referring_doctor_email:
              form.referring_doctor_email.trim() ||
              null,

            /* Clinical */

            presenting_complaint:
              form.presenting_complaint.trim(),

            clinical_history:
              form.clinical_history.trim(),

            provisional_diagnosis:
              form.provisional_diagnosis.trim(),

            relevant_medical_history:
              form.relevant_medical_history.trim(),

            current_medications:
              form.current_medications.trim(),

            pregnancy_status:
              isFemale
                ? form.pregnancy_status
                : "Not Applicable",

            lmp:
              isFemale &&
              isPregnancyRelated
                ? form.lmp || null
                : null,

            /* Request */

            priority:
              form.priority,

            service_type:
              form.service_type,

            /* Laboratory */

            specimen_collected:
              needsLaboratory
                ? form.specimen_collected ===
                  "Yes"
                : null,

            specimen_type:
              needsLaboratory &&
              form.specimen_collected ===
                "Yes"
                ? form.specimen_type.trim()
                : null,

            fasting_status:
              needsLaboratory
                ? form.fasting_status
                : "Not Applicable",

            last_meal_time:
              needsLaboratory &&
              form.last_meal_time
                ? form.last_meal_time
                : null,

            laboratory_clinical_notes:
              needsLaboratory
                ? form.laboratory_clinical_notes.trim()
                : null,

            /* Ultrasound */

            ultrasound_clinical_indication:
              needsUltrasound
                ? form.ultrasound_clinical_indication.trim()
                : null,

            /* Requested services */

            requested_tests:
              requestedTests,

            requested_scans:
              requestedScans,

            additional_notes:
              form.additional_notes.trim() ||
              null,

            /* Workflow */

            status: "Pending",
          });

      if (insertError) {
        throw insertError;
      }

      setSuccess({
        requestNumber: "REQUEST RECEIVED",
      });

      /* Reset */

      setForm(INITIAL_FORM);

      setSelectedTests([]);

      setSearchTest("");

      setScanRows([
        {
          scan_type: "",
          quantity: 1,
        },
      ]);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Test Request submission error:",
        err
      );

      setError(
        err?.message ||
          "Unable to submit your test request. Please try again."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="test-request-page">
        <div className="test-request-loading">
          Loading PEFA Test Request...
        </div>
      </div>
    );
  }

  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <div className="test-request-page">
      <div className="test-request-container">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <header className="test-request-header">
          <div>
            <div className="test-request-brand">
              PEFA MEDICAL DIAGNOSTIC SERVICES
            </div>

            <h1>Test Request</h1>

            <p>
              Submit your laboratory or
              ultrasound investigation
              request to PEFA Medical
              Diagnostic Services.
            </p>
          </div>
        </header>

        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div className="test-request-alert error">
            <strong>Important:</strong>{" "}
            {error}
          </div>
        )}

        {/* ======================================================
            SUCCESS
        ======================================================= */}

        {success && (
          <div className="test-request-alert success">
            <h2>
              Request Submitted Successfully
            </h2>

            <p>
              Your test request has been
              received by PEFA Medical
              Diagnostic Services.
            </p>

            <div className="request-number">
              {success.requestNumber}
            </div>

            <p>
              Please keep this request
              number for reference.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ====================================================
              1. REQUESTOR
          ===================================================== */}

          <section className="request-section">

            <div className="section-heading">
              <span>1</span>

              <div>
                <h2>
                  Requestor Information
                </h2>

                <p>
                  Who is submitting this
                  request?
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-field">
                <label>
                  Requestor Type{" "}
                  <Required />
                </label>

                <select
                  value={
                    form.requestor_type
                  }
                  onChange={(e) =>
                    updateField(
                      "requestor_type",
                      e.target.value
                    )
                  }
                >
                  <option value="Patient">
                    Patient
                  </option>

                  <option value="Doctor">
                    Doctor
                  </option>

                  <option value="Hospital">
                    Hospital
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Requestor Name{" "}
                  <Required />
                </label>

                <input
                  type="text"
                  value={
                    form.requestor_name
                  }
                  onChange={(e) =>
                    updateField(
                      "requestor_name",
                      e.target.value
                    )
                  }
                  placeholder="Full name"
                />
              </div>

              <div className="form-field">
                <label>
                  Requestor Phone{" "}
                  <Required />
                </label>

                <input
                  type="tel"
                  value={
                    form.requestor_phone
                  }
                  onChange={(e) =>
                    updateField(
                      "requestor_phone",
                      e.target.value
                    )
                  }
                  placeholder="Phone number"
                />
              </div>

              <div className="form-field">
                <label>
                  Requestor Email
                </label>

                <input
                  type="email"
                  value={
                    form.requestor_email
                  }
                  onChange={(e) =>
                    updateField(
                      "requestor_email",
                      e.target.value
                    )
                  }
                  placeholder="Email address"
                />
              </div>

            </div>
          </section>

          {/* ====================================================
              2. PATIENT
          ===================================================== */}

          <section className="request-section">

            <div className="section-heading">
              <span>2</span>

              <div>
                <h2>
                  Patient Information
                </h2>

                <p>
                  Complete patient
                  information is required
                  for identification and
                  reporting.
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-field full-width">
                <label>
                  Patient Full Name{" "}
                  <Required />
                </label>

                <input
                  type="text"
                  value={
                    form.patient_name
                  }
                  onChange={(e) =>
                    updateField(
                      "patient_name",
                      e.target.value
                    )
                  }
                  placeholder="Surname, First Name, Other Name"
                />
              </div>

              <div className="form-field">
                <label>
                  Date of Birth{" "}
                  <Required />
                </label>

                <input
                  type="date"
                  value={
                    form.patient_dob
                  }
                  onChange={(e) =>
                    updateField(
                      "patient_dob",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label>Age</label>

                <input
                  type="number"
                  value={
                    form.patient_age
                  }
                  readOnly
                  placeholder="Auto-calculated"
                />
              </div>

              <div className="form-field">
                <label>
                  Sex <Required />
                </label>

                <select
                  value={
                    form.patient_sex
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setForm((prev) => ({
                      ...prev,
                      patient_sex:
                        value,
                      pregnancy_status:
                        value ===
                        "Female"
                          ? prev.pregnancy_status
                          : "Not Applicable",
                      lmp:
                        value ===
                        "Female"
                          ? prev.lmp
                          : "",
                    }));
                  }}
                >
                  <option value="">
                    Select sex
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Patient Phone{" "}
                  <Required />
                </label>

                <input
                  type="tel"
                  value={
                    form.patient_phone
                  }
                  onChange={(e) =>
                    updateField(
                      "patient_phone",
                      e.target.value
                    )
                  }
                  placeholder="Patient phone number"
                />
              </div>

              <div className="form-field full-width">
                <label>
                  Patient Address{" "}
                  <Required />
                </label>

                <textarea
                  value={
                    form.patient_address
                  }
                  onChange={(e) =>
                    updateField(
                      "patient_address",
                      e.target.value
                    )
                  }
                  rows="2"
                  placeholder="Residential/contact address"
                />
              </div>

              {isFemale && (
                <>
                  <div className="form-field">
                    <label>
                      Pregnancy Status{" "}
                      <Required />
                    </label>

                    <select
                      value={
                        form.pregnancy_status
                      }
                      onChange={(e) =>
                        updateField(
                          "pregnancy_status",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select status
                      </option>

                      <option value="Pregnant">
                        Pregnant
                      </option>

                      <option value="Possibly Pregnant">
                        Possibly Pregnant
                      </option>

                      <option value="Not Pregnant">
                        Not Pregnant
                      </option>

                      <option value="Unknown">
                        Unknown
                      </option>
                    </select>
                  </div>

                  {isPregnancyRelated && (
                    <div className="form-field">
                      <label>
                        Last Menstrual Period
                        (LMP){" "}
                        <Required />
                      </label>

                      <input
                        type="date"
                        value={
                          form.lmp
                        }
                        onChange={(e) =>
                          updateField(
                            "lmp",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </>
              )}

            </div>
          </section>

          {/* ====================================================
              3. REFERRAL
          ===================================================== */}

          <section className="request-section">

            <div className="section-heading">
              <span>3</span>

              <div>
                <h2>
                  Referral Information
                </h2>

                <p>
                  Referral hospital and
                  referring doctor are
                  required.
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-field full-width">
                <label>
                  Referral Hospital /
                  Facility{" "}
                  <Required />
                </label>

                <select
                  value={
                    form.referral_id
                  }
                  onChange={(e) =>
                    handleReferralChange(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select referral hospital
                  </option>

                  {referrals.map(
                    (referral) => (
                      <option
                        key={
                          referral.id
                        }
                        value={
                          referral.id
                        }
                      >
                        {referral.name}
                        {referral.referral_code
                          ? ` (${referral.referral_code})`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-field">
                <label>
                  Referring Doctor{" "}
                  <Required />
                </label>

                <input
                  type="text"
                  value={
                    form.referring_doctor
                  }
                  onChange={(e) =>
                    updateField(
                      "referring_doctor",
                      e.target.value
                    )
                  }
                  placeholder="Doctor's full name"
                />
              </div>

              <div className="form-field">
                <label>
                  Doctor Phone{" "}
                  <Required />
                </label>

                <input
                  type="tel"
                  value={
                    form.referring_doctor_phone
                  }
                  onChange={(e) =>
                    updateField(
                      "referring_doctor_phone",
                      e.target.value
                    )
                  }
                  placeholder="Doctor's phone number"
                />
              </div>

              <div className="form-field">
                <label>
                  Doctor Email
                </label>

                <input
                  type="email"
                  value={
                    form.referring_doctor_email
                  }
                  onChange={(e) =>
                    updateField(
                      "referring_doctor_email",
                      e.target.value
                    )
                  }
                  placeholder="Doctor's email"
                />
              </div>

            </div>
          </section>

          {/* ====================================================
              4. CLINICAL INFORMATION
          ===================================================== */}

          <section className="request-section">

            <div className="section-heading">
              <span>4</span>

              <div>
                <h2>
                  Clinical Information
                </h2>

                <p>
                  Provide relevant clinical
                  information to support
                  appropriate laboratory
                  processing.
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-field full-width">
                <label>
                  Presenting Complaint /
                  Reason for Test{" "}
                  <Required />
                </label>

                <textarea
                  value={
                    form.presenting_complaint
                  }
                  onChange={(e) =>
                    updateField(
                      "presenting_complaint",
                      e.target.value
                    )
                  }
                  rows="3"
                  placeholder="Main complaint or reason for requesting the investigation."
                />
              </div>

              <div className="form-field full-width">
                <label>
                  Clinical History{" "}
                  <Required />
                </label>

                <textarea
                  value={
                    form.clinical_history
                  }
                  onChange={(e) =>
                    updateField(
                      "clinical_history",
                      e.target.value
                    )
                  }
                  rows="4"
                  placeholder="Relevant history, duration of symptoms, previous findings, etc."
                />
              </div>

              <div className="form-field full-width">
                <label>
                  Provisional / Clinical
                  Diagnosis{" "}
                  <Required />
                </label>

                <textarea
                  value={
                    form.provisional_diagnosis
                  }
                  onChange={(e) =>
                    updateField(
                      "provisional_diagnosis",
                      e.target.value
                    )
                  }
                  rows="3"
                  placeholder="Enter suspected or provisional diagnosis."
                />
              </div>

              <div className="form-field full-width">
                <label>
                  Relevant Medical
                  History{" "}
                  <Required />
                </label>

                <textarea
                  value={
                    form.relevant_medical_history
                  }
                  onChange={(e) =>
                    updateField(
                      "relevant_medical_history",
                      e.target.value
                    )
                  }
                  rows="3"
                  placeholder="Previous illnesses, surgery, diabetes, hypertension, renal disease, liver disease, transfusion history, etc."
                />
              </div>

              <div className="form-field full-width">
                <label>
                  Current Medication /
                  Treatment{" "}
                  <Required />
                </label>

                <textarea
                  value={
                    form.current_medications
                  }
                  onChange={(e) =>
                    updateField(
                      "current_medications",
                      e.target.value
                    )
                  }
                  rows="3"
                  placeholder="List current medications/treatment or enter 'None'."
                />
              </div>

            </div>
          </section>

          {/* ====================================================
              5. SERVICE TYPE
          ===================================================== */}

          <section className="request-section">

            <div className="section-heading">
              <span>5</span>

              <div>
                <h2>
                  Investigation Request
                </h2>

                <p>
                  Select the service required.
                </p>
              </div>
            </div>

            <div className="service-selector">

              {[
                "Laboratory",
                "Ultrasound",
                "Both",
              ].map((service) => (
                <button
                  type="button"
                  key={service}
                  className={
                    form.service_type ===
                    service
                      ? "service-option active"
                      : "service-option"
                  }
                  onClick={() =>
                    updateField(
                      "service_type",
                      service
                    )
                  }
                >
                  {service}
                </button>
              ))}

            </div>
          </section>

          {/* ====================================================
              6. LABORATORY
          ===================================================== */}

          {needsLaboratory && (
            <section className="request-section">

              <div className="section-heading">
                <span>6</span>

                <div>
                  <h2>
                    Laboratory
                    Investigation
                  </h2>

                  <p>
                    Search for the required
                    laboratory test. The
                    complete test catalogue
                    is hidden until you
                    search.
                  </p>
                </div>
              </div>

              {/* SEARCH */}

              <div className="test-search-box">

                <span className="test-search-icon">
                  ⌕
                </span>

                <input
                  type="search"
                  value={searchTest}
                  onChange={(e) =>
                    setSearchTest(
                      e.target.value
                    )
                  }
                  placeholder="Search laboratory test by name or test code..."
                  aria-label="Search laboratory tests"
                />

                {searchTest && (
                  <button
                    type="button"
                    className="clear-test-search"
                    onClick={() =>
                      setSearchTest("")
                    }
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}

              </div>

              {/* SEARCH RESULTS */}

              {searchTest.trim() && (
                <div className="test-search-results">

                  {filteredTests.map(
                    (test) => (
                      <label
                        key={test.id}
                        className={
                          isTestSelected(
                            test.id
                          )
                            ? "test-search-result selected"
                            : "test-search-result"
                        }
                      >

                        <input
                          type="checkbox"
                          checked={isTestSelected(
                            test.id
                          )}
                          onChange={() =>
                            toggleTest(
                              test
                            )
                          }
                        />

                        <div className="test-search-result-info">

                          <strong>
                            {
                              test.test_name
                            }
                          </strong>

                          <small>
                            {test.test_code ||
                              "No code"}

                            {" • "}

                            {test.department ||
                              "Other"}
                          </small>

                        </div>

                        <span className="test-selection-status">
                          {isTestSelected(
                            test.id
                          )
                            ? "Selected"
                            : "Select"}
                        </span>

                      </label>
                    )
                  )}

                  {!filteredTests.length && (
                    <div className="empty-test-search">
                      No laboratory test
                      found for "
                      {searchTest}".
                    </div>
                  )}

                </div>
              )}

              {!searchTest.trim() && (
                <div className="test-search-hint">
                  Start typing to search
                  laboratory tests.
                </div>
              )}

              {/* SELECTED TESTS */}

              {selectedTests.length >
                0 && (
                <div className="selected-tests-panel">

                  <div className="selected-tests-header">

                    <strong>
                      Selected Laboratory
                      Tests
                    </strong>

                    <span>
                      {
                        selectedTests.length
                      }
                    </span>

                  </div>

                  <div className="selected-tests-list">

                    {selectedTests.map(
                      (test) => (
                        <div
                          className="selected-test-item"
                          key={test.id}
                        >

                          <div>
                            <strong>
                              {
                                test.test_name
                              }
                            </strong>

                            <small>
                              {test.test_code ||
                                "No code"}

                              {" • "}

                              {test.department ||
                                "Other"}
                            </small>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedTest(
                                test.id
                              )
                            }
                          >
                            Remove
                          </button>

                        </div>
                      )
                    )}

                  </div>
                </div>
              )}

              {/* PRE-ANALYTICAL INFORMATION */}

              <div className="form-grid laboratory-preanalytics">

                <div className="form-field">
                  <label>
                    Specimen Already
                    Collected?{" "}
                    <Required />
                  </label>

                  <select
                    value={
                      form.specimen_collected
                    }
                    onChange={(e) =>
                      updateField(
                        "specimen_collected",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="Yes">
                      Yes
                    </option>

                    <option value="No">
                      No
                    </option>
                  </select>
                </div>

                {form.specimen_collected ===
                  "Yes" && (
                  <div className="form-field">
                    <label>
                      Specimen Type{" "}
                      <Required />
                    </label>

                    <input
                      type="text"
                      value={
                        form.specimen_type
                      }
                      onChange={(e) =>
                        updateField(
                          "specimen_type",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Serum, Plasma, EDTA blood, Urine"
                    />
                  </div>
                )}

                <div className="form-field">
                  <label>
                    Fasting Status{" "}
                    <Required />
                  </label>

                  <select
                    value={
                      form.fasting_status
                    }
                    onChange={(e) =>
                      updateField(
                        "fasting_status",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="Fasting">
                      Fasting
                    </option>

                    <option value="Non-fasting">
                      Non-fasting
                    </option>

                    <option value="Unknown">
                      Unknown
                    </option>

                    <option value="Not Applicable">
                      Not Applicable
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label>
                    Last Meal Time
                  </label>

                  <input
                    type="time"
                    value={
                      form.last_meal_time
                    }
                    onChange={(e) =>
                      updateField(
                        "last_meal_time",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-field full-width">
                  <label>
                    Laboratory Clinical /
                    Pre-Analytical Notes{" "}
                    <Required />
                  </label>

                  <textarea
                    value={
                      form.laboratory_clinical_notes
                    }
                    onChange={(e) =>
                      updateField(
                        "laboratory_clinical_notes",
                        e.target.value
                      )
                    }
                    rows="3"
                    placeholder="Special laboratory instructions, previous abnormal results, specimen concerns, timing requirements, etc. Enter 'None' if not applicable."
                  />
                </div>

              </div>
            </section>
          )}

          {/* ====================================================
              7. ULTRASOUND
          ===================================================== */}

          {needsUltrasound && (
            <section className="request-section">

              <div className="section-heading">
                <span>7</span>

                <div>
                  <h2>
                    Ultrasound Request
                  </h2>

                  <p>
                    Provide the scan type
                    and clinical indication.
                  </p>
                </div>
              </div>

              <div className="form-field full-width">

                <label>
                  Clinical Indication{" "}
                  <Required />
                </label>

                <textarea
                  value={
                    form.ultrasound_clinical_indication
                  }
                  onChange={(e) =>
                    updateField(
                      "ultrasound_clinical_indication",
                      e.target.value
                    )
                  }
                  rows="3"
                  placeholder="Reason for ultrasound examination."
                />

              </div>

              <div className="scan-list">

                {scanRows.map(
                  (row, index) => (
                    <div
                      className="scan-row"
                      key={index}
                    >

                      <select
                        value={
                          row.scan_type
                        }
                        onChange={(e) =>
                          updateScanRow(
                            index,
                            "scan_type",
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Select scan type
                        </option>

                        {SCAN_TYPES.map(
                          (scanType) => (
                            <option
                              key={
                                scanType
                              }
                              value={
                                scanType
                              }
                            >
                              {scanType}
                            </option>
                          )
                        )}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={
                          row.quantity
                        }
                        onChange={(e) =>
                          updateScanRow(
                            index,
                            "quantity",
                            Number(
                              e.target.value
                            ) || 1
                          )
                        }
                      />

                      {scanRows.length >
                        1 && (
                        <button
                          type="button"
                          className="remove-scan"
                          onClick={() =>
                            removeScanRow(
                              index
                            )
                          }
                        >
                          Remove
                        </button>
                      )}

                    </div>
                  )
                )}

                <button
                  type="button"
                  className="add-scan"
                  onClick={addScanRow}
                >
                  + Add Another Scan
                </button>

              </div>
            </section>
          )}

          {/* ====================================================
              8. PRIORITY / NOTES
          ===================================================== */}

          <section className="request-section">

            <div className="section-heading">
              <span>8</span>

              <div>
                <h2>
                  Priority & Additional
                  Information
                </h2>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-field">
                <label>
                  Request Priority{" "}
                  <Required />
                </label>

                <select
                  value={
                    form.priority
                  }
                  onChange={(e) =>
                    updateField(
                      "priority",
                      e.target.value
                    )
                  }
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

              <div className="form-field full-width">
                <label>
                  Additional Notes
                </label>

                <textarea
                  value={
                    form.additional_notes
                  }
                  onChange={(e) =>
                    updateField(
                      "additional_notes",
                      e.target.value
                    )
                  }
                  rows="4"
                  placeholder="Any other information that may be useful to PEFA Medical Diagnostic Services."
                />
              </div>

            </div>
          </section>

          {/* ====================================================
              SUBMIT
          ===================================================== */}

          <div className="submit-area">

            <p className="privacy-note">
              Please ensure that the information
              supplied is accurate. The information
              will be used by PEFA Medical
              Diagnostic Services for processing
              the requested investigations.
            </p>

            <button
              type="submit"
              className="submit-request-button"
              disabled={submitting}
            >
              {submitting
                ? "Submitting Request..."
                : "Submit Test Request"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}