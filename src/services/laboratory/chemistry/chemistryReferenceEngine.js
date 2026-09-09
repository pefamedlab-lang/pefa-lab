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
   8. NEVER invent a reference range.

   IMPORTANT
   ----------------------------------------------------------
   The database/master-test metadata remains authoritative.

   Supported metadata may exist directly on the parameter:

      parameter.male_range
      parameter.female_range
      parameter.child_range
      parameter.elderly_range
      parameter.reference_value
      parameter.reference_range

   Or inside nested objects:

      parameter.masterTest
      parameter.master_test
      parameter.test
      parameter.testData

   Example:

      {
        test_name: "Urea",
        masterTest: {
          male_range: "2.5 - 7.1",
          female_range: "2.5 - 7.1"
        }
      }

   NO HARDCODED CLINICAL RANGES.
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

  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const number = Number(
    String(value)
      .replace(/,/g, "")
      .trim()
  );

  return Number.isFinite(number)
    ? number
    : null;
};


/* ==========================================================
   NORMALIZE TEXT
   ========================================================== */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");


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
   PARSE REFERENCE RANGE
   ----------------------------------------------------------
   Supported:

      2.5 - 7.1
      2.5–7.1
      2.5 — 7.1
      2.5 to 7.1
      2.5 - 7.1 mmol/L

   Also supports:

      {
        low: 2.5,
        high: 7.1
      }

   And:

      {
        min: 2.5,
        max: 7.1
      }
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

    /*
     * Some systems store a nested range object.
     */
    if (
      raw.range &&
      typeof raw.range === "object"
    ) {
      return parseRange(
        raw.range
      );
    }

    if (
      raw.range &&
      typeof raw.range === "string"
    ) {
      return parseRange(
        raw.range
      );
    }
  }


  /* --------------------------------------------------------
     String range
     -------------------------------------------------------- */

  const text =
    String(raw).trim();

  if (!text) {
    return null;
  }


  /*
   * Extract numeric values.

   * 2.5 - 7.1
   * 2.5–7.1
   * 2.5 to 7.1
   * 2.5 — 7.1
   */
  const numbers =
    text.match(
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
    display: text,
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
   ----------------------------------------------------------
   We deliberately inspect nested master-test objects.

   This is important because panel parameters may arrive as:

      {
        name: "Urea",
        masterTest: {
          test_name: "Urea",
          male_range: "...",
          female_range: "..."
        }
      }

   rather than carrying the metadata directly.
   ========================================================== */

const getMetadataSources = (
  parameter = {},
  test = {}
) => {
  const sources = [];

  const add =
    (value) => {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        if (
          !sources.includes(value)
        ) {
          sources.push(value);
        }
      }
    };


  /* Parameter itself */

  add(parameter);


  /* Nested parameter metadata */

  add(
    parameter.masterTest
  );

  add(
    parameter.master_test
  );

  add(
    parameter.masterTestData
  );

  add(
    parameter.master_test_data
  );

  add(
    parameter.test
  );

  add(
    parameter.testData
  );


  /* Test itself */

  add(test);


  /* Nested test metadata */

  add(
    test.masterTest
  );

  add(
    test.master_test
  );

  add(
    test.masterTestData
  );

  add(
    test.master_test_data
  );


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
    getAgeYears(
      patient
    );

  const sex =
    getSex(
      patient
    );


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
  };
};