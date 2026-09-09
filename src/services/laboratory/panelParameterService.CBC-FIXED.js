/* ==========================================================
   PEFA LAB
   PANEL PARAMETER SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Resolve and normalize CHILD TESTS belonging to a
   registered PANEL.

   CORE ARCHITECTURE

      REGISTERED PANEL
            │
            │ master_test_id / panel_id
            ▼
        PANEL MASTER
            │
            ├── CHILD TEST
            ├── CHILD TEST
            ├── CHILD TEST
            └── CHILD TEST

   IMPORTANT IDENTITY RULE

   A panel child is NEVER the panel.

   Example:

      LFT
        ├── AST
        ├── ALT
        ├── ALP
        └── GGT

   LFT:
      master_test_id = 106
      is_panel       = true

   AST:
      master_test_id = 795
      is_panel       = false
      panel_id       = 106

   ALT:
      master_test_id = 816
      is_panel       = false
      panel_id       = 106

   ALP:
      master_test_id = 814
      is_panel       = false
      panel_id       = 106

   GGT:
      master_test_id = 796
      is_panel       = false
      panel_id       = 106

   ----------------------------------------------------------
   SUPPORTED DATABASE REPRESENTATIONS

   1. panel_tests
          panel_id
              ↓
          test_id
              ↓
          master_tests

   2. master_tests.panel_id
          parent panel ID
              ↓
          child master rows

   3. master_tests.panel_name
          parent panel name
              ↓
          child master rows

   4. PANEL MASTER FALLBACK
          panel master ID
              ↓
          resolve its test_name
              ↓
          use that name to locate children

   ----------------------------------------------------------
   CRITICAL SAFETY RULES

   - panel_id is relationship metadata.
   - panel_name is relationship metadata.
   - test_id belongs to the child.
   - master_test_id belongs to the child.
   - A child must never inherit the panel master ID.
   - Existing result values are preserved.
   - Child records remain is_panel = false.
   - The panel itself is never returned as a parameter.
   - Duplicate children are removed without collapsing
     distinct panel members.
   ========================================================== */

import { supabase } from "../../supabase";

import {
  normalizeTestName,
  getCanonicalTestName,
  getCanonicalPanelName,
} from "./testNormalization";

import {
  normalizeIdentityName,
  getCanonicalPanelIdentity,
  getRelatedPanelId,
  isPanelTest,
  isKnownPanelName,
  toNumericId,
  firstIdentityValue,
} from "./testIdentity";


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

function firstValue(...values) {
  return firstIdentityValue(...values);
}


function safeId(value) {
  return toNumericId(value);
}


function normalizeString(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}


/* ==========================================================
   NAME NORMALIZATION
   ========================================================== */

function normalizeName(value) {
  const raw = normalizeString(value);

  if (!raw) {
    return "";
  }

  try {
    const normalized =
      normalizeTestName(raw);

    if (normalized) {
      return normalizeIdentityName(
        normalized
      );
    }
  } catch {
    /* Fall through. */
  }

  return normalizeIdentityName(raw);
}


/* ==========================================================
   CANONICAL CHILD NAME
   ========================================================== */

function canonicalTestName(value) {
  const raw = normalizeString(value);

  if (!raw) {
    return "";
  }

  try {
    const canonical =
      getCanonicalTestName(raw);

    if (canonical) {
      return normalizeIdentityName(
        canonical
      );
    }
  } catch {
    /* Fall through. */
  }

  return normalizeName(raw);
}


/* ==========================================================
   CANONICAL PANEL NAME
   ========================================================== */

function canonicalPanelName(value) {
  const raw = normalizeString(value);

  if (!raw) {
    return "";
  }

  try {
    const canonical =
      getCanonicalPanelName(raw);

    if (canonical) {
      return normalizeIdentityName(
        canonical
      );
    }
  } catch {
    /* Fall through. */
  }

  try {
    const identityCanonical =
      getCanonicalPanelIdentity(raw);

    if (identityCanonical) {
      return normalizeIdentityName(
        identityCanonical
      );
    }
  } catch {
    /* Fall through. */
  }

  return normalizeIdentityName(raw);
}


/* ==========================================================
   SAME PANEL NAME
   ========================================================== */

function samePanelName(
  first,
  second
) {
  const a =
    canonicalPanelName(first);

  const b =
    canonicalPanelName(second);

  return Boolean(
    a &&
    b &&
    a === b
  );
}


/* ==========================================================
   GET ROW ID
   ========================================================== */

function getRowId(row) {
  if (
    !row ||
    typeof row !== "object"
  ) {
    return null;
  }

  return safeId(
    firstValue(
      row.id,
      row.test_id,
      row.testId,
      row.master_test_id,
      row.masterTestId
    )
  );
}


/* ==========================================================
   GET RELATED MASTER
   ========================================================== */

