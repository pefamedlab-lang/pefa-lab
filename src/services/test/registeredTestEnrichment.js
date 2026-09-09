/* ==========================================================
   PEFA LAB
   REGISTERED TEST ENRICHMENT SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Enrich registered tests with trusted master-test metadata.

   CORE ARCHITECTURE

      REGISTERED TEST
            |
            |-- REPORT IDENTITY
            |
            +-- test_name
            +-- panel_name
            +-- master_test_id
            +-- child_test_id
            +-- panel_id
            |
            v
      MASTER TEST
            |
            |-- metadata
            |-- units
            |-- reference ranges
            |-- result configuration
            |
            v
      PANEL PARAMETER SERVICE
            |
            +-- panel children / parameters

   ==========================================================
   CRITICAL IDENTITY RULES
   ==========================================================

   1. REGISTERED TEST IDENTITY IS AUTHORITATIVE.

   2. master_tests is metadata only.

   3. A resolved master must match the registered report
      identity before its metadata is accepted.

   4. A child master must NEVER turn a registered panel
      into a single test.

   5. panel_id / panel_name on a child does NOT make the
      child a panel.

   6. A genuine panel requires a genuine panel master.

   7. Panel parameters are loaded ONLY for a registered
      panel.

   8. Single tests do NOT inherit parameters from their
      panel.

   9. Never transform:

         LFT -> AST
         RFT -> eGFR
         CBC -> Hb
         FLP -> Cholesterol

   10. Existing registered identity fields are preserved.

   11. Missing master metadata must NOT destroy the
       registered record.

   12. Enrichment is additive.

   ========================================================== */

import {
  resolveVerifiedMaster,
  resolveMasterTest,
  masterMatchesRequestedTest,
  getResolvedMasterId,
} from "./masterTestService";

import {
  getPanelParameters,
  getPanelChildren,
  resolvePanelId,
  resolvePanelName,
  normalizePanelParameters,
} from "./panelParameterService";

import {
  normalizeRegisteredTest,
  normalizeRegisteredTests,
  getRegisteredTestId,
  getRegisteredMasterTestId,
  getRegisteredChildTestId,
  getRegisteredPanelId,
  isRegisteredPanel,
  getRegisteredTestName,
  getRegisteredPanelName,
  getRegisteredParameters,
} from "./registeredTestNormalizer";

import {
  isPanelTest,
  isSingleTest,
  getTestIdentity,
  getMasterTestId,
  getChildTestId,
  getPanelId,
  toNumericId,
  firstIdentityValue,
} from "./testIdentity";

import {
  normalizeTestName,
  normalizePanelName,
  normalizeDepartment,
  normalizeResultType,
  normalizeTestType,
  getCanonicalTestName,
  getCanonicalPanelName,
} from "./testNormalization";


/* ==========================================================
   INTERNAL HELPERS
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
 * Safely convert a value to string.
 */
function text(value) {
  return String(
    value ?? ""
  ).trim();
}


/**
 * Return a safe object.
 */
function objectOrEmpty(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  )
    ? value
    : {};
}


/**
 * Return a safe array.
 */
function arrayOrEmpty(value) {
  return Array.isArray(value)
    ? value
    : [];
}


/**
 * Resolve a numeric ID without throwing.
 */
function numericId(value) {
  try {
    return toNumericId(value);
  } catch {
    return null;
  }
}


/**
 * Safely normalize a test name.
 */
function safeTestName(value) {
  const raw = text(value);

  if (!raw) {
    return "";
  }

  try {
    return normalizeTestName(raw);
  } catch {
    return raw;
  }
}


/**
 * Safely normalize a panel name.
 */
function safePanelName(value) {
  const raw = text(value);

  if (!raw) {
    return "";
  }

  try {
    return normalizePanelName(raw);
  } catch {
    return raw;
  }
}


/**
 * Canonical test identity.
 */
function canonicalTest(value) {
  const raw = text(value);

  if (!raw) {
    return "";
  }

  try {
    return text(
      getCanonicalTestName(raw)
    );
  } catch {
    return safeTestName(raw);
  }
}


/**
 * Canonical panel identity.
 */
