import {
  getExistingResult,
  saveResult,
  updateResult,
} from "./resultService";

/* ==========================================================
   RESULT ENTRY SERVICE
   ----------------------------------------------------------
   RESPONSIBILITIES

   - Build result payloads
   - Save single-test results
   - Save panel/grouped results
   - Detect existing results
   - Handle amendments
   - Preserve registered-test identity
   - Preserve panel identity
   - Preserve child-test identity
   - Generate deterministic verification IDs

   IMPORTANT IDENTITY RULE

   These identities are DIFFERENT:

     registered_test_id
         = the patient's registered/order test

     master_test_id
         = master_tests identity of the actual test

     test_id
         = explicit child/actual test identity when supplied

     panel_id
         = explicit panel identity when supplied

     panel_master_test_id
         = explicit master_tests identity of the parent panel

   THIS SERVICE MUST NEVER INVENT ONE IDENTITY FROM ANOTHER.

   In particular:

     master_test_id !== test_id
     registered_test_id !== master_test_id
     panel_id !== panel_master_test_id

   Unless the source data explicitly says they are the same.
========================================================== */


/* ==========================================================
   NORMALIZATION
========================================================== */

function text(value) {
  return String(value ?? "").trim();
}


/* ==========================================================
   FIRST NON-EMPTY VALUE
   ----------------------------------------------------------
   Returns null when no real value exists.

   IMPORTANT:
   IDs must not use "" as a missing-value sentinel because
   nullish coalescing (??) would then incorrectly stop
   fallback resolution.
========================================================== */

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return null;
}


/* ==========================================================
   PATIENT
========================================================== */

function getPatientLabNumber(patient = {}) {
  return text(
    patient?.lab_number ??
      patient?.labNumber ??
      patient?.lab_no ??
      patient?.labNo
  );
}


function getPatientName(patient = {}) {
  return (
    text(
      patient?.full_name ??
        patient?.patient_name ??
        patient?.patientName ??
        patient?.name
    ) || "Unknown Patient"
  );
}


/* ==========================================================
   TEST NAME
========================================================== */

function getTestName(test = {}) {
  return text(
    test?.test_name ??
      test?.testName ??
      test?.name
  );
}


/* ==========================================================
   USER
========================================================== */

function getUserName(user = {}) {
  return (
    text(
      user?.full_name ??
        user?.name ??
        user?.username
    ) || "Unknown"
  );
}


/* ==========================================================
   REGISTERED TEST ID
   ----------------------------------------------------------
   This identifies the actual registered/order test for the
   patient.

   IMPORTANT:
   It must NEVER be confused with master_test_id.
========================================================== */

function getRegisteredTestId(test = {}) {
  return firstValue(
    test?.registered_test_id,
    test?.registeredTestId,

    test?.registration_test_id,
    test?.registrationTestId,

    test?.service_order_item_id,
    test?.serviceOrderItemId,

    test?.registered_test?.id,
    test?.registeredTest?.id,

    /*
     * Only use id as a final compatibility fallback when
     * the object itself represents a registered test.
     */
    test?.id
  );
}


/* ==========================================================
   MASTER TEST ID
   ----------------------------------------------------------
   Explicit master_tests identity only.

   NEVER derive this from registered_test_id.
========================================================== */

function getMasterTestId(test = {}) {
  return firstValue(
    test?.master_test_id,
    test?.masterTestId,

    test?.master_test?.id,
    test?.masterTest?.id
  );
}


/* ==========================================================
   EXPLICIT CHILD TEST ID
   ----------------------------------------------------------
   CRITICAL CHANGE.

   We DO NOT use master_test_id as a fallback.

   If test_id does not exist, it remains null.

   This prevents:

      master_test_id → test_id

   identity corruption.
========================================================== */

function getChildTestId(test = {}) {
  return firstValue(
    test?.test_id,
    test?.testId,

    test?.child_test_id,
    test?.childTestId,

    test?.child_test?.id,
    test?.childTest?.id
  );
}