function getRelatedMaster(row) {
  if (
    !row ||
    typeof row !== "object"
  ) {
    return null;
  }

  const master =
    row.master_tests ??
    row.masterTest ??
    row.master_test ??
    null;

  if (
    master &&
    typeof master === "object"
  ) {
    return master;
  }

  return null;
}


/* ==========================================================
   RESOLVE PANEL ID
   ----------------------------------------------------------
   IMPORTANT

   This resolves the PANEL identity.

   A CHILD ID is never promoted to panel ID.
   ========================================================== */

export function resolvePanelId(input) {
  if (
    input === null ||
    input === undefined
  ) {
    return null;
  }

  if (
    typeof input !== "object"
  ) {
    return safeId(input);
  }

  /*
   * Explicit panel relationship wins.
   */
  const explicitPanelId =
    firstValue(
      input.panelId,
      input.panel_id,
      input.parentPanelId,
      input.parent_panel_id
    );

  const resolvedExplicit =
    safeId(
      explicitPanelId
    );

  if (
    resolvedExplicit !== null
  ) {
    return resolvedExplicit;
  }

  /*
   * A record explicitly identified as a panel may use
   * its own ID.
   */
  if (
    isPanelTest(input)
  ) {
    return safeId(
      input.id
    );
  }

  /*
   * Known panel names are allowed to identify the record
   * as a panel only when the record is not explicitly a
   * panel child.
   */
  const name =
    firstValue(
      input.panelName,
      input.panel_name,
      input.testName,
      input.test_name
    );

  if (
    name &&
    isKnownPanelName(name) &&
    !input.is_panel_child &&
    !input.isPanelChild
  ) {
    return safeId(
      input.id
    );
  }

  return null;
}


/* ==========================================================
   RESOLVE PANEL NAME
   ========================================================== */

export function resolvePanelName(input) {
  if (
    input === null ||
    input === undefined
  ) {
    return "";
  }

  if (
    typeof input === "string"
  ) {
    return input.trim();
  }

  if (
    typeof input !== "object"
  ) {
    return String(input).trim();
  }

  /*
   * Explicit panel name has highest priority.
   */
  const explicitPanelName =
    firstValue(
      input.panelName,
      input.panel_name,
      input.parentPanelName,
      input.parent_panel_name
    );

  if (
    explicitPanelName
  ) {
    return normalizeString(
      explicitPanelName
    );
  }

  /*
   * Explicit panel record may use test_name as its
   * report-level panel name.
   */
  if (
    isPanelTest(input)
  ) {
    const panelTestName =
      firstValue(
        input.testName,
        input.test_name,
        input.name
      );

    if (
      panelTestName
    ) {
      return normalizeString(
        panelTestName
      );
    }
  }

  /*
   * Known panel name fallback.
   */
  const candidate =
    firstValue(
      input.testName,
      input.test_name,
      input.name
    );

  if (
    candidate &&
    isKnownPanelName(candidate)
  ) {
    return normalizeString(
      candidate
    );
  }

  return "";
}


/* ==========================================================
   RESOLVE PANEL MASTER BY ID
   ----------------------------------------------------------
   IMPORTANT FIX

   If we know:

      panelId = 106

   but panelName is empty, retrieve master_tests.id = 106
   and derive the panel's own name.

   This allows:

      106
       ↓
      LFT
       ↓
      Liver Function Test
       ↓
      AST / ALT / ALP / GGT
   ========================================================== */

