/* ==========================================================
   PEFA LAB
   PANEL PARAMETER SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Resolve the PARAMETERS belonging to a registered PANEL.

   ARCHITECTURE

      REGISTERED TEST
            |
            |-- PANEL
            |
            +---- PANEL PARAMETERS
                    |
                    +---- CHILD MASTER TEST

   ==========================================================
   IDENTITY RULES
   ==========================================================

   1. Registered-test identity is authoritative.

   2. A child master remains a child.

      AST
        panel_name = LFT
        panel_id   = LFT_ID

      is STILL:

        AST

      It is NOT:

        LFT

   3. panel_id / panel_name on a child are relationship
      metadata only.

   4. A panel must be resolved through a genuine panel
      master.

   5. panel_tests defines the children/parameters belonging
      to the panel.

   6. This service never promotes a panel child into a panel.

   7. If panel identity cannot be safely established,
      return an empty parameter collection.

   8. Never infer panel identity from the first child.

   ========================================================== */

import { supabase } from "../../supabase";

import {
  normalizeTestName,
  getCanonicalTestName,
  getCanonicalPanelName,
} from "./testNormalization";

import {
  isPanelTest,
  normalizeIdentityName,
  getCanonicalPanelIdentity,
  getPanelId,
  toNumericId,
  firstIdentityValue,
} from "./testIdentity";

import {
  findPanelMasterCandidates,
} from "./masterTestService";


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
 * Safely normalize text.
 */
function normalizeTextValue(value) {
  const raw =
    String(
      value ?? ""
    ).trim();

  if (!raw) {
    return "";
  }

  try {
    const normalized =
      normalizeTestName(
        raw
      );

    if (normalized) {
      return normalizeIdentityName(
        normalized
      );
    }
  } catch {
    /* Fall through. */
  }

  return normalizeIdentityName(
    raw
  );
}


/**
 * Canonical test identity.
 */
function canonicalTest(value) {
  const raw =
    String(
      value ?? ""
    ).trim();

  if (!raw) {
    return "";
  }

  try {
    const canonical =
      getCanonicalTestName(
        raw
      );

    if (canonical) {
      return normalizeIdentityName(
        canonical
      );
    }
  } catch {
    /* Fall through. */
  }

  return normalizeTextValue(
    raw
  );
}


/**
 * Canonical panel identity.
 */
function canonicalPanel(value) {
  const raw =
    String(
      value ?? ""
    ).trim();

  if (!raw) {
    return "";
  }

  try {
    const canonical =
      getCanonicalPanelName(
        raw
      );

    if (canonical) {
      return normalizeIdentityName(
        canonical
      );
    }
  } catch {
    /* Fall through. */
  }

  try {
    return getCanonicalPanelIdentity(
      raw
    );
  } catch {
    return normalizeIdentityName(
      raw
    );
  }
}


/**
 * Safely convert an ID.
 */
function numericId(value) {
  return toNumericId(
    value
  );
}


/**
 * Return a normalized array.
 */
function safeArray(value) {
  return Array.isArray(
    value
  )
    ? value
    : [];
}


/**
 * Return active status.
 */
function isActiveRecord(record) {
  if (
    !record ||
    typeof record !==
      "object"
  ) {
    return true;
  }

  const value =
    record.active_status ??
    record.activeStatus ??
    record.active;

  /*
   * Missing active metadata should not invalidate
   * an otherwise valid database record.
   */
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return true;
  }

  if (
    value === true ||
    value === 1
  ) {
    return true;
  }

  return (
    String(value)
      .trim()
      .toLowerCase() ===
      "active" ||
    String(value)
      .trim()
      .toLowerCase() ===
      "true" ||
    String(value)
      .trim() ===
      "1"
  );
}


/* ==========================================================
   PANEL IDENTITY EXTRACTION
   ========================================================== */

/**
 * Extract an explicit panel ID from a panel-like object.
 *
 * IMPORTANT:
 *
 * This function does not decide whether the object is a
 * panel. It only extracts an ID.
 */
