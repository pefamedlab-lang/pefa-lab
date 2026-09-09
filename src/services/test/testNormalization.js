/* ==========================================================
   PEFA LAB
   TEST NORMALIZATION SERVICE
   ----------------------------------------------------------
   FILE:
      src/services/test/testNormalization.js

   PURPOSE
   ----------------------------------------------------------
   Centralize all test-name, panel-name, test-type, result-type,
   department and identity normalization.

   CRITICAL IDENTITY RULE
   ----------------------------------------------------------
   NORMALIZATION MUST NEVER TURN A CHILD TEST INTO ITS PANEL.

      LFT  -> liver function test
      RFT  -> renal function test
      CBC  -> complete blood count
      FLP  -> lipid profile
      TFT  -> thyroid function test

      AST  -> ast
      ALT  -> alt
      ALP  -> alp
      GGT  -> ggt
      eGFR -> egfr
      Urea -> urea
      Creatinine -> creatinine

   Therefore:

      AST  != LFT
      ALT  != LFT
      eGFR != RFT
      Urea != RFT

   This module contains:
      - NO Supabase calls
      - NO React code
      - NO result-saving logic
      - NO panel membership queries

   Panel membership is handled elsewhere.
   ========================================================== */


/* ==========================================================
   BASIC TEXT NORMALIZATION
   ========================================================== */

