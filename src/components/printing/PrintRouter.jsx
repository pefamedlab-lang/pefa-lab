/* ==========================================================
   PRINT TEMPLATES
========================================================== */

import PrintWidal from "./PrintWidal";
import PrintQualitative from "./PrintQualitative";

import PrintChemistryTable from "./PrintChemistryTable";

import PrintEndocrinologySingle
  from "./PrintEndocrinologySingle";

import PrintEndocrinologyPanel
  from "./PrintEndocrinologyPanel";

import PrintHaematology
  from "./PrintHaematology";

import PrintHaematologySingle
  from "./PrintHaematologySingle";

import PrintUrinalysis
  from "./PrintUrinalysis";

import PrintSFA
  from "./PrintSFA";

import PrintDrugScreen
  from "./PrintDrugScreen";

import PrintGroupingCrossMatch
  from "./PrintGroupingCrossMatch";

import PrintDonorScreening
  from "./PrintDonorScreening";

import PrintMicrobiologyMCS
  from "./PrintMicrobiologyMCS";

import PrintBloodCulture
  from "./PrintBloodCulture";

import PrintStoolAnalysis
  from "./PrintStoolAnalysis";

import PrintMalariaParasite
  from "./PrintMalariaParasite";

import PrintRadiology
  from "./PrintRadiology";

import PrintHistology
  from "./PrintHistology";

/* ==========================================================
   RADIOLOGY
========================================================== */

import PrintOBS
  from "./radiology/PrintOBS";

import PrintPelvicScan
  from "./radiology/PrintPelvicScan";

import PrintAbdominalScan
  from "./radiology/PrintAbdominalScan";

import PrintAbdominoPelvicScan
  from "./radiology/PrintAbdominoPelvicScan";

import PrintBreastScan
  from "./radiology/PrintBreastScan";

import PrintScrotalScan
  from "./radiology/PrintScrotalScan";

import PrintKidneyScan
  from "./radiology/PrintKidneyScan";

import PrintLiverScan
  from "./radiology/PrintLiverScan";

import PrintThyroidScan
  from "./radiology/PrintThyroidScan";

import PrintProstateScan
  from "./radiology/PrintProstateScan";

import PrintSoftTissueScan
  from "./radiology/PrintSoftTissueScan";


/* ==========================================================
   NORMALIZATION
========================================================== */

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}


/* ==========================================================
   REMOVE SPECIAL CHARACTERS
========================================================== */

function compact(value) {
  return normalize(value)
    .replace(/[^a-z0-9]/g, "");
}


/* ==========================================================
   PARSE RESULT
========================================================== */

function parseResult(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "object"
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}


/* ==========================================================
   GET TEST NAME
========================================================== */

function getTestName(row = {}) {
  return (
    row?.test_name ||
    row?.testName ||
    row?.panel_name ||
    row?.panelName ||
    row?.name ||
    ""
  );
}


/* ==========================================================
   GET DEPARTMENT
========================================================== */

function getDepartment(row = {}) {
  return (
    row?.department ||
    row?.result_category ||
    ""
  );
}


/* ==========================================================
   GET TEMPLATE TYPE
========================================================== */

function getTemplateType(row = {}) {
  return (
    row?.template_type ||
    row?.templateType ||
    row?.result_template ||
    row?.resultTemplate ||
    ""
  );
}


/* ==========================================================
   GET GROUP INFORMATION
========================================================== */

function getGroupInfo(
  results = []
) {
  const first =
    results?.[0] || {};

  /*
   * Preferred contract:
   *   [groupedReport, ...children]
   */
  if (
    Array.isArray(first?.items) &&
    first.items.length > 0
  ) {
    return {
      group: first,
      items: first.items.filter(Boolean),
    };
  }

  /*
   * Direct result contract:
   *   [resultRow, resultRow, ...]
   *
   * The old router treated this as childCount=0, which caused
   * panels such as Lipid Profile to be misclassified as singles.
   */
  return {
    group: first,
    items: results.filter(Boolean),
  };
}


