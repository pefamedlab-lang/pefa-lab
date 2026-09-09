/* ==========================================================
   PEFA LAB
   REGISTERED TEST NORMALIZER
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Normalize registered-test records into a stable internal
   representation.

   CORE ARCHITECTURE

      REGISTERED TEST
            =
      REPORT IDENTITY

      MASTER TEST
            =
      METADATA / ENRICHMENT

      PANEL CHILD
            =
      PARAMETER INSIDE PANEL

   ----------------------------------------------------------
   CRITICAL IDENTITY RULES
   ----------------------------------------------------------

   1. Registered test identity is authoritative.

   2. Master metadata NEVER replaces registered identity.

   3. A panel child remains a child.

   4. panel_id alone does NOT make a record a panel.

   5. panel_name alone does NOT make a record a panel.

   6. parent_panel_id alone does NOT make a record a panel.

   7. A registered record must be explicitly/verifiably a
      panel before it can be classified as a panel.

   8. One registered test represents one report-level identity.

   9. Existing result values must survive normalization.

   10. Existing parameters must survive normalization.

   11. Master-test enrichment may fill missing metadata only.

   12. This module performs NO database queries.

   ========================================================== */


import {
  isPanelTest,
  isPanelChild,
  isSingleTest,

  getMasterTestId,
  getChildTestId,
  getPanelId,

  getTestIdentityName,
  getPanelIdentityName,

  toNumericId,
  firstIdentityValue,
} from "./testIdentity";

import {
  normalizeTestName,
  normalizeTestType,
  normalizeResultType,
  normalizeDepartment,
  normalizePanelName,
} from "./testNormalization";


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

/**
 * Return the first meaningful value.
 */
function firstValue(...values) {
  return firstIdentityValue(
    ...values
  );
}


/**
 * Convert a value to a trimmed string.
 */
function normalizeString(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  ).trim();
}


/**
 * Return a safe array.
 */
function safeArray(value) {
  return Array.isArray(
    value
  )
    ? value
    : [];
}


/**
 * Return a safe numeric ID.
 */
function safeId(value) {
  return toNumericId(
    value
  );
}


/**
 * Preserve the original value unless it is missing.
 */
function preserveOrFallback(
  original,
  fallback
) {
  if (
    original !== null &&
    original !== undefined &&
    String(original).trim() !== ""
  ) {
    return original;
  }

  return fallback;
}


/* ==========================================================
   REGISTERED TEST IDENTITY
   ========================================================== */

/**
 * Get the authoritative registered-test ID.
 *
 * IMPORTANT:
 *
 * This is NOT the master_tests.id.
 */
export function getRegisteredTestId(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return null;
  }

  const id =
    firstValue(
      test.registered_test_id,
      test.registeredTestId,
      test.id
    );

  return (
    id ??
    null
  );
}


/**
 * Get the registered master-test ID.
 *
 * This is metadata/reference information.
 *
 * It must NEVER replace the registered test ID.
 */
export function getRegisteredMasterTestId(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return null;
  }

  return safeId(
    firstValue(
      test.master_test_id,
      test.masterTestId
    )
  );
}


/**
 * Get the registered child master-test ID.
 */
export function getRegisteredChildTestId(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return null;
  }

  return safeId(
    firstValue(
      test.child_test_id,
      test.childTestId,
      test.child_master_test_id,
      test.childMasterTestId,
      test.parameter_test_id,
      test.parameterTestId
    )
  );
}


/**
 * Get the registered panel relationship ID.
 *
 * IMPORTANT:
 *
 * This function only returns the relationship.
 *
 * It does NOT mean the record itself is a panel.
 */
export function getRegisteredPanelId(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return null;
  }

  return (
    safeId(
      firstValue(
        test.panel_id,
        test.panelId,
        test.parent_panel_id,
        test.parentPanelId
      )
    ) ??
    null
  );
}


/* ==========================================================
   REGISTERED TEST NAME
   ========================================================== */

/**
 * Get the authoritative registered report name.
 */
export function getRegisteredTestName(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return "";
  }

  return normalizeString(
    firstValue(
      test.test_name,
      test.testName,
      test.name
    )
  );
}


