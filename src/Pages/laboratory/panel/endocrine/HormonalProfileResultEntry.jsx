/*
 * ==========================================================
 * PEFA LAB
 * UNIVERSAL HORMONAL PROFILE RESULT ENTRY
 * ==========================================================
 *
 * PATH:
 * src/pages/laboratory/panel/endocrine/
 * HormonalProfileResultEntry.jsx
 *
 * PURPOSE
 * ----------------------------------------------------------
 * One authoritative display path:
 *
 * ONE FORM / FIVE HORMONAL PROFILES -> Parameter -> Result -> Unit -> Reference Range -> Flag
 *
 * FEATURES
 * ----------------------------------------------------------
 * - Database supplied metadata is preserved.
 * - Sex / age / pregnancy / trimester / cycle-aware ranges.
 * - Manual reference-range override.
 * - Automatic flagging.
 * - Calculated parameters are read-only.
 * - Edit Mode / Update Result.
 * - Existing result loading.
 * - Existing database payload structure preserved.
 * - No persistence performed here.
 *
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
  getAgeInYears,
  normalizeSex,
  normalizePregnancyStatus,
  normalizeTrimester,
  normalizeCyclePhase,
  resolveReferenceRange,
  flagResult,
} from "./HormonalProfileReferenceRangeEngine";

import {
  interpretEndocrinePanel,
} from "./endocrineInterpretationService";

import {
  HORMONAL_PROFILE_DEFINITIONS,
  HORMONAL_PROFILE_KEYS,
  canonicalHormonalAnalyteKey,
  getHormonalProfileDefinition,
  inferHormonalProfileKey,
  isHormonalProfilePanel,
} from "./HormonalProfileRegistry";

/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const text = (value) =>
  String(value ?? "").trim();

const normalizeText = (value) =>
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

/* ==========================================================
   PARAMETER IDENTITY
   ========================================================== */

