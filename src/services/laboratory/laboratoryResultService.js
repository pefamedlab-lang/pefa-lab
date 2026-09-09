/* ==========================================================
   PEFA LAB
   LABORATORY RESULT SERVICE
   ----------------------------------------------------------
   PATH:
   src/services/laboratory/laboratoryResultService.js

   PURPOSE
   ----------------------------------------------------------
   Authoritative read/update service for:

       laboratory_results

   ARCHITECTURE

       Registration Portal
              ↓
       LaboratoryResultEntry
              ↓
       laboratory_results
              ↓
       this service
              ↓
       LaboratoryResultDashboard
              ↓
       Dedicated result form / resolver

   IMPORTANT
   ----------------------------------------------------------
   The `result` column is NEVER flattened here.

   Structured results remain structured.

   Examples:

   Malaria:
       {
         parasite_seen,
         parasite_form,
         species,
         density,
         parasite_count,
         interpretation
       }

   Urinalysis:
       {
         physical,
         chemical,
         microscopy,
         ...
       }

   Panel:
       {
         ...
       }

   Quantitative:
       scalar / quantitative value

   The dashboard decides how the result is rendered.
   ========================================================== */

import { supabase } from "../../supabase";


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const text = (value) =>
  String(value ?? "").trim();


const normalizeText = (value) =>
  text(value)
    .replace(/\s+/g, " ")
    .toLowerCase();


const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      text(value) !== ""
    ) {
      return value;
    }
  }

  return "";
};


const toNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};


/* ==========================================================
   TEST HELPERS
   ========================================================== */

export function getTestName(test = {}) {
  return firstValue(
    test?.test_name,
    test?.testName,
    test?.name,
    test?.test,
    test?.service_name,
    test?.serviceName,
    test?.masterTest?.test_name,
    test?.master_test?.test_name,
    test?.masterTest?.name,
    test?.master_test?.name,
    "Laboratory Test"
  );
}


export function getPanelName(test = {}) {
  return firstValue(
    test?.panel_name,
    test?.panelName,
    test?.masterTest?.panel_name,
    test?.master_test?.panel_name,
    ""
  );
}


export function getDepartment(test = {}) {
  return firstValue(
    test?.department,
    test?.masterTest?.department,
    test?.master_test?.department,
    test?.category,
    test?.result_category,
    "Laboratory"
  );
}


export function getCategory(test = {}) {
  return firstValue(
    test?.category,
    test?.result_category,
    test?.masterTest?.category,
    test?.master_test?.category,
    ""
  );
}


export function getTestType(test = {}) {
  return firstValue(
    test?.test_type,
    test?.testType,
    test?.masterTest?.test_type,
    test?.master_test?.test_type,
    ""
  );
}


export function getResultType(test = {}) {
  return firstValue(
    test?.result_type,
    test?.resultType,
    test?.masterTest?.result_type,
    test?.master_test?.result_type,
    ""
  );
}


export function getSpecimen(test = {}) {
  return firstValue(
    test?.specimen,
    test?.specimen_type,
    test?.masterTest?.specimen,
    test?.master_test?.specimen,
    ""
  );
}


export function getMasterTestId(test = {}) {
  return (
    test?.master_test_id ??
    test?.masterTestId ??
    test?.masterTest?.id ??
    test?.master_test?.id ??
    test?.test_id ??
    null
  );
}


/* ==========================================================
   PATIENT / REGISTRATION HELPERS
   ========================================================== */

export function getLabNumber(row = {}) {
  return firstValue(
    row?.lab_number,
    row?.labNumber,
    row?.registration?.lab_number,
    row?.registration?.labNumber,
    ""
  );
}


export function getRegistrationId(row = {}) {
  return firstValue(
    row?.registration_id,
    row?.registrationId,
    row?.registration?.id,
    null
  );
}


export function getPatientName(row = {}) {
  return firstValue(
    row?.registration?.full_name,
    row?.registration?.patient_name,
    row?.patient_name,
    row?.patientName,
    row?.full_name,
    "Unknown Patient"
  );
}


/* ==========================================================
   REGISTRATION DEMOGRAPHIC ENRICHMENT
   ----------------------------------------------------------
   Registration Records is authoritative for patient demographics.
   laboratory_results remains authoritative for the actual result
   payload. This helper only enriches returned objects; it does not
   modify database rows.
   ========================================================== */

