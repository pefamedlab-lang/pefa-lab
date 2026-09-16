/* ==========================================================
   PEFA LAB
   QUANTITATIVE RESULT METADATA
   ----------------------------------------------------------
   AUTHORITATIVE FBS CONFIGURATION
   ----------------------------------------------------------
   FBS / FBS (GLUCOMETER) reference interval:

      70 - 110 mg/dL

   IMPORTANT
   ----------------------------------------------------------
   FBS is an explicit PEFA local laboratory configuration.

   It intentionally takes priority over:
   - saved result reference_range
   - master_tests reference_range
   - nested master-test metadata
   - generic fallback metadata

   Therefore an old database value such as:

      70 - 99 mg/dL

   will NOT override the PEFA FBS range.

   The same reference range is passed into the quantitative
   flag engine, ensuring display and flag calculation use
   the same limits.
   ========================================================== */


/* ==========================================================
   BASIC TEXT HELPERS
   ========================================================== */

export const text = (value) =>
  String(value ?? "").trim();


export const normalizeText = (value) =>
  text(value)
    .replace(/[–—−]/g, "-")
    .replace(/[()]/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();


const normalize = normalizeText;


/* ==========================================================
   PLACEHOLDER VALUES
   ========================================================== */

const PLACEHOLDER_REFERENCES = new Set([
  "",
  "-",
  "--",
  "—",
  "n/a",
  "n.a",
  "n.a.",
  "na",
  "none",
  "null",
  "undefined",
  "not applicable",
  "not available",
  "not configured",
  "not set",
  "not specified",
  "unresolved",
  "unknown",
  "pending",
]);


const isPlaceholderReference = (value) => {
  const normalized = normalize(value);

  return PLACEHOLDER_REFERENCES.has(
    normalized
  );
};


const usableReference = (value) => {
  const valueText = text(value);

  if (!valueText) {
    return "";
  }

  return isPlaceholderReference(valueText)
    ? ""
    : valueText;
};


/* ==========================================================
   GENERIC FIRST-USABLE HELPER
   ========================================================== */

const firstUsable = (...values) => {

  for (const value of values) {

    const resolved =
      usableReference(value);

    if (resolved) {
      return resolved;
    }
  }

  return "";
};


/* ==========================================================
   OBJECT HELPER
   ========================================================== */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);


/* ==========================================================
   MASTER TEST OBJECTS
   ========================================================== */

const getMasterObjects = (
  test = {}
) => {

  if (!isObject(test)) {
    return [];
  }


  const masterTest =
    isObject(test.masterTest)
      ? test.masterTest
      : null;


  const master_test =
    isObject(test.master_test)
      ? test.master_test
      : null;


  const master =
    isObject(test.master)
      ? test.master
      : null;


  const metadata =
    isObject(test.metadata)
      ? test.metadata
      : null;


  const testMetadata =
    isObject(test.testMetadata)
      ? test.testMetadata
      : null;


  return [
    test,
    masterTest,
    master_test,
    master,
    metadata,
    testMetadata,
  ].filter(isObject);
};


/* ==========================================================
   MASTER FIELD
   ========================================================== */

const getMasterField = (
  test = {},
  ...fieldNames
) => {

  const objects =
    getMasterObjects(test);


  for (const object of objects) {

    for (const fieldName of fieldNames) {

      const value =
        object?.[fieldName];


      if (
        value !== null &&
        value !== undefined &&
        text(value) !== ""
      ) {
        return value;
      }
    }
  }


  return null;
};


/* ==========================================================
   PATIENT OBJECTS
   ========================================================== */

const getPatientObjects = (
  patient = {}
) => {

  if (!isObject(patient)) {
    return [];
  }


  return [
    patient,
    patient.patient,
    patient.registration,
    patient.patientData,
    patient.patient_data,
    patient.demographics,
    patient.demographic,
  ].filter(isObject);
};


/* ==========================================================
   PATIENT SEX NORMALIZATION
   ========================================================== */

const normalizeSex = (
  value
) => {

  const normalized =
    normalizeText(value);


  if (
    [
      "male",
      "m",
      "man",
      "boy",
      "masculine",
    ].includes(normalized)
  ) {
    return "male";
  }


  if (
    [
      "female",
      "f",
      "woman",
      "girl",
      "feminine",
    ].includes(normalized)
  ) {
    return "female";
  }


  return normalized;
};


/* ==========================================================
   PATIENT SEX
   ========================================================== */