const keyOf = (parameter = {}) => {
  const raw = firstValue(
    parameter.key,
    parameter.parameter_key,
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
    .replace(/\s+/g, "_")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
};

const nameOf = (parameter = {}) =>
  firstValue(
    parameter.name,
    parameter.test_name,
    parameter.testName,
    parameter.parameter_name,
    parameter.parameterName,
    parameter.label,
    parameter.key,
    parameter.id,
    "Unnamed Parameter"
  );

const unitOf = (parameter = {}) =>
  firstValue(
    parameter.unit,
    parameter.units,
    parameter.result_unit,
    parameter.resultUnit,
    parameter.reporting_unit,
    parameter.reportingUnit,
    parameter.display_unit,
    parameter.displayUnit
  );

const HORMONAL_UNIT_FALLBACKS = Object.freeze({
  fsh: "mIU/mL", lh: "mIU/mL", prolactin: "ng/mL",
  estradiol: "pg/mL", progesterone: "ng/mL", testosterone: "ng/mL",
  shbg: "nmol/L", amh: "ng/mL", dhea_s: "µg/dL",
  tsh: "µIU/mL", free_t4: "ng/dL", free_t3: "pg/mL",
});

const unitFallbackFor = (parameter = {}) =>
  HORMONAL_UNIT_FALLBACKS[canonicalHormonalAnalyteKey(nameOf(parameter)) || keyOf(parameter)] || "";

const resolvedUnitOf = (parameter = {}) =>
  firstValue(unitOf(parameter), unitFallbackFor(parameter));

/* ==========================================================
   CALCULATED PARAMETER DETECTION
   ========================================================== */

const CALCULATED_NAMES = new Set([
  "calculated",
  "free androgen index",
  "fa index",
  "albumin corrected calcium",
  "corrected calcium",
]);

const isCalculatedParameter = (parameter = {}) => {
  if (
    parameter.calculated === true ||
    parameter.isCalculated === true ||
    parameter.readOnly === true ||
    parameter.read_only === true
  ) {
    return true;
  }

  const name = normalizeText(
    nameOf(parameter)
  );

  return CALCULATED_NAMES.has(name);
};

/* ==========================================================
   NORMALIZE ANALYTE
   ========================================================== */

const normalizeAnalyte = (
  raw = {},
  index = 0
) => {
  if (!isObject(raw)) {
    return null;
  }

  const nested =
    raw.master_tests ||
    raw.master_test ||
    raw.masterTest ||
    raw.test ||
    null;

  const source = isObject(nested)
    ? {
        ...raw,
        ...nested,

        panel_test_id:
          raw.panel_test_id ??
          raw.id,

        panel_id:
          raw.panel_id ??
          nested.panel_id,

        test_id:
          raw.test_id ??
          nested.id,

        display_order:
          raw.display_order ??
          nested.display_order,
      }
    : raw;

  const key = keyOf(source);

  if (!key) {
    return null;
  }

  const calculated =
    isCalculatedParameter(source);

  return {
    ...source,

    key,

    id:
      source.id ??
      source.test_id ??
      null,

    test_id:
      source.test_id ??
      source.id ??
      null,

    parameter_id:
      source.parameter_id ??
      source.test_id ??
      source.id ??
      null,

    name: nameOf(source),

    test_name:
      firstValue(
        source.test_name,
        source.name,
        source.label
      ),

    unit:
      firstValue(
        source.unit,
        source.units
      ),

    result_unit:
      firstValue(
        source.result_unit,
        source.resultUnit,
        source.unit
      ),

    reporting_unit:
      firstValue(
        source.reporting_unit,
        source.reportingUnit,
        source.display_unit,
        source.displayUnit,
        source.unit
      ),

    reference_range:
      firstValue(
        source.reference_range,
        source.referenceRange,
        source.normal_range,
        source.normalRange
      ),

    reference_value:
      firstValue(
        source.reference_value,
        source.referenceValue
      ),

    male_range:
      firstValue(
        source.male_range,
        source.maleRange
      ),

    female_range:
      firstValue(
        source.female_range,
        source.femaleRange
      ),

    child_range:
      firstValue(
        source.child_range,
        source.childRange
      ),

    elderly_range:
      firstValue(
        source.elderly_range,
        source.elderlyRange
      ),

    pregnancy_range:
      firstValue(
        source.pregnancy_range,
        source.pregnancyRange
      ),

    first_trimester_range:
      firstValue(
        source.first_trimester_range,
        source.firstTrimesterRange
      ),

    second_trimester_range:
      firstValue(
        source.second_trimester_range,
        source.secondTrimesterRange
      ),

    third_trimester_range:
      firstValue(
        source.third_trimester_range,
        source.thirdTrimesterRange
      ),

    day_3_range:
      firstValue(
        source.day_3_range,
        source.day3_range,
        source.day_3Range,
        source.day3Range
      ),

    day_21_range:
      firstValue(
        source.day_21_range,
        source.day21_range,
        source.day_21Range,
        source.day21Range
      ),

    reference_ranges:
      source.reference_ranges ||
      source.referenceRanges ||
      null,

    follicular_range:
      firstValue(
        source.follicular_range,
        source.follicularRange
      ),

    ovulatory_range:
      firstValue(
        source.ovulatory_range,
        source.ovulatoryRange
      ),

    luteal_range:
      firstValue(
        source.luteal_range,
        source.lutealRange
      ),

    critical_low:
      firstValue(
        source.critical_low,
        source.criticalLow,
        null
      ),

    critical_high:
      firstValue(
        source.critical_high,
        source.criticalHigh,
        null
      ),

    display_order:
      source.display_order ??
      index + 1,

    calculated,

    readOnly:
      calculated,
  };
};

/* ==========================================================
   NORMALIZE ANALYTES
   ========================================================== */

const normalizeAnalytes = (
  rows = []
) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  const map = new Map();

  rows.forEach(
    (row, index) => {
      const parameter =
        normalizeAnalyte(
          row,
          index
        );

      if (!parameter) {
        return;
      }

      const identity =
        parameter.id
          ? `id:${parameter.id}`
          : `name:${normalizeText(
              parameter.name
            )}`;

      const previous =
        map.get(identity);

      map.set(
        identity,
        {
          ...(previous || {}),
          ...parameter,

          /*
           * Never lose useful metadata.
           */
          unit:
            parameter.unit ||
            previous?.unit ||
            "",

          result_unit:
            parameter.result_unit ||
            previous?.result_unit ||
            "",

          reporting_unit:
            parameter.reporting_unit ||
            previous?.reporting_unit ||
            "",

          reference_range:
            parameter.reference_range ||
            previous?.reference_range ||
            "",

          reference_value:
            parameter.reference_value ||
            previous?.reference_value ||
            "",

          male_range:
            parameter.male_range ||
            previous?.male_range ||
            "",

          female_range:
            parameter.female_range ||
            previous?.female_range ||
            "",

          child_range:
            parameter.child_range ||
            previous?.child_range ||
            "",

          elderly_range:
            parameter.elderly_range ||
            previous?.elderly_range ||
            "",

          pregnancy_range:
            parameter.pregnancy_range ||
            previous?.pregnancy_range ||
            "",

          first_trimester_range:
            parameter.first_trimester_range ||
            previous?.first_trimester_range ||
            "",

          second_trimester_range:
            parameter.second_trimester_range ||
            previous?.second_trimester_range ||
            "",

          third_trimester_range:
            parameter.third_trimester_range ||
            previous?.third_trimester_range ||
            "",

          day_3_range:
            parameter.day_3_range ||
            previous?.day_3_range ||
            "",

          day_21_range:
            parameter.day_21_range ||
            previous?.day_21_range ||
            "",

          reference_ranges:
            parameter.reference_ranges ||
            previous?.reference_ranges ||
            null,

          follicular_range:
            parameter.follicular_range ||
            previous?.follicular_range ||
            "",

          ovulatory_range:
            parameter.ovulatory_range ||
            previous?.ovulatory_range ||
            "",

          luteal_range:
            parameter.luteal_range ||
            previous?.luteal_range ||
            "",

          critical_low:
            parameter.critical_low ??
            previous?.critical_low ??
            null,

          critical_high:
            parameter.critical_high ??
            previous?.critical_high ??
            null,
        }
      );
    }
  );

  return Array.from(
    map.values()
  ).sort(
    (a, b) => {
      const ao =
        Number(a.display_order);

      const bo =
        Number(b.display_order);

      if (
        Number.isFinite(ao) &&
        Number.isFinite(bo)
      ) {
        return ao - bo;
      }

      if (
        Number.isFinite(ao)
      ) {
        return -1;
      }

      if (
        Number.isFinite(bo)
      ) {
        return 1;
      }

      return String(
        a.name
      ).localeCompare(
        String(b.name)
      );
    }
  );
};

/* ==========================================================
   EXISTING RESULT HELPERS
   ========================================================== */

const extractExistingParameters = (
  source = {}
) => {
  if (!isObject(source)) {
    return {};
  }

  const parameters =
    source.parameters;

  if (isObject(parameters)) {
    return parameters;
  }

  const results =
    source.results;

  if (isObject(results)) {
    return results;
  }

  const parameterResults =
    source.parameter_results;

  if (
    isObject(parameterResults)
  ) {
    return parameterResults;
  }

  const resultParameters =
    source.result_parameters;

  if (
    isObject(resultParameters)
  ) {
    return resultParameters;
  }

  return {};
};

const findExistingParameter = (
  source,
  parameter
) => {
  if (!isObject(source)) {
    return {};
  }

  const candidates = [
    parameter.key,
    parameter.id,
    parameter.test_id,
    parameter.parameter_id,
    parameter.name,
    parameter.test_name,
  ].filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      text(value) !== ""
  );

  for (
    const candidate of candidates
  ) {
    const exact =
      source[candidate];

    if (isObject(exact)) {
      return exact;
    }

    if (
      exact !== null &&
      exact !== undefined
    ) {
      return {
        value: exact,
      };
    }
  }

  const wanted =
    normalizeText(
      parameter.name
    );

  for (
    const [key, item] of Object.entries(
      source
    )
  ) {
    if (
      normalizeText(key) ===
      wanted
    ) {
      return isObject(item)
        ? item
        : {
            value: item,
          };
    }

    if (
      isObject(item) &&
      (
        normalizeText(
          item.name
        ) === wanted ||
        normalizeText(
          item.test_name
        ) === wanted ||
        normalizeText(
          item.parameter_name
        ) === wanted
      )
    ) {
      return item;
    }
  }

  return {};
};

