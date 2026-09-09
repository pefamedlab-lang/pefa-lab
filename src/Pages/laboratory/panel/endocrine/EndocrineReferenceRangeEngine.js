/* ==========================================================
 * PEFA LAB — ENDOCRINE REFERENCE RANGE ENGINE
 * ----------------------------------------------------------
 * AUTHORITATIVE ENDOCRINE REFERENCE / FLAG ENGINE
 *
 * Supports:
 *   • Sex
 *   • Age
 *   • Pregnancy status
 *   • Trimester
 *   • Menstrual cycle phase
 *   • Database-style reference metadata
 *   • referenceRanges metadata
 *   • Manual reference-range override
 *   • Safe numeric result flagging
 *
 * NO SUPABASE ACCESS
 *
 * Compatible metadata:
 *
 *   male_range
 *   female_range
 *   child_range
 *   elderly_range
 *   reference_value
 *   reference_range
 *   normal_range
 *   referenceRange
 *   referenceRanges
 *
 * Existing result payload structure is preserved.
 * ========================================================== */

/* ==========================================================
 * BASIC HELPERS
 * ========================================================== */

const norm = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const clean = (value) =>
  String(value ?? "").trim();

const hasValue = (value) =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== "";

/* ==========================================================
 * SEX
 * ========================================================== */

export const normalizeSex = (sex) => {
  const s = norm(sex);

  if (
    s === "male" ||
    s === "m" ||
    s.startsWith("male")
  ) {
    return "male";
  }

  if (
    s === "female" ||
    s === "f" ||
    s.startsWith("female")
  ) {
    return "female";
  }

  return "unknown";
};

/* ==========================================================
 * AGE
 * ========================================================== */

export const getAgeInYears = ({
  age,
  dob,
  referenceDate = new Date(),
} = {}) => {
  const direct = Number(age);

  if (
    Number.isFinite(direct) &&
    direct >= 0
  ) {
    return direct;
  }

  if (!dob) {
    return null;
  }

  const birth = new Date(dob);
  const ref = new Date(referenceDate);

  if (
    Number.isNaN(birth.getTime()) ||
    Number.isNaN(ref.getTime())
  ) {
    return null;
  }

  let years =
    ref.getFullYear() -
    birth.getFullYear();

  const beforeBirthday =
    ref.getMonth() <
      birth.getMonth() ||
    (
      ref.getMonth() ===
        birth.getMonth() &&
      ref.getDate() <
        birth.getDate()
    );

  if (beforeBirthday) {
    years -= 1;
  }

  return years >= 0
    ? years
    : null;
};

/* ==========================================================
 * AGE GROUP
 * ========================================================== */

export const getAgeGroup = (age) => {
  const n = Number(age);

  if (!Number.isFinite(n)) {
    return "unknown";
  }

  if (n < 1) {
    return "infant";
  }

  if (n < 18) {
    return "child";
  }

  if (n >= 65) {
    return "elderly";
  }

  return "adult";
};

/* ==========================================================
 * PREGNANCY
 * ========================================================== */

export const normalizePregnancyStatus = (
  value
) => {
  const s = norm(value);

  if (!s) {
    return "not_pregnant";
  }

  if (
    [
      "yes",
      "pregnant",
      "true",
      "1",
    ].includes(s)
  ) {
    return "pregnant";
  }

  if (
    [
      "no",
      "not pregnant",
      "not_pregnant",
      "false",
      "0",
    ].includes(s)
  ) {
    return "not_pregnant";
  }

  return s.replace(/\s+/g, "_");
};

/* ==========================================================
 * TRIMESTER
 * ========================================================== */

export const normalizeTrimester = (
  value
) => {
  const s = norm(value)
    .replace(/\s+/g, "_");

  if (!s) {
    return "";
  }

  if (
    [
      "1",
      "first",
      "first_trimester",
      "1st",
      "1st_trimester",
    ].includes(s)
  ) {
    return "first";
  }

  if (
    [
      "2",
      "second",
      "second_trimester",
      "2nd",
      "2nd_trimester",
    ].includes(s)
  ) {
    return "second";
  }

  if (
    [
      "3",
      "third",
      "third_trimester",
      "3rd",
      "3rd_trimester",
    ].includes(s)
  ) {
    return "third";
  }

  return s;
};

/* ==========================================================
 * CYCLE PHASE
 * ========================================================== */

export const normalizeCyclePhase = (
  value
) => {
  const s = norm(value);

  if (!s) {
    return "unspecified";
  }

  if (
    s.includes("day 3") ||
    s === "day_3"
  ) {
    return "day_3";
  }

  if (
    s.includes("day 21") ||
    s === "day_21"
  ) {
    return "day_21";
  }

  if (s.includes("follic")) {
    return "follicular";
  }

  if (s.includes("ovulat")) {
    return "ovulatory";
  }

  if (s.includes("lute")) {
    return "luteal";
  }

  return s.replace(/\s+/g, "_");
};

