/* ==========================================================
   PEFA LAB
   LABORATORY RESULT SERVICE
   ----------------------------------------------------------
   PATH:
   src/services/laboratory/laboratoryResultService.js

   PURPOSE:
   - Load laboratory results
   - Resolve master tests
   - Resolve panel membership
   - Ensure a laboratory result record exists for a
     registered laboratory test
   - Update laboratory results
   - Prepare result-entry/dashboard workspaces

   IMPORTANT ID RULE:

      registration test item ID
             ≠
      master_tests.id
             ≠
      laboratory_results.id

   `laboratory_results.id` is the authoritative identity
   used when saving a laboratory result.
   ========================================================== */

import { supabase } from "../../supabase";

/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const isValidNumericId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  return Number.isFinite(Number(value));
};

const uniqueNumbers = (values = []) =>
  [
    ...new Set(
      values
        .filter(isValidNumericId)
        .map(Number)
    ),
  ];

/* ==========================================================
   GET MASTER TEST ID
   ----------------------------------------------------------
   NEVER use registration-item `test.id` blindly.

   The authoritative master test identity is resolved from:

      master_test_id
      masterTestId
      masterTest.id
      master_test.id

   If those are unavailable, the test name is resolved against
   master_tests.
   ========================================================== */

const getMasterTestId = (test) =>
  test?.master_test_id ??
  test?.masterTestId ??
  test?.masterTest?.id ??
  test?.master_test?.id ??
  null;

/* ==========================================================
   GET TEST NAME
   ========================================================== */

const getTestName = (test) =>
  test?.test_name ||
  test?.testName ||
  test?.name ||
  test?.test ||
  test?.service_name ||
  test?.serviceName ||
  test?.masterTest?.test_name ||
  test?.master_test?.test_name ||
  "";

/* ==========================================================
   GET PANEL NAME
   ========================================================== */

const getPanelName = (test) =>
  test?.panel_name ||
  test?.panelName ||
  test?.masterTest?.panel_name ||
  test?.master_test?.panel_name ||
  null;

/* ==========================================================
   GET DEPARTMENT
   ========================================================== */

const getDepartment = (test) =>
  test?.department ||
  test?.masterTest?.department ||
  test?.master_test?.department ||
  "Laboratory";

/* ==========================================================
   GET TEST CODE
   ========================================================== */

const getTestCode = (test) =>
  test?.test_code ||
  test?.testCode ||
  test?.code ||
  test?.masterTest?.test_code ||
  test?.master_test?.test_code ||
  null;

/* ==========================================================
   GET PATIENT NAME
   ========================================================== */

const getPatientName = (registration) =>
  registration?.full_name ||
  registration?.patient_name ||
  registration?.patientName ||
  registration?.patient?.full_name ||
  registration?.patient?.patient_name ||
  null;

/* ==========================================================
   GET PATIENT ID
   ========================================================== */

const getPatientId = (registration) =>
  registration?.patient_id ||
  registration?.patientId ||
  registration?.patient?.patient_id ||
  null;

/* ==========================================================
   GET LAB NUMBER
   ========================================================== */

const getLabNumber = (registration) =>
  registration?.lab_number ||
  registration?.labNumber ||
  null;

/* ==========================================================
   GET REGISTRATION NUMBER
   ========================================================== */

const getRegistrationNumber = (registration) =>
  registration?.registration_number ||
  registration?.registrationNumber ||
  null;

/* ==========================================================
   GET REGISTRATION ID
   ========================================================== */

const getRegistrationId = (registration) =>
  registration?.id ??
  registration?.registration_id ??
  null;

/* ==========================================================
   GET MASTER TEST BY ID
   ========================================================== */