const getPatientSex = (
  patient = {}
) => {

  const objects =
    getPatientObjects(patient);


  const fields = [
    "sex",
    "gender",
    "patient_sex",
    "patientSex",
    "patient_gender",
    "patientGender",
    "biological_sex",
    "biologicalSex",
  ];


  for (const object of objects) {

    for (const field of fields) {

      const value =
        object?.[field];


      if (
        value !== null &&
        value !== undefined &&
        text(value) !== ""
      ) {
        return normalizeSex(value);
      }
    }
  }


  return "";
};


/* ==========================================================
   AGE PARSER
   ========================================================== */

const parseAge = (
  value
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }


  if (
    typeof value === "string" &&
    /month|months|year|years/i.test(value)
  ) {

    const match =
      value.match(
        /(-?\d+(?:\.\d+)?)/
      );


    if (!match) {
      return null;
    }


    const numeric =
      Number(match[1]);


    if (
      !Number.isFinite(numeric) ||
      numeric < 0
    ) {
      return null;
    }


    if (/month/i.test(value)) {
      return numeric / 12;
    }


    return numeric;
  }


  const numeric =
    Number(value);


  if (
    Number.isFinite(numeric) &&
    numeric >= 0
  ) {
    return numeric;
  }


  return null;
};


/* ==========================================================
   AGE FROM DOB
   ========================================================== */

const calculateAgeFromDOB = (
  dob
) => {

  if (!dob) {
    return null;
  }


  const birth =
    new Date(dob);


  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return null;
  }


  const today =
    new Date();


  let age =
    today.getFullYear() -
    birth.getFullYear();


  const monthDifference =
    today.getMonth() -
    birth.getMonth();


  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age -= 1;
  }


  return age >= 0
    ? age
    : null;
};


/* ==========================================================
   PATIENT AGE
   ========================================================== */

const getPatientAge = (
  patient = {}
) => {

  const objects =
    getPatientObjects(patient);


  const ageFields = [
    "age",
    "age_years",
    "ageYears",
    "patient_age",
    "patientAge",
    "age_in_years",
    "ageInYears",
  ];


  for (const object of objects) {

    for (const field of ageFields) {

      const parsed =
        parseAge(
          object?.[field]
        );


      if (parsed !== null) {
        return parsed;
      }
    }
  }


  const dobFields = [
    "date_of_birth",
    "dateOfBirth",
    "dob",
    "birth_date",
    "birthDate",
    "dateofbirth",
  ];


  for (const object of objects) {

    for (const field of dobFields) {

      const dob =
        object?.[field];


      if (dob) {

        const age =
          calculateAgeFromDOB(
            dob
          );


        if (age !== null) {
          return age;
        }
      }
    }
  }


  return null;
};


/* ==========================================================
   TEST NAME
   ========================================================== */

export const getTestName = (
  test = {}
) => {

  const objects =
    getMasterObjects(test);


  const fields = [
    "test_name",
    "testName",
    "name",
    "test",
    "display_name",
    "displayName",
    "test_title",
    "testTitle",
    "label",
    "title",
  ];


  for (const object of objects) {

    for (const field of fields) {

      const value =
        object?.[field];


      if (
        value !== null &&
        value !== undefined &&
        text(value) !== ""
      ) {
        return text(value);
      }
    }
  }


  return "Laboratory Test";
};


/* ==========================================================
   TEST IDENTITY
   ========================================================== */

const getTestIdentityValues = (
  test = {}
) => {

  const objects =
    getMasterObjects(test);


  const fields = [
    "test_name",
    "testName",
    "name",
    "test",
    "display_name",
    "displayName",
    "test_title",
    "testTitle",
    "label",
    "title",

    "code",
    "test_code",
    "testCode",

    "test_id",
    "testId",

    "key",
    "test_key",
    "testKey",

    "slug",
    "identifier",
  ];


  const identities = [];


  for (const object of objects) {

    for (const field of fields) {

      const value =
        object?.[field];


      if (
        value !== null &&
        value !== undefined &&
        text(value) !== ""
      ) {

        identities.push(
          normalizeText(value)
        );
      }
    }
  }


  return [
    ...new Set(
      identities
    ),
  ];
};


/* ==========================================================
   PEFA FBS DETECTION
   ========================================================== */

export const isPEFAFBS = (
  test = {}
) => {

  const identities =
    getTestIdentityValues(test);


  return identities.some(
    (identity) => {

      if (!identity) {
        return false;
      }


      /*
       * Remove spaces, hyphens and underscores
       * for robust matching.
       *
       * Examples:
       *
       * FBS
       * FBS (GLUCOMETER)
       * FBS-GLUCOMETER
       * FASTING BLOOD SUGAR
       * FASTING BLOOD GLUCOSE
       */

      const compact =
        identity.replace(
          /[\s_-]+/g,
          ""
        );


      return (
        compact === "fbs" ||

        compact ===
          "fbsglucometer" ||

        compact ===
          "fastingbloodsugar" ||

        compact ===
          "fastingbloodsugarglucometer" ||

        compact ===
          "fastingbloodglucose" ||

        compact ===
          "fastingbloodglucoseglucometer" ||

        compact ===
          "fastingplasmaglucose"
      );
    }
  );
};