/* ==========================================================
   GET ALL RELEVANT NAMES
========================================================== */

function getAllNames(
  group,
  items
) {
  const values = [];

  const add = (value) => {
    const normalized =
      normalize(value);

    if (
      normalized &&
      !values.includes(normalized)
    ) {
      values.push(normalized);
    }
  };

  add(group?.test_name);
  add(group?.testName);

  add(group?.panel_name);
  add(group?.panelName);

  add(group?.name);

  add(group?.template_type);
  add(group?.templateType);

  items.forEach((item) => {
    add(item?.test_name);
    add(item?.testName);
    add(item?.panel_name);
    add(item?.panelName);
    add(item?.name);
    add(item?.template_type);
    add(item?.templateType);

    const result =
      parseResult(
        item?.result ||
        item?.result_data
      );

    if (
      result &&
      typeof result === "object" &&
      !Array.isArray(result)
    ) {
      add(result?.parameter);
      add(result?.test_name);
      add(result?.panel_name);
    }
  });

  return values;
}


/* ==========================================================
   NAME MATCHER
========================================================== */

function matches(
  names,
  patterns
) {
  return patterns.some(
    (pattern) => {

      const target =
        normalize(pattern);

      return names.some(
        (name) =>
          name === target ||
          name.includes(target)
      );

    }
  );
}


/* ==========================================================
   TEMPLATE TYPE MATCHER
========================================================== */

function matchesTemplate(
  template,
  patterns
) {
  const value =
    compact(template);

  if (!value) {
    return false;
  }

  return patterns.some(
    (pattern) =>
      value === compact(pattern) ||
      value.includes(
        compact(pattern)
      )
  );
}


/* ==========================================================
   CHEMISTRY
========================================================== */

function isChemistry(
  department,
  names,
  template
) {
  if (
    matchesTemplate(
      template,
      [
        "chemistry",
        "chemistry_panel",
        "chemistry_single",
        "clinical_chemistry",
      ]
    )
  ) {
    return true;
  }

  if (
    department.includes(
      "chemistry"
    )
  ) {
    return true;
  }

  return matches(
    names,
    [
      "liver function test",
      "liver function",
      "lft",

      "renal function test",
      "renal function",
      "rft",

      "kidney function test",

      "lipid profile",
      "lipid",

      "fasting lipid profile",
      "flp",

      "thyroid function test",
      "thyroid function",
      "tft",

      "electrolytes",
      "electrolytes urea creatinine",
      "euc",

      "urea electrolytes creatinine",
      "uec",

      "liver profile",

      "renal profile",

      "bilirubin",

      "alanine transaminase",
      "alt",

      "aspartate transaminase",
      "ast",

      "alkaline phosphatase",
      "alp",

      "gamma gt",
      "ggt",

      "creatinine",
      "urea",

      "uric acid",

      "glucose",

      "fasting blood sugar",
      "fbs",

      "random blood sugar",
      "rbs",

      "hba1c",

      "calcium",

      "phosphate",

      "magnesium",

      "total protein",

      "albumin",
    ]
  );
}


/* ==========================================================
   HAEMATOLOGY
========================================================== */

function isHaematology(
  department,
  names,
  template
) {
  if (
    matchesTemplate(
      template,
      [
        "haematology",
        "hematology",
        "cbc",
        "full_blood_count",
        "fbc",
        "haematology_single",
      ]
    )
  ) {
    return true;
  }

  if (
    department.includes(
      "haematology"
    ) ||
    department.includes(
      "hematology"
    )
  ) {
    return true;
  }

  return matches(
    names,
    [
      "full blood count",
      "fbc",
      "cbc",
      "complete blood count",

      "packed cell volume",
      "pcv",

      "haemoglobin",
      "hemoglobin",

      "rbc",

      "mcv",
      "mch",
      "mchc",

      "white blood cell",
      "white blood cell count",
      "wbc",

      "platelet",
      "platelets",

      "esr",

      "blood film",
      "peripheral blood film",

      "reticulocyte count",

      "sickle cell screening",

      "sickling test",

      "genotype",

      "blood group",
    ]
  );
}