async function resolvePanelMaster(
  panelId
) {
  const numericPanelId =
    safeId(panelId);

  if (
    numericPanelId === null
  ) {
    return {
      data: null,
      error: null,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .eq(
      "id",
      numericPanelId
    )
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data:
      data &&
      typeof data === "object"
        ? data
        : null,

    error: null,
  };
}


/* ==========================================================
   RESOLVE PANEL NAME FROM MASTER
   ========================================================== */

function getPanelMasterName(
  master
) {
  if (
    !master ||
    typeof master !== "object"
  ) {
    return "";
  }

  /*
   * A panel master's own test_name is authoritative.
   */
  const testName =
    firstValue(
      master.test_name,
      master.testName,
      master.name
    );

  if (
    testName &&
    (
      isPanelTest(master) ||
      isKnownPanelName(testName)
    )
  ) {
    return normalizeString(
      testName
    );
  }

  /*
   * panel_name can be useful if present.
   */
  const panelName =
    firstValue(
      master.panel_name,
      master.panelName
    );

  return normalizeString(
    panelName
  );
}


/* ==========================================================
   CHILD NORMALIZATION
   ========================================================== */

export function normalizePanelParameter(
  row,
  {
    panelId = null,
    panelName = "",
    displayOrder = null,
  } = {}
) {
  if (
    !row ||
    typeof row !== "object"
  ) {
    return null;
  }

  const master =
    getRelatedMaster(row);

  /*
   * panel_tests rows normally contain the child master
   * under master_tests.
   *
   * Direct master_tests queries use row itself.
   */
  const source =
    master ??
    row;

  if (
    !source ||
    typeof source !== "object"
  ) {
    return null;
  }

  /*
   * --------------------------------------------------------
   * CHILD IDENTITY
   * --------------------------------------------------------
   *
   * IMPORTANT:
   *
   * The child gets its OWN ID.
   *
   * We never use panelId here.
   */
  const childId =
    safeId(
      firstValue(
        source.id,
        row.test_id,
        row.testId,
        row.master_test_id,
        row.masterTestId
      )
    );

  if (
    childId === null
  ) {
    return null;
  }

  /*
   * --------------------------------------------------------
   * CHILD NAME
   * --------------------------------------------------------
   */
  const childName =
    firstValue(
      source.test_name,
      source.testName,
      source.name,
      row.test_name,
      row.testName
    );

  if (
    !childName
  ) {
    return null;
  }

  /*
   * --------------------------------------------------------
   * PANEL ID
   * --------------------------------------------------------
   */
  const resolvedPanelId =
    safeId(
      firstValue(
        panelId,
        row.panel_id,
        row.panelId,
        row.parent_panel_id,
        row.parentPanelId,
        source.panel_id,
        source.panelId
      )
    );

  /*
   * --------------------------------------------------------
   * PANEL NAME
   * --------------------------------------------------------
   */
  const resolvedPanelName =
    normalizeString(
      firstValue(
        panelName,
        row.panel_name,
        row.panelName,
        source.panel_name,
        source.panelName
      )
    );

  /*
   * --------------------------------------------------------
   * DISPLAY ORDER
   * --------------------------------------------------------
   */
  const order =
    firstValue(
      displayOrder,
      row.display_order,
      row.displayOrder,
      source.display_order,
      source.displayOrder
    );

  /*
   * --------------------------------------------------------
   * RESULT PRESERVATION
   * --------------------------------------------------------
   *
   * We spread source and row-compatible metadata rather than
   * rebuilding a minimal object.
   *
   * This allows existing values such as:
   *
   *   result
   *   value
   *   entered_result
   *   unit
   *   reference_range
   *   interpretation
   *
   * to survive.
   */
  return {
    ...source,

    /*
     * CHILD MASTER ID
     */
    id:
      childId,

    test_id:
      childId,

    testId:
      childId,

    master_test_id:
      childId,

    masterTestId:
      childId,

    /*
     * PANEL_TESTS RELATIONSHIP ID
     */
    panel_test_id:
      row.id ??
      row.panel_test_id ??
      null,

    panelTestId:
      row.panelTestId ??
      row.panel_test_id ??
      row.id ??
      null,

    /*
     * PANEL RELATIONSHIP
     */
    panel_id:
      resolvedPanelId,

    panelId:
      resolvedPanelId,

    parent_panel_id:
      resolvedPanelId,

    parentPanelId:
      resolvedPanelId,

    /*
     * CHILD NAME
     */
    test_name:
      normalizeString(
        childName
      ),

    testName:
      normalizeString(
        childName
      ),

    /*
     * PANEL NAME
     */
    panel_name:
      resolvedPanelName,

    panelName:
      resolvedPanelName,

    /*
     * DISPLAY ORDER
     */
    display_order:
      order ?? null,

    displayOrder:
      order ?? null,

    /*
     * CHILD CLASSIFICATION
     */
    is_panel:
      false,

    isPanel:
      false,

    is_panel_child:
      true,

    isPanelChild:
      true,
  };
}


/* ==========================================================
   BACKWARD COMPATIBILITY
   ========================================================== */

export const normalizePanelChild =
  normalizePanelParameter;


/* ==========================================================
   NORMALIZE CHILD ARRAY
   ========================================================== */

export function normalizePanelParameters(
  rows,
  options = {}
) {
  if (
    !Array.isArray(rows)
  ) {
    return [];
  }

  const result = [];

  for (
    let index = 0;
    index < rows.length;
    index += 1
  ) {
    const row =
      rows[index];

    const normalized =
      normalizePanelParameter(
        row,
        {
          ...options,

          displayOrder:
            firstValue(
              row?.display_order,
              row?.displayOrder,
              index
            ),
        }
      );

    if (
      normalized
    ) {
      result.push(
        normalized
      );
    }
  }

  return result;
}


export const normalizePanelChildren =
  normalizePanelParameters;


/* ==========================================================
   CHILD METADATA SCORING
   ========================================================== */

function scoreChildMetadata(
  child
) {
  if (
    !child ||
    typeof child !== "object"
  ) {
    return 0;
  }

  let score = 0;

  const fields = [
    "unit",
    "reference_value",
    "referenceValue",
    "reference_range",
    "referenceRange",
    "male_range",
    "female_range",
    "child_range",
    "elderly_range",
    "result_type",
    "resultType",
    "result_category",
    "template_type",
    "templateType",
    "department",
    "specimen",
    "methodology",
    "method",
    "normal_range",
    "result",
    "value",
    "entered_result",
    "interpretation",
  ];

  for (
    const field of fields
  ) {
    const value =
      child[field];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      score += 1;
    }
  }

  return score;
}