/* ==========================================================
 * CONTEXT NORMALIZATION
 * ========================================================== */

export const normalizeContext = (
  context = {}
) => ({
  sex: normalizeSex(
    context.sex ??
      context.gender ??
      ""
  ),

  age:
    Number.isFinite(
      Number(context.age)
    )
      ? Number(context.age)
      : null,

  pregnancyStatus:
    normalizePregnancyStatus(
      context.pregnancyStatus ??
        context.pregnancy_status ??
        ""
    ),

  trimester:
    normalizeTrimester(
      context.trimester ?? ""
    ),

  cyclePhase:
    normalizeCyclePhase(
      context.cyclePhase ??
        context.cycle_phase ??
        ""
    ),
});

/* ==========================================================
 * RANGE PARSER
 * ========================================================== */

export const parseReferenceRange = (
  value
) => {
  const raw = clean(value);

  if (!raw) {
    return {
      min: null,
      max: null,
    };
  }

  /*
   * Handles:
   *
   * 1 - 5
   * 1–5
   * 1—5
   * 1 to 5
   * 1.5 - 4.8
   */

  const match = raw.match(
    /(-?\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(-?\d+(?:\.\d+)?)/i
  );

  if (!match) {
    /*
     * Also support:
     *
     * > 90
     * < 5
     * ≥ 90
     * ≤ 5
     */

    const greater =
      raw.match(
        /(?:>|≥)\s*(-?\d+(?:\.\d+)?)/i
      );

    if (greater) {
      return {
        min: Number(greater[1]),
        max: null,
      };
    }

    const less =
      raw.match(
        /(?:<|≤)\s*(-?\d+(?:\.\d+)?)/i
      );

    if (less) {
      return {
        min: null,
        max: Number(less[1]),
      };
    }

    return {
      min: null,
      max: null,
    };
  }

  const first = Number(match[1]);
  const second = Number(match[2]);

  if (
    !Number.isFinite(first) ||
    !Number.isFinite(second)
  ) {
    return {
      min: null,
      max: null,
    };
  }

  return {
    min: Math.min(first, second),
    max: Math.max(first, second),
  };
};

/* ==========================================================
 * PROFILE MATCHING
 * ========================================================== */

const matches = (
  profile = {},
  context = {}
) => {
  const ctx =
    normalizeContext(context);

  const profileSex =
    normalizeSex(
      profile.sex
    );

  const profilePregnancy =
    normalizePregnancyStatus(
      profile.pregnancy ??
        profile.pregnancyStatus ??
        ""
    );

  const profileTrimester =
    normalizeTrimester(
      profile.trimester
    );

  const profileCycle =
    normalizeCyclePhase(
      profile.cycle ??
        profile.cyclePhase
    );

  const profileAge =
    norm(
      profile.ageGroup ??
        profile.age_group ??
        ""
    );

  if (
    profile.sex &&
    profile.sex !== "any" &&
    profileSex !== ctx.sex
  ) {
    return false;
  }

  if (
    profile.pregnancy &&
    profilePregnancy !== "any" &&
    profilePregnancy !==
      ctx.pregnancyStatus
  ) {
    return false;
  }

  if (
    profile.trimester &&
    profileTrimester !== "any" &&
    profileTrimester !==
      ctx.trimester
  ) {
    return false;
  }

  if (
    profile.cycle ||
    profile.cyclePhase
  ) {
    if (
      profileCycle !== "any" &&
      profileCycle !==
        ctx.cyclePhase
    ) {
      return false;
    }
  }

  if (
    profileAge &&
    profileAge !== "any"
  ) {
    const actual =
      getAgeGroup(ctx.age);

    if (
      profileAge !== actual
    ) {
      return false;
    }
  }

  return true;
};

/* ==========================================================
 * PROFILE PRIORITY
 * ========================================================== */

const score = (
  profile = {}
) => {
  let points = 0;

  if (
    profile.sex &&
    norm(profile.sex) !== "any"
  ) {
    points += 8;
  }

  if (
    profile.pregnancy ||
    profile.pregnancyStatus
  ) {
    points += 16;
  }

  if (profile.trimester) {
    points += 20;
  }

  if (
    profile.cycle ||
    profile.cyclePhase
  ) {
    points += 20;
  }

  if (
    profile.ageGroup ||
    profile.age_group
  ) {
    points += 4;
  }

  return points;
};

/* ==========================================================
 * RANGE OBJECT → TEXT
 * ========================================================== */

const rangeObjectToText = (
  range
) => {
  if (!range) {
    return "";
  }

  if (
    hasValue(range.text)
  ) {
    return clean(
      range.text
    );
  }

  if (
    hasValue(range.range)
  ) {
    return clean(
      range.range
    );
  }

  if (
    range.min != null &&
    range.max != null
  ) {
    return `${range.min} – ${range.max}`;
  }

  if (
    range.low != null &&
    range.high != null
  ) {
    return `${range.low} – ${range.high}`;
  }

  return "";
};

/* ==========================================================
 * DATABASE METADATA RANGE
 * ========================================================== */

const getDatabaseRange = (
  parameter = {},
  context = {}
) => {
  const ctx =
    normalizeContext(context);

  /*
   * Pregnancy + trimester has the highest priority.
   *
   * We support both camelCase and snake_case
   * naming conventions.
   */

  if (
    ctx.pregnancyStatus ===
      "pregnant" &&
    ctx.trimester
  ) {
    const trimesterKeys = {
      first: [
        "first_trimester_range",
        "firstTrimesterRange",
        "trimester_1_range",
        "trimester1_range",
        "pregnancy_first_range",
      ],

      second: [
        "second_trimester_range",
        "secondTrimesterRange",
        "trimester_2_range",
        "trimester2_range",
        "pregnancy_second_range",
      ],

      third: [
        "third_trimester_range",
        "thirdTrimesterRange",
        "trimester_3_range",
        "trimester3_range",
        "pregnancy_third_range",
      ],
    };

    const keys =
      trimesterKeys[
        ctx.trimester
      ] || [];

    for (const key of keys) {
      if (
        hasValue(
          parameter[key]
        )
      ) {
        return {
          value:
            parameter[key],
          source:
            "database_trimester",
        };
      }
    }
  }

  /*
   * Cycle-specific metadata.
   */

  if (
    ctx.sex === "female"
  ) {
    const cycleKeys = {
      day_3: [
        "day_3_range",
        "day3_range",
        "day_3",
      ],

      follicular: [
        "follicular_range",
        "follicular",
      ],

      ovulatory: [
        "ovulatory_range",
        "ovulatory",
      ],

      day_21: [
        "day_21_range",
        "day21_range",
        "day_21",
      ],

      luteal: [
        "luteal_range",
        "luteal",
      ],
    };

    const keys =
      cycleKeys[
        ctx.cyclePhase
      ] || [];

    for (const key of keys) {
      if (
        hasValue(
          parameter[key]
        )
      ) {
        return {
          value:
            parameter[key],
          source:
            "database_cycle",
        };
      }
    }
  }

  /*
   * Child reference.
   */

  if (
    Number.isFinite(ctx.age) &&
    ctx.age < 18
  ) {
    const child =
      parameter.child_range ??
      parameter.childRange ??
      parameter.pediatric_range ??
      parameter.pediatricRange;

    if (hasValue(child)) {
      return {
        value: child,
        source:
          "database_child",
      };
    }
  }

  /*
   * Elderly reference.
   */

  if (
    Number.isFinite(ctx.age) &&
    ctx.age >= 65
  ) {
    const elderly =
      parameter.elderly_range ??
      parameter.elderlyRange;

    if (hasValue(elderly)) {
      return {
        value: elderly,
        source:
          "database_elderly",
      };
    }
  }

  /*
   * Sex-specific references.
   */

  if (
    ctx.sex === "male"
  ) {
    const male =
      parameter.male_range ??
      parameter.maleRange;

    if (hasValue(male)) {
      return {
        value: male,
        source:
          "database_male",
      };
    }
  }

  if (
    ctx.sex === "female"
  ) {
    const female =
      parameter.female_range ??
      parameter.femaleRange;

    if (hasValue(female)) {
      return {
        value: female,
        source:
          "database_female",
      };
    }
  }

  /*
   * Generic database references.
   *
   * Priority:
   *
   * reference_value
   * reference_range
   * normal_range
   */

  const generic =
    parameter.reference_value ??
    parameter.referenceValue ??
    parameter.reference_range ??
    parameter.referenceRange ??
    parameter.normal_range ??
    parameter.normalRange;

  if (hasValue(generic)) {
    return {
      value: generic,
      source:
        "database_generic",
    };
  }

  return null;
};

/* ==========================================================
 * RESOLVE REFERENCE RANGE
 * ========================================================== */

export const resolveReferenceRange = ({
  parameter = {},
  context = {},
  manualRange = "",
} = {}) => {
  /*
   * Priority is intentional:
   *
   * 1. Manual override
   * 2. Database / master-test metadata
   *    - trimester
   *    - menstrual-cycle phase
   *    - child / paediatric
   *    - elderly
   *    - sex-specific
   *    - generic reference metadata
   * 3. Direct referenceRange object
   * 4. Registry referenceRanges fallback
   * 5. Unconfigured
   *
   * This prevents registry fallback values from overriding a
   * reference range explicitly supplied by the LIS metadata.
   */

  const manual = clean(manualRange);

  if (manual) {
    const parsed = parseReferenceRange(manual);

    return {
      text: manual,
      min: parsed.min,
      max: parsed.max,
      source: "manual",
      editable: true,
    };
  }

  const normalizedContext = normalizeContext(context);

  /* --------------------------------------------------------
     2. DATABASE / MASTER-TEST METADATA
     -------------------------------------------------------- */
  const databaseRange = getDatabaseRange(
    parameter,
    normalizedContext
  );

  if (databaseRange) {
    const rangeText = rangeObjectToText(
      databaseRange.value
    );

    if (rangeText) {
      const parsed = parseReferenceRange(rangeText);
      const objectValue = isPlainObject(databaseRange.value)
        ? databaseRange.value
        : {};

      return {
        text: rangeText,
        min:
          objectValue.min ??
          objectValue.low ??
          parsed.min,
        max:
          objectValue.max ??
          objectValue.high ??
          parsed.max,
        source: databaseRange.source,
        editable: true,
      };
    }
  }

  /* --------------------------------------------------------
     3. DIRECT referenceRange OBJECT
     -------------------------------------------------------- */
  if (isPlainObject(parameter.referenceRange)) {
    const rangeText = rangeObjectToText(
      parameter.referenceRange
    );

    if (rangeText) {
      const parsed = parseReferenceRange(rangeText);

      return {
        text: rangeText,
        min:
          parameter.referenceRange.min ??
          parameter.referenceRange.low ??
          parsed.min,
        max:
          parameter.referenceRange.max ??
          parameter.referenceRange.high ??
          parsed.max,
        source:
          parameter.referenceRange.source ||
          "database_referenceRange",
        editable: true,
      };
    }
  }

  /* --------------------------------------------------------
     4. REGISTRY referenceRanges FALLBACK
     -------------------------------------------------------- */
  const profiles = Array.isArray(parameter.referenceRanges)
    ? parameter.referenceRanges
    : [];

  if (profiles.length) {
    const candidates = profiles.filter(
      (profile) =>
        profile &&
        matches(profile, normalizedContext)
    );

    candidates.sort(
      (a, b) => score(b) - score(a)
    );

    if (candidates.length) {
      const selected = candidates[0];
      const selectedText = rangeObjectToText(selected);

      if (selectedText) {
        const parsed = parseReferenceRange(selectedText);

        return {
          text: selectedText,
          min:
            selected.min ??
            selected.low ??
            parsed.min,
          max:
            selected.max ??
            selected.high ??
            parsed.max,
          source: selected.source || "registry",
          editable: true,
        };
      }
    }
  }

  /* --------------------------------------------------------
     5. UNCONFIGURED
     -------------------------------------------------------- */
  return {
    text: "",
    min: null,
    max: null,
    source: "unconfigured",
    editable: true,
  };
};

/* ==========================================================
 * FLAG RESULT
 * ========================================================== */

export const flagResult = (
  value,
  range
) => {
  const raw =
    String(value ?? "")
      .replace(/,/g, "")
      .trim();

  if (!raw) {
    return "";
  }

  const n =
    Number(raw);

  if (!Number.isFinite(n)) {
    /*
     * Qualitative endocrine results should not
     * automatically become LOW/HIGH.
     */
    return "";
  }

  if (!range) {
    return "";
  }

  const min =
    range.min != null
      ? Number(range.min)
      : null;

  const max =
    range.max != null
      ? Number(range.max)
      : null;

  if (
    min !== null &&
    Number.isFinite(min) &&
    n < min
  ) {
    return "L";
  }

  if (
    max !== null &&
    Number.isFinite(max) &&
    n > max
  ) {
    return "H";
  }

  /*
   * If only a boundary exists:
   *
   * >90 → values below 90 are LOW
   * <5  → values above 5 are HIGH
   */

  if (
    min !== null &&
    max === null &&
    n < min
  ) {
    return "L";
  }

  if (
    max !== null &&
    min === null &&
    n > max
  ) {
    return "H";
  }

  return "N";
};

/* ==========================================================
 * HELPER
 * ========================================================== */

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

/* ==========================================================
 * DEFAULT EXPORT
 * ========================================================== */

export default resolveReferenceRange;