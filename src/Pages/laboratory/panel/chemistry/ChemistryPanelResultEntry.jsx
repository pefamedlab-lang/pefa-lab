
/*
 * ==========================================================
 * PEFA ENTERPRISE LIS
 * ChemistryPanelResultEntry.jsx
 * ==========================================================
 *
 * Unified Chemistry Panel Result Entry
 *
 * Supports:
 *   LFT
 *   RFT / KFT
 *   FLP
 *   Serum Electrolytes
 *   Serum Bilirubin
 *
 * Features:
 *   - Edit Mode
 *   - Existing result hydration
 *   - Calculated parameters
 *   - Automatic reference range
 *   - Automatic quantitative flag
 *   - Critical flag
 *   - FLP calculations
 *   - LFT calculations
 *   - Parent-controlled persistence
 *   - Existing payload compatibility
 *
 * NO Supabase persistence occurs here.
 * ==========================================================
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getPanelParameters,
  resolveReferenceRange,
} from "../../../../services/laboratory/panelParameterService";

import {
  resolveChemistryReference,
} from "../../../../services/laboratory/chemistry/chemistryReferenceEngine";

import {
  flagChemistryResult,
} from "../../../../services/laboratory/chemistry/chemistryFlagEngine";

import {
  buildChemistryInterpretation,
} from "../../../../services/laboratory/chemistry/chemistryInterpretationEngine";

/* ==========================================================
   HELPERS
   ========================================================== */

const text = (
  value
) =>
  String(
    value ?? ""
  ).trim();

const normalize = (
  value
) =>
  text(value)
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .toLowerCase()
    .trim();

const firstValue = (
  ...values
) => {
  for (
    const value of
      values
  ) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
};

const numericValue = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const n =
    Number(
      String(value)
        .replace(
          /,/g,
          ""
        )
        .trim()
    );

  return Number.isFinite(n)
    ? n
    : null;
};

/* ==========================================================
   PARAMETER KEY
   ========================================================== */

const getParameterKey = (
  parameter
) =>
  text(
    parameter.key ||
    parameter.parameter_key ||
    parameter.test_name ||
    parameter.testName ||
    parameter.parameter_name ||
    parameter.name ||
    parameter.id
  )
    .replace(
      /[^\w]+/g,
      "_"
    )
    .replace(
      /^_+|_+$/g,
      ""
    )
    .toLowerCase();

/* ==========================================================
   PARAMETER NAME
   ========================================================== */

const getParameterName = (
  parameter
) =>
  firstValue(
    parameter.name,
    parameter.test_name,
    parameter.testName,
    parameter.parameter_name,
    parameter.parameterName,
    parameter.label,
    parameter.key,
    "Parameter"
  );

/* ==========================================================
   CALCULATED PARAMETERS
   ========================================================== */

/* ==========================================================
   RFT PARAMETER ALLOW-LIST
   ----------------------------------------------------------
   Defensive UI guard. Even if an upstream source accidentally
   supplies unrelated calculated chemistry parameters, RFT will
   display only its intended seven parameters.
   ========================================================== */

const RFT_ALLOWED_PARAMETER_NAMES = new Set([
  "urea",
  "serum urea",
  "creatinine",
  "serum creatinine",
  "sodium",
  "serum sodium",
  "potassium",
  "serum potassium",
  "chloride",
  "serum chloride",
  "bicarbonate",
  "serum bicarbonate",
  "egfr",
  "egfr (ckd epi)",
  "egfr ckd epi",
  "estimated gfr",
  "estimated glomerular filtration rate",
  "estimated glomerular filtration rate (egfr)",
]);

const isRenalFunctionPanel = (value) => {
  const name = normalize(value);
  return (
    name === "rft" ||
    name === "kft" ||
    name.includes("renal function") ||
    name.includes("renal profile") ||
    name.includes("kidney function")
  );
};

const isAllowedRftParameter = (parameter) => {
  const name = normalize(
    getParameterName(parameter)
  );

  return RFT_ALLOWED_PARAMETER_NAMES.has(name);
};

const calculatedNames = new Set([
  "globulin",
  "a/g ratio",
  "albumin/globulin ratio",
  "albumin globulin ratio",
  "indirect bilirubin",
  "bilirubin indirect",
  "vldl",
  "vldl cholesterol",
  "ldl",
  "ldl cholesterol",
  "non hdl cholesterol",
  "non-hdl cholesterol",
  "cholesterol/hdl ratio",
  "cholesterol hdl ratio",
  "ldl/hdl ratio",
  "ldl hdl ratio",
  "triglycerides/hdl ratio",
  "triglycerides hdl ratio",
  "triglyceride/hdl ratio",
  "triglyceride hdl ratio",
  "ast/alt ratio",
  "ast alt ratio",
  "ast to alt ratio",
  "sgot/sgpt ratio",
  "sgot sgpt ratio",
  "egfr",
  "estimated gfr",
  "estimated glomerular filtration rate",
  "estimated glomerular filtration rate (egfr)",
]);

const isCalculated = (
  parameter
) => {
  if (
    parameter.calculated === true ||
    parameter.isCalculated === true ||
    parameter.readOnly === true ||
    parameter.read_only === true
  ) {
    return true;
  }

  return calculatedNames.has(
    normalize(
      getParameterName(
        parameter
      )
    )
  );
};

/* ==========================================================
   NORMALIZE PARAMETER
   ========================================================== */

const normalizeParameter = (
  parameter
) => {
  const key =
    getParameterKey(
      parameter
    );

  const name =
    getParameterName(
      parameter
    );

  const calculated =
    isCalculated(
      parameter
    );

  return {
    ...parameter,

    key,

    name,

    test_name:
      firstValue(
        parameter.test_name,
        name
      ),

    parameter_name:
      firstValue(
        parameter.parameter_name,
        name
      ),

    calculated,

    isCalculated:
      calculated,

    readOnly:
      calculated,

    read_only:
      calculated,

    unit:
      firstValue(
        parameter.unit,
        parameter.result_unit,
        parameter.resultUnit
      ),

    result_unit:
      firstValue(
        parameter.result_unit,
        parameter.resultUnit,
        parameter.unit
      ),

    male_range:
      firstValue(
        parameter.male_range,
        parameter.maleRange
      ),

    female_range:
      firstValue(
        parameter.female_range,
        parameter.femaleRange
      ),

    child_range:
      firstValue(
        parameter.child_range,
        parameter.childRange
      ),

    elderly_range:
      firstValue(
        parameter.elderly_range,
        parameter.elderlyRange
      ),

    reference_value:
      firstValue(
        parameter.reference_value,
        parameter.referenceValue
      ),

    reference_range:
      firstValue(
        parameter.reference_range,
        parameter.referenceRange
      ),

    referenceRange:
      firstValue(
        parameter.referenceRange,
        parameter.reference_range
      ),

    critical_low:
      firstValue(
        parameter.critical_low,
        parameter.criticalLow,
        null
      ),

    critical_high:
      firstValue(
        parameter.critical_high,
        parameter.criticalHigh,
        null
      ),
  };
};

/* ==========================================================
   NORMALIZE ANALYTES
   ========================================================== */

const normalizeAnalytes = (
  rows = []
) => {
  const map =
    new Map();

  rows.forEach(
    (row) => {
      if (
        !row ||
        typeof row !==
          "object"
      ) {
        return;
      }

      const nested =
        row.master_test ||
        row.masterTest ||
        row.master_tests ||
        row.test ||
        null;

      const merged =
        nested &&
        typeof nested ===
          "object"
          ? {
              ...nested,
              ...row,
            }
          : row;

      const parameter =
        normalizeParameter(
          merged
        );

      if (
        !parameter.key
      ) {
        return;
      }

      const existing =
        map.get(
          parameter.key
        );

      if (!existing) {
        map.set(
          parameter.key,
          parameter
        );

        return;
      }

      const existingScore =
        [
          existing.male_range,
          existing.female_range,
          existing.child_range,
          existing.elderly_range,
          existing.reference_value,
          existing.unit,
        ].filter(Boolean)
          .length;

      const currentScore =
        [
          parameter.male_range,
          parameter.female_range,
          parameter.child_range,
          parameter.elderly_range,
          parameter.reference_value,
          parameter.unit,
        ].filter(Boolean)
          .length;

      if (
        currentScore >
        existingScore
      ) {
        map.set(
          parameter.key,
          {
            ...existing,
            ...parameter,
          }
        );
      }
    }
  );

  return [
    ...map.values(),
  ].sort(
    (a, b) => {
      const ao =
        Number(
          a.display_order
        );

      const bo =
        Number(
          b.display_order
        );

      if (
        Number.isFinite(ao) &&
        Number.isFinite(bo)
      ) {
        return (
          ao - bo
        );
      }

      return 0;
    }
  );
};