/**
 * Get the registered panel name.
 *
 * IMPORTANT:
 *
 * This describes the panel relationship.
 *
 * It does NOT redefine the registered test name.
 */
export function getRegisteredPanelName(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return "";
  }

  return normalizeString(
    firstValue(
      test.panel_name,
      test.panelName
    )
  );
}


/* ==========================================================
   REGISTERED PARAMETERS
   ----------------------------------------------------------
   Existing parameters may contain entered result values.

   They must NEVER be destroyed by normalization.
   ========================================================== */

export function getRegisteredParameters(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return [];
  }

  const candidates = [
    test.parameters,
    test.panel_tests,
    test.panelTests,
    test.grouped_tests,
    test.groupedTests,
  ];

  for (
    const value of
      candidates
  ) {
    if (
      Array.isArray(
        value
      )
    ) {
      return value;
    }
  }

  return [];
}


/* ==========================================================
   RESULT PRESERVATION
   ========================================================== */

/**
 * Copy result-related properties from the registered record.
 *
 * We deliberately preserve several possible naming conventions
 * because the application has historically used both snake_case
 * and camelCase.
 */
function preserveResultFields(
  source,
  target
) {
  if (
    !source ||
    !target
  ) {
    return target;
  }

  const resultFields = [
    "result",
    "results",
    "result_value",
    "resultValue",
    "value",
    "entered_result",
    "enteredResult",
    "entered_value",
    "enteredValue",

    "interpretation",
    "result_interpretation",
    "resultInterpretation",

    "status",
    "result_status",
    "resultStatus",

    "comment",
    "comments",
    "remark",
    "remarks",

    "critical",
    "is_critical",
    "isCritical",

    "result_id",
    "resultId",

    "patient_result_id",
    "patientResultId",
  ];

  for (
    const field of
      resultFields
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        source,
        field
      )
    ) {
      target[field] =
        source[field];
    }
  }

  return target;
}


/* ==========================================================
   CLASSIFICATION
   ----------------------------------------------------------
   IMPORTANT

   Classification is based on the registered record.

   We explicitly check CHILD first.

   This prevents:

      AST + panel_id = LFT

   from becoming:

      AST = PANEL
   ========================================================== */

/**
 * Determine whether a registered record is a panel.
 *
 * Child status always wins.
 */
export function isRegisteredPanel(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return false;
  }

  /*
   * A known child relationship is stronger than the presence
   * of panel metadata.
   */
  if (
    isPanelChild(
      test
    )
  ) {
    return false;
  }

  /*
   * Only the centralized identity service can establish
   * panel identity.
   *
   * panel_id / panel_name are NOT used here as standalone
   * panel evidence.
   */
  return Boolean(
    isPanelTest(
      test
    )
  );
}


/**
 * Determine whether a registered record is a panel child.
 */
export function isRegisteredPanelChild(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return false;
  }

  return Boolean(
    isPanelChild(
      test
    )
  );
}


/**
 * Determine whether a registered record is a single test.
 */
export function isRegisteredSingleTest(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return false;
  }

  /*
   * A child is not a panel, but it also represents a distinct
   * registered identity.
   */
  if (
    isRegisteredPanelChild(
      test
    )
  ) {
    return false;
  }

  if (
    isRegisteredPanel(
      test
    )
  ) {
    return false;
  }

  return Boolean(
    isSingleTest(
      test
    )
  );
}


/* ==========================================================
   NORMALIZE PARAMETERS
   ========================================================== */

/**
 * Normalize a single parameter without changing its identity
 * or result values.
 */