/* ==========================================================
   AUTHORITATIVE PEFA FBS RANGE
   ========================================================== */

export const PEFA_FBS_REFERENCE_RANGE =
  "70 - 110 mg/dL";


/* ==========================================================
   TOTAL PSA
   ========================================================== */

const isTotalPSA = (
  test = {}
) => {

  const identities =
    getTestIdentityValues(test);


  return identities.some(
    (identity) => {

      const compact =
        identity.replace(
          /[\s_-]+/g,
          ""
        );


      if (
        [
          "psa",
          "totalpsa",
          "psatotal",
          "tpsa",
        ].includes(compact)
      ) {
        return true;
      }


      if (
        identity.includes(
          "prostate specific antigen"
        ) ||
        identity.includes(
          "prostate-specific antigen"
        )
      ) {
        return true;
      }


      return (
        /\bpsa\b/.test(
          identity
        ) &&
        (
          identity.includes(
            "total"
          ) ||
          identity === "psa"
        )
      );
    }
  );
};


/* ==========================================================
   PSA REFERENCE RANGE
   ========================================================== */

const getPSAReferenceRange = (
  patient = {}
) => {

  const sex =
    getPatientSex(patient);


  const age =
    getPatientAge(patient);


  if (
    sex === "female"
  ) {
    return "Not applicable";
  }


  if (
    !Number.isFinite(age)
  ) {
    return "Age required";
  }


  if (age < 40) {
    return "≤ 2.0";
  }


  if (age < 50) {
    return "≤ 2.5";
  }


  if (age < 60) {
    return "≤ 3.5";
  }


  if (age < 70) {
    return "≤ 4.5";
  }


  if (age < 80) {
    return "≤ 6.5";
  }


  return "≤ 7.2";
};


/* ==========================================================
   DISPLAY UNIT
   ========================================================== */

export const getDisplayUnit = (
  test = {},
  result = {}
) => {

  const resultObjects = [
    result,
    result?.result,
  ].filter(isObject);


  const fields = [
    "unit",
    "result_unit",
    "resultUnit",
    "display_unit",
    "displayUnit",
    "measurement_unit",
    "measurementUnit",
  ];


  for (
    const object of resultObjects
  ) {

    for (
      const field of fields
    ) {

      const value =
        usableReference(
          object?.[field]
        );


      if (value) {
        return value;
      }
    }
  }


  const configuredUnit =
    firstUsable(
      getMasterField(
        test,
        ...fields
      )
    );


  if (configuredUnit) {
    return configuredUnit;
  }


  /*
   * FBS is configured by PEFA in mg/dL.
   */

  if (
    isPEFAFBS(test)
  ) {
    return "mg/dL";
  }


  return "";
};


/* ==========================================================
   CRITICAL LOW
   ========================================================== */

export const getCriticalLow = (
  test = {},
  result = {}
) => {

  const resultObjects = [
    result,
    result?.result,
  ].filter(isObject);


  const fields = [
    "critical_low",
    "criticalLow",
    "critical_min",
    "criticalMin",
  ];


  for (
    const object of resultObjects
  ) {

    for (
      const field of fields
    ) {

      const value =
        object?.[field];


      if (
        value !== null &&
        value !== undefined &&
        text(value) !== ""
      ) {
        return value;
      }
    }
  }


  return getMasterField(
    test,
    ...fields
  );
};


/* ==========================================================
   CRITICAL HIGH
   ========================================================== */

export const getCriticalHigh = (
  test = {},
  result = {}
) => {

  const resultObjects = [
    result,
    result?.result,
  ].filter(isObject);


  const fields = [
    "critical_high",
    "criticalHigh",
    "critical_max",
    "criticalMax",
  ];


  for (
    const object of resultObjects
  ) {

    for (
      const field of fields
    ) {

      const value =
        object?.[field];


      if (
        value !== null &&
        value !== undefined &&
        text(value) !== ""
      ) {
        return value;
      }
    }
  }


  return getMasterField(
    test,
    ...fields
  );
};


/* ==========================================================
   RESULT / PATIENT ARGUMENT DETECTION
   ========================================================== */