/* ==========================================================
   PATIENT AGE / SEX
   ========================================================== */

const getSex = (
  patient
) =>
  firstValue(
    patient?.sex,
    patient?.gender,
    patient?.patient?.sex,
    patient?.patient?.gender
  );

const getAge = (
  patient
) => {
  const direct =
    firstValue(
      patient?.age,
      patient?.age_years,
      patient?.ageYears,
      patient?.patient_age,
      patient?.patientAge,
      patient?.patient?.age
    );

  const numeric =
    numericValue(
      direct
    );

  if (
    numeric !== null
  ) {
    return numeric;
  }

  const dob =
    firstValue(
      patient?.date_of_birth,
      patient?.dateOfBirth,
      patient?.dob,
      patient?.patient?.date_of_birth,
      patient?.patient?.dob
    );

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

  const month =
    today.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age--;
  }

  return age;
};

/* ==========================================================
   CALCULATED REFERENCE FALLBACK
   ========================================================== */

const getCalculatedReference =
  (
    parameter
  ) => {
    const name =
      normalize(
        getParameterName(
          parameter
        )
      );

    const defaults = {
      "globulin": {
        range: "2.0 - 3.5",
        unit: firstValue(parameter.unit, "g/dL"),
      },

      "a/g ratio": {
        range: "1.0 - 2.2",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "albumin/globulin ratio": {
        range: "1.0 - 2.2",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "albumin globulin ratio": {
        range: "1.0 - 2.2",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "indirect bilirubin": {
        range: "0.2 - 0.9",
        unit: firstValue(parameter.unit, "mg/dL"),
      },

      "bilirubin indirect": {
        range: "0.2 - 0.9",
        unit: firstValue(parameter.unit, "mg/dL"),
      },

      "vldl": {
        range: "5 - 40",
        unit: firstValue(parameter.unit, "mg/dL"),
      },

      "vldl cholesterol": {
        range: "5 - 40",
        unit: firstValue(parameter.unit, "mg/dL"),
      },

      "ldl/hdl ratio": {
        range: "0 - 3.5",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "ldl hdl ratio": {
        range: "0 - 3.5",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "triglycerides/hdl ratio": {
        range: "0 - 3.5",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "triglycerides hdl ratio": {
        range: "0 - 3.5",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "triglyceride/hdl ratio": {
        range: "0 - 3.5",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "triglyceride hdl ratio": {
        range: "0 - 3.5",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "cholesterol/hdl ratio": {
        range: "0 - 5.0",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "cholesterol hdl ratio": {
        range: "0 - 5.0",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "tc/hdl ratio": {
        range: "0 - 5.0",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "non hdl cholesterol": {
        range: "0 - 130",
        unit: firstValue(parameter.unit, "mg/dL"),
      },

      "non-hdl cholesterol": {
        range: "0 - 130",
        unit: firstValue(parameter.unit, "mg/dL"),
      },

      "ast/alt ratio": {
        range: "0.7 - 1.3",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "ast alt ratio": {
        range: "0.7 - 1.3",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "ast to alt ratio": {
        range: "0.7 - 1.3",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "sgot/sgpt ratio": {
        range: "0.7 - 1.3",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "sgot sgpt ratio": {
        range: "0.7 - 1.3",
        unit: firstValue(parameter.unit, "Ratio"),
      },

      "egfr": {
        range: ">= 90",
        unit: firstValue(
          parameter.unit,
          "mL/min/1.73 m²"
        ),
      },

      "estimated gfr": {
        range: ">= 90",
        unit: firstValue(
          parameter.unit,
          "mL/min/1.73 m²"
        ),
      },

      "estimated glomerular filtration rate": {
        range: ">= 90",
        unit: firstValue(
          parameter.unit,
          "mL/min/1.73 m²"
        ),
      },

      "estimated glomerular filtration rate (egfr)": {
        range: ">= 90",
        unit: firstValue(
          parameter.unit,
          "mL/min/1.73 m²"
        ),
      },
    };

    if (defaults[name]) {
      return defaults[name];
    }

    return {
      range:
        firstValue(
          parameter.reference_range,
          parameter.referenceRange,
          parameter.reference_value
        ),
      unit:
        parameter.unit ||
        "",
    };
  };

/* ==========================================================
   REFERENCE
   ========================================================== */

const getReference = ({
  parameter,
  patient,
  registration,
  test,
}) => {
  const demographics = {
    sex:
      getSex(
        patient
      ),
    age:
      getAge(
        patient
      ),
  };

  const calculated =
    getCalculatedReference(
      parameter
    );

  /*
   * RFT/LFT fallback references. The authoritative panel service
   * normally supplies these. This defensive layer prevents the UI
   * from displaying "Not configured" when a legacy master_tests row
   * has an empty reference_value/range.
   */
  const fallbackReference = (() => {
    const name = normalize(getParameterName(parameter));
    const sex = normalize(getSex(patient));

    const table = {
      "urea": { range: "15 - 45", unit: "mg/dL" },
      "blood urea": { range: "15 - 45", unit: "mg/dL" },
      "creatinine": {
        male: "0.74 - 1.35",
        female: "0.59 - 1.04",
        unit: "mg/dL",
      },
      "serum creatinine": {
        male: "0.74 - 1.35",
        female: "0.59 - 1.04",
        unit: "mg/dL",
      },
      "sodium": { range: "135 - 145", unit: "mmol/L" },
      "serum sodium": { range: "135 - 145", unit: "mmol/L" },
      "potassium": { range: "3.5 - 5.1", unit: "mmol/L" },
      "serum potassium": { range: "3.5 - 5.1", unit: "mmol/L" },
      "chloride": { range: "98 - 107", unit: "mmol/L" },
      "serum chloride": { range: "98 - 107", unit: "mmol/L" },
      "bicarbonate": { range: "22 - 29", unit: "mmol/L" },
      "serum bicarbonate": { range: "22 - 29", unit: "mmol/L" },
      "egfr": { range: ">= 90", unit: "mL/min/1.73 m²" },
      "estimated gfr": { range: ">= 90", unit: "mL/min/1.73 m²" },
      "ast": { male: "10 - 40", female: "9 - 32", unit: "U/L" },
      "sgot": { male: "10 - 40", female: "9 - 32", unit: "U/L" },
      "alt": { male: "7 - 56", female: "7 - 35", unit: "U/L" },
      "sgpt": { male: "7 - 56", female: "7 - 35", unit: "U/L" },
      "alp": { range: "44 - 147", unit: "U/L" },
      "alkaline phosphatase": { range: "44 - 147", unit: "U/L" },
      "ggt": { male: "8 - 61", female: "5 - 36", unit: "U/L" },
      "gamma glutamyl transferase": { male: "8 - 61", female: "5 - 36", unit: "U/L" },
      "total protein": { range: "6.0 - 8.3", unit: "g/dL" },
      "albumin": { range: "3.5 - 5.0", unit: "g/dL" },
      "globulin": { range: "2.0 - 3.5", unit: "g/dL" },
      "a/g ratio": { range: "1.0 - 2.2", unit: "Ratio" },
      "albumin/globulin ratio": { range: "1.0 - 2.2", unit: "Ratio" },
      "total bilirubin": { range: "0.2 - 1.2", unit: "mg/dL" },
      "direct bilirubin": { range: "0.0 - 0.3", unit: "mg/dL" },
      "indirect bilirubin": { range: "0.2 - 0.9", unit: "mg/dL" },
      "ast/alt ratio": { range: "0.7 - 1.3", unit: "Ratio" },
    };

    const item = table[name];
    if (!item) return { range: "", unit: "" };

    const range =
      sex === "male" || sex === "m"
        ? firstValue(item.male, item.range)
        : sex === "female" || sex === "f"
          ? firstValue(item.female, item.range)
          : firstValue(item.range, item.male, item.female);

    return { range: text(range), unit: text(item.unit) };
  })();

  let serviceRange =
    "";

  try {
    serviceRange =
      resolveReferenceRange(
        parameter,
        demographics
      );
  } catch {
    serviceRange =
      "";
  }

  let engine =
    {};

  try {
    const response =
      resolveChemistryReference({
        parameter,
        patient:
          patient || {},
        registration:
          registration || {},
        test:
          test || {},
        defaultRange:
          firstValue(
            serviceRange,
            calculated.range,
            fallbackReference.range
          ),
      });

    if (
      response &&
      typeof response ===
        "object"
    ) {
      engine =
        response;
    }
  } catch {
    engine =
      {};
  }

  const range =
    firstValue(
      calculated.range,
      serviceRange,
      fallbackReference.range,
      parameter.reference_range,
      parameter.referenceRange,
      parameter.reference_value,
      engine.referenceRange,
      engine.reference_range,
      engine.display
    );

  return {
    referenceRange:
      text(range),

    reference_range:
      text(range),

    unit:
      firstValue(
        parameter.unit,
        calculated.unit,
        fallbackReference.unit,
        engine.unit
      ),

    criticalLow:
      firstValue(
        parameter.critical_low,
        parameter.criticalLow,
        engine.criticalLow,
        engine.critical_low,
        null
      ),

    criticalHigh:
      firstValue(
        parameter.critical_high,
        parameter.criticalHigh,
        engine.criticalHigh,
        engine.critical_high,
        null
      ),
  };
};

/* ==========================================================
   RANGE PARSER
   ========================================================== */

const parseReferenceRange =
  (
    value
  ) => {
    const raw =
      text(value)
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

    let match =
      raw.match(
        /^\s*(-?\d+(?:\.\d+)?)\s*(?:-|to|\.\.)\s*(-?\d+(?:\.\d+)?)\s*$/i
      );

    if (match) {
      return {
        type:
          "range",

        low:
          Math.min(
            Number(
              match[1]
            ),
            Number(
              match[2]
            )
          ),

        high:
          Math.max(
            Number(
              match[1]
            ),
            Number(
              match[2]
            )
          ),
      };
    }

    match =
      raw.match(
        /^\s*(?:>=|≥|>)\s*(-?\d+(?:\.\d+)?)\s*$/i
      );

    if (match) {
      return {
        type:
          "minimum",

        low:
          Number(
            match[1]
          ),

        high:
          null,
      };
    }

    match =
      raw.match(
        /^\s*(?:<=|≤|<)\s*(-?\d+(?:\.\d+)?)\s*$/i
      );

    if (match) {
      return {
        type:
          "maximum",

        low:
          null,

        high:
          Number(
            match[1]
          ),
      };
    }

    return null;
  };

/* ==========================================================
   QUANTITATIVE FLAG
   ========================================================== */

const calculateQuantitativeFlag =
  ({
    value,
    referenceRange,
    criticalLow,
    criticalHigh,
  }) => {
    const numeric =
      numericValue(
        value
      );

    if (
      numeric === null
    ) {
      return "";
    }

    const criticalL =
      numericValue(
        criticalLow
      );

    const criticalH =
      numericValue(
        criticalHigh
      );

    /*
     * Critical thresholds first.
     */
    if (
      criticalL !== null &&
      numeric <=
        criticalL
    ) {
      return "CRITICAL LOW";
    }

    if (
      criticalH !== null &&
      numeric >=
        criticalH
    ) {
      return "CRITICAL HIGH";
    }

    const parsed =
      parseReferenceRange(
        referenceRange
      );

    if (!parsed) {
      return "";
    }

    if (
      parsed.type ===
      "range"
    ) {
      if (
        numeric <
        parsed.low
      ) {
        return "LOW";
      }

      if (
        numeric >
        parsed.high
      ) {
        return "HIGH";
      }

      return "NORMAL";
    }

    if (
      parsed.type ===
      "minimum"
    ) {
      return numeric >=
        parsed.low
        ? "NORMAL"
        : "LOW";
    }

    if (
      parsed.type ===
      "maximum"
    ) {
      return numeric <=
        parsed.high
        ? "NORMAL"
        : "HIGH";
    }

    return "";
  };

/* ==========================================================
   NORMALIZE ENGINE FLAG
   ========================================================== */

const extractFlag =
  (
    response
  ) => {
    if (
      typeof response ===
      "string"
    ) {
      return text(
        response
      );
    }

    if (
      response &&
      typeof response ===
        "object"
    ) {
      return text(
        firstValue(
          response.flag,
          response.status,
          response.interpretation
        )
      );
    }

    return "";
  };

/* ==========================================================
   FINAL FLAG
   ========================================================== */

const getFinalFlag = ({
  value,
  parameter,
  reference,
  patient,
  registration,
  test,
}) => {
  const numeric =
    numericValue(
      value
    );

  if (
    numeric === null
  ) {
    return "";
  }

  let engineFlag =
    "";

  try {
    engineFlag =
      extractFlag(
        flagChemistryResult({
          value,
          result:
            value,

          parameter,

          reference: {
            ...reference,

            referenceRange:
              reference.referenceRange,

            reference_range:
              reference.referenceRange,

            criticalLow:
              reference.criticalLow,

            criticalHigh:
              reference.criticalHigh,

            unit:
              reference.unit,
          },

          patient:
            patient || {},

          registration:
            registration || {},

          test:
            test || {},
        })
      );
  } catch {
    engineFlag =
      "";
  }

  /*
   * NEVER allow Unresolved to reach the result form.
   */
  if (
    engineFlag &&
    ![
      "unresolved",
      "unknown",
      "pending",
      "n/a",
    ].includes(
      normalize(
        engineFlag
      )
    )
  ) {
    return engineFlag;
  }

  /*
   * Independent fallback.
   */
  return calculateQuantitativeFlag({
    value,

    referenceRange:
      reference.referenceRange,

    criticalLow:
      reference.criticalLow,

    criticalHigh:
      reference.criticalHigh,
  });
};

/* ==========================================================
   FIND PARAMETER
   ========================================================== */

const findParameter =
  (
    parameters,
    names
  ) => {
    const targets =
      names.map(
        normalize
      );

    return parameters.find(
      (parameter) =>
        targets.includes(
          normalize(
            getParameterName(
              parameter
            )
          )
        )
    );
  };

/* ==========================================================
   eGFR — 2021 CKD-EPI CREATININE EQUATION
   ----------------------------------------------------------
   Required:
     • Serum creatinine
     • Patient age
     • Patient sex

   Supported creatinine units:
     • mg/dL
     • µmol/L / umol/L

   Output:
     • mL/min/1.73 m²

   No race coefficient is used.

   This is an estimated GFR and must not be used alone
   to diagnose CKD or acute kidney injury.
   ========================================================== */

const getEgfrSex = (patient = {}) =>
  normalize(
    firstValue(
      patient?.sex,
      patient?.gender,
      patient?.patient?.sex,
      patient?.patient?.gender
    )
  );

const getEgfrAge = (patient = {}) =>
  getAge(patient);

const getCreatinineMgDl = (
  value,
  parameter = {}
) => {
  const numeric = numericValue(value);

  if (numeric === null || numeric <= 0) {
    return null;
  }

  const unit = normalize(
    firstValue(
      parameter?.unit,
      parameter?.result_unit,
      parameter?.resultUnit
    )
  );

  if (
    unit.includes("µmol") ||
    unit.includes("umol") ||
    unit.includes("micromol")
  ) {
    return numeric / 88.4;
  }

  return numeric;
};

const calculateEgfr = ({
  creatinine,
  creatinineParameter,
  age,
  sex,
}) => {
  const numericAge = numericValue(age);

  if (
    numericAge === null ||
    numericAge <= 0 ||
    numericAge > 120
  ) {
    return null;
  }

  const normalizedSex = normalize(sex);

  const female =
    normalizedSex === "female" ||
    normalizedSex === "f" ||
    normalizedSex === "woman";

  const male =
    normalizedSex === "male" ||
    normalizedSex === "m" ||
    normalizedSex === "man";

  if (!female && !male) {
    return null;
  }

  const scr = getCreatinineMgDl(
    creatinine,
    creatinineParameter
  );

  if (scr === null) {
    return null;
  }

  const kappa = female ? 0.7 : 0.9;
  const alpha = female ? -0.241 : -0.302;

  const ratio = scr / kappa;

  const result =
    142 *
    Math.pow(
      Math.min(ratio, 1),
      alpha
    ) *
    Math.pow(
      Math.max(ratio, 1),
      -1.2
    ) *
    Math.pow(
      0.9938,
      numericAge
    );

  return Number.isFinite(result)
    ? result
    : null;
};


/* ==========================================================
   BUILT-IN CALCULATIONS
   ========================================================== */

const calculatePanelValues =
  (
    parameters,
    patient = {}
  ) => {
    const output = {};

    const get =
      (...names) =>
        findParameter(
          parameters,
          names
        );

    /* Always read the current live result regardless of whether
       the caller stores it as value, result, result_value or
       entered_value. */
    const valueOf = (parameter) =>
      numericValue(
        firstValue(
          parameter?.value,
          parameter?.result,
          parameter?.result_value,
          parameter?.entered_value
        )
      );

    /* ========================================================
       LFT
       ======================================================== */
    const ast = get(
      "AST",
      "SGOT",
      "Aspartate Aminotransferase",
      "Aspartate Transaminase"
    );

    const alt = get(
      "ALT",
      "SGPT",
      "Alanine Aminotransferase",
      "Alanine Transaminase"
    );

    const astAltRatio = get(
      "AST/ALT Ratio",
      "AST ALT Ratio",
      "AST to ALT Ratio",
      "SGOT/SGPT Ratio",
      "SGOT SGPT Ratio"
    );

    const totalProtein = get(
      "Total Protein"
    );

    const albumin = get(
      "Albumin"
    );

    const globulin = get(
      "Globulin"
    );

    const agRatio = get(
      "A/G Ratio",
      "Albumin/Globulin Ratio",
      "Albumin Globulin Ratio"
    );

    const astValue = valueOf(ast);
    const altValue = valueOf(alt);
    const tp = valueOf(totalProtein);
    const alb = valueOf(albumin);

    if (
      astValue !== null &&
      altValue !== null &&
      altValue > 0 &&
      astAltRatio
    ) {
      output[astAltRatio.key] =
        (astValue / altValue).toFixed(2);
    }

    if (
      tp !== null &&
      alb !== null
    ) {
      const glob = tp - alb;

      if (glob > 0) {
        if (globulin) {
          output[globulin.key] =
            glob.toFixed(1);
        }

        if (agRatio) {
          output[agRatio.key] =
            (alb / glob).toFixed(2);
        }
      }
    }

    /* Indirect bilirubin = Total - Direct. */
    const totalBilirubin = get(
      "Total Bilirubin",
      "Bilirubin Total"
    );

    const directBilirubin = get(
      "Direct Bilirubin",
      "Bilirubin Direct"
    );

    const indirectBilirubin = get(
      "Indirect Bilirubin",
      "Bilirubin Indirect"
    );

    const totalB = valueOf(totalBilirubin);
    const directB = valueOf(directBilirubin);

    if (
      totalB !== null &&
      directB !== null &&
      totalB >= directB &&
      indirectBilirubin
    ) {
      output[indirectBilirubin.key] =
        (totalB - directB).toFixed(2);
    }

    /* ========================================================
       FLP
       ======================================================== */
    const totalCholesterol = get(
      "Total Cholesterol",
      "Cholesterol"
    );

    const triglycerides = get(
      "Triglycerides",
      "Triglyceride"
    );

    const hdl = get(
      "HDL Cholesterol",
      "HDL"
    );

    const ldl = get(
      "LDL Cholesterol",
      "LDL"
    );

    const vldl = get(
      "VLDL",
      "VLDL Cholesterol"
    );

    const nonHdl = get(
      "Non HDL Cholesterol",
      "Non-HDL Cholesterol",
      "Non HDL"
    );

    const tcHdlRatio = get(
      "Cholesterol/HDL Ratio",
      "Cholesterol HDL Ratio",
      "Cholesterol to HDL Ratio",
      "TC/HDL Ratio"
    );

    const ldlHdlRatio = get(
      "LDL/HDL Ratio",
      "LDL HDL Ratio"
    );

    const tgHdlRatio = get(
      "Triglycerides/HDL Ratio",
      "Triglycerides HDL Ratio",
      "Triglyceride/HDL Ratio",
      "Triglyceride HDL Ratio"
    );

    const tc = valueOf(totalCholesterol);
    const tg = valueOf(triglycerides);
    const hdlValue = valueOf(hdl);

    if (
      tg !== null &&
      tg >= 0 &&
      vldl
    ) {
      output[vldl.key] =
        (tg / 5).toFixed(2);
    }

    let calculatedLdl = null;

    if (
      tc !== null &&
      hdlValue !== null &&
      tg !== null
    ) {
      calculatedLdl =
        tc - hdlValue - tg / 5;

      if (
        calculatedLdl >= 0 &&
        ldl
      ) {
        output[ldl.key] =
          calculatedLdl.toFixed(2);
      }
    }

    if (
      tc !== null &&
      hdlValue !== null &&
      nonHdl
    ) {
      output[nonHdl.key] =
        (tc - hdlValue).toFixed(2);
    }

    if (
      tc !== null &&
      hdlValue !== null &&
      hdlValue !== 0 &&
      tcHdlRatio
    ) {
      output[tcHdlRatio.key] =
        (tc / hdlValue).toFixed(2);
    }

    if (
      calculatedLdl !== null &&
      hdlValue !== null &&
      hdlValue !== 0 &&
      ldlHdlRatio
    ) {
      output[ldlHdlRatio.key] =
        (calculatedLdl / hdlValue).toFixed(2);
    }

    if (
      tg !== null &&
      hdlValue !== null &&
      hdlValue !== 0 &&
      tgHdlRatio
    ) {
      output[tgHdlRatio.key] =
        (tg / hdlValue).toFixed(2);
    }

    /* ========================================================
       RFT / KFT — eGFR
       ======================================================== */

    const creatinine = get(
      "Creatinine",
      "Serum Creatinine"
    );

    const egfr = get(
      "eGFR",
      "Estimated GFR",
      "Estimated Glomerular Filtration Rate",
      "Estimated Glomerular Filtration Rate (eGFR)"
    );

    if (creatinine && egfr) {
      const creatinineValue =
        valueOf(creatinine);

      const egfrValue =
        calculateEgfr({
          creatinine:
            creatinineValue,
          creatinineParameter:
            creatinine,
          age:
            getEgfrAge(patient),
          sex:
            getEgfrSex(patient),
        });

      if (egfrValue !== null) {
        output[egfr.key] =
          egfrValue.toFixed(1);
      }
    }

    return output;
  };

/* ==========================================================
   APPLY CALCULATIONS
   ========================================================== */

const applyCalculatedValues =
  (
    parameters,
    patient = {}
  ) => {
    const calculated =
      calculatePanelValues(
        parameters,
        patient
      );

    return parameters.map(
      (parameter) => {
        if (
          !parameter.calculated
        ) {
          return parameter;
        }

        if (
          !Object.prototype.hasOwnProperty.call(
            calculated,
            parameter.key
          )
        ) {
          return parameter;
        }

        return {
          ...parameter,

          value:
            calculated[
              parameter.key
            ],

          result:
            calculated[
              parameter.key
            ],
        };
      }
    );
  };

/* ==========================================================
   EXISTING RESULT
   ========================================================== */

const extractResultParameters =
  (
    result
  ) => {
    if (
      !result ||
      typeof result !==
        "object"
    ) {
      return {};
    }

    if (
      result.parameters &&
      typeof result.parameters ===
        "object"
    ) {
      return result.parameters;
    }

    if (
      result.parameter_results &&
      typeof result.parameter_results ===
        "object"
    ) {
      return result.parameter_results;
    }

    if (
      result.results &&
      typeof result.results ===
        "object"
    ) {
      return result.results;
    }

    return {};
  };

/* ==========================================================
   EXISTING VALUE
   ========================================================== */

const getExistingParameter =
  (
    source,
    parameter
  ) => {
    if (
      !source ||
      typeof source !==
        "object"
    ) {
      return {};
    }

    const candidates = [
      parameter.key,
      parameter.name,
      parameter.test_name,
      parameter.parameter_name,
    ];

    for (
      const key of
        candidates
    ) {
      if (
        source[key] &&
        typeof source[key] ===
          "object"
      ) {
        return source[key];
      }
    }

    const wanted =
      candidates.map(
        normalize
      );

    for (
      const [
        key,
        value,
      ] of Object.entries(
        source
      )
    ) {
      if (
        !value ||
        typeof value !==
          "object"
      ) {
        continue;
      }

      const name =
        normalize(
          value.name ||
          value.test_name ||
          key
        );

      if (
        wanted.includes(
          name
        )
      ) {
        return value;
      }
    }

    return {};
  };

/* ==========================================================
   BUILD INITIAL STATE
   ========================================================== */

const buildInitialState =
  ({
    parameters,
    result,
    patient,
    registration,
    test,
  }) => {
    const source =
      extractResultParameters(
        result
      );

    const output =
      {};

    parameters.forEach(
      (parameter) => {
        const existing =
          getExistingParameter(
            source,
            parameter
          );

        const reference =
          getReference({
            parameter,
            patient,
            registration,
            test,
          });

        const value =
          firstValue(
            existing.value,
            existing.result,
            ""
          );

        output[
          parameter.key
        ] = {
          ...parameter,

          ...existing,

          key:
            parameter.key,

          name:
            parameter.name,

          test_name:
            parameter.test_name,

          parameter_name:
            parameter.parameter_name,

          value,

          result:
            firstValue(
              existing.result,
              existing.value,
              ""
            ),

          unit:
            firstValue(
              existing.unit,
              parameter.unit,
              reference.unit
            ),

          result_unit:
            firstValue(
              existing.result_unit,
              parameter.result_unit,
              reference.unit
            ),

          referenceRange:
            firstValue(
              reference.referenceRange,
              parameter.referenceRange,
              parameter.reference_range
            ),

          reference_range:
            firstValue(
              reference.referenceRange,
              parameter.reference_range,
              parameter.referenceRange
            ),

          criticalLow:
            firstValue(
              reference.criticalLow,
              parameter.criticalLow,
              parameter.critical_low,
              null
            ),

          criticalHigh:
            firstValue(
              reference.criticalHigh,
              parameter.criticalHigh,
              parameter.critical_high,
              null
            ),
        };
      }
    );

    return output;
  };


/* ==========================================================
   BUILT-IN PANEL FALLBACKS
   ----------------------------------------------------------
   These are UI safety fallbacks only. They are used ONLY when
   getPanelParameters() returns no rows. Database parameters still
   remain authoritative whenever they are available.

   This prevents LFT / FLP from getting stuck with an empty parameter
   set when panel_tests or master_tests.panel_name is incomplete.
   ========================================================== */

const BUILTIN_PANEL_PARAMETERS = {
  "liver function test": [
    { key: "ast", name: "AST", test_name: "AST", unit: "U/L", reference_value: "0 - 40", calculated: false },
    { key: "alt", name: "ALT", test_name: "ALT", unit: "U/L", reference_value: "0 - 41", calculated: false },
    { key: "ast_alt_ratio", name: "AST/ALT Ratio", test_name: "AST/ALT Ratio", unit: "Ratio", reference_value: "0.7 - 1.3", calculated: true },
    { key: "alp", name: "ALP", test_name: "ALP", unit: "U/L", reference_value: "40 - 129", calculated: false },
    { key: "ggt", name: "GGT", test_name: "GGT", unit: "U/L", reference_value: "9 - 48", calculated: false },
    { key: "total_protein", name: "Total Protein", test_name: "Total Protein", unit: "g/dL", reference_value: "6.0 - 8.3", calculated: false },
    { key: "albumin", name: "Albumin", test_name: "Albumin", unit: "g/dL", reference_value: "3.5 - 5.0", calculated: false },
    { key: "globulin", name: "Globulin", test_name: "Globulin", unit: "g/dL", reference_value: "2.0 - 3.5", calculated: true },
    { key: "ag_ratio", name: "Albumin/Globulin Ratio", test_name: "Albumin/Globulin Ratio", unit: "Ratio", reference_value: "1.0 - 2.2", calculated: true },
    { key: "total_bilirubin", name: "Total Bilirubin", test_name: "Total Bilirubin", unit: "mg/dL", reference_value: "0.2 - 1.2", calculated: false },
    { key: "direct_bilirubin", name: "Direct Bilirubin", test_name: "Direct Bilirubin", unit: "mg/dL", reference_value: "0.0 - 0.3", calculated: false },
    { key: "indirect_bilirubin", name: "Indirect Bilirubin", test_name: "Indirect Bilirubin", unit: "mg/dL", reference_value: "0.2 - 0.9", calculated: true },
  ],

  "serum calcium": [
    { key: "total_calcium", name: "Total Calcium (TCA)", test_name: "Total Calcium (TCA)", unit: "mmol/L", calculated: false },
    { key: "ionized_calcium", name: "Ionized Calcium (ICA)", test_name: "Ionized Calcium (ICA)", unit: "mmol/L", calculated: false },
    { key: "non_ionized_calcium", name: "Non-ionized Calcium (NCA)", test_name: "Non-ionized Calcium (NCA)", unit: "mmol/L", calculated: false },
  ],

  "lipid profile": [    { key: "total_cholesterol", name: "Total Cholesterol", test_name: "Total Cholesterol", unit: "mg/dL", reference_value: "0 - 200", calculated: false },
    { key: "triglycerides", name: "Triglycerides", test_name: "Triglycerides", unit: "mg/dL", reference_value: "0 - 150", calculated: false },
    { key: "hdl", name: "HDL Cholesterol", test_name: "HDL Cholesterol", unit: "mg/dL", reference_value: "> 40", calculated: false },
    { key: "ldl", name: "LDL Cholesterol", test_name: "LDL Cholesterol", unit: "mg/dL", reference_value: "0 - 100", calculated: true },
    { key: "vldl", name: "VLDL Cholesterol", test_name: "VLDL Cholesterol", unit: "mg/dL", reference_value: "5 - 40", calculated: true },
    { key: "non_hdl", name: "Non-HDL Cholesterol", test_name: "Non-HDL Cholesterol", unit: "mg/dL", reference_value: "0 - 130", calculated: true },
    { key: "tc_hdl_ratio", name: "Cholesterol/HDL Ratio", test_name: "Cholesterol/HDL Ratio", unit: "Ratio", reference_value: "0 - 5.0", calculated: true },
    { key: "ldl_hdl_ratio", name: "LDL/HDL Ratio", test_name: "LDL/HDL Ratio", unit: "Ratio", reference_value: "0 - 3.5", calculated: true },
    { key: "tg_hdl_ratio", name: "Triglycerides/HDL Ratio", test_name: "Triglycerides/HDL Ratio", unit: "Ratio", reference_value: "0 - 3.5", calculated: true },
  ],
};

const getBuiltinPanelParameters = (panel) => {
  const canonical = normalize(panel);
  const rows = BUILTIN_PANEL_PARAMETERS[canonical];

  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => ({
    ...row,
    display_order: index + 1,
  }));
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function ChemistryPanelResultEntry({
  title =
    "Clinical Chemistry",

  panelName = "",

  analytes = [],

  parameters = [],

  panelParameters = [],

  calculationEngine = null,

  patient = null,

  registration = null,

  test = null,

  result = null,

  initialResult = null,

  existingResult = null,

  onChange,

  onSave,

  onSaved,

  onCancel,

  onBack,

  readOnly = false,

  disabled = false,

  editMode = false,

  className = "",
}) {
  /* ========================================================
     SUPPLIED PARAMETERS
     ======================================================== */

  const suppliedParameters =
    useMemo(
      () => {
        const normalized =
          normalizeAnalytes(
            [
              ...(
                Array.isArray(
                  parameters
                )
                  ? parameters
                  : []
              ),

              ...(
                Array.isArray(
                  analytes
                )
                  ? analytes
                  : []
              ),

              ...(
                Array.isArray(
                  panelParameters
                )
                  ? panelParameters
                  : []
              ),
            ]
          );

        if (
          isRenalFunctionPanel(
            firstValue(
              panelName,
              test?.panel_name,
              test?.panelName,
              test?.test_name,
              test?.testName,
              title
            )
          )
        ) {
          return normalized.filter(
            isAllowedRftParameter
          );
        }

        return normalized;
      },
      [
        parameters,
        analytes,
        panelParameters,
      ]
    );

  /* ========================================================
     PANEL NAME
     ======================================================== */

  const lookupName =
    useMemo(
      () => {
        const raw =
          firstValue(
            panelName,
            test?.panel_name,
            test?.panelName,
            test?.test_name,
            test?.testName,
            title
          );

        const n =
          normalize(
            raw
          );

        if (
          n.includes(
            "liver function"
          ) ||
          n === "lft" ||
          n.includes(
            "liver profile"
          )
        ) {
          return "Liver Function Test";
        }

        if (
          n.includes(
            "renal function"
          ) ||
          n === "rft" ||
          n === "kft" ||
          n.includes(
            "renal profile"
          ) ||
          n.includes(
            "kidney function"
          )
        ) {
          return "Renal Function Test";
        }

        if (
          n.includes(
            "lipid profile"
          ) ||
          n.includes(
            "lipid panel"
          ) ||
          n === "flp" ||
          n.includes(
            "fasting lipid"
          )
        ) {
          return "Lipid Profile";
        }

        if (
          n.includes(
            "serum electrolytes"
          ) ||
          n === "ue" ||
          n === "ues" ||
          n === "uecs"
        ) {
          return "Serum Electrolytes";
        }

        if (
          n.includes(
            "serum bilirubin"
          ) ||
          n.includes(
            "bilirubin profile"
          )
        ) {
          return "Serum Bilirubin";
        }

        return text(
          raw
        );
      },
      [
        panelName,
        test?.panel_name,
        test?.panelName,
        test?.test_name,
        test?.testName,
        title,
      ]
    );

  /* ========================================================
     PANEL ID
     ======================================================== */

  const resolvedPanelId =
    test?.panel_id ??
    test?.panelId ??
    test?.masterTest?.panel_id ??
    test?.master_test?.panel_id ??
    null;

  /* ========================================================
     DEMOGRAPHICS
     ======================================================== */

  const demographics =
    useMemo(
      () => ({
        sex:
          getSex(
            patient
          ),

        age:
          getAge(
            patient
          ),
      }),
      [
        patient,
      ]
    );

  /* ========================================================
     DATABASE PARAMETER STATE
     ======================================================== */

  const [
    databaseParameters,
    setDatabaseParameters,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  /* ========================================================
     STABLE LOOKUP KEY
     ======================================================== */

  const lookupKey =
    useMemo(
      () =>
        [
          lookupName,
          resolvedPanelId,
          test?.id,
          test?.master_test_id,
          demographics.sex,
          demographics.age,
        ].join("|"),
      [
        lookupName,
        resolvedPanelId,
        test?.id,
        test?.master_test_id,
        demographics.sex,
        demographics.age,
      ]
    );

  const lastLookup =
    useRef("");

  /* ========================================================
     LOAD PARAMETERS
     ======================================================== */

  useEffect(
    () => {
      let cancelled =
        false;

      if (
        !lookupName
      ) {
        setDatabaseParameters(
          []
        );

        setLoadError(
          "No chemistry panel was supplied."
        );

        return undefined;
      }

      if (
        lastLookup.current ===
        lookupKey
      ) {
        return undefined;
      }

      lastLookup.current =
        lookupKey;

      setLoading(
        true
      );

      setLoadError(
        ""
      );

      getPanelParameters({
        test:
          test || {},

        panelName:
          lookupName,

        panelId:
          resolvedPanelId,

        demographics,
      })
        .then(
          (response) => {
            if (
              cancelled
            ) {
              return;
            }

            const serviceRows =
              Array.isArray(
                response?.parameters
              )
                ? response.parameters
                : [];

            const fallbackRows =
              getBuiltinPanelParameters(
                lookupName
              );

            const rows =
              serviceRows.length
                ? serviceRows
                : fallbackRows;

            setDatabaseParameters(
              rows
            );

            if (
              !rows.length
            ) {
              setLoadError(
                response?.error ||
                  `No chemistry parameters found for ${lookupName}.`
              );
            } else {
              setLoadError(
                serviceRows.length
                  ? ""
                  : `Using built-in ${lookupName} parameter definition because no database parameters were returned.`
              );
            }
          }
        )
        .catch(
          (error) => {
            if (
              cancelled
            ) {
              return;
            }

            console.error(
              "[PEFA CHEMISTRY] Parameter loading failed:",
              error
            );

            const fallbackRows =
              getBuiltinPanelParameters(
                lookupName
              );

            setDatabaseParameters(
              fallbackRows
            );

            setLoadError(
              fallbackRows.length
                ? `Using built-in ${lookupName} parameter definition because the database parameter lookup failed.`
                : error?.message ||
                  "Unable to load chemistry parameters."
            );
          }
        )
        .finally(
          () => {
            if (
              !cancelled
            ) {
              setLoading(
                false
              );
            }
          }
        );

      return () => {
        cancelled =
          true;
      };
    },
    [
      lookupKey,
      lookupName,
      resolvedPanelId,
      demographics,
      test,
    ]
  );

  /* ========================================================
     EFFECTIVE PARAMETERS
     ======================================================== */

  const effectiveParameters =
    useMemo(
      () => {
        /*
         * DATABASE parameters are first.
         *
         * Supplied parameters then enrich them.
         */
        const normalized =
          normalizeAnalytes(
            [
              ...databaseParameters,
              ...suppliedParameters,
            ]
          );

        if (
          isRenalFunctionPanel(
            lookupName
          )
        ) {
          return normalized.filter(
            isAllowedRftParameter
          );
        }

        return normalized;
      },
      [
        databaseParameters,
        suppliedParameters,
      ]
    );

  /* ========================================================
     EXISTING RESULT
     ======================================================== */

  const sourceResult =
    result ||
    initialResult ||
    existingResult ||
    {};

  /* ========================================================
     STATE
     ======================================================== */

  const [
    resultState,
    setResultState,
  ] = useState(
    () =>
      buildInitialState({
        parameters:
          effectiveParameters,

        result:
          sourceResult,

        patient,

        registration,

        test,
      })
  );

  /* ========================================================
     INITIALIZATION SIGNATURE
     ======================================================== */

  const parameterSignature =
    useMemo(
      () =>
        effectiveParameters
          .map(
            (parameter) =>
              [
                parameter.key,
                parameter.id,
                parameter.name,
              ].join(":")
          )
          .join("|"),
      [
        effectiveParameters,
      ]
    );

  const resultId =
    text(
      sourceResult?.id ||
      sourceResult?.result_id ||
      sourceResult?.laboratory_result_id
    );

  const initializationKey =
    `${lookupKey}|${parameterSignature}|${resultId}`;

  const lastInitialization =
    useRef(
      initializationKey
    );

  /* ========================================================
     RE-HYDRATE ONLY WHEN ACTUAL RESULT/PARAMETER IDENTITY
     CHANGES
     ======================================================== */

  useEffect(
    () => {
      if (
        lastInitialization.current ===
        initializationKey
      ) {
        return;
      }

      lastInitialization.current =
        initializationKey;

      setResultState(
        buildInitialState({
          parameters:
            effectiveParameters,

          result:
            sourceResult,

          patient,

          registration,

          test,
        })
      );
    },
    [
      initializationKey,
      effectiveParameters,
      sourceResult,
      patient,
      registration,
      test,
    ]
  );

  /* ========================================================
     CURRENT PARAMETER ARRAY
     ======================================================== */

  const currentParameters =
    useMemo(
      () =>
        effectiveParameters.map(
          (parameter) =>
            resultState[
              parameter.key
            ] || {
              ...parameter,

              value:
                "",

              result:
                "",
            }
        ),
      [
        effectiveParameters,
        resultState,
      ]
    );

  /* ========================================================
     CALCULATED PARAMETERS
     ======================================================== */

  const calculatedParameters =
    useMemo(
      () =>
        applyCalculatedValues(
          currentParameters
        ),
      [
        currentParameters,
        patient,
      ]
    );

  /* ========================================================
     EXTERNAL CALCULATION ENGINE
     ======================================================== */

  const finalParameters =
    useMemo(
      () => {
        let output =
          calculatedParameters;

        if (
          calculationEngine &&
          typeof calculationEngine.calculate ===
            "function"
        ) {
          try {
            const values =
              {};

            output.forEach(
              (parameter) => {
                values[
                  parameter.key
                ] =
                  parameter.value ??
                  parameter.result ??
                  "";
              }
            );

            const calculated =
              calculationEngine.calculate(
                values
              );

            if (
              calculated &&
              typeof calculated ===
                "object"
            ) {
              output =
                output.map(
                  (parameter) => {
                    if (
                      !parameter.calculated
                    ) {
                      return parameter;
                    }

                    if (
                      !Object.prototype.hasOwnProperty.call(
                        calculated,
                        parameter.key
                      )
                    ) {
                      return parameter;
                    }

                    return {
                      ...parameter,

                      value:
                        calculated[
                          parameter.key
                        ],

                      result:
                        calculated[
                          parameter.key
                        ],
                    };
                  }
                );
            }
          } catch (
            error
          ) {
            console.error(
              "[PEFA CHEMISTRY] External calculation error:",
              error
            );
          }
        }

        return output;
      },
      [
        calculatedParameters,
        calculationEngine,
      ]
    );

  /* ========================================================
     FINAL DISPLAY METADATA
     ======================================================== */

  const displayParameters =
    useMemo(
      () =>
        finalParameters.map(
          (parameter) => {
            const reference =
              getReference({
                parameter,
                patient,
                registration,
                test,
              });

            const value =
              firstValue(
                parameter.value,
                parameter.result,
                ""
              );

            const flag =
              getFinalFlag({
                value,

                parameter,

                reference,

                patient,

                registration,

                test,
              });

            return {
              ...parameter,

              value,

              result:
                value,

              unit:
                firstValue(
                  parameter.unit,
                  reference.unit
                ),

              referenceRange:
                reference.referenceRange,

              reference_range:
                reference.referenceRange,

              criticalLow:
                reference.criticalLow,

              criticalHigh:
                reference.criticalHigh,

              flag,
            };
          }
        ),
      [
        finalParameters,
        patient,
        registration,
        test,
      ]
    );

 /* ========================================================
   LIVE CHEMISTRY INTERPRETATION
   ======================================================== */

const chemistryParameterMap = useMemo(() => {
  return Object.fromEntries(
    displayParameters.map((parameter) => [
      parameter.key,
      parameter,
    ])
  );
}, [displayParameters]);


/*
 * Only generate an interpretation when at least one
 * result has actually been entered.
 *
 * This prevents:
 *
 * "Results are within the applicable laboratory
 * reference intervals."
 *
 * from appearing on a completely empty form.
 */
const hasEnteredChemistryResult = useMemo(() => {
  return displayParameters.some((parameter) => {
    return (
      parameter.value !== null &&
      parameter.value !== undefined &&
      String(parameter.value).trim() !== ""
    );
  });
}, [displayParameters]);


/*
 * Recalculate interpretation immediately whenever
 * any chemistry result changes.
 */
const interpretationResult = useMemo(() => {
  if (!hasEnteredChemistryResult) {
    return {
      interpretation: "",
      impression: "",
      findings: [],
    };
  }

  try {
    return (
      buildChemistryInterpretation({
        analytes:
          displayParameters,

        parameters:
          chemistryParameterMap,

        parameterResults:
          chemistryParameterMap,

        results:
          chemistryParameterMap,

        patient:
          patient || {},

        registration:
          registration || {},

        test:
          test || {},

        rules: [],
      }) || {
        interpretation: "",
        impression: "",
        findings: [],
      }
    );
  } catch (error) {
    console.error(
      "[PEFA CHEMISTRY] Interpretation engine error:",
      error
    );

    return {
      interpretation: "",
      impression: "",
      findings: [],
    };
  }
}, [
  displayParameters,
  chemistryParameterMap,
  hasEnteredChemistryResult,
  patient,
  registration,
  test,
]);


/*
 * Keep the existing payload structure compatible.
 */
const interpretation =
  interpretationResult;

  /* ========================================================
     PAYLOAD
     ======================================================== */

  const buildPayload =
    useCallback(
      (
        map
      ) => ({
        ...sourceResult,

        parameters:
          map,

        parameter_results:
          map,

        panel_name:
          lookupName,

        panelName:
          lookupName,

        interpretation: {
          ...interpretation,
          impression: "",
        },

        patient,

        registration,

        test,

        editMode:
          Boolean(
            editMode
          ),
      }),
      [
        sourceResult,
        lookupName,
        interpretation,
        patient,
        registration,
        test,
        editMode,
      ]
    );

  /* ========================================================
     RESULT CHANGE
     ======================================================== */

  const handleResultChange =
    useCallback(
      (
        key,
        value
      ) => {
        if (
          disabled ||
          readOnly
        ) {
          return;
        }

        setResultState(
          (
            previous
          ) => {
            const target =
              previous[
                key
              ];

            if (
              !target ||
              target.calculated ||
              target.readOnly
            ) {
              return previous;
            }

            const next =
              {
                ...previous,

                [key]: {
                  ...target,

                  value,

                  result:
                    value,
                },
              };

            /*
             * Recalculate from the next values immediately.
             */
            const nextArray =
              effectiveParameters.map(
                (parameter) =>
                  next[
                    parameter.key
                  ] || {
                    ...parameter,

                    value:
                      "",

                    result:
                      "",
                  }
              );

            const calculated =
              applyCalculatedValues(
                nextArray
              );

            const nextMap =
              {};

            calculated.forEach(
              (parameter) => {
                nextMap[
                  parameter.key
                ] =
                  parameter;
              }
            );

            /*
             * Publish only from the input event.
             *
             * No useEffect watches resultState -> onChange.
             * This prevents maximum-update-depth loops.
             */
            if (
              typeof onChange ===
              "function"
            ) {
              queueMicrotask(
                () => {
                  onChange(
                    buildPayload(
                      nextMap
                    )
                  );
                }
              );
            }

            return next;
          }
        );
      },
      [
        disabled,
        readOnly,
        effectiveParameters,
        onChange,
        buildPayload,
      ]
    );

  /* ========================================================
     SAVE
     ======================================================== */

  const handleSave =
    useCallback(
      () => {
        if (
          disabled ||
          readOnly
        ) {
          return;
        }

        let parameters =
          effectiveParameters.map(
            (parameter) =>
              resultState[
                parameter.key
              ] || {
                ...parameter,

                value:
                  "",

                result:
                  "",
              }
          );

        parameters =
          applyCalculatedValues(
            parameters
          );

        const finalMap =
          {};

        parameters.forEach(
          (parameter) => {
            const reference =
              getReference({
                parameter,
                patient,
                registration,
                test,
              });

            const value =
              parameter.value ??
              parameter.result ??
              "";

            finalMap[
              parameter.key
            ] = {
              ...parameter,

              value,

              result:
                value,

              referenceRange:
                reference.referenceRange,

              reference_range:
                reference.referenceRange,

              unit:
                firstValue(
                  parameter.unit,
                  reference.unit
                ),

              flag:
                getFinalFlag({
                  value,

                  parameter,

                  reference,

                  patient,

                  registration,

                  test,
                }),
            };
          }
        );

        const payload =
          buildPayload(
            finalMap
          );

        if (
          typeof onSave ===
          "function"
        ) {
          onSave(
            payload
          );
        }

        if (
          typeof onSaved ===
          "function"
        ) {
          onSaved(
            payload
          );
        }
      },
      [
        disabled,
        readOnly,
        effectiveParameters,
        resultState,
        patient,
        registration,
        test,
        buildPayload,
        onSave,
        onSaved,
      ]
    );

  /* ========================================================
     FLAG CLASS
     ======================================================== */

  const flagClass =
    (
      flag
    ) => {
      const value =
        normalize(
          flag
        );

      if (
        value.includes(
          "critical"
        )
      ) {
        return "critical";
      }

      if (
        value === "high" ||
        value === "low" ||
        value.includes(
          "abnormal"
        )
      ) {
        return "abnormal";
      }

      if (
        value ===
        "normal"
      ) {
        return "normal";
      }

      return "";
    };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div
      className={`chemistry-panel-result-entry ${className}`}
      style={{
        width:
          "100%",

        background:
          "#fff",

        border:
          "1px solid #dbe3ec",

        borderRadius:
          10,

        overflow:
          "hidden",
      }}
    >
      <div
        style={{
          padding:
            "16px 18px",

          background:
            "#f8fafc",

          borderBottom:
            "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              12,
          }}
        >
          <h3
            style={{
              margin:
                0,

              fontSize:
                18,

              fontWeight:
                700,

              color:
                "#0f172a",
            }}
          >
            {title}
          </h3>

          <span
            style={{
              fontSize:
                10,

              fontWeight:
                800,

              padding:
                "5px 9px",

              borderRadius:
                20,

              background:
                editMode
                  ? "#dbeafe"
                  : "#dcfce7",

              color:
                editMode
                  ? "#1d4ed8"
                  : "#166534",
            }}
          >
            {editMode
              ? "EDIT MODE"
              : "NEW RESULT"}
          </span>
        </div>

        <div
          style={{
            marginTop:
              5,

            fontSize:
              12,

            color:
              "#64748b",
          }}
        >
          {lookupName}
        </div>
      </div>

      {loading && (
        <div
          style={{
            padding:
              12,

            background:
              "#f8fafc",

            color:
              "#475569",

            fontSize:
              12,
          }}
        >
          Loading chemistry parameters…
        </div>
      )}

      {loadError &&
        !displayParameters.length && (
          <div
            style={{
              padding:
                12,

              background:
                "#fef2f2",

              color:
                "#b91c1c",

              fontSize:
                12,
            }}
          >
            {loadError}
          </div>
        )}

      <div
        style={{
          overflowX:
            "auto",
        }}
      >
        <table
          style={{
            width:
              "100%",

            minWidth:
              760,

            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr>
              <th
                style={thStyle}
              >
                Parameter
              </th>

              <th
                style={thStyle}
              >
                Result
              </th>

              <th
                style={thStyle}
              >
                Unit
              </th>

              <th
                style={thStyle}
              >
                Reference Range
              </th>

              <th
                style={thStyle}
              >
                Flag
              </th>
            </tr>
          </thead>

          <tbody>
            {displayParameters.map(
              (
                parameter
              ) => {
                const locked =
                  disabled ||
                  readOnly ||
                  parameter.calculated ||
                  parameter.readOnly;

                const cls =
                  flagClass(
                    parameter.flag
                  );

                return (
                  <tr
                    key={
                      parameter.key
                    }
                  >
                    <td
                      style={tdStyle}
                    >
                      <strong>
                        {
                          parameter.name
                        }
                      </strong>

                      {parameter.calculated && (
                        <div
                          style={{
                            marginTop:
                              2,

                            fontSize:
                              9,

                            fontWeight:
                              800,

                            color:
                              "#64748b",
                          }}
                        >
                          CALCULATED
                        </div>
                      )}
                    </td>

                    <td
                      style={tdStyle}
                    >
                      <input
                        type="text"
                        value={
                          parameter.value ??
                          parameter.result ??
                          ""
                        }
                        disabled={
                          locked
                        }
                        readOnly={
                          locked
                        }
                        onChange={(
                          event
                        ) =>
                          handleResultChange(
                            parameter.key,
                            event
                              .target
                              .value
                          )
                        }
                        style={{
                          width:
                            "100%",

                          minWidth:
                            130,

                          height:
                            36,

                          padding:
                            "7px 9px",

                          boxSizing:
                            "border-box",

                          border:
                            "1px solid #cbd5e1",

                          borderRadius:
                            6,

                          background:
                            locked
                              ? "#f8fafc"
                              : "#fff",

                          color:
                            "#0f172a",

                          outline:
                            "none",
                        }}
                      />
                    </td>

                    <td
                      style={tdStyle}
                    >
                      {parameter.unit ||
                        "—"}
                    </td>

                    <td
                      style={tdStyle}
                    >
                      {parameter.referenceRange ||
                      parameter.reference_range ? (
                        parameter.referenceRange ||
                        parameter.reference_range
                      ) : (
                        <span
                          style={{
                            color:
                              "#94a3b8",

                            fontStyle:
                              "italic",
                          }}
                        >
                          Not configured
                        </span>
                      )}
                    </td>

                    <td
                      style={tdStyle}
                    >
                      <span
                        style={{
                          fontWeight:
                            800,

                          color:
                            cls ===
                            "critical"
                              ? "#b91c1c"
                              : cls ===
                                "abnormal"
                              ? "#b45309"
                              : cls ===
                                "normal"
                              ? "#15803d"
                              : "#64748b",
                        }}
                      >
                        {parameter.flag ||
                          "—"}
                      </span>
                    </td>
                  </tr>
                );
              }
            )}

            {!displayParameters.length &&
              !loading && (
                <tr>
                  <td
                    colSpan={
                      5
                    }
                    style={{
                      ...tdStyle,

                      textAlign:
                        "center",

                      padding:
                        24,

                      color:
                        "#64748b",
                    }}
                  >
                    No chemistry parameters found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

{interpretation?.interpretation && (
  <div
    style={{
      padding: 14,
      borderTop: "1px solid #e2e8f0",
      background: "#f8fafc",
      fontSize: 13,
      lineHeight: 1.5,
      color: "#334155",
    }}
  >
    <strong
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 800,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: ".04em",
      }}
    >
      Interpretation
    </strong>

    <div style={{ marginTop: 5 }}>
      {interpretation.interpretation}
    </div>
  </div>
)}

      {(onSave ||
        onSaved ||
        onCancel ||
        onBack) && (
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "flex-end",

            gap:
              8,

            padding:
              14,

            borderTop:
              "1px solid #e2e8f0",
          }}
        >
          {onBack && (
            <button
              type="button"
              onClick={
                onBack
              }
              disabled={
                disabled
              }
              style={buttonStyle(
                "#e2e8f0",
                "#334155"
              )}
            >
              Back
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={
                onCancel
              }
              disabled={
                disabled
              }
              style={buttonStyle(
                "#e2e8f0",
                "#334155"
              )}
            >
              Cancel
            </button>
          )}

          {(onSave ||
            onSaved) && (
            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={
                disabled ||
                readOnly
              }
              style={buttonStyle(
                "#0f766e",
                "#fff"
              )}
            >
              {editMode
                ? "Update Result"
                : "Save Result"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   STYLES
   ========================================================== */

const thStyle = {
  textAlign:
    "left",

  padding:
    "10px 12px",

  background:
    "#f1f5f9",

  borderBottom:
    "1px solid #cbd5e1",

  fontSize:
    12,

  fontWeight:
    700,

  color:
    "#334155",

  whiteSpace:
    "nowrap",
};

const tdStyle = {
  padding:
    "9px 12px",

  borderBottom:
    "1px solid #e2e8f0",

  fontSize:
    13,

  color:
    "#1e293b",

  verticalAlign:
    "middle",
};

const buttonStyle = (
  background,
  color
) => ({
  border:
    "none",

  borderRadius:
    6,

  padding:
    "9px 16px",

  background,

  color,

  fontSize:
    13,

  fontWeight:
    700,

  cursor:
    "pointer",
});