/* ==========================================================
   MICROBIOLOGY
========================================================== */

function isMicrobiology(
  department,
  names,
  template
) {
  if (
    matchesTemplate(
      template,
      [
        "microbiology",
        "mcs",
        "urine_mcs",
        "stool",
        "stool_analysis",
        "blood_culture",
        "malaria_parasite",
        "sfa",
      ]
    )
  ) {
    return true;
  }

  if (
    department.includes(
      "microbiology"
    )
  ) {
    return true;
  }

  return matches(
    names,
    [
      "urine mcs",
      "urine microscopy culture sensitivity",
      "urine microscopy culture and sensitivity",

      "hvs",
      "high vaginal swab",

      "endocervical swab",
      "ecs",

      "urethral swab",

      "wound mcs",
      "wound culture",

      "stool mcs",

      "stool analysis",
      "stool microscopy",

      "blood culture",

      "sputum mcs",
      "sputum culture",

      "semen analysis",
      "seminal fluid analysis",
      "sfa",

      "malaria parasite",
      "malaria parasite test",
      "mp",

      "malaria microscopy",
    ]
  );
}


/* ==========================================================
   URINALYSIS
========================================================== */

function isUrinalysis(
  department,
  names,
  template
) {
  if (
    matchesTemplate(
      template,
      [
        "urinalysis",
        "urine_analysis",
        "urine",
      ]
    )
  ) {
    return true;
  }

  if (
    department.includes(
      "urinalysis"
    )
  ) {
    return true;
  }

  return matches(
    names,
    [
      "urinalysis",
      "urine analysis",
      "routine urine",
      "urine routine",
    ]
  );
}


/* ==========================================================
   SFA
========================================================== */

function isSFA(
  names,
  template
) {
  return (
    matchesTemplate(
      template,
      [
        "sfa",
        "semen",
        "seminal_fluid",
      ]
    ) ||
    matches(
      names,
      [
        "semen analysis",
        "seminal fluid analysis",
        "sfa",
      ]
    )
  );
}


/* ==========================================================
   STOOL
========================================================== */

function isStool(
  names,
  template
) {
  return (
    matchesTemplate(
      template,
      [
        "stool",
        "stool_analysis",
        "stool_mcs",
      ]
    ) ||
    matches(
      names,
      [
        "stool analysis",
        "stool microscopy",
        "stool examination",
        "stool mcs",
      ]
    )
  );
}


/* ==========================================================
   BLOOD CULTURE
========================================================== */

function isBloodCulture(
  names,
  template
) {
  return (
    matchesTemplate(
      template,
      [
        "blood_culture",
        "bloodculture",
      ]
    ) ||
    matches(
      names,
      [
        "blood culture",
      ]
    )
  );
}


/* ==========================================================
   MALARIA
========================================================== */

function isMalaria(
  names,
  template
) {
  return (
    matchesTemplate(
      template,
      [
        "malaria",
        "malaria_parasite",
        "mp",
      ]
    ) ||
    matches(
      names,
      [
        "malaria parasite",
        "malaria parasite test",
        "malaria microscopy",
        "mp",
      ]
    )
  );
}


/* ==========================================================
   WIDAL
========================================================== */

function isWidal(
  names,
  template
) {
  return (
    matchesTemplate(
      template,
      [
        "widal",
      ]
    ) ||
    matches(
      names,
      [
        "widal",
        "widal test",
      ]
    )
  );
}


/* ==========================================================
   DRUG SCREEN
========================================================== */

function isDrugScreen(
  names,
  template
) {
  return (
    matchesTemplate(
      template,
      [
        "drug_screen",
        "drug_screening",
      ]
    ) ||
    matches(
      names,
      [
        "drug screen",
        "drug screening",
        "toxicology screen",
      ]
    )
  );
}


/* ==========================================================
   DONOR SCREENING
========================================================== */

