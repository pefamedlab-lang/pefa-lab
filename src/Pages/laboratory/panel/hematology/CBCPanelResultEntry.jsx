/*
 * ==========================================================
 * PEFA LAB
 * CBC / FULL BLOOD COUNT PANEL RESULT ENTRY
 * ==========================================================
 *
 * PATH:
 * src/pages/laboratory/panel/hematology/CBCPanelResultEntry.jsx
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Compact CBC result-entry form.
 *
 * DISPLAY:
 *   Parameter
 *   Result
 *   Unit
 *   Reference Range
 *   Flag
 *
 * ABSOLUTE DIFFERENTIAL COUNTS
 * ----------------------------------------------------------
 * Absolute neutrophil, lymphocyte, monocyte, eosinophil and
 * basophil counts are intentionally hidden from the table.
 *
 * IMPORTANT:
 * ----------------------------------------------------------
 * They are NOT deleted from the database payload.
 * They are simply excluded from the visible CBC table to
 * keep the report compact enough for A4 printing.
 *
 * INTERPRETATION
 * ----------------------------------------------------------
 * Interpretation remains visible underneath the table.
 *
 * EDIT MODE
 * ----------------------------------------------------------
 * Supported.
 *
 * REFERENCE RANGE
 * ----------------------------------------------------------
 * Supplied laboratory metadata remains authoritative.
 * CBC fallback ranges are supplied only when metadata is absent.
 *
 * NO SUPABASE ACCESS HERE.
 * ==========================================================
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPanelParameters,
} from "../../../../services/laboratory/panelParameterService";

/* ==========================================================
   HELPERS
   ========================================================== */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const text = (value) =>
  String(value ?? "").trim();

const normalize = (value) =>
  text(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      text(value) !== ""
    ) {
      return value;
    }
  }

  return "";
};

const numericValue = (value) => {
  const n = Number(
    String(value ?? "")
      .replace(/,/g, "")
      .trim()
  );

  return Number.isFinite(n)
    ? n
    : null;
};

/* ==========================================================
   PARAMETER KEY
   ========================================================== */

const getParameterKey = (parameter = {}) => {
  const raw = firstValue(
    parameter.key,
    parameter.parameter_key,
    parameter.id,
    parameter.test_id,
    parameter.test_name,
    parameter.name
  );

  return normalize(raw)
    .replace(/\s+/g, "_");
};

const getParameterName = (parameter = {}) =>
  firstValue(
    parameter.name,
    parameter.test_name,
    parameter.testName,
    parameter.parameter_name,
    parameter.label,
    parameter.key,
    "Unnamed Parameter"
  );

/* ==========================================================
   ABSOLUTE DIFFERENTIAL PARAMETERS
   ==========================================================
 *
 * These remain available in the source/database but are not
 * displayed in the compact CBC table.
 */

const ABSOLUTE_COUNT_NAMES = new Set([
  "absolute neutrophil count",
  "absolute neutrophils",
  "neutrophil absolute",
  "neutrophils absolute",
  "anc",

  "absolute lymphocyte count",
  "absolute lymphocytes",
  "lymphocyte absolute",
  "lymphocytes absolute",
  "alc",

  "absolute monocyte count",
  "absolute monocytes",
  "monocyte absolute",
  "monocytes absolute",
  "amc",

  "absolute eosinophil count",
  "absolute eosinophils",
  "eosinophil absolute",
  "eosinophils absolute",
  "aec",

  "absolute basophil count",
  "absolute basophils",
  "basophil absolute",
  "basophils absolute",
  "abc",
]);

const isAbsoluteDifferential = (
  parameter = {}
) => {
  const name = normalize(
    getParameterName(parameter)
  );

  if (
    ABSOLUTE_COUNT_NAMES.has(name)
  ) {
    return true;
  }

  return (
    name.includes("absolute neutroph") ||
    name.includes("absolute lymphocyte") ||
    name.includes("absolute monocyte") ||
    name.includes("absolute eosinoph") ||
    name.includes("absolute basoph")
  );
};

/* ==========================================================
   CALCULATED PARAMETERS
   ========================================================== */

const isCalculatedParameter = (
  parameter = {}
) => {
  if (
    parameter.calculated === true ||
    parameter.isCalculated === true ||
    parameter.readOnly === true ||
    parameter.read_only === true
  ) {
    return true;
  }

  const name = normalize(
    getParameterName(parameter)
  );

  return (
    name.includes("absolute neutroph") ||
    name.includes("absolute lymphocyte") ||
    name.includes("absolute monocyte") ||
    name.includes("absolute eosinoph") ||
    name.includes("absolute basoph")
  );
};

/* ==========================================================
   CBC FALLBACK REFERENCE RANGES
   ==========================================================
 *
 * These are only fallbacks.
 *
 * If master_tests contains a laboratory-specific reference
 * range, that metadata takes precedence.
 */

const CBC_FALLBACKS = {
  rbc: {
    unit: "×10¹²/L",
    male: "4.5 - 5.9",
    female: "4.1 - 5.1",
    generic: "4.1 - 5.9",
  },

  wbc: {
    unit: "×10⁹/L",
    male: "4.0 - 11.0",
    female: "4.0 - 11.0",
    generic: "4.0 - 11.0",
  },

  rdw_sd: {
    unit: "fL",
    male: "39 - 46",
    female: "39 - 46",
    generic: "39 - 46",
  },
};

/* ==========================================================
   FALLBACK KEY MATCHING
   ========================================================== */

const getFallbackDefinition = (
  parameter
) => {
  const name = normalize(
    getParameterName(parameter)
  );

  if (
    name === "rbc" ||
    name.includes("red blood cell") ||
    name.includes("red cell count") ||
    name.includes("erythrocyte count")
  ) {
    return CBC_FALLBACKS.rbc;
  }

  if (
    name === "wbc" ||
    name.includes("white blood cell") ||
    name.includes("white cell count") ||
    name.includes("leucocyte count") ||
    name.includes("leukocyte count")
  ) {
    return CBC_FALLBACKS.wbc;
  }

  if (
    name === "rdw sd" ||
    name === "rdw-sd"
  ) {
    return CBC_FALLBACKS.rdw_sd;
  }

  return null;
};