const getInitialValue = (
  existing = {}
) => {
  if (
    typeof existing ===
    "string" ||
    typeof existing ===
    "number"
  ) {
    return existing;
  }

  return firstValue(
    existing?.value,
    existing?.result,
    existing?.result_value,
    existing?.result_numeric,
    ""
  );
};

/* ==========================================================
   INITIAL PARAMETER
   ========================================================== */

const buildInitialParameter = (
  parameter,
  existing = {}
) => {
  const calculated =
    parameter.calculated === true ||
    existing?.calculated === true;

  return {
    ...parameter,
    ...(
      isObject(existing)
        ? existing
        : {}
    ),

    key:
      parameter.key,

    name:
      parameter.name,

    value:
      getInitialValue(existing),

    unit:
      firstValue(
        existing?.unit,
        parameter.unit,
        parameter.result_unit,
        parameter.reporting_unit
      ),

    method:
      firstValue(
        existing?.method,
        parameter.method
      ),

    manual_reference_range:
      firstValue(
        existing?.manual_reference_range,
        ""
      ),

    reference_range:
      firstValue(
        existing?.reference_range,
        parameter.reference_range,
        parameter.reference_value
      ),

    reference_source:
      firstValue(
        existing?.reference_source,
        ""
      ),

    flag:
      firstValue(
        existing?.flag,
        existing?.result_flag,
        ""
      ),

    calculated,

    readOnly:
      calculated ||
      parameter.readOnly === true,
  };
};

const buildParameters = (
  analytes,
  existing
) =>
  analytes.reduce(
    (output, parameter) => {
      const key =
        parameter.key;

      if (!key) {
        return output;
      }

      output[key] =
        buildInitialParameter(
          parameter,
          findExistingParameter(
            existing,
            parameter
          )
        );

      return output;
    },
    {}
  );

/* ==========================================================
   FLAG NORMALIZATION
   ========================================================== */

const normalizeFlag = (
  value
) => {
  const normalized =
    normalizeText(value);

  if (
    normalized ===
    "high"
  ) {
    return "HIGH";
  }

  if (
    normalized ===
    "low"
  ) {
    return "LOW";
  }

  if (
    normalized ===
    "normal"
  ) {
    return "NORMAL";
  }

  if (
    normalized.includes(
      "critical high"
    )
  ) {
    return "CRITICAL HIGH";
  }

  if (
    normalized.includes(
      "critical low"
    )
  ) {
    return "CRITICAL LOW";
  }

  if (
    normalized ===
    "critical"
  ) {
    return "CRITICAL";
  }

  return text(value);
};

/* ==========================================================
   RESOLVE RANGE
   ========================================================== */

const resolveParameterRange = (
  parameter,
  context,
  manualRange,
  profileKey
) => {
  try {
    const resolved =
      resolveReferenceRange({
        parameter,
        context,
        manualRange,
        profileKey,
      });

    if (
      isObject(resolved)
    ) {
      return {
        text:
          firstValue(
            resolved.text,
            resolved.range,
            resolved.referenceRange,
            resolved.reference_range,
            ""
          ),

        source:
          firstValue(
            resolved.source,
            "automatic"
          ),
      };
    }

    if (
      typeof resolved ===
      "string"
    ) {
      return {
        text: resolved,
        source: manualRange
          ? "manual"
          : "automatic",
      };
    }

    return {
      text: "",
      source: "unresolved",
    };
  } catch (error) {
    console.error(
      "[PEFA HORMONAL PROFILE RANGE] Failed:",
      {
        parameter,
        context,
        error,
      }
    );

    return {
      text: "",
      source: "error",
    };
  }
};

/* ==========================================================
   FLAG
   ========================================================== */