async function enrichResultsWithRegistrations(results = [], preferredRegistration = null) {
  if (!Array.isArray(results) || !results.length) return [];

  const registrationMap = new Map();

  if (preferredRegistration?.id !== undefined && preferredRegistration?.id !== null) {
    registrationMap.set(String(preferredRegistration.id), preferredRegistration);
  }

  const registrationIds = [
    ...new Set(
      results
        .map((row) => getRegistrationId(row))
        .filter((id) => id !== null && id !== undefined && text(id) !== "")
        .map((id) => String(id))
    ),
  ];

  const missingIds = registrationIds.filter((id) => !registrationMap.has(id));

  if (missingIds.length) {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .in("id", missingIds);

    if (error) {
      console.warn("[laboratoryResultService] Registration lookup by ID failed:", error);
    } else if (Array.isArray(data)) {
      data.forEach((registration) => {
        if (registration?.id !== undefined && registration?.id !== null) {
          registrationMap.set(String(registration.id), registration);
        }
      });
    }
  }

  const labNumbers = [
    ...new Set(
      results
        .map((row) => getLabNumber(row))
        .filter((value) => text(value) !== "")
        .map((value) => String(value))
    ),
  ];

  const labRegistrationMap = new Map();

  if (labNumbers.length) {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .in("lab_number", labNumbers)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[laboratoryResultService] Registration lookup by lab_number failed:", error);
    } else if (Array.isArray(data)) {
      for (const registration of data) {
        const key = text(registration?.lab_number);
        if (key && !labRegistrationMap.has(key)) {
          labRegistrationMap.set(key, registration);
        }
      }
    }
  }

  return results.map((row) => {
    const registrationId = getRegistrationId(row);
    const registration =
      (registrationId !== null && registrationId !== undefined
        ? registrationMap.get(String(registrationId))
        : null) ||
      labRegistrationMap.get(String(getLabNumber(row))) ||
      null;

    if (!registration) return row;

    return {
      ...row,
      patient_name: firstValue(
        registration?.full_name,
        registration?.patient_name,
        row?.patient_name,
        row?.patientName,
        row?.full_name,
        null
      ),
      full_name: firstValue(
        registration?.full_name,
        registration?.patient_name,
        row?.full_name,
        row?.patient_name,
        null
      ),
      patient_id: firstValue(
        registration?.patient_id,
        registration?.patientId,
        row?.patient_id,
        null
      ),
      sex: firstValue(
        registration?.sex,
        registration?.gender,
        row?.sex,
        row?.gender,
        null
      ),
      gender: firstValue(
        registration?.sex,
        registration?.gender,
        row?.gender,
        row?.sex,
        null
      ),
      age: registration?.age ?? registration?.patient_age ?? row?.age ?? null,
      date_of_birth: firstValue(
        registration?.date_of_birth,
        registration?.dob,
        row?.date_of_birth,
        row?.dob,
        null
      ),
      branch: firstValue(registration?.branch, row?.branch, null),
      referral_hospital: firstValue(
        registration?.referral_hospital,
        registration?.referral_name,
        row?.referral_hospital,
        row?.referral_name,
        null
      ),
      referral_name: firstValue(
        registration?.referral_name,
        registration?.referral_hospital,
        row?.referral_name,
        row?.referral_hospital,
        null
      ),
      referring_doctor: firstValue(
        registration?.referring_doctor,
        registration?.referral_doctor,
        row?.referring_doctor,
        row?.referral_doctor,
        null
      ),
      referral_doctor: firstValue(
        registration?.referral_doctor,
        registration?.referring_doctor,
        row?.referral_doctor,
        row?.referring_doctor,
        null
      ),
      clinical_history: firstValue(
        registration?.clinical_history,
        registration?.clinicalHistory,
        row?.clinical_history,
        row?.clinicalHistory,
        null
      ),
      registration: {
        ...(row?.registration || {}),
        ...registration,
      },
    };
  });
}


/* ==========================================================
   RESULT OBJECT HELPERS
   ========================================================== */

/*
 * IMPORTANT:
 *
 * This function intentionally does NOT flatten objects.
 *
 * It only determines whether the stored result is structured.
 */

export function isStructuredResult(result) {
  return (
    result !== null &&
    typeof result === "object" &&
    !Array.isArray(result)
  );
}


export function getRawResultValue(row = {}) {
  return row?.result;
}


/* ==========================================================
   SPECIAL TEST NAME DETECTION
   ----------------------------------------------------------
   Lightweight detection only.

   Dedicated resolvers remain responsible for actual
   component selection.
   ========================================================== */

const SPECIAL_NAME_PATTERNS = [
  "malaria parasite",
  "malaria microscopy",
  "microscopy",
  "routine urinalysis",
  "urinalysis",
  "urine routine examination",
  "routine urine examination",
  "stool analysis",
  "stool mcs",
  "semen analysis",
  "seminal fluid analysis",
  "sfa",
  "blood culture",
  "blood mcs",
  "widal",
  "drug abuse",
  "drugs of abuse",
  "hepatitis b panel",
  "hepatitis b profile",
  "hepatitis b screen",
  "hbv panel",
  "hbv profile",
  "abo blood group",
  "abo group",
  "blood group and rhesus",
  "blood group rhesus",
  "abo rhesus",
];


const QUALITATIVE_NAME_PATTERNS = [
  "hbsag",
  "hepatitis b surface antigen",
  "hiv",
  "hcv",
  "vdrl",
  "pregnancy test",
  "pregnancy",
  "syphilis",
];