/* ==========================================================
   PANEL MASTER TEST ID
   ----------------------------------------------------------
   Parent panel master_tests identity only.

   IMPORTANT:

     panel_id !== panel_master_test_id

   Never use panel_id as a substitute.
========================================================== */

function getPanelMasterTestId(test = {}) {
  return firstValue(
    test?.panel_master_test_id,
    test?.panelMasterTestId,

    test?.parent_panel_master_test_id,
    test?.parentPanelMasterTestId,

    test?.parent_panel_master_test?.id,
    test?.parentPanelMasterTest?.id
  );
}


/* ==========================================================
   PANEL ID
========================================================== */

function getPanelId(test = {}) {
  return firstValue(
    test?.panel_id,
    test?.panelId,

    test?.parent_panel_id,
    test?.parentPanelId,

    test?.parent_panel?.id,
    test?.parentPanel?.id
  );
}


/* ==========================================================
   PANEL NAME
========================================================== */

function getPanelName(test = {}) {
  return text(
    test?.panel_name ??
      test?.panelName ??
      test?.parent_panel_name ??
      test?.parentPanelName
  );
}


/* ==========================================================
   EXPLICIT PANEL FLAG
   ----------------------------------------------------------
   We only accept an explicit panel declaration.

   No parameter-count inference.
========================================================== */

function hasExplicitPanelFlag(test = {}) {
  const value =
    firstValue(
      test?.is_panel,
      test?.isPanel
    );

  if (value === true) {
    return true;
  }

  if (value === 1) {
    return true;
  }

  if (typeof value === "string") {
    return (
      value.trim().toLowerCase() ===
      "true"
    );
  }

  return false;
}


/* ==========================================================
   RESULT VALUE CHECK
========================================================== */

function hasValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim() !== "";
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(
      (item) => hasValue(item)
    );
  }

  if (typeof value === "object") {
    return Object.values(value).some(
      (item) => hasValue(item)
    );
  }

  return false;
}


/* ==========================================================
   VERIFICATION ID
   ----------------------------------------------------------
   SINGLE TEST

      LAB-TEST

   This preserves compatibility with existing single-test
   records.

   PANEL CHILD

      LAB-REGISTEREDTEST-PARAMETER

   This is CRITICAL.

   A patient can have:

      LFT
      RFT
      FLP

   and multiple panels can contain:

      ALT
      AST
      Creatinine

   Therefore panel-child verification IDs must include the
   registered test identity.

   Example:

      LAB001-REG15-ALT
      LAB001-REG16-ALT

   These are DIFFERENT results.
========================================================== */

export function generateVerificationId(
  labNumber,
  testName,
  registeredTestId = null,
  isPanelChild = false
) {
  const lab =
    text(labNumber)
      .toUpperCase();

  const test =
    text(testName)
      .toUpperCase()
      .replace(/\s+/g, "");

  if (!lab || !test) {
    return "";
  }

  if (
    isPanelChild &&
    registeredTestId !== null &&
    registeredTestId !== undefined &&
    String(registeredTestId).trim() !== ""
  ) {
    const registered =
      text(
        registeredTestId
      )
        .toUpperCase()
        .replace(/\s+/g, "");

    return `${lab}-${registered}-${test}`;
  }

  return `${lab}-${test}`;
}


/* ==========================================================
   BUILD DATABASE PAYLOAD
   ----------------------------------------------------------
   Identity is stored inside result JSON because the current
   patient_results schema may not have dedicated identity
   columns.

   resultService.js hydrates this metadata back to the
   top-level result row.
========================================================== */

export function buildResultPayload({
  patient = {},
  test = {},
  result,
  verificationId,
  user = {},
}) {
  const labNumber =
    getPatientLabNumber(patient);

  const testName =
    getTestName(test);

  return {
    lab_number:
      labNumber,

    patient_name:
      getPatientName(patient),

    age:
      patient?.age ?? null,

    sex:
      patient?.sex ?? null,

    department:
      firstValue(
        test?.department,
        "Laboratory"
      ),

    /*
     * Existing application behavior expects test_type to
     * contain the actual test/parameter name.
     *
     * Do not use this field to determine panel status.
     */
    test_type:
      testName,

    template_type:
      firstValue(
        test?.template_type,
        test?.templateType,
        ""
      ),

    verification_id:
      verificationId,

    result:
      result === undefined ||
      result === null
        ? ""
        : result,

    reported_at:
      new Date().toISOString(),

    release_status:
      "Pending",

    authorization_status:
      "Pending",

    entered_by:
      getUserName(user),
  };
}