function normalizeParameter(
  parameter,
  index
) {
  if (
    !parameter ||
    typeof parameter !== "object"
  ) {
    return null;
  }

  const childTestId =
    safeId(
      firstValue(
        parameter.test_id,
        parameter.testId,
        parameter.child_test_id,
        parameter.childTestId,
        parameter.id
      )
    );

  const childMasterId =
    safeId(
      firstValue(
        parameter.master_test_id,
        parameter.masterTestId,
        parameter.child_master_test_id,
        parameter.childMasterTestId
      )
    );

  const name =
    normalizeString(
      firstValue(
        parameter.test_name,
        parameter.testName,
        parameter.name
      )
    );

  const displayOrder =
    firstValue(
      parameter.display_order,
      parameter.displayOrder,
      index + 1
    );

  const normalized = {
    ...parameter,

    /*
     * Child identity.
     */
    id:
      parameter.id ??
      childTestId ??
      null,

    test_id:
      childTestId,

    testId:
      childTestId,

    master_test_id:
      childMasterId,

    masterTestId:
      childMasterId,

    /*
     * Child name.
     */
    test_name:
      parameter.test_name ??
      name,

    testName:
      parameter.testName ??
      name,

    /*
     * Display order.
     */
    display_order:
      displayOrder,

    displayOrder:
      displayOrder,
  };

  /*
   * Preserve entered result values.
   */
  preserveResultFields(
    parameter,
    normalized
  );

  return normalized;
}


/**
 * Normalize an array of parameters.
 */
function normalizeParameters(
  parameters
) {
  return safeArray(
    parameters
  )
    .map(
      (
        parameter,
        index
      ) =>
        normalizeParameter(
          parameter,
          index
        )
    )
    .filter(
      Boolean
    );
}


/* ==========================================================
   NORMALIZE REGISTERED TEST
   ----------------------------------------------------------
   This is the foundational normalizer.

   It does NOT enrich from master_tests.
   ========================================================== */