function matchesAnyPattern(
  name,
  patterns
) {
  const normalized =
    normalizeText(name);

  return patterns.some(
    (pattern) =>
      normalized === pattern ||
      normalized.includes(pattern)
  );
}


export function isSpecialTest(test = {}) {
  const name =
    getTestName(test);

  return matchesAnyPattern(
    name,
    SPECIAL_NAME_PATTERNS
  );
}


export function isQualitativeTest(test = {}) {
  const name =
    getTestName(test);

  const resultType =
    normalizeText(
      getResultType(test)
    );

  if (
    resultType.includes("qualitative") ||
    resultType.includes("positive") ||
    resultType.includes("negative")
  ) {
    return true;
  }

  return matchesAnyPattern(
    name,
    QUALITATIVE_NAME_PATTERNS
  );
}


/* ==========================================================
   PANEL DETECTION
   ========================================================== */

export function isPanelTest(test = {}) {
  const testType =
    normalizeText(
      getTestType(test)
    );

  const panelName =
    text(getPanelName(test));

  const explicitPanel =
    test?.is_panel === true ||
    test?.isPanel === true ||
    Boolean(panelName);

  if (explicitPanel) {
    return true;
  }

  return (
    testType.includes("panel") ||
    testType.includes("profile") ||
    testType.includes("package")
  );
}


/* ==========================================================
   ROUTINE URINALYSIS
   ========================================================== */

export function isRoutineUrinalysis(
  test = {}
) {
  const name =
    normalizeText(
      getTestName(test)
    );

  return (
    name === "routine urinalysis" ||
    name.includes("routine urinalysis") ||
    name.includes("urinalysis") ||
    name.includes("urine routine examination") ||
    name.includes("routine urine examination")
  );
}


/* ==========================================================
   QUANTITATIVE SINGLE TEST
   ========================================================== */

export function isQuantitativeSingleTest(
  test = {}
) {
  if (
    isSpecialTest(test) ||
    isRoutineUrinalysis(test) ||
    isPanelTest(test)
  ) {
    return false;
  }

  const resultType =
    normalizeText(
      getResultType(test)
    );

  const testType =
    normalizeText(
      getTestType(test)
    );

  if (
    resultType.includes("quantitative") ||
    resultType.includes("numeric") ||
    resultType.includes("number")
  ) {
    return true;
  }

  if (
    test?.unit ||
    test?.units ||
    test?.reference_range ||
    test?.referenceRange
  ) {
    return true;
  }

  return (
    testType.includes("quantitative") ||
    testType.includes("numeric")
  );
}


/* ==========================================================
   RESULT PRESENTATION TYPE
   ----------------------------------------------------------
   Metadata only.

   This does NOT render or transform the result.
   ========================================================== */

export function getResultPresentationType(
  test = {}
) {
  if (
    isRoutineUrinalysis(test)
  ) {
    return "routine_urinalysis";
  }

  if (
    isSpecialTest(test)
  ) {
    return "special";
  }

  if (
    isPanelTest(test)
  ) {
    return "panel";
  }

  if (
    isQualitativeTest(test)
  ) {
    return "qualitative";
  }

  if (
    isQuantitativeSingleTest(test)
  ) {
    return "quantitative";
  }

  return "unmapped";
}


/* ==========================================================
   RESULT GROUP KEY
   ========================================================== */

/*
 * GROUPING RULE
 *
 * Same Lab Number + same Department:
 *
 *   ordinary singles → same group
 *
 * But:
 *
 *   Panel A ≠ Panel B
 *   Special A ≠ Special B
 *   Different departments ≠ same group
 *
 * This groups ordinary tests without destroying their
 * individual dedicated result presentation.
 */

export function getResultGroupKey(
  row = {}
) {
  const labNumber =
    normalizeText(
      getLabNumber(row)
    ) ||
    "no-lab-number";

  const department =
    normalizeText(
      getDepartment(row)
    ) ||
    "laboratory";

  const test =
    row?.masterTest ||
    row?.master_test ||
    row;

  const presentation =
    getResultPresentationType(test);


  /* --------------------------------------------------------
     PANEL
     -------------------------------------------------------- */

  if (
    presentation === "panel"
  ) {
    const panelName =
      normalizeText(
        getPanelName(test)
      ) ||
      normalizeText(
        getTestName(test)
      ) ||
      `panel-${row?.test_id ?? row?.id}`;

    return [
      labNumber,
      department,
      "panel",
      panelName,
    ].join("::");
  }


  /* --------------------------------------------------------
     SPECIAL / URINALYSIS
     -------------------------------------------------------- */

  if (
    presentation === "special" ||
    presentation === "routine_urinalysis"
  ) {
    return [
      labNumber,
      department,
      presentation,
      normalizeText(
        getTestName(test)
      ),
    ].join("::");
  }


  /* --------------------------------------------------------
     ORDINARY SINGLE TESTS
     -------------------------------------------------------- */

  return [
    labNumber,
    department,
    "department-results",
  ].join("::");
}


