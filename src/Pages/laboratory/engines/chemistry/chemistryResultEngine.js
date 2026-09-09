/* ==========================================================
   PEFA LAB
   CHEMISTRY RESULT ENGINE
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/engines/chemistry/chemistryResultEngine.js

   PURPOSE
   ----------------------------------------------------------
   Central Chemistry result-processing engine.

   RESPONSIBILITIES
   ----------------------------------------------------------
   1. Resolve patient-appropriate reference ranges.
   2. Parse numeric reference intervals.
   3. Automatically flag numeric results.
   4. Support LOW / NORMAL / HIGH.
   5. Support CRITICAL LOW / CRITICAL HIGH when configured.
   6. Preserve manually supplied flags where appropriate.
   7. Process calculated Chemistry parameters.
   8. Generate laboratory-pattern interpretation.
   9. Work with ALL Chemistry panels.

   IMPORTANT
   ----------------------------------------------------------
   This engine:
      - Does NOT access Supabase.
      - Does NOT save results.
      - Does NOT mutate database records.
      - Does NOT diagnose disease.
      - Uses parameter configuration supplied by the caller.

   SUPPORTED REFERENCE SOURCES
   ----------------------------------------------------------
   parameter.reference_range
   parameter.referenceRange
   parameter.reference_value
   parameter.referenceValue
   parameter.male_range
   parameter.female_range
   parameter.child_range
   parameter.elderly_range
   parameter.adult_range
   parameter.critical_low
   parameter.critical_high
   parameter.criticalLow
   parameter.criticalHigh

   FLAG VALUES
   ----------------------------------------------------------
   ""
   N
   L
   H
   LL
   HH

   INTERPRETATION
   ----------------------------------------------------------
   Produces a laboratory-pattern summary.

   It deliberately avoids making a definitive diagnosis.
   ========================================================== */


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);


export const normalizeChemistryKey = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")
    .toLowerCase();


export const toChemistryNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const normalized =
    String(value)
      .replace(/,/g, "")
      .trim();

  if (!normalized) {
    return null;
  }

  /*
   * Only accept a complete numeric value.
   *
   * Examples:
   *  "12"
   *  "12.5"
   *  "-2"
   *  "1.2e3"
   *
   * Do NOT convert:
   *  "positive"
   *  "trace"
   *  "12 mg/dL"
   */
  const numericPattern =
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

  if (!numericPattern.test(normalized)) {
    return null;
  }

  const numeric =
    Number(normalized);

  return Number.isFinite(numeric)
    ? numeric
    : null;
};


/* ==========================================================
   AGE
   ========================================================== */

export const getPatientAgeInYears = (
  patient = {}
) => {
  const directAge =
    patient?.age ??
    patient?.age_years ??
    patient?.ageYears;

  if (
    directAge !== null &&
    directAge !== undefined &&
    directAge !== ""
  ) {
    const numeric =
      Number(directAge);

    if (
      Number.isFinite(numeric) &&
      numeric >= 0
    ) {
      return numeric;
    }
  }

  const dob =
    patient?.date_of_birth ||
    patient?.dateOfBirth ||
    patient?.dob;

  if (!dob) {
    return null;
  }

  const birthDate =
    new Date(dob);

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

  let age =
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

  return age >= 0
    ? age
    : null;
};


/* ==========================================================
   SEX
   ========================================================== */

export const getPatientSex = (
  patient = {}
) => {
  const value =
    patient?.sex ??
    patient?.gender ??
    patient?.patient_sex ??
    patient?.patientGender ??
    "";

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  if (
    normalized === "m" ||
    normalized === "male"
  ) {
    return "male";
  }

  if (
    normalized === "f" ||
    normalized === "female"
  ) {
    return "female";
  }

  return "";
};


/* ==========================================================
   CHILD DETECTION
   ========================================================== */

export const isChildPatient = (
  patient = {}
) => {
  const age =
    getPatientAgeInYears(
      patient
    );

  if (age === null) {
    return false;
  }

  return age < 18;
};


/* ==========================================================
   ELDERLY DETECTION
   ========================================================== */