export async function getMasterTestById(
  masterTestId
) {
  if (!isValidNumericId(masterTestId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("master_tests")
    .select("*")
    .eq("id", Number(masterTestId))
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load master test: ${error.message}`
    );
  }

  return data || null;
}

/* ==========================================================
   GET MASTER TEST BY NAME
   ========================================================== */

export async function getMasterTestByName(
  testName
) {
  if (!testName) {
    return null;
  }

  const normalizedName =
    normalizeText(testName);

  const { data, error } = await supabase
    .from("master_tests")
    .select("*")
    .ilike(
      "test_name",
      testName.trim()
    );

  if (error) {
    throw new Error(
      `Failed to resolve master test: ${error.message}`
    );
  }

  if (!data?.length) {
    return null;
  }

  return (
    data.find(
      (test) =>
        normalizeText(test.test_name) ===
        normalizedName
    ) || data[0]
  );
}

/* ==========================================================
   GET MASTER TESTS BY IDS
   ========================================================== */

export async function getMasterTestsByIds(
  testIds = []
) {
  const ids =
    uniqueNumbers(testIds);

  if (!ids.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("master_tests")
    .select("*")
    .in("id", ids);

  if (error) {
    throw new Error(
      `Failed to load master tests: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   RESOLVE MASTER TEST
   ----------------------------------------------------------
   This is the critical identity resolver.
   ========================================================== */

export async function resolveMasterTest(
  test
) {
  if (!test) {
    return null;
  }

  const explicitMasterId =
    getMasterTestId(test);

  if (
    isValidNumericId(
      explicitMasterId
    )
  ) {
    const masterTest =
      await getMasterTestById(
        explicitMasterId
      );

    if (masterTest) {
      return masterTest;
    }
  }

  const testName =
    getTestName(test);

  if (!testName) {
    return null;
  }

  return getMasterTestByName(
    testName
  );
}

/* ==========================================================
   GET PANEL TEST RELATIONSHIPS
   ========================================================== */

export async function getPanelTestsByTestIds(
  testIds = []
) {
  const ids =
    uniqueNumbers(testIds);

  if (!ids.length) {
    return [];
  }

  const { data, error } =
    await supabase
      .from("panel_tests")
      .select(
        `
          id,
          panel_id,
          test_id,
          display_order
        `
      )
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
    throw new Error(
      `Failed to load panel test relationships: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   GET PANEL TESTS
   ========================================================== */

export async function getPanelTests(
  panelId
) {
  if (
    !isValidNumericId(panelId)
  ) {
    return [];
  }

  const { data, error } =
    await supabase
      .from("panel_tests")
      .select(
        `
          id,
          panel_id,
          test_id,
          display_order
        `
      )
      .eq(
        "panel_id",
        Number(panelId)
      )
      .order(
        "display_order",
        {
          ascending: true,
        }
      );

  if (error) {
    throw new Error(
      `Failed to load panel members: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   FIND EXISTING RESULT
   ----------------------------------------------------------
   Matching priority:

   1. registration_id + test_id
   2. registration_id + exact test name
   3. lab_number + exact test name
   4. lab_number + test code
   ========================================================== */

export async function findLaboratoryResultForRegisteredTest({
  registration = null,
  test = null,
  masterTest = null,
} = {}) {
  const registrationId =
    getRegistrationId(
      registration
    );

  const labNumber =
    getLabNumber(
      registration
    );

  const testName =
    getTestName(
      masterTest || test
    );

  const testCode =
    getTestCode(
      masterTest || test
    );

  const masterTestId =
    masterTest?.id ??
    getMasterTestId(test);

  /* --------------------------------------------------------
     1. registration_id + test_id
     -------------------------------------------------------- */

  if (
    isValidNumericId(
      registrationId
    ) &&
    isValidNumericId(
      masterTestId
    )
  ) {
    const { data, error } =
      await supabase
        .from("laboratory_results")
        .select("*")
        .eq(
          "registration_id",
          Number(registrationId)
        )
        .eq(
          "test_id",
          Number(masterTestId)
        )
        .order(
          "id",
          {
            ascending: true,
          }
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to find laboratory result: ${error.message}`
      );
    }

    if (data) {
      return data;
    }
  }

  /* --------------------------------------------------------
     2. registration_id + exact test name
     -------------------------------------------------------- */

  if (
    isValidNumericId(
      registrationId
    ) &&
    testName
  ) {
    const { data, error } =
      await supabase
        .from("laboratory_results")
        .select("*")
        .eq(
          "registration_id",
          Number(registrationId)
        )
        .eq(
          "test_name",
          testName
        )
        .order(
          "id",
          {
            ascending: true,
          }
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to find laboratory result by test name: ${error.message}`
      );
    }

    if (data) {
      return data;
    }
  }

  /* --------------------------------------------------------
     3. lab_number + exact test name
     -------------------------------------------------------- */

  if (
    labNumber &&
    testName
  ) {
    const { data, error } =
      await supabase
        .from("laboratory_results")
        .select("*")
        .eq(
          "lab_number",
          labNumber
        )
        .eq(
          "test_name",
          testName
        )
        .order(
          "id",
          {
            ascending: true,
          }
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to find laboratory result by lab number: ${error.message}`
      );
    }

    if (data) {
      return data;
    }
  }

  /* --------------------------------------------------------
     4. lab_number + test code
     -------------------------------------------------------- */

  if (
    labNumber &&
    testCode
  ) {
    const { data, error } =
      await supabase
        .from("laboratory_results")
        .select("*")
        .eq(
          "lab_number",
          labNumber
        )
        .eq(
          "test_code",
          testCode
        )
        .order(
          "id",
          {
            ascending: true,
          }
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to find laboratory result by test code: ${error.message}`
      );
    }

    if (data) {
      return data;
    }
  }

  return null;
}

/* ==========================================================
   CREATE LABORATORY RESULT RECORD
   ========================================================== */

export async function createLaboratoryResult(
  payload
) {
  if (
    !payload ||
    typeof payload !== "object"
  ) {
    throw new Error(
      "A valid laboratory result payload is required."
    );
  }

  const insertPayload = {
    registration_id:
      payload.registration_id ??
      null,

    registration_number:
      payload.registration_number ??
      null,

    patient_id:
      payload.patient_id ??
      null,

    lab_number:
      payload.lab_number ??
      null,

    test_id:
      payload.test_id ??
      null,

    test_code:
      payload.test_code ??
      null,

    test_name:
      payload.test_name ??
      null,

    category:
      payload.category ??
      null,

    department:
      payload.department ??
      null,

    specimen:
      payload.specimen ??
      null,

    result:
      payload.result ??
      null,

    result_numeric:
      payload.result_numeric ??
      null,

    unit:
      payload.unit ??
      null,

    reference_range:
      payload.reference_range ??
      null,

    flag:
      payload.flag ??
      null,

    comment:
      payload.comment ??
      null,

    result_status:
      payload.result_status ??
      "Pending",

    patient_name:
      payload.patient_name ??
      null,

    authorization_status:
      payload.authorization_status ??
      "Pending",

    release_status:
      payload.release_status ??
      "Pending",

    ...Object.fromEntries(
      Object.entries(payload).filter(
        ([key]) =>
          ![
            "id",
          ].includes(key)
      )
    ),
  };

  const { data, error } =
    await supabase
      .from("laboratory_results")
      .insert(
        insertPayload
      )
      .select("*")
      .single();

  if (error) {
    throw new Error(
      `Failed to create laboratory result: ${error.message}`
    );
  }

  return data;
}

/* ==========================================================
   ENSURE LABORATORY RESULT FOR REGISTERED TEST
   ----------------------------------------------------------
   THIS IS THE MAIN FIX.

   A result record is guaranteed before a result-entry form
   is rendered.

   Existing record:
      return existing record.

   Missing record:
      create Pending record.
   ========================================================== */

export async function ensureLaboratoryResultForRegisteredTest({
  registration = null,
  test = null,
} = {}) {
  if (!registration) {
    throw new Error(
      "A registration is required to initialize a laboratory result."
    );
  }

  if (!test) {
    throw new Error(
      "A registered laboratory test is required to initialize a laboratory result."
    );
  }

  const masterTest =
    await resolveMasterTest(
      test
    );

  if (!masterTest?.id) {
    throw new Error(
      `Unable to resolve master test for "${getTestName(test)}".`
    );
  }

  /* --------------------------------------------------------
     FIND EXISTING RESULT
     -------------------------------------------------------- */

  const existing =
    await findLaboratoryResultForRegisteredTest(
      {
        registration,
        test,
        masterTest,
      }
    );

  if (existing) {
    return {
      result: existing,
      created: false,
      masterTest,
    };
  }

  /* --------------------------------------------------------
     BUILD INITIAL RESULT
     -------------------------------------------------------- */

  const initialPayload = {
    registration_id:
      getRegistrationId(
        registration
      ),

    registration_number:
      getRegistrationNumber(
        registration
      ),

    patient_id:
      getPatientId(
        registration
      ),

    lab_number:
      getLabNumber(
        registration
      ),

    test_id:
      Number(masterTest.id),

    test_code:
      masterTest.test_code ||
      getTestCode(test),

    test_name:
      masterTest.test_name ||
      getTestName(test),

    category:
      masterTest.department ||
      getDepartment(test),

    department:
      masterTest.department ||
      getDepartment(test),

    specimen:
      masterTest.specimen ||
      test?.specimen ||
      null,

    result:
      null,

    result_status:
      "Pending",

    patient_name:
      getPatientName(
        registration
      ),

    authorization_status:
      "Pending",

    release_status:
      "Pending",
  };

  /* --------------------------------------------------------
     CREATE
     -------------------------------------------------------- */

  const created =
    await createLaboratoryResult(
      initialPayload
    );

  return {
    result: created,
    created: true,
    masterTest,
  };
}

/* ==========================================================
   GET LABORATORY RESULTS
   ========================================================== */

export async function getLaboratoryResults({
  labNumber = null,
  search = "",
  status = null,
  limit = 500,
} = {}) {
  let query =
    supabase
      .from("laboratory_results")
      .select("*")
      .order(
        "created_at",
        {
          ascending: true,
        }
      )
      .limit(limit);

  if (labNumber) {
    query =
      query.eq(
        "lab_number",
        labNumber
      );
  }

  if (status) {
    query =
      query.eq(
        "result_status",
        status
      );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    throw new Error(
      `Failed to load laboratory results: ${error.message}`
    );
  }

  let results =
    data || [];

  if (
    search &&
    search.trim()
  ) {
    const normalizedSearch =
      normalizeText(search);

    results =
      results.filter(
        (row) =>
          normalizeText(
            row.lab_number
          ).includes(
            normalizedSearch
          ) ||
          normalizeText(
            row.test_name
          ).includes(
            normalizedSearch
          ) ||
          normalizeText(
            row.test_code
          ).includes(
            normalizedSearch
          ) ||
          normalizeText(
            row.patient_id
          ).includes(
            normalizedSearch
          )
      );
  }

  return results;
}

/* ==========================================================
   GET RESULT BY ID
   ========================================================== */

export async function getLaboratoryResultById(
  id
) {
  if (
    !isValidNumericId(id)
  ) {
    throw new Error(
      "A valid laboratory result ID is required."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("laboratory_results")
    .select("*")
    .eq(
      "id",
      Number(id)
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load laboratory result: ${error.message}`
    );
  }

  return data;
}

/* ==========================================================
   RESOLVE RESULT
   ========================================================== */

export async function resolveLaboratoryResult(
  result
) {
  if (!result) {
    return null;
  }

  let masterTest = null;

  if (
    isValidNumericId(
      result.test_id
    )
  ) {
    masterTest =
      await getMasterTestById(
        result.test_id
      );
  }

  if (
    !masterTest &&
    result.test_name
  ) {
    masterTest =
      await getMasterTestByName(
        result.test_name
      );
  }

  let panelTests = [];

  if (masterTest?.id) {
    panelTests =
      await getPanelTestsByTestIds([
        masterTest.id,
      ]);
  }

  return {
    ...result,
    masterTest,
    resolvedTestId:
      masterTest?.id ??
      (
        isValidNumericId(
          result.test_id
        )
          ? Number(result.test_id)
          : null
      ),
    panelTests,
  };
}

/* ==========================================================
   RESULT WORKSPACE
   ========================================================== */

export async function getLaboratoryResultWorkspace({
  labNumber = null,
  search = "",
  status = null,
} = {}) {
  const results =
    await getLaboratoryResults({
      labNumber,
      search,
      status,
    });

  const resolvedResults =
    [];

  for (
    const result of results
  ) {
    resolvedResults.push(
      await resolveLaboratoryResult(
        result
      )
    );
  }

  return {
    results:
      resolvedResults,
    masterTests: [],
    panelTests: [],
    groups: [],
  };
}

/* ==========================================================
   UPDATE RESULT
   ========================================================== */

export async function updateLaboratoryResult(
  resultId,
  payload
) {
  if (
    !isValidNumericId(
      resultId
    )
  ) {
    throw new Error(
      "A valid laboratory result ID is required."
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

  const updatePayload = {
    ...payload,
    updated_at:
      new Date().toISOString(),
  };

  const {
    data,
    error,
  } =
    await supabase
      .from("laboratory_results")
      .update(
        updatePayload
      )
      .eq(
        "id",
        Number(resultId)
      )
      .select("*")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update laboratory result: ${error.message}`
    );
  }

  return data;
}

/* ==========================================================
   UPDATE MULTIPLE
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
      !isValidNumericId(
        item?.id
      )
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
   RESULT STATUS
   ========================================================== */

export function getResultStatus(
  result
) {
  if (!result) {
    return "Pending";
  }

  if (
    result.result_status
  ) {
    return result.result_status;
  }

  if (
    result.result !== null &&
    result.result !== undefined &&
    String(
      result.result
    ).trim() !== ""
  ) {
    return "Entered";
  }

  return "Pending";
}

/* ==========================================================
   COMPLETION
   ========================================================== */

export function isResultComplete(
  result
) {
  if (!result) {
    return false;
  }

  return (
    result.result !== null &&
    result.result !== undefined &&
    String(
      result.result
    ).trim() !== ""
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

  const completed =
    results.filter(
      isResultComplete
    ).length;

  const pending =
    total - completed;

  const reviewed =
    results.filter(
      (row) =>
        normalizeText(
          row.result_status
        ) === "reviewed"
    ).length;

  return {
    total,
    completed,
    pending,
    reviewed,
  };
}

/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default {
  getLaboratoryResults,
  getLaboratoryResultById,
  getMasterTestById,
  getMasterTestsByIds,
  getMasterTestByName,
  resolveMasterTest,
  getPanelTestsByTestIds,
  getPanelTests,
  findLaboratoryResultForRegisteredTest,
  createLaboratoryResult,
  ensureLaboratoryResultForRegisteredTest,
  resolveLaboratoryResult,
  getLaboratoryResultWorkspace,
  updateLaboratoryResult,
  updateLaboratoryResults,
  getResultStatus,
  isResultComplete,
  getLaboratoryResultSummary,
};