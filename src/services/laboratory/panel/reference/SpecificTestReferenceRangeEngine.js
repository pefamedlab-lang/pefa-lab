/* ==========================================================
 * PEFA LAB
 * SPECIFIC TEST REFERENCE-RANGE ENGINE
 *
 * Shared by standalone and panel result-entry workflows.
 *
 * Currently configured:
 *   - AMH / Anti-Mullerian Hormone
 *   - Total PSA / Prostate-Specific Antigen
 *
 * IMPORTANT
 * ----------------------------------------------------------
 * Master-test/database metadata remains authoritative.
 * These values are fallback references only when the selected
 * master-test metadata does not contain an applicable range.
 *
 * The fallback values below are based on Mayo Clinic
 * Laboratories published reference values and are assay-specific
 * in origin. PEFA should validate them against the assay actually
 * used by the laboratory before treating them as local validated
 * reference intervals.
 * ========================================================== */

const text = (value) =>
  String(value ?? "").trim();

const normalize = (value) =>
  text(value)
    .toLowerCase()
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/[()]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const first = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && text(value)) {
      return value;
    }
  }
  return "";
};

export const canonicalSpecificTestKey = (value = "") => {
  const n = normalize(value);

  if (
    n === "amh" ||
    n === "anti mullerian hormone" ||
    n === "antimullerian hormone"
  ) {
    return "amh";
  }

  if (
    n === "psa" ||
    n === "total psa" ||
    n === "prostate specific antigen" ||
    n === "prostate specific ag" ||
    n === "prostate specific antigen psa" ||
    n === "prostatic specific antigen" ||
    n.includes("prostate specific antigen") && !n.includes("free psa")
  ) {
    return "psa";
  }

  return "";
};

export const getSpecificTestKey = (test = {}) =>
  canonicalSpecificTestKey(
    first(
      test?.key,
      test?.code,
      test?.test_name,
      test?.testName,
      test?.name,
      test?.service_name,
      test?.masterTest?.test_name,
      test?.master_test?.test_name,
      test?.masterTest?.name,
      test?.master_test?.name
    )
  );

export const getAge = (patient = {}) => {
  const direct = first(
    patient?.age,
    patient?.age_years,
    patient?.ageYears,
    patient?.patient_age,
    patient?.patientAge,
    patient?.patient?.age,
    patient?.patient?.age_years
  );

  const numeric = Number(direct);

  if (
    Number.isFinite(numeric) &&
    numeric >= 0 &&
    numeric <= 120
  ) {
    return numeric;
  }

  const dob = first(
    patient?.dob,
    patient?.date_of_birth,
    patient?.dateOfBirth,
    patient?.patient?.dob,
    patient?.patient?.date_of_birth
  );

  if (!dob) return null;

  const birth = new Date(dob);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const referenceDate = new Date();

  let age =
    referenceDate.getFullYear() -
    birth.getFullYear();

  const month =
    referenceDate.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      referenceDate.getDate() < birth.getDate()
    )
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

export const getSex = (patient = {}) => {
  const value = normalize(
    first(
      patient?.sex,
      patient?.gender,
      patient?.patient?.sex,
      patient?.patient?.gender
    )
  );

  if (["m", "male", "man"].includes(value)) {
    return "male";
  }

  if (["f", "female", "woman"].includes(value)) {
    return "female";
  }

  return "unknown";
};

/* ==========================================================
   AMH
   ----------------------------------------------------------
   Mayo published AMH reference values (ng/mL):

   Females
   <3       0.11–4.2
   3–6      0.21–4.9
   7–11     0.36–5.9
   12–14    0.49–6.9
   15–19    0.62–7.8
   20–24    1.2–12
   25–29    0.89–9.9
   30–34    0.58–8.1
   35–39    0.15–7.5
   40–44    0.03–5.5
   45–50    <2.6
   51–55    <0.88
   >55      <0.03

   Males
   <2       18–283
   2–12     8.9–109
   >12      <13
   ========================================================== */