/* ==========================================================
   BUILD PANEL CHILD RESULT
   ----------------------------------------------------------
   Every panel parameter gets:

     registered_test_id
     child test_id, if explicitly supplied
     child master_test_id
     panel_id, if explicitly supplied
     panel_master_test_id, if explicitly supplied
     panel_name
     is_panel = true

   NO IDENTITY IS FABRICATED.
========================================================== */

function buildPanelResult({
  parameter,
  value,
  selectedTest,
}) {
  const parameterName =
    getTestName(parameter);

  const registeredTestId =
    getRegisteredTestId(
      selectedTest
    );

  const childTestId =
    getChildTestId(
      parameter
    );

  const childMasterTestId =
    getMasterTestId(
      parameter
    );

  /*
   * Parameter may carry panel identity, but the registered
   * panel is authoritative when explicitly supplied by the
   * selected registered test.
   */
  const panelId =
    firstValue(
      getPanelId(selectedTest),
      getPanelId(parameter)
    );

  const panelMasterTestId =
    firstValue(
      getPanelMasterTestId(selectedTest),
      getPanelMasterTestId(parameter)
    );

  const panelName =
    getPanelName(selectedTest) ||
    getPanelName(parameter) ||
    getTestName(selectedTest);

  const referenceRange =
    firstValue(
      parameter?.reference_range,
      parameter?.referenceRange,
      parameter?.reference_value,
      parameter?.referenceValue,
      parameter?.reference
    );

  return {
    /* ======================================================
       REGISTERED TEST
    ====================================================== */

    registered_test_id:
      registeredTestId,

    registeredTestId:
      registeredTestId,


    /* ======================================================
       CHILD TEST
    ====================================================== */

    test_id:
      childTestId,

    testId:
      childTestId,

    master_test_id:
      childMasterTestId,

    masterTestId:
      childMasterTestId,


    /* ======================================================
       PANEL
    ====================================================== */

    panel_id:
      panelId,

    panelId:
      panelId,

    panel_master_test_id:
      panelMasterTestId,

    panelMasterTestId:
      panelMasterTestId,

    panel_name:
      panelName,

    panelName:
      panelName,

    is_panel:
      true,

    isPanel:
      true,


    /* ======================================================
       CHILD PARAMETER
    ====================================================== */

    parameter:
      parameterName,

    test_name:
      parameterName,

    testName:
      parameterName,


    /* ======================================================
       RESULT
    ====================================================== */

    result:
      value === null ||
      value === undefined
        ? ""
        : value,


    /* ======================================================
       RESULT METADATA
    ====================================================== */

    unit:
      firstValue(
        parameter?.unit,
        parameter?.units
      ),

    reference_range:
      referenceRange,

    male_range:
      firstValue(
        parameter?.male_range,
        parameter?.maleRange
      ),

    female_range:
      firstValue(
        parameter?.female_range,
        parameter?.femaleRange
      ),

    child_range:
      firstValue(
        parameter?.child_range,
        parameter?.childRange
      ),

    elderly_range:
      firstValue(
        parameter?.elderly_range,
        parameter?.elderlyRange
      ),

    critical_low:
      firstValue(
        parameter?.critical_low,
        parameter?.criticalLow
      ),

    critical_high:
      firstValue(
        parameter?.critical_high,
        parameter?.criticalHigh
      ),

    normal_low:
      firstValue(
        parameter?.normal_low,
        parameter?.normalLow
      ),

    normal_high:
      firstValue(
        parameter?.normal_high,
        parameter?.normalHigh
      ),

    result_type:
      firstValue(
        parameter?.result_type,
        parameter?.resultType
      ),

    result_category:
      firstValue(
        parameter?.result_category,
        parameter?.resultCategory,
        parameter?.category
      ),

    flag:
      firstValue(
        parameter?.flag,
        parameter?.status,
        "Normal"
      ),

    display_order:
      parameter?.display_order ??
      parameter?.displayOrder ??
      null,
  };
}