function extractPanelId(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value !==
    "object"
  ) {
    return numericId(
      value
    );
  }

  return (
    numericId(
      firstValue(
        value.panel_id,
        value.panelId,
        value.panel_master_id,
        value.panelMasterId,
        value.panel_test_id,
        value.panelTestId,
        value.panel?.id,
        value.panel_master?.id,
        value.panelMaster?.id
      )
    ) ??
    null
  );
}


/**
 * Extract the registered panel name.
 *
 * Identity order intentionally favours explicit panel
 * identity fields over child metadata.
 */
function extractPanelName(
  registeredTest
) {
  if (
    !registeredTest ||
    typeof registeredTest !==
      "object"
  ) {
    return "";
  }

  const explicit =
    firstValue(
      registeredTest.registered_panel_name,
      registeredTest.registeredPanelName,
      registeredTest.report_panel_name,
      registeredTest.reportPanelName,
      registeredTest.panel_name,
      registeredTest.panelName,
      registeredTest.panel?.test_name,
      registeredTest.panel?.name,
      registeredTest.panel_master?.test_name,
      registeredTest.panel_master?.panel_name,
      registeredTest.panelMaster?.test_name,
      registeredTest.panelMaster?.panel_name
    );

  return String(
    explicit ?? ""
  ).trim();
}


/**
 * Determine whether a registered object explicitly
 * identifies itself as a panel.
 *
 * We intentionally do NOT use panel_name alone as proof.
 */
function registeredObjectIsPanel(
  registeredTest
) {
  if (
    !registeredTest ||
    typeof registeredTest !==
      "object"
  ) {
    return false;
  }

  if (
    registeredTest.is_panel ===
      true ||
    registeredTest.isPanel ===
      true
  ) {
    return true;
  }

  if (
    String(
      registeredTest.test_type ??
      registeredTest.testType ??
      ""
    )
      .trim()
      .toLowerCase() ===
    "panel"
  ) {
    return true;
  }

  /*
   * testIdentity is the central identity authority.
   */
  try {
    if (
      isPanelTest(
        registeredTest
      )
    ) {
      return true;
    }
  } catch {
    /* Ignore identity helper failure. */
  }

  return false;
}


/* ==========================================================
   PANEL MASTER VERIFICATION
   ========================================================== */

/**
 * Verify a panel master.
 *
 * A panel master must actually be a panel.
 */
function isVerifiedPanelMaster(
  panelMaster,
  requestedName
) {
  if (
    !panelMaster ||
    typeof panelMaster !==
      "object"
  ) {
    return false;
  }

  if (
    !isPanelTest(
      panelMaster
    )
  ) {
    return false;
  }

  const requestedCanonical =
    canonicalPanel(
      requestedName
    );

  if (
    !requestedCanonical
  ) {
    return false;
  }

  const masterTestName =
    canonicalTest(
      panelMaster.test_name
    );

  const masterPanelName =
    canonicalPanel(
      panelMaster.panel_name
    );

  /*
   * Normal panel-master representation:
   *
   * LFT.test_name = LFT
   */
  if (
    masterTestName ===
    requestedCanonical
  ) {
    return true;
  }

  /*
   * Alternative schema representation where panel_name
   * carries the canonical panel identity.
   */
  if (
    masterPanelName ===
      requestedCanonical &&
    masterTestName ===
      requestedCanonical
  ) {
    return true;
  }

  return false;
}


/**
 * Resolve the genuine panel master.
 *
 * This is deliberately conservative.
 */