function canonicalPanel(value) {
  const raw = text(value);

  if (!raw) {
    return "";
  }

  try {
    return text(
      getCanonicalPanelName(raw)
    );
  } catch {
    return safePanelName(raw);
  }
}


/* ==========================================================
   REGISTERED IDENTITY
   ========================================================== */


/**
 * Extract the authoritative registered identity.
 *
 * IMPORTANT:
 *
 * This function intentionally reads identity from the
 * registered record BEFORE master metadata is considered.
 */
function getRegisteredIdentity(
  registeredTest
) {
  const record =
    objectOrEmpty(
      registeredTest
    );

  const testName =
    text(
      firstValue(
        record.test_name,
        record.testName,
        record.name
      )
    );

  const panelName =
    text(
      firstValue(
        record.panel_name,
        record.panelName
      )
    );

  const masterTestId =
    numericId(
      firstValue(
        record.master_test_id,
        record.masterTestId,
        record.master_test?.id,
        record.masterTest?.test_id
      )
    );

  const childTestId =
    numericId(
      firstValue(
        record.child_test_id,
        record.childTestId,
        record.panel_test_id,
        record.panelTestId,
        record.child_id
      )
    );

  const panelId =
    numericId(
      firstValue(
        record.panel_id,
        record.panelId
      )
    );

  const registeredId =
    numericId(
      getRegisteredTestId(
        record
      )
    );

  /*
   * IMPORTANT:
   *
   * Panel classification is obtained from the registered
   * record first.
   *
   * We do NOT classify a child as a panel merely because
   * panel_id or panel_name exists.
   */
  let panel =
    false;

  try {
    panel =
      isRegisteredPanel(
        record
      ) === true;
  } catch {
    panel = false;
  }

  /*
   * If the normalizer does not provide explicit panel
   * identity, use genuine panel identity only.
   *
   * A panel_name by itself is NOT enough.
   */
  if (!panel) {
    try {
      panel =
        isPanelTest(
          record
        ) === true;
    } catch {
      panel = false;
    }
  }

  /*
   * A child identity must never become a panel merely
   * because panel metadata exists.
   */
  if (
    childTestId !== null &&
    panel !== true
  ) {
    panel = false;
  }

  return {
    registeredId,

    testName,

    panelName,

    masterTestId,

    childTestId,

    panelId,

    isPanel: panel === true,

    isSingle: panel !== true,

    canonicalTestName:
      canonicalTest(
        testName
      ),

    canonicalPanelName:
      canonicalPanel(
        panelName
      ),
  };
}


/* ==========================================================
   MASTER IDENTITY VERIFICATION
   ========================================================== */


/**
 * Verify that the resolved master belongs to the
 * registered report identity.
 */
function verifyMasterIdentity(
  identity,
  master
) {
  if (
    !identity ||
    !master
  ) {
    return false;
  }

  if (
    !identity.testName
  ) {
    return false;
  }

  /*
   * Central verification.
   */
  try {
    if (
      masterMatchesRequestedTest(
        identity.testName,
        master
      )
    ) {
      /*
       * A registered panel must resolve to a genuine
       * panel master.
       */
      if (
        identity.isPanel &&
        !isPanelTest(
          master
        )
      ) {
        return false;
      }

      /*
       * A registered single test must never be converted
       * into a panel merely because its master has panel
       * metadata.
       */
      if (
        identity.isSingle &&
        isPanelTest(
          master
        )
      ) {
        /*
         * This is only unsafe if the master identity itself
         * is actually the panel. A single registered child
         * must remain a child.
         */
        const registeredCanonical =
          identity.canonicalTestName;

        const masterCanonical =
          canonicalTest(
            master.test_name
          );

        if (
          registeredCanonical !==
          masterCanonical
        ) {
          return false;
        }
      }

      return true;
    }
  } catch {
    /* Continue with explicit comparison. */
  }

  /*
   * Explicit canonical identity fallback.
   */
  const registeredCanonical =
    identity.canonicalTestName;

  const masterCanonical =
    canonicalTest(
      master.test_name
    );

  if (
    !registeredCanonical ||
    !masterCanonical
  ) {
    return false;
  }

  if (
    registeredCanonical !==
    masterCanonical
  ) {
    return false;
  }

  /*
   * Panel requires genuine panel master.
   */
  if (
    identity.isPanel &&
    !isPanelTest(
      master
    )
  ) {
    return false;
  }

  return true;
}