/* ==========================================================
   UPDATE EXISTING RESULT
========================================================== */

async function updateExistingResult({
  existing,
  payload,
  user,
}) {
  if (!existing?.id) {
    throw new Error(
      "Existing result ID is missing."
    );
  }

  const modify =
    window.confirm(
      "A result already exists for this test.\n\nDo you want to edit it?"
    );

  if (!modify) {
    return "cancelled";
  }

  const amendmentReason =
    window.prompt(
      "Reason for amendment:"
    ) || "";

  const {
    error,
  } =
    await updateResult(
      existing.id,
      {
        ...payload,

        amended:
          true,

        amended_at:
          new Date().toISOString(),

        amended_by:
          getUserName(user),

        amendment_reason:
          amendmentReason.trim(),
      }
    );

  if (error) {
    throw error;
  }

  return "updated";
}


/* ==========================================================
   SAVE SINGLE RESULT
========================================================== */

export async function saveSingleResult({
  patient,
  selectedTest,
  resultData,
  user = {},
}) {
  if (!patient) {
    throw new Error(
      "Patient information is required."
    );
  }

  if (!selectedTest) {
    throw new Error(
      "Laboratory test is required."
    );
  }

  const labNumber =
    getPatientLabNumber(patient);

  const testName =
    getTestName(selectedTest);

  if (!labNumber) {
    throw new Error(
      "Patient Lab Number is missing."
    );
  }

  if (!testName) {
    throw new Error(
      "Test name is missing."
    );
  }

  if (!hasValue(resultData)) {
    throw new Error(
      "Result is empty."
    );
  }


  /* ========================================================
     SINGLE TEST IDENTITY
     ======================================================== */

  const registeredTestId =
    getRegisteredTestId(
      selectedTest
    );

  const masterTestId =
    getMasterTestId(
      selectedTest
    );

  const childTestId =
    getChildTestId(
      selectedTest
    );


  /* ========================================================
     SINGLE TEST VERIFICATION ID
     ======================================================== */

  const verificationId =
    generateVerificationId(
      labNumber,
      testName
    );

  if (!verificationId) {
    throw new Error(
      "Unable to generate verification ID."
    );
  }


  /* ========================================================
     EXISTING RESULT
     ======================================================== */

  const {
    data: existing,
    error:
      existingError,
  } =
    await getExistingResult(
      verificationId
    );

  if (existingError) {
    throw existingError;
  }


  /* ========================================================
     STRUCTURED SINGLE RESULT
     ======================================================== */

  const structuredSingleResult = {

    registered_test_id:
      registeredTestId,

    registeredTestId:
      registeredTestId,

    test_id:
      childTestId,

    testId:
      childTestId,

    master_test_id:
      masterTestId,

    masterTestId:
      masterTestId,

    test_name:
      testName,

    testName:
      testName,

    is_panel:
      false,

    isPanel:
      false,

    result:
      resultData,
  };


  /* ========================================================
     BUILD PAYLOAD
  ======================================================== */

  const payload =
    buildResultPayload({
      patient,

      test:
        selectedTest,

      result:
        structuredSingleResult,

      verificationId,

      user,
    });


  /* ========================================================
     UPDATE EXISTING
  ======================================================== */

  if (existing) {
    return updateExistingResult({
      existing,
      payload,
      user,
    });
  }


  /* ========================================================
     INSERT
  ======================================================== */

  const {
    error:
      saveError,
  } =
    await saveResult(
      payload
    );

  if (saveError) {
    throw saveError;
  }

  return "saved";
}


/* ==========================================================
   GET PANEL PARAMETERS
   ----------------------------------------------------------
   These arrays are supplied by testService.

   This function does NOT decide whether a test is a panel.
========================================================== */

