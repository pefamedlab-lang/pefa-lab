/* ==========================================================
   PEFA LAB
   LABORATORY TEST RESOLVER
   ----------------------------------------------------------
   PURPOSE:
   - Determine how a registered laboratory test should be
     entered.
   - Identify SINGLE tests.
   - Identify PANEL tests.
   - Identify SPECIAL laboratory templates.
   - Keep test-routing logic OUT of LaboratoryResultEntry.jsx.
   -
   IMPORTANT:
   - Fresh implementation.
   - No old testService.
   - No old dashboard dependencies.
   - No old result-entry dependencies.
   - Uses master_tests metadata supplied by the caller.
   ========================================================== */

/* ==========================================================
   BASIC NORMALIZATION
   ========================================================== */

export const normalizeTestText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/* ==========================================================
   SPECIAL TEST NAME MAP
   ----------------------------------------------------------
   These are explicit template overrides.

   The name resolver is intentionally conservative.
   Database metadata remains authoritative where available.
   ========================================================== */

const SPECIAL_TEST_PATTERNS = [
  {
    template: "malaria_parasite",
    type: "special",
    patterns: [
      "malaria parasite",
      "malaria parasite test",
      "malaria parasite examination",
      "mp",
      "mp test",
      "malaria microscopy",
      "malaria microscopy examination",
    ],
  },

  {
    template: "mcs",
    type: "special",
    patterns: [
      "urine mcs",
      "stool mcs",
      "sputum mcs",
      "wound mcs",
      "high vaginal swab mcs",
      "hvs mcs",
      "urethral swab mcs",
      "ear swab mcs",
      "throat swab mcs",
      "mcs",
      "microscopy culture sensitivity",
      "microscopy, culture and sensitivity",
    ],
  },

  {
    template: "blood_culture",
    type: "special",
    patterns: [
      "blood culture",
      "blood culture and sensitivity",
      "blood culture sensitivity",
      "bc",
    ],
  },

  {
    template: "sfa",
    type: "special",
    patterns: [
      "seminal fluid analysis",
      "semen analysis",
      "seminalysis",
      "sfa",
    ],
  },

  {
    template: "widal",
    type: "special",
    patterns: [
      "widal",
      "widal test",
      "widal reaction",
    ],
  },

  {
    template: "drug_screen",
    type: "special",
    patterns: [
      "drug screen",
      "drug screening",
      "urine drug screen",
      "drugs of abuse",
      "doa",
    ],
  },

  {
    template: "donor_screening",
    type: "special",
    patterns: [
      "donor screening",
      "blood donor screening",
      "donor infectious screening",
    ],
  },

  {
    template: "stool",
    type: "special",
    patterns: [
      "stool examination",
      "stool microscopy",
      "stool analysis",
      "stool routine examination",
      "stool routine",
    ],
  },
];

/* ==========================================================
   PANEL NAME MAP
   ----------------------------------------------------------
   Common PEFA laboratory panel families.

   Database panel membership still takes precedence.
   ========================================================== */

const PANEL_PATTERNS = [
  {
    template: "cbc",
    patterns: [
      "complete blood count",
      "full blood count",
      "cbc",
      "fbc",
    ],
  },

  {
    template: "chemistry_panel",
    patterns: [
      "liver function test",
      "liver function tests",
      "lft",

      "renal function test",
      "renal function tests",
      "rft",

      "kidney function test",
      "kidney function tests",

      "lipid profile",
      "lipid profile test",
      "lipid profile tests",
      "flp",

      "thyroid function test",
      "thyroid function tests",
      "tft",

      "electrolytes",
      "electrolyte panel",
      "electrolytes and urea",
      "eucr",

      "liver profile",
      "renal profile",
      "kidney profile",
    ],
  },

  {
    template: "coagulation_panel",
    patterns: [
      "coagulation profile",
      "coagulation screen",
      "coagulation studies",
      "pt inr",
      "pt/inr",
      "pt & inr",
      "aptt",
    ],
  },

  {
    template: "urinalysis_panel",
    patterns: [
      "urinalysis",
      "urine routine",
      "urine routine examination",
      "urine analysis",
      "urine examination",
    ],
  },
];

/* ==========================================================
   RESULT TYPE HELPERS
   ========================================================== */

const getResultType = (test) =>
  normalizeTestText(
    test?.result_type ||
      test?.template_type ||
      ""
  );