const looksLikeResultObject = (
  value
) => {

  if (!isObject(value)) {
    return false;
  }


  return Boolean(
    value.result !== undefined ||
    value.result_numeric !== undefined ||
    value.result_value !== undefined ||
    value.value !== undefined ||
    value.reference_range !== undefined ||
    value.referenceRange !== undefined ||
    value.result_flag !== undefined ||
    value.flag !== undefined
  );
};


const looksLikePatientObject = (
  value
) => {

  if (!isObject(value)) {
    return false;
  }


  return Boolean(
    value.sex !== undefined ||
    value.gender !== undefined ||
    value.age !== undefined ||
    value.age_years !== undefined ||
    value.ageYears !== undefined ||
    value.patient_sex !== undefined ||
    value.patientSex !== undefined ||
    value.patient_age !== undefined ||
    value.patientAge !== undefined ||
    value.date_of_birth !== undefined ||
    value.dateOfBirth !== undefined ||
    value.dob !== undefined ||
    value.patient !== undefined
  );
};


/* ==========================================================
   NORMALIZE REFERENCE ARGUMENTS
   ========================================================== */

const normalizeReferenceArguments = (
  second = {},
  third = {}
) => {

  let patient =
    second || {};


  let result =
    third || {};


  /*
   * Compatibility with older PEFA calls:

       getReferenceRange(
         test,
         result,
         patient
       )
   */

  if (
    looksLikeResultObject(
      second
    ) &&
    looksLikePatientObject(
      third
    )
  ) {

    patient =
      third;


    result =
      second;
  }


  return {
    patient:
      patient || {},

    result:
      result || {},
  };
};


/* ==========================================================
   REFERENCE RANGE
   ----------------------------------------------------------
   AUTHORITY ORDER:

   1. PEFA FBS local override
   2. Canonical PSA
   3. Saved result reference
   4. Child range
   5. Elderly range
   6. Male range
   7. Female range
   8. Generic reference range
   9. Reference value
   10. Normal low/high
   11. No configuration

   IMPORTANT:
   ----------------------------------------------------------
   FBS MUST remain at position #1.
   ========================================================== */

export const getReferenceRange = (
  test = {},
  second = {},
  third = {}
) => {

  const {
    patient,
    result,
  } =
    normalizeReferenceArguments(
      second,
      third
    );


  /* ========================================================
     PEFA FBS — ABSOLUTE OVERRIDE
     ======================================================== */

  if (
    isPEFAFBS(test)
  ) {

    return PEFA_FBS_REFERENCE_RANGE;
  }


  /* ========================================================
     CANONICAL PSA
     ======================================================== */

  if (
    isTotalPSA(test)
  ) {

    return getPSAReferenceRange(
      patient
    );
  }


  /* ========================================================
     PATIENT DATA
     ======================================================== */

  const age =
    getPatientAge(
      patient
    );


  const sex =
    getPatientSex(
      patient
    );


  /* ========================================================
     SAVED RESULT REFERENCE
     ======================================================== */

  const savedReference =
    firstUsable(

      result?.reference_range,

      result?.referenceRange,

      result?.reference_value,

      result?.referenceValue
    );


  if (
    savedReference
  ) {

    return savedReference;
  }


  /* ========================================================
     CHILD RANGE
     ======================================================== */

  const childRange =
    firstUsable(

      getMasterField(

        test,

        "child_range",

        "childRange",

        "pediatric_range",

        "pediatricRange"
      )
    );


  /* ========================================================
     ELDERLY RANGE
     ======================================================== */

  const elderlyRange =
    firstUsable(

      getMasterField(

        test,

        "elderly_range",

        "elderlyRange",

        "geriatric_range",

        "geriatricRange"
      )
    );


  /* ========================================================
     MALE RANGE
     ======================================================== */

  const maleRange =
    firstUsable(

      getMasterField(

        test,

        "male_range",

        "maleRange",

        "male_reference_range",

        "maleReferenceRange"
      )
    );


  /* ========================================================
     FEMALE RANGE
     ======================================================== */

  const femaleRange =
    firstUsable(

      getMasterField(

        test,

        "female_range",

        "femaleRange",

        "female_reference_range",

        "femaleReferenceRange"
      )
    );


  /* ========================================================
     CHILD
     ======================================================== */

  if (
    Number.isFinite(age) &&
    age < 18 &&
    childRange
  ) {

    return childRange;
  }


  /* ========================================================
     ELDERLY
     ======================================================== */

  if (
    Number.isFinite(age) &&
    age >= 65 &&
    elderlyRange
  ) {

    return elderlyRange;
  }


  /* ========================================================
     SEX-SPECIFIC
     ======================================================== */

  if (
    sex === "male" &&
    maleRange
  ) {

    return maleRange;
  }


  if (
    sex === "female" &&
    femaleRange
  ) {

    return femaleRange;
  }


  /* ========================================================
     GENERIC MASTER REFERENCE RANGE
     ======================================================== */

  const genericReference =
    firstUsable(

      getMasterField(

        test,

        "reference_range",

        "referenceRange",

        "reference",

        "normal_range",

        "normalRange"
      )
    );


  if (
    genericReference
  ) {

    return genericReference;
  }


  /* ========================================================
     REFERENCE VALUE
     ======================================================== */

  const referenceValue =
    firstUsable(

      getMasterField(

        test,

        "reference_value",

        "referenceValue"
      )
    );


  if (
    referenceValue
  ) {

    return referenceValue;
  }


  /* ========================================================
     NORMAL LOW / HIGH
     ======================================================== */

  const low =
    firstUsable(

      getMasterField(

        test,

        "normal_low",

        "normalLow",

        "reference_low",

        "referenceLow"
      )
    );


  const high =
    firstUsable(

      getMasterField(

        test,

        "normal_high",

        "normalHigh",

        "reference_high",

        "referenceHigh"
      )
    );


  if (
    low &&
    high
  ) {

    return `${low} - ${high}`;
  }


  if (low) {
    return `≥ ${low}`;
  }


  if (high) {
    return `≤ ${high}`;
  }


  /* ========================================================
     UNRESOLVED
     ======================================================== */

  return "";
};


