/* ==========================================================
   PEFA LAB
   MASTER TEST SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   This module is responsible ONLY for master_tests operations.

   ARCHITECTURE

      REGISTERED TEST
            =
      REPORT IDENTITY

      MASTER TEST
            =
      METADATA / ENRICHMENT

      PANEL MASTER
            =
      REPORT-LEVEL PANEL

      PANEL CHILD
            =
      PARAMETER INSIDE PANEL

   ==========================================================
   CRITICAL IDENTITY RULES
   ==========================================================

   1. Registered-test identity is authoritative.

   2. master_tests provides metadata only.

   3. A panel child remains a child.

   4. panel_id / panel_name alone NEVER makes a record
      a panel.

   5. A panel must be represented by a genuine panel master.

   6. Single tests resolve by their own test_name.

   7. Panels resolve only to genuine panel masters.

   8. Never resolve:

        LFT  -> AST
        RFT  -> eGFR
        CBC  -> Hb
        FLP  -> Cholesterol

   9. Explicit master_test_id must be verified.

   10. If identity cannot be verified, return null.

   11. This service does NOT load panel children.

       Panel children belong to:

          panelParameterService.js

   12. No fuzzy matching is used.

   13. No panel_name-only resolution is allowed for a
       single test.

   14. A child carrying panel metadata is never promoted
       into a panel master.

   ========================================================== */

import { supabase } from "../../supabase";

import {
  normalizeTestName,
  getCanonicalTestName,
  getCanonicalPanelName,
  isKnownChildTest,
} from "./testNormalization";

import {
  isPanelTest,
  isKnownPanelName,
  normalizeIdentityName,
  getCanonicalPanelIdentity,
  masterMatchesReport,
  getMasterTestId,
  toNumericId,
  firstIdentityValue,
} from "./testIdentity";


/* ==========================================================
   INTERNAL HELPERS
   ========================================================== */

/**
 * Return the first meaningful value.
 */
function firstValue(...values) {
  return firstIdentityValue(...values);
}


/**
 * Normalize arbitrary text safely.
 */
function normalizeName(value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  try {
    const normalized = normalizeTestName(raw);

    if (normalized) {
      return normalizeIdentityName(normalized);
    }
  } catch {
    /* Fall through to basic normalization. */
  }

  return normalizeIdentityName(raw);
}


/**
 * Return canonical test identity.
 */
function canonicalTestName(value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  try {
    const canonical = getCanonicalTestName(raw);

    if (canonical) {
      return normalizeIdentityName(canonical);
    }
  } catch {
    /* Fall through. */
  }

  return normalizeName(raw);
}


/**
 * Return canonical panel identity.
 */
function canonicalPanelName(value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  try {
    const canonical = getCanonicalPanelName(raw);

    if (canonical) {
      return normalizeIdentityName(canonical);
    }
  } catch {
    /* Fall through. */
  }

  try {
    const canonical = getCanonicalPanelIdentity(raw);

    if (canonical) {
      return normalizeIdentityName(canonical);
    }
  } catch {
    /* Fall through. */
  }

  return normalizeName(raw);
}


/**
 * Extract the registered/report identity.
 *
 * IMPORTANT:
 *
 * We intentionally do NOT use:
 *
 *   panel_name
 *   panel_id
 *   parent_panel_id
 *
 * to determine the report identity.
 */
function getRequestedName(testOrName) {
  if (typeof testOrName === "string") {
    return testOrName.trim();
  }

  if (
    !testOrName ||
    typeof testOrName !== "object"
  ) {
    return "";
  }

  return String(
    firstValue(
      testOrName.test_name,
      testOrName.testName,
      testOrName.name
    ) ?? ""
  ).trim();
}


/**
 * Determine whether a requested report name is a known
 * panel identity.
 */
function requestedIsPanel(requestedName) {
  const raw = String(requestedName ?? "").trim();

  if (!raw) {
    return false;
  }

  const canonical = canonicalTestName(raw);

  return (
    isKnownPanelName(raw) ||
    isKnownPanelName(canonical) ||
    canonicalPanelName(raw) === canonical
  );
}


/**
 * Determine whether a master row is genuinely a panel.
 *
 * IMPORTANT:
 *
 * panel_name alone is NEVER enough.
 *
 * Example:
 *
 *   AST
 *   panel_name = LFT
 *
 * remains AST, not LFT.
 */