const getTemplateType = (test) =>
  normalizeTestText(
    test?.template_type ||
      test?.result_template ||
      ""
  );

/* ==========================================================
   NAME HELPERS
   ========================================================== */

const getTestName = (test) =>
  String(
    test?.test_name ||
      test?.name ||
      test?.test ||
      test?.panel_name ||
      ""
  ).trim();

const getPanelName = (test) =>
  String(
    test?.panel_name ||
      test?.panelName ||
      ""
  ).trim();

/* ==========================================================
   EXACT / CONTAINS PATTERN MATCHING
   ========================================================== */

const matchesPattern = (
  normalizedName,
  pattern
) => {
  const normalizedPattern =
    normalizeTestText(pattern);

  if (!normalizedPattern) {
    return false;
  }

  if (normalizedName === normalizedPattern) {
    return true;
  }

  return normalizedName.includes(
    normalizedPattern
  );
};

/* ==========================================================
   FIND SPECIAL TEMPLATE
   ========================================================== */

export function resolveSpecialTemplate(test) {
  if (!test) {
    return null;
  }

  const name = normalizeTestText(
    getTestName(test)
  );

  const panelName = normalizeTestText(
    getPanelName(test)
  );

  const combined =
    `${name} ${panelName}`.trim();

  for (const definition of SPECIAL_TEST_PATTERNS) {
    const matched = definition.patterns.some(
      (pattern) =>
        matchesPattern(
          combined,
          pattern
        )
    );

    if (matched) {
      return {
        type: definition.type,
        template: definition.template,
        matchedBy: "name",
      };
    }
  }

  return null;
}

/* ==========================================================
   FIND PANEL TEMPLATE
   ========================================================== */

export function resolvePanelTemplate(test) {
  if (!test) {
    return null;
  }

  const name = normalizeTestText(
    getTestName(test)
  );

  const panelName = normalizeTestText(
    getPanelName(test)
  );

  const combined =
    `${name} ${panelName}`.trim();

  for (const definition of PANEL_PATTERNS) {
    const matched = definition.patterns.some(
      (pattern) =>
        matchesPattern(
          combined,
          pattern
        )
    );

    if (matched) {
      return {
        type: "panel",
        template: definition.template,
        matchedBy: "name",
      };
    }
  }

  return null;
}

/* ==========================================================
   DETERMINE WHETHER TEST IS A PANEL
   ----------------------------------------------------------
   Priority:
   1. Explicit database metadata
   2. Panel name
   3. Known panel name
   ========================================================== */

export function isPanelTest(test) {
  if (!test) {
    return false;
  }

  if (
    test.is_panel === true ||
    test.is_panel === "true"
  ) {
    return true;
  }

  const testType =
    normalizeTestText(
      test.test_type
    );

  if (
    testType === "panel" ||
    testType === "panel test" ||
    testType === "panel_test"
  ) {
    return true;
  }

  if (
    getPanelName(test)
  ) {
    /*
     * A master test with a panel_name is generally
     * associated with a panel. The resolver will still
     * use actual panel membership when available.
     */
    return true;
  }

  return Boolean(
    resolvePanelTemplate(test)
  );
}

/* ==========================================================
   DETERMINE WHETHER TEST IS SPECIAL
   ========================================================== */

export function isSpecialTest(test) {
  return Boolean(
    resolveSpecialTemplate(test)
  );
}

/* ==========================================================
   DETERMINE WHETHER TEST IS SINGLE
   ========================================================== */

export function isSingleTest(test) {
  if (!test) {
    return false;
  }

  if (
    isSpecialTest(test)
  ) {
    return false;
  }

  if (
    isPanelTest(test)
  ) {
    return false;
  }

  return true;
}

/* ==========================================================
   RESOLVE SINGLE TEST TEMPLATE
   ========================================================== */