async function resolveVerifiedPanelMaster(
  registeredTest,
  panelName
) {
  const requestedName =
    String(
      panelName ?? ""
    ).trim();

  if (
    !requestedName
  ) {
    return null;
  }

  const explicitPanelId =
    extractPanelId(
      registeredTest
    );

  /*
   * --------------------------------------------------------
   * 1. Explicit panel ID
   * --------------------------------------------------------
   *
   * An explicit ID is useful only after verification.
   */
  if (
    explicitPanelId !==
    null
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from("master_tests")
        .select("*")
        .eq(
          "id",
          explicitPanelId
        )
        .maybeSingle();

    if (
      !error &&
      data &&
      isVerifiedPanelMaster(
        data,
        requestedName
      )
    ) {
      return data;
    }

    if (
      data &&
      !isVerifiedPanelMaster(
        data,
        requestedName
      )
    ) {
      console.warn(
        "[panelParameterService] Explicit panel ID rejected:",
        {
          requestedPanel:
            requestedName,

          explicitPanelId,

          returnedId:
            data.id,

          returnedTest:
            data.test_name,

          returnedPanel:
            data.panel_name,

          isPanel:
            isPanelTest(
              data
            ),
        }
      );
    }
  }


  /* --------------------------------------------------------
     2. Master-test candidate resolution
     -------------------------------------------------------- */

  const {
    data:
      candidates,
    error:
      candidateError,
  } =
    await findPanelMasterCandidates(
      requestedName
    );

  if (
    candidateError
  ) {
    console.warn(
      "[panelParameterService] Panel master candidate lookup failed:",
      {
        requestedPanel:
          requestedName,

        error:
          candidateError,
      }
    );

    return null;
  }

  const verified =
    safeArray(
      candidates
    ).filter(
      (
        candidate
      ) =>
        isVerifiedPanelMaster(
          candidate,
          requestedName
        )
    );

  if (
    verified.length ===
    1
  ) {
    return verified[0];
  }

  if (
    verified.length >
    1
  ) {
    /*
     * Prefer exact test identity.
     */
    const requestedCanonical =
      canonicalPanel(
        requestedName
      );

    const exact =
      verified.filter(
        (
          candidate
        ) =>
          canonicalTest(
            candidate.test_name
          ) ===
          requestedCanonical
      );

    if (
      exact.length ===
      1
    ) {
      return exact[0];
    }

    console.warn(
      "[panelParameterService] Ambiguous panel master resolution:",
      {
        requestedPanel:
          requestedName,

        candidates:
          verified.map(
            (
              item
            ) => ({
              id:
                item?.id,

              test_name:
                item?.test_name,

              panel_name:
                item?.panel_name,

              test_type:
                item?.test_type,

              is_panel:
                item?.is_panel,
            })
          ),
      }
    );

    return null;
  }

  return null;
}


/* ==========================================================
   PANEL NAME / ID PUBLIC RESOLUTION
   ========================================================== */

/**
 * Resolve a genuine panel ID.
 *
 * IMPORTANT:
 *
 * A child's panel_id is not automatically accepted as the
 * panel identity. It must point to a verified panel master.
 */
export async function resolvePanelId(
  panelOrName
) {
  if (
    panelOrName ===
      null ||
    panelOrName ===
      undefined
  ) {
    return null;
  }

  /*
   * String / numeric input.
   */
  if (
    typeof panelOrName !==
    "object"
  ) {
    const requestedName =
      String(
        panelOrName
      ).trim();

    if (
      !requestedName
    ) {
      return null;
    }

    const master =
      await resolveVerifiedPanelMaster(
        null,
        requestedName
      );

    return numericId(
      master?.id
    );
  }

  /*
   * Already a genuine panel master.
   */
  if (
    isPanelTest(
      panelOrName
    )
  ) {
    const name =
      String(
        firstValue(
          panelOrName.test_name,
          panelOrName.panel_name
        ) ?? ""
      ).trim();

    if (
      name
    ) {
      const verified =
        await resolveVerifiedPanelMaster(
          panelOrName,
          name
        );

      return numericId(
        verified?.id
      );
    }
  }

  /*
   * Registered panel object.
   */
  const panelName =
    extractPanelName(
      panelOrName
    );

  if (
    !panelName
  ) {
    return null;
  }

  /*
   * Only an object explicitly classified as a panel
   * should use its panel metadata as report identity.
   */
  if (
    !registeredObjectIsPanel(
      panelOrName
    )
  ) {
    return null;
  }

  const master =
    await resolveVerifiedPanelMaster(
      panelOrName,
      panelName
    );

  return numericId(
    master?.id
  );
}


/**
 * Resolve the canonical panel name.
 */