export function normalizeRegisteredTest(
  rawTest
) {
  if (
    !rawTest ||
    typeof rawTest !== "object"
  ) {
    return null;
  }


  /* ========================================================
     1. READ REGISTERED IDENTITY FIRST
     ======================================================== */

  const registeredId =
    getRegisteredTestId(
      rawTest
    );

  const registeredTestName =
    getRegisteredTestName(
      rawTest
    );

  const registeredPanelId =
    getRegisteredPanelId(
      rawTest
    );

  const registeredPanelName =
    getRegisteredPanelName(
      rawTest
    );


  /* ========================================================
     2. CLASSIFY BEFORE BUILDING THE RESULT
     ======================================================== */

  const rawIsChild =
    isRegisteredPanelChild(
      rawTest
    );

  const rawIsPanel =
    !rawIsChild &&
    isRegisteredPanel(
      rawTest
    );

  const rawIsSingle =
    !rawIsChild &&
    !rawIsPanel &&
    isRegisteredSingleTest(
      rawTest
    );


  /* ========================================================
     3. PARAMETERS
     ======================================================== */

  const registeredParameters =
    normalizeParameters(
      getRegisteredParameters(
        rawTest
      )
    );


  /* ========================================================
     4. BASE RECORD
     ======================================================== */

  const normalized = {
    /*
     * ------------------------------------------------------
     * Preserve every original field first.
     * ------------------------------------------------------
     */
    ...rawTest,

    /*
     * ------------------------------------------------------
     * REGISTERED IDENTITY
     * ------------------------------------------------------
     *
     * This is authoritative.
     */
    id:
      registeredId,

    registered_test_id:
      rawTest.registered_test_id ??
      registeredId,

    registeredTestId:
      rawTest.registeredTestId ??
      rawTest.registered_test_id ??
      registeredId,

    /*
     * ------------------------------------------------------
     * TEST NAME
     * ------------------------------------------------------
     */
    test_name:
      registeredTestName,

    testName:
      rawTest.testName ??
      registeredTestName,

    /*
     * ------------------------------------------------------
     * MASTER TEST ID
     * ------------------------------------------------------
     *
     * This is metadata/reference only.
     */
    master_test_id:
      getRegisteredMasterTestId(
        rawTest
      ),

    masterTestId:
      getRegisteredMasterTestId(
        rawTest
      ),

    /*
     * ------------------------------------------------------
     * PANEL RELATIONSHIP
     * ------------------------------------------------------
     *
     * Relationship metadata does not determine whether this
     * record itself is a panel.
     */
    panel_id:
      registeredPanelId,

    panelId:
      registeredPanelId,

    parent_panel_id:
      safeId(
        firstValue(
          rawTest.parent_panel_id,
          rawTest.parentPanelId
        )
      ) ??
      registeredPanelId,

    parentPanelId:
      safeId(
        firstValue(
          rawTest.parentPanelId,
          rawTest.parent_panel_id
        )
      ) ??
      registeredPanelId,

    panel_name:
      registeredPanelName,

    panelName:
      rawTest.panelName ??
      registeredPanelName,

    /*
     * ------------------------------------------------------
     * CLASSIFICATION
     * ------------------------------------------------------
     */
    is_panel:
      rawIsPanel,

    isPanel:
      rawIsPanel,

    is_panel_child:
      rawIsChild,

    isPanelChild:
      rawIsChild,

    /*
     * ------------------------------------------------------
     * PARAMETERS
     * ------------------------------------------------------
     */
    parameters:
      registeredParameters,

    panel_tests:
      registeredParameters,

    panelTests:
      registeredParameters,

    grouped_tests:
      registeredParameters,

    groupedTests:
      registeredParameters,
  };


  /* ========================================================
     5. NORMALIZED METADATA
     --------------------------------------------------------
     These fields are safe to normalize because they are
     metadata, not report identity.
     ======================================================== */

  normalized.test_type =
    normalizeTestType(
      firstValue(
        rawTest.test_type,
        rawTest.testType
      )
    );

  normalized.testType =
    normalized.test_type;


  normalized.result_type =
    normalizeResultType(
      firstValue(
        rawTest.result_type,
        rawTest.resultType
      )
    );

  normalized.resultType =
    normalized.result_type;


  normalized.department =
    normalizeDepartment(
      firstValue(
        rawTest.department
      )
    );


  normalized.panel_name =
    normalizePanelName(
      registeredPanelName
    );

  normalized.panelName =
    normalized.panel_name;


  /*
   * Restore the authoritative report identity after metadata
   * normalization.
   */
  normalized.test_name =
    registeredTestName;

  normalized.testName =
    registeredTestName;


  /* ========================================================
     6. PRESERVE RESULT DATA
     ======================================================== */

  preserveResultFields(
    rawTest,
    normalized
  );


  /* ========================================================
     7. PRESERVE PARAMETERS EXACTLY
     ======================================================== */

  normalized.parameters =
    registeredParameters;

  normalized.panel_tests =
    registeredParameters;

  normalized.panelTests =
    registeredParameters;

  normalized.grouped_tests =
    registeredParameters;

  normalized.groupedTests =
    registeredParameters;


  /* ========================================================
     8. CHILD-SPECIFIC PROTECTION
     ======================================================== */

  if (
    rawIsChild
  ) {
    /*
     * A child MUST remain a child.
     */
    normalized.is_panel =
      false;

    normalized.isPanel =
      false;

    normalized.is_panel_child =
      true;

    normalized.isPanelChild =
      true;


    /*
     * Its own test identity remains authoritative.
     */
    normalized.test_name =
      registeredTestName;

    normalized.testName =
      registeredTestName;


    /*
     * panel_id/panel_name remain relationships.
     */
    normalized.panel_id =
      registeredPanelId;

    normalized.panelId =
      registeredPanelId;

    normalized.panel_name =
      registeredPanelName;

    normalized.panelName =
      registeredPanelName;
  }


  /* ========================================================
     9. PANEL-SPECIFIC PROTECTION
     ======================================================== */

  if (
    rawIsPanel
  ) {
    normalized.is_panel =
      true;

    normalized.isPanel =
      true;

    normalized.is_panel_child =
      false;

    normalized.isPanelChild =
      false;


    /*
     * A genuine panel may use its registered panel identity.
     */
    normalized.panel_id =
      registeredPanelId;

    normalized.panelId =
      registeredPanelId;

    normalized.panel_name =
      registeredPanelName ||
      registeredTestName;

    normalized.panelName =
      normalized.panel_name;
  }


  /* ========================================================
     10. SINGLE-TEST PROTECTION
     ======================================================== */

  if (
    rawIsSingle
  ) {
    normalized.is_panel =
      false;

    normalized.isPanel =
      false;

    normalized.is_panel_child =
      false;

    normalized.isPanelChild =
      false;


    /*
     * A single test must not inherit panel children.
     *
     * Existing parameters are preserved only if they were
     * already attached to the registered record.
     *
     * We never fetch/inject new panel children here.
     */
    normalized.parameters =
      registeredParameters;

    normalized.panel_tests =
      registeredParameters;

    normalized.panelTests =
      registeredParameters;

    normalized.grouped_tests =
      registeredParameters;

    normalized.groupedTests =
      registeredParameters;
  }


  return normalized;
}