function isGenuinePanelMaster(master) {
  if (
    !master ||
    typeof master !== "object"
  ) {
    return false;
  }

  return isPanelTest(master);
}


/**
 * Determine whether a candidate is a valid panel master for
 * a requested report.
 *
 * A candidate is accepted only when:
 *
 *   1. It is genuinely a panel.
 *   2. Its own test identity matches the requested panel.
 *
 * panel_name may support canonical panel aliases, but cannot
 * independently promote a child into a panel.
 */
function isValidPanelCandidate(
  requestedName,
  candidate
) {
  if (!isGenuinePanelMaster(candidate)) {
    return false;
  }

  const requestedCanonical =
    canonicalTestName(requestedName);

  const requestedPanelCanonical =
    canonicalPanelName(requestedName);

  const candidateTestCanonical =
    canonicalTestName(candidate.test_name);

  const candidatePanelCanonical =
    canonicalPanelName(candidate.panel_name);

  /*
   * Strongest rule:
   *
   * Panel master's own test_name matches requested report.
   */
  if (
    requestedCanonical &&
    candidateTestCanonical === requestedCanonical
  ) {
    return true;
  }

  /*
   * Canonical panel identity may be used when the database
   * stores a canonical panel alias in panel_name.
   *
   * But the candidate MUST already be a genuine panel.
   */
  if (
    requestedPanelCanonical &&
    candidateTestCanonical === requestedPanelCanonical
  ) {
    return true;
  }

  /*
   * A panel_name match alone is deliberately NOT sufficient.
   *
   * This prevents:
   *
   *   AST(panel_name=LFT) -> LFT
   */
  if (
    requestedPanelCanonical &&
    candidatePanelCanonical === requestedPanelCanonical &&
    candidateTestCanonical === requestedPanelCanonical
  ) {
    return true;
  }

  return false;
}


/**
 * Score an already-valid panel candidate.
 *
 * Scoring does not establish identity.
 */
function scorePanelCandidate(
  requestedName,
  candidate
) {
  if (
    !isValidPanelCandidate(
      requestedName,
      candidate
    )
  ) {
    return -Infinity;
  }

  const requestedCanonical =
    canonicalTestName(requestedName);

  const requestedPanelCanonical =
    canonicalPanelName(requestedName);

  const candidateCanonical =
    canonicalTestName(candidate.test_name);

  const candidatePanelCanonical =
    canonicalPanelName(candidate.panel_name);

  let score = 0;

  /*
   * Exact test identity.
   */
  if (
    candidateCanonical === requestedCanonical
  ) {
    score += 1000;
  }

  /*
   * Canonical panel identity.
   */
  if (
    candidateCanonical === requestedPanelCanonical
  ) {
    score += 500;
  }

  /*
   * panel_name is supporting metadata only.
   */
  if (
    candidatePanelCanonical === requestedPanelCanonical
  ) {
    score += 100;
  }

  /*
   * Explicit panel classification.
   */
  if (
    candidate.is_panel === true ||
    candidate.isPanel === true
  ) {
    score += 50;
  }

  /*
   * Active records preferred.
   */
  const status = String(
    candidate.active_status ??
    candidate.activeStatus ??
    ""
  )
    .trim()
    .toLowerCase();

  if (
    status === "active" ||
    status === "true" ||
    status === "1"
  ) {
    score += 10;
  }

  return score;
}


/**
 * Deduplicate master rows by numeric ID.
 */