export async function resolvePanelName(
  panelOrName
) {
  if (
    panelOrName ===
      null ||
    panelOrName ===
      undefined
  ) {
    return "";
  }

  /*
   * Direct string.
   */
  if (
    typeof panelOrName !==
    "object"
  ) {
    const raw =
      String(
        panelOrName
      ).trim();

    if (
      !raw
    ) {
      return "";
    }

    const master =
      await resolveVerifiedPanelMaster(
        null,
        raw
      );

    if (
      master
    ) {
      return String(
        firstValue(
          master.test_name,
          master.panel_name
        ) ?? ""
      ).trim();
    }

    return "";
  }

  /*
   * Existing genuine panel master.
   */
  if (
    isPanelTest(
      panelOrName
    )
  ) {
    const raw =
      String(
        firstValue(
          panelOrName.test_name,
          panelOrName.panel_name
        ) ?? ""
      ).trim();

    if (
      raw
    ) {
      const master =
        await resolveVerifiedPanelMaster(
          panelOrName,
          raw
        );

      if (
        master
      ) {
        return String(
          firstValue(
            master.test_name,
            master.panel_name
          ) ?? ""
        ).trim();
      }
    }
  }

  /*
   * Registered test.
   */
  if (
    !registeredObjectIsPanel(
      panelOrName
    )
  ) {
    return "";
  }

  const panelName =
    extractPanelName(
      panelOrName
    );

  if (
    !panelName
  ) {
    return "";
  }

  const master =
    await resolveVerifiedPanelMaster(
      panelOrName,
      panelName
    );

  if (
    !master
  ) {
    return "";
  }

  return String(
    firstValue(
      master.test_name,
      master.panel_name
    ) ?? ""
  ).trim();
}


/* ==========================================================
   PANEL PARAMETER NORMALIZATION
   ========================================================== */

/**
 * Normalize one panel parameter.
 *
 * The returned object deliberately keeps both:
 *
 *   parameter identity
 *   child master identity
 *
 * separate.
 */
export function normalizePanelParameter(
  parameter,
  index = 0
) {
  if (
    !parameter ||
    typeof parameter !==
      "object"
  ) {
    return null;
  }

  const child =
    parameter.master_test ??
    parameter.masterTest ??
    parameter.child_test ??
    parameter.childTest ??
    parameter.test ??
    null;

  const childId =
    numericId(
      firstValue(
        parameter.child_test_id,
        parameter.childTestId,
        parameter.master_test_id,
        parameter.masterTestId,
        parameter.test_id,
        parameter.testId,
        child?.id
      )
    );

  const parameterId =
    numericId(
      firstValue(
        parameter.id,
        parameter.panel_parameter_id,
        parameter.panelParameterId
      )
    );

  const parameterName =
    String(
      firstValue(
        parameter.parameter_name,
        parameter.parameterName,
        parameter.test_name,
        parameter.testName,
        parameter.name,
        child?.test_name,
        child?.testName
      ) ?? ""
    ).trim();

  const normalizedChildName =
    canonicalTest(
      parameterName
    );

  const position =
    Number(
      firstValue(
        parameter.display_order,
        parameter.displayOrder,
        parameter.sort_order,
        parameter.sortOrder,
        parameter.sequence,
        index + 1
      )
    );

  return {
    ...parameter,

    id:
      parameterId,

    parameter_id:
      parameterId,

    child_test_id:
      childId,

    master_test_id:
      childId,

    parameter_name:
      parameterName,

    test_name:
      parameterName,

    testName:
      parameterName,

    canonical_test_name:
      normalizedChildName,

    display_order:
      Number.isFinite(
        position
      )
        ? position
        : index + 1,

    /*
     * Explicitly preserve child identity.
     */
    is_panel:
      false,

    isPanel:
      false,

    child_test:
      child ??
      undefined,
  };
}


/**
 * Normalize all parameters.
 */
export function normalizePanelParameters(
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
        normalizePanelParameter(
          parameter,
          index
        )
    )
    .filter(
      Boolean
    )
    .sort(
      (
        a,
        b
      ) =>
        (
          Number(
            a.display_order
          ) || 0
        ) -
        (
          Number(
            b.display_order
          ) || 0
        )
    );
}


/* ==========================================================
   PANEL TEST DATABASE LOADING
   ========================================================== */

/**
 * Load panel_tests rows for a verified panel.
 *
 * This function does NOT decide panel identity.
 *
 * It receives an already verified panel ID.
 */