export const isElderlyPatient = (
  patient = {}
) => {
  const age =
    getPatientAgeInYears(
      patient
    );

  if (age === null) {
    return false;
  }

  return age >= 65;
};


/* ==========================================================
   REFERENCE RANGE NORMALIZATION
   ========================================================== */

/*
 * Supported examples:
 *
 * "3.5 - 5.0"
 * "3.5–5.0"
 * "3.5 to 5.0"
 * "3.5–5"
 * "0.5 - 1.2 mg/dL"
 * "≤ 40"
 * "< 40"
 * ">= 10"
 * "> 10"
 * "10"
 *
 * Returns:
 *
 * {
 *   text,
 *   low,
 *   high,
 *   operator,
 *   numeric
 * }
 */

export const parseReferenceRange = (
  reference
) => {
  if (
    reference === null ||
    reference === undefined ||
    reference === ""
  ) {
    return {
      text: "",
      low: null,
      high: null,
      operator: null,
      numeric: false,
    };
  }

  const text =
    String(reference)
      .trim();

  if (!text) {
    return {
      text: "",
      low: null,
      high: null,
      operator: null,
      numeric: false,
    };
  }

  /*
   * Range:
   *
   * 3.5 - 5.0
   * 3.5 – 5.0
   * 3.5 to 5.0
   */
  const rangeMatch =
    text.match(
      /^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:-|–|—|to)\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i
    );

  if (rangeMatch) {
    const low =
      Number(rangeMatch[1]);

    const high =
      Number(rangeMatch[2]);

    if (
      Number.isFinite(low) &&
      Number.isFinite(high)
    ) {
      return {
        text,
        low: Math.min(
          low,
          high
        ),
        high: Math.max(
          low,
          high
        ),
        operator: "range",
        numeric: true,
      };
    }
  }

  /*
   * <= / ≤
   */
  const lessThanOrEqual =
    text.match(
      /^\s*(?:<=|≤)\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/
    );

  if (lessThanOrEqual) {
    const high =
      Number(
        lessThanOrEqual[1]
      );

    if (
      Number.isFinite(high)
    ) {
      return {
        text,
        low: null,
        high,
        operator: "<=",
        numeric: true,
      };
    }
  }

  /*
   * >= / ≥
   */
  const greaterThanOrEqual =
    text.match(
      /^\s*(?:>=|≥)\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/
    );

  if (greaterThanOrEqual) {
    const low =
      Number(
        greaterThanOrEqual[1]
      );

    if (
      Number.isFinite(low)
    ) {
      return {
        text,
        low,
        high: null,
        operator: ">=",
        numeric: true,
      };
    }
  }

  /*
   * <
   */
  const lessThan =
    text.match(
      /^\s*<\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/
    );

  if (lessThan) {
    const high =
      Number(
        lessThan[1]
      );

    if (
      Number.isFinite(high)
    ) {
      return {
        text,
        low: null,
        high,
        operator: "<",
        numeric: true,
      };
    }
  }

  /*
   * >
   */
  const greaterThan =
    text.match(
      /^\s*>\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/
    );

  if (greaterThan) {
    const low =
      Number(
        greaterThan[1]
      );

    if (
      Number.isFinite(low)
    ) {
      return {
        text,
        low,
        high: null,
        operator: ">",
        numeric: true,
      };
    }
  }

  /*
   * Single numeric reference.
   *
   * This is not enough to determine
   * HIGH/LOW, so we retain the text
   * but mark it as non-comparable.
   */
  const singleNumeric =
    toChemistryNumber(
      text
    );

  if (
    singleNumeric !== null
  ) {
    return {
      text,
      low: null,
      high: null,
      operator: "single",
      numeric: false,
    };
  }

  return {
    text,
    low: null,
    high: null,
    operator: null,
    numeric: false,
  };
};


/* ==========================================================
   REFERENCE SOURCE
   ========================================================== */

const getReferenceCandidate = (
  parameter
) => {
  if (!parameter) {
    return "";
  }

  return (
    parameter.reference_range ??
    parameter.referenceRange ??
    parameter.reference_value ??
    parameter.referenceValue ??
    ""
  );
};