function isDonorScreening(
  names,
  template
) {
  return (
    matchesTemplate(
      template,
      [
        "donor_screening",
        "donor",
      ]
    ) ||
    matches(
      names,
      [
        "donor screening",
        "donor screening panel",
      ]
    )
  );
}


/* ==========================================================
   GROUPING / CROSSMATCH
========================================================== */

function isGroupingCrossMatch(
  names,
  template
) {
  return (
    matchesTemplate(
      template,
      [
        "grouping_crossmatch",
        "grouping",
        "crossmatch",
      ]
    ) ||
    matches(
      names,
      [
        "blood grouping",
        "blood group",
        "grouping and crossmatch",
        "cross match",
        "crossmatch",
      ]
    )
  );
}


/* ==========================================================
   QUALITATIVE
========================================================== */

function isQualitative(
  template,
  names
) {
  return (
    matchesTemplate(
      template,
      [
        "qualitative",
      ]
    ) ||
    matches(
      names,
      [
        "qualitative test",
        "pregnancy test",
        "hiv screening",
        "hbsag",
        "hepatitis b surface antigen",
        "hcv",
        "syphilis",
      ]
    )
  );
}


/* ==========================================================
   ENDOCRINOLOGY
========================================================== */

function isEndocrinology(
  department,
  names,
  template
) {
  if (
    matchesTemplate(
      template,
      [
        "endocrinology",
        "endocrinology_single",
        "endocrinology_panel",
      ]
    )
  ) {
    return true;
  }

  if (
    department.includes(
      "endocrinology"
    ) ||
    department.includes(
      "hormone"
    )
  ) {
    return true;
  }

  return matches(
    names,
    [
      "tsh",
      "ft3",
      "ft4",
      "free t3",
      "free t4",

      "prolactin",

      "lh",
      "fsh",

      "oestradiol",
      "estradiol",

      "progesterone",

      "testosterone",

      "cortisol",

      "insulin",

      "hcg",
      "beta hcg",

      "amh",

      "psa",
      "free psa",
    ]
  );
}


/* ==========================================================
   RADIOLOGY
========================================================== */

function isRadiology(
  department,
  names,
  template
) {
  if (
    matchesTemplate(
      template,
      [
        "radiology",
        "ultrasound",
        "scan",
        "obs",
      ]
    )
  ) {
    return true;
  }

  if (
    department.includes(
      "radiology"
    ) ||
    department.includes(
      "ultrasound"
    )
  ) {
    return true;
  }

  return matches(
    names,
    [
      "obstetric scan",
      "obs scan",
      "pregnancy scan",

      "pelvic scan",

      "abdominal scan",

      "abdomino pelvic scan",

      "breast scan",

      "scrotal scan",

      "kidney scan",

      "renal scan",

      "liver scan",

      "thyroid scan",

      "prostate scan",

      "soft tissue scan",

      "ultrasound scan",
      "ultrasound",
    ]
  );
}


/* ==========================================================
   HISTOLOGY
========================================================== */

function isHistology(
  department,
  names,
  template
) {
  if (
    matchesTemplate(
      template,
      [
        "histology",
        "histopathology",
      ]
    )
  ) {
    return true;
  }

  if (
    department.includes(
      "histology"
    ) ||
    department.includes(
      "histopathology"
    )
  ) {
    return true;
  }

  return matches(
    names,
    [
      "histology",
      "histopathology",
      "biopsy",
      "tissue biopsy",
      "pap smear",
      "papsmear",
    ]
  );
}


/* ==========================================================
   GET RADIOLOGY TEMPLATE
========================================================== */

