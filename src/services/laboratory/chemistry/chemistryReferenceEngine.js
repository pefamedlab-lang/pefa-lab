/* ==========================================================
   PEFA LAB
   CHEMISTRY REFERENCE ENGINE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Central reference-range resolver for Clinical Chemistry.

   RESPONSIBILITIES
   ----------------------------------------------------------
   1. Resolve patient age.
   2. Resolve patient sex.
   3. Resolve age/sex-specific reference ranges.
   4. Resolve general reference ranges.
   5. Resolve nested master-test metadata.
   6. Resolve test-level metadata.
   7. Parse supported range formats.
   8. Apply explicitly configured PEFA local overrides.
   9. NEVER invent an unconfigured reference range.

   IMPORTANT
   ----------------------------------------------------------
   Master-test/database metadata remains authoritative UNLESS
   an explicit PEFA local override is configured below.

   CURRENT PEFA LOCAL OVERRIDE
   ----------------------------------------------------------
   FBS / Fasting Blood Sugar / Fasting Blood Glucose /
   FBS (GLUCOMETER) / Fasting Blood Glucose (GLUCOMETER)

      70 - 110 mg/dL

   This is an explicit PEFA laboratory configuration, not a
   generic clinical range. It therefore intentionally takes
   precedence over an old database/master-test value such as
   70 - 99 mg/dL.

   IMPORTANT:
   ----------------------------------------------------------
   The same FBS range must be used for flag calculation.
   ========================================================== */


/* ==========================================================
   NUMBER
   ========================================================== */

const toNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const number = Number(
    String(value)
      .replace(/,/g, "")
      .trim()
  );

  return Number.isFinite(number) ? number : null;
};


/* ==========================================================
   NORMALIZE TEXT
   ========================================================== */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/[()]/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();


/* ==========================================================
   FIRST VALUE
   ========================================================== */