/* ==========================================================
   NORMALIZE MANY REGISTERED TESTS
   ========================================================== */

export function normalizeRegisteredTests(
  tests = []
) {
  if (
    !Array.isArray(
      tests
    )
  ) {
    return [];
  }

  return tests
    .map(
      (
        test
      ) =>
        normalizeRegisteredTest(
          test
        )
    )
    .filter(
      Boolean
    );
}


/* ==========================================================
   MASTER METADATA MERGE
   ----------------------------------------------------------
   IMPORTANT

   This function does NOT decide identity.

   It takes an already-normalized registered test and safely
   adds master metadata.

   Registered identity wins.
   ========================================================== */

export function mergeRegisteredTest(
  registeredTest,
  masterTest
) {
  const normalized =
    normalizeRegisteredTest(
      registeredTest
    );

  if (
    !normalized
  ) {
    return null;
  }

  if (
    !masterTest ||
    typeof masterTest !== "object"
  ) {
    return normalized;
  }


  /* ========================================================
     REGISTERED IDENTITY SNAPSHOT
     ======================================================== */

  const registeredId =
    normalized.id;

  const registeredTestId =
    normalized.registered_test_id;

  const registeredTestName =
    normalized.test_name;

  const registeredTestNameCamel =
    normalized.testName;

  const registeredPanelId =
    normalized.panel_id;

  const registeredPanelName =
    normalized.panel_name;

  const registeredIsPanel =
    normalized.is_panel;

  const registeredIsChild =
    normalized.is_panel_child;

  const registeredParameters =
    safeArray(
      normalized.parameters
    );


  /* ========================================================
     MASTER METADATA
     ======================================================== */

  const merged = {
    /*
     * Start with registered data.
     */
    ...normalized,

    /*
     * Add master metadata.
     *
     * These are intentionally lower priority than registered
     * identity.
     */
    department:
      preserveOrFallback(
        normalized.department,
        masterTest.department
      ),

    test_type:
      preserveOrFallback(
        normalized.test_type,
        masterTest.test_type ??
        masterTest.testType
      ),

    testType:
      preserveOrFallback(
        normalized.testType,
        masterTest.testType ??
        masterTest.test_type
      ),

    result_type:
      preserveOrFallback(
        normalized.result_type,
        masterTest.result_type ??
        masterTest.resultType
      ),

    resultType:
      preserveOrFallback(
        normalized.resultType,
        masterTest.resultType ??
        masterTest.result_type
      ),

    unit:
      preserveOrFallback(
        normalized.unit,
        masterTest.unit
      ),

    male_range:
      preserveOrFallback(
        normalized.male_range,
        masterTest.male_range ??
        masterTest.maleRange
      ),

    female_range:
      preserveOrFallback(
        normalized.female_range,
        masterTest.female_range ??
        masterTest.femaleRange
      ),

    child_range:
      preserveOrFallback(
        normalized.child_range,
        masterTest.child_range ??
        masterTest.childRange
      ),

    elderly_range:
      preserveOrFallback(
        normalized.elderly_range,
        masterTest.elderly_range ??
        masterTest.elderlyRange
      ),

    reference_value:
      preserveOrFallback(
        normalized.reference_value,
        masterTest.reference_value ??
        masterTest.referenceValue
      ),

    result_category:
      preserveOrFallback(
        normalized.result_category,
        masterTest.result_category ??
        masterTest.resultCategory
      ),

    template_type:
      preserveOrFallback(
        normalized.template_type,
        masterTest.template_type ??
        masterTest.templateType
      ),

    templateType:
      preserveOrFallback(
        normalized.templateType,
        masterTest.templateType ??
        masterTest.template_type
      ),

    specimen:
      preserveOrFallback(
        normalized.specimen,
        masterTest.specimen
      ),

    specimen_container:
      preserveOrFallback(
        normalized.specimen_container,
        masterTest.specimen_container ??
        masterTest.specimenContainer
      ),

    methodology:
      preserveOrFallback(
        normalized.methodology,
        masterTest.methodology
      ),

    instrument:
      preserveOrFallback(
        normalized.instrument,
        masterTest.instrument
      ),

    decimal_places:
      preserveOrFallback(
        normalized.decimal_places,
        masterTest.decimal_places ??
        masterTest.decimalPlaces
      ),

    options:
      preserveOrFallback(
        normalized.options,
        masterTest.options
      ),
  };


  /* ========================================================
     MASTER ID
     --------------------------------------------------------
     Master ID can be enriched, but only as metadata.
     ======================================================== */

  const masterId =
    getMasterTestId(
      masterTest
    ) ??
    safeId(
      masterTest.id
    );

  if (
    merged.master_test_id ===
      null ||
    merged.master_test_id ===
      undefined
  ) {
    merged.master_test_id =
      masterId;
  }

  if (
    merged.masterTestId ===
      null ||
    merged.masterTestId ===
      undefined
  ) {
    merged.masterTestId =
      masterId;
  }


  /* ========================================================
     MASTER CHILD ID
     ======================================================== */

  const childMasterId =
    getChildTestId(
      masterTest
    );

  if (
    childMasterId !==
    null &&
    merged.child_test_id ===
      undefined
  ) {
    merged.child_test_id =
      childMasterId;
  }


  /* ========================================================
     PANEL METADATA
     --------------------------------------------------------
     ONLY FILL MISSING RELATIONSHIP DATA.
     ======================================================== */

  if (
    !merged.panel_name &&
    masterTest.panel_name
  ) {
    merged.panel_name =
      normalizeString(
        masterTest.panel_name
      );

    merged.panelName =
      merged.panel_name;
  }


  /*
   * IMPORTANT:
   *
   * A master's panel_id may be useful as relationship
   * metadata, but it NEVER changes the registered record's
   * classification.
   */
  if (
    merged.panel_id ===
      null &&
    masterTest.panel_id !==
      undefined
  ) {
    merged.panel_id =
      safeId(
        masterTest.panel_id
      );

    merged.panelId =
      merged.panel_id;
  }


  /* ========================================================
     RESTORE REGISTERED IDENTITY
     --------------------------------------------------------
     This is the most important part of this function.
     ======================================================== */

  merged.id =
    registeredId;

  merged.registered_test_id =
    registeredTestId ??
    registeredId;

  merged.registeredTestId =
    normalized.registeredTestId ??
    registeredTestId ??
    registeredId;


  /*
   * NEVER allow master test_name to replace registered
   * report identity.
   */
  merged.test_name =
    registeredTestName;

  merged.testName =
    registeredTestNameCamel ??
    registeredTestName;


  /* ========================================================
     RESTORE PANEL CLASSIFICATION
     ======================================================== */

  merged.is_panel =
    registeredIsPanel;

  merged.isPanel =
    registeredIsPanel;

  merged.is_panel_child =
    registeredIsChild;

  merged.isPanelChild =
    registeredIsChild;


  /* ========================================================
     CHILD PROTECTION
     ======================================================== */

  if (
    registeredIsChild
  ) {
    /*
     * Child's own identity is preserved.
     */
    merged.test_name =
      registeredTestName;

    merged.testName =
      registeredTestNameCamel ??
      registeredTestName;


    /*
     * Child cannot become a panel merely because the master
     * has panel_name.
     */
    merged.is_panel =
      false;

    merged.isPanel =
      false;

    merged.is_panel_child =
      true;

    merged.isPanelChild =
      true;


    /*
     * Preserve the child's relationship.
     */
    merged.panel_id =
      registeredPanelId;

    merged.panelId =
      registeredPanelId;

    merged.panel_name =
      registeredPanelName;

    merged.panelName =
      registeredPanelName;
  }


  /* ========================================================
     PANEL PROTECTION
     ======================================================== */

  if (
    registeredIsPanel
  ) {
    merged.is_panel =
      true;

    merged.isPanel =
      true;

    merged.is_panel_child =
      false;

    merged.isPanelChild =
      false;
  }


  /* ========================================================
     PRESERVE EXISTING PARAMETERS
     ======================================================== */

  merged.parameters =
    registeredParameters;

  merged.panel_tests =
    registeredParameters;

  merged.panelTests =
    registeredParameters;

  merged.grouped_tests =
    registeredParameters;

  merged.groupedTests =
    registeredParameters;


  /* ========================================================
     PRESERVE ENTERED RESULTS
     ======================================================== */

  preserveResultFields(
    normalized,
    merged
  );


  return merged;
}