async function loadPanelTestRows(
  panelId
) {
  const numericPanelId =
    numericId(
      panelId
    );

  if (
    numericPanelId ===
    null
  ) {
    return {
      data: [],
      error: null,
    };
  }

  /*
   * Primary relationship:
   *
   * panel_tests.panel_id
   */
  const {
    data,
    error,
  } =
    await supabase
      .from("panel_tests")
      .select("*")
      .eq(
        "panel_id",
        numericPanelId
      )
      .order(
        "display_order",
        {
          ascending:
            true,
        }
      );

  if (
    error
  ) {
    console.warn(
      "[panelParameterService] panel_tests lookup failed:",
      {
        panelId:
          numericPanelId,

        error,
      }
    );
  }

  return {
    data:
      safeArray(
        data
      ),
    error:
      error ??
      null,
  };
}


/* ==========================================================
   CHILD MASTER ENRICHMENT
   ========================================================== */

/**
 * Resolve child master metadata without changing child
 * identity.
 */
async function enrichPanelChildren(
  parameters
) {
  const normalized =
    normalizePanelParameters(
      parameters
    );

  if (
    normalized.length ===
    0
  ) {
    return [];
  }

  const result =
    [];

  for (
    const parameter of
      normalized
  ) {
    let childMaster =
      null;

    const childId =
      numericId(
        parameter.child_test_id
      );

    /*
     * ------------------------------------------------------
     * Explicit child master ID
     * ------------------------------------------------------
     */
    if (
      childId !==
      null
    ) {
      const {
        data,
        error,
      } =
        await supabase
          .from("master_tests")
          .select("*")
          .eq(
            "id",
            childId
          )
          .maybeSingle();

      if (
        !error &&
        data
      ) {
        childMaster =
          data;
      }
    }

    /*
     * ------------------------------------------------------
     * Child-name fallback
     * ------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We query by the child's OWN test_name.
     *
     * We never query panel_name.
     */
    if (
      !childMaster &&
      parameter.parameter_name
    ) {
      const childCanonical =
        canonicalTest(
          parameter.parameter_name
        );

      const {
        data,
        error,
      } =
        await supabase
          .from("master_tests")
          .select("*")
          .ilike(
            "test_name",
            parameter.parameter_name
          );

      if (
        !error &&
        Array.isArray(
          data
        )
      ) {
        const matches =
          data.filter(
            (
              candidate
            ) =>
              canonicalTest(
                candidate?.test_name
              ) ===
              childCanonical
          );

        /*
         * Prefer one exact candidate.
         */
        if (
          matches.length ===
          1
        ) {
          childMaster =
            matches[0];
        } else if (
          matches.length >
          1
        ) {
          const active =
            matches.filter(
              isActiveRecord
            );

          if (
            active.length ===
            1
          ) {
            childMaster =
              active[0];
          }
        }
      }
    }

    /*
     * ------------------------------------------------------
     * Preserve child identity.
     * ------------------------------------------------------
     */
    if (
      childMaster
    ) {
      const childName =
        String(
          firstValue(
            childMaster.test_name,
            parameter.parameter_name
          ) ?? ""
        ).trim();

      result.push({
        ...parameter,

        master_test:
          childMaster,

        child_test:
          childMaster,

        child_test_id:
          numericId(
            childMaster.id
          ) ??
          parameter.child_test_id,

        master_test_id:
          numericId(
            childMaster.id
          ) ??
          parameter.master_test_id,

        parameter_name:
          childName,

        test_name:
          childName,

        /*
         * ABSOLUTE RULE:
         *
         * A panel parameter is never a panel.
         */
        is_panel:
          false,

        isPanel:
          false,

        /*
         * Preserve relationship metadata separately.
         */
        panel_id:
          parameter.panel_id ??
          undefined,
      });

      continue;
    }

    result.push({
      ...parameter,

      is_panel:
        false,

      isPanel:
        false,
    });
  }

  return result;
}


/* ==========================================================
   PUBLIC PANEL CHILD RESOLUTION
   ========================================================== */

/**
 * Resolve panel children from panel_tests.
 *
 * This is the authoritative source for panel parameters.
 */