const amhFemale = (age) => {
  if (!Number.isFinite(age)) return null;

  if (age < 3) {
    return {
      text: "0.11 – 4.2 ng/mL",
      low: 0.11,
      high: 4.2,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 6) {
    return {
      text: "0.21 – 4.9 ng/mL",
      low: 0.21,
      high: 4.9,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 11) {
    return {
      text: "0.36 – 5.9 ng/mL",
      low: 0.36,
      high: 5.9,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 14) {
    return {
      text: "0.49 – 6.9 ng/mL",
      low: 0.49,
      high: 6.9,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 19) {
    return {
      text: "0.62 – 7.8 ng/mL",
      low: 0.62,
      high: 7.8,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 24) {
    return {
      text: "1.2 – 12 ng/mL",
      low: 1.2,
      high: 12,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 29) {
    return {
      text: "0.89 – 9.9 ng/mL",
      low: 0.89,
      high: 9.9,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 34) {
    return {
      text: "0.58 – 8.1 ng/mL",
      low: 0.58,
      high: 8.1,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 39) {
    return {
      text: "0.15 – 7.5 ng/mL",
      low: 0.15,
      high: 7.5,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 44) {
    return {
      text: "0.03 – 5.5 ng/mL",
      low: 0.03,
      high: 5.5,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 50) {
    return {
      text: "≤2.6 ng/mL",
      low: null,
      high: 2.6,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 55) {
    return {
      text: "≤0.88 ng/mL",
      low: null,
      high: 0.88,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  return {
    text: "≤0.03 ng/mL",
    low: null,
    high: 0.03,
    source: "Mayo Clinic Laboratories AMH reference",
  };
};

const amhMale = (age) => {
  if (!Number.isFinite(age)) return null;

  if (age < 2) {
    return {
      text: "18 – 283 ng/mL",
      low: 18,
      high: 283,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  if (age <= 12) {
    return {
      text: "8.9 – 109 ng/mL",
      low: 8.9,
      high: 109,
      source: "Mayo Clinic Laboratories AMH reference",
    };
  }

  return {
    text: "≤13 ng/mL",
    low: null,
    high: 13,
    source: "Mayo Clinic Laboratories AMH reference",
  };
};

export const getAMHReferenceRange = (patient = {}) => {
  const age = getAge(patient);
  const sex = getSex(patient);

  if (!Number.isFinite(age)) {
    return {
      text: "Age required",
      low: null,
      high: null,
      source: "AMH age-specific reference",
      requiresAge: true,
    };
  }

  if (sex === "male") {
    return amhMale(age);
  }

  return amhFemale(age);
};

/* ==========================================================
   PSA
   ----------------------------------------------------------
   Mayo published age-specific total PSA upper reference limits:

   <40       ≤2.0 ng/mL
   40–49     ≤2.5 ng/mL
   50–59     ≤3.5 ng/mL
   60–69     ≤4.5 ng/mL
   70–79     ≤6.5 ng/mL
   ≥80       ≤7.2 ng/mL
   ========================================================== */

export const getPSAReferenceRange = (patient = {}) => {
  const age = getAge(patient);
  const sex = getSex(patient);

  if (sex === "female") {
    return {
      text: "Not applicable",
      low: null,
      high: null,
      source: "PSA male reference",
      notApplicable: true,
    };
  }

  if (!Number.isFinite(age)) {
    return {
      text: "Age required",
      low: null,
      high: null,
      source: "PSA age-specific reference",
      requiresAge: true,
    };
  }

  if (age < 40) {
    return {
      text: "≤2.0 ng/mL",
      low: null,
      high: 2.0,
      source: "Mayo Clinic Laboratories PSA reference",
    };
  }

  if (age <= 49) {
    return {
      text: "≤2.5 ng/mL",
      low: null,
      high: 2.5,
      source: "Mayo Clinic Laboratories PSA reference",
    };
  }

  if (age <= 59) {
    return {
      text: "≤3.5 ng/mL",
      low: null,
      high: 3.5,
      source: "Mayo Clinic Laboratories PSA reference",
    };
  }

  if (age <= 69) {
    return {
      text: "≤4.5 ng/mL",
      low: null,
      high: 4.5,
      source: "Mayo Clinic Laboratories PSA reference",
    };
  }

  if (age <= 79) {
    return {
      text: "≤6.5 ng/mL",
      low: null,
      high: 6.5,
      source: "Mayo Clinic Laboratories PSA reference",
    };
  }

  return {
    text: "≤7.2 ng/mL",
    low: null,
    high: 7.2,
    source: "Mayo Clinic Laboratories PSA reference",
  };
};

/* ==========================================================
   UNIVERSAL ENTRY POINT
   ========================================================== */

export const resolveSpecificTestReferenceRange = ({
  test = {},
  patient = {},
} = {}) => {
  const key = getSpecificTestKey(test);

  if (key === "amh") {
    return getAMHReferenceRange(patient);
  }

  if (key === "psa") {
    return getPSAReferenceRange(patient);
  }

  return null;
};

export const isSpecificReferenceConfigured = (test = {}) =>
  Boolean(getSpecificTestKey(test));

export default resolveSpecificTestReferenceRange;