export function resolveSingleTemplate(test) {
  if (!test) {
    return {
      type: "single",
      template: "generic",
      resultType: "text",
    };
  }

  const resultType =
    getResultType(test);

  const templateType =
    getTemplateType(test);

  /* --------------------------------------------------------
     Explicit qualitative metadata
     -------------------------------------------------------- */

  if (
    resultType.includes(
      "qualitative"
    ) ||
    resultType.includes(
      "positive"
    ) ||
    resultType.includes(
      "negative"
    )
  ) {
    return {
      type: "single",
      template: "qualitative",
      resultType: "qualitative",
    };
  }

  /* --------------------------------------------------------
     Explicit numeric metadata
     -------------------------------------------------------- */

  if (
    resultType.includes("numeric") ||
    resultType.includes("number") ||
    resultType === "decimal" ||
    resultType === "integer" ||
    templateType.includes("numeric") ||
    templateType.includes("number")
  ) {
    return {
      type: "single",
      template: "numeric",
      resultType: "numeric",
    };
  }

  /* --------------------------------------------------------
     Boolean
     -------------------------------------------------------- */

  if (
    resultType.includes("boolean") ||
    resultType === "bool"
  ) {
    return {
      type: "single",
      template: "boolean",
      resultType: "boolean",
    };
  }

  /* --------------------------------------------------------
     Default
     -------------------------------------------------------- */

  return {
    type: "single",
    template: "text",
    resultType:
      resultType || "text",
  };
}

/* ==========================================================
   MAIN TEST RESOLVER
   ----------------------------------------------------------
   This is the primary function LaboratoryResultEntry will
   use.
   ========================================================== */

export function resolveLaboratoryTest(
  test,
  context = {}
) {
  if (!test) {
    return {
      type: "single",
      template: "text",
      resultType: "text",
      test: null,
      confidence: "none",
    };
  }

  /* --------------------------------------------------------
     1. SPECIAL TESTS FIRST
     -------------------------------------------------------- */

  const special =
    resolveSpecialTemplate(test);

  if (special) {
    return {
      ...special,

      test,

      confidence:
        special.matchedBy === "name"
          ? "high"
          : "medium",
    };
  }

  /* --------------------------------------------------------
     2. EXPLICIT PANEL INFORMATION
     -------------------------------------------------------- */

  const panelMemberships =
    context.panelMemberships ||
    test.panelTests ||
    [];

  if (
    Array.isArray(
      panelMemberships
    ) &&
    panelMemberships.length > 0
  ) {
    const panelTemplate =
      resolvePanelTemplate(test);

    return {
      type: "panel",

      template:
        panelTemplate?.template ||
        "generic_panel",

      resultType: "panel",

      test,

      panelId:
        panelMemberships[0]?.panel_id ??
        null,

      panelMemberships,

      confidence: "high",
    };
  }

  /* --------------------------------------------------------
     3. EXPLICIT DATABASE PANEL
     -------------------------------------------------------- */

  if (
    isPanelTest(test)
  ) {
    const panelTemplate =
      resolvePanelTemplate(test);

    return {
      type: "panel",

      template:
        panelTemplate?.template ||
        "generic_panel",

      resultType: "panel",

      test,

      panelId:
        context.panelId ??
        test.panel_id ??
        null,

      panelMemberships,

      confidence:
        panelTemplate
          ? "high"
          : "medium",
    };
  }

  /* --------------------------------------------------------
     4. SINGLE TEST
     -------------------------------------------------------- */

  const single =
    resolveSingleTemplate(test);

  return {
    ...single,

    test,

    confidence: "high",
  };
}

/* ==========================================================
   RESOLVE MANY TESTS
   ========================================================== */

export function resolveLaboratoryTests(
  tests = [],
  context = {}
) {
  if (!Array.isArray(tests)) {
    return [];
  }

  return tests.map(
    (test) =>
      resolveLaboratoryTest(
        test,
        context
      )
  );
}

/* ==========================================================
   GROUP TESTS BY ENTRY TYPE
   ========================================================== */

export function groupLaboratoryTestsByEntryType(
  tests = [],
  context = {}
) {
  const resolved =
    resolveLaboratoryTests(
      tests,
      context
    );

  const groups = {
    panels: [],
    singles: [],
    specials: [],
  };

  for (const item of resolved) {
    if (item.type === "panel") {
      groups.panels.push(item);
      continue;
    }

    if (item.type === "special") {
      groups.specials.push(item);
      continue;
    }

    groups.singles.push(item);
  }

  return groups;
}

/* ==========================================================
   GET TEMPLATE KEY
   ========================================================== */

export function getLaboratoryEntryTemplate(
  test,
  context = {}
) {
  return resolveLaboratoryTest(
    test,
    context
  ).template;
}

/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default {
  normalizeTestText,

  resolveSpecialTemplate,
  resolvePanelTemplate,

  isPanelTest,
  isSpecialTest,
  isSingleTest,

  resolveSingleTemplate,

  resolveLaboratoryTest,
  resolveLaboratoryTests,

  groupLaboratoryTestsByEntryType,

  getLaboratoryEntryTemplate,
};