export async function getPanelChildren(
  panelOrName
) {
  console.log(
    "[panelParameterService] START PANEL RESOLUTION:",
    {
      input:
        panelOrName,
    }
  );

  const panelName =
    await resolvePanelName(
      panelOrName
    );

  if (
    !panelName
  ) {
    console.warn(
      "[panelParameterService] Could not establish genuine panel identity:",
      {
        input:
          panelOrName,
      }
    );

    return [];
  }

  const panelId =
    await resolvePanelId(
      panelOrName
    );

  /*
   * If the input did not carry an explicit ID, resolve
   * the genuine panel master again by canonical name.
   */
  let verifiedPanelId =
    panelId;

  if (
    verifiedPanelId ===
    null
  ) {
    const panelMaster =
      await resolveVerifiedPanelMaster(
        panelOrName,
        panelName
      );

    verifiedPanelId =
      numericId(
        panelMaster?.id
      );
  }

  if (
    verifiedPanelId ===
    null
  ) {
    console.warn(
      "[panelParameterService] No verified panel ID:",
      {
        panelName,
      }
    );

    return [];
  }

  console.log(
    "[panelParameterService] SOURCE 1 panel_tests:",
    {
      panelId:
        verifiedPanelId,

      panelName,
    }
  );

  const {
    data:
      panelRows,
  } =
    await loadPanelTestRows(
      verifiedPanelId
    );

  if (
    panelRows.length ===
    0
  ) {
    console.log(
      "[panelParameterService] FINAL PANEL CHILDREN:",
      {
        panelId:
          verifiedPanelId,

        panelName,

        count:
          0,

        children:
          [],
      }
    );

    return [];
  }

  /*
   * Normalize and enrich.
   */
  const children =
    await enrichPanelChildren(
      panelRows
    );

  /*
   * Final safety filter:
   *
   * no child is allowed to become a panel.
   */
  const safeChildren =
    children.map(
      (
        child
      ) => ({
        ...child,

        is_panel:
          false,

        isPanel:
          false,

        panel_id:
          verifiedPanelId,

        panelId:
          verifiedPanelId,

        panel_name:
          panelName,

        panelName,
      })
    );

  console.log(
    "[panelParameterService] FINAL PANEL CHILDREN:",
    {
      panelId:
        verifiedPanelId,

      panelName,

      count:
        safeChildren.length,

      children:
        safeChildren.map(
          (
            child
          ) => ({
            id:
              child.id,

            child_test_id:
              child.child_test_id,

            master_test_id:
              child.master_test_id,

            test_name:
              child.test_name,

            panel_id:
              child.panel_id,

            panel_name:
              child.panel_name,

            is_panel:
              child.is_panel,
          })
        ),
    }
  );

  return safeChildren;
}


/* ==========================================================
   GET PANEL PARAMETERS
   ========================================================== */

/**
 * Public parameter resolver.
 *
 * Returns:
 *
 * [
 *   {
 *     test_name: "AST",
 *     child_test_id: ...,
 *     panel_id: LFT_ID,
 *     panel_name: "LFT",
 *     is_panel: false
 *   },
 *   ...
 * ]
 */
export async function getPanelParameters(
  panelOrName
) {
  const children =
    await getPanelChildren(
      panelOrName
    );

  return normalizePanelParameters(
    children
  );
}


/* ==========================================================
   COMPATIBILITY HELPERS
   ========================================================== */

/**
 * Resolve panel information from a registered test.
 *
 * Useful to older ResultDashboard/testService code.
 */
export async function resolvePanel(
  registeredTest
) {
  const panelName =
    await resolvePanelName(
      registeredTest
    );

  if (
    !panelName
  ) {
    return null;
  }

  const panelId =
    await resolvePanelId(
      registeredTest
    );

  if (
    panelId ===
    null
  ) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("master_tests")
      .select("*")
      .eq(
        "id",
        panelId
      )
      .maybeSingle();

  if (
    error ||
    !data ||
    !isVerifiedPanelMaster(
      data,
      panelName
    )
  ) {
    return null;
  }

  return data;
}


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

const panelParameterService = {
  getPanelParameters,
  getPanelChildren,

  resolvePanelId,
  resolvePanelName,
  resolvePanel,

  normalizePanelParameter,
  normalizePanelParameters,
};

export default panelParameterService;