/* ==========================================================
   PATIENT-SPECIFIC REFERENCE SELECTION
   ========================================================== */

export const resolveChemistryReference = ({
  parameter,
  patient = {},
} = {}) => {
  if (!parameter) {
    return {
      text: "",
      low: null,
      high: null,
      operator: null,
      numeric: false,
      source: null,
      category: null,
    };
  }

  const age =
    getPatientAgeInYears(
      patient
    );

  const sex =
    getPatientSex(
      patient
    );

  /*
   * Child has priority.
   */
  if (
    isChildPatient(patient) &&
    parameter.child_range
  ) {
    const parsed =
      parseReferenceRange(
        parameter.child_range
      );

    return {
      ...parsed,
      source: "child_range",
      category: "child",
    };
  }

  /*
   * Elderly has priority after child.
   */
  if (
    isElderlyPatient(patient) &&
    parameter.elderly_range
  ) {
    const parsed =
      parseReferenceRange(
        parameter.elderly_range
      );

    return {
      ...parsed,
      source: "elderly_range",
      category: "elderly",
    };
  }

  /*
   * Sex-specific ranges.
   */
  if (
    sex === "male" &&
    parameter.male_range
  ) {
    const parsed =
      parseReferenceRange(
        parameter.male_range
      );

    return {
      ...parsed,
      source: "male_range",
      category: "male",
    };
  }

  if (
    sex === "female" &&
    parameter.female_range
  ) {
    const parsed =
      parseReferenceRange(
        parameter.female_range
      );

    return {
      ...parsed,
      source: "female_range",
      category: "female",
    };
  }

  /*
   * Generic adult range.
   */
  if (
    parameter.adult_range
  ) {
    const parsed =
      parseReferenceRange(
        parameter.adult_range
      );

    return {
      ...parsed,
      source: "adult_range",
      category: "adult",
    };
  }

  /*
   * Generic reference.
   */
  const fallback =
    getReferenceCandidate(
      parameter
    );

  const parsed =
    parseReferenceRange(
      fallback
    );

  return {
    ...parsed,
    source:
      fallback
        ? "reference"
        : null,
    category:
      age !== null
        ? "adult"
        : null,
  };
};


/* ==========================================================
   CRITICAL LIMITS
   ========================================================== */

export const getCriticalLimits = (
  parameter
) => {
  if (!parameter) {
    return {
      low: null,
      high: null,
    };
  }

  const low =
    toChemistryNumber(
      parameter.critical_low ??
      parameter.criticalLow ??
      parameter.critical_low_value ??
      parameter.criticalLowValue
    );

  const high =
    toChemistryNumber(
      parameter.critical_high ??
      parameter.criticalHigh ??
      parameter.critical_high_value ??
      parameter.criticalHighValue
    );

  return {
    low,
    high,
  };
};


/* ==========================================================
   FLAG CALCULATION
   ========================================================== */

export const calculateChemistryFlag = ({
  value,
  reference,
  parameter,
} = {}) => {
  const numericValue =
    toChemistryNumber(
      value
    );

  /*
   * Non-numeric values cannot be
   * numerically flagged.
   */
  if (
    numericValue === null
  ) {
    return "";
  }

  const critical =
    getCriticalLimits(
      parameter
    );

  /*
   * Critical values first.
   */
  if (
    critical.low !== null &&
    numericValue < critical.low
  ) {
    return "LL";
  }

  if (
    critical.high !== null &&
    numericValue > critical.high
  ) {
    return "HH";
  }

  if (
    !reference ||
    !reference.numeric
  ) {
    return "";
  }

  /*
   * Range.
   */
  if (
    reference.low !== null &&
    numericValue < reference.low
  ) {
    return "L";
  }

  if (
    reference.high !== null &&
    numericValue > reference.high
  ) {
    return "H";
  }

  /*
   * Lower boundary.
   */
  if (
    reference.operator === ">=" &&
    reference.low !== null
  ) {
    return numericValue >= reference.low
      ? "N"
      : "L";
  }

  /*
   * Upper boundary.
   */
  if (
    (
      reference.operator === "<=" ||
      reference.operator === "<"
    ) &&
    reference.high !== null
  ) {
    if (
      reference.operator === "<" &&
      numericValue >= reference.high
    ) {
      return "H";
    }

    return numericValue <= reference.high
      ? "N"
      : "H";
  }

  /*
   * Lower-only.
   */
  if (
    reference.operator === ">" &&
    reference.low !== null
  ) {
    return numericValue > reference.low
      ? "N"
      : "L";
  }

  /*
   * Normal range.
   */
  if (
    reference.low !== null &&
    reference.high !== null
  ) {
    if (
      numericValue >= reference.low &&
      numericValue <= reference.high
    ) {
      return "N";
    }

    if (
      numericValue < reference.low
    ) {
      return "L";
    }

    if (
      numericValue > reference.high
    ) {
      return "H";
    }
  }

  return "";
};


