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
   REFERENCE RANGE ARCHITECTURE

   Reference information is preserved from the child master
   record using this priority:

      child-specific configured range
              ↓
      female / male / child / elderly range
              ↓
      reference_value
              ↓
      reference_range
              ↓
      normal_range
              ↓
      normal_low + normal_high

   The service exposes both legacy and normalized aliases:

      reference_value
      referenceValue

      reference_range
      referenceRange

      referenceRanges

      male_range
      female_range
      child_range
      elderly_range

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

/* ==========================================================
   LOCAL IDENTITY HELPERS
   ========================================================== */

const firstIdentityValue = (...values) => {
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

const toNumericId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const n = Number(value);

  return Number.isInteger(n) && n > 0
    ? n
    : null;
};

const identityNormalize = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[\_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const normalizeIdentityName = identityNormalize;

const PANEL_NAME_SET = new Set([
  "lft",
  "lft panel",
  "liver function test",
  "liver function profile",
  "liver profile",

  "rft",
  "rft panel",
  "renal function test",
  "renal function profile",
  "renal profile",

  "flp",
  "flp panel",
  "fasting lipid profile",
  "full lipid profile",
  "complete lipid profile",
  "lipid profile",

  "cbc",
  "cbc panel",
  "fbc",
  "full blood count",
  "complete blood count",
  "full blood count panel",

  "coagulation profile",
  "coagulation panel",
  "coagulation studies",
  "coagulation screen",

  "iron profile",
  "iron studies",
  "iron panel",
  "iron studies profile",

  "ue",
  "ues",
  "uecs",
  "eucr",
  "urea electrolytes",
  "urea and electrolytes",
  "urea & electrolytes",
  "serum electrolytes",

  "serum bilirubin",
  "bilirubin profile",
  "bilirubin panel",

  "serum calcium",
  "calcium profile",
  "calcium panel",

  "glucose profile",
  "ogtt",
  "ogtt panel",
  "oral glucose tolerance test",

  /* Endocrine / thyroid panel identities */
  "free thyroid profile",
  "free thyroid profile t3 t4 tsh",
  "free tft",

  "total thyroid profile",
  "total thyroid profile t3 t4 tsh",
  "total tft",

  "thyroid profile",
  "thyroid panel",
  "thyroid"
]);

const PANEL_CANONICAL = {
  "lft": "liver function test",
  "lft panel": "liver function test",
  "liver function profile": "liver function test",
  "liver profile": "liver function test",

  "rft": "renal function test",
  "rft panel": "renal function test",
  "renal function profile": "renal function test",
  "renal profile": "renal function test",

  "flp": "lipid profile",
  "flp panel": "lipid profile",
  "fasting lipid profile": "lipid profile",
  "full lipid profile": "lipid profile",
  "complete lipid profile": "lipid profile",

  "cbc": "full blood count",
  "cbc panel": "full blood count",
  "fbc": "full blood count",
  "complete blood count": "full blood count",
  "full blood count": "full blood count",
  "full blood count panel": "full blood count",

  "ue": "serum electrolytes",
  "ues": "serum electrolytes",
  "uecs": "serum electrolytes",
  "eucr": "serum electrolytes",
  "urea electrolytes": "serum electrolytes",
  "urea and electrolytes": "serum electrolytes",
  "urea & electrolytes": "serum electrolytes",

  "serum bilirubin": "serum bilirubin",
  "bilirubin profile": "serum bilirubin",
  "bilirubin panel": "serum bilirubin",

  "serum calcium": "serum calcium",
  "calcium profile": "serum calcium",
  "calcium panel": "serum calcium",

  "ogtt": "oral glucose tolerance test",
  "ogtt panel": "oral glucose tolerance test",

  /* Thyroid */
  "free thyroid profile": "free thyroid profile",
  "free thyroid profile t3 t4 tsh":
    "free thyroid profile",
  "free tft": "free thyroid profile",

  "total thyroid profile": "total thyroid profile",
  "total thyroid profile t3 t4 tsh":
    "total thyroid profile",
  "total tft": "total thyroid profile",

  "thyroid profile": "thyroid profile",
  "thyroid panel": "thyroid profile",
  "thyroid": "thyroid profile",
};

const getCanonicalTestName = (value) =>
  identityNormalize(value);

const getCanonicalPanelName = (value) => {
  const n = identityNormalize(value);

  return PANEL_CANONICAL[n] || n;
};

const getCanonicalPanelIdentity =
  getCanonicalPanelName;

const isKnownPanelName = (value) => {
  const normalized = identityNormalize(value);

  return (
    PANEL_NAME_SET.has(normalized) ||
    PANEL_CANONICAL[normalized] !== undefined
  );
};


/* ==========================================================
   PANEL IDENTITY
   ========================================================== */

const isPanelTest = (row = {}) => {
  if (
    !row ||
    typeof row !== "object"
  ) {
    return false;
  }

  const type = identityNormalize(
    row.test_type ??
      row.testType ??
      row.result_type ??
      row.resultType
  );

  return (
    row.is_panel === true ||
    row.isPanel === true ||
    type === "panel" ||
    type === "panel profile" ||
    identityNormalize(
      row.result_type ??
        row.resultType
    ) === "panel"
  );
};

const getRelatedPanelId = (row = {}) =>
  firstIdentityValue(
    row.panel_id,
    row.panelId,
    row.parent_panel_id,
    row.parentPanelId,
    row.masterTest?.panel_id,
    row.master_test?.panel_id
  );

const normalizeTestName = (value) =>
  identityNormalize(value);


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

function samePanelName(first, second) {
  const a = canonicalPanelName(first);
  const b = canonicalPanelName(second);

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
   REFERENCE RANGE HELPERS
   ----------------------------------------------------------
   Centralized here so every panel child exposes the same
   reference-range structure regardless of the source table.
   ========================================================== */

function normalizeRangeText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    if (
      Array.isArray(value)
    ) {
      return value
        .map(normalizeRangeText)
        .filter(Boolean)
        .join(" - ");
    }

    const low = firstValue(
      value.low,
      value.min,
      value.minimum,
      value.lower,
      value.normal_low
    );

    const high = firstValue(
      value.high,
      value.max,
      value.maximum,
      value.upper,
      value.normal_high
    );

    if (
      low !== "" &&
      high !== ""
    ) {
      return `${low} - ${high}`;
    }

    const valueText = firstValue(
      value.value,
      value.range,
      value.reference,
      value.text
    );

    if (
      valueText !== ""
    ) {
      return String(valueText).trim();
    }

    return "";
  }

  return String(value).trim();
}