/* ==========================================================
   NORMALIZE RESULT ROW
   ========================================================== */

export function normalizeLaboratoryResult(
  row = {}
) {
  const masterTest =
    row?.masterTest ||
    row?.master_test ||
    null;

  const mergedTest = {
    ...(masterTest || {}),
    ...row,
  };

  const presentationType =
    getResultPresentationType(
      mergedTest
    );

  return {
    ...row,

    /*
     * AUTHORITATIVE DATABASE ID
     */
    id: row?.id,

    /*
     * ORIGINAL RESULT
     *
     * NEVER flatten.
     */
    result: row?.result,

    /*
     * TEST METADATA
     */
    masterTest,

    master_test:
      row?.master_test ||
      masterTest,

    /*
     * PRESENTATION METADATA
     */
    presentation_type:
      presentationType,

    result_form_key:
      presentationType,

    result_group_key:
      getResultGroupKey({
        ...row,
        masterTest,
      }),

    /*
     * NORMALIZED TEST FIELDS
     */
    test_name:
      firstValue(
        row?.test_name,
        masterTest?.test_name,
        "Laboratory Test"
      ),

    department:
      getDepartment({
        ...row,
        masterTest,
      }),

    category:
      getCategory({
        ...row,
        masterTest,
      }),

    panel_name:
      getPanelName({
        ...row,
        masterTest,
      }),

    test_type:
      getTestType({
        ...row,
        masterTest,
      }),

    result_type:
      getResultType({
        ...row,
        masterTest,
      }),

    specimen:
      getSpecimen({
        ...row,
        masterTest,
      }),

    master_test_id:
      getMasterTestId({
        ...row,
        masterTest,
      }),
  };
}


/* ==========================================================
   MASTER TEST RESOLUTION
   ========================================================== */

export async function getMasterTest(
  testId
) {
  const numericId =
    toNumber(testId);

  if (numericId === null) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    console.warn(
      "[laboratoryResultService] master_tests lookup failed:",
      error
    );

    return null;
  }

  return data || null;
}


/* ==========================================================
   COMPATIBILITY: GET MASTER TESTS BY IDS
   ========================================================== */

export async function getMasterTestsByIds(
  testIds = []
) {
  const ids = [
    ...new Set(
      testIds
        .map(toNumber)
        .filter(
          (id) => id !== null
        )
    ),
  ];

  if (!ids.length) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .in("id", ids);

  if (error) {
    console.warn(
      "[laboratoryResultService] getMasterTestsByIds failed:",
      error
    );

    return [];
  }

  return Array.isArray(data)
    ? data
    : [];
}


/* ==========================================================
   MASTER TEST BY NAME
   ========================================================== */

export async function getMasterTestByName(
  testName
) {
  if (!testName) {
    return null;
  }

  const name =
    text(testName);

  if (!name) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .ilike(
      "test_name",
      name
    );

  if (error) {
    console.warn(
      "[laboratoryResultService] getMasterTestByName failed:",
      error
    );

    return null;
  }

  if (
    !Array.isArray(data) ||
    !data.length
  ) {
    return null;
  }

  const normalizedName =
    normalizeText(name);

  return (
    data.find(
      (test) =>
        normalizeText(
          test?.test_name
        ) === normalizedName
    ) ||
    data[0]
  );
}


/* ==========================================================
   PANEL MEMBERSHIP BY TEST IDS
   ========================================================== */

export async function getPanelTestsByTestIds(
  testIds = []
) {
  const ids = [
    ...new Set(
      testIds
        .map(toNumber)
        .filter(
          (id) => id !== null
        )
    ),
  ];

  if (!ids.length) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("panel_tests")
    .select(`
      id,
      panel_id,
      test_id,
      display_order
    `)
    .in(
      "test_id",
      ids
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    );

  if (error) {
    console.warn(
      "[laboratoryResultService] panel_tests lookup failed:",
      error
    );

    return [];
  }

  return Array.isArray(data)
    ? data
    : [];
}


/* ==========================================================
   PANEL MEMBERS BY PANEL ID
   ========================================================== */

export async function getPanelTests(
  panelId
) {
  const numericId =
    toNumber(panelId);

  if (numericId === null) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("panel_tests")
    .select(`
      id,
      panel_id,
      test_id,
      display_order
    `)
    .eq(
      "panel_id",
      numericId
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    );

  if (error) {
    console.warn(
      "[laboratoryResultService] getPanelTests failed:",
      error
    );

    return [];
  }

  return Array.isArray(data)
    ? data
    : [];
}


/* ==========================================================
   RESOLVE SINGLE RESULT
   ========================================================== */

