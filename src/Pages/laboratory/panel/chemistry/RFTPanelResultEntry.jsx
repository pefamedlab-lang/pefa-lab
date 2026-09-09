/* ==========================================================
   PEFA LAB
   RFT — RENAL FUNCTION TEST
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/panel/chemistry/RFTPanelResultEntry.jsx

   IMPORTANT:
   - No Supabase access.
   - No testService.js import.
   - No persistence logic.
   - Manual parameters remain editable.
   - Calculated parameters are read-only.
   - Demographics are resolved from supplied patient/
     registration data for eGFR.
   ========================================================== */

import React, { useMemo } from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

/* ==========================================================
   ANALYTES
   ========================================================== */

export const ANALYTES = [
  {
    key: "urea",
    name: "Urea",
    unit: "mmol/L",
    calculated: false,
    readOnly: false,
  },
  {
    key: "creatinine",
    name: "Creatinine",
    unit: "µmol/L",
    calculated: false,
    readOnly: false,
  },
  {
    key: "sodium",
    name: "Sodium",
    unit: "mmol/L",
    calculated: false,
    readOnly: false,
  },
  {
    key: "potassium",
    name: "Potassium",
    unit: "mmol/L",
    calculated: false,
    readOnly: false,
  },
  {
    key: "chloride",
    name: "Chloride",
    unit: "mmol/L",
    calculated: false,
    readOnly: false,
  },
  {
    key: "bicarbonate",
    name: "Bicarbonate",
    unit: "mmol/L",
    calculated: false,
    readOnly: false,
  },
  {
    key: "uric_acid",
    name: "Uric Acid",
    unit: "mg/dL",
    calculated: false,
    readOnly: false,
  },

  {
    key: "egfr",
    name: "eGFR",
    unit: "mL/min/1.73m²",
    calculated: true,
    readOnly: true,
  },
  {
    key: "anion_gap",
    name: "Anion Gap",
    unit: "mmol/L",
    calculated: true,
    readOnly: true,
  },
  {
    key: "bun",
    name: "BUN",
    unit: "mg/dL",
    calculated: true,
    readOnly: true,
  },
  {
    key: "bun_creatinine_ratio",
    name: "BUN/Creatinine Ratio",
    unit: "ratio",
    calculated: true,
    readOnly: true,
  },
  {
    key: "sodium_potassium_ratio",
    name: "Sodium/Potassium Ratio",
    unit: "ratio",
    calculated: true,
    readOnly: true,
  },
];

/* ==========================================================
   HELPERS
   ========================================================== */

const toNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const round = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return null;

  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
};

const positive = (value) =>
  Number.isFinite(value) && value > 0;

/* ==========================================================
   AGE
   ========================================================== */

const getAge = (patient = {}, registration = {}) => {
  const directAge = toNumber(
    patient?.age ??
      registration?.age ??
      patient?.patient_age ??
      registration?.patient_age
  );

  if (
    directAge !== null &&
    directAge >= 18
  ) {
    return directAge;
  }

  const dob =
    patient?.dob ??
    patient?.date_of_birth ??
    patient?.dateOfBirth ??
    registration?.dob ??
    registration?.date_of_birth ??
    registration?.dateOfBirth;

  if (!dob) return null;

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
    age -= 1;
  }

  return age >= 18 ? age : null;
};

/* ==========================================================
   SEX
   ========================================================== */

const getSex = (
  patient = {},
  registration = {}
) => {
  const value =
    patient?.sex ??
    patient?.gender ??
    patient?.patient_sex ??
    registration?.sex ??
    registration?.gender ??
    registration?.patient_sex ??
    "";

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  if (
    normalized === "male" ||
    normalized === "m"
  ) {
    return "male";
  }

  if (
    normalized === "female" ||
    normalized === "f"
  ) {
    return "female";
  }

  return null;
};

/* ==========================================================
   CREATININE CONVERSION
   ========================================================== */

export const creatinineUmolToMgDl = (
  creatinine
) => {
  const value = toNumber(creatinine);

  if (!positive(value)) return null;

  return value / 88.4;
};