/* ==========================================================
   MASTER METADATA
   ========================================================== */


/**
 * Copy metadata from master without replacing
 * registered identity.
 */
function buildMasterMetadata(
  master
) {
  if (
    !master ||
    typeof master !==
      "object"
  ) {
    return {};
  }

  return {
    /*
     * Master identity references.
     */
    master_test_id:
      numericId(
        master.id
      ),

    /*
     * Metadata.
     */
    department:
      firstValue(
        master.department
      ),

    test_type:
      normalizeTestType(
        master.test_type
      ),

    result_type:
      normalizeResultType(
        master.result_type
      ),

    unit:
      firstValue(
        master.unit
      ),

    male_range:
      firstValue(
        master.male_range
      ),

    female_range:
      firstValue(
        master.female_range
      ),

    child_range:
      firstValue(
        master.child_range
      ),

    elderly_range:
      firstValue(
        master.elderly_range
      ),

    reference_value:
      firstValue(
        master.reference_value
      ),

    result_category:
      firstValue(
        master.result_category
      ),

    result_template:
      firstValue(
        master.result_template
      ),

    template_type:
      firstValue(
        master.template_type
      ),

    panel_price:
      firstValue(
        master.panel_price
      ),

    single_test_price:
      firstValue(
        master.single_test_price
      ),

    active_status:
      firstValue(
        master.active_status
      ),

    /*
     * Keep master metadata available explicitly.
     */
    master_test:
      master,
  };
}


/* ==========================================================
   PANEL RESOLUTION
   ========================================================== */


/**
 * Resolve parameters for a registered panel.
 *
 * IMPORTANT:
 *
 * This function is never called for a registered single
 * test.
 */
async function resolveRegisteredPanelParameters(
  registered,
  identity,
  master
) {
  if (
    !identity.isPanel
  ) {
    return [];
  }

  /*
   * Determine the panel identity.
   *
   * Registered identity wins.
   */
  const panelId =
    identity.panelId ??
    numericId(
      getPanelId(
        registered
      )
    );

  const panelName =
    identity.panelName ||
    text(
      master?.test_name
    );

  console.log(
    "[registeredTestEnrichment] PANEL PARAMETER RESOLUTION:",
    {
      registeredId:
        identity.registeredId,

      testName:
        identity.testName,

      panelName,

      panelId,

      masterId:
        numericId(
          master?.id
        ),
    }
  );


  /* ========================================================
     1. PANEL ID
     ======================================================== */

  if (
    panelId !== null
  ) {
    try {
      const result =
        await getPanelParameters(
          panelId
        );

      const parameters =
        extractParameterData(
          result
        );

      if (
        parameters.length >
        0
      ) {
        return normalizeParameters(
          parameters
        );
      }
    } catch (
      error
    ) {
      console.warn(
        "[registeredTestEnrichment] Panel parameter lookup by ID failed:",
        {
          panelId,
          error,
        }
      );
    }
  }


  /* ========================================================
     2. PANEL NAME
     ======================================================== */

  if (
    panelName
  ) {
    try {
      const result =
        await getPanelParameters(
          panelName
        );

      const parameters =
        extractParameterData(
          result
        );

      if (
        parameters.length >
        0
      ) {
        return normalizeParameters(
          parameters
        );
      }
    } catch (
      error
    ) {
      console.warn(
        "[registeredTestEnrichment] Panel parameter lookup by name failed:",
        {
          panelName,
          error,
        }
      );
    }
  }


  /* ========================================================
     3. PANEL CHILDREN
     ======================================================== */

  try {
    const children =
      await getPanelChildren(
        panelId ??
          panelName
      );

    const parameters =
      extractParameterData(
        children
      );

    if (
      parameters.length >
      0
    ) {
      return normalizeParameters(
        parameters
      );
    }
  } catch (
    error
  ) {
    console.warn(
      "[registeredTestEnrichment] Panel child lookup failed:",
      {
        panelId,
        panelName,
        error,
      }
    );
  }

  console.warn(
    "[registeredTestEnrichment] Panel has no resolved parameters:",
    {
      registeredId:
        identity.registeredId,

      testName:
        identity.testName,

      panelName:
        identity.panelName,

      panelId:
        identity.panelId,

      masterId:
        master?.id,
    }
  );

  return [];
}