/* ==========================================================
   PARAMETER PROCESSING
   ========================================================== */

export const processChemistryParameter = ({
  parameter,
  entry = {},
  patient = {},
} = {}) => {
  const safeEntry =
    isObject(entry)
      ? entry
      : {
          value:
            entry ?? "",
        };

  const reference =
    resolveChemistryReference({
      parameter,
      patient,
    });

  const calculated =
    parameter?.calculated === true;

  const value =
    safeEntry.value ??
    "";

  const autoFlag =
    calculateChemistryFlag({
      value,
      reference,
      parameter,
    });

  /*
   * Auto flag takes priority for numeric
   * results. For non-numeric results,
   * preserve an explicitly supplied flag.
   */
  const existingFlag =
    safeEntry.flag ?? "";

  const finalFlag =
    autoFlag ||
    existingFlag;

  return {
    ...safeEntry,

    value,

    unit:
      safeEntry.unit ??
      parameter?.unit ??
      "",

    reference_range:
      reference.text ||
      safeEntry.reference_range ||
      "",

    flag:
      finalFlag,

    calculated,

    reference_source:
      reference.source,

    reference_category:
      reference.category,

    reference_low:
      reference.low,

    reference_high:
      reference.high,

    critical_low:
      getCriticalLimits(
        parameter
      ).low,

    critical_high:
      getCriticalLimits(
        parameter
      ).high,
  };
};


/* ==========================================================
   PROCESS ALL PARAMETERS
   ========================================================== */

export const processChemistryParameters = ({
  analytes = [],
  parameters = {},
  patient = {},
} = {}) => {
  const output = {
    ...(parameters || {}),
  };

  analytes.forEach(
    (parameter) => {
      const key =
        normalizeChemistryKey(
          parameter?.key ||
          parameter?.id ||
          parameter?.name ||
          parameter?.test_name ||
          ""
        );

      if (!key) {
        return;
      }

      output[key] =
        processChemistryParameter({
          parameter,
          entry:
            parameters?.[key] ??
            {},
          patient,
        });
    }
  );

  return output;
};


/* ==========================================================
   FLAG SUMMARY
   ========================================================== */

export const summarizeChemistryFlags = (
  parameters = {}
) => {
  const summary = {
    total: 0,
    normal: 0,
    low: 0,
    high: 0,
    criticalLow: 0,
    criticalHigh: 0,
    unflagged: 0,
  };

  Object.values(
    parameters || {}
  ).forEach((entry) => {
    if (!isObject(entry)) {
      return;
    }

    summary.total += 1;

    switch (
      String(
        entry.flag ?? ""
      ).toUpperCase()
    ) {
      case "N":
        summary.normal += 1;
        break;

      case "L":
        summary.low += 1;
        break;

      case "H":
        summary.high += 1;
        break;

      case "LL":
        summary.criticalLow += 1;
        break;

      case "HH":
        summary.criticalHigh += 1;
        break;

      default:
        summary.unflagged += 1;
        break;
    }
  });

  return summary;
};


/* ==========================================================
   INTERPRETATION LABEL
   ========================================================== */

const getFlagText = (
  flag
) => {
  switch (
    String(flag ?? "")
      .toUpperCase()
  ) {
    case "L":
      return "low";

    case "H":
      return "high";

    case "LL":
      return "critically low";

    case "HH":
      return "critically high";

    case "N":
      return "within reference interval";

    default:
      return "";
  }
};