const firstValue = (...values) => {
  for (const value of values) {
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


/* ==========================================================
   TEST NAME EXTRACTION
   ========================================================== */

const getTestIdentityValues = (
  parameter = {},
  test = {}
) => {
  const values = [
    parameter?.key,
    parameter?.code,
    parameter?.test_code,
    parameter?.testCode,
    parameter?.test_name,
    parameter?.testName,
    parameter?.name,
    parameter?.parameter_name,
    parameter?.parameterName,
    parameter?.service_name,

    parameter?.masterTest?.test_name,
    parameter?.masterTest?.testName,
    parameter?.masterTest?.name,
    parameter?.masterTest?.code,

    parameter?.master_test?.test_name,
    parameter?.master_test?.testName,
    parameter?.master_test?.name,
    parameter?.master_test?.code,

    parameter?.test?.test_name,
    parameter?.test?.testName,
    parameter?.test?.name,
    parameter?.test?.code,

    test?.key,
    test?.code,
    test?.test_code,
    test?.testCode,
    test?.test_name,
    test?.testName,
    test?.name,
    test?.service_name,

    test?.masterTest?.test_name,
    test?.masterTest?.testName,
    test?.masterTest?.name,
    test?.masterTest?.code,

    test?.master_test?.test_name,
    test?.master_test?.testName,
    test?.master_test?.name,
    test?.master_test?.code,
  ];

  return values
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    )
    .map(normalize);
};


/* ==========================================================
   PEFA FBS LOCAL OVERRIDE
   ----------------------------------------------------------
   IMPORTANT:
   This is deliberately BEFORE database/master-test metadata.
   Therefore a database value of 70 - 99 mg/dL cannot override
   the PEFA-configured 70 - 110 mg/dL interval.
   ========================================================== */

export const isPEFAFBS = (
  parameter = {},
  test = {}
) => {
  const identities =
    getTestIdentityValues(
      parameter,
      test
    );

  return identities.some((name) => {
    if (!name) return false;

    return (
      name === "fbs" ||
      name === "fbs glucometer" ||
      name === "fasting blood sugar" ||
      name === "fasting blood sugar glucometer" ||
      name === "fasting blood glucose" ||
      name === "fasting blood glucose glucometer" ||
      name === "fasting plasma glucose"
    );
  });
};

export const PEFA_FBS_REFERENCE_RANGE = Object.freeze({
  low: 70,
  high: 110,
  display: "70 - 110 mg/dL",
  referenceRange: "70 - 110 mg/dL",
  reference_range: "70 - 110 mg/dL",
  unit: "mg/dL",
  source: "PEFA laboratory configuration",
});


/* ==========================================================
   PARSE REFERENCE RANGE
   ========================================================== */

export const parseRange = (raw) => {
  if (
    raw === null ||
    raw === undefined ||
    raw === ""
  ) {
    return null;
  }


  /* --------------------------------------------------------
     Already parsed range
     -------------------------------------------------------- */

  if (
    typeof raw === "object" &&
    !Array.isArray(raw)
  ) {
    const low =
      toNumber(
        raw.low ??
        raw.min ??
        raw.lower ??
        raw.lowValue ??
        raw.minimum
      );

    const high =
      toNumber(
        raw.high ??
        raw.max ??
        raw.upper ??
        raw.highValue ??
        raw.maximum
      );

    if (
      low !== null &&
      high !== null
    ) {
      return {
        low,
        high,

        display:
          firstValue(
            raw.display,
            raw.reference_range,
            raw.referenceRange,
            `${low}–${high}`
          ),
      };
    }

    if (
      raw.range &&
      typeof raw.range === "object"
    ) {
      return parseRange(raw.range);
    }

    if (
      raw.range &&
      typeof raw.range === "string"
    ) {
      return parseRange(raw.range);
    }
  }


  /* --------------------------------------------------------
     String range
     -------------------------------------------------------- */

  const rangeText =
    String(raw).trim();

  if (!rangeText) {
    return null;
  }

  const numbers =
    rangeText.match(
      /-?\d+(?:\.\d+)?/g
    );

  if (
    !numbers ||
    numbers.length < 2
  ) {
    return null;
  }

  const low =
    Number(numbers[0]);

  const high =
    Number(numbers[1]);

  if (
    !Number.isFinite(low) ||
    !Number.isFinite(high)
  ) {
    return null;
  }

  return {
    low,
    high,
    display: rangeText,
  };
};


/* ==========================================================
   AGE
   ========================================================== */

export const getAgeYears = (
  patient = {}
) => {
  const direct =
    toNumber(
      patient.age_years ??
      patient.ageYears
    );

  if (direct !== null) {
    return direct;
  }

  const age =
    toNumber(
      patient.age
    );

  if (age === null) {
    return null;
  }

  const unit =
    normalize(
      patient.age_unit ??
      patient.ageUnit ??
      "years"
    );

  if (
    unit.startsWith("month")
  ) {
    return age / 12;
  }

  if (
    unit.startsWith("week")
  ) {
    return age / 52.1775;
  }

  if (
    unit.startsWith("day")
  ) {
    return age / 365.25;
  }

  return age;
};


/* ==========================================================
   SEX
   ========================================================== */

export const getSex = (
  patient = {}
) => {
  const sex =
    normalize(
      patient.sex ??
      patient.gender ??
      patient.patient_sex ??
      patient.patientSex
    );

  if (
    sex === "m" ||
    sex.startsWith("male")
  ) {
    return "male";
  }

  if (
    sex === "f" ||
    sex.startsWith("female")
  ) {
    return "female";
  }

  return "";
};


/* ==========================================================
   METADATA SOURCES
   ========================================================== */

const getMetadataSources = (
  parameter = {},
  test = {}
) => {
  const sources = [];

  const add = (value) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      if (!sources.includes(value)) {
        sources.push(value);
      }
    }
  };

  add(parameter);

  add(parameter.masterTest);
  add(parameter.master_test);
  add(parameter.masterTestData);
  add(parameter.master_test_data);
  add(parameter.test);
  add(parameter.testData);

  add(test);

  add(test.masterTest);
  add(test.master_test);
  add(test.masterTestData);
  add(test.master_test_data);

  return sources;
};


/* ==========================================================
   METADATA FIELD
   ========================================================== */