/**
 * Extract array data from different service response shapes.
 */
function extractParameterData(
  result
) {
  if (
    Array.isArray(result)
  ) {
    return result;
  }

  if (
    result &&
    typeof result === "object"
  ) {
    if (
      Array.isArray(
        result.data
      )
    ) {
      return result.data;
    }

    if (
      Array.isArray(
        result.parameters
      )
    ) {
      return result.parameters;
    }

    if (
      Array.isArray(
        result.children
      )
    ) {
      return result.children;
    }
  }

  return [];
}


/**
 * Normalize parameter collection safely.
 */
function normalizeParameters(
  parameters
) {
  const safe =
    arrayOrEmpty(
      parameters
    );

  if (
    safe.length ===
    0
  ) {
    return [];
  }

  try {
    const normalized =
      normalizePanelParameters(
        safe
      );

    return arrayOrEmpty(
      normalized
    );
  } catch {
    return safe;
  }
}


/* ==========================================================
   REGISTERED RECORD CONSTRUCTION
   ========================================================== */


/**
 * Preserve registered identity while adding metadata.
 */
function buildEnrichedRecord(
  registered,
  identity,
  master,
  parameters
) {
  const original =
    objectOrEmpty(
      registered
    );

  const metadata =
    buildMasterMetadata(
      master
    );

  /*
   * IMPORTANT:
   *
   * Spread the original record FIRST.
   *
   * Identity fields are then explicitly restored below.
   */
  const enriched = {
    ...original,

    ...metadata,

    /*
     * ------------------------------------------------------
     * AUTHORITATIVE REGISTERED IDENTITY
     * ------------------------------------------------------
     */

    test_name:
      identity.testName ||
      original.test_name,

    testName:
      identity.testName ||
      original.testName,

    panel_name:
      identity.panelName ||
      original.panel_name,

    panelName:
      identity.panelName ||
      original.panelName,

    /*
     * Registered IDs remain authoritative.
     */
    id:
      identity.registeredId ??
      original.id,

    registered_test_id:
      identity.registeredId ??
      original.registered_test_id,

    registeredTestId:
      identity.registeredId ??
      original.registeredTestId,

    /*
     * Master ID may be populated from verified metadata,
     * but never from an unrelated child.
     */
    master_test_id:
      identity.masterTestId ??
      numericId(
        master?.id
      ) ??
      original.master_test_id,

    masterTestId:
      identity.masterTestId ??
      numericId(
        master?.id
      ) ??
      original.masterTestId,

    /*
     * Child identity remains child identity.
     */
    child_test_id:
      identity.childTestId ??
      original.child_test_id,

    childTestId:
      identity.childTestId ??
      original.childTestId,

    /*
     * Panel identity remains explicit.
     */
    panel_id:
      identity.panelId ??
      original.panel_id,

    panelId:
      identity.panelId ??
      original.panelId,

    /*
     * Classification.
     */
    is_panel:
      identity.isPanel,

    isPanel:
      identity.isPanel,

    is_single:
      identity.isSingle,

    isSingle:
      identity.isSingle,

    /*
     * Parameters belong only to panels.
     */
    parameters:
      identity.isPanel
        ? arrayOrEmpty(
            parameters
          )
        : arrayOrEmpty(
            getRegisteredParameters(
              original
            )
          ),

    panel_parameters:
      identity.isPanel
        ? arrayOrEmpty(
            parameters
          )
        : arrayOrEmpty(
            original.panel_parameters
          ),
  };


  /*
   * Keep the resolved master explicitly available.
   */
  if (
    master
  ) {
    enriched.resolved_master =
      master;

    enriched.resolvedMaster =
      master;
  }

  /*
   * Canonical identity fields are diagnostic/useful,
   * but do not replace display identity.
   */
  enriched.canonical_test_name =
    identity.canonicalTestName;

  enriched.canonical_panel_name =
    identity.canonicalPanelName;

  return enriched;
}