function getPanelParameters(
  selectedTest = {}
) {
  const candidates = [
    selectedTest?.groupedTests,
    selectedTest?.grouped_tests,
    selectedTest?.panelTests,
    selectedTest?.panel_tests,
    selectedTest?.parameters,
  ];

  for (
    const candidate of candidates
  ) {
    if (
      Array.isArray(candidate) &&
      candidate.length > 0
    ) {
      return candidate;
    }
  }

  return [];
}


/* ==========================================================
   GET PARAMETER RESULT
========================================================== */

function getParameterResult(
  resultData,
  parameter
) {
  if (
    !resultData ||
    typeof resultData !== "object"
  ) {
    return "";
  }

  const parameterName =
    getTestName(parameter);

  if (!parameterName) {
    return "";
  }

  if (
    Object.prototype.hasOwnProperty.call(
      resultData,
      parameterName
    )
  ) {
    return resultData[
      parameterName
    ];
  }

  const target =
    parameterName
      .toLowerCase()
      .trim();

  const key =
    Object.keys(resultData)
      .find(
        (item) =>
          text(item)
            .toLowerCase()
            .trim() === target
      );

  if (key !== undefined) {
    return resultData[key];
  }

  const normalizeKey = (
    value
  ) =>
    text(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[()]/g, "")
      .replace(/[-_/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const normalizedTarget =
    normalizeKey(
      parameterName
    );

  const normalizedKey =
    Object.keys(resultData)
      .find(
        (item) =>
          normalizeKey(item) ===
          normalizedTarget
      );

  if (
    normalizedKey !== undefined
  ) {
    return resultData[
      normalizedKey
    ];
  }

  return "";
}


/* ==========================================================
   SAVE ONE PANEL PARAMETER
========================================================== */

async function savePanelParameter({
  patient,
  selectedTest,
  parameter,
  resultData,
  user,
}) {
  const parameterName =
    getTestName(parameter);

  if (!parameterName) {
    console.warn(
      "[resultEntryService] Skipping panel parameter without name:",
      parameter
    );

    return "skipped";
  }

  const labNumber =
    getPatientLabNumber(patient);

  const value =
    getParameterResult(
      resultData,
      parameter
    );

  if (!hasValue(value)) {
    console.warn(
      "[resultEntryService] Skipping empty panel parameter:",
      parameterName
    );

    return "skipped";
  }


  /* ========================================================
     REGISTERED PANEL IDENTITY
     ======================================================== */

  const registeredTestId =
    getRegisteredTestId(
      selectedTest
    );


  /* ========================================================
     PANEL CHILD VERIFICATION ID
     ======================================================== */

  const verificationId =
    generateVerificationId(
      labNumber,
      parameterName,
      registeredTestId,
      true
    );

  if (!verificationId) {
    throw new Error(
      `Unable to generate verification ID for ${parameterName}.`
    );
  }


  /* ========================================================
     BUILD STRUCTURED CHILD RESULT
  ======================================================== */

  const result =
    buildPanelResult({
      parameter,
      value,
      selectedTest,
    });


  /* ========================================================
     BUILD TEST METADATA
  ======================================================== */

  const parameterTest = {
    ...parameter,

    test_name:
      parameterName,

    testName:
      parameterName,

    department:
      firstValue(
        selectedTest?.department,
        parameter?.department,
        "Laboratory"
      ),

    template_type:
      firstValue(
        parameter?.template_type,
        parameter?.templateType,

        selectedTest?.template_type,
        selectedTest?.templateType,

        ""
      ),
  };


  /* ========================================================
     BUILD PAYLOAD
  ======================================================== */

  const payload =
    buildResultPayload({
      patient,

      test:
        parameterTest,

      result,

      verificationId,

      user,
    });


  /* ========================================================
     CHECK EXISTING
  ======================================================== */

  const {
    data: existing,
    error:
      existingError,
  } =
    await getExistingResult(
      verificationId
    );

  if (existingError) {
    throw existingError;
  }


  /* ========================================================
     UPDATE EXISTING
  ======================================================== */

  if (existing) {
    const {
      error:
        updateError,
    } =
      await updateResult(
        existing.id,
        {
          ...payload,

          amended:
            true,

          amended_at:
            new Date().toISOString(),

          amended_by:
            getUserName(user),
        }
      );

    if (updateError) {
      throw updateError;
    }

    return "updated";
  }


  /* ========================================================
     INSERT
  ======================================================== */

  const {
    error:
      saveError,
  } =
    await saveResult(
      payload
    );

  if (saveError) {
    throw saveError;
  }

  return "saved";
}


/* ==========================================================
   SAVE PANEL / GROUPED RESULTS
========================================================== */

export async function saveGroupedResults({
  patient,
  selectedTest,
  resultData = {},
  user = {},
}) {
  if (!patient) {
    throw new Error(
      "Patient information is required."
    );
  }

  if (!selectedTest) {
    throw new Error(
      "Panel test is required."
    );
  }

  const labNumber =
    getPatientLabNumber(patient);

  if (!labNumber) {
    throw new Error(
      "Patient Lab Number is missing."
    );
  }

  const panelName =
    getTestName(selectedTest);

  if (!panelName) {
    throw new Error(
      "Panel name is missing."
    );
  }

  const parameters =
    getPanelParameters(
      selectedTest
    );

  if (
    parameters.length === 0
  ) {
    throw new Error(
      `No panel parameters were found for ${panelName}.`
    );
  }

  if (!hasValue(resultData)) {
    throw new Error(
      "Please enter at least one panel result."
    );
  }


  /* ========================================================
     REGISTERED TEST IDENTITY
  ======================================================== */

  const registeredTestId =
    getRegisteredTestId(
      selectedTest
    );

  const panelMasterTestId =
    getPanelMasterTestId(
      selectedTest
    );

  const panelId =
    getPanelId(
      selectedTest
    );


  /* ========================================================
     CRITICAL DEBUG
  ======================================================== */

  console.log(
    "================================================"
  );

  console.log(
    "[resultEntryService] SAVING PANEL"
  );

  console.log({
    panelName,

    registeredTestId,

    panelMasterTestId,

    panelId,

    parameterCount:
      parameters.length,
  });

  console.table(
    parameters.map(
      (parameter) => ({
        parameter:
          getTestName(parameter),

        childTestId:
          getChildTestId(parameter),

        childMasterTestId:
          getMasterTestId(parameter),

        panelId:
          getPanelId(parameter),

        panelMasterTestId:
          getPanelMasterTestId(parameter),
      })
    )
  );

  console.log(
    "================================================"
  );


  /* ========================================================
     SAVE PARAMETERS
  ======================================================== */

  let savedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (
    const parameter of parameters
  ) {
    const outcome =
      await savePanelParameter({
        patient,
        selectedTest,
        parameter,
        resultData,
        user,
      });

    if (
      outcome === "saved"
    ) {
      savedCount += 1;
    }

    if (
      outcome === "updated"
    ) {
      updatedCount += 1;
    }

    if (
      outcome === "skipped"
    ) {
      skippedCount += 1;
    }
  }


  /* ========================================================
     NOTHING SAVED
  ======================================================== */

  if (
    savedCount === 0 &&
    updatedCount === 0
  ) {
    throw new Error(
      `No results were saved for ${panelName}. Please enter at least one parameter result.`
    );
  }


  console.log(
    "[resultEntryService] PANEL SAVE COMPLETE:",
    {
      panelName,

      registeredTestId,

      panelMasterTestId,

      panelId,

      savedCount,

      updatedCount,

      skippedCount,
    }
  );

  return "saved";
}


/* ==========================================================
   OPTIONAL GROUPED TEST DETECTION
   ----------------------------------------------------------
   IMPORTANT:

   This function no longer says:

       parameters.length > 0 === panel

   Parameters are not proof of panel identity.

   Panel status must come from explicit metadata supplied by
   testService / ResultDashboard.
========================================================== */

export function isGroupedTest(
  test = {}
) {
  return hasExplicitPanelFlag(
    test
  );
}