/* ==========================================================
   IDENTITY HELPERS
   ========================================================== */

/**
 * Return the report-level identity name.
 *
 * IMPORTANT:
 *
 * Never use panel_name to replace a child's own name.
 */
export function getRegisteredReportIdentity(
  test
) {
  return getRegisteredTestName(
    test
  );
}


/**
 * Return a stable identity object useful for diagnostics.
 */
export function getRegisteredIdentity(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return {
      id: null,
      testName: "",
      panelId: null,
      panelName: "",
      isPanel: false,
      isPanelChild: false,
    };
  }

  const isChild =
    isRegisteredPanelChild(
      test
    );

  const isPanel =
    !isChild &&
    isRegisteredPanel(
      test
    );

  return {
    id:
      getRegisteredTestId(
        test
      ),

    testName:
      getRegisteredTestName(
        test
      ),

    panelId:
      getRegisteredPanelId(
        test
      ),

    panelName:
      getRegisteredPanelName(
        test
      ),

    isPanel,

    isPanelChild:
      isChild,

    isSingle:
      !isPanel &&
      !isChild,
  };
}


/* ==========================================================
   VALIDATE REGISTERED IDENTITY
   ========================================================== */

/**
 * Diagnostic validation.
 *
 * This function does NOT modify the record.
 */