/* ==========================================================
   BUILD LOW/HIGH RANGE
   ========================================================== */

function buildLowHighRange(row) {
  if (
    !row ||
    typeof row !== "object"
  ) {
    return "";
  }

  const low = firstValue(
    row.normal_low,
    row.normalLow,
    row.reference_low,
    row.referenceLow,
    row.low,
    row.min,
    row.minimum
  );

  const high = firstValue(
    row.normal_high,
    row.normalHigh,
    row.reference_high,
    row.referenceHigh,
    row.high,
    row.max,
    row.maximum
  );

  if (
    low === "" ||
    low === null ||
    low === undefined ||
    high === "" ||
    high === null ||
    high === undefined
  ) {
    return "";
  }

  return `${low} - ${high}`;
}


/* ==========================================================
   RESOLVE REFERENCE RANGE
   ----------------------------------------------------------
   Patient-aware helper.

   Priority:

      child
      ↓
      age-specific
      ↓
      sex-specific
      ↓
      configured generic range
      ↓
      low/high
   ========================================================== */

export function resolveReferenceRange(
  parameter = {},
  demographics = {}
) {
  if (
    !parameter ||
    typeof parameter !== "object"
  ) {
    return "";
  }

  const sex = identityNormalize(
    demographics?.sex ??
      demographics?.gender ??
      parameter?.sex ??
      parameter?.gender ??
      ""
  );

  const ageRaw =
    demographics?.age ??
    demographics?.patient_age ??
    parameter?.age;

  const age = Number(ageRaw);

  const female = normalizeRangeText(
    firstValue(
      parameter?.female_range,
      parameter?.femaleRange,
      parameter?.female_reference_range,
      parameter?.femaleReferenceRange
    )
  );

  const male = normalizeRangeText(
    firstValue(
      parameter?.male_range,
      parameter?.maleRange,
      parameter?.male_reference_range,
      parameter?.maleReferenceRange
    )
  );

  const child = normalizeRangeText(
    firstValue(
      parameter?.child_range,
      parameter?.childRange,
      parameter?.paediatric_range,
      parameter?.pediatric_range,
      parameter?.paediatricRange,
      parameter?.pediatricRange
    )
  );

  const elderly = normalizeRangeText(
    firstValue(
      parameter?.elderly_range,
      parameter?.elderlyRange
    )
  );

  const generic = normalizeRangeText(
    firstValue(
      parameter?.reference_range,
      parameter?.referenceRange,
      parameter?.reference_value,
      parameter?.referenceValue,
      parameter?.normal_range,
      parameter?.normalRange
    )
  );

  const lowHigh =
    buildLowHighRange(parameter);

  if (
    Number.isFinite(age) &&
    age < 18 &&
    child
  ) {
    return child;
  }

  if (
    Number.isFinite(age) &&
    age >= 65 &&
    elderly
  ) {
    return elderly;
  }

  if (
    ["female", "f"].includes(sex) &&
    female
  ) {
    return female;
  }

  if (
    ["male", "m"].includes(sex) &&
    male
  ) {
    return male;
  }

  return (
    generic ||
    lowHigh ||
    male ||
    female ||
    child ||
    elderly ||
    ""
  );
}