function getRadiologyTemplate(
  names
) {
  if (
    matches(
      names,
      [
        "obstetric scan",
        "obs scan",
        "pregnancy scan",
      ]
    )
  ) {
    return PrintOBS;
  }

  if (
    matches(
      names,
      [
        "abdomino pelvic scan",
        "abdominopelvic scan",
      ]
    )
  ) {
    return PrintAbdominoPelvicScan;
  }

  if (
    matches(
      names,
      [
        "abdominal scan",
      ]
    )
  ) {
    return PrintAbdominalScan;
  }

  if (
    matches(
      names,
      [
        "pelvic scan",
      ]
    )
  ) {
    return PrintPelvicScan;
  }

  if (
    matches(
      names,
      [
        "breast scan",
      ]
    )
  ) {
    return PrintBreastScan;
  }

  if (
    matches(
      names,
      [
        "scrotal scan",
      ]
    )
  ) {
    return PrintScrotalScan;
  }

  if (
    matches(
      names,
      [
        "kidney scan",
        "renal scan",
      ]
    )
  ) {
    return PrintKidneyScan;
  }

  if (
    matches(
      names,
      [
        "liver scan",
      ]
    )
  ) {
    return PrintLiverScan;
  }

  if (
    matches(
      names,
      [
        "thyroid scan",
      ]
    )
  ) {
    return PrintThyroidScan;
  }

  if (
    matches(
      names,
      [
        "prostate scan",
      ]
    )
  ) {
    return PrintProstateScan;
  }

  if (
    matches(
      names,
      [
        "soft tissue scan",
      ]
    )
  ) {
    return PrintSoftTissueScan;
  }

  return PrintRadiology;
}


/* ==========================================================
   DETERMINE CHEMISTRY PANEL VS SINGLE
========================================================== */

function isChemistryPanel(
  group,
  items
) {
  const name =
    normalize(
      getTestName(group)
    );

  const panelName =
    normalize(
      group?.panel_name ||
      group?.panelName ||
      group?.parent_panel ||
      ""
    );

  const template =
    compact(
      getTemplateType(group)
    );

  const knownChemistryPanels = [
    "lipid profile",
    "fasting lipid profile",
    "flp",
    "liver function test",
    "liver function",
    "lft",
    "liver profile",
    "renal function test",
    "renal function",
    "rft",
    "kidney function test",
    "renal profile",
    "electrolytes",
    "electrolytes urea creatinine",
    "euc",
    "urea electrolytes creatinine",
    "uec",
    "thyroid function test",
    "thyroid function",
    "tft",
    "diabetes profile",
  ];

  if (
    group?.is_panel === true ||
    group?.isPanel === true
  ) {
    return true;
  }

  if (
    normalize(
      group?.test_type ||
      group?.testType
    ) === "panel"
  ) {
    return true;
  }

  if (
    template.includes("panel") ||
    template.includes("chemistrypanel")
  ) {
    return true;
  }

  if (
    knownChemistryPanels.some(
      (value) =>
        name === value ||
        name.includes(value) ||
        panelName === value ||
        panelName.includes(value)
    )
  ) {
    return true;
  }

  /*
   * Multiple child rows are only a panel when the rows actually
   * belong to the same explicit report. Do not let unrelated
   * same-Lab-number singles turn into a panel.
   */
  if (
    Array.isArray(items) &&
    items.length > 1 &&
    (
      panelName ||
      group?.panel_id ||
      group?.panelId ||
      group?.panel_master_test_id ||
      group?.panelMasterTestId
    )
  ) {
    return true;
  }

  return false;
}


/* ==========================================================
   DETERMINE ENDOCRINOLOGY PANEL
========================================================== */

function isEndocrinologyPanel(
  group,
  items
) {
  if (
    group?.is_panel === true ||
    group?.isPanel === true
  ) {
    return true;
  }

  if (
    normalize(
      group?.test_type
    ) === "panel"
  ) {
    return true;
  }

  if (
    normalize(
      group?.testType
    ) === "panel"
  ) {
    return true;
  }

  return (
    Array.isArray(items) &&
    items.length > 1
  );
}


/* ==========================================================
   ROUTER
========================================================== */