export async function resolveLaboratoryResult(
  result
) {
  if (!result) {
    return null;
  }

  let masterTest =
    result?.masterTest ||
    result?.master_test ||
    null;


  /* --------------------------------------------------------
     RESOLVE BY TEST ID
     -------------------------------------------------------- */

  if (!masterTest) {
    const testId =
      getMasterTestId(result);

    if (toNumber(testId) !== null) {
      masterTest =
        await getMasterTest(
          testId
        );
    }
  }


  /* --------------------------------------------------------
     FALLBACK TO TEST NAME
     -------------------------------------------------------- */

  if (
    !masterTest &&
    result?.test_name
  ) {
    masterTest =
      await getMasterTestByName(
        result.test_name
      );
  }


  /* --------------------------------------------------------
     PANEL MEMBERSHIP
     -------------------------------------------------------- */

  let panelTests = [];

  if (masterTest?.id) {
    panelTests =
      await getPanelTestsByTestIds([
        masterTest.id,
      ]);
  }


  return normalizeLaboratoryResult({
    ...result,

    masterTest,

    panelTests,
  });
}


/* ==========================================================
   LOAD MASTER TESTS IN BATCH
   ========================================================== */

async function loadMasterTests(
  results = []
) {
  const ids = [
    ...new Set(
      results
        .map(
          (row) =>
            getMasterTestId(row)
        )
        .map(toNumber)
        .filter(
          (id) => id !== null
        )
    ),
  ];

  if (!ids.length) {
    return new Map();
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .in("id", ids);

  if (error) {
    console.warn(
      "[laboratoryResultService] Batch master_tests lookup failed:",
      error
    );

    return new Map();
  }

  return new Map(
    (
      Array.isArray(data)
        ? data
        : []
    ).map(
      (test) => [
        Number(test.id),
        test,
      ]
    )
  );
}


/* ==========================================================
   GET ALL LABORATORY RESULTS
   ========================================================== */

export async function getLaboratoryResults(
  options = {}
) {
  const {
    labNumber = "",
    search = "",
    status = "",
    limit = 1000,
  } = options;

  let query =
    supabase
      .from("laboratory_results")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(limit);


  if (text(labNumber)) {
    query =
      query.eq(
        "lab_number",
        text(labNumber)
      );
  }


  if (text(status)) {
    query =
      query.eq(
        "result_status",
        text(status)
      );
  }


  const {
    data,
    error,
  } = await query;


  if (error) {
    console.error(
      "[getLaboratoryResults] Supabase error:",
      error
    );

    throw error;
  }


  let results =
    Array.isArray(data)
      ? data
      : [];

  /* ========================================================
     REGISTRATION FALLBACK / AUTHORITATIVE DEMOGRAPHIC ENRICHMENT
     ======================================================== */
  let preferredRegistration = null;

  if (text(labNumber)) {
    const { data: registrationRows, error: registrationError } =
      await supabase
        .from("registrations")
        .select("*")
        .eq("lab_number", text(labNumber))
        .order("created_at", { ascending: false })
        .limit(1);

    if (registrationError) {
      console.warn("[getLaboratoryResults] Registration lookup failed:", registrationError);
    } else if (Array.isArray(registrationRows) && registrationRows.length) {
      preferredRegistration = registrationRows[0];
    }

    if (!results.length && preferredRegistration?.id !== undefined && preferredRegistration?.id !== null) {
      let fallbackQuery = supabase
        .from("laboratory_results")
        .select("*")
        .eq("registration_id", preferredRegistration.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (text(status)) fallbackQuery = fallbackQuery.eq("result_status", text(status));

      const { data: fallbackRows, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        console.warn("[getLaboratoryResults] registration_id fallback failed:", fallbackError);
      } else {
        results = Array.isArray(fallbackRows) ? fallbackRows : [];
      }
    }
  }

  results = await enrichResultsWithRegistrations(results, preferredRegistration);


  /* ========================================================
     SEARCH
     ======================================================== */

  const normalizedSearch =
    normalizeText(search);

  if (normalizedSearch) {
    results =
      results.filter(
        (row) => {
          const haystack = [
            row?.lab_number,
            row?.patient_name,
            row?.test_name,
            row?.department,
            row?.category,
            row?.panel_name,
          ]
            .map(normalizeText)
            .join(" ");

          return haystack.includes(
            normalizedSearch
          );
        }
      );
  }


  /* ========================================================
     MASTER TEST ENRICHMENT
     ======================================================== */

  const masterMap =
    await loadMasterTests(
      results
    );


  return results.map(
    (row) => {
      const masterTest =
        masterMap.get(
          Number(
            getMasterTestId(row)
          )
        ) || null;

      return normalizeLaboratoryResult({
        ...row,
        masterTest,
      });
    }
  );
}


/* ==========================================================
   GET RESULT BY ID
   ========================================================== */

export async function getLaboratoryResultById(
  resultId
) {
  if (
    resultId === null ||
    resultId === undefined ||
    resultId === ""
  ) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("laboratory_results")
    .select("*")
    .eq(
      "id",
      resultId
    )
    .maybeSingle();

  if (error) {
    console.error(
      "[getLaboratoryResultById] error:",
      error
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  const masterTest =
    await getMasterTest(
      getMasterTestId(data)
    );

  const enrichedRows =
    await enrichResultsWithRegistrations([data]);

  const enrichedData =
    enrichedRows[0] || data;

  return normalizeLaboratoryResult({
    ...enrichedData,
    masterTest,
  });
}


/* ==========================================================
   GROUP RESULTS
   ========================================================== */

export function groupLaboratoryResults(
  results = []
) {
  const groups =
    new Map();


  for (const result of results) {
    const key =
      result?.result_group_key ||
      getResultGroupKey(
        result
      );


    if (!groups.has(key)) {
      groups.set(
        key,
        {
          key,

          lab_number:
            getLabNumber(result),

          patient_name:
            getPatientName(result),

          registration_id:
            getRegistrationId(result),

          department:
            getDepartment(result),

          presentation_type:
            result?.presentation_type ||
            getResultPresentationType(
              result
            ),

          panel_name:
            getPanelName(result),

          results: [],
        }
      );
    }


    groups
      .get(key)
      .results
      .push(result);
  }


  return Array.from(
    groups.values()
  ).map(
    (group) => ({
      ...group,

      /*
       * Keep individual authoritative rows.
       */
      results:
        group.results.sort(
          (a, b) => {
            const orderA =
              Number(
                a?.display_order ??
                a?.sort_order ??
                999999
              );

            const orderB =
              Number(
                b?.display_order ??
                b?.sort_order ??
                999999
              );

            return orderA - orderB;
          }
        ),

      result_count:
        group.results.length,

      completed_count:
        group.results.filter(
          (row) =>
            normalizeText(
              row?.result_status
            ) === "performed"
        ).length,
    })
  );
}


/* ==========================================================
   LOAD PANEL CHILD TESTS
   ========================================================== */

async function getWorkspacePanelTests(
  results = []
) {
  const panelIds = [
    ...new Set(
      results
        .filter(
          (row) =>
            isPanelTest(
              row?.masterTest ||
              row?.master_test ||
              row
            )
        )
        .map(
          (row) =>
            getMasterTestId(
              row?.masterTest ||
              row?.master_test ||
              row
            )
        )
        .map(toNumber)
        .filter(
          (id) => id !== null
        )
    ),
  ];


  if (!panelIds.length) {
    return [];
  }


  const {
    data,
    error,
  } = await supabase
    .from("panel_tests")
    .select(`
      id,
      panel_id,
      test_id,
      display_order,
      master_tests!panel_tests_test_id_fkey(*)
    `)
    .in(
      "panel_id",
      panelIds
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    );


  if (
    error ||
    !Array.isArray(data)
  ) {
    console.warn(
      "[getWorkspacePanelTests] panel_tests lookup failed:",
      error
    );

    return [];
  }


  return data;
}


/* ==========================================================
   GET WORKSPACE
   ========================================================== */

export async function getLaboratoryResultWorkspace(
  options = {}
) {
  const results =
    await getLaboratoryResults(
      options
    );


  const groups =
    groupLaboratoryResults(
      results
    );


  const masterTests = [
    ...new Map(
      results
        .map(
          (row) =>
            row?.masterTest
        )
        .filter(Boolean)
        .map(
          (test) => [
            Number(test.id),
            test,
          ]
        )
    ).values(),
  ];


  const panelTests =
    await getWorkspacePanelTests(
      results
    );


  return {
    results,
    masterTests,
    panelTests,
    groups,
  };
}


/* ==========================================================
   UPDATE LABORATORY RESULT
   ----------------------------------------------------------
   Updates the existing authoritative row only.

   The result object is preserved exactly as supplied.
   ========================================================== */

export async function updateLaboratoryResult(
  resultId,
  payload = {}
) {
  if (
    resultId === null ||
    resultId === undefined ||
    resultId === ""
  ) {
    throw new Error(
      "A laboratory result ID is required."
    );
  }


  if (
    !payload ||
    typeof payload !== "object"
  ) {
    throw new Error(
      "A valid result payload is required."
    );
  }


  const safePayload = {
    ...payload,
  };


  /*
   * Never allow the caller to change the
   * authoritative database ID.
   */
  delete safePayload.id;


  const {
    data,
    error,
  } = await supabase
    .from("laboratory_results")
    .update(safePayload)
    .eq(
      "id",
      resultId
    )
    .select("*")
    .maybeSingle();


  if (error) {
    console.error(
      "[updateLaboratoryResult] error:",
      error
    );

    throw error;
  }

  if (!data) {
    const noRowError = new Error(
      `Laboratory result ${resultId} was not updated. The row may not exist or may not be visible to the current Supabase role.`
    );
    noRowError.code = "LAB_RESULT_NOT_UPDATED";
    console.error("[updateLaboratoryResult] no row returned:", noRowError);
    throw noRowError;
  }


  const masterTest =
    await getMasterTest(
      getMasterTestId(data)
    );


  const enrichedRows =
    await enrichResultsWithRegistrations([data]);

  const enrichedData =
    enrichedRows[0] || data;

  return normalizeLaboratoryResult({
    ...enrichedData,
    masterTest,
  });
}


/* ==========================================================
   UPDATE MULTIPLE RESULTS
   ========================================================== */

export async function updateLaboratoryResults(
  updates = []
) {
  if (
    !Array.isArray(updates) ||
    !updates.length
  ) {
    return [];
  }


  const saved = [];


  for (
    const item of updates
  ) {
    if (
      item?.id === null ||
      item?.id === undefined ||
      item?.id === ""
    ) {
      continue;
    }


    const payload = {
      ...item,
    };


    delete payload.id;


    const result =
      await updateLaboratoryResult(
        item.id,
        payload
      );


    if (result) {
      saved.push(result);
    }
  }


  return saved;
}


/* ==========================================================
   RESULT STATUS HELPERS
   ========================================================== */

export function getResultStatus(
  result = {}
) {
  return firstValue(
    result?.result_status,
    result?.status,
    "Pending"
  );
}


export function getAuthorizationStatus(
  result = {}
) {
  return firstValue(
    result?.authorization_status,
    "Pending"
  );
}


export function getReleaseStatus(
  result = {}
) {
  return firstValue(
    result?.release_status,
    "Pending"
  );
}


export function isCompletedResult(
  result = {}
) {
  // Result Entry saves completed laboratory work as "Performed".
  // Keep this legacy helper name for compatibility.
  return (
    normalizeText(
      getResultStatus(result)
    ) === "performed"
  );
}


export function isAuthorizedResult(
  result = {}
) {
  return (
    normalizeText(
      getAuthorizationStatus(result)
    ) === "authorized"
  );
}


export function isReleasedResult(
  result = {}
) {
  return (
    normalizeText(
      getReleaseStatus(result)
    ) === "released"
  );
}


/* ==========================================================
   RESULT COMPLETION COMPATIBILITY
   ========================================================== */

export function isResultComplete(
  result = {}
) {
  const value =
    result?.result;

  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  if (
    typeof value === "string"
  ) {
    return value.trim() !== "";
  }

  if (
    typeof value === "object"
  ) {
    return Object.keys(value).length > 0;
  }

  return true;
}


/* ==========================================================
   RESULT DIRTY CHECK
   ========================================================== */

export function hasResultValueChanged(
  currentValue,
  originalValue
) {
  return (
    JSON.stringify(
      currentValue ?? null
    ) !==
    JSON.stringify(
      originalValue ?? null
    )
  );
}


/* ==========================================================
   SUMMARY
   ========================================================== */

export function getLaboratoryResultSummary(
  results = []
) {
  const total =
    results.length;


  const entered =
    results.filter(
      (row) =>
        normalizeText(
          getResultStatus(row)
        ) === "performed"
    ).length;


  const verified =
    results.filter(
      (row) =>
        [
          "verified",
          "reviewed",
        ].includes(
          normalizeText(
            getResultStatus(row)
          )
        )
    ).length;


  const authorized =
    results.filter(
      (row) =>
        normalizeText(
          getAuthorizationStatus(row)
        ) === "authorized"
    ).length;


  const released =
    results.filter(
      (row) =>
        normalizeText(
          getReleaseStatus(row)
        ) === "released"
    ).length;


  const pending =
    results.filter(
      (row) =>
        normalizeText(
          getResultStatus(row)
        ) === "pending"
    ).length;


  return {
    total,
    entered,
    verified,
    authorized,
    released,
    pending,
  };
}


/* ==========================================================
   CREATE LABORATORY RESULTS FROM REGISTRATION
   ----------------------------------------------------------
   REQUIRED COMPATIBILITY EXPORT

   Used by:
       RegistrationPortal.jsx

   Creates the initial rows in:
       laboratory_results

   IMPORTANT:
   - Does NOT use patient_results.
   - Does NOT flatten results.
   - Does NOT alter the Result Entry result payload.
   - Result Entry later updates these rows.
   ========================================================== */

export async function createLaboratoryResultsFromRegistration(
  registration,
  selectedTests = []
) {
  if (!registration) {
    throw new Error(
      "Laboratory registration is required."
    );
  }


  if (
    !Array.isArray(selectedTests) ||
    selectedTests.length === 0
  ) {
    return [];
  }


  const registrationId =
    registration.id ??
    null;


  const labNumber =
    registration.lab_number ??
    registration.labNumber ??
    null;


  const patientId =
    registration.patient_id ??
    registration.patientId ??
    null;


  const registrationNumber =
    registration.registration_number ??
    registration.registrationNumber ??
    null;


  const patientName =
    registration.patient_name ??
    registration.patientName ??
    registration.full_name ??
    null;


  const rows = [];


  for (
    const test of selectedTests
  ) {
    if (!test) {
      continue;
    }


    const testId =
      test.id ??
      test.test_id ??
      null;


    const testName =
      test.test_name ??
      test.name ??
      test.test ??
      null;


    /*
     * Ignore completely invalid test objects.
     */
    if (
      !testId &&
      !testName
    ) {
      continue;
    }


    rows.push({
      registration_id:
        registrationId,

      registration_number:
        registrationNumber,

      patient_id:
        patientId,

      patient_name:
        patientName,

      lab_number:
        labNumber,

      test_id:
        testId !== null &&
        testId !== undefined &&
        testId !== "" &&
        Number.isFinite(
          Number(testId)
        )
          ? Number(testId)
          : null,

      test_name:
        testName,

      test_code:
        test.test_code ??
        test.code ??
        null,

      department:
        test.department ??
        null,

      category:
        test.category ??
        test.result_category ??
        null,

      specimen:
        test.specimen ??
        test.specimen_type ??
        null,

      result:
        null,

      result_numeric:
        null,

      result_status:
        "Pending",
    });
  }


  if (!rows.length) {
    return [];
  }


  const {
    data,
    error,
  } = await supabase
    .from("laboratory_results")
    .insert(rows)
    .select("*");


  if (error) {
    console.error(
      "[createLaboratoryResultsFromRegistration] error:",
      error
    );

    throw new Error(
      `Failed to create laboratory result records: ${error.message}`
    );
  }


  return data || [];
}


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default {
  getTestName,
  getPanelName,
  getDepartment,
  getCategory,
  getTestType,
  getResultType,
  getSpecimen,
  getMasterTestId,

  getLabNumber,
  getRegistrationId,
  getPatientName,

  isStructuredResult,
  getRawResultValue,

  isSpecialTest,
  isQualitativeTest,
  isPanelTest,
  isRoutineUrinalysis,
  isQuantitativeSingleTest,

  getResultPresentationType,
  getResultGroupKey,
  normalizeLaboratoryResult,

  getMasterTest,
  getMasterTestsByIds,
  getMasterTestByName,

  getPanelTestsByTestIds,
  getPanelTests,

  resolveLaboratoryResult,

  getLaboratoryResults,
  getLaboratoryResultById,
  getLaboratoryResultWorkspace,

  groupLaboratoryResults,

  updateLaboratoryResult,
  updateLaboratoryResults,

  getResultStatus,
  getAuthorizationStatus,
  getReleaseStatus,

  isCompletedResult,
  isAuthorizedResult,
  isReleasedResult,
  isResultComplete,

  hasResultValueChanged,

  getLaboratoryResultSummary,

  createLaboratoryResultsFromRegistration,
};

/* ==========================================================
   REPORT WORKFLOW COMPATIBILITY
   ----------------------------------------------------------
   Updates the correct workflow columns in laboratory_results.
   ========================================================== */

function getReportItemsForWorkflow(report = {}) {
  if (Array.isArray(report?.items)) return report.items.filter(Boolean);
  if (Array.isArray(report?.results)) return report.results.filter(Boolean);
  if (report && report.id !== undefined && report.id !== null) return [report];
  return [];
}

function getWorkflowUserName(user = {}) {
  return firstValue(
    user?.username,
    user?.full_name,
    user?.name,
    user?.email,
    "System User"
  );
}

async function updateReportRows(report, payload = {}) {
  const items = getReportItemsForWorkflow(report);
  const ids = [
    ...new Set(
      items
        .map((row) => row?.id)
        .filter((id) => id !== null && id !== undefined && String(id).trim() !== "")
    ),
  ];

  if (!ids.length) throw new Error("No laboratory result rows were found for this report.");

  const updated = [];
  for (const id of ids) {
    const result = await updateLaboratoryResult(id, payload);
    if (result) updated.push(result);
  }
  return updated;
}

export async function authorizeLaboratoryResultReport(report, user = {}) {
  const items = getReportItemsForWorkflow(report);
  if (!items.length) throw new Error("No laboratory result rows were found to authorize.");
  if (items.some((row) => normalizeText(row?.release_status) === "released")) {
    throw new Error("A released report cannot be authorized again.");
  }

  return updateReportRows(report, {
    authorization_status: "Authorized",
  });
}

export async function releaseLaboratoryResultReport(report, user = {}) {
  const items = getReportItemsForWorkflow(report);
  if (!items.length) throw new Error("No laboratory result rows were found to release.");

  if (!items.every((row) => normalizeText(row?.authorization_status) === "authorized")) {
    throw new Error("All result rows must be authorized before the report can be released.");
  }

  if (items.every((row) => normalizeText(row?.release_status) === "released")) return items;

  return updateReportRows(report, {
    release_status: "Released",
  });
}