/* ==========================================================
   NUMERIC PARSER
   ========================================================== */

const parseNumeric = (
  value
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }


  const normalized =
    String(value)
      .replace(/,/g, "")
      .trim();


  const numeric =
    Number(normalized);


  return Number.isFinite(
    numeric
  )
    ? numeric
    : null;
};


/* ==========================================================
   REFERENCE RANGE PARSER
   ========================================================== */

const parseReference = (
  referenceRange
) => {

  const raw =
    text(referenceRange)
      .replace(
        /[–—−]/g,
        "-"
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  if (!raw) {
    return null;
  }


  /* --------------------------------------------------------
     MINIMUM
     -------------------------------------------------------- */

  let match =
    raw.match(
      /^(?:>=|≥|>)\s*(-?\d+(?:\.\d+)?)$/i
    );


  if (match) {

    return {
      type:
        "minimum",

      min:
        Number(match[1]),

      max:
        null,
    };
  }


  /* --------------------------------------------------------
     MAXIMUM
     -------------------------------------------------------- */

  match =
    raw.match(
      /^(?:<=|≤|<)\s*(-?\d+(?:\.\d+)?)$/i
    );


  if (match) {

    return {
      type:
        "maximum",

      min:
        null,

      max:
        Number(match[1]),
    };
  }


  /* --------------------------------------------------------
     RANGE
     -------------------------------------------------------- */

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

      type:
        "range",

      min:
        Math.min(
          first,
          second
        ),

      max:
        Math.max(
          first,
          second
        ),
    };
  }


  return null;
};


/* ==========================================================
   QUANTITATIVE FLAG ENGINE
   ========================================================== */

export const calculateQuantitativeFlag = ({
  value,
  referenceRange,
  criticalLow = null,
  criticalHigh = null,
}) => {

  const numericValue =
    parseNumeric(
      value
    );


  if (
    numericValue === null
  ) {
    return "";
  }


  /* --------------------------------------------------------
     CRITICAL LIMITS
     -------------------------------------------------------- */

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


  /* --------------------------------------------------------
     REFERENCE RANGE
     -------------------------------------------------------- */

  const range =
    parseReference(
      referenceRange
    );


  if (!range) {
    return "";
  }


  /* --------------------------------------------------------
     MINIMUM
     -------------------------------------------------------- */

  if (
    range.type ===
    "minimum"
  ) {

    return numericValue >=
      range.min
      ? "NORMAL"
      : "LOW";
  }


  /* --------------------------------------------------------
     MAXIMUM
     -------------------------------------------------------- */

  if (
    range.type ===
    "maximum"
  ) {

    return numericValue <=
      range.max
      ? "NORMAL"
      : "HIGH";
  }


  /* --------------------------------------------------------
     NORMAL RANGE
     -------------------------------------------------------- */

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


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default {

  text,

  normalizeText,

  getTestName,

  getDisplayUnit,

  getReferenceRange,

  getCriticalLow,

  getCriticalHigh,

  calculateQuantitativeFlag,

  isPEFAFBS,

  PEFA_FBS_REFERENCE_RANGE,
};