/* ==========================================================
   CHILD DEDUPLICATION
   ----------------------------------------------------------
   IMPORTANT

   Children are deduplicated by their OWN identity.

   They are NOT deduplicated by panel ID.
   ========================================================== */

function deduplicateChildren(
  children
) {
  if (
    !Array.isArray(children)
  ) {
    return [];
  }

  const byId =
    new Map();

  const withoutId =
    [];

  for (
    const child of
      children
  ) {
    if (
      !child
    ) {
      continue;
    }

    const id =
      safeId(
        firstValue(
          child.id,
          child.test_id,
          child.testId,
          child.master_test_id,
          child.masterTestId
        )
      );

    if (
      id !== null
    ) {
      const existing =
        byId.get(id);

      if (
        !existing
      ) {
        byId.set(
          id,
          child
        );
      } else if (
        scoreChildMetadata(
          child
        ) >
        scoreChildMetadata(
          existing
        )
      ) {
        byId.set(
          id,
          child
        );
      }

      continue;
    }

    withoutId.push(
      child
    );
  }

  /*
   * Name fallback for records without IDs.
   */
  const byName =
    new Map();

  for (
    const child of
      withoutId
  ) {
    const name =
      canonicalTestName(
        firstValue(
          child?.test_name,
          child?.testName,
          child?.name
        )
      );

    if (
      !name
    ) {
      continue;
    }

    const existing =
      byName.get(name);

    if (
      !existing
    ) {
      byName.set(
        name,
        child
      );
    } else if (
      scoreChildMetadata(
        child
      ) >
      scoreChildMetadata(
        existing
      )
    ) {
      byName.set(
        name,
        child
      );
    }
  }

  /*
   * Merge ID and name results.
   *
   * A child with an ID is authoritative.
   */
  const combined = [
    ...byId.values(),
    ...byName.values(),
  ];

  const finalByIdentity =
    new Map();

  for (
    const child of
      combined
  ) {
    const id =
      safeId(
        firstValue(
          child?.test_id,
          child?.testId,
          child?.id,
          child?.master_test_id,
          child?.masterTestId
        )
      );

    const name =
      canonicalTestName(
        firstValue(
          child?.test_name,
          child?.testName,
          child?.name
        )
      );

    const key =
      id !== null
        ? `id:${id}`
        : `name:${name}`;

    const existing =
      finalByIdentity.get(
        key
      );

    if (
      !existing
    ) {
      finalByIdentity.set(
        key,
        child
      );
    } else if (
      scoreChildMetadata(
        child
      ) >
      scoreChildMetadata(
        existing
      )
    ) {
      finalByIdentity.set(
        key,
        child
      );
    }
  }

  /*
   * Final name collision protection.
   *
   * Do NOT collapse different IDs just because they happen
   * to share a name unless they are truly duplicates.
   */
  return [
    ...finalByIdentity.values(),
  ];
}


/* ==========================================================
   CHILD ORDERING
   ========================================================== */

function sortChildren(
  children
) {
  if (
    !Array.isArray(children)
  ) {
    return [];
  }

  return [
    ...children,
  ].sort(
    (
      a,
      b
    ) => {
      const orderA =
        Number(
          a?.display_order ??
          a?.displayOrder ??
          Number.MAX_SAFE_INTEGER
        );

      const orderB =
        Number(
          b?.display_order ??
          b?.displayOrder ??
          Number.MAX_SAFE_INTEGER
        );

      if (
        Number.isFinite(
          orderA
        ) &&
        Number.isFinite(
          orderB
        ) &&
        orderA !== orderB
      ) {
        return (
          orderA -
          orderB
        );
      }

      return String(
        a?.test_name ??
        a?.testName ??
        ""
      ).localeCompare(
        String(
          b?.test_name ??
          b?.testName ??
          ""
        ),
        undefined,
        {
          sensitivity:
            "base",
        }
      );
    }
  );
}


/* ==========================================================
   CHILD VALIDATION
   ========================================================== */

function filterInvalidChildren(
  children,
  panelName
) {
  if (
    !Array.isArray(children)
  ) {
    return [];
  }

  const canonicalPanel =
    canonicalPanelName(
      panelName
    );

  return children.filter(
    (
      child
    ) => {
      if (
        !child ||
        typeof child !==
          "object"
      ) {
        return false;
      }

      const childName =
        canonicalTestName(
          firstValue(
            child.test_name,
            child.testName,
            child.name
          )
        );

      if (
        !childName
      ) {
        return false;
      }

      /*
       * Panel itself must never become its own child.
       */
      if (
        canonicalPanel &&
        (
          childName ===
            canonicalPanel ||
          samePanelName(
            child.test_name,
            panelName
          )
        )
      ) {
        return false;
      }

      /*
       * EXPLICIT PANEL RECORDS ONLY
       *
       * IMPORTANT: `Panel Test` is a VALID child classification
       * in this LIS. It must NOT be rejected merely because
       * test_type contains the words "Panel Test".
       *
       * Only the actual panel master is excluded here.
       */
      const childIsExplicitPanel =
        child?.is_panel === true ||
        child?.isPanel === true ||
        normalizeString(child?.test_type) === "panel" ||
        normalizeString(child?.testType) === "panel" ||
        normalizeString(child?.result_type) === "panel" ||
        normalizeString(child?.resultType) === "panel";

      if (childIsExplicitPanel) {
        return false;
      }

      return true;
    }
  );
}