/* ==========================================================
   2021 CKD-EPI CREATININE eGFR
   ========================================================== */

export function calculateEGFR({
  creatinine,
  age,
  sex,
}) {
  const scr = creatinineUmolToMgDl(
    creatinine
  );

  const numericAge = toNumber(age);

  const normalizedSex =
    String(sex ?? "")
      .trim()
      .toLowerCase();

  if (
    !positive(scr) ||
    numericAge === null ||
    numericAge < 18 ||
    (
      normalizedSex !== "male" &&
      normalizedSex !== "female"
    )
  ) {
    return null;
  }

  const kappa =
    normalizedSex === "female"
      ? 0.7
      : 0.9;

  const alpha =
    normalizedSex === "female"
      ? -0.241
      : -0.302;

  const ratio = scr / kappa;

  let egfr =
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

  if (normalizedSex === "female") {
    egfr *= 1.012;
  }

  return round(egfr, 0);
}

/* ==========================================================
   COMPLETE RFT ENGINE
   ========================================================== */

export function calculateRFT(
  values = {},
  demographics = {}
) {
  const urea = toNumber(values.urea);
  const creatinine = toNumber(values.creatinine);
  const sodium = toNumber(values.sodium);
  const potassium = toNumber(values.potassium);
  const chloride = toNumber(values.chloride);
  const bicarbonate = toNumber(values.bicarbonate);

  const output = {
    egfr: null,
    anion_gap: null,
    bun: null,
    bun_creatinine_ratio: null,
    sodium_potassium_ratio: null,
  };

  output.egfr = calculateEGFR({
    creatinine,
    age: demographics.age,
    sex: demographics.sex,
  });

  if (
    sodium !== null &&
    chloride !== null &&
    bicarbonate !== null
  ) {
    output.anion_gap = round(
      sodium - chloride - bicarbonate,
      1
    );
  }

  if (urea !== null) {
    output.bun = round(
      urea * 2.801,
      2
    );
  }

  const creatinineMgDl =
    creatinineUmolToMgDl(
      creatinine
    );

  if (
    output.bun !== null &&
    positive(creatinineMgDl)
  ) {
    output.bun_creatinine_ratio =
      round(
        output.bun / creatinineMgDl,
        2
      );
  }

  if (
    sodium !== null &&
    positive(potassium)
  ) {
    output.sodium_potassium_ratio =
      round(
        sodium / potassium,
        2
      );
  }

  return output;
}

/* ==========================================================
   CALCULATION REGISTRY
   ========================================================== */

export const RFT_CALCULATIONS = {
  egfr: {
    dependencies: ["creatinine"],
    calculate: (values, demographics = {}) =>
      calculateEGFR({
        creatinine: values?.creatinine,
        age: demographics?.age,
        sex: demographics?.sex,
      }),
  },

  anion_gap: {
    dependencies: [
      "sodium",
      "chloride",
      "bicarbonate",
    ],
    calculate: ({
      sodium,
      chloride,
      bicarbonate,
    }) => {
      const na = toNumber(sodium);
      const cl = toNumber(chloride);
      const hco3 = toNumber(bicarbonate);

      if (
        na === null ||
        cl === null ||
        hco3 === null
      ) {
        return null;
      }

      return round(
        na - cl - hco3,
        1
      );
    },
  },

  bun: {
    dependencies: ["urea"],
    calculate: ({ urea }) => {
      const value = toNumber(urea);

      return value === null
        ? null
        : round(value * 2.801, 2);
    },
  },

  bun_creatinine_ratio: {
    dependencies: [
      "urea",
      "creatinine",
    ],
    calculate: ({
      urea,
      creatinine,
    }) => {
      const ureaValue = toNumber(urea);
      const creatinineValue =
        toNumber(creatinine);

      if (
        ureaValue === null ||
        !positive(creatinineValue)
      ) {
        return null;
      }

      const bun =
        ureaValue * 2.801;

      const creatinineMgDl =
        creatinineValue / 88.4;

      return round(
        bun / creatinineMgDl,
        2
      );
    },
  },

  sodium_potassium_ratio: {
    dependencies: [
      "sodium",
      "potassium",
    ],
    calculate: ({
      sodium,
      potassium,
    }) => {
      const na = toNumber(sodium);
      const k = toNumber(potassium);

      if (
        na === null ||
        !positive(k)
      ) {
        return null;
      }

      return round(na / k, 2);
    },
  },
};