/* ==========================================================
   ENRICH ONE REGISTERED TEST
   ========================================================== */


/**
 * Enrich one registered test.
 *
 * This is the primary public operation.
 */
export async function enrichOneRegisteredTest(
  registeredTest
) {
  if (
    !registeredTest ||
    typeof registeredTest !==
      "object"
  ) {
    return null;
  }


  /* ========================================================
     1. NORMALIZE REGISTERED RECORD
     ======================================================== */

  let normalized;

  try {
    normalized =
      normalizeRegisteredTest(
        registeredTest
      );
  } catch (
    error
  ) {
    console.warn(
      "[registeredTestEnrichment] Registered test normalization failed:",
      error
    );

    /*
     * Do not destroy the original record.
     */
    normalized =
      {
        ...registeredTest,
      };
  }

  if (
    !normalized ||
    typeof normalized !==
      "object"
  ) {
    normalized =
      {
        ...registeredTest,
      };
  }


  /* ========================================================
     2. EXTRACT AUTHORITATIVE IDENTITY
     ======================================================== */

  const identity =
    getRegisteredIdentity(
      normalized
    );

  console.log(
    "[registeredTestEnrichment] REGISTERED IDENTITY:",
    {
      registeredId:
        identity.registeredId,

      testName:
        identity.testName,

      panelName:
        identity.panelName,

      masterTestId:
        identity.masterTestId,

      childTestId:
        identity.childTestId,

      panelId:
        identity.panelId,

      isPanel:
        identity.isPanel,

      isSingle:
        identity.isSingle,
    }
  );


  if (
    !identity.testName
  ) {
    console.warn(
      "[registeredTestEnrichment] Registered test has no report identity:",
      normalized
    );

    return {
      ...normalized,
      parameters:
        identity.isPanel
          ? []
          : arrayOrEmpty(
              getRegisteredParameters(
                normalized
              )
            ),
    };
  }


  /* ========================================================
     3. RESOLVE MASTER
     ======================================================== */

  let master =
    null;

  try {
    master =
      await resolveVerifiedMaster(
        normalized
      );
  } catch (
    error
  ) {
    console.warn(
      "[registeredTestEnrichment] Verified master resolution failed:",
      {
        identity,
        error,
      }
    );
  }


  /*
   * Fallback to normal resolver only when verified
   * resolver did not produce a master.
   */
  if (
    !master
  ) {
    try {
      master =
        await resolveMasterTest(
          normalized
        );
    } catch (
      error
    ) {
      console.warn(
        "[registeredTestEnrichment] Master resolution failed:",
        {
          identity,
          error,
        }
      );
    }
  }


  /* ========================================================
     4. FINAL MASTER VERIFICATION
     ======================================================== */

  if (
    master &&
    !verifyMasterIdentity(
      identity,
      master
    )
  ) {
    console.warn(
      "[registeredTestEnrichment] Resolved master rejected because it does not match report identity:",
      {
        registered:
          {
            id:
              identity.registeredId,

            test_name:
              identity.testName,

            panel_name:
              identity.panelName,

            master_test_id:
              identity.masterTestId,

            child_test_id:
              identity.childTestId,

            panel_id:
              identity.panelId,

            is_panel:
              identity.isPanel,
          },

        master:
          {
            id:
              master?.id,

            test_name:
              master?.test_name,

            panel_name:
              master?.panel_name,

            test_type:
              master?.test_type,

            is_panel:
              master?.is_panel,
          },
      }
    );

    master =
      null;
  }


  /* ========================================================
     5. CLASSIFICATION
     ======================================================== */

  console.log(
    "[registeredTestEnrichment] CLASSIFICATION:",
    {
      testName:
        identity.testName,

      panelName:
        identity.panelName,

      isPanel:
        identity.isPanel,

      isSingle:
        identity.isSingle,

      masterName:
        master?.test_name,

      masterId:
        master?.id,
    }
  );


  /* ========================================================
     6. PANEL PARAMETER RESOLUTION
     ======================================================== */

  let parameters = [];

  if (
    identity.isPanel
  ) {
    parameters =
      await resolveRegisteredPanelParameters(
        normalized,
        identity,
        master
      );

    console.log(
      "[registeredTestEnrichment] PANEL ENRICHED:",
      {
        testName:
          identity.testName,

        panelName:
          identity.panelName,

        masterId:
          master?.id,

        parameterCount:
          parameters.length,
      }
    );
  }


  /* ========================================================
     7. BUILD FINAL RECORD
     ======================================================== */

  const enriched =
    buildEnrichedRecord(
      normalized,
      identity,
      master,
      parameters
    );


  /*
   * IMPORTANT:
   *
   * If no master was found, retain the registered record.
   *
   * A failed enrichment must never erase a registered test.
   */
  if (
    !master
  ) {
    enriched.master_resolution_failed =
      true;

    enriched.masterResolutionFailed =
      true;
  } else {
    enriched.master_resolution_failed =
      false;

    enriched.masterResolutionFailed =
      false;
  }


  /*
   * Explicitly retain registered identity one final time.
   */
  enriched.test_name =
    identity.testName;

  enriched.panel_name =
    identity.panelName;

  enriched.is_panel =
    identity.isPanel;

  enriched.isPanel =
    identity.isPanel;

  enriched.is_single =
    identity.isSingle;

  enriched.isSingle =
    identity.isSingle;

  return enriched;
}