/* ==========================================================
   REFERENCE RANGE RESOLUTION
   ========================================================== */

const resolveCBCReference = (
  parameter = {},
  patient = {}
) => {
  const fallback =
    getFallbackDefinition(parameter);

  const sex = normalize(
    patient?.sex ??
      patient?.gender ??
      ""
  );

  const suppliedRange = firstValue(
    parameter.reference_range,
    parameter.referenceRange,
    parameter.normal_range,
    parameter.normalRange,
    parameter.reference_value,
    parameter.referenceValue
  );

  const suppliedMale = firstValue(
    parameter.male_range,
    parameter.maleRange
  );

  const suppliedFemale = firstValue(
    parameter.female_range,
    parameter.femaleRange
  );

  let referenceRange = suppliedRange;

  if (
    sex === "male" ||
    sex === "m"
  ) {
    referenceRange =
      suppliedMale ||
      suppliedRange;
  }

  if (
    sex === "female" ||
    sex === "f"
  ) {
    referenceRange =
      suppliedFemale ||
      suppliedRange;
  }

  if (
    !referenceRange &&
    fallback
  ) {
    if (
      sex === "male" ||
      sex === "m"
    ) {
      referenceRange =
        fallback.male;
    } else if (
      sex === "female" ||
      sex === "f"
    ) {
      referenceRange =
        fallback.female;
    } else {
      referenceRange =
        fallback.generic;
    }
  }

  const unit =
    firstValue(
      parameter.reporting_unit,
      parameter.reportingUnit,
      parameter.result_unit,
      parameter.resultUnit,
      parameter.unit,
      fallback?.unit
    );

  return {
    referenceRange:
      text(referenceRange),

    unit:
      text(unit),

    source:
      suppliedRange ||
      suppliedMale ||
      suppliedFemale
        ? "master_tests"
        : fallback
        ? "CBC fallback"
        : "unconfigured",
  };
};

/* ==========================================================
   RANGE PARSER
   ========================================================== */

const parseRange = (
  value
) => {
  const raw = text(value);

  if (!raw) {
    return {
      min: null,
      max: null,
    };
  }

  const numbers =
    raw.match(
      /-?\d+(?:\.\d+)?/g
    );

  if (
    !numbers ||
    numbers.length < 2
  ) {
    return {
      min: null,
      max: null,
    };
  }

  const a = Number(numbers[0]);
  const b = Number(numbers[1]);

  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b)
  ) {
    return {
      min: null,
      max: null,
    };
  }

  return {
    min: Math.min(a, b),
    max: Math.max(a, b),
  };
};

/* ==========================================================
   FLAG
   ========================================================== */

const calculateFlag = (
  value,
  referenceRange
) => {
  const n =
    numericValue(value);

  if (
    n === null ||
    !referenceRange
  ) {
    return "";
  }

  const {
    min,
    max,
  } =
    parseRange(
      referenceRange
    );

  if (
    min !== null &&
    n < min
  ) {
    return "L";
  }

  if (
    max !== null &&
    n > max
  ) {
    return "H";
  }

  if (
    min !== null ||
    max !== null
  ) {
    return "N";
  }

  return "";
};

/* ==========================================================
   EXISTING PARAMETERS
   ========================================================== */

const extractParameters = (
  source = {}
) => {
  if (!isObject(source)) {
    return {};
  }

  return (
    source.parameters ||
    source.parameter_results ||
    source.result_parameters ||
    source.results ||
    {}
  );
};

const findExistingParameter = (
  parameters,
  parameter
) => {
  if (
    !isObject(parameters)
  ) {
    return {};
  }

  const candidates = [
    parameter.key,
    parameter.id,
    parameter.test_id,
    parameter.test_name,
    parameter.name,
  ].filter(Boolean);

  for (
    const candidate of candidates
  ) {
    if (
      isObject(
        parameters[candidate]
      )
    ) {
      return parameters[candidate];
    }
  }

  const wanted =
    normalize(
      getParameterName(parameter)
    );

  for (
    const [key, value]
    of Object.entries(parameters)
  ) {
    if (
      !isObject(value)
    ) {
      continue;
    }

    if (
      normalize(key) === wanted ||
      normalize(value.name) === wanted ||
      normalize(value.test_name) === wanted
    ) {
      return value;
    }
  }

  return {};
};

/* ==========================================================
   NORMALIZE PARAMETER
   ========================================================== */

const normalizeParameter = (
  parameter,
  existing = {}
) => {
  const key =
    getParameterKey(
      parameter
    );

  const name =
    getParameterName(
      parameter
    );

  const fallback =
    getFallbackDefinition(
      parameter
    );

  const calculated =
    isCalculatedParameter(
      parameter
    );

  const unit =
    firstValue(
      existing.unit,
      parameter.reporting_unit,
      parameter.reportingUnit,
      parameter.result_unit,
      parameter.resultUnit,
      parameter.unit,
      fallback?.unit
    );

  const value =
    firstValue(
      existing.value,
      existing.result,
      existing.result_value,
      existing.result_numeric,
      ""
    );

  return {
    ...parameter,
    ...existing,

    key,
    name,
    test_name:
      parameter.test_name ||
      name,

    value,

    unit:

      text(unit),

    result_unit:
      text(
        firstValue(
          existing.result_unit,
          parameter.result_unit,
          unit
        )
      ),

    reporting_unit:
      text(
        firstValue(
          existing.reporting_unit,
          parameter.reporting_unit,
          unit
        )
      ),

    calculated:
      calculated ||
      existing.calculated === true,

    readOnly:
      calculated ||
      existing.readOnly === true,

    method:
      firstValue(
        existing.method,
        parameter.method,
        ""
      ),

    manual_reference_range:
      firstValue(
        existing.manual_reference_range,
        ""
      ),
  };
};

/* ==========================================================
   DEFAULT CBC INTERPRETATION
   ========================================================== */

