/* ==========================================================
   PEFA LAB
   QUANTITATIVE RESULT METADATA
   ----------------------------------------------------------
   PATH:
   src/services/laboratory/quantitativeResultMetadata.js

   Purpose:
   - Resolve display unit
   - Resolve patient-specific reference range
   - Resolve critical limits
   - Calculate quantitative flags

   Compatible with the PEFA master_tests schema:
     unit
     male_range
     female_range
     child_range
     elderly_range
     reference_value
     normal_low
     normal_high
     critical_low
     critical_high
   ========================================================== */

export const text = (value) =>
  String(value ?? "").trim();

const normalize = (value) =>
  text(value)
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const normalizeSex = (value) =>
  text(value).toLowerCase();

const getPatientSex = (patient = {}) =>
  normalizeSex(
    patient?.sex ??
    patient?.gender ??
    patient?.patient?.sex ??
    patient?.patient?.gender
  );

const getPatientAge = (patient = {}) => {
  const directValues = [
    patient?.age,
    patient?.age_years,
    patient?.ageYears,
    patient?.patient_age,
    patient?.patientAge,
    patient?.patient?.age,
  ];

  for (const value of directValues) {
    const numeric = Number(value);
    if (
      Number.isFinite(numeric) &&
      numeric >= 0
    ) {
      return numeric;
    }
  }

  const dob =
    patient?.date_of_birth ??
    patient?.dateOfBirth ??
    patient?.dob ??
    patient?.patient?.date_of_birth ??
    patient?.patient?.dob;

  if (!dob) {
    return null;
  }

  const birth = new Date(dob);

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const month =
    today.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() < birth.getDate()
    )
  ) {
    age -= 1;
  }

  return age >= 0
    ? age
    : null;
};

const getMaster = (test = {}) =>
  test?.masterTest ||
  test?.master_test ||
  test ||
  {};

/* ----------------------------------------------------------
   PEFA FALLBACK REFERENCE CONFIGURATION
   ----------------------------------------------------------
   Used only when master_tests does not yet contain a range.
   Values are taken from PEFA's existing chemistry reference
   configuration; master_tests remains authoritative when populated.
   ---------------------------------------------------------- */
const CHEMISTRY_FALLBACK_RANGES = {
  calcium: {
    unit: "mmol/L",
    male: "2.1 - 2.6",
    female: "2.1 - 2.6",
    child: "2.2 - 2.8",
  },
};

export const getTestName = (test = {}) =>
  test?.test_name ||
  test?.testName ||
  test?.name ||
  test?.test ||
  test?.masterTest?.test_name ||
  test?.master_test?.test_name ||
  "Laboratory Test";

export const getDisplayUnit = (
  test = {},
  result = {}
) => {
  const master =
    getMaster(test);

  return text(
    result?.unit ??
    test?.unit ??
    test?.result_unit ??
    master?.unit ??
    ""
  );
};

export const getCriticalLow = (
  test = {},
  result = {}
) => {
  const master =
    getMaster(test);

  return (
    result?.critical_low ??
    test?.critical_low ??
    master?.critical_low ??
    null
  );
};

export const getCriticalHigh = (
  test = {},
  result = {}
) => {
  const master =
    getMaster(test);

  return (
    result?.critical_high ??
    test?.critical_high ??
    master?.critical_high ??
    null
  );
};