const getMetadataField = (
  parameter,
  test,
  ...keys
) => {
  const sources =
    getMetadataSources(
      parameter,
      test
    );

  for (
    const source of sources
  ) {
    for (
      const key of keys
    ) {
      const value =
        source?.[key];

      if (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }
  }

  return "";
};


/* ==========================================================
   ADD CANDIDATE
   ========================================================== */

const addCandidate = (
  candidates,
  value,
  source
) => {
  if (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
  ) {
    candidates.push({
      value,
      source,
    });
  }
};


/* ==========================================================
   RESOLVE CHEMISTRY REFERENCE
   ========================================================== */

export const resolveChemistryReference = ({
  parameter = {},
  patient = {},
  registration = {},
  test = {},
  defaultRange = null,
} = {}) => {

  /*
   * registration is intentionally retained in the API.
   * Some future reference rules may use it.
   */
  void registration;


  const age =
    getAgeYears(patient);

  const sex =
    getSex(patient);


  /* ========================================================
     PEFA LOCAL OVERRIDE — HIGHEST PRIORITY
     ======================================================== */

  if (
    isPEFAFBS(
      parameter,
      test
    )
  ) {
    return {
      low:
        PEFA_FBS_REFERENCE_RANGE.low,

      high:
        PEFA_FBS_REFERENCE_RANGE.high,

      display:
        PEFA_FBS_REFERENCE_RANGE.display,

      referenceRange:
        PEFA_FBS_REFERENCE_RANGE.referenceRange,

      reference_range:
        PEFA_FBS_REFERENCE_RANGE.reference_range,

      unit:
        PEFA_FBS_REFERENCE_RANGE.unit,

      sex,

      ageYears:
        age,

      source:
        PEFA_FBS_REFERENCE_RANGE.source,

      criticalLow:
        toNumber(
          getMetadataField(
            parameter,
            test,
            "critical_low",
            "criticalLow"
          )
        ),

      criticalHigh:
        toNumber(
          getMetadataField(
            parameter,
            test,
            "critical_high",
            "criticalHigh"
          )
        ),

      isPEFAOverride: true,
    };
  }


  const candidates = [];


  /* ========================================================
     PATIENT-SPECIFIC RANGE
     ======================================================== */

  if (
    sex === "male"
  ) {
    addCandidate(
      candidates,

      getMetadataField(
        parameter,
        test,
        "male_range",
        "maleRange",
        "male_reference_range",
        "maleReferenceRange"
      ),

      "male_range"
    );
  }


  if (
    sex === "female"
  ) {
    addCandidate(
      candidates,

      getMetadataField(
        parameter,
        test,
        "female_range",
        "femaleRange",
        "female_reference_range",
        "femaleReferenceRange"
      ),

      "female_range"
    );
  }


  /* ========================================================
     CHILD RANGE
     ======================================================== */

  if (
    age !== null &&
    age < 18
  ) {
    addCandidate(
      candidates,

      getMetadataField(
        parameter,
        test,
        "child_range",
        "childRange",
        "paediatric_range",
        "pediatric_range",
        "child_reference_range",
        "childReferenceRange"
      ),

      "child_range"
    );
  }


  /* ========================================================
     ELDERLY RANGE
     ======================================================== */

  if (
    age !== null &&
    age >= 60
  ) {
    addCandidate(
      candidates,

      getMetadataField(
        parameter,
        test,
        "elderly_range",
        "elderlyRange",
        "geriatric_range",
        "geriatricRange",
        "elderly_reference_range",
        "elderlyReferenceRange"
      ),

      "elderly_range"
    );
  }


  /* ========================================================
     GENERAL RANGE
     ======================================================== */

  addCandidate(
    candidates,

    getMetadataField(
      parameter,
      test,
      "reference_range",
      "referenceRange"
    ),

    "reference_range"
  );


  addCandidate(
    candidates,

    getMetadataField(
      parameter,
      test,
      "reference_value",
      "referenceValue"
    ),

    "reference_value"
  );


  /* ========================================================
     EXPLICIT TEST FALLBACK
     ======================================================== */

  addCandidate(
    candidates,
    test?.reference_range,
    "test.reference_range"
  );

  addCandidate(
    candidates,
    test?.referenceRange,
    "test.referenceRange"
  );

  addCandidate(
    candidates,
    test?.reference_value,
    "test.reference_value"
  );

  addCandidate(
    candidates,
    test?.referenceValue,
    "test.referenceValue"
  );


  /* ========================================================
     EXPLICIT CALLER FALLBACK
     ======================================================== */

  addCandidate(
    candidates,
    defaultRange,
    "defaultRange"
  );


  /* ========================================================
     PARSE
     ======================================================== */

  for (
    const candidate of candidates
  ) {
    const parsed =
      parseRange(
        candidate.value
      );

    if (
      parsed
    ) {
      return {
        ...parsed,

        referenceRange:
          parsed.display,

        reference_range:
          parsed.display,

        display:
          parsed.display,

        sex,

        ageYears:
          age,

        source:
          candidate.source,

        criticalLow:
          toNumber(
            getMetadataField(
              parameter,
              test,
              "critical_low",
              "criticalLow"
            )
          ),

        criticalHigh:
          toNumber(
            getMetadataField(
              parameter,
              test,
              "critical_high",
              "criticalHigh"
            )
          ),

        isPEFAOverride: false,
      };
    }
  }


  /* ========================================================
     UNRESOLVED
     ======================================================== */

  return {
    low: null,

    high: null,

    display: "",

    referenceRange: "",

    reference_range: "",

    sex,

    ageYears:
      age,

    source:
      "unresolved",

    criticalLow:
      toNumber(
        getMetadataField(
          parameter,
          test,
          "critical_low",
          "criticalLow"
        )
      ),

    criticalHigh:
      toNumber(
        getMetadataField(
          parameter,
          test,
          "critical_high",
          "criticalHigh"
        )
      ),

    isPEFAOverride: false,
  };
};

export default resolveChemistryReference;