/* ==========================================================
   NORMALIZE REFERENCE METADATA
   ----------------------------------------------------------
   IMPORTANT:

   This does not invent clinical ranges.

   It only maps existing database fields into the aliases
   expected by the result-entry components.
   ========================================================== */

function normalizeReferenceMetadata(
  source = {}
) {
  const referenceValue =
    normalizeRangeText(
      firstValue(
        source.reference_value,
        source.referenceValue,
        source.reference_range,
        source.referenceRange,
        source.normal_range,
        source.normalRange
      )
    );

  const referenceRange =
    normalizeRangeText(
      firstValue(
        source.reference_range,
        source.referenceRange,
        source.reference_value,
        source.referenceValue,
        source.normal_range,
        source.normalRange
      )
    );

  const lowHigh =
    buildLowHighRange(source);

  const finalRange =
    referenceRange ||
    referenceValue ||
    lowHigh ||
    "";

  return {
    reference_value:
      referenceValue ||
      finalRange ||
      null,

    referenceValue:
      referenceValue ||
      finalRange ||
      null,

    reference_range:
      finalRange ||
      null,

    referenceRange:
      finalRange ||
      null,

    referenceRanges:
      finalRange
        ? finalRange
        : null,

    male_range:
      normalizeRangeText(
        firstValue(
          source.male_range,
          source.maleRange
        )
      ) || null,

    maleRange:
      normalizeRangeText(
        firstValue(
          source.male_range,
          source.maleRange
        )
      ) || null,

    female_range:
      normalizeRangeText(
        firstValue(
          source.female_range,
          source.femaleRange
        )
      ) || null,

    femaleRange:
      normalizeRangeText(
        firstValue(
          source.female_range,
          source.femaleRange
        )
      ) || null,

    child_range:
      normalizeRangeText(
        firstValue(
          source.child_range,
          source.childRange
        )
      ) || null,

    childRange:
      normalizeRangeText(
        firstValue(
          source.child_range,
          source.childRange
        )
      ) || null,

    elderly_range:
      normalizeRangeText(
        firstValue(
          source.elderly_range,
          source.elderlyRange
        )
      ) || null,

    elderlyRange:
      normalizeRangeText(
        firstValue(
          source.elderly_range,
          source.elderlyRange
        )
      ) || null,
  };
}