export const getReferenceRange = (
  test = {},
  patient = {},
  result = {}
) => {
  const master =
    getMaster(test);

  /*
   * A saved result can carry its own resolved range.
   */
  if (
    text(result?.reference_range)
  ) {
    return text(
      result.reference_range
    );
  }

  if (
    text(result?.referenceRange)
  ) {
    return text(
      result.referenceRange
    );
  }

  const age =
    getPatientAge(patient);

  const sex =
    getPatientSex(patient);

  /*
   * PEFA schema: patient-specific ranges.
   */
  if (
    Number.isFinite(age) &&
    age < 18 &&
    text(master.child_range)
  ) {
    return text(
      master.child_range
    );
  }

  if (
    Number.isFinite(age) &&
    age >= 65 &&
    text(master.elderly_range)
  ) {
    return text(
      master.elderly_range
    );
  }

  if (
    sex === "male" &&
    text(master.male_range)
  ) {
    return text(
      master.male_range
    );
  }

  if (
    sex === "female" &&
    text(master.female_range)
  ) {
    return text(
      master.female_range
    );
  }

  /*
   * Existing PEFA chemistry fallback.
   * Only used when the authoritative master row has no configured range.
   */
  const fallbackKey = normalize(getTestName(test)).toLowerCase();
  const fallback = CHEMISTRY_FALLBACK_RANGES[fallbackKey];

  if (fallback) {
    if (Number.isFinite(age) && age < 18 && fallback.child) {
      return fallback.child;
    }
    if (sex === "female" && fallback.female) {
      return fallback.female;
    }
    if (sex === "male" && fallback.male) {
      return fallback.male;
    }
    if (fallback.male) {
      return fallback.male;
    }
  }

  /*
   * Generic reference fields.
   */
  if (
    text(master.reference_range)
  ) {
    return text(
      master.reference_range
    );
  }

  if (
    text(master.reference_value)
  ) {
    return text(
      master.reference_value
    );
  }

  /*
   * PEFA normal_low / normal_high fallback.
   */
  const low =
    text(master.normal_low);

  const high =
    text(master.normal_high);

  if (
    low &&
    high
  ) {
    return `${low} - ${high}`;
  }

  if (low) {
    return `>= ${low}`;
  }

  if (high) {
    return `<= ${high}`;
  }

  return "";
};

const parseNumeric = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numeric =
    Number(
      String(value)
        .replace(/,/g, "")
        .trim()
    );

  return Number.isFinite(
    numeric
  )
    ? numeric
    : null;
};

const parseReference = (
  referenceRange
) => {
  const raw =
    normalize(
      referenceRange
    );

  if (!raw) {
    return null;
  }

  let match =
    raw.match(
      /^(?:>=|≥|>)\s*(-?\d+(?:\.\d+)?)$/i
    );

  if (match) {
    return {
      type: "minimum",
      min: Number(match[1]),
      max: null,
    };
  }

  match =
    raw.match(
      /^(?:<=|≤|<)\s*(-?\d+(?:\.\d+)?)$/i
    );

  if (match) {
    return {
      type: "maximum",
      min: null,
      max: Number(match[1]),
    };
  }

  match =
    raw.match(
      /^(-?\d+(?:\.\d+)?)\s*(?:to|\.\.|-)\s*(-?\d+(?:\.\d+)?)$/i
    );

  if (match) {
    const first =
      Number(match[1]);

    const second =
      Number(match[2]);

    return {
      type: "range",
      min: Math.min(
        first,
        second
      ),
      max: Math.max(
        first,
        second
      ),
    };
  }

  return null;
};

export const calculateQuantitativeFlag = ({
  value,
  referenceRange,
  criticalLow = null,
  criticalHigh = null,
}) => {
  const numericValue =
    parseNumeric(value);

  if (
    numericValue === null
  ) {
    return "";
  }

  const criticalLowValue =
    parseNumeric(
      criticalLow
    );

  const criticalHighValue =
    parseNumeric(
      criticalHigh
    );

  if (
    criticalLowValue !== null &&
    numericValue <
      criticalLowValue
  ) {
    return "CRITICAL LOW";
  }

  if (
    criticalHighValue !== null &&
    numericValue >
      criticalHighValue
  ) {
    return "CRITICAL HIGH";
  }

  const range =
    parseReference(
      referenceRange
    );

  if (!range) {
    return "";
  }

  if (
    range.type ===
    "minimum"
  ) {
    return numericValue >=
      range.min
      ? "NORMAL"
      : "LOW";
  }

  if (
    range.type ===
    "maximum"
  ) {
    return numericValue <=
      range.max
      ? "NORMAL"
      : "HIGH";
  }

  if (
    range.type ===
    "range"
  ) {
    if (
      numericValue <
      range.min
    ) {
      return "LOW";
    }

    if (
      numericValue >
      range.max
    ) {
      return "HIGH";
    }

    return "NORMAL";
  }

  return "";
};

export default {
  text,
  getTestName,
  getDisplayUnit,
  getReferenceRange,
  getCriticalLow,
  getCriticalHigh,
  calculateQuantitativeFlag,
};