export function validateRegisteredIdentity(
  test
) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return {
      valid: false,
      reason:
        "Invalid registered test record.",
    };
  }

  const id =
    getRegisteredTestId(
      test
    );

  const testName =
    getRegisteredTestName(
      test
    );

  if (
    id === null ||
    id === undefined
  ) {
    return {
      valid: false,
      reason:
        "Registered test has no registered identity ID.",
    };
  }

  if (
    !testName
  ) {
    return {
      valid: false,
      reason:
        "Registered test has no report identity name.",
    };
  }

  const child =
    isRegisteredPanelChild(
      test
    );

  const panel =
    !child &&
    isRegisteredPanel(
      test
    );

  /*
   * A record cannot simultaneously be panel and child.
   */
  if (
    child &&
    panel
  ) {
    return {
      valid: false,
      reason:
        "Registered test is simultaneously classified as panel and child.",
    };
  }

  return {
    valid: true,

    id,

    testName,

    panelId:
      getRegisteredPanelId(
        test
      ),

    panelName:
      getRegisteredPanelName(
        test
      ),

    isPanel:
      panel,

    isPanelChild:
      child,
  };
}


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

const registeredTestNormalizer = {
  normalizeRegisteredTest,
  normalizeRegisteredTests,

  mergeRegisteredTest,

  getRegisteredTestId,
  getRegisteredMasterTestId,
  getRegisteredChildTestId,
  getRegisteredPanelId,

  isRegisteredPanel,
  isRegisteredPanelChild,
  isRegisteredSingleTest,

  getRegisteredTestName,
  getRegisteredPanelName,
  getRegisteredReportIdentity,
  getRegisteredIdentity,

  getRegisteredParameters,

  validateRegisteredIdentity,
};


export default registeredTestNormalizer;