/* ==========================================================
   RESOLVE PANEL ID
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

  const explicitPanelId =
    firstValue(
      input.panelId,
      input.panel_id,
      input.parentPanelId,
      input.parent_panel_id
    );

  const resolvedExplicit =
    safeId(explicitPanelId);

  if (
    resolvedExplicit !== null
  ) {
    return resolvedExplicit;
  }

  if (
    isPanelTest(input)
  ) {
    return safeId(input.id);
  }

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
    return safeId(input.id);
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
   RESOLVE PANEL MASTER
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
   RESOLVE PANEL MASTER NAME
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

  const source =
    master ??
    row;

  if (
    !source ||
    typeof source !== "object"
  ) {
    return null;
  }

  /* --------------------------------------------------------
     CHILD IDENTITY
     -------------------------------------------------------- */

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

  /* --------------------------------------------------------
     CHILD NAME
     -------------------------------------------------------- */

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

  /* --------------------------------------------------------
     PANEL ID
     -------------------------------------------------------- */

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

  /* --------------------------------------------------------
     PANEL NAME
     -------------------------------------------------------- */

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

  /* --------------------------------------------------------
     DISPLAY ORDER
     -------------------------------------------------------- */

  const order =
    firstValue(
      displayOrder,
      row.display_order,
      row.displayOrder,
      source.display_order,
      source.displayOrder
    );

  /* --------------------------------------------------------
     REFERENCE METADATA
     -------------------------------------------------------- */

  const referenceMetadata =
    normalizeReferenceMetadata(
      source
    );

  /* --------------------------------------------------------
     RESULT / UNIT / SPECIMEN METADATA
     -------------------------------------------------------- */

  const unit =
    normalizeString(
      firstValue(
        source.unit,
        source.result_unit,
        source.resultUnit,
        row.unit,
        row.result_unit,
        row.resultUnit
      )
    );

  const resultType =
    firstValue(
      source.result_type,
      source.resultType,
      row.result_type,
      row.resultType
    );

  const department =
    firstValue(
      source.department,
      row.department
    );

  const specimen =
    firstValue(
      source.specimen,
      source.specimen_type,
      source.specimenType,
      row.specimen,
      row.specimen_type,
      row.specimenType
    );

  /* --------------------------------------------------------
     RETURN
     -------------------------------------------------------- */

  return {
    /*
     * Preserve all child metadata and existing result fields.
     */
    ...source,

    /*
     * Child identity.
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
     * panel_tests relationship identity.
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
     * Parent panel relationship.
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
     * Child name.
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
     * Parent panel name.
     */
    panel_name:
      resolvedPanelName,

    panelName:
      resolvedPanelName,

    /*
     * Display order.
     */
    display_order:
      order ?? null,

    displayOrder:
      order ?? null,

    /*
     * Result metadata.
     */
    unit:
      unit || null,

    result_unit:
      unit || null,

    resultUnit:
      unit || null,

    result_type:
      resultType ??
      source.result_type ??
      null,

    resultType:
      resultType ??
      source.resultType ??
      null,

    department:
      department ||
      null,

    specimen:
      specimen ||
      null,

    specimen_type:
      specimen ||
      null,

    specimenType:
      specimen ||
      null,

    /*
     * Reference range aliases.
     */
    ...referenceMetadata,

    /*
     * CHILD CLASSIFICATION.
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
    "result_unit",

    "reference_value",
    "referenceValue",

    "reference_range",
    "referenceRange",
    "referenceRanges",

    "male_range",
    "maleRange",
    "female_range",
    "femaleRange",
    "child_range",
    "childRange",
    "elderly_range",
    "elderlyRange",

    "normal_range",
    "normalRange",
    "normal_low",
    "normal_high",

    "result_type",
    "resultType",

    "result_category",

    "template_type",
    "templateType",

    "department",
    "specimen",

    "methodology",
    "method",

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
    const child of children
  ) {
    if (!child) {
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

  const byName =
    new Map();

  for (
    const child of withoutId
  ) {
    const name =
      canonicalTestName(
        firstValue(
          child?.test_name,
          child?.testName,
          child?.name
        )
      );

    if (!name) {
      continue;
    }

    const existing =
      byName.get(name);

    if (!existing) {
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

  const combined = [
    ...byId.values(),
    ...byName.values(),
  ];

  const finalByIdentity =
    new Map();

  for (
    const child of combined
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
      finalByIdentity.get(key);

    if (!existing) {
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
    (a, b) => {
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
        Number.isFinite(orderA) &&
        Number.isFinite(orderB) &&
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
          sensitivity: "base",
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
    (child) => {
      if (
        !child ||
        typeof child !== "object"
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

      if (!childName) {
        return false;
      }

      /*
       * Panel itself can never be its own child.
       */
      if (
        canonicalPanel &&
        (
          childName === canonicalPanel ||
          samePanelName(
            child.test_name,
            panelName
          )
        )
      ) {
        return false;
      }

      /*
       * Only ACTUAL panel records are rejected.
       *
       * "Panel Test" remains a valid child classification.
       */
      const childIsExplicitPanel =
        child?.is_panel === true ||
        child?.isPanel === true ||
        normalizeString(
          child?.test_type
        ).toLowerCase() === "panel" ||
        normalizeString(
          child?.testType
        ).toLowerCase() === "panel" ||
        normalizeString(
          child?.result_type
        ).toLowerCase() === "panel" ||
        normalizeString(
          child?.resultType
        ).toLowerCase() === "panel";

      if (
        childIsExplicitPanel
      ) {
        return false;
      }

      return true;
    }
  );
}


