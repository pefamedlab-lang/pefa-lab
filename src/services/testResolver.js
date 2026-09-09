/* ==========================================================
   PEFA LAB
   TEST RESOLVER SERVICE
   ----------------------------------------------------------
   RESPONSIBILITY
   ----------------------------------------------------------
   Centralized test identity and master-test resolution.

   IMPORTANT RULES
   ----------------------------------------------------------
   1. A registered PANEL remains a PANEL.
   2. Never resolve a panel to one of its children.
   3. CBC must remain CBC.
   4. LFT must remain LFT.
   5. RFT must remain RFT.
   6. FLP must remain FLP.
   7. Child tests such as AST, ALT, eGFR and cholesterol
      must NOT replace their parent panel.
   8. Existing registered-test identity is preserved.
========================================================== */

import { supabase } from "../supabase";

/* ==========================================================
   NORMALIZE TEXT
========================================================== */

export function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[_/\\-]+/g, " ")
    .replace(/[()[\]{}.,:;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ==========================================================
   NORMALIZE TEST NAME
========================================================== */

export function normalizeTestName(value) {
  return normalizeText(value);
}


/* ==========================================================
   NUMERIC ID HELPERS
========================================================== */

export function isNumericId(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  return /^\d+$/.test(
    String(value).trim()
  );
}


export function toNumericId(value) {
  if (!isNumericId(value)) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number)
    ? number
    : null;
}


/* ==========================================================
   KNOWN PANEL NAMES
   ----------------------------------------------------------
   These are safeguards.

   Database metadata remains the primary authority.
========================================================== */

export const PANEL_NAME_ALIASES = {

  cbc: [
    "cbc",
    "complete blood count",
    "full blood count",
    "fbc",
    "complete blood picture",
  ],

  lft: [
    "lft",
    "liver function test",
    "liver function tests",
    "liver profile",
    "hepatic function test",
    "hepatic function tests",
  ],

  rft: [
    "rft",
    "renal function test",
    "renal function tests",
    "renal profile",
    "kidney function test",
    "kidney function tests",
  ],

  flp: [
    "flp",
    "lipid profile",
    "lipid profile test",
    "lipid profile tests",
    "full lipid profile",
    "fasting lipid profile",
    "fasting lipid profile test",
  ],

  tft: [
    "tft",
    "thyroid function test",
    "thyroid function tests",
    "thyroid profile",
  ],

  electrolytes: [
    "electrolytes",
    "electrolytes profile",
    "electrolyte profile",
    "electrolytes and urea",
    "eucr",
    "uecr",
  ],

};


/* ==========================================================
   BUILD PANEL ALIAS LOOKUP
========================================================== */

const PANEL_ALIAS_LOOKUP = Object.entries(
  PANEL_NAME_ALIASES
).reduce(
  (lookup, [key, aliases]) => {

    aliases.forEach((alias) => {

      lookup[
        normalizeTestName(alias)
      ] = key;

    });

    return lookup;

  },
  {}
);


/* ==========================================================
   GET CANONICAL PANEL KEY
========================================================== */

export function getCanonicalPanelKey(
  value
) {

  const normalized =
    normalizeTestName(value);

  if (!normalized) {
    return "";
  }

  return (
    PANEL_ALIAS_LOOKUP[
      normalized
    ] || ""
  );

}


/* ==========================================================
   GET CANONICAL PANEL NAME
========================================================== */

export function getCanonicalPanelName(
  value
) {

  const key =
    getCanonicalPanelKey(value);

  if (!key) {
    return String(
      value ?? ""
    ).trim();
  }

  const names = {
    cbc: "CBC",
    lft: "LFT",
    rft: "RFT",
    flp: "FLP",
    tft: "TFT",
    electrolytes:
      "Electrolytes",
  };

  return names[key] || value;

}


/* ==========================================================
   PANEL CHILD NAMES
   ----------------------------------------------------------
   These are protection rules only.

   They prevent a child from replacing an explicitly
   registered panel.
========================================================== */

export const PANEL_CHILD_NAMES = {

  cbc: [
    "haemoglobin",
    "hemoglobin",
    "hb",
    "pcv",
    "packed cell volume",
    "rbc",
    "red blood cell",
    "red blood cells",
    "mcv",
    "mch",
    "mchc",
    "platelet",
    "platelets",
    "plt",
    "wbc",
    "white blood cell",
    "white blood cells",
    "total white blood cell count",
    "neutrophils",
    "lymphocytes",
    "monocytes",
    "eosinophils",
    "basophils",
  ],

  lft: [
    "ast",
    "sgot",
    "alanine aminotransferase",
    "alt",
    "sgpt",
    "alkaline phosphatase",
    "alp",
    "gamma glutamyl transferase",
    "gamma glutamyl transpeptidase",
    "ggt",
    "total bilirubin",
    "direct bilirubin",
    "indirect bilirubin",
    "albumin",
    "total protein",
  ],

  rft: [
    "urea",
    "blood urea",
    "creatinine",
    "serum creatinine",
    "egfr",
    "estimated glomerular filtration rate",
    "sodium",
    "potassium",
    "chloride",
    "bicarbonate",
    "calcium",
    "uric acid",
  ],

  flp: [
    "total cholesterol",
    "cholesterol",
    "triglycerides",
    "hdl",
    "hdl cholesterol",
    "ldl",
    "ldl cholesterol",
    "vldl",
    "non hdl cholesterol",
    "non hdl",
  ],

};


/* ==========================================================
   FIND PARENT PANEL FOR CHILD NAME
========================================================== */

export function getParentPanelForChild(
  value
) {

  const normalized =
    normalizeTestName(value);

  if (!normalized) {
    return "";
  }

  for (
    const [
      panel,
      children,
    ] of Object.entries(
      PANEL_CHILD_NAMES
    )
  ) {

    const matched =
      children.some(
        (child) =>
          normalizeTestName(child) ===
          normalized
      );

    if (matched) {
      return panel;
    }

  }

  return "";

}


/* ==========================================================
   TEST TYPE NORMALIZATION
========================================================== */

export function normalizeTestType(
  value
) {

  return normalizeText(value)
    .replace(/\s+/g, "_");
}


/* ==========================================================
   PANEL TEST TYPES
========================================================== */

export const PANEL_TEST_TYPES = [
  "panel",
  "test_panel",
  "profile",
  "group",
  "package",
  "panel_test",
  "paneltest",
];


/* ==========================================================
   CHECK EXPLICIT PANEL IDENTITY
========================================================== */

export function hasExplicitPanelIdentity(
  test = {}
) {

  if (!test || typeof test !== "object") {
    return false;
  }


  if (
    test.is_panel === true ||
    test.isPanel === true
  ) {
    return true;
  }


  const type =
    normalizeTestType(
      test.test_type ??
      test.testType
    );

  if (
    PANEL_TEST_TYPES.includes(type)
  ) {
    return true;
  }


  const panelId =
    test.panel_id ??
    test.panelId;

  if (
    panelId !== null &&
    panelId !== undefined &&
    panelId !== ""
  ) {
    return true;
  }


  const panelName =
    test.panel_name ??
    test.panelName;

  if (
    String(panelName ?? "").trim()
  ) {
    return true;
  }


  return false;

}


/* ==========================================================
   CHECK WHETHER TEST IS A PANEL
========================================================== */

export function isPanelTest(
  test = {}
) {

  if (
    hasExplicitPanelIdentity(test)
  ) {
    return true;
  }


  const name =
    test.test_name ??
    test.testName ??
    test.name ??
    "";


  const canonical =
    getCanonicalPanelKey(name);

  if (canonical) {
    return true;
  }


  return false;

}


/* ==========================================================
   GET TEST DISPLAY NAME
========================================================== */

export function getTestDisplayName(
  test = {}
) {

  return String(
    test.test_name ??
    test.testName ??
    test.name ??
    test.panel_name ??
    test.panelName ??
    ""
  ).trim();

}


/* ==========================================================
   GET PANEL DISPLAY NAME
========================================================== */

export function getPanelDisplayName(
  test = {}
) {

  const explicit =
    test.panel_name ??
    test.panelName;

  if (
    String(explicit ?? "").trim()
  ) {
    return String(
      explicit
    ).trim();
  }


  return getCanonicalPanelName(
    getTestDisplayName(test)
  );

}


/* ==========================================================
   ALIAS MATCH
========================================================== */

export function aliasMatchesMasterTest(
  requestedName,
  masterTest
) {

  const requested =
    normalizeTestName(
      requestedName
    );

  if (!requested || !masterTest) {
    return false;
  }


  const candidates = [

    masterTest.test_name,

    masterTest.testName,

    masterTest.panel_name,

    masterTest.panelName,

    masterTest.name,

  ];


  return candidates.some(
    (candidate) => {

      const normalized =
        normalizeTestName(
          candidate
        );

      return (
        normalized &&
        normalized === requested
      );

    }
  );

}


/* ==========================================================
   GET CANDIDATE NAMES
========================================================== */

function getCandidateNames(
  test = {}
) {

  return [

    test.test_name,

    test.testName,

    test.panel_name,

    test.panelName,

    test.name,

  ]
    .map(
      (value) =>
        String(
          value ?? ""
        ).trim()
    )
    .filter(Boolean);

}


/* ==========================================================
   RESOLVE MASTER TEST BY NAME
   ----------------------------------------------------------
   IMPORTANT:

   If a panel name is requested, resolve the PANEL first.

   Never use a child test as a replacement.
========================================================== */

export async function resolveMasterTestByName(
  requestedName
) {

  const originalName =
    String(
      requestedName ?? ""
    ).trim();

  if (!originalName) {
    return null;
  }


  const normalized =
    normalizeTestName(
      originalName
    );


  /* ======================================================
     1. EXACT TEST NAME
  ====================================================== */

  const exactResult =
    await supabase
      .from("master_tests")
      .select("*")
      .ilike(
        "test_name",
        originalName
      )
      .limit(20);


  if (
    !exactResult.error &&
    Array.isArray(
      exactResult.data
    )
  ) {

    /*
     * Prefer an actual panel if several records have
     * the same visible name.
     */

    const panel =
      exactResult.data.find(
        (row) =>
          isPanelTest(row)
      );

    if (panel) {
      return panel;
    }


    if (
      exactResult.data.length === 1
    ) {
      return exactResult.data[0];
    }

  }


  /* ======================================================
     2. PANEL ALIAS
  ====================================================== */

  const canonicalPanel =
    getCanonicalPanelKey(
      originalName
    );


  if (canonicalPanel) {

    const aliases =
      PANEL_NAME_ALIASES[
        canonicalPanel
      ] || [];


    for (
      const alias of aliases
    ) {

      const result =
        await supabase
          .from("master_tests")
          .select("*")
          .ilike(
            "test_name",
            alias
          )
          .limit(20);


      if (
        result.error ||
        !Array.isArray(
          result.data
        )
      ) {
        continue;
      }


      const panel =
        result.data.find(
          (row) =>
            isPanelTest(row) ||
            getCanonicalPanelKey(
              row?.test_name
            ) === canonicalPanel ||
            getCanonicalPanelKey(
              row?.panel_name
            ) === canonicalPanel
        );


      if (panel) {
        return panel;
      }

    }

  }


  /* ======================================================
     3. PANEL_NAME SEARCH
  ====================================================== */

  const panelNameResult =
    await supabase
      .from("master_tests")
      .select("*")
      .ilike(
        "panel_name",
        `%${originalName}%`
      )
      .limit(50);


  if (
    !panelNameResult.error &&
    Array.isArray(
      panelNameResult.data
    )
  ) {

    const panel =
      panelNameResult.data.find(
        (row) =>
          isPanelTest(row)
      );

    if (panel) {
      return panel;
    }

  }


  /* ======================================================
     4. NORMALIZED NAME FALLBACK
  ====================================================== */

  const allResult =
    await supabase
      .from("master_tests")
      .select("*")
      .limit(1000);


  if (
    allResult.error ||
    !Array.isArray(
      allResult.data
    )
  ) {
    return null;
  }


  const matching =
    allResult.data.filter(
      (row) => {

        const names = [

          row?.test_name,
          row?.panel_name,

        ]
          .map(
            (value) =>
              normalizeTestName(
                value
              )
          )
          .filter(Boolean);


        return names.includes(
          normalized
        );

      }
    );


  if (
    matching.length === 0
  ) {
    return null;
  }


  /*
   * Panel ALWAYS wins over child.
   */

  const panel =
    matching.find(
      (row) =>
        isPanelTest(row)
    );

  return (
    panel ||
    matching[0]
  );

}


/* ==========================================================
   RESOLVE MASTER TEST
   ----------------------------------------------------------
   Identity priority:

   1. master_test_id
   2. masterTestId
   3. test_id
   4. exact name
   5. panel alias/name
========================================================== */

export async function resolveMasterTest(
  test = {}
) {

  if (!test || typeof test !== "object") {
    return null;
  }


  const possibleIds = [

    test.master_test_id,

    test.masterTestId,

    test.test_id,

  ]
    .map(toNumericId)
    .filter(
      (value, index, array) =>
        value !== null &&
        array.indexOf(value) === index
    );


  /* ======================================================
     ID RESOLUTION
  ====================================================== */

  for (
    const id of possibleIds
  ) {

    const result =
      await supabase
        .from("master_tests")
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (
      !result.error &&
      result.data
    ) {

      /*
       * If the registered record explicitly says panel,
       * the resolved master must remain that identity.
       */

      return result.data;

    }

  }


  /* ======================================================
     NAME RESOLUTION
  ====================================================== */

  const names =
    getCandidateNames(test);


  for (
    const name of names
  ) {

    const master =
      await resolveMasterTestByName(
        name
      );

    if (master) {
      return master;
    }

  }


  return null;

}


/* ==========================================================
   NORMALIZE REGISTERED TEST
========================================================== */

export function normalizeRegisteredTest(
  test = {}
) {

  if (!test || typeof test !== "object") {
    return {};
  }


  const testName =
    String(
      test.test_name ??
      test.testName ??
      test.name ??
      test.panel_name ??
      test.panelName ??
      ""
    ).trim();


  const panelName =
    String(
      test.panel_name ??
      test.panelName ??
      ""
    ).trim();


  const panelId =
    toNumericId(
      test.panel_id ??
      test.panelId
    );


  const masterTestId =
    toNumericId(
      test.master_test_id ??
      test.masterTestId
    );


  const testId =
    toNumericId(
      test.test_id ??
      test.testId
    );


  const explicitPanel =
    hasExplicitPanelIdentity(
      test
    );


  const canonicalPanel =
    getCanonicalPanelKey(
      panelName ||
      testName
    );


  const isPanel =
    explicitPanel ||
    Boolean(canonicalPanel);


  return {

    ...test,

    test_name:
      testName,

    panel_name:
      panelName ||
      (
        isPanel
          ? getCanonicalPanelName(
              testName
            )
          : ""
      ),

    panel_id:
      panelId,

    master_test_id:
      masterTestId,

    test_id:
      testId,

    is_panel:
      isPanel,

  };

}


/* ==========================================================
   MERGE TEST DATA
   ----------------------------------------------------------
   Master metadata enriches the registered test.

   Registered identity remains authoritative.
========================================================== */

export function mergeTestData(
  registeredTest = {},
  masterTest = null
) {

  const registered =
    normalizeRegisteredTest(
      registeredTest
    );


  if (
    !masterTest ||
    typeof masterTest !== "object"
  ) {
    return registered;
  }


  const registeredIsPanel =
    registered.is_panel === true;


  const masterIsPanel =
    isPanelTest(masterTest);


  /*
   * Never let a child master record replace an explicitly
   * registered panel.
   */

  const finalIsPanel =
    registeredIsPanel ||
    masterIsPanel;


  const finalMasterId =
    registered.master_test_id ??
    toNumericId(
      masterTest.id
    );


  const finalPanelId =
    registered.panel_id ??
    toNumericId(
      masterTest.panel_id
    );


  const finalPanelName =
    registered.panel_name ||
    masterTest.panel_name ||
    (
      finalIsPanel
        ? getCanonicalPanelName(
            registered.test_name ||
            masterTest.test_name
          )
        : ""
    );


  return {

    ...masterTest,

    ...registered,

    /*
     * Registered identity wins.
     */

    id:
      registered.id ??
      masterTest.id,

    test_name:
      registered.test_name ||
      masterTest.test_name ||
      "",

    test_type:
      registered.test_type ??
      masterTest.test_type ??
      "",

    department:
      registered.department ??
      masterTest.department ??
      "",

    master_test_id:
      finalMasterId,

    panel_id:
      finalPanelId,

    panel_name:
      finalPanelName,

    is_panel:
      finalIsPanel,

    /*
     * Preserve any already attached children.
     */

    parameters:
      Array.isArray(
        registered.parameters
      )
        ? registered.parameters
        : (
            Array.isArray(
              masterTest.parameters
            )
              ? masterTest.parameters
              : []
          ),

    panelTests:
      Array.isArray(
        registered.panelTests
      )
        ? registered.panelTests
        : (
            Array.isArray(
              masterTest.panelTests
            )
              ? masterTest.panelTests
              : []
          ),

    panel_tests:
      Array.isArray(
        registered.panel_tests
      )
        ? registered.panel_tests
        : (
            Array.isArray(
              masterTest.panel_tests
            )
              ? masterTest.panel_tests
              : []
          ),

  };

}


/* ==========================================================
   EXPORT DEFAULT
========================================================== */

export default {

  normalizeText,

  normalizeTestName,

  isNumericId,

  toNumericId,

  getCanonicalPanelKey,

  getCanonicalPanelName,

  getParentPanelForChild,

  hasExplicitPanelIdentity,

  isPanelTest,

  getTestDisplayName,

  getPanelDisplayName,

  aliasMatchesMasterTest,

  resolveMasterTestByName,

  resolveMasterTest,

  normalizeRegisteredTest,

  mergeTestData,

};