const numericParameterValue = (rows, key) => {
  const row = rows.find((item) => {
    const name = normalize(
      item?.key || item?.name || item?.parameter || item?.parameter_name
    );
    return name === key;
  });

  if (!row) return null;

  const value = Number(
    String(
      firstValue(
        row?.value,
        row?.result_value,
        row?.resultValue,
        row?.result,
        ""
      )
    ).replace(/,/g, "").trim()
  );

  return Number.isFinite(value) ? value : null;
};

const buildCBCRedCellMorphology = (rows) => {
  const hb = numericParameterValue(rows, "haemoglobin");
  const mcv = numericParameterValue(rows, "mcv");
  const mch = numericParameterValue(rows, "mch");
  const mchc = numericParameterValue(rows, "mchc");
  const rdw = numericParameterValue(rows, "rdw cv");
  const rbc = numericParameterValue(rows, "rbc");

  const findings = [];

  // Use the laboratory's reported/reference flags where available, but
  // retain conventional adult index cut-offs as a morphology fallback.
  const rowFlag = (key) => {
    const row = rows.find((item) => normalize(item?.key || item?.name) === key);
    return normalize(row?.flag);
  };

  const mcvLow = rowFlag("mcv") === "l" || (mcv !== null && mcv < 80);
  const mcvHigh = rowFlag("mcv") === "h" || (mcv !== null && mcv > 100);
  const mcvNormal = rowFlag("mcv") === "n" || (mcv !== null && mcv >= 80 && mcv <= 100);
  const mchLow = rowFlag("mch") === "l" || (mch !== null && mch < 27);
  const mchcLow = rowFlag("mchc") === "l" || (mchc !== null && mchc < 32);
  const mchcNormal = rowFlag("mchc") === "n" || (mchc !== null && mchc >= 32 && mchc <= 36);
  const rdwHigh = rowFlag("rdw cv") === "h" || (rdw !== null && rdw > 14.5);
  const hbLow = rowFlag("haemoglobin") === "l" || (hb !== null && hb < 12);

  let morphology = "";

  if (mcvLow) {
    morphology = (mchLow || mchcLow)
      ? "microcytic hypochromic red-cell pattern"
      : "microcytic red-cell pattern";
  } else if (mcvHigh) {
    morphology = (mchcNormal || mchc === null)
      ? "macrocytic, generally normochromic red-cell pattern"
      : "macrocytic red-cell pattern";
  } else if (mcvNormal) {
    morphology = (mchcLow || mchLow)
      ? "normocytic hypochromic red-cell pattern"
      : "normocytic normochromic red-cell pattern";
  }

  if (morphology) {
    findings.push(
      hbLow
        ? `The red-cell indices indicate a ${morphology}, consistent with an ${morphology.includes("microcytic") ? "microcytic" : morphology.includes("macrocytic") ? "macrocytic" : "normocytic"} anaemic pattern.`
        : `The red-cell indices indicate a ${morphology}.`
    );
  }

  if (rdwHigh) {
    findings.push("Increased RDW indicates anisocytosis, reflecting increased variation in red-cell size.");
  }

  // Mentzer index is a screening pattern only; it is not diagnostic.
  if (mcv !== null && rbc !== null && mcv < 80 && rbc > 0) {
    const mentzer = mcv / rbc;
    if (mentzer < 13) {
      findings.push("The low MCV with relatively preserved/high RBC count gives a Mentzer index below 13, a pattern that may favour thalassaemia trait over iron deficiency; this is a screening clue, not a diagnosis.");
    } else if (mentzer >= 13) {
      findings.push("The low MCV with the calculated Mentzer index of 13 or above may favour iron deficiency over thalassaemia trait; correlate with ferritin/iron studies and clinical findings.");
    }
  }

  return findings;
};

const buildCBCWhiteCellInterpretation = (rows) => {
  const get = (names) => rows.find((row) => names.includes(String(row.key || "").toLowerCase()) || names.includes(String(row.name || "").trim().toLowerCase()));
  const num = (row) => {
    const value = Number(String(row?.value ?? "").replace(/,/g, "").trim());
    return Number.isFinite(value) ? value : null;
  };
  const flag = (row) => String(row?.flag || "").toUpperCase();
  const findings = [];
  const wbc = get(["wbc", "white blood cell", "white blood cells", "total wbc"]);
  const anc = get(["neutrophils_absolute", "neutrophils absolute", "absolute neutrophil count", "anc"]);
  const alc = get(["lymphocytes_absolute", "lymphocytes absolute", "absolute lymphocyte count", "alc"]);
  const amc = get(["monocytes_absolute", "monocytes absolute", "absolute monocyte count", "amc"]);
  const aec = get(["eosinophils_absolute", "eosinophils absolute", "absolute eosinophil count", "aec"]);
  const abc = get(["basophils_absolute", "basophils absolute", "absolute basophil count", "abc"]);
  const classify = (row, lo, hi) => {
    const v = num(row), f = flag(row);
    return { low: f === "L" || (v !== null && v < lo), high: f === "H" || (v !== null && v > hi) };
  };
  const w = classify(wbc, 4, 11);
  if (w.high) findings.push("Leucocytosis is present; this may occur with infection, inflammation, physiological stress, tissue injury or haematological disorders.");
  if (w.low) findings.push("Leucopenia is present; this may occur with viral infection, marrow suppression, drug effects, autoimmune disease or severe systemic illness.");
  const cells = [
    [anc, 2, 7.5, "Neutrophilia", "Neutropenia", "bacterial infection, acute inflammation, physiological stress or corticosteroid effect", "viral infection, drug effects, marrow suppression or immune-mediated disease"],
    [alc, 1, 4, "Lymphocytosis", "Lymphopenia", "viral infection, some chronic infections or lymphoproliferative disorders", "acute systemic stress, corticosteroid effect, immunodeficiency or severe illness"],
    [amc, 0.2, 1, "Monocytosis", "Monocytopenia", "chronic infection, inflammation, recovery from acute infection or some haematological disorders", "a variety of transient or marrow-related conditions and should be correlated clinically"],
    [aec, 0, 0.5, "Eosinophilia", "Eosinopenia", "allergic disease, parasitic infection and selected drug or inflammatory disorders", "usually limited isolated clinical significance"],
    [abc, 0, 0.1, "Basophilia", "Basopenia", "allergic/inflammatory states and, when persistent or marked, possible myeloproliferative disease", "usually limited isolated clinical significance"],
  ];
  cells.forEach(([row, lo, hi, highName, lowName, highCauses, lowCauses]) => {
    const c = classify(row, lo, hi);
    if (c.high) findings.push(`${highName} is present; possible associations include ${highCauses}.`);
    if (c.low) findings.push(`${lowName} is present; ${lowCauses}.`);
  });
  return findings;
};

const buildCBCIntegratedInterpretation = (rows) => {
  const getRow = (keys) => rows.find((row) => keys.includes(normalize(row?.key || row?.name || row?.parameter || row?.parameter_name)));
  const valueOf = (row) => {
    const value = Number(String(firstValue(row?.value, row?.result_value, row?.resultValue, row?.result, "")).replace(/,/g, "").trim());
    return Number.isFinite(value) ? value : null;
  };
  const flagOf = (row) => normalize(row?.flag);
  const state = (row, low, high) => {
    const f = flagOf(row);
    const v = valueOf(row);
    return {
      low: f === "l" || f === "low" || (v !== null && v < low),
      high: f === "h" || f === "high" || (v !== null && v > high),
      normal: f === "n" || f === "normal" || (v !== null && v >= low && v <= high),
      value: v,
    };
  };

  const hb = state(getRow(["haemoglobin", "hemoglobin", "hb"]), 12, 17.5);
  const rbc = valueOf(getRow(["rbc", "red blood cell", "red blood cells", "red cell count", "erythrocyte count"]));
  const mcv = state(getRow(["mcv", "mean corpuscular volume"]), 80, 100);
  const mch = state(getRow(["mch", "mean corpuscular haemoglobin", "mean corpuscular hemoglobin"]), 27, 33);
  const mchc = state(getRow(["mchc", "mean corpuscular haemoglobin concentration", "mean corpuscular hemoglobin concentration"]), 32, 36);
  const rdw = state(getRow(["rdw", "rdw cv", "rdw-cv", "red cell distribution width"]), 11.5, 14.5);
  const wbc = state(getRow(["wbc", "white blood cell", "white blood cells", "total wbc"]), 4, 11);
  const anc = state(getRow(["neutrophils_absolute", "neutrophils absolute", "absolute neutrophil count", "anc"]), 2, 7.5);
  const alc = state(getRow(["lymphocytes_absolute", "lymphocytes absolute", "absolute lymphocyte count", "alc"]), 1, 4);
  const amc = state(getRow(["monocytes_absolute", "monocytes absolute", "absolute monocyte count", "amc"]), 0.2, 1);
  const aec = state(getRow(["eosinophils_absolute", "eosinophils absolute", "absolute eosinophil count", "aec"]), 0, 0.5);
  const abc = state(getRow(["basophils_absolute", "basophils absolute", "absolute basophil count", "abc"]), 0, 0.1);
  const platelets = state(getRow(["platelets", "platelet", "plt"]), 150, 450);

  const findings = [];
  let morphology = "";
  if (mcv.low) {
    morphology = (mch.low || mchc.low) ? "microcytic hypochromic" : "microcytic";
  } else if (mcv.high) {
    morphology = mchc.low ? "macrocytic hypochromic" : "macrocytic normochromic";
  } else if (mcv.normal) {
    morphology = (mch.low || mchc.low) ? "normocytic hypochromic" : "normocytic normochromic";
  }

  if (morphology) {
    findings.push(hb.low
      ? `${morphology} red-cell pattern with anaemia`
      : `${morphology} red-cell pattern`);
  } else if (hb.low) {
    findings.push("anaemia");
  } else if (hb.high) {
    findings.push("erythrocytosis pattern");
  }

  if (rdw.high) findings.push("anisocytosis");

  if (wbc.high) findings.push("leucocytosis");
  else if (wbc.low) findings.push("leucopenia");
  if (anc.high) findings.push("neutrophilia");
  else if (anc.low) findings.push("neutropenia");
  if (alc.high) findings.push("lymphocytosis");
  else if (alc.low) findings.push("lymphopenia");
  if (amc.high) findings.push("monocytosis");
  else if (amc.low) findings.push("monocytopenia");
  if (aec.high) findings.push("eosinophilia");
  else if (aec.low && aec.value !== null) findings.push("eosinopenia");
  if (abc.high) findings.push("basophilia");
  else if (abc.low && abc.value !== null) findings.push("basopenia");
  if (platelets.high) findings.push("thrombocytosis");
  else if (platelets.low) findings.push("thrombocytopenia");

  if (!findings.length) return "No significant haematological abnormality detected from the reported parameters.";

  const first = findings[0];
  const remainder = findings.slice(1);
  let sentence = remainder.length ? `${first} with ${remainder.join(", ")}.` : `${first}.`;
  const comments = [];

  if (hb.low && morphology.includes("microcytic")) {
    comments.push("The microcytic pattern may be associated with iron deficiency or thalassaemia trait; correlate with ferritin/iron studies and clinical findings.");
  } else if (hb.low && morphology.includes("macrocytic")) {
    comments.push("The macrocytic pattern may be associated with vitamin B12/folate deficiency, alcohol exposure, liver disease, medication effects or other causes; correlate clinically.");
  } else if (hb.low) {
    comments.push("Anaemia should be correlated with red-cell indices, reticulocyte response and clinical findings.");
  }

  if (mcv.value !== null && rbc !== null && mcv.value < 80 && rbc > 0) {
    const mentzer = mcv.value / rbc;
    comments.push(mentzer < 13
      ? "A Mentzer index below 13 may favour thalassaemia trait over iron deficiency; this is a screening clue, not a diagnosis."
      : "A Mentzer index of 13 or above may favour iron deficiency over thalassaemia trait; correlate with ferritin/iron studies and clinical findings.");
  }

  return [sentence, ...comments].join(" ");
};

const buildCBCInterpretation = (rows) => buildCBCIntegratedInterpretation(rows);

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function CBCPanelResultEntry({
  title =
    "CBC / Full Blood Count",

  panelName =
    "Complete Blood Count",

  analytes = [],

  parameters = [],

  panelParameters = [],

  patient = null,

  registration = null,

  test = null,

  result = null,

  initialResult = null,

  existingResult = null,

  value = null,

  onChange,

  onSave,

  onSaved,

  onCancel,

  onBack,

  readOnly = false,

  disabled = false,

  editMode = false,

  className = "",

  /* Internal resolver metadata. Consume locally; never spread to DOM. */
  parameterSource = null,
  parameterLoading = false,
  parameterError = null,
  demographics = null,
}) {
  /* ========================================================
     SUPPLIED ANALYTES
     ======================================================== */

  const CBC_CANONICAL_STRUCTURE = [
  { key: "haemoglobin", name: "Haemoglobin", test_name: "Haemoglobin", unit: "g/dL", reference_value: "Male: 13.0 - 17.0; Female: 12.0 - 15.0", calculated: false, readOnly: false },
  { key: "haematocrit", name: "Haematocrit", test_name: "Haematocrit", unit: "%", reference_value: "Male: 40 - 52; Female: 36 - 46", calculated: false, readOnly: false },
  { key: "rbc", name: "RBC", test_name: "RBC", unit: "×10¹²/L", reference_value: "Male: 4.5 - 5.9; Female: 4.1 - 5.1", male_range: "4.5 - 5.9", female_range: "4.1 - 5.1", calculated: false, readOnly: false },
  { key: "wbc", name: "WBC", test_name: "WBC", unit: "×10⁹/L", reference_value: "4.0 - 11.0", calculated: false, readOnly: false },
  { key: "platelets", name: "Platelets", test_name: "Platelets", unit: "×10⁹/L", reference_value: "150 - 400", calculated: false, readOnly: false },
  { key: "mcv", name: "MCV", test_name: "MCV", unit: "fL", calculated: true, readOnly: true },
  { key: "mch", name: "MCH", test_name: "MCH", unit: "pg", calculated: true, readOnly: true },
  { key: "mchc", name: "MCHC", test_name: "MCHC", unit: "g/dL", calculated: true, readOnly: true },
  { key: "rdw_cv", name: "RDW-CV", test_name: "RDW-CV", unit: "%", calculated: false, readOnly: false },
  { key: "rdw_sd", name: "RDW-SD", test_name: "RDW-SD", unit: "fL", reference_value: "39 - 46", calculated: false, readOnly: false },
  { key: "neutrophils", name: "Neutrophils", test_name: "Neutrophils", unit: "%", calculated: false, readOnly: false },
  { key: "lymphocytes", name: "Lymphocytes", test_name: "Lymphocytes", unit: "%", calculated: false, readOnly: false },
  { key: "monocytes", name: "Monocytes", test_name: "Monocytes", unit: "%", calculated: false, readOnly: false },
  { key: "eosinophils", name: "Eosinophils", test_name: "Eosinophils", unit: "%", calculated: false, readOnly: false },
  { key: "basophils", name: "Basophils", test_name: "Basophils", unit: "%", calculated: false, readOnly: false },
  { key: "neutrophils_absolute", name: "Neutrophils Absolute", test_name: "Neutrophils Absolute", unit: "×10⁹/L", calculated: true, readOnly: true },
  { key: "lymphocytes_absolute", name: "Lymphocytes Absolute", test_name: "Lymphocytes Absolute", unit: "×10⁹/L", calculated: true, readOnly: true },
  { key: "monocytes_absolute", name: "Monocytes Absolute", test_name: "Monocytes Absolute", unit: "×10⁹/L", calculated: true, readOnly: true },
  { key: "eosinophils_absolute", name: "Eosinophils Absolute", test_name: "Eosinophils Absolute", unit: "×10⁹/L", calculated: true, readOnly: true },
  { key: "basophils_absolute", name: "Basophils Absolute", test_name: "Basophils Absolute", unit: "×10⁹/L", calculated: true, readOnly: true },
];

const canonicalKey = (parameter = {}) => normalize(getParameterKey(parameter));

const mergeCanonicalCBCStructure = (supplied, database) => {
  const map = new Map();
  for (const item of CBC_CANONICAL_STRUCTURE) map.set(canonicalKey(item), item);
  for (const item of supplied || []) {
    if (!item) continue;
    const key = canonicalKey(item);
    if (!key) continue;
    map.set(key, { ...(map.get(key) || {}), ...item });
  }
  for (const item of database || []) {
    if (!item) continue;
    const key = canonicalKey(item);
    if (!key) continue;
    map.set(key, { ...(map.get(key) || {}), ...item });
  }
  return CBC_CANONICAL_STRUCTURE.map((fallback) => map.get(canonicalKey(fallback)) || fallback)
    .concat(Array.from(map.values()).filter((item) => !CBC_CANONICAL_STRUCTURE.some((base) => canonicalKey(base) === canonicalKey(item))));
};

const suppliedAnalytes =
    useMemo(() => {
      const candidates = [
        analytes,
        parameters,
        panelParameters,
      ];

      return (
        candidates.find(
          (candidate) =>
            Array.isArray(candidate) &&
            candidate.length > 0
        ) || []
      );
    }, [
      analytes,
      parameters,
      panelParameters,
    ]);

  /* ========================================================
     SOURCE RESULT
     ======================================================== */

  const sourceResult =
    result ||
    initialResult ||
    existingResult ||
    (isObject(value)
      ? value
      : {});

  /* ========================================================
     DATABASE PARAMETERS
     ======================================================== */

  const [databaseAnalytes, setDatabaseAnalytes] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    getPanelParameters({
      test,
      panelName:
        panelName ||
        title,

      panelId:
        test?.panel_id ??
        test?.panelId ??
        test?._panelId ??
        test?.master_test_id ??
        test?.masterTestId ??
        test?.masterTest?.id ??
        test?.master_test?.id ??
        null,

      demographics: {
        sex:
          patient?.sex ??
          patient?.gender,

        age:
          patient?.age ??
          patient?.patient_age,
      },
    })
      .then((response) => {
        if (cancelled) return;

        const rows =
          Array.isArray(
            response?.parameters
          )
            ? response.parameters
            : Array.isArray(
                response?.data
              )
            ? response.data
            : [];

        setDatabaseAnalytes(
          rows
        );

        if (
          !rows.length &&
          !suppliedAnalytes.length
        ) {
          setLoadError(
            response?.error?.message ||
              "No CBC parameters were found."
          );
        }
      })
      .catch((error) => {
        if (cancelled) return;

        setDatabaseAnalytes(
          []
        );

        if (
          !suppliedAnalytes.length
        ) {
          setLoadError(
            error?.message ||
              "Unable to load CBC parameters."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    panelName,
    title,
    test,
    patient,
    suppliedAnalytes.length,
  ]);

  /* ========================================================
     MERGE DATABASE + SUPPLIED
     ======================================================== */

  const effectiveAnalytes =
    useMemo(
      () =>
        mergeCanonicalCBCStructure(
          suppliedAnalytes,
          databaseAnalytes
        ),
      [
        suppliedAnalytes,
        databaseAnalytes,
      ]
    );

  /* ========================================================
     COMPACT DISPLAY PARAMETERS
     ======================================================== */

  const displayAnalytes =
    useMemo(
      () =>
        effectiveAnalytes.filter(
          (parameter) =>
            !isAbsoluteDifferential(
              parameter
            )
        ),
      [effectiveAnalytes]
    );

  /* ========================================================
     FORM STATE
     ======================================================== */

  const buildInitialState =
    useCallback(() => {
      const existing =
        extractParameters(
          sourceResult
        );

      const state = {};

      effectiveAnalytes.forEach(
        (parameter) => {
          const old =
            findExistingParameter(
              existing,
              parameter
            );

          const normalized =
            normalizeParameter(
              parameter,
              old
            );

          state[
            normalized.key
          ] = normalized;
        }
      );

      return state;
    }, [
      sourceResult,
      effectiveAnalytes,
    ]);

  const [form, setForm] =
    useState(() => ({
      parameters:
        buildInitialState(),

      interpretation:
        sourceResult?.interpretation ||
        "",

      comments:
        sourceResult?.comments ||
        "",
    }));

  useEffect(() => {
    setForm({
      parameters:
        buildInitialState(),

      interpretation:
        sourceResult?.interpretation ||
        "",

      comments:
        sourceResult?.comments ||
        "",
    });
  }, [
    buildInitialState,
    sourceResult,
  ]);

  /* ========================================================
     RESOLVED ROWS
     ======================================================== */

  const rows =
    useMemo(() => {
      return displayAnalytes.map(
        (parameter) => {
          const key =
            getParameterKey(
              parameter
            );

          const current =
            form.parameters?.[key] ||
            normalizeParameter(
              parameter
            );

          const range =
            resolveCBCReference(
              {
                ...parameter,
                ...current,
              },
              patient || {}
            );

          const referenceRange =
            current.manual_reference_range ||
            range.referenceRange;

          const flag =
            calculateFlag(
              current.value,
              referenceRange
            );

          return {
            ...parameter,
            ...current,

            key,
            name:
              getParameterName(
                parameter
              ),

            unit:
              current.unit ||
              range.unit ||
              "",

            referenceRange,

            reference_source:
              current.manual_reference_range
                ? "manual"
                : range.source,

            flag,
          };
        }
      );
    }, [
      displayAnalytes,
      form.parameters,
      patient,
    ]);

  /* ========================================================
     INTERPRETATION
     ======================================================== */

  const interpretation =
    useMemo(() => {
      const supplied =
        text(
          form.interpretation
        );

      if (supplied) {
        return supplied;
      }

      return buildCBCInterpretation(
        rows
      );
    }, [
      form.interpretation,
      rows,
    ]);

  /* ========================================================
     UPDATE PARAMETER
     ======================================================== */

  const updateParameter =
    useCallback(
      (
        key,
        field,
        value
      ) => {
        if (
          disabled ||
          readOnly
        ) {
          return;
        }

        setForm(
          (previous) => ({
            ...previous,

            parameters: {
              ...previous.parameters,

              [key]: {
                ...(previous
                  .parameters?.[
                  key
                ] || {}),

                [field]:
                  value,
              },
            },
          })
        );
      },
      [
        disabled,
        readOnly,
      ]
    );

  /* ========================================================
     PAYLOAD
     ======================================================== */

  const buildPayload =
    useCallback(() => {
      /*
       * IMPORTANT:
       * Build the payload from ALL effectiveAnalytes,
       * not only displayAnalytes.
       *
       * Therefore hidden absolute counts are preserved.
       */

      const parameterResults =
        Object.fromEntries(
          effectiveAnalytes.map(
            (parameter) => {
              const key =
                getParameterKey(
                  parameter
                );

              const current =
                form.parameters?.[
                  key
                ] ||
                normalizeParameter(
                  parameter
                );

              const range =
                resolveCBCReference(
                  {
                    ...parameter,
                    ...current,
                  },
                  patient || {}
                );

              const referenceRange =
                current.manual_reference_range ||
                range.referenceRange;

              const flag =
                calculateFlag(
                  current.value,
                  referenceRange
                );

              return [
                key,
                {
                  ...parameter,
                  ...current,

                  key,

                  name:
                    getParameterName(
                      parameter
                    ),

                  result:
                    current.value ??
                    "",

                  value:
                    current.value ??
                    "",

                  unit:
                    current.unit ||
                    range.unit ||
                    "",

                  reference_range:
                    referenceRange ||
                    "",

                  referenceRange:
                    referenceRange ||
                    "",

                  flag:
                    flag || "",

                  result_flag:
                    flag || "",

                  reference_source:
                    current.manual_reference_range
                      ? "manual"
                      : range.source,
                },
              ];
            }
          )
        );

      return {
        ...sourceResult,

        parameters:
          parameterResults,

        parameter_results:
          parameterResults,

        interpretation,

        comments:
          form.comments ||
          "",

        patient,

        registration,

        test,
      };
    }, [
      effectiveAnalytes,
      form.parameters,
      form.comments,
      interpretation,
      patient,
      registration,
      test,
      sourceResult,
    ]);

  /* ========================================================
     CHANGE
     ======================================================== */

  useEffect(() => {
    if (
      typeof onChange !==
      "function"
    ) {
      return;
    }

    onChange(
      buildPayload()
    );
  }, [
    buildPayload,
    onChange,
  ]);

  /* ========================================================
     SAVE
     ======================================================== */

  const handleSave =
    () => {
      const payload =
        buildPayload();

      if (
        typeof onSave ===
        "function"
      ) {
        onSave(payload);
      }

      if (
        typeof onSaved ===
        "function"
      ) {
        onSaved(payload);
      }
    };

  /* ========================================================
     FLAG DISPLAY
     ======================================================== */

  const flagClass =
    (flag) => {
      const value =
        normalize(flag);

      if (
        value === "h" ||
        value.includes("high")
      ) {
        return "cbc-flag-high";
      }

      if (
        value === "l" ||
        value.includes("low")
      ) {
        return "cbc-flag-low";
      }

      if (
        value === "n" ||
        value.includes("normal")
      ) {
        return "cbc-flag-normal";
      }

      return "";
    };

  const isDisabled =
    Boolean(
      disabled ||
      readOnly
    );

  /* ========================================================
     STYLES
     ======================================================== */

  const styles = {
    wrapper: {
      width: "100%",
      maxWidth: "100%",
      fontFamily:
        "Inter, system-ui, sans-serif",
      color: "#172033",
    },

    card: {
      width: "100%",
      border:
        "1px solid #dbe3ea",
      borderRadius: 9,
      background: "#fff",
      overflow: "hidden",
    },

    header: {
      padding:
        "10px 12px",
      borderBottom:
        "1px solid #e2e8f0",
      background:
        "#f8fafc",
    },

    eyebrow: {
      fontSize: 8,
      fontWeight: 800,
      letterSpacing:
        ".08em",
      color: "#334155",
      textTransform:
        "uppercase",
    },

    title: {
      margin:
        "2px 0 0",
      fontSize: 16,
      fontWeight: 750,
      color: "#0f172a",
    },

    subtitle: {
      margin:
        "3px 0 0",
      fontSize: 9,
      color: "#64748b",
    },

    tableWrap: {
      width: "100%",
      overflowX:
        "auto",
    },

    table: {
      width: "100%",
      minWidth: 560,
      borderCollapse:
        "collapse",
      tableLayout:
        "fixed",
    },

    th: {
      padding:
        "6px 7px",
      background:
        "#f1f5f9",
      borderBottom:
        "1px solid #cbd5e1",
      textAlign:
        "left",
      fontSize: 8,
      fontWeight: 800,
      color: "#475569",
      textTransform:
        "uppercase",
      letterSpacing:
        ".03em",
    },

    td: {
      padding:
        "5px 7px",
      borderBottom:
        "1px solid #e5e7eb",
      fontSize: 10,
      lineHeight: 1.2,
      color: "#1e293b",
      verticalAlign:
        "middle",
    },

    parameter: {
      fontWeight: 700,
    },

    input: {
      width: "100%",
      height: 27,
      padding:
        "4px 6px",
      border:
        "1px solid #cbd5e1",
      borderRadius: 5,
      fontSize: 10,
      boxSizing:
        "border-box",
      background: "#fff",
    },

    readOnly: {
      background:
        "#f8fafc",
      color: "#64748b",
    },

    interpretation: {
      padding:
        "9px 11px",
      borderTop:
        "1px solid #e2e8f0",
      background:
        "#f8fafc",
    },

    interpretationTitle: {
      fontSize: 8,
      fontWeight: 800,
      color: "#64748b",
      textTransform:
        "uppercase",
      letterSpacing:
        ".06em",
      marginBottom: 3,
    },

    interpretationText: {
      fontSize: 10,
      lineHeight: 1.35,
      color: "#334155",
    },

    notes: {
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap: 8,
      padding: 9,
      borderTop:
        "1px solid #e2e8f0",
    },

    actions: {
      display: "flex",
      justifyContent:
        "flex-end",
      gap: 7,
      padding: 9,
      borderTop:
        "1px solid #e2e8f0",
    },

    button: {
      border:
        "1px solid #cbd5e1",
      borderRadius: 5,
      padding:
        "7px 11px",
      fontSize: 10,
      fontWeight: 750,
      cursor: "pointer",
      background: "#fff",
    },

    primary: {
      background:
        "#0f766e",
      borderColor:
        "#0f766e",
      color: "#fff",
    },
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div
      className={`pefa-cbc-panel ${className}`}
      style={styles.wrapper}
    >
      <style>{`
        .pefa-cbc-panel,
        .pefa-cbc-panel * {
          box-sizing:border-box;
        }

        .pefa-cbc-panel .cbc-flag-high {
          color:#b91c1c;
          font-weight:800;
        }

        .pefa-cbc-panel .cbc-flag-low {
          color:#b45309;
          font-weight:800;
        }

        .pefa-cbc-panel .cbc-flag-normal {
          color:#15803d;
          font-weight:800;
        }

        .pefa-cbc-panel input:focus,
        .pefa-cbc-panel textarea:focus,
        .pefa-cbc-panel select:focus {
          outline:none;
          border-color:#64748b;
          box-shadow:0 0 0 2px rgba(100,116,139,.08);
        }

        @media print {
          .pefa-cbc-panel {
            width:100% !important;
            max-width:100% !important;
          }

          .pefa-cbc-panel .cbc-actions {
            display:none !important;
          }

          .pefa-cbc-panel .cbc-notes {
            display:none !important;
          }

          .pefa-cbc-panel table {
            min-width:0 !important;
            width:100% !important;
          }

          .pefa-cbc-panel th,
          .pefa-cbc-panel td {
            padding:4px 5px !important;
            font-size:8.5px !important;
          }

          .pefa-cbc-panel input {
            border:0 !important;
            padding:0 !important;
            height:auto !important;
            background:transparent !important;
            font-size:8.5px !important;
          }

          .pefa-cbc-panel .cbc-interpretation {
            padding:6px 8px !important;
          }

          .pefa-cbc-panel .cbc-interpretation-title {
            font-size:7px !important;
          }

          .pefa-cbc-panel .cbc-interpretation-text {
            font-size:8.5px !important;
          }
        }

        @media(max-width:700px) {
          .pefa-cbc-panel table {
            min-width:540px;
          }

          .pefa-cbc-panel .cbc-notes {
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div style={styles.card}>

        {/* ==================================================
            HEADER
            ================================================== */}

        <div style={styles.header}>
          <div style={styles.eyebrow}>
            HAEMATOLOGY
          </div>

          <h2 style={styles.title}>
            {title}
          </h2>

          <p style={styles.subtitle}>
            {editMode
              ? "EDIT MODE — Review or update the CBC results."
              : "Enter measured results. Reference ranges and flags are resolved from laboratory metadata."}
          </p>
        </div>

        {/* ==================================================
            TABLE
            ================================================== */}

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <colgroup>
              <col style={{ width: "27%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "29%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>

            <thead>
              <tr>
                <th style={styles.th}>
                  Parameter
                </th>

                <th style={styles.th}>
                  Result
                </th>

                <th style={styles.th}>
                  Unit
                </th>

                <th style={styles.th}>
                  Reference Range
                </th>

                <th style={styles.th}>
                  Flag
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      ...styles.td,
                      textAlign:
                        "center",
                      padding: 18,
                      color:
                        "#64748b",
                    }}
                  >
                    {loading
                      ? "Loading CBC parameters..."
                      : loadError ||
                        "No haematology panel parameters were supplied."}
                  </td>
                </tr>
              ) : (
                rows.map(
                  (row) => {
                    const locked =
                      isDisabled ||
                      row.calculated ||
                      row.readOnly;

                    return (
                      <tr
                        key={
                          row.key
                        }
                      >
                        <td
                          style={{
                            ...styles.td,
                            ...styles.parameter,
                          }}
                        >
                          {row.name}

                          {row.calculated && (
                            <span
                              style={{
                                display:
                                  "block",
                                marginTop: 1,
                                fontSize: 7,
                                color:
                                  "#64748b",
                                fontWeight:
                                  600,
                              }}
                            >
                              CALCULATED
                            </span>
                          )}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              row.value ??
                              ""
                            }
                            readOnly={
                              locked
                            }
                            disabled={
                              locked
                            }
                            onChange={(
                              event
                            ) =>
                              updateParameter(
                                row.key,
                                "value",
                                event
                                  .target
                                  .value
                              )
                            }
                            style={{
                              ...styles.input,
                              ...(locked
                                ? styles.readOnly
                                : {}),
                            }}
                          />
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.unit ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.manual_reference_range ? (
                            <input
                              type="text"
                              disabled={
                                isDisabled
                              }
                              value={
                                row.manual_reference_range
                              }
                              onChange={(
                                event
                              ) =>
                                updateParameter(
                                  row.key,
                                  "manual_reference_range",
                                  event
                                    .target
                                    .value
                                )
                              }
                              style={
                                styles.input
                              }
                            />
                          ) : (
                            <span>
                              {row.referenceRange ||
                                "Not configured"}
                            </span>
                          )}
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            textAlign:
                              "center",
                          }}
                        >
                          <span
                            className={flagClass(
                              row.flag
                            )}
                          >
                            {row.flag ||
                              "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* ==================================================
            INTERPRETATION
            ================================================== */}

        <div
          className="cbc-interpretation"
          style={
            styles.interpretation
          }
        >
          <div
            className="cbc-interpretation-title"
            style={
              styles.interpretationTitle
            }
          >
            Interpretation
          </div>

          <div
            className="cbc-interpretation-text"
            style={
              styles.interpretationText
            }
          >
            {interpretation ||
              "No interpretation entered."}
          </div>
        </div>

        {/* ==================================================
            NOTES
            ================================================== */}

        <div
          className="cbc-notes"
          style={styles.notes}
        >
          <label>
            <span
              style={{
                display:
                  "block",
                fontSize: 8,
                fontWeight: 750,
                color:
                  "#475569",
              }}
            >
              Interpretation Override
            </span>

            <textarea
              disabled={
                isDisabled
              }
              value={
                form.interpretation ||
                ""
              }
              onChange={(
                event
              ) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    interpretation:
                      event
                        .target
                        .value,
                  })
                )
              }
              placeholder="Leave blank for automatic interpretation."
              style={{
                width:
                  "100%",
                marginTop: 3,
                minHeight: 45,
                resize:
                  "vertical",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 5,
                padding: 6,
                fontSize: 9,
              }}
            />
          </label>

          <label>
            <span
              style={{
                display:
                  "block",
                fontSize: 8,
                fontWeight: 750,
                color:
                  "#475569",
              }}
            >
              Comments
            </span>

            <textarea
              disabled={
                isDisabled
              }
              value={
                form.comments ||
                ""
              }
              onChange={(
                event
              ) =>
                setForm(
                  (previous) => ({
                    ...previous,
                    comments:
                      event
                        .target
                        .value,
                  })
                )
              }
              style={{
                width:
                  "100%",
                marginTop: 3,
                minHeight: 45,
                resize:
                  "vertical",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 5,
                padding: 6,
                fontSize: 9,
              }}
            />
          </label>
        </div>

        {/* ==================================================
            ACTIONS
            ================================================== */}

        {!readOnly && (
          <div
            className="cbc-actions"
            style={
              styles.actions
            }
          >
            {onBack && (
              <button
                type="button"
                disabled={
                  disabled
                }
                onClick={
                  onBack
                }
                style={{
                  ...styles.button,
                }}
              >
                Back
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                disabled={
                  disabled
                }
                onClick={
                  onCancel
                }
                style={{
                  ...styles.button,
                }}
              >
                Cancel
              </button>
            )}

            {(onSave ||
              onSaved) && (
              <button
                type="button"
                disabled={
                  disabled
                }
                onClick={
                  handleSave
                }
                style={{
                  ...styles.button,
                  ...styles.primary,
                  opacity:
                    disabled
                      ? 0.55
                      : 1,
                }}
              >
                {editMode
                  ? "Update Result"
                  : "Save Result"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}