const resolveParameterFlag = (
  value,
  range
) => {
  if (
    text(value) ===
    "" ||
    !range?.text
  ) {
    return "";
  }

  try {
    return normalizeFlag(
      flagResult(
        value,
        range
      )
    );
  } catch (error) {
    console.error(
      "[PEFA HORMONAL PROFILE FLAG] Failed:",
      {
        value,
        range,
        error,
      }
    );

    return "";
  }
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function HormonalProfileResultEntry({
  title = "Hormonal Profile",
  profileKey = null,

  analytes = [],
  parameters = [],
  panelParameters = [],

  /* Resolver metadata is component-only and must never reach native DOM. */
  parameterSource = null,
  parameterLoading = false,
  parameterError = null,

  value = null,
  result = null,
  initialResult = null,
  existingResult = null,

  patient = null,
  registration = null,
  test = null,

  onChange,
  onSave,
  onSaved,
  onCancel,
  onBack,

  readOnly = false,
  disabled = false,
  editMode = false,

  className = "",

  ...rest
}) {
  /* ========================================================
     UNIVERSAL HORMONAL PROFILE SELECTION
     ======================================================== */

  const inferredProfileKey = useMemo(
    () => inferHormonalProfileKey({ test, title, patient }),
    [test, title, patient]
  );

  const [selectedProfileKey, setSelectedProfileKey] = useState(
    () => profileKey || inferredProfileKey || "full_female"
  );

  useEffect(() => {
    if (profileKey) {
      setSelectedProfileKey(profileKey);
    } else if (inferredProfileKey) {
      setSelectedProfileKey(inferredProfileKey);
    }
  }, [profileKey, inferredProfileKey]);

  const resolvedProfileKey =
    profileKey || selectedProfileKey || "full_female";

  const profileDefinition =
    getHormonalProfileDefinition(resolvedProfileKey) ||
    HORMONAL_PROFILE_DEFINITIONS.full_female;

  const hormonalPanelAllowed = useMemo(() => {
    const candidates = [
      test?.key, test?.code, test?.name, test?.test_name, test?.testName,
      test?.panel_key, test?.panelKey, test?.panel_name, test?.panelName, title,
    ].filter(Boolean);
    if (!candidates.length) return true;
    return candidates.some((candidate) => isHormonalProfilePanel(candidate));
  }, [test, title]);

  const handleProfileChange = useCallback((nextKey) => {
    if (disabled || readOnly || profileKey) return;
    const nextDefinition = getHormonalProfileDefinition(nextKey);
    if (!nextDefinition) return;

    setSelectedProfileKey(nextKey);

    if (nextDefinition.sex === "male" || nextDefinition.sex === "female") {
      setContext((current) => ({ ...current, sex: nextDefinition.sex }));
    }

    if (nextKey === "female_day3") {
      setContext((current) => ({ ...current, sex: "female", cyclePhase: "day_3" }));
    } else if (nextKey === "female_day21") {
      setContext((current) => ({ ...current, sex: "female", cyclePhase: "day_21" }));
    }
  }, [disabled, readOnly, profileKey]);

  /* ========================================================
     SUPPLIED ANALYTES
     ======================================================== */

  const suppliedAnalytes =
    useMemo(() => {
      /*
       * Database/resolver parameters are authoritative.
       * Registry analytes are fallback metadata only.
       *
       * Merge all supplied sources instead of selecting only
       * the first non-empty array. This prevents a wrapper
       * registry from hiding the current LIS panel definition.
       */
      const sources = [
        Array.isArray(parameters) ? parameters : [],
        Array.isArray(panelParameters) ? panelParameters : [],
        Array.isArray(analytes) ? analytes : [],
      ];

      const merged = [];
      const seen = new Set();

      sources.flat().forEach((row) => {
        const normalized = normalizeAnalyte(row, merged.length);
        if (!normalized) return;

        const identity = normalized.id
          ? `id:${normalized.id}`
          : `name:${normalizeText(normalized.name)}`;

        if (seen.has(identity)) return;

        seen.add(identity);
        merged.push(row);
      });

      return merged;
    }, [
      analytes,
      parameters,
      panelParameters,
    ]);

  /* ========================================================
     NORMALIZED ANALYTES — PROFILE-AWARE
     ======================================================== */

  const normalizedAnalytes = useMemo(() => {
    const databaseRows = normalizeAnalytes(suppliedAnalytes);
    const byHormone = new Map();

    databaseRows.forEach((row) => {
      const hormoneKey = canonicalHormonalAnalyteKey(
        row.name || row.test_name || row.key
      );
      if (!hormoneKey) return;
      const previous = byHormone.get(hormoneKey);
      byHormone.set(hormoneKey, { ...(previous || {}), ...row });
    });

    return profileDefinition.analytes
      .map((displayName, index) => {
        const hormoneKey = canonicalHormonalAnalyteKey(displayName);
        const db = byHormone.get(hormoneKey) || {};
        const normalized = normalizeAnalyte(
          {
            ...db,
            key: db.key || hormoneKey,
            name: db.name || displayName,
            test_name: db.test_name || displayName,
            display_order: db.display_order ?? index + 1,
          },
          index
        );
        if (!normalized) return null;
        const fallbackUnit = resolvedUnitOf(normalized);
        return {
          ...normalized,
          unit: firstValue(normalized.unit, fallbackUnit),
          result_unit: firstValue(normalized.result_unit, fallbackUnit),
          reporting_unit: firstValue(normalized.reporting_unit, fallbackUnit),
        };
      })
      .filter(Boolean);
  }, [suppliedAnalytes, profileDefinition]);

  /* ========================================================
     DEBUG
     ======================================================== */

  useEffect(() => {
    console.groupCollapsed(
      "%c[PEFA HORMONAL PROFILE DEBUG]",
      "font-weight:bold;color:#7c3aed"
    );

    console.log(
      "Title:",
      title
    );

    console.log(
      "Test:",
      test
    );

    console.log(
      "Supplied analytes:",
      suppliedAnalytes
    );

    console.log(
      "Normalized analytes:",
      normalizedAnalytes
    );

    console.table(
      normalizedAnalytes.map(
        (parameter) => ({
          id:
            parameter.id,
          key:
            parameter.key,
          name:
            parameter.name,
          unit:
            parameter.unit,
          reference:
            parameter.reference_range,
          reference_value:
            parameter.reference_value,
          male:
            parameter.male_range,
          female:
            parameter.female_range,
          child:
            parameter.child_range,
          pregnancy:
            parameter.pregnancy_range,
          calculated:
            parameter.calculated,
          order:
            parameter.display_order,
        })
      )
    );

    console.groupEnd();
  }, [
    title,
    test,
    suppliedAnalytes,
    normalizedAnalytes,
  ]);

  /* ========================================================
     INCOMING RESULT
     ======================================================== */

  const isLaboratoryResultRow = (candidate) =>
    isObject(candidate) &&
    Object.prototype.hasOwnProperty.call(candidate, "result_status") &&
    (Object.prototype.hasOwnProperty.call(candidate, "registration_id") ||
      Object.prototype.hasOwnProperty.call(candidate, "test_id") ||
      Object.prototype.hasOwnProperty.call(candidate, "lab_number"));

  /*
   * The parent passes the authoritative laboratory_results row.
   * This form must work with the JSON stored in its `result` column,
   * not with the outer database row itself.
   */
  const unwrapResultPayload = (candidate) => {
    if (isLaboratoryResultRow(candidate) && isObject(candidate.result)) {
      return candidate.result;
    }
    return candidate;
  };

  const rawSourceResult =
    isObject(value)
      ? value
      : isObject(result)
        ? result
        : isObject(initialResult)
          ? initialResult
          : isObject(existingResult)
            ? existingResult
            : {};

  const sourceResult =
    unwrapResultPayload(rawSourceResult) || {};

  const sourceParameters =
    useMemo(
      () =>
        extractExistingParameters(
          sourceResult
        ),
      [sourceResult]
    );

  /* ========================================================
     CONTEXT
     ======================================================== */

  const buildContext = useCallback(
    (source = {}) => ({
      sex: normalizeSex(
        firstValue(
          patient?.sex,
          patient?.gender,
          source?.sex,
          ""
        )
      ),

      age: getAgeInYears({
        age: firstValue(
          patient?.age,
          patient?.patient_age,
          source?.age,
          source?.patient_age
        ),

        dob: firstValue(
          patient?.dob,
          patient?.date_of_birth,
          source?.dob,
          source?.date_of_birth
        ),
      }),

      pregnancyStatus:
        normalizePregnancyStatus(
          firstValue(
            patient?.pregnancy_status,
            source?.pregnancy_status,
            "not_pregnant"
          )
        ),

      trimester:
        normalizeTrimester(
          firstValue(
            patient?.trimester,
            source?.trimester,
            ""
          )
        ),

      cyclePhase:
        normalizeCyclePhase(
          firstValue(
            patient?.cycle_phase,
            source?.cycle_phase,
            "unspecified"
          )
        ),
    }),
    [patient]
  );

  const [context, setContext] =
    useState(
      () =>
        buildContext(
          sourceResult
        )
    );

  /* ========================================================
     FORM
     ======================================================== */

  const [form, setForm] =
    useState(() => ({
      ...sourceResult,

      parameters:
        buildParameters(
          normalizedAnalytes,
          sourceParameters
        ),

      interpretation:
        sourceResult?.interpretation ??
        "",

      comments:
        sourceResult?.comments ??
        "",
    }));

  /* ========================================================
     INITIALIZATION TRACKING
     ======================================================== */

  const resultId =
    text(
      rawSourceResult?.id ??
      rawSourceResult?.result_id ??
      rawSourceResult?.laboratory_result_id ??
      sourceResult?.id ??
      sourceResult?.result_id ??
      sourceResult?.laboratory_result_id
    );

  const analyteSignature =
    normalizedAnalytes
      .map(
        (parameter) =>
          [
            parameter.key,
            parameter.name,
            parameter.unit,
            parameter.reference_range,
            parameter.reference_value,
            parameter.male_range,
            parameter.female_range,
            parameter.child_range,
            parameter.pregnancy_range,
            parameter.first_trimester_range,
            parameter.second_trimester_range,
            parameter.third_trimester_range,
            parameter.day_3_range,
            parameter.day_21_range,
            parameter.follicular_range,
            parameter.ovulatory_range,
            parameter.luteal_range,
            parameter.reference_ranges,
            parameter.calculated,
          ].join(":")
      )
      .join("|");

  const initializationKey =
    `${resultId}|${analyteSignature}`;

  const previousInitializationKey =
    useRef(
      initializationKey
    );

  /* ========================================================
     REINITIALIZE WHEN PATIENT / RESULT / ANALYTES CHANGE
     ======================================================== */

  useEffect(() => {
    if (
      previousInitializationKey.current ===
      initializationKey
    ) {
      return;
    }

    previousInitializationKey.current =
      initializationKey;

    const nextContext =
      buildContext(
        sourceResult
      );

    const nextParameters =
      buildParameters(
        normalizedAnalytes,
        sourceParameters
      );

    console.groupCollapsed(
      "%c[PEFA HORMONAL PROFILE INITIALIZATION]",
      "font-weight:bold;color:#7c3aed"
    );

    console.log(
      "Initialization key:",
      initializationKey
    );

    console.log(
      "Context:",
      nextContext
    );

    console.log(
      "Parameters:",
      nextParameters
    );

    console.groupEnd();

    setContext(
      nextContext
    );

    setForm({
      ...sourceResult,

      parameters:
        nextParameters,

      interpretation:
        sourceResult?.interpretation ??
        "",

      comments:
        sourceResult?.comments ??
        "",
    });
  }, [
    initializationKey,
    buildContext,
    sourceResult,
    sourceParameters,
    normalizedAnalytes,
  ]);

  /* ========================================================
     RESOLVED PARAMETERS
     ======================================================== */

  const resolvedParameters =
    useMemo(() => {
      const output = {};

      normalizedAnalytes.forEach(
        (parameter) => {
          const key =
            parameter.key;

          const current =
            form.parameters?.[key] ||
            buildInitialParameter(
              parameter
            );

          const manualRange =
            text(
              current.manual_reference_range
            );

          const range =
            resolveParameterRange(
              parameter,
              context,
              manualRange,
              resolvedProfileKey
            );

          const value =
            current.value ?? "";

          const flag =
            resolveParameterFlag(
              value,
              range
            );

          output[key] = {
            ...parameter,
            ...current,

            key,

            name:
              parameter.name,

            unit:
              firstValue(
                current.unit,
                parameter.unit,
                parameter.result_unit,
                parameter.reporting_unit,
                resolvedUnitOf(parameter)
              ),

            value,

            reference_range:
              range.text,

            referenceRange:
              range.text,

            reference_source:
              range.source,

            flag,

            result_flag:
              flag,

            calculated:
              current.calculated === true ||
              parameter.calculated === true,

            readOnly:
              current.readOnly === true ||
              parameter.readOnly === true,
          };
        }
      );

      return output;
    }, [
      normalizedAnalytes,
      form.parameters,
      context,
      resolvedProfileKey,
    ]);

  /* ========================================================
     RESOLVED ARRAY
     ======================================================== */

  const rows =
    useMemo(
      () =>
        normalizedAnalytes.map(
          (parameter) =>
            resolvedParameters[
              parameter.key
            ] ||
            parameter
        ),
      [
        normalizedAnalytes,
        resolvedParameters,
      ]
    );

  /* ========================================================
     INTEGRATED ENDOCRINE INTERPRETATION
     ======================================================== */
  const generatedInterpretation = useMemo(() => {
    try {
      return interpretEndocrinePanel({ rows, context, panelName: title, test });
    } catch (error) {
      console.error("[PEFA HORMONAL PROFILE INTERPRETATION] Failed:", error);
      return { interpretation: "", summary: "", findings: [], flags: [], panelKey: resolvedProfileKey, confidence: "low", requiresClinicalCorrelation: true };
    }
  }, [rows, context, title, test, resolvedProfileKey]);

  const effectiveInterpretation =
    text(form.interpretation) ||
    text(generatedInterpretation?.interpretation) ||
    text(generatedInterpretation?.summary) ||
    "";

  /* ========================================================
     DEBUG RESOLVED RESULTS
     ======================================================== */

  useEffect(() => {
    console.groupCollapsed(
      "%c[PEFA HORMONAL PROFILE RESOLVED RESULTS]",
      "font-weight:bold;color:#7c3aed"
    );

    console.table(
      rows.map(
        (row) => ({
          parameter:
            row.name,
          result:
            row.value,
          unit:
            row.unit,
          reference:
            row.reference_range,
          flag:
            row.flag,
          source:
            row.reference_source,
          calculated:
            row.calculated,
        })
      )
    );

    console.groupEnd();
  }, [rows]);

  /* ========================================================
     PAYLOAD
     ======================================================== */

  const buildPayload =
    useCallback(() => {
      const parameterResults =
        Object.fromEntries(
          rows.map(
            (row) => [
              row.key,
              {
                ...row,

                result:
                  row.value ?? "",

                value:
                  row.value ?? "",

                unit:
                  row.unit ?? "",

                reference_range:
                  row.reference_range ??
                  "",

                referenceRange:
                  row.reference_range ??
                  "",

                reference_source:
                  row.reference_source ??
                  "",

                flag:
                  row.flag ?? "",

                result_flag:
                  row.flag ?? "",
              },
            ]
          )
        );

      return {
        ...sourceResult,

        parameters:
          parameterResults,

        parameter_results:
          parameterResults,

        interpretation:
          effectiveInterpretation,

        comments:
          form.comments ??
          "",

        sex:
          context.sex,

        age:
          context.age,

        pregnancy_status:
          context.pregnancyStatus,

        trimester:
          context.trimester,

        cycle_phase:
          context.cyclePhase,

        patient,
        registration,
        test,
      };
    }, [
      rows,
      sourceResult,
      effectiveInterpretation,
      form.comments,
      context,
      patient,
      registration,
      test,
    ]);

  /* ========================================================
     CHANGE HANDLER
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

        const parameter =
          form.parameters?.[
            key
          ];

        if (
          parameter?.calculated ||
          parameter?.readOnly
        ) {
          return;
        }

        setForm(
          (previous) => ({
            ...previous,

            parameters: {
              ...previous.parameters,

              [key]: {
                ...(previous.parameters?.[
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
        form.parameters,
      ]
    );

  /* ========================================================
     CONTEXT CHANGE
     ======================================================== */

  const updateContext =
    useCallback(
      (patch) => {
        if (
          disabled ||
          readOnly
        ) {
          return;
        }

        setContext(
          (current) => ({
            ...current,
            ...patch,
          })
        );
      },
      [
        disabled,
        readOnly,
      ]
    );

  /* ========================================================
     PUBLISH CHANGES
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
    resolvedParameters,
    context,
    effectiveInterpretation,
    form.comments,
    buildPayload,
    onChange,
  ]);

  /* ========================================================
     SAVE
     ======================================================== */

  const save =
    useCallback(() => {
      const payload =
        buildPayload();

      console.groupCollapsed(
        "%c[PEFA HORMONAL PROFILE SAVE]",
        "font-weight:bold;color:#7c3aed"
      );

      console.log(
        "Payload:",
        payload
      );

      console.table(
        rows.map(
          (row) => ({
            parameter:
              row.name,
            result:
              row.value,
            unit:
              row.unit,
            reference:
              row.reference_range,
            flag:
              row.flag,
          })
        )
      );

      console.groupEnd();

      /*
       * `onSaved` is the authoritative persistence callback.
       * Use `onSave` only as a compatibility fallback so one click
       * can never invoke the same parent persistence boundary twice.
       */
      if (typeof onSaved === "function") {
        onSaved(payload);
      } else if (typeof onSave === "function") {
        onSave(payload);
      }
    }, [
      buildPayload,
      rows,
      onSave,
      onSaved,
    ]);

  /* ========================================================
     DISABLED
     ======================================================== */

  const isDisabled =
    Boolean(
      disabled ||
      readOnly
    );

  if (!hormonalPanelAllowed) {
    return (
      <div
        className={`pefa-hormonal-profile ${className}`}
        style={{
          width: "100%",
          padding: 18,
          border: "1px solid #fecaca",
          borderRadius: 12,
          background: "#fff7f7",
          color: "#991b1b",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
        {...rest}
      >
        <strong>Wrong result-entry form</strong>
        <div style={{ marginTop: 6, fontSize: 12 }}>
          This component handles only the five Hormonal Profile configurations.
          Please use the dedicated TFT/thyroid or other endocrine form for this test.
        </div>
      </div>
    );
  }

  /* ========================================================
     FLAG DISPLAY
     ======================================================== */

  const flagStyle = (
    flag
  ) => {
    const normalized =
      normalizeText(flag);

    if (
      normalized.includes(
        "critical"
      )
    ) {
      return {
        color: "#b91c1c",
        fontWeight: 900,
      };
    }

    if (
      normalized ===
        "high" ||
      normalized ===
        "low"
    ) {
      return {
        color: "#b45309",
        fontWeight: 900,
      };
    }

    if (
      normalized ===
      "normal"
    ) {
      return {
        color: "#15803d",
        fontWeight: 900,
      };
    }

    return {
      color: "#64748b",
      fontWeight: 800,
    };
  };

  /* ========================================================
     STYLES
     ======================================================== */

  const styles = {
    wrapper: {
      width: "100%",
      color: "#172033",
      fontFamily:
        "Inter, system-ui, sans-serif",
      boxSizing: "border-box",
    },

    header: {
      padding:
        "16px 18px",
      border:
        "1px solid #dbe3ea",
      borderRadius: 12,
      background: "#fff",
      marginBottom: 12,
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: 800,
      letterSpacing:
        ".1em",
      color: "#7c3aed",
    },

    title: {
      margin:
        "4px 0 0",
      fontSize: 20,
      fontWeight: 750,
      color: "#172033",
    },

    subtitle: {
      margin:
        "4px 0 0",
      fontSize: 11,
      color: "#64748b",
    },

    context: {
      display: "grid",
      gridTemplateColumns:
        "repeat(5,minmax(120px,1fr))",
      gap: 9,
      padding: 12,
      border:
        "1px solid #dbe3ea",
      borderRadius: 10,
      background:
        "#fafbfc",
      marginBottom: 12,
    },

    label: {
      fontSize: 10,
      fontWeight: 750,
      color: "#475569",
    },

    input: {
      width: "100%",
      marginTop: 4,
      border:
        "1px solid #cfd8e3",
      borderRadius: 7,
      padding: "8px 9px",
      font: "inherit",
      fontSize: 11,
      background: "#fff",
      boxSizing: "border-box",
    },

    tableWrap: {
      overflowX: "auto",
      border:
        "1px solid #dbe3ea",
      borderRadius: 12,
      background: "#fff",
    },

    table: {
      width: "100%",
      minWidth: 900,
      borderCollapse:
        "collapse",
    },

    th: {
      padding: 10,
      background:
        "#f8fafc",
      color: "#64748b",
      fontSize: 9,
      fontWeight: 800,
      textTransform:
        "uppercase",
      textAlign: "left",
      borderBottom:
        "1px solid #cbd5e1",
    },

    td: {
      padding: 9,
      borderTop:
        "1px solid #eef2f5",
      fontSize: 11,
      verticalAlign:
        "middle",
    },

    calculated: {
      background:
        "#f5f3ff",
      borderColor:
        "#c4b5fd",
      color: "#5b21b6",
      fontWeight: 750,
    },

    notes: {
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap: 10,
      marginTop: 12,
    },

    textarea: {
      width: "100%",
      minHeight: 70,
      marginTop: 4,
      border:
        "1px solid #cfd8e3",
      borderRadius: 7,
      padding: 8,
      resize: "vertical",
      font: "inherit",
      fontSize: 11,
      boxSizing: "border-box",
    },

    actions: {
      display: "flex",
      justifyContent:
        "flex-end",
      gap: 8,
      marginTop: 10,
    },

    button: {
      border:
        "1px solid #cfd8e3",
      background: "#fff",
      borderRadius: 7,
      padding:
        "9px 14px",
      fontSize: 11,
      fontWeight: 750,
      cursor: "pointer",
    },

    primary: {
      background:
        "#7c3aed",
      borderColor:
        "#7c3aed",
      color: "#fff",
    },

    calculatedText: {
      display: "block",
      marginTop: 2,
      fontSize: 9,
      color: "#7c3aed",
      fontWeight: 700,
    },
  };

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div
      className={`pefa-hormonal-profile ${className}`}
      style={styles.wrapper}
      {...rest}
    >
      <style>{`
        .pefa-hormonal-profile * {
          box-sizing: border-box;
        }

        .pefa-hormonal-profile select,
        .pefa-hormonal-profile input,
        .pefa-hormonal-profile textarea {
          outline: none;
        }

        .pefa-hormonal-profile
        select:focus,
        .pefa-hormonal-profile
        input:focus,
        .pefa-hormonal-profile
        textarea:focus {
          border-color: #7c3aed;
          box-shadow:
            0 0 0 2px
            rgba(124,58,237,.10);
        }

        @media(max-width:800px) {
          .pefa-hormonal-profile__context {
            grid-template-columns:
              repeat(2,1fr) !important;
          }

          .pefa-hormonal-profile__notes {
            grid-template-columns:
              1fr !important;
          }
        }
      `}</style>

      {/* ====================================================
          HEADER
          ==================================================== */}

      <div
        style={styles.header}
      >
        <div
          style={styles.eyebrow}
        >
          ENDOCRINOLOGY · HORMONAL PROFILE
        </div>

        <h2
          style={styles.title}
        >
          {profileDefinition.label}
        </h2>

        <div
          style={styles.subtitle}
        >
          {editMode
            ? "EDIT MODE — Review or update the panel results."
            : "Enter measured results. Reference ranges and flags are resolved automatically."}
        </div>
      </div>

      {/* ====================================================
          HORMONAL PROFILE SELECTOR
          ==================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(250px, 1fr) 2fr",
          gap: 10,
          padding: 12,
          border: "1px solid #dbe3ea",
          borderRadius: 10,
          background: "#fafbfc",
          marginBottom: 12,
        }}
      >
        <label style={styles.label}>
          Hormonal Profile
          <select
            disabled={isDisabled || Boolean(profileKey)}
            value={resolvedProfileKey}
            onChange={(event) => handleProfileChange(event.target.value)}
            style={styles.input}
          >
            {HORMONAL_PROFILE_KEYS.map((key) => (
              <option key={key} value={key}>
                {HORMONAL_PROFILE_DEFINITIONS[key].label}
              </option>
            ))}
          </select>
        </label>

        <div style={{ alignSelf: "end", fontSize: 11, color: "#64748b", paddingBottom: 8 }}>
          <strong style={{ color: "#334155" }}>{profileDefinition.label}</strong>
          <span style={{ marginLeft: 8 }}>{profileDefinition.description}</span>
        </div>
      </div>

      {!hormonalPanelAllowed && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            border: "1px solid #fecaca",
            borderRadius: 10,
            background: "#fff7f7",
            color: "#991b1b",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          This universal form is restricted to the five Hormonal Profile configurations.
          TFT, thyroid and other specialised endocrine panels must use their dedicated forms.
        </div>
      )}

      {/* ====================================================
          DEMOGRAPHIC CONTEXT
          ==================================================== */}

      <div
        className="pefa-hormonal-profile__context"
        style={styles.context}
      >
        <label
          style={styles.label}
        >
          Sex

          <select
            disabled={
              isDisabled
            }
            value={
              context.sex ||
              "unknown"
            }
            onChange={(event) =>
              updateContext({
                sex:
                  event.target
                    .value,
              })
            }
            style={
              styles.input
            }
          >
            <option value="unknown">
              Select
            </option>

            <option value="male">
              Male
            </option>

            <option value="female">
              Female
            </option>
          </select>
        </label>

        <label
          style={styles.label}
        >
          Age (years)

          <input
            disabled={
              isDisabled
            }
            type="number"
            min="0"
            value={
              context.age ??
              ""
            }
            onChange={(event) =>
              updateContext({
                age:
                  event.target
                    .value,
              })
            }
            style={
              styles.input
            }
          />
        </label>

        <label
          style={styles.label}
        >
          Pregnancy

          <select
            disabled={
              isDisabled
            }
            value={
              context.pregnancyStatus
            }
            onChange={(event) =>
              updateContext({
                pregnancyStatus:
                  event.target
                    .value,
              })
            }
            style={
              styles.input
            }
          >
            <option value="not_pregnant">
              Not pregnant
            </option>

            <option value="pregnant">
              Pregnant
            </option>
          </select>
        </label>

        <label
          style={styles.label}
        >
          Trimester

          <select
            disabled={
              isDisabled ||
              context.pregnancyStatus !==
                "pregnant"
            }
            value={
              context.trimester ||
              ""
            }
            onChange={(event) =>
              updateContext({
                trimester:
                  event.target
                    .value,
              })
            }
            style={
              styles.input
            }
          >
            <option value="">
              —
            </option>

            <option value="first">
              1st
            </option>

            <option value="second">
              2nd
            </option>

            <option value="third">
              3rd
            </option>
          </select>
        </label>

        <label
          style={styles.label}
        >
          Cycle phase

          <select
            disabled={
              isDisabled ||
              context.sex !==
                "female"
            }
            value={
              context.cyclePhase ||
              "unspecified"
            }
            onChange={(event) =>
              updateContext({
                cyclePhase:
                  event.target
                    .value,
              })
            }
            style={
              styles.input
            }
          >
            <option value="unspecified">
              Unspecified
            </option>

            <option value="day_3">
              Day 3
            </option>

            <option value="follicular">
              Follicular
            </option>

            <option value="ovulatory">
              Ovulatory
            </option>

            <option value="day_21">
              Day 21
            </option>

            <option value="luteal">
              Luteal
            </option>
          </select>
        </label>
      </div>

      {/* ====================================================
          RESULT TABLE
          ==================================================== */}

      <div
        className="pefa-hormonal-profile__table"
        style={
          styles.tableWrap
        }
      >
        <table
          style={styles.table}
        >
          <thead>
            <tr>
              <th
                style={styles.th}
              >
                Parameter
              </th>

              <th
                style={styles.th}
              >
                Result
              </th>

              <th
                style={styles.th}
              >
                Unit
              </th>

              <th
                style={styles.th}
              >
                Reference Range
              </th>

              <th
                style={styles.th}
              >
                Flag
              </th>

              <th
                style={styles.th}
              >
                Method
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    ...styles.td,
                    textAlign:
                      "center",
                    padding: 25,
                    color:
                      "#64748b",
                  }}
                >
                  No hormonal profile parameters were resolved.
                </td>
              </tr>
            ) : (
              rows.map(
                (row) => {
                  const locked =
                    isDisabled ||
                    row.calculated ||
                    row.readOnly;

                  const flag =
                    text(
                      row.flag
                    );

                  return (
                    <tr
                      key={
                        row.key
                      }
                    >
                      {/* PARAMETER */}

                      <td
                        style={
                          styles.td
                        }
                      >
                        <strong>
                          {row.name}
                        </strong>

                        {row.calculated && (
                          <span
                            style={
                              styles.calculatedText
                            }
                          >
                            CALCULATED
                          </span>
                        )}
                      </td>

                      {/* RESULT */}

                      <td
                        style={
                          styles.td
                        }
                      >
                        <input
                          type="text"
                          inputMode="decimal"
                          disabled={
                            locked
                          }
                          readOnly={
                            locked
                          }
                          value={
                            row.value ??
                            ""
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
                            ...(row.calculated
                              ? styles.calculated
                              : {}),
                          }}
                        />
                      </td>

                      {/* UNIT */}

                      <td
                        style={
                          styles.td
                        }
                      >
                        {row.unit ||
                          row.result_unit ||
                          row.reporting_unit ||
                          "—"}
                      </td>

                      {/* REFERENCE */}

                      <td
                        style={
                          styles.td
                        }
                      >
                        <input
                          disabled={
                            isDisabled
                          }
                          value={
                            row.manual_reference_range ||
                            row.reference_range ||
                            ""
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
                          title="Leave blank to use the automatic reference range"
                          style={
                            styles.input
                          }
                        />

                        {row.reference_source && (
                          <div
                            style={{
                              marginTop: 3,
                              fontSize: 8,
                              color:
                                "#94a3b8",
                            }}
                          >
                            Source:{" "}
                            {
                              row.reference_source
                            }
                          </div>
                        )}
                      </td>

                      {/* FLAG */}

                      <td
                        style={{
                          ...styles.td,
                          ...flagStyle(
                            flag
                          ),
                          textAlign:
                            "center",
                        }}
                      >
                        {flag ||
                          "—"}
                      </td>

                      {/* METHOD */}

                      <td
                        style={
                          styles.td
                        }
                      >
                        <input
                          disabled={
                            locked
                          }
                          value={
                            row.method ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateParameter(
                              row.key,
                              "method",
                              event
                                .target
                                .value
                            )
                          }
                          style={
                            styles.input
                          }
                        />
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ====================================================
          NOTES
          ==================================================== */}

      <div
        className="pefa-hormonal-profile__notes"
        style={styles.notes}
      >
        <label
          style={styles.label}
        >
          Interpretation

          <textarea
            disabled={
              isDisabled
            }
            value={
              effectiveInterpretation
            }
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  interpretation:
                    event
                      .target
                      .value,
                })
              )
            }
            style={
              styles.textarea
            }
          />
        </label>

        <label
          style={styles.label}
        >
          Comments

          <textarea
            disabled={
              isDisabled
            }
            value={
              form.comments ||
              ""
            }
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  comments:
                    event
                      .target
                      .value,
                })
              )
            }
            style={
              styles.textarea
            }
          />
        </label>
      </div>

      {/* ====================================================
          ACTIONS
          ==================================================== */}

      {!readOnly && (
        <div
          className="pefa-hormonal-profile__actions"
          style={
            styles.actions
          }
        >
          {typeof onBack ===
            "function" && (
            <button
              type="button"
              disabled={
                disabled
              }
              onClick={
                onBack
              }
              style={
                styles.button
              }
            >
              Back
            </button>
          )}

          {typeof onCancel ===
            "function" && (
            <button
              type="button"
              disabled={
                disabled
              }
              onClick={
                onCancel
              }
              style={
                styles.button
              }
            >
              Cancel
            </button>
          )}

          {(
            typeof onSave ===
              "function" ||
            typeof onSaved ===
              "function"
          ) && (
            <button
              type="button"
              disabled={
                disabled
              }
              onClick={
                save
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
  );
}