/* ==========================================================
   COMPONENT
   ========================================================== */

const normalizeKey = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const mergeRFTAnalytes = (suppliedAnalytes) => {
  if (!Array.isArray(suppliedAnalytes) || suppliedAnalytes.length === 0) {
    return ANALYTES;
  }

  const suppliedByKey = new Map();

  suppliedAnalytes.forEach((item) => {
    if (!item || typeof item !== "object") return;

    const key = normalizeKey(
      item.key ??
      item.parameter_key ??
      item.test_name ??
      item.testName ??
      item.parameter_name ??
      item.parameterName ??
      item.name
    );

    if (!key) return;

    suppliedByKey.set(key, item);
  });

  /*
   * Start from the RFT structural list so the form remains complete.
   * Where authoritative metadata is supplied by the parent/resolver,
   * that metadata wins — including reference_range/reference_value,
   * sex-specific ranges, units, critical limits and calculated flags.
   *
   * No reference range is invented here.
   */
  const merged = ANALYTES.map((fallback) => {
    const incoming = suppliedByKey.get(
      normalizeKey(fallback.key)
    );

    return incoming
      ? {
          ...fallback,
          ...incoming,
          key: fallback.key,
          name:
            incoming.name ??
            incoming.test_name ??
            fallback.name,
          calculated:
            incoming.calculated ??
            incoming.isCalculated ??
            fallback.calculated,
          readOnly:
            incoming.readOnly ??
            incoming.read_only ??
            incoming.isCalculated ??
            fallback.readOnly,
        }
      : fallback;
  });

  /*
   * Preserve additional authoritative parameters supplied by the
   * resolver even if they are not part of the default RFT list.
   */
  const known = new Set(
    merged.map((item) => normalizeKey(item.key))
  );

  suppliedAnalytes.forEach((item) => {
    if (!item || typeof item !== "object") return;

    const key = normalizeKey(
      item.key ??
      item.parameter_key ??
      item.test_name ??
      item.testName ??
      item.parameter_name ??
      item.parameterName ??
      item.name
    );

    if (!key || known.has(key)) return;

    merged.push({
      ...item,
      key,
      name:
        item.name ??
        item.test_name ??
        item.testName ??
        key,
      calculated:
        item.calculated === true ||
        item.isCalculated === true ||
        item.readOnly === true,
      readOnly:
        item.readOnly === true ||
        item.read_only === true ||
        item.isCalculated === true,
    });

    known.add(key);
  });

  return merged;
};

export default function RFTPanelResultEntry({
  patient,
  registration,
  demographics,
  analytes: suppliedAnalytes,
  ...props
}) {
  const resolvedDemographics = useMemo(() => {
    const age =
      demographics?.age ??
      getAge(patient, registration);

    const sex =
      demographics?.sex ??
      getSex(patient, registration);

    return {
      age,
      sex,
    };
  }, [
    demographics?.age,
    demographics?.sex,
    patient,
    registration,
  ]);

  const resolvedAnalytes = useMemo(
    () => mergeRFTAnalytes(suppliedAnalytes),
    [suppliedAnalytes]
  );

  /*
   * calculate() receives the complete current parameter map
   * and returns only calculated fields.
   */
  const calculationEngine = useMemo(
    () => ({
      calculate: (values) =>
        calculateRFT(
          values,
          resolvedDemographics
        ),

      calculations: RFT_CALCULATIONS,

      demographics:
        resolvedDemographics,
    }),
    [resolvedDemographics]
  );

  return (
    <ChemistryPanelResultEntry
      title="RFT — Renal Function Test"
      analytes={resolvedAnalytes}
      calculationEngine={calculationEngine}
      patient={patient}
      registration={registration}
      {...props}
    />
  );
}