function uniqueMasterTests(tests) {
  if (!Array.isArray(tests)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  for (const test of tests) {
    if (
      !test ||
      typeof test !== "object"
    ) {
      continue;
    }

    const id = toNumericId(test.id);

    if (id !== null) {
      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
    }

    result.push(test);
  }

  return result;
}


/**
 * Determine whether a master record is active.
 */
function isActiveMaster(test) {
  const status = String(
    test?.active_status ??
    test?.activeStatus ??
    ""
  )
    .trim()
    .toLowerCase();

  return (
    status === "active" ||
    status === "true" ||
    status === "1"
  );
}


/* ==========================================================
   MASTER TEST LOOKUP
   ========================================================== */

/**
 * Fetch one master_tests row by ID.
 */
export async function getTestById(id) {
  const numericId = toNumericId(id);

  if (numericId === null) {
    return {
      data: null,
      error: new Error(
        `Invalid master test ID: ${id}`
      ),
    };
  }

  return await supabase
    .from("master_tests")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();
}


/**
 * Compatibility alias.
 */
export const getMasterTestById = getTestById;


/**
 * Fetch all master tests.
 */
export async function getAllTests() {
  return await supabase
    .from("master_tests")
    .select("*")
    .order("test_name", {
      ascending: true,
    });
}


/**
 * Fetch tests by department.
 */
export async function getTestsByDepartment(
  department
) {
  const value = String(
    department ?? ""
  ).trim();

  if (!value) {
    return {
      data: [],
      error: new Error(
        "Department is required."
      ),
    };
  }

  return await supabase
    .from("master_tests")
    .select("*")
    .eq("department", value)
    .order("test_name", {
      ascending: true,
    });
}


/**
 * Fetch genuine panel masters only.
 */
export async function getPanels() {
  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .order("test_name", {
      ascending: true,
    });

  if (error) {
    return {
      data: [],
      error,
    };
  }

  const panels = (
    Array.isArray(data)
      ? data
      : []
  ).filter(isGenuinePanelMaster);

  return {
    data: uniqueMasterTests(panels),
    error: null,
  };
}


/* ==========================================================
   NAME LOOKUPS
   ========================================================== */

/**
 * Find rows whose test_name exactly matches the requested
 * database text, case-insensitively.
 */
async function getExactTestNameCandidates(name) {
  const originalName = String(
    name ?? ""
  ).trim();

  if (!originalName) {
    return {
      data: [],
      error: new Error(
        "Test name is required."
      ),
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .ilike("test_name", originalName);

  return {
    data: Array.isArray(data)
      ? data
      : [],
    error: error ?? null,
  };
}


/**
 * Find rows whose panel_name exactly matches the requested
 * text, case-insensitively.
 *
 * This is used only as a panel lookup.
 */
async function getExactPanelNameCandidates(name) {
  const originalName = String(
    name ?? ""
  ).trim();

  if (!originalName) {
    return {
      data: [],
      error: new Error(
        "Panel name is required."
      ),
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .ilike("panel_name", originalName);

  return {
    data: Array.isArray(data)
      ? data
      : [],
    error: error ?? null,
  };
}


/* ==========================================================
   SINGLE TEST SELECTION
   ========================================================== */

/**
 * Select a single-test master.
 *
 * Identity is established ONLY through test_name.
 *
 * panel_name is ignored.
 *
 * A genuine panel is not returned as a single test when the
 * requested report is a panel.
 */
function selectSingleTestCandidate(
  requestedName,
  candidates
) {
  const requestedCanonical =
    canonicalTestName(requestedName);

  if (
    !requestedCanonical ||
    !Array.isArray(candidates)
  ) {
    return null;
  }

  const exact = candidates.filter(
    (candidate) => {
      if (!candidate) {
        return false;
      }

      return (
        canonicalTestName(
          candidate.test_name
        ) === requestedCanonical
      );
    }
  );

  if (exact.length === 0) {
    return null;
  }

  /*
   * If the requested identity itself is a panel,
   * only a panel master is acceptable.
   */
  if (
    requestedIsPanel(requestedName)
  ) {
    return selectPanelCandidate(
      requestedName,
      exact
    );
  }

  /*
   * Prefer a non-panel master for a genuine single test.
   */
  const nonPanels = exact.filter(
    (candidate) =>
      !isGenuinePanelMaster(candidate)
  );

  if (nonPanels.length === 1) {
    return nonPanels[0];
  }

  if (nonPanels.length > 1) {
    const active = nonPanels.filter(
      isActiveMaster
    );

    if (active.length === 1) {
      return active[0];
    }

    console.warn(
      "[masterTestService] Ambiguous single-test resolution:",
      {
        requested: requestedName,
        matches: nonPanels.map(
          (item) => ({
            id: item?.id,
            test_name: item?.test_name,
            panel_name: item?.panel_name,
            test_type: item?.test_type,
            is_panel: item?.is_panel,
          })
        ),
      }
    );

    return null;
  }

  /*
   * If only panel rows exist for a non-panel request,
   * do not silently return one.
   */
  return null;
}


/* ==========================================================
   PANEL SELECTION
   ========================================================== */

/**
 * Select a genuine panel master.
 */
function selectPanelCandidate(
  requestedName,
  candidates
) {
  if (
    !Array.isArray(candidates) ||
    candidates.length === 0
  ) {
    return null;
  }

  const valid = uniqueMasterTests(
    candidates.filter(
      (candidate) =>
        isValidPanelCandidate(
          requestedName,
          candidate
        )
    )
  );

  if (valid.length === 0) {
    return null;
  }

  if (valid.length === 1) {
    return valid[0];
  }

  const scored = valid
    .map((candidate) => ({
      candidate,
      score: scorePanelCandidate(
        requestedName,
        candidate
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score
    );

  const best = scored[0];
  const second = scored[1];

  if (
    second &&
    best.score === second.score
  ) {
    console.warn(
      "[masterTestService] Ambiguous panel master resolution:",
      {
        requested: requestedName,
        candidates: scored.map(
          ({
            candidate,
            score,
          }) => ({
            score,
            id: candidate?.id,
            test_name: candidate?.test_name,
            panel_name: candidate?.panel_name,
            test_type: candidate?.test_type,
            is_panel: candidate?.is_panel,
          })
        ),
      }
    );

    return null;
  }

  return best.candidate;
}


/* ==========================================================
   RESOLVE MASTER TEST BY NAME
   ========================================================== */

/**
 * Resolve a master test using report identity.
 *
 * There is deliberately NO:
 *
 *   includes()
 *   startsWith()
 *   fuzzy matching
 *   child-to-panel inference
 *   panel_name-only single-test resolution
 */
export async function resolveMasterTestByName(
  testName
) {
  const originalName = String(
    testName ?? ""
  ).trim();

  if (!originalName) {
    return null;
  }

  const requestedCanonical =
    canonicalTestName(originalName);

  const requestedPanelCanonical =
    canonicalPanelName(originalName);

  const panelRequest =
    requestedIsPanel(originalName);

  console.log(
    "[masterTestService] Resolving master test:",
    {
      requested: originalName,
      canonical: requestedCanonical,
      panelCanonical:
        requestedPanelCanonical,
      isPanelRequest: panelRequest,
    }
  );


  /* ========================================================
     1. EXACT test_name
     ======================================================== */

  const {
    data: exactTests,
    error: exactError,
  } =
    await getExactTestNameCandidates(
      originalName
    );

  if (exactError) {
    console.warn(
      "[masterTestService] Exact test lookup failed:",
      {
        requested: originalName,
        error: exactError,
      }
    );
  }


  /*
   * Panel request:
   *
   * exact test_name is valid only if the row itself is
   * a genuine panel master.
   */
  if (panelRequest) {
    const exactPanel =
      selectPanelCandidate(
        originalName,
        exactTests
      );

    if (exactPanel) {
      return exactPanel;
    }
  }


  /*
   * Single request:
   *
   * exact test_name only.
   */
  if (!panelRequest) {
    const exactSingle =
      selectSingleTestCandidate(
        originalName,
        exactTests
      );

    if (exactSingle) {
      return exactSingle;
    }
  }


  /* ========================================================
     2. EXACT panel_name
     ======================================================== */

  if (panelRequest) {
    const {
      data: panelNameCandidates,
      error: panelNameError,
    } =
      await getExactPanelNameCandidates(
        originalName
      );

    if (panelNameError) {
      console.warn(
        "[masterTestService] Exact panel_name lookup failed:",
        {
          requested: originalName,
          error: panelNameError,
        }
      );
    }

    const panel =
      selectPanelCandidate(
        originalName,
        panelNameCandidates
      );

    if (panel) {
      return panel;
    }
  }


  /* ========================================================
     3. FULL DATABASE FALLBACK
     ======================================================== */

  const {
    data: allTests,
    error: allError,
  } =
    await getAllTests();

  if (
    allError ||
    !Array.isArray(allTests)
  ) {
    console.warn(
      "[masterTestService] Could not load master_tests:",
      {
        requested: originalName,
        error: allError,
      }
    );

    return null;
  }

  const uniqueTests =
    uniqueMasterTests(allTests);


  /* ========================================================
     3A. PANEL REQUEST
     ======================================================== */

  if (panelRequest) {
    /*
     * First:
     *
     * Exact canonical test identity.
     */
    const canonicalTestMatches =
      uniqueTests.filter(
        (candidate) =>
          isGenuinePanelMaster(candidate) &&
          canonicalTestName(
            candidate.test_name
          ) === requestedCanonical
      );

    const byTestName =
      selectPanelCandidate(
        originalName,
        canonicalTestMatches
      );

    if (byTestName) {
      return byTestName;
    }


    /*
     * Second:
     *
     * Canonical panel identity.
     *
     * Candidate must still be a genuine panel.
     */
    const canonicalPanelMatches =
      uniqueTests.filter(
        (candidate) =>
          isGenuinePanelMaster(candidate) &&
          canonicalPanelName(
            candidate.panel_name
          ) === requestedPanelCanonical
      );

    /*
     * IMPORTANT:
     *
     * selectPanelCandidate performs the final identity
     * check. A child cannot pass merely because its
     * panel_name matches.
     */
    const byPanelName =
      selectPanelCandidate(
        originalName,
        canonicalPanelMatches
      );

    if (byPanelName) {
      return byPanelName;
    }


    /*
     * Third:
     *
     * Canonical panel test identity.
     */
    const canonicalPanelTestMatches =
      uniqueTests.filter(
        (candidate) => {
          if (
            !isGenuinePanelMaster(candidate)
          ) {
            return false;
          }

          const candidateTest =
            canonicalTestName(
              candidate.test_name
            );

          const candidatePanel =
            canonicalPanelName(
              candidate.panel_name
            );

          return (
            candidateTest ===
              requestedPanelCanonical ||
            candidatePanel ===
              requestedPanelCanonical
          );
        }
      );

    const aliasPanel =
      selectPanelCandidate(
        originalName,
        canonicalPanelTestMatches
      );

    if (aliasPanel) {
      return aliasPanel;
    }


    /*
     * CRITICAL:
     *
     * Never return a child simply because it belongs to
     * this panel.
     */
    console.warn(
      "[masterTestService] No verified panel master found:",
      {
        requested: originalName,
        canonical: requestedCanonical,
        panelCanonical:
          requestedPanelCanonical,

        relatedRows:
          uniqueTests
            .filter(
              (candidate) =>
                canonicalPanelName(
                  candidate?.panel_name
                ) ===
                requestedPanelCanonical
            )
            .map(
              (candidate) => ({
                id: candidate?.id,
                test_name:
                  candidate?.test_name,
                panel_name:
                  candidate?.panel_name,
                test_type:
                  candidate?.test_type,
                is_panel:
                  candidate?.is_panel,
              })
            ),
      }
    );

    return null;
  }


  /* ========================================================
     3B. SINGLE TEST REQUEST
     ======================================================== */

  /*
   * Only the candidate's OWN test_name is considered.
   */
  const canonicalSingleMatches =
    uniqueTests.filter(
      (candidate) =>
        canonicalTestName(
          candidate?.test_name
        ) === requestedCanonical
    );

  const single =
    selectSingleTestCandidate(
      originalName,
      canonicalSingleMatches
    );

  if (single) {
    return single;
  }


  /*
   * NEVER use panel_name to resolve a single test.
   */
  console.warn(
    "[masterTestService] Master test could not be resolved safely:",
    {
      requested: originalName,
      canonical: requestedCanonical,
    }
  );

  return null;
}


/* ==========================================================
   COMPATIBILITY ALIASES
   ========================================================== */

export const getTestByName =
  resolveMasterTestByName;

export const getMasterTestByName =
  resolveMasterTestByName;


/* ==========================================================
   RESOLVE MASTER TEST
   ----------------------------------------------------------
   PRIORITY

      1. Explicit master_test_id
      2. Nested master_test.id
      3. Safe report-name resolution

   Explicit IDs are ALWAYS verified against the registered
   report identity before being accepted.
   ========================================================== */

export async function resolveMasterTest(test) {
  if (
    !test ||
    typeof test !== "object"
  ) {
    return null;
  }

  const requestedName =
    getRequestedName(test);

  if (!requestedName) {
    return null;
  }

  const panelRequest =
    requestedIsPanel(requestedName);


  /* ========================================================
     1. EXPLICIT MASTER ID
     ======================================================== */

  const explicitMasterId =
    toNumericId(
      firstValue(
        test.master_test_id,
        test.masterTestId,
        test.master_test?.id,
        test.masterTest?.id
      )
    );

  if (explicitMasterId !== null) {
    const {
      data,
      error,
    } =
      await getTestById(
        explicitMasterId
      );

    if (!error && data) {
      const identityMatches =
        masterMatchesRequestedTest(
          requestedName,
          data
        );

      /*
       * Panel request can ONLY accept a genuine panel master.
       */
      if (
        identityMatches &&
        (!panelRequest ||
          isGenuinePanelMaster(data))
      ) {
        return data;
      }

      console.warn(
        "[masterTestService] Explicit master ID rejected:",
        {
          requested: requestedName,
          explicitMasterId,
          returnedId: data?.id,
          returnedTest:
            data?.test_name,
          returnedPanel:
            data?.panel_name,
          returnedIsPanel:
            isGenuinePanelMaster(data),
          identityMatches,
        }
      );
    } else if (error) {
      console.warn(
        "[masterTestService] Explicit master lookup failed:",
        {
          requested: requestedName,
          explicitMasterId,
          error,
        }
      );
    }
  }


  /* ========================================================
     2. SAFE NAME RESOLUTION
     ======================================================== */

  return await resolveMasterTestByName(
    requestedName
  );
}


/* ==========================================================
   VERIFY MASTER TEST
   ========================================================== */

/**
 * Verify that a master belongs to the requested report.
 *
 * This function is intentionally strict.
 */
export function masterMatchesRequestedTest(
  requestedName,
  masterTest
) {
  if (
    !requestedName ||
    !masterTest
  ) {
    return false;
  }

  const requestedCanonical =
    canonicalTestName(
      requestedName
    );

  const masterCanonical =
    canonicalTestName(
      masterTest.test_name
    );

  const panelRequest =
    requestedIsPanel(
      requestedName
    );


  /* ========================================================
     1. EXACT TEST IDENTITY
     ======================================================== */

  if (
    requestedCanonical &&
    requestedCanonical ===
      masterCanonical
  ) {
    /*
     * A panel report must map to a panel master.
     */
    if (panelRequest) {
      return isGenuinePanelMaster(
        masterTest
      );
    }

    /*
     * A single report must not be satisfied by a panel
     * merely because names happen to match.
     *
     * If the database explicitly classifies the row as a
     * panel, it is only valid for a panel request.
     */
    if (
      isGenuinePanelMaster(masterTest)
    ) {
      return false;
    }

    return true;
  }


  /* ========================================================
     2. PANEL IDENTITY
     ======================================================== */

  if (panelRequest) {
    const requestedPanel =
      canonicalPanelName(
        requestedName
      );

    const masterPanel =
      canonicalPanelName(
        masterTest.panel_name
      );

    /*
     * panel_name is acceptable here only when the candidate
     * is already a genuine panel master AND its own test_name
     * represents the same canonical panel identity.
     */
    if (
      requestedPanel &&
      masterPanel &&
      requestedPanel === masterPanel &&
      isGenuinePanelMaster(masterTest) &&
      canonicalTestName(
        masterTest.test_name
      ) === requestedPanel
    ) {
      return true;
    }
  }


  /* ========================================================
     3. KNOWN CHILD IDENTITY
     ======================================================== */

  if (
    isKnownChildTest(
      requestedCanonical
    )
  ) {
    /*
     * AST must match AST.
     *
     * AST must never match:
     *
     *   LFT
     *   panel_name = LFT
     */
    return (
      requestedCanonical ===
      masterCanonical
    );
  }


  return false;
}


/* ==========================================================
   GET RESOLVED MASTER ID
   ========================================================== */

export function getResolvedMasterId(
  masterTest
) {
  if (
    !masterTest ||
    typeof masterTest !== "object"
  ) {
    return null;
  }

  return (
    getMasterTestId(masterTest) ??
    toNumericId(masterTest.id)
  );
}


/* ==========================================================
   FIND PANEL MASTER CANDIDATES
   ----------------------------------------------------------
   Used by panelParameterService.

   ONLY genuine panel masters are returned.
   ========================================================== */

export async function findPanelMasterCandidates(
  panelName
) {
  const requestedName =
    String(panelName ?? "").trim();

  if (!requestedName) {
    return {
      data: [],
      error: new Error(
        "Panel name is required."
      ),
    };
  }

  const {
    data,
    error,
  } =
    await getAllTests();

  if (error) {
    return {
      data: [],
      error,
    };
  }

  const requestedCanonical =
    canonicalTestName(
      requestedName
    );

  const requestedPanelCanonical =
    canonicalPanelName(
      requestedName
    );

  const candidates =
    (
      Array.isArray(data)
        ? data
        : []
    ).filter(
      (candidate) => {
        /*
         * FIRST GATE:
         *
         * Candidate itself must be a panel.
         */
        if (
          !isGenuinePanelMaster(candidate)
        ) {
          return false;
        }

        const candidateTest =
          canonicalTestName(
            candidate.test_name
          );

        const candidatePanel =
          canonicalPanelName(
            candidate.panel_name
          );

        /*
         * Prefer the panel's own test_name.
         */
        if (
          candidateTest ===
          requestedCanonical
        ) {
          return true;
        }

        /*
         * Canonical panel identity.
         */
        if (
          candidateTest ===
          requestedPanelCanonical
        ) {
          return true;
        }

        /*
         * panel_name alone is NOT sufficient.
         *
         * The candidate must also have its own test_name
         * equal to the requested panel identity.
         */
        return (
          candidatePanel ===
            requestedPanelCanonical &&
          candidateTest ===
            requestedPanelCanonical
        );
      }
    );

  return {
    data: uniqueMasterTests(
      candidates
    ),
    error: null,
  };
}


/* ==========================================================
   FIND CHILD MASTER RECORD
   ----------------------------------------------------------
   Resolves a child using its OWN test_name.

   Example:

      AST -> AST

   Never:

      AST -> LFT
   ========================================================== */

export async function findChildMasterTest(
  childName
) {
  const requestedName =
    String(childName ?? "").trim();

  if (!requestedName) {
    return null;
  }

  const {
    data,
    error,
  } =
    await getExactTestNameCandidates(
      requestedName
    );

  if (
    error ||
    !Array.isArray(data)
  ) {
    return null;
  }

  /*
   * Child resolution is deliberately single-test
   * resolution.
   */
  return selectSingleTestCandidate(
    requestedName,
    data
  );
}


/* ==========================================================
   SAFE MASTER RESOLUTION
   ========================================================== */

/**
 * Resolve and perform a final identity verification.
 */
export async function resolveVerifiedMaster(
  registeredTest
) {
  if (
    !registeredTest ||
    typeof registeredTest !== "object"
  ) {
    return null;
  }

  const requestedName =
    getRequestedName(
      registeredTest
    );

  if (!requestedName) {
    return null;
  }

  const master =
    await resolveMasterTest(
      registeredTest
    );

  if (!master) {
    return null;
  }

  if (
    !masterMatchesRequestedTest(
      requestedName,
      master
    )
  ) {
    console.warn(
      "[masterTestService] Resolved master failed final identity verification:",
      {
        requested: requestedName,
        masterId: master?.id,
        masterName: master?.test_name,
        panelName: master?.panel_name,
        isPanel:
          isGenuinePanelMaster(master),
      }
    );

    return null;
  }

  return master;
}


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

const masterTestService = {
  /* --------------------------------------------------------
     BASIC LOOKUP
     -------------------------------------------------------- */

  getTestById,
  getMasterTestById,

  getAllTests,
  getTestsByDepartment,
  getPanels,

  /* --------------------------------------------------------
     NAME LOOKUP
     -------------------------------------------------------- */

  getTestByName,
  getMasterTestByName,

  resolveMasterTestByName,

  /* --------------------------------------------------------
     MASTER RESOLUTION
     -------------------------------------------------------- */

  resolveMasterTest,
  resolveVerifiedMaster,

  /* --------------------------------------------------------
     IDENTITY VERIFICATION
     -------------------------------------------------------- */

  masterMatchesRequestedTest,
  getResolvedMasterId,

  /* --------------------------------------------------------
     CANDIDATE RESOLUTION
     -------------------------------------------------------- */

  findPanelMasterCandidates,
  findChildMasterTest,
};

export default masterTestService;