/* ==========================================================
   SOURCE 1
   ----------------------------------------------------------
   panel_tests
   ========================================================== */

async function loadFromPanelTests(
  panelId
) {
  const numericPanelId =
    safeId(panelId);

  if (
    numericPanelId === null
  ) {
    return {
      data: [],
      error:
        new Error(
          `Invalid panel ID: ${panelId}`
        ),
    };
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
    .eq(
      "panel_id",
      numericPanelId
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    );

  if (
    error
  ) {
    return {
      data: [],
      error,
    };
  }

  const normalized =
    normalizePanelParameters(
      data,
      {
        panelId:
          numericPanelId,
      }
    );

  return {
    data:
      sortChildren(
        deduplicateChildren(
          normalized
        )
      ),

    error: null,
  };
}


/* ==========================================================
   SOURCE 2
   ----------------------------------------------------------
   master_tests.panel_id
   ========================================================== */

async function loadFromMasterPanelId(
  panelId,
  panelName = ""
) {
  const numericPanelId =
    safeId(panelId);

  if (
    numericPanelId === null
  ) {
    return {
      data: [],
      error: null,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .eq(
      "panel_id",
      numericPanelId
    );

  if (
    error
  ) {
    return {
      data: [],
      error,
    };
  }

  const normalized =
    normalizePanelParameters(
      data,
      {
        panelId:
          numericPanelId,

        panelName,
      }
    );

  return {
    data:
      sortChildren(
        deduplicateChildren(
          normalized
        )
      ),

    error: null,
  };
}


/* ==========================================================
   SOURCE 3
   ----------------------------------------------------------
   master_tests.panel_name
   ========================================================== */

async function loadFromMasterPanelName(
  panelName,
  panelId = null
) {
  const originalName =
    normalizeString(
      panelName
    );

  if (
    !originalName
  ) {
    return {
      data: [],
      error: null,
    };
  }

  const canonicalPanel =
    canonicalPanelName(
      originalName
    );

  /*
   * --------------------------------------------------------
   * DIRECT NAME QUERY
   * --------------------------------------------------------
   */
  const {
    data: directRows,
    error: directError,
  } = await supabase
    .from("master_tests")
    .select("*")
    .ilike(
      "panel_name",
      originalName
    );

  if (
    directError
  ) {
    return {
      data: [],
      error: directError,
    };
  }

  let rows =
    Array.isArray(
      directRows
    )
      ? directRows
      : [];

  /*
   * --------------------------------------------------------
   * CANONICAL NAME QUERY
   * --------------------------------------------------------
   */
  if (
    rows.length === 0 &&
    canonicalPanel
  ) {
    const {
      data:
        canonicalRows,
      error:
        canonicalError,
    } = await supabase
      .from("master_tests")
      .select("*")
      .ilike(
        "panel_name",
        canonicalPanel
      );

    if (
      !canonicalError &&
      Array.isArray(
        canonicalRows
      )
    ) {
      rows =
        canonicalRows;
    }
  }

  /*
   * --------------------------------------------------------
   * JAVASCRIPT CANONICAL FILTER
   * --------------------------------------------------------
   */
  const filtered =
    rows.filter(
      (
        row
      ) => {
        const rowPanel =
          canonicalPanelName(
            row?.panel_name
          );

        if (
          canonicalPanel &&
          rowPanel
        ) {
          return (
            rowPanel ===
            canonicalPanel
          );
        }

        return samePanelName(
          row?.panel_name,
          originalName
        );
      }
    );

  const normalized =
    normalizePanelParameters(
      filtered,
      {
        panelId:
          safeId(panelId),

        panelName:
          originalName,
      }
    );

  return {
    data:
      sortChildren(
        deduplicateChildren(
          normalized
        )
      ),

    error: null,
  };
}


/* ==========================================================
   SOURCE 4
   ----------------------------------------------------------
   RESOLVE PANEL MASTER THEN SEARCH CHILDREN
   ----------------------------------------------------------
   This is the critical fallback for cases such as:

      panelId = 106
      panelName = ""

   master_tests:

      id = 106
      test_name = LFT

   children:

      AST
      ALT
      ALP
      GGT

   with:

      panel_name = "Liver Function Test"
   ========================================================== */

async function loadFromPanelMasterIdentity(
  panelId
) {
  const numericPanelId =
    safeId(panelId);

  if (
    numericPanelId === null
  ) {
    return {
      data: [],
      error: null,
      panelName: "",
      master: null,
    };
  }

  const {
    data: panelMaster,
    error:
      masterError,
  } =
    await resolvePanelMaster(
      numericPanelId
    );

  if (
    masterError
  ) {
    return {
      data: [],
      error:
        masterError,
      panelName: "",
      master: null,
    };
  }

  if (
    !panelMaster
  ) {
    return {
      data: [],
      error: null,
      panelName: "",
      master: null,
    };
  }

  const panelMasterName =
    getPanelMasterName(
      panelMaster
    );

  /*
   * First try children whose panel_name corresponds to the
   * panel master's test_name.
   */
  if (
    panelMasterName
  ) {
    const result =
      await loadFromMasterPanelName(
        panelMasterName,
        numericPanelId
      );

    if (
      Array.isArray(
        result?.data
      ) &&
      result.data.length > 0
    ) {
      return {
        data:
          result.data,

        error:
          result.error ??
          null,

        panelName:
          panelMasterName,

        master:
          panelMaster,
      };
    }
  }

  /*
   * If the panel master itself contains panel_name, try that.
   */
  const masterPanelName =
    normalizeString(
      firstValue(
        panelMaster.panel_name,
        panelMaster.panelName
      )
    );

  if (
    masterPanelName &&
    masterPanelName !==
      panelMasterName
  ) {
    const result =
      await loadFromMasterPanelName(
        masterPanelName,
        numericPanelId
      );

    if (
      Array.isArray(
        result?.data
      ) &&
      result.data.length > 0
    ) {
      return {
        data:
          result.data,

        error:
          result.error ??
          null,

        panelName:
          masterPanelName,

        master:
          panelMaster,
      };
    }
  }

  return {
    data: [],
    error: null,

    panelName:
      panelMasterName ||
      masterPanelName,

    master:
      panelMaster,
  };
}


/* ==========================================================
   MAIN PANEL PARAMETER RESOLUTION
   ========================================================== */

export async function getPanelParameters(
  input,
  optionalPanelName = ""
) {
  let panelId = null;
  let panelName = "";

  /*
   * --------------------------------------------------------
   * PARSE INPUT
   * --------------------------------------------------------
   */
  if (
    input &&
    typeof input === "object"
  ) {
    panelId =
      resolvePanelId(
        input
      );

    panelName =
      resolvePanelName(
        input
      );

    if (
      optionalPanelName &&
      normalizeString(
        optionalPanelName
      )
    ) {
      panelName =
        normalizeString(
          optionalPanelName
        );
    }
  } else {
    panelId =
      safeId(input);

    panelName =
      normalizeString(
        optionalPanelName
      );
  }


  console.log(
    "[panelParameterService] START PANEL RESOLUTION:",
    {
      requestedInput:
        input,

      panelId,

      panelName,
    }
  );


  /* ========================================================
     STEP 1
     --------------------------------------------------------
     If we have a panel ID but no panel name, resolve the
     actual panel master first.
     ======================================================== */

  let panelMaster =
    null;

  if (
    panelId !== null &&
    !panelName
  ) {
    try {
      const masterResult =
        await resolvePanelMaster(
          panelId
        );

      panelMaster =
        masterResult?.data ??
        null;

      if (
        panelMaster
      ) {
        panelName =
          getPanelMasterName(
            panelMaster
          );
      }

      console.log(
        "[panelParameterService] PANEL MASTER RESOLVED:",
        {
          panelId,

          panelName,

          master:
            panelMaster
              ? {
                  id:
                    panelMaster.id,

                  test_name:
                    panelMaster.test_name,

                  panel_name:
                    panelMaster.panel_name,

                  test_type:
                    panelMaster.test_type,
                }
              : null,
        }
      );
    } catch (
      error
    ) {
      console.warn(
        "[panelParameterService] Panel master lookup failed:",
        {
          panelId,
          error,
        }
      );
    }
  }


  /* ========================================================
     STEP 2
     --------------------------------------------------------
     SOURCE 1 — panel_tests
     ======================================================== */

  let panelTestsResult = {
    data: [],
    error: null,
  };

  if (
    panelId !== null
  ) {
    try {
      panelTestsResult =
        await loadFromPanelTests(
          panelId
        );
    } catch (
      error
    ) {
      panelTestsResult = {
        data: [],
        error,
      };
    }
  }

  let children =
    filterInvalidChildren(
      panelTestsResult.data,
      panelName
    );

  console.log(
    "[panelParameterService] SOURCE 1 panel_tests:",
    {
      panelId,
      panelName,
      count:
        children.length,
      error:
        panelTestsResult.error ??
        null,
    }
  );


  /* ========================================================
     STEP 3
     --------------------------------------------------------
     SOURCE 2 — master_tests.panel_id
     ======================================================== */

  if (
    children.length === 0 &&
    panelId !== null
  ) {
    let result;

    try {
      result =
        await loadFromMasterPanelId(
          panelId,
          panelName
        );
    } catch (
      error
    ) {
      result = {
        data: [],
        error,
      };
    }

    if (
      Array.isArray(
        result?.data
      )
    ) {
      children =
        filterInvalidChildren(
          result.data,
          panelName
        );
    }

    console.log(
      "[panelParameterService] SOURCE 2 master_tests.panel_id:",
      {
        panelId,
        panelName,

        count:
          children.length,

        error:
          result?.error ??
          null,
      }
    );
  }


  /* ========================================================
     STEP 4
     --------------------------------------------------------
     SOURCE 3 — master_tests.panel_name
     ======================================================== */

  if (
    children.length === 0 &&
    panelName
  ) {
    let result;

    try {
      result =
        await loadFromMasterPanelName(
          panelName,
          panelId
        );
    } catch (
      error
    ) {
      result = {
        data: [],
        error,
      };
    }

    if (
      Array.isArray(
        result?.data
      )
    ) {
      children =
        filterInvalidChildren(
          result.data,
          panelName
        );
    }

    console.log(
      "[panelParameterService] SOURCE 3 master_tests.panel_name:",
      {
        panelId,
        panelName,

        count:
          children.length,

        error:
          result?.error ??
          null,
      }
    );
  }


  /* ========================================================
     STEP 5
     --------------------------------------------------------
     SOURCE 4 — PANEL MASTER IDENTITY FALLBACK
     --------------------------------------------------------
     This catches the exact architecture represented by:

        LFT master = 106

        children:
          AST
          ALT
          ALP
          GGT

        child.panel_name =
          "Liver Function Test"
     ======================================================== */

  if (
    children.length === 0 &&
    panelId !== null
  ) {
    try {
      const result =
        await loadFromPanelMasterIdentity(
          panelId
        );

      if (
        Array.isArray(
          result?.data
        ) &&
        result.data.length > 0
      ) {
        children =
          filterInvalidChildren(
            result.data,
            panelName ||
              result.panelName
          );

        if (
          !panelName &&
          result.panelName
        ) {
          panelName =
            result.panelName;
        }

        panelMaster =
          result.master ??
          panelMaster;
      }

      console.log(
        "[panelParameterService] SOURCE 4 panel-master identity:",
        {
          panelId,

          panelName,

          count:
            children.length,

          master:
            panelMaster
              ? {
                  id:
                    panelMaster.id,

                  test_name:
                    panelMaster.test_name,

                  panel_name:
                    panelMaster.panel_name,
                }
              : null,
        }
      );
    } catch (
      error
    ) {
      console.warn(
        "[panelParameterService] Source 4 failed:",
        {
          panelId,
          panelName,
          error,
        }
      );
    }
  }


  /* ========================================================
     STEP 6
     --------------------------------------------------------
     FINAL DEDUPLICATION
     ======================================================== */

  children =
    sortChildren(
      deduplicateChildren(
        children
      )
    );


  /* ========================================================
     STEP 7
     --------------------------------------------------------
     FINAL CHILD IDENTITY ATTACHMENT
     ======================================================== */

  children =
    children.map(
      (
        child,
        index
      ) => {
        const finalPanelId =
          panelId ??
          safeId(
            child?.panel_id
          );

        const finalPanelName =
          panelName ||
          normalizeString(
            child?.panel_name ??
            child?.panelName
          );

        /*
         * CRITICAL:
         *
         * Preserve child's own identity.
         */
        const childId =
          safeId(
            firstValue(
              child?.test_id,
              child?.testId,
              child?.master_test_id,
              child?.masterTestId,
              child?.id
            )
          );

        return {
          ...child,

          /*
           * ---------------------------------------------
           * CHILD IDENTITY
           * ---------------------------------------------
           */
          id:
            childId,

          test_id:
            childId,

          testId:
            childId,

          master_test_id:
            childId,

          masterTestId:
            childId,

          /*
           * ---------------------------------------------
           * PARENT PANEL IDENTITY
           * ---------------------------------------------
           */
          panel_id:
            finalPanelId,

          panelId:
            finalPanelId,

          parent_panel_id:
            finalPanelId,

          parentPanelId:
            finalPanelId,

          /*
           * ---------------------------------------------
           * PARENT PANEL NAME
           * ---------------------------------------------
           */
          panel_name:
            finalPanelName,

          panelName:
            finalPanelName,

          /*
           * ---------------------------------------------
           * ORDER
           * ---------------------------------------------
           */
          display_order:
            child.display_order ??
            child.displayOrder ??
            index,

          displayOrder:
            child.displayOrder ??
            child.display_order ??
            index,

          /*
           * ---------------------------------------------
           * CHILD CLASSIFICATION
           * ---------------------------------------------
           */
          is_panel:
            false,

          isPanel:
            false,

          is_panel_child:
            true,

          isPanelChild:
            true,
        };
      }
    );


  /* ========================================================
     STEP 8
     --------------------------------------------------------
     FINAL SAFETY FILTER
     ======================================================== */

  children =
    filterInvalidChildren(
      children,
      panelName
    );


  /* ========================================================
     STEP 9
     --------------------------------------------------------
     FINAL SORT
     ======================================================== */

  children =
    sortChildren(
      children
    );


  /* ========================================================
     DIAGNOSTIC
     ======================================================== */

  console.log(
    "[panelParameterService] FINAL PANEL CHILDREN:",
    {
      panelId,

      panelName,

      childCount:
        children.length,

      children:
        children.map(
          (
            child
          ) => ({
            id:
              child?.id,

            test_id:
              child?.test_id,

            master_test_id:
              child?.master_test_id,

            test_name:
              child?.test_name,

            panel_id:
              child?.panel_id,

            panel_name:
              child?.panel_name,

            is_panel:
              child?.is_panel,

            is_panel_child:
              child?.is_panel_child,

            display_order:
              child?.display_order,

            result:
              child?.result,

            value:
              child?.value,

            entered_result:
              child?.entered_result,

            unit:
              child?.unit,

            reference_range:
              child?.reference_range,
          })
        ),
    }
  );


  /* ========================================================
     COMPATIBILITY RETURN OBJECT
     ======================================================== */

  return {
    data:
      children,

    error:
      null,

    parameters:
      children,

    panelTests:
      children,

    panel_tests:
      children,

    groupedTests:
      children,

    grouped_tests:
      children,
  };
}


/* ==========================================================
   GET PANEL CHILDREN
   ========================================================== */

export async function getPanelChildren(
  input,
  optionalPanelName = ""
) {
  return getPanelParameters(
    input,
    optionalPanelName
  );
}


/* ==========================================================
   GET PANEL PARAMETERS BY ID
   ========================================================== */

export async function getPanelParametersById(
  panelId,
  panelName = ""
) {
  return getPanelParameters(
    panelId,
    panelName
  );
}


/* ==========================================================
   GET PANEL PARAMETERS BY NAME
   ========================================================== */

export async function getPanelParametersByName(
  panelName
) {
  const name =
    normalizeString(
      panelName
    );

  if (
    !name
  ) {
    return {
      data: [],

      error:
        new Error(
          "Panel name is required."
        ),

      parameters: [],

      panelTests: [],

      panel_tests: [],

      groupedTests: [],

      grouped_tests: [],
    };
  }

  return getPanelParameters({
    panelId:
      null,

    panelName:
      name,
  });
}


/* ==========================================================
   FIND PANEL CHILD BY NAME
   ========================================================== */

export function findPanelChild(
  children,
  childName
) {
  if (
    !Array.isArray(children)
  ) {
    return null;
  }

  const requested =
    canonicalTestName(
      childName
    );

  if (
    !requested
  ) {
    return null;
  }

  return (
    children.find(
      (
        child
      ) =>
        canonicalTestName(
          firstValue(
            child?.test_name,
            child?.testName,
            child?.name
          )
        ) === requested
    ) ??
    null
  );
}


/* ==========================================================
   CHECK PANEL MEMBERSHIP
   ========================================================== */

export function isPanelParameter(
  child,
  panel
) {
  if (
    !child ||
    !panel
  ) {
    return false;
  }

  /*
   * A panel can never be its own parameter.
   */
  if (
    isPanelTest(child)
  ) {
    return false;
  }

  const panelId =
    resolvePanelId(
      panel
    );

  /*
   * Explicit child → panel relationship.
   */
  const childPanelId =
    safeId(
      getRelatedPanelId(
        child
      )
    );

  if (
    childPanelId !== null &&
    panelId !== null &&
    childPanelId === panelId
  ) {
    return true;
  }

  /*
   * Direct panel relationship fields.
   */
  const explicitChildPanelId =
    safeId(
      firstValue(
        child?.panel_id,
        child?.panelId,
        child?.parent_panel_id,
        child?.parentPanelId
      )
    );

  if (
    explicitChildPanelId !== null &&
    panelId !== null &&
    explicitChildPanelId === panelId
  ) {
    return true;
  }

  /*
   * Panel-name relationship.
   */
  const childPanelName =
    canonicalPanelName(
      firstValue(
        child?.panel_name,
        child?.panelName
      )
    );

  const panelName =
    canonicalPanelName(
      resolvePanelName(
        panel
      )
    );

  if (
    childPanelName &&
    panelName &&
    childPanelName === panelName
  ) {
    return true;
  }

  return false;
}


/* ==========================================================
   DEFAULT SERVICE OBJECT
   ========================================================== */

const panelParameterService = {
  /*
   * Primary APIs.
   */
  getPanelParameters,

  getPanelChildren,

  getPanelParametersById,

  getPanelParametersByName,

  /*
   * Identity.
   */
  resolvePanelId,

  resolvePanelName,

  /*
   * Normalization.
   */
  normalizePanelParameter,

  normalizePanelParameters,

  normalizePanelChild,

  normalizePanelChildren,

  /*
   * Lookup.
   */
  findPanelChild,

  isPanelParameter,
};


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default panelParameterService;