/* ==========================================================
   SOURCE 1
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

  if (error) {
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

  if (error) {
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

  if (!originalName) {
    return {
      data: [],
      error: null,
    };
  }

  const canonicalPanel =
    canonicalPanelName(
      originalName
    );

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

  if (directError) {
    return {
      data: [],
      error: directError,
    };
  }

  let rows =
    Array.isArray(directRows)
      ? directRows
      : [];

  if (
    rows.length === 0 &&
    canonicalPanel
  ) {
    const {
      data: canonicalRows,
      error: canonicalError,
    } = await supabase
      .from("master_tests")
      .select("*")
      .ilike(
        "panel_name",
        canonicalPanel
      );

    if (
      !canonicalError &&
      Array.isArray(canonicalRows)
    ) {
      rows = canonicalRows;
    }
  }

  const filtered =
    rows.filter(
      (row) => {
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
   PANEL MASTER IDENTITY FALLBACK
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
    error: masterError,
  } =
    await resolvePanelMaster(
      numericPanelId
    );

  if (masterError) {
    return {
      data: [],
      error: masterError,
      panelName: "",
      master: null,
    };
  }

  if (!panelMaster) {
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

  if (panelMasterName) {
    const result =
      await loadFromMasterPanelName(
        panelMasterName,
        numericPanelId
      );

    if (
      Array.isArray(result?.data) &&
      result.data.length > 0
    ) {
      return {
        data: result.data,
        error: result.error ?? null,
        panelName: panelMasterName,
        master: panelMaster,
      };
    }
  }

  const masterPanelName =
    normalizeString(
      firstValue(
        panelMaster.panel_name,
        panelMaster.panelName
      )
    );

  if (
    masterPanelName &&
    masterPanelName !== panelMasterName
  ) {
    const result =
      await loadFromMasterPanelName(
        masterPanelName,
        numericPanelId
      );

    if (
      Array.isArray(result?.data) &&
      result.data.length > 0
    ) {
      return {
        data: result.data,
        error: result.error ?? null,
        panelName: masterPanelName,
        master: panelMaster,
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

  /* --------------------------------------------------------
     PARSE INPUT
     -------------------------------------------------------- */

  if (
    input &&
    typeof input === "object"
  ) {
    panelId =
      resolvePanelId(input);

    panelName =
      resolvePanelName(input);

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
      requestedInput: input,
      panelId,
      panelName,
    }
  );


  /* --------------------------------------------------------
     STEP 1
     Resolve panel master when needed.
     -------------------------------------------------------- */

  let panelMaster = null;

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

      if (panelMaster) {
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
    } catch (error) {
      console.warn(
        "[panelParameterService] Panel master lookup failed:",
        {
          panelId,
          error,
        }
      );
    }
  }


  /* --------------------------------------------------------
     STEP 2
     SOURCE 1 — panel_tests
     -------------------------------------------------------- */

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
    } catch (error) {
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
      count: children.length,
      error:
        panelTestsResult.error ??
        null,
    }
  );


  /* --------------------------------------------------------
     STEP 3
     SOURCE 2 — master_tests.panel_id
     -------------------------------------------------------- */

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
    } catch (error) {
      result = {
        data: [],
        error,
      };
    }

    if (
      Array.isArray(result?.data)
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
        count: children.length,
        error:
          result?.error ??
          null,
      }
    );
  }


  /* --------------------------------------------------------
     STEP 4
     SOURCE 3 — master_tests.panel_name
     -------------------------------------------------------- */

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
    } catch (error) {
      result = {
        data: [],
        error,
      };
    }

    if (
      Array.isArray(result?.data)
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
        count: children.length,
        error:
          result?.error ??
          null,
      }
    );
  }


  /* --------------------------------------------------------
     STEP 5
     SOURCE 4 — PANEL MASTER IDENTITY FALLBACK
     -------------------------------------------------------- */

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
        Array.isArray(result?.data) &&
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
          count: children.length,

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
    } catch (error) {
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


  /* --------------------------------------------------------
     STEP 6
     FINAL DEDUPLICATION
     -------------------------------------------------------- */

  children =
    sortChildren(
      deduplicateChildren(
        children
      )
    );


  /* --------------------------------------------------------
     STEP 7
     FINAL CHILD IDENTITY + REFERENCE RANGE
     -------------------------------------------------------- */

  children =
    children.map(
      (child, index) => {
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
         * IMPORTANT:
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

        /*
         * Re-normalize reference metadata after all source
         * merges have completed.
         */
        const referenceMetadata =
          normalizeReferenceMetadata(
            child
          );

        return {
          ...child,

          /* ---------------------------------------------
             CHILD IDENTITY
             --------------------------------------------- */

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

          /* ---------------------------------------------
             PANEL IDENTITY
             --------------------------------------------- */

          panel_id:
            finalPanelId,

          panelId:
            finalPanelId,

          parent_panel_id:
            finalPanelId,

          parentPanelId:
            finalPanelId,

          /* ---------------------------------------------
             PANEL NAME
             --------------------------------------------- */

          panel_name:
            finalPanelName,

          panelName:
            finalPanelName,

          /* ---------------------------------------------
             ORDER
             --------------------------------------------- */

          display_order:
            child.display_order ??
            child.displayOrder ??
            index,

          displayOrder:
            child.displayOrder ??
            child.display_order ??
            index,

          /* ---------------------------------------------
             REFERENCE RANGE
             --------------------------------------------- */

          ...referenceMetadata,

          /* ---------------------------------------------
             CHILD CLASSIFICATION
             --------------------------------------------- */

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


  /* --------------------------------------------------------
     STEP 8
     FINAL SAFETY FILTER
     -------------------------------------------------------- */

  children =
    filterInvalidChildren(
      children,
      panelName
    );


  /* --------------------------------------------------------
     STEP 9
     FINAL SORT
     -------------------------------------------------------- */

  children =
    sortChildren(
      children
    );


  /* --------------------------------------------------------
     DIAGNOSTIC
     -------------------------------------------------------- */

  console.log(
    "[panelParameterService] FINAL PANEL CHILDREN:",
    {
      panelId,
      panelName,

      childCount:
        children.length,

      children:
        children.map(
          (child) => ({
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

            reference_value:
              child?.reference_value,

            reference_range:
              child?.reference_range,

            referenceRange:
              child?.referenceRange,

            male_range:
              child?.male_range,

            female_range:
              child?.female_range,

            child_range:
              child?.child_range,

            elderly_range:
              child?.elderly_range,
          })
        ),
    }
  );


  /* --------------------------------------------------------
     COMPATIBILITY RETURN OBJECT
     -------------------------------------------------------- */

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

  if (!name) {
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
    panelId: null,
    panelName: name,
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

  if (!requested) {
    return null;
  }

  return (
    children.find(
      (child) =>
        canonicalTestName(
          firstValue(
            child?.test_name,
            child?.testName,
            child?.name
          )
        ) === requested
    ) ?? null
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
    resolvePanelId(panel);

  /*
   * Explicit child → panel relationship.
   */
  const childPanelId =
    safeId(
      getRelatedPanelId(child)
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
      resolvePanelName(panel)
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
   * Reference range.
   */
  resolveReferenceRange,

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