/* ==========================================================
   ENRICH MANY REGISTERED TESTS
   ========================================================== */


/**
 * Enrich a collection of registered tests.
 *
 * Every record is processed independently.
 *
 * One failed master resolution must NOT remove the others.
 */
export async function enrichRegisteredTests(
  registeredTests
) {
  if (
    !Array.isArray(
      registeredTests
    )
  ) {
    return [];
  }

  const normalized =
    (() => {
      try {
        return normalizeRegisteredTests(
          registeredTests
        );
      } catch (
        error
      ) {
        console.warn(
          "[registeredTestEnrichment] Registered tests normalization failed:",
          error
        );

        return registeredTests;
      }
    })();

  const source =
    Array.isArray(
      normalized
    )
      ? normalized
      : registeredTests;

  const enriched =
    [];

  for (
    const registeredTest of
      source
  ) {
    try {
      const item =
        await enrichOneRegisteredTest(
          registeredTest
        );

      if (
        item
      ) {
        enriched.push(
          item
        );
      }
    } catch (
      error
    ) {
      /*
       * CRITICAL:
       *
       * Never lose a registered test because enrichment
       * failed.
       */
      console.error(
        "[registeredTestEnrichment] Failed to enrich registered test:",
        {
          registeredTest,
          error,
        }
      );

      enriched.push(
        {
          ...registeredTest,

          master_resolution_failed:
            true,

          masterResolutionFailed:
            true,
        }
      );
    }
  }

  console.log(
    "[registeredTestEnrichment] ENRICHED REGISTERED TESTS:",
    enriched
  );

  return enriched;
}


/* ==========================================================
   RESOLVE TEST
   ----------------------------------------------------------
   Compatibility helper.
   ========================================================== */


/**
 * Resolve a registered test into its enriched representation.
 */
export async function resolveTest(
  registeredTest
) {
  return await enrichOneRegisteredTest(
    registeredTest
  );
}


/* ==========================================================
   GET ENRICHED PARAMETERS
   ========================================================== */


/**
 * Return parameters belonging to an enriched test.
 *
 * Parameters are returned only when the registered record
 * is genuinely a panel.
 */
export function getEnrichedParameters(
  registeredTest
) {
  if (
    !registeredTest ||
    typeof registeredTest !==
      "object"
  ) {
    return [];
  }

  /*
   * Registered identity controls classification.
   */
  let panel = false;

  try {
    panel =
      isRegisteredPanel(
        registeredTest
      ) === true;
  } catch {
    panel =
      registeredTest.is_panel === true ||
      registeredTest.isPanel === true;
  }

  if (
    !panel
  ) {
    return [];
  }

  const parameters =
    firstValue(
      registeredTest.parameters,
      registeredTest.panel_parameters,
      registeredTest.panelParameters
    );

  return arrayOrEmpty(
    parameters
  );
}


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

const registeredTestEnrichment = {
  enrichOneRegisteredTest,

  enrichRegisteredTests,

  resolveTest,

  getEnrichedParameters,
};

export default registeredTestEnrichment;