export default function PrintRouter({
  department = "",
  results = [],
  patient = null,
  printMode = "record",
}) {

  /* ========================================================
     NORMALIZE INPUT
  ======================================================== */

  const safeResults =
    Array.isArray(results)
      ? results.filter(Boolean)
      : [];

  if (
    safeResults.length === 0
  ) {
    return null;
  }

  const {
    group,
    items,
  } =
    getGroupInfo(
      safeResults
    );

  const effectiveDepartment =
    normalize(
      department ||
      getDepartment(group)
    );

  const templateType =
    getTemplateType(group);

  const names =
    getAllNames(
      group,
      items
    );

  /* ========================================================
     DEBUG — NEW ROUTER ONLY
  ======================================================== */

  console.log(
    "[NEW PrintRouter]",
    {
      department:
        effectiveDepartment,

      templateType,

      groupTestName:
        getTestName(group),

      childCount:
        items.length,

      names,

      results:
        safeResults,
    }
  );


  /* ========================================================
     ROUTE 1 — WIDAL
  ======================================================== */

  if (
    isWidal(
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → WIDAL"
    );

    return (
      <PrintWidal
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 2 — MALARIA
  ======================================================== */

  if (
    isMalaria(
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → MALARIA PARASITE"
    );

    return (
      <PrintMalariaParasite
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 3 — BLOOD CULTURE
  ======================================================== */

  if (
    isBloodCulture(
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → BLOOD CULTURE"
    );

    return (
      <PrintBloodCulture
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 4 — SFA
  ======================================================== */

  if (
    isSFA(
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → SFA"
    );

    return (
      <PrintSFA
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 5 — STOOL
  ======================================================== */

  if (
    isStool(
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → STOOL ANALYSIS"
    );

    return (
      <PrintStoolAnalysis
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 6 — MICROBIOLOGY MCS
  ======================================================== */

  if (
    isMicrobiology(
      effectiveDepartment,
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → MICROBIOLOGY MCS"
    );

    return (
      <PrintMicrobiologyMCS
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 7 — URINALYSIS
  ======================================================== */

  if (
    isUrinalysis(
      effectiveDepartment,
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → URINALYSIS"
    );

    return (
      <PrintUrinalysis
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 8 — DRUG SCREEN
  ======================================================== */

  if (
    isDrugScreen(
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → DRUG SCREEN"
    );

    return (
      <PrintDrugScreen
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 9 — DONOR SCREENING
  ======================================================== */

  if (
    isDonorScreening(
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → DONOR SCREENING"
    );

    return (
      <PrintDonorScreening
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 10 — GROUPING / CROSSMATCH
  ======================================================== */

  if (
    isGroupingCrossMatch(
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → GROUPING / CROSSMATCH"
    );

    return (
      <PrintGroupingCrossMatch
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 11 — QUALITATIVE
  ======================================================== */

  if (
    isQualitative(
      templateType,
      names
    )
  ) {
    console.log(
      "[NEW PrintRouter] → QUALITATIVE"
    );

    return (
      <PrintQualitative
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 12 — ENDOCRINOLOGY
  ======================================================== */

  if (
    isEndocrinology(
      effectiveDepartment,
      names,
      templateType
    )
  ) {

    const panel =
      isEndocrinologyPanel(
        group,
        items
      );

    console.log(
      panel
        ? "[NEW PrintRouter] → ENDOCRINOLOGY PANEL"
        : "[NEW PrintRouter] → ENDOCRINOLOGY SINGLE"
    );

    if (panel) {
      return (
        <PrintEndocrinologyPanel
          results={safeResults}
          patient={patient}
          printMode={printMode}
        />
      );
    }

    return (
      <PrintEndocrinologySingle
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 13 — HAEMATOLOGY
  ======================================================== */

  if (
    isHaematology(
      effectiveDepartment,
      names,
      templateType
    )
  ) {

    const panel =
      Boolean(
        group?.is_panel === true ||
        group?.isPanel === true ||
        normalize(
          group?.test_type ||
          group?.testType
        ) === "panel" ||
        matches(
          names,
          [
            "complete blood count",
            "full blood count",
            "cbc",
            "fbc",
          ]
        )
      );

    /*
     * CBC / FBC should use the panel template when
     * multiple child parameters exist.
     *
     * Single haematology tests use the single template.
     */

    if (
      panel ||
      matches(
        names,
        [
          "cbc",
          "fbc",
          "full blood count",
          "complete blood count",
        ]
      )
    ) {

      console.log(
        "[NEW PrintRouter] → HAEMATOLOGY PANEL"
      );

      return (
        <PrintHaematology
          results={safeResults}
          patient={patient}
          printMode={printMode}
        />
      );
    }

    console.log(
      "[NEW PrintRouter] → HAEMATOLOGY SINGLE"
    );

    return (
      <PrintHaematologySingle
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 14 — RADIOLOGY
  ======================================================== */

  if (
    isRadiology(
      effectiveDepartment,
      names,
      templateType
    )
  ) {

    const RadiologyTemplate =
      getRadiologyTemplate(
        names
      );

    console.log(
      "[NEW PrintRouter] → RADIOLOGY:",
      RadiologyTemplate?.name
    );

    return (
      <RadiologyTemplate
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 15 — HISTOLOGY
  ======================================================== */

  if (
    isHistology(
      effectiveDepartment,
      names,
      templateType
    )
  ) {
    console.log(
      "[NEW PrintRouter] → HISTOLOGY"
    );

    return (
      <PrintHistology
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     ROUTE 16 — CHEMISTRY
  ======================================================== */

  if (
    isChemistry(
      effectiveDepartment,
      names,
      templateType
    )
  ) {

    const panel =
      isChemistryPanel(
        group,
        items
      );

    console.log(
      panel
        ? "[NEW PrintRouter] → CHEMISTRY PANEL"
        : "[NEW PrintRouter] → CHEMISTRY SINGLE"
    );

    /*
     * PrintChemistryTable is used for both panel and
     * single chemistry results because it already receives
     * the complete result collection.
     */

    return (
      <PrintChemistryTable
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     FINAL FALLBACK
     
     ONLY use a generic department template when the
     dedicated route could not identify the test.
  ======================================================== */

  if (
    effectiveDepartment.includes(
      "haematology"
    ) ||
    effectiveDepartment.includes(
      "hematology"
    )
  ) {

    console.warn(
      "[NEW PrintRouter] Haematology fallback"
    );

    return (
      <PrintHaematology
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  if (
    effectiveDepartment.includes(
      "microbiology"
    )
  ) {

    console.warn(
      "[NEW PrintRouter] Microbiology fallback"
    );

    return (
      <PrintMicrobiologyMCS
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  if (
    effectiveDepartment.includes(
      "chemistry"
    )
  ) {

    console.warn(
      "[NEW PrintRouter] Chemistry fallback"
    );

    return (
      <PrintChemistryTable
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  if (
    effectiveDepartment.includes(
      "radiology"
    ) ||
    effectiveDepartment.includes(
      "ultrasound"
    )
  ) {

    console.warn(
      "[NEW PrintRouter] Radiology fallback"
    );

    return (
      <PrintRadiology
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  if (
    effectiveDepartment.includes(
      "histology"
    ) ||
    effectiveDepartment.includes(
      "histopathology"
    )
  ) {

    console.warn(
      "[NEW PrintRouter] Histology fallback"
    );

    return (
      <PrintHistology
        results={safeResults}
        patient={patient}
        printMode={printMode}
      />
    );
  }


  /* ========================================================
     NOTHING FOUND
  ======================================================== */

  console.warn(
    "[NEW PrintRouter] NO PRINT TEMPLATE FOUND",
    {
      department:
        effectiveDepartment,

      templateType,

      group,

      items,

      names,
    }
  );

  return (
    <div
      className="print-router-no-template"
      style={{
        padding: "24px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        background: "#f8fafc",
        fontFamily:
          "Arial, sans-serif",
        fontSize: "12px",
      }}
    >
      <strong>
        Print template unavailable
      </strong>

      <div
        style={{
          marginTop: "8px",
        }}
      >
        Test:{" "}
        {getTestName(group) ||
          "Unknown Test"}
      </div>

      <div>
        Department:{" "}
        {department ||
          "Unknown"}
      </div>
    </div>
  );
}