export function normalizeTestName(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[._/\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ==========================================================
   COMPACT TEST NAME
   ========================================================== */

export function compactTestName(
  value
) {
  return normalizeTestName(
    value
  ).replace(
    /[^a-z0-9]/g,
    ""
  );
}


/* ==========================================================
   TEST NAME ALIASES
   ----------------------------------------------------------
   These aliases normalize equivalent names.

   They DO NOT establish panel membership.
   ========================================================== */

const TEST_NAME_ALIASES = {

  /* --------------------------------------------------------
     LIVER FUNCTION
     -------------------------------------------------------- */

  lft:
    "liver function test",

  "liver function":
    "liver function test",

  "liver function tests":
    "liver function test",

  "liver function panel":
    "liver function test",

  "liver profile":
    "liver function test",

  "liver panel":
    "liver function test",


  /* --------------------------------------------------------
     RENAL FUNCTION
     -------------------------------------------------------- */

  rft:
    "renal function test",

  "renal function":
    "renal function test",

  "renal function tests":
    "renal function test",

  "renal function panel":
    "renal function test",

  "renal profile":
    "renal function test",

  "renal panel":
    "renal function test",

  "kidney function":
    "renal function test",

  "kidney function test":
    "renal function test",

  "kidney function tests":
    "renal function test",


  /* --------------------------------------------------------
     COMPLETE BLOOD COUNT
     -------------------------------------------------------- */

  cbc:
    "complete blood count",

  fbc:
    "complete blood count",

  "full blood count":
    "complete blood count",

  "full blood examination":
    "complete blood count",

  "complete blood examination":
    "complete blood count",

  "cbc panel":
    "complete blood count",


  /* --------------------------------------------------------
     LIPID PROFILE
     -------------------------------------------------------- */

  flp:
    "lipid profile",

  "lipid profile test":
    "lipid profile",

  "lipid profile panel":
    "lipid profile",

  "fasting lipid profile":
    "lipid profile",

  "lipid panel":
    "lipid profile",

  "cholesterol profile":
    "lipid profile",


  /* --------------------------------------------------------
     THYROID FUNCTION
     -------------------------------------------------------- */

  tft:
    "thyroid function test",

  "thyroid function":
    "thyroid function test",

  "thyroid function tests":
    "thyroid function test",

  "thyroid profile":
    "thyroid function test",

  "thyroid panel":
    "thyroid function test",


  /* --------------------------------------------------------
     ELECTROLYTE PANEL
     -------------------------------------------------------- */

  electrolytes:
    "electrolyte panel",

  "electrolyte profile":
    "electrolyte panel",

  "electrolyte panel":
    "electrolyte panel",


  /* ========================================================
     LIVER CHILD / SINGLE TESTS
     ======================================================== */

  ast:
    "ast",

  sgot:
    "ast",

  "aspartate aminotransferase":
    "ast",

  alt:
    "alt",

  sgpt:
    "alt",

  "alanine aminotransferase":
    "alt",

  alp:
    "alp",

  "alkaline phosphatase":
    "alp",

  ggt:
    "ggt",

  "gamma glutamyl transferase":
    "ggt",

  "gamma-glutamyl transferase":
    "ggt",

  "gamma glutamyl transpeptidase":
    "ggt",


  /* ========================================================
     RENAL CHILD / SINGLE TESTS
     ======================================================== */

  egfr:
    "egfr",

  "estimated glomerular filtration rate":
    "egfr",

  creatinine:
    "creatinine",

  "serum creatinine":
    "creatinine",

  urea:
    "urea",

  "blood urea":
    "urea",

  "blood urea nitrogen":
    "blood urea nitrogen",

  bun:
    "blood urea nitrogen",


  /* ========================================================
     ELECTROLYTES
     ======================================================== */

  sodium:
    "sodium",

  na:
    "sodium",

  potassium:
    "potassium",

  k:
    "potassium",

  chloride:
    "chloride",

  cl:
    "chloride",

  bicarbonate:
    "bicarbonate",

  "total carbon dioxide":
    "bicarbonate",

  co2:
    "bicarbonate",


  /* ========================================================
     CBC CHILD TESTS
     ======================================================== */

  haemoglobin:
    "haemoglobin",

  hemoglobin:
    "haemoglobin",

  hb:
    "haemoglobin",

  hgb:
    "haemoglobin",

  pcv:
    "pcv",

  "packed cell volume":
    "pcv",

  haematocrit:
    "pcv",

  hematocrit:
    "pcv",

  rbc:
    "rbc",

  "red blood cell":
    "rbc",

  "red blood cells":
    "rbc",

  wbc:
    "wbc",

  "white blood cell":
    "wbc",

  "white blood cells":
    "wbc",

  platelet:
    "platelets",

  platelets:
    "platelets",

  "platelet count":
    "platelets",

  mcv:
    "mcv",

  mch:
    "mch",

  mchc:
    "mchc",

  neutrophils:
    "neutrophils",

  neutrophil:
    "neutrophils",

  lymphocytes:
    "lymphocytes",

  lymphocyte:
    "lymphocytes",

  monocytes:
    "monocytes",

  monocyte:
    "monocytes",

  eosinophils:
    "eosinophils",

  eosinophil:
    "eosinophils",

  basophils:
    "basophils",

  basophil:
    "basophils",
};


/* ==========================================================
   CANONICAL TEST NAME
   ========================================================== */

export function getCanonicalTestName(
  value
) {
  const normalized =
    normalizeTestName(
      value
    );

  if (!normalized) {
    return "";
  }

  return (
    TEST_NAME_ALIASES[
      normalized
    ] ??
    normalized
  );
}


/* ==========================================================
   TEST NAME ALIAS
   ========================================================== */

export function getTestNameAlias(
  value
) {
  return getCanonicalTestName(
    value
  );
}


/* ==========================================================
   TEST NAME COMPARISON
   ========================================================== */

export function isSameTestName(
  first,
  second
) {
  const firstCanonical =
    getCanonicalTestName(
      first
    );

  const secondCanonical =
    getCanonicalTestName(
      second
    );

  if (
    !firstCanonical ||
    !secondCanonical
  ) {
    return false;
  }

  return (
    firstCanonical ===
    secondCanonical
  );
}


/* ==========================================================
   TOLERANT TEST NAME MATCH
   ========================================================== */

export function testNameMatches(
  first,
  second
) {
  const firstCompact =
    compactTestName(
      getCanonicalTestName(
        first
      )
    );

  const secondCompact =
    compactTestName(
      getCanonicalTestName(
        second
      )
    );

  if (
    !firstCompact ||
    !secondCompact
  ) {
    return false;
  }

  return (
    firstCompact ===
    secondCompact
  );
}


/* ==========================================================
   KNOWN PANEL NAMES
   ========================================================== */

export function isKnownPanelName(
  value
) {
  const canonical =
    getCanonicalTestName(
      value
    );

  return (
    canonical ===
      "liver function test" ||

    canonical ===
      "renal function test" ||

    canonical ===
      "complete blood count" ||

    canonical ===
      "lipid profile" ||

    canonical ===
      "thyroid function test" ||

    canonical ===
      "electrolyte panel"
  );
}


/* ==========================================================
   CANONICAL PANEL NAME
   ----------------------------------------------------------
   Returns a value ONLY if the supplied value itself is a
   recognized panel name.
   ========================================================== */

export function getCanonicalPanelName(
  value
) {
  const canonical =
    getCanonicalTestName(
      value
    );

  if (
    !isKnownPanelName(
      canonical
    )
  ) {
    return "";
  }

  return canonical;
}


/* ==========================================================
   PANEL TYPE
   ========================================================== */

export function getPanelType(
  value
) {
  const canonical =
    getCanonicalPanelName(
      value
    );

  if (!canonical) {
    return "";
  }

  switch (
    canonical
  ) {
    case "liver function test":
      return "lft";

    case "renal function test":
      return "rft";

    case "complete blood count":
      return "cbc";

    case "lipid profile":
      return "flp";

    case "thyroid function test":
      return "tft";

    case "electrolyte panel":
      return "electrolyte";

    default:
      return "";
  }
}


/* ==========================================================
   KNOWN CHILD TEST
   ----------------------------------------------------------
   IMPORTANT:
   A child remains a child.
   ========================================================== */

export function isKnownChildTest(
  value
) {
  const canonical =
    getCanonicalTestName(
      value
    );

  if (!canonical) {
    return false;
  }

  return (

    /* LFT */
    canonical === "ast" ||
    canonical === "alt" ||
    canonical === "alp" ||
    canonical === "ggt" ||

    /* RFT */
    canonical === "egfr" ||
    canonical === "creatinine" ||
    canonical === "urea" ||
    canonical === "blood urea nitrogen" ||

    /* Electrolytes */
    canonical === "sodium" ||
    canonical === "potassium" ||
    canonical === "chloride" ||
    canonical === "bicarbonate" ||

    /* CBC */
    canonical === "haemoglobin" ||
    canonical === "pcv" ||
    canonical === "rbc" ||
    canonical === "wbc" ||
    canonical === "platelets" ||
    canonical === "mcv" ||
    canonical === "mch" ||
    canonical === "mchc" ||
    canonical === "neutrophils" ||
    canonical === "lymphocytes" ||
    canonical === "monocytes" ||
    canonical === "eosinophils" ||
    canonical === "basophils"
  );
}


/* ==========================================================
   TEST CATEGORY
   ========================================================== */

export function getTestCategory(
  value
) {
  const canonical =
    getCanonicalTestName(
      value
    );

  if (!canonical) {
    return "unknown";
  }

  if (
    isKnownPanelName(
      canonical
    )
  ) {
    return "panel";
  }

  if (
    isKnownChildTest(
      canonical
    )
  ) {
    return "child";
  }

  return "single";
}


/* ==========================================================
   COMPATIBILITY:
   NORMALIZE TEST TYPE
   ----------------------------------------------------------
   Supports existing callers expecting:
      normalizeTestType()
   ========================================================== */

export function normalizeTestType(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ==========================================================
   COMPATIBILITY:
   NORMALIZE RESULT TYPE
   ========================================================== */

export function normalizeResultType(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ==========================================================
   COMPATIBILITY:
   NORMALIZE DEPARTMENT
   ========================================================== */

export function normalizeDepartment(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ==========================================================
   COMPATIBILITY:
   NORMALIZE PANEL NAME
   ========================================================== */

export function normalizePanelName(
  value
) {
  const canonical =
    getCanonicalPanelName(
      value
    );

  if (canonical) {
    return canonical;
  }

  return normalizeTestName(
    value
  );
}


/* ==========================================================
   COMPATIBILITY:
   CANONICAL NAME
   ========================================================== */

export function getCanonicalName(
  value
) {
  return getCanonicalTestName(
    value
  );
}


/* ==========================================================
   COMPATIBILITY:
   CANONICAL PANEL
   ========================================================== */

export function getCanonicalPanel(
  value
) {
  return getCanonicalPanelName(
    value
  );
}


/* ==========================================================
   COMPATIBILITY:
   TEST PANEL TYPE
   ========================================================== */

export function getTestPanelType(
  value
) {
  return getPanelType(
    value
  );
}


/* ==========================================================
   NORMALIZE TEST OBJECT
   ----------------------------------------------------------
   Does not remove original database fields.

   It adds normalized helper properties only.
   ========================================================== */

export function normalizeTestObject(
  test = {}
) {
  if (
    !test ||
    typeof test !== "object" ||
    Array.isArray(test)
  ) {
    return {
      original:
        test,

      testName:
        "",

      canonicalName:
        "",

      panelName:
        "",

      panelType:
        "",

      category:
        "unknown",
    };
  }

  const rawName =
    test.test_name ??
    test.testName ??
    test.name ??
    test.parameter_name ??
    test.parameter ??
    test.panel_name ??
    test.panelName ??
    "";

  const rawPanelName =
    test.panel_name ??
    test.panelName ??
    "";

  const canonicalName =
    getCanonicalTestName(
      rawName
    );

  const canonicalPanelName =
    getCanonicalPanelName(
      rawPanelName
    );

  return {
    ...test,

    testName:
      String(
        rawName ?? ""
      ).trim(),

    canonicalName,

    panelName:
      canonicalPanelName,

    panelType:
      getPanelType(
        canonicalPanelName
      ),

    category:
      canonicalPanelName
        ? "panel"
        : getTestCategory(
            canonicalName
          ),
  };
}


/* ==========================================================
   NORMALIZE TEST
   ----------------------------------------------------------
   Compatibility alias.
   ========================================================== */

export const normalizeTest =
  normalizeTestObject;


/* ==========================================================
   CANONICALIZE TEST NAME
   ========================================================== */

export const canonicalizeTestName =
  getCanonicalTestName;


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

const testNormalization = {

  normalizeTestName,
  compactTestName,

  getCanonicalTestName,
  getTestNameAlias,

  isSameTestName,
  testNameMatches,

  isKnownPanelName,
  getCanonicalPanelName,
  getPanelType,

  isKnownChildTest,
  getTestCategory,

  normalizeTestType,
  normalizeResultType,
  normalizeDepartment,
  normalizePanelName,

  getCanonicalName,
  getCanonicalPanel,
  getTestPanelType,

  normalizeTestObject,
  normalizeTest,

  canonicalizeTestName,
};


export default testNormalization;