/* ==========================================================
   INTERPRETATION ENGINE
   ----------------------------------------------------------
   This is intentionally pattern-based.

   It does NOT diagnose a disease.
   ========================================================== */

export const generateChemistryInterpretation = ({
  analytes = [],
  parameters = {},
} = {}) => {
  const abnormal = [];
  const normal = [];
  const critical = [];

  analytes.forEach(
    (parameter) => {
      const key =
        normalizeChemistryKey(
          parameter?.key ||
          parameter?.id ||
          parameter?.name ||
          parameter?.test_name ||
          ""
        );

      if (!key) {
        return;
      }

      const entry =
        parameters?.[key];

      if (!entry) {
        return;
      }

      const flag =
        String(
          entry.flag ?? ""
        ).toUpperCase();

      const name =
        parameter?.name ||
        parameter?.label ||
        parameter?.test_name ||
        key;

      if (
        flag === "N"
      ) {
        normal.push(name);
      }

      if (
        ["L", "H"].includes(
          flag
        )
      ) {
        abnormal.push({
          name,
          flag,
        });
      }

      if (
        ["LL", "HH"].includes(
          flag
        )
      ) {
        critical.push({
          name,
          flag,
        });
      }
    }
  );

  const statements = [];

  /*
   * Critical values.
   */
  if (critical.length) {
    const criticalText =
      critical
        .map(
          (item) =>
            `${item.name} (${getFlagText(item.flag)})`
        )
        .join(", ");

    statements.push(
      `Critical laboratory abnormality identified in ${criticalText}. Prompt clinical review is recommended according to laboratory critical-value policy.`
    );
  }

  /*
   * Abnormal results.
   */
  if (abnormal.length) {
    const high =
      abnormal
        .filter(
          (item) =>
            item.flag === "H"
        )
        .map(
          (item) =>
            item.name
        );

    const low =
      abnormal
        .filter(
          (item) =>
            item.flag === "L"
        )
        .map(
          (item) =>
            item.name
        );

    if (high.length) {
      statements.push(
        `Elevated ${high.join(", ")}.`
      );
    }

    if (low.length) {
      statements.push(
        `Reduced ${low.join(", ")}.`
      );
    }

    statements.push(
      "Interpret results in conjunction with the patient's clinical findings and other relevant laboratory parameters."
    );
  }

  /*
   * Completely normal panel.
   */
  if (
    !abnormal.length &&
    !critical.length &&
    normal.length
  ) {
    statements.push(
      "The reported Chemistry parameters are within their applicable reference intervals."
    );
  }

  /*
   * No numeric interpretation available.
   */
  if (
    !statements.length
  ) {
    return "";
  }

  return statements.join(
    " "
  );
};


/* ==========================================================
   FULL CHEMISTRY RESULT PROCESSOR
   ========================================================== */

export const processChemistryResults = ({
  analytes = [],
  parameters = {},
  patient = {},
} = {}) => {
  const processedParameters =
    processChemistryParameters({
      analytes,
      parameters,
      patient,
    });

  const summary =
    summarizeChemistryFlags(
      processedParameters
    );

  const interpretation =
    generateChemistryInterpretation({
      analytes,
      parameters:
        processedParameters,
    });

  return {
    parameters:
      processedParameters,

    summary,

    interpretation,

    hasAbnormalResults:
      summary.low > 0 ||
      summary.high > 0 ||
      summary.criticalLow > 0 ||
      summary.criticalHigh > 0,

    hasCriticalResults:
      summary.criticalLow > 0 ||
      summary.criticalHigh > 0,
  };
};


/* ==========================================================
   PUBLIC EXPORTS
   ========================================================== */

export default {
  normalizeChemistryKey,
  toChemistryNumber,

  getPatientAgeInYears,
  getPatientSex,
  isChildPatient,
  isElderlyPatient,

  parseReferenceRange,
  resolveChemistryReference,

  getCriticalLimits,
  calculateChemistryFlag,

  processChemistryParameter,
  processChemistryParameters,

  summarizeChemistryFlags,
  generateChemistryInterpretation,

  processChemistryResults,
};