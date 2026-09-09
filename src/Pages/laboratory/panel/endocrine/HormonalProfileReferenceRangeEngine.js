/*
 * ==========================================================
 * PEFA ENTERPRISE LIS
 * HORMONAL PROFILE REFERENCE RANGE ENGINE
 * ==========================================================
 *
 * PATH:
 * src/pages/laboratory/panel/endocrine/
 * HormonalProfileReferenceRangeEngine.js
 *
 * PURPOSE
 * - Preserve the API required by HormonalProfileResultEntry.jsx
 * - Resolve units and reference ranges without importing a
 *   missing SpecificTestReferenceRangeEngine
 * - Support manual, database/master-test and registry ranges
 * - Support sex, age, pregnancy, trimester and cycle phase
 * - Provide positional flagResult(value, range)
 *
 * REQUIRED EXPORTS
 * getAgeInYears
 * normalizeSex
 * normalizePregnancyStatus
 * normalizeTrimester
 * normalizeCyclePhase
 * resolveReferenceRange
 * flagResult
 *
 * IMPORTANT
 * This file does NOT invent an AMH numerical reference interval.
 * AMH will use a real database/master-test range when supplied,
 * otherwise the engine reports the range as unresolved while
 * still resolving the unit as ng/mL.
 * ==========================================================
 */

/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const text = (value) => String(value ?? "").trim();

const normalizeText = (value) =>
  text(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

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

const finiteNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    text(value) === ""
  ) {
    return null;
  }

  const number = Number(
    typeof value === "string"
      ? value.replace(/,/g, "").trim()
      : value
  );

  return Number.isFinite(number) ? number : null;
};

/* ==========================================================
   AGE
   ========================================================== */

export function getAgeInYears(input = {}) {
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : null;
  }

  if (typeof input === "string") {
    const direct = finiteNumber(input);
    return direct !== null ? direct : null;
  }

  const directAge = firstValue(
    input.age,
    input.age_years,
    input.ageYears
  );

  const numericAge = finiteNumber(directAge);

  if (numericAge !== null) {
    return numericAge;
  }

  const dob = firstValue(
    input.dob,
    input.date_of_birth,
    input.dateOfBirth,
    input.birth_date,
    input.birthDate
  );

  if (!dob) {
    return null;
  }

  const birth = new Date(dob);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const now = new Date();

  let age =
    now.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    now.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      now.getDate() < birth.getDate()
    )
  ) {
    age -= 1;
  }

  return age >= 0 && age <= 150
    ? age
    : null;
}

/* ==========================================================
   SEX
   ========================================================== */

export function normalizeSex(value) {
  const normalized = normalizeText(value);

  if (
    normalized === "f" ||
    normalized === "female" ||
    normalized === "woman" ||
    normalized === "girl"
  ) {
    return "female";
  }

  if (
    normalized === "m" ||
    normalized === "male" ||
    normalized === "man" ||
    normalized === "boy"
  ) {
    return "male";
  }

  if (
    normalized === "other" ||
    normalized === "intersex"
  ) {
    return "other";
  }

  return "";
}

/* ==========================================================
   PREGNANCY
   ========================================================== */

export function normalizePregnancyStatus(value) {
  const normalized = normalizeText(value);

  if (
    normalized === "" ||
    normalized === "unknown" ||
    normalized === "not specified"
  ) {
    return "";
  }

  if (
    normalized === "pregnant" ||
    normalized === "yes" ||
    normalized === "positive" ||
    normalized === "confirmed"
  ) {
    return "pregnant";
  }

  if (
    normalized === "not pregnant" ||
    normalized === "non pregnant" ||
    normalized === "no" ||
    normalized === "negative"
  ) {
    return "not_pregnant";
  }

  return normalized.replace(/\s+/g, "_");
}

/* ==========================================================
   TRIMESTER
   ========================================================== */

export function normalizeTrimester(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  if (
    normalized === "1" ||
    normalized === "first" ||
    normalized === "first trimester" ||
    normalized === "trimester 1" ||
    normalized === "t1"
  ) {
    return "first";
  }

  if (
    normalized === "2" ||
    normalized === "second" ||
    normalized === "second trimester" ||
    normalized === "trimester 2" ||
    normalized === "t2"
  ) {
    return "second";
  }

  if (
    normalized === "3" ||
    normalized === "third" ||
    normalized === "third trimester" ||
    normalized === "trimester 3" ||
    normalized === "t3"
  ) {
    return "third";
  }

  return normalized.replace(/\s+/g, "_");
}

/* ==========================================================
   CYCLE PHASE
   ========================================================== */

export function normalizeCyclePhase(value) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  if (
    /day\s*3/.test(normalized) ||
    normalized === "day_3"
  ) {
    return "day_3";
  }

  if (
    /day\s*21/.test(normalized) ||
    normalized === "day_21"
  ) {
    return "day_21";
  }

  if (
    normalized.includes("follicular")
  ) {
    return "follicular";
  }

  if (
    normalized.includes("mid cycle") ||
    normalized.includes("midcycle") ||
    normalized.includes("ovulatory") ||
    normalized.includes("ovulation")
  ) {
    return "ovulatory";
  }

  if (
    normalized.includes("luteal")
  ) {
    return "luteal";
  }

  if (
    normalized.includes("menopausal") ||
    normalized.includes("post menopausal") ||
    normalized.includes("postmenopausal")
  ) {
    return "postmenopausal";
  }

  if (
    normalized.includes("premenopausal") ||
    normalized.includes("pre menopausal")
  ) {
    return "premenopausal";
  }

  return normalized.replace(/\s+/g, "_");
}

/* ==========================================================
   PARAMETER IDENTITY
   ========================================================== */

const parameterName = (parameter = {}) =>
  firstValue(
    parameter.name,
    parameter.test_name,
    parameter.testName,
    parameter.parameter_name,
    parameter.parameterName,
    parameter.label,
    parameter.analyte_name,
    parameter.analyteName,
    parameter.key,
    parameter.id,
    ""
  );

const parameterKey = (parameter = {}) => {
  const raw = firstValue(
    parameter.key,
    parameter.parameter_key,
    parameter.parameterKey,
    parameter.test_code,
    parameter.testCode,
    parameter.analyte_key,
    parameter.analyteKey,
    parameter.id,
    parameter.test_id,
    parameter.test_name,
    parameter.testName,
    parameter.parameter_name,
    parameter.parameterName,
    parameter.name,
    parameter.label
  );

  return text(raw)
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
};

const canonicalAnalyteKey = (parameter = {}) => {
  const raw = normalizeText(parameterName(parameter));

  if (!raw) {
    return parameterKey(parameter);
  }

  if (
    raw === "fsh" ||
    raw.includes("follicle stimulating hormone")
  ) {
    return "fsh";
  }

  if (
    raw === "lh" ||
    raw.includes("luteinizing hormone")
  ) {
    return "lh";
  }

  if (
    raw === "amh" ||
    raw.includes("anti mullerian") ||
    raw.includes("anti müllerian") ||
    raw.includes("anti-mullerian")
  ) {
    return "amh";
  }

  if (
    raw === "estradiol" ||
    raw === "estradiol e2" ||
    raw.includes("estradiol")
  ) {
    return "estradiol";
  }

  if (
    raw === "progesterone"
  ) {
    return "progesterone";
  }

  if (
    raw === "prolactin"
  ) {
    return "prolactin";
  }

  if (
    raw === "testosterone" ||
    raw.includes("total testosterone")
  ) {
    return "testosterone";
  }

  if (
    raw === "shbg" ||
    raw.includes("sex hormone binding")
  ) {
    return "shbg";
  }

  if (
    raw === "dhea s" ||
    raw === "dhea-s" ||
    raw.includes("dhea")
  ) {
    return "dhea_s";
  }

  if (
    raw === "tsh" ||
    raw.includes("thyroid stimulating hormone")
  ) {
    return "tsh";
  }

  if (
    raw === "free t4" ||
    raw === "ft4" ||
    raw.includes("free thyroxine")
  ) {
    return "free_t4";
  }

  if (
    raw === "free t3" ||
    raw === "ft3" ||
    raw.includes("free triiodothyronine")
  ) {
    return "free_t3";
  }

  if (
    raw === "total t4" ||
    raw === "tt4" ||
    raw.includes("total thyroxine")
  ) {
    return "total_t4";
  }

  if (
    raw === "total t3" ||
    raw === "tt3" ||
    raw.includes("total triiodothyronine")
  ) {
    return "total_t3";
  }

  return parameterKey(parameter);
};

/* ==========================================================
   UNIT FALLBACKS
   ========================================================== */

const UNIT_FALLBACKS = Object.freeze({
  fsh: "mIU/mL",
  lh: "mIU/mL",
  prolactin: "ng/mL",
  estradiol: "pg/mL",
  progesterone: "ng/mL",
  testosterone: "ng/dL",
  shbg: "nmol/L",
  amh: "ng/mL",
  dhea_s: "µg/dL",
  tsh: "mIU/L",
  free_t3: "pmol/L",
  free_t4: "pmol/L",
  total_t3: "pmol/L",
  total_t4: "pmol/L",
});

const getUnit = (parameter = {}) =>
  firstValue(
    parameter.unit,
    parameter.units,
    parameter.result_unit,
    parameter.resultUnit,
    parameter.reporting_unit,
    parameter.reportingUnit,
    parameter.display_unit,
    parameter.displayUnit,
    UNIT_FALLBACKS[canonicalAnalyteKey(parameter)],
    ""
  );

/* ==========================================================
   RANGE NORMALIZATION
   ========================================================== */

const rangeText = (low, high, unit = "") => {
  const hasLow = finiteNumber(low) !== null;
  const hasHigh = finiteNumber(high) !== null;

  if (!hasLow && !hasHigh) {
    return "";
  }

  const lowText = hasLow
    ? String(finiteNumber(low))
    : "";

  const highText = hasHigh
    ? String(finiteNumber(high))
    : "";

  let body = "";

  if (hasLow && hasHigh) {
    body = lowText + " – " + highText;
  } else if (hasLow) {
    body = "≥ " + lowText;
  } else {
    body = "≤ " + highText;
  }

  return unit
    ? body + " " + unit
    : body;
};

const normalizeRangeObject = (
  candidate,
  parameter = {}
) => {
  if (!candidate) {
    return null;
  }

  if (typeof candidate === "string") {
    const raw = candidate.trim();

    if (!raw) {
      return null;
    }

    const match = raw.match(
      /(-?\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(-?\d+(?:\.\d+)?)/i
    );

    if (match) {
      const low = finiteNumber(match[1]);
      const high = finiteNumber(match[2]);
      const unit = getUnit(parameter);

      return {
        low,
        high,
        unit,
        text: rangeText(low, high, unit),
        source: "",
      };
    }

    return {
      low: null,
      high: null,
      unit: getUnit(parameter),
      text: raw,
      source: "",
    };
  }

  if (!isObject(candidate)) {
    return null;
  }

  if (
    candidate.reference_range &&
    candidate.reference_range !== candidate
  ) {
    const nested = normalizeRangeObject(
      candidate.reference_range,
      parameter
    );

    if (nested) {
      return {
        ...nested,
        source: firstValue(
          candidate.source,
          candidate.reference_source,
          nested.source,
          ""
        ),
      };
    }
  }

  if (
    candidate.referenceRange &&
    candidate.referenceRange !== candidate
  ) {
    const nested = normalizeRangeObject(
      candidate.referenceRange,
      parameter
    );

    if (nested) {
      return {
        ...nested,
        source: firstValue(
          candidate.source,
          candidate.reference_source,
          nested.source,
          ""
        ),
      };
    }
  }

  if (
    candidate.range &&
    typeof candidate.range === "object" &&
    candidate.range !== candidate
  ) {
    const nested = normalizeRangeObject(
      candidate.range,
      parameter
    );

    if (nested) {
      return {
        ...nested,
        source: firstValue(
          candidate.source,
          candidate.reference_source,
          nested.source,
          ""
        ),
      };
    }
  }

  const low = finiteNumber(
    firstValue(
      candidate.low,
      candidate.min,
      candidate.minimum,
      candidate.lower,
      candidate.lower_limit,
      candidate.lowerLimit,
      candidate.reference_low,
      candidate.referenceLow,
      candidate.ref_low,
      candidate.refLow
    )
  );

  const high = finiteNumber(
    firstValue(
      candidate.high,
      candidate.max,
      candidate.maximum,
      candidate.upper,
      candidate.upper_limit,
      candidate.upperLimit,
      candidate.reference_high,
      candidate.referenceHigh,
      candidate.ref_high,
      candidate.refHigh
    )
  );

  const unit = firstValue(
    candidate.unit,
    candidate.units,
    candidate.result_unit,
    candidate.resultUnit,
    candidate.reporting_unit,
    candidate.reportingUnit,
    getUnit(parameter),
    ""
  );

  const suppliedText = firstValue(
    candidate.text,
    candidate.display,
    candidate.display_range,
    candidate.displayRange,
    candidate.range_text,
    candidate.rangeText,
    ""
  );

  if (
    low === null &&
    high === null &&
    !suppliedText
  ) {
    return null;
  }

  return {
    low,
    high,
    unit,
    text:
      suppliedText ||
      rangeText(low, high, unit),
    source: firstValue(
      candidate.source,
      candidate.reference_source,
      candidate.referenceSource,
      ""
    ),
    sex: firstValue(
      candidate.sex,
      candidate.gender,
      ""
    ),
    cyclePhase: firstValue(
      candidate.cycle_phase,
      candidate.cyclePhase,
      candidate.phase,
      ""
    ),
    pregnancyStatus: firstValue(
      candidate.pregnancy_status,
      candidate.pregnancyStatus,
      ""
    ),
    trimester: firstValue(
      candidate.trimester,
      ""
    ),
    minAge: finiteNumber(
      firstValue(
        candidate.min_age,
        candidate.minAge,
        candidate.age_min,
        candidate.ageMin,
        candidate.age_from,
        candidate.ageFrom
      )
    ),
    maxAge: finiteNumber(
      firstValue(
        candidate.max_age,
        candidate.maxAge,
        candidate.age_max,
        candidate.ageMax,
        candidate.age_to,
        candidate.ageTo
      )
    ),
  };
};

/* ==========================================================
   CONTEXT MATCHING
   ========================================================== */

const normalizeRangeSex = (value) => {
  const sex = normalizeSex(value);

  if (sex) {
    return sex;
  }

  const normalized = normalizeText(value);

  if (
    normalized === "both" ||
    normalized === "all" ||
    normalized === "any" ||
    normalized === "unisex"
  ) {
    return "all";
  }

  return normalized;
};

const matchesRangeContext = (
  range,
  context = {}
) => {
  if (!range) {
    return false;
  }

  const sex = normalizeSex(context.sex);
  const rangeSex = normalizeRangeSex(
    firstValue(range.sex, range.gender, "")
  );

  if (
    rangeSex &&
    rangeSex !== "all" &&
    sex &&
    rangeSex !== sex
  ) {
    return false;
  }

  const age = getAgeInYears(context);

  const minAge = finiteNumber(range.minAge);
  const maxAge = finiteNumber(range.maxAge);

  if (
    age !== null &&
    minAge !== null &&
    age < minAge
  ) {
    return false;
  }

  if (
    age !== null &&
    maxAge !== null &&
    age > maxAge
  ) {
    return false;
  }

  const cyclePhase = normalizeCyclePhase(
    context.cyclePhase ||
    context.cycle_phase
  );

  const rangeCycle = normalizeCyclePhase(
    firstValue(
      range.cyclePhase,
      range.cycle_phase,
      range.phase,
      ""
    )
  );

  if (
    rangeCycle &&
    cyclePhase &&
    rangeCycle !== cyclePhase
  ) {
    return false;
  }

  const pregnancyStatus =
    normalizePregnancyStatus(
      context.pregnancyStatus ||
      context.pregnancy_status
    );

  const rangePregnancy =
    normalizePregnancyStatus(
      firstValue(
        range.pregnancyStatus,
        range.pregnancy_status,
        ""
      )
    );

  if (
    rangePregnancy &&
    pregnancyStatus &&
    rangePregnancy !== pregnancyStatus
  ) {
    return false;
  }

  const trimester = normalizeTrimester(
    context.trimester
  );

  const rangeTrimester = normalizeTrimester(
    range.trimester
  );

  if (
    rangeTrimester &&
    trimester &&
    rangeTrimester !== trimester
  ) {
    return false;
  }

  return true;
};

/* ==========================================================
   EXTRACT DATABASE / MASTER-TEST RANGES
   ========================================================== */

const RANGE_ARRAY_KEYS = [
  "referenceRanges",
  "reference_ranges",
  "referenceRange",
  "reference_range",
  "ranges",
  "normalRanges",
  "normal_ranges",
  "ageRanges",
  "age_ranges",
];

const collectRangeCandidates = (
  parameter = {}
) => {
  const candidates = [];

  const add = (value) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }

    if (typeof value === "string") {
      candidates.push(value);
      return;
    }

    if (isObject(value)) {
      candidates.push(value);
    }
  };

  RANGE_ARRAY_KEYS.forEach((key) => {
    add(parameter[key]);
  });

  const nestedCandidates = [
    parameter.master_tests,
    parameter.master_test,
    parameter.masterTest,
    parameter.test,
  ];

  nestedCandidates.forEach((nested) => {
    if (!isObject(nested)) {
      return;
    }

    RANGE_ARRAY_KEYS.forEach((key) => {
      add(nested[key]);
    });
  });

  return candidates;
};

/* ==========================================================
   RANGE SCORING
   ========================================================== */

const scoreRange = (
  range,
  context = {}
) => {
  if (!matchesRangeContext(range, context)) {
    return -Infinity;
  }

  let score = 0;

  const sex = normalizeSex(context.sex);
  const rangeSex = normalizeRangeSex(
    firstValue(range.sex, range.gender, "")
  );

  if (rangeSex) {
    if (sex && rangeSex === sex) {
      score += 40;
    } else if (rangeSex === "all") {
      score += 5;
    }
  }

  const age = getAgeInYears(context);

  if (
    age !== null &&
    (
      finiteNumber(range.minAge) !== null ||
      finiteNumber(range.maxAge) !== null
    )
  ) {
    score += 30;
  }

  const cycle = normalizeCyclePhase(
    context.cyclePhase ||
    context.cycle_phase
  );

  const rangeCycle = normalizeCyclePhase(
    firstValue(
      range.cyclePhase,
      range.cycle_phase,
      range.phase,
      ""
    )
  );

  if (rangeCycle) {
    if (cycle && rangeCycle === cycle) {
      score += 60;
    }
  }

  const pregnancy =
    normalizePregnancyStatus(
      context.pregnancyStatus ||
      context.pregnancy_status
    );

  const rangePregnancy =
    normalizePregnancyStatus(
      firstValue(
        range.pregnancyStatus,
        range.pregnancy_status,
        ""
      )
    );

  if (rangePregnancy) {
    if (
      pregnancy &&
      rangePregnancy === pregnancy
    ) {
      score += 50;
    }
  }

  const trimester =
    normalizeTrimester(context.trimester);

  const rangeTrimester =
    normalizeTrimester(range.trimester);

  if (rangeTrimester) {
    if (
      trimester &&
      rangeTrimester === trimester
    ) {
      score += 50;
    }
  }

  return score;
};

const chooseBestRange = (
  candidates,
  context
) => {
  const normalized = candidates
    .map((candidate) =>
      normalizeRangeObject(
        candidate,
        {}
      )
    )
    .filter(Boolean);

  if (!normalized.length) {
    return null;
  }

  const ranked = normalized
    .map((range) => ({
      range,
      score: scoreRange(range, context),
    }))
    .filter(
      (item) =>
        item.score !== -Infinity
    )
    .sort(
      (a, b) =>
        b.score - a.score
    );

  return ranked.length
    ? ranked[0].range
    : null;
};

/* ==========================================================
   THYROID STANDARD
   ==========================================================
   These are only used for thyroid analytes when no explicit
   parameter/master-test range is available.

   The units match the PEFA thyroid standard used by the
   current endocrine range architecture.
   ========================================================== */

const THYROID_STANDARD_RANGES = Object.freeze({
  tsh: {
    low: 0.3,
    high: 4.2,
    unit: "mIU/L",
  },
  free_t3: {
    low: 3.1,
    high: 6.8,
    unit: "pmol/L",
  },
  free_t4: {
    low: 12,
    high: 22,
    unit: "pmol/L",
  },
  total_t3: {
    low: 3.1,
    high: 6.8,
    unit: "pmol/L",
  },
  total_t4: {
    low: 12,
    high: 22,
    unit: "pmol/L",
  },
  t3: {
    low: 3.1,
    high: 6.8,
    unit: "pmol/L",
  },
  t4: {
    low: 12,
    high: 22,
    unit: "pmol/L",
  },
});

/* ==========================================================
   MANUAL RANGE
   ========================================================== */

const resolveManualRange = (
  manualRange,
  parameter
) => {
  if (
    manualRange === null ||
    manualRange === undefined ||
    text(manualRange) === ""
  ) {
    return null;
  }

  const normalized =
    normalizeRangeObject(
      manualRange,
      parameter
    );

  if (!normalized) {
    return null;
  }

  return {
    ...normalized,
    unit: firstValue(
      normalized.unit,
      getUnit(parameter),
      ""
    ),
    text:
      normalized.text ||
      rangeText(
        normalized.low,
        normalized.high,
        firstValue(
          normalized.unit,
          getUnit(parameter),
          ""
        )
      ),
    source: "manual",
  };
};

/* ==========================================================
   RESOLVE REFERENCE RANGE
 * ========================================================== */

export function resolveReferenceRange({
  parameter = {},
  context = {},
  manualRange = "",
  profileKey = "",
} = {}) {
  const analyteKey =
    canonicalAnalyteKey(parameter);

  const unit =
    getUnit(parameter);

  /* --------------------------------------------------------
     1. MANUAL OVERRIDE
     -------------------------------------------------------- */

  const manual =
    resolveManualRange(
      manualRange,
      parameter
    );

  if (manual) {
    return {
      ...manual,
      referenceRange: manual.text,
      reference_range: manual.text,
      source: "manual",
      unit: firstValue(
        manual.unit,
        unit,
        ""
      ),
      low: manual.low,
      high: manual.high,
    };
  }

  /* --------------------------------------------------------
     2. DATABASE / MASTER-TEST RANGE
     -------------------------------------------------------- */

  const databaseCandidates =
    collectRangeCandidates(
      parameter
    );

  if (databaseCandidates.length) {
    const normalizedCandidates =
      databaseCandidates
        .map((candidate) =>
          normalizeRangeObject(
            candidate,
            parameter
          )
        )
        .filter(Boolean);

    const ranked =
      normalizedCandidates
        .map((candidate) => ({
          range: candidate,
          score: scoreRange(
            candidate,
            context
          ),
        }))
        .filter(
          (item) =>
            item.score !== -Infinity
        )
        .sort(
          (a, b) =>
            b.score - a.score
        );

    if (ranked.length) {
      const selected =
        ranked[0].range;

      const selectedUnit =
        firstValue(
          selected.unit,
          unit,
          ""
        );

      const selectedText =
        selected.text ||
        rangeText(
          selected.low,
          selected.high,
          selectedUnit
        );

      return {
        ...selected,
        text: selectedText,
        range: selectedText,
        referenceRange: selectedText,
        reference_range: selectedText,
        source:
          firstValue(
            selected.source,
            "database"
          ),
        unit: selectedUnit,
        low: selected.low,
        high: selected.high,
      };
    }
  }

  /* --------------------------------------------------------
     3. THYROID STANDARD
     -------------------------------------------------------- */

  const thyroidStandard =
    THYROID_STANDARD_RANGES[
      analyteKey
    ];

  const profileText =
    normalizeText(profileKey);

  const parameterText =
    normalizeText(
      parameterName(parameter)
    );

  const looksThyroid =
    Boolean(thyroidStandard) ||
    profileText.includes("thyroid") ||
    profileText.includes("tft") ||
    parameterText === "tsh" ||
    parameterText === "free t4" ||
    parameterText === "free t3" ||
    parameterText === "total t3" ||
    parameterText === "total t4";

  if (
    looksThyroid &&
    thyroidStandard
  ) {
    const standardUnit =
      thyroidStandard.unit;

    const standardText =
      rangeText(
        thyroidStandard.low,
        thyroidStandard.high,
        standardUnit
      );

    return {
      low: thyroidStandard.low,
      high: thyroidStandard.high,
      unit: standardUnit,
      text: standardText,
      range: standardText,
      referenceRange: standardText,
      reference_range: standardText,
      source: "PEFA thyroid standard",
    };
  }

  /* --------------------------------------------------------
     4. REGISTRY FALLBACK
     --------------------------------------------------------
     Registry analytes may carry referenceRanges. This is
     deliberately read without importing the registry so this
     engine remains standalone and avoids circular dependencies.
     -------------------------------------------------------- */

  const registryCandidates = [];

  if (Array.isArray(parameter.referenceRanges)) {
    registryCandidates.push(
      ...parameter.referenceRanges
    );
  }

  if (Array.isArray(parameter.reference_ranges)) {
    registryCandidates.push(
      ...parameter.reference_ranges
    );
  }

  const registryRanked =
    registryCandidates
      .map((candidate) =>
        normalizeRangeObject(
          candidate,
          parameter
        )
      )
      .filter(Boolean)
      .map((candidate) => ({
        range: candidate,
        score: scoreRange(
          candidate,
          context
        ),
      }))
      .filter(
        (item) =>
          item.score !== -Infinity
      )
      .sort(
        (a, b) =>
          b.score - a.score
      );

  if (registryRanked.length) {
    const selected =
      registryRanked[0].range;

    const selectedUnit =
      firstValue(
        selected.unit,
        unit,
        ""
      );

    const selectedText =
      selected.text ||
      rangeText(
        selected.low,
        selected.high,
        selectedUnit
      );

    return {
      ...selected,
      text: selectedText,
      range: selectedText,
      referenceRange: selectedText,
      reference_range: selectedText,
      source:
        firstValue(
          selected.source,
          "registry"
        ),
      unit: selectedUnit,
    };
  }

  /* --------------------------------------------------------
     5. UNIT-ONLY FALLBACK
     --------------------------------------------------------
     This is especially important for AMH:
     - unit is known: ng/mL
     - numerical reference range is NOT invented
     - source remains unresolved rather than falsely claiming
       a reference interval.
     -------------------------------------------------------- */

  return {
    low: null,
    high: null,
    unit,
    text: "",
    range: "",
    referenceRange: "",
    reference_range: "",
    source: "unresolved",
  };
}

/* ==========================================================
   FLAG RESULT
   ==========================================================
   REQUIRED CALL SIGNATURE:

     flagResult(value, range)

   It accepts the range object returned by
   resolveReferenceRange().
   ========================================================== */

export function flagResult(value, range) {
  if (
    value === null ||
    value === undefined ||
    text(value) === ""
  ) {
    return "";
  }

  const numericValue =
    finiteNumber(value);

  if (numericValue === null) {
    return "";
  }

  if (
    !range ||
    typeof range !== "object"
  ) {
    return "";
  }

  const low =
    finiteNumber(
      firstValue(
        range.low,
        range.min,
        range.minimum,
        range.lower,
        range.reference_low,
        range.referenceLow
      )
    );

  const high =
    finiteNumber(
      firstValue(
        range.high,
        range.max,
        range.maximum,
        range.upper,
        range.reference_high,
        range.referenceHigh
      )
    );

  if (
    low === null &&
    high === null
  ) {
    return "";
  }

  if (
    low !== null &&
    numericValue < low
  ) {
    return "LOW";
  }

  if (
    high !== null &&
    numericValue > high
  ) {
    return "HIGH";
  }

  return "NORMAL";
}

/* ==========================================================
   OPTIONAL DEFAULT EXPORT
   ==========================================================
   Named exports above are what the application imports.
   This default object is provided only for compatibility with
   any older code that may import the engine as a default.
   ========================================================== */

export default {
  getAgeInYears,
  normalizeSex,
  normalizePregnancyStatus,
  normalizeTrimester,
  normalizeCyclePhase,
  resolveReferenceRange,
  flagResult,
};
