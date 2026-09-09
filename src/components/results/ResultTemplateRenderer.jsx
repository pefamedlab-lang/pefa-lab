import normalizeTestName from "../../utils/normalizeTestName";

import QualitativeForm from "./QualitativeForm";
import BloodGroupingGenotypeForm from "./BloodGroupingGenotypeForm";
import WidalForm from "./WidalForm";

import HaematologySingleForm from "./HaematologySingleForm";
import EndocrinologySingleForm from "./EndocrinologySingleForm";

import ChemistrySingleForm from "./ChemistrySingleForm";
import ChemistryPanelForm from "./ChemistryPanelForm";

import UrinalysisForm from "./UrinalysisForm";
import MCSForm from "./MCSForm";
import BloodCultureForm from "./BloodCultureForm";
import SFAForm from "./SFAForm";
import StoolAnalysisForm from "./StoolAnalysisForm";

import MalariaParasiteForm from "./MalariaParasiteForm";

import DrugScreenForm from "./DrugScreenForm";
import GroupingCrossMatchForm from "./GroupingCrossMatchForm";
import DonorScreeningForm from "./DonorScreeningForm";

import CBCPanel from "./CBCPanel";

/* =========================================================
   NORMALIZATION
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const normalizeName = (value) =>
  normalizeTestName(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const normalizeTemplate = (value) =>
  normalize(value).replace(/-/g, "_");

/* =========================================================
   TEST INFORMATION
========================================================= */

function getTestName(test = {}) {
  return normalizeName(
    test?.test_name ||
      test?.testName ||
      test?.panel_name ||
      test?.panelName ||
      test?.name ||
      ""
  );
}

function getTestType(test = {}) {
  return normalize(
    test?.test_type ??
      test?.testType ??
      ""
  );
}

function getTemplateType(test = {}) {
  return normalizeTemplate(
    test?.template_type ??
      test?.templateType ??
      ""
  );
}

function getDepartment(test = {}) {
  return normalize(
    test?.department ??
      ""
  );
}

/* =========================================================
   TEST TYPE
========================================================= */

function isExplicitPanelType(testType) {
  return [
    "panel",
    "group",
    "profile",
    "panel test",
    "panel_test",
  ].includes(testType);
}

function isExplicitSingleType(testType) {
  return [
    "single",
    "single test",
    "individual",
    "individual test",
  ].includes(testType);
}

/* =========================================================
   TEST NAME SETS
========================================================= */

const CBC_NAMES = new Set([
  "complete blood count",
  "full blood count",
  "cbc",
  "fbc",
]);

const BLOOD_GROUPING_NAMES = new Set([
  "blood grouping",
  "blood group",
  "abo blood grouping",
  "abo blood group",
  "abo blood group rhesus factor",
  "abo blood group and rhesus factor",
  "abo blood group rhesus",
  "blood group rhesus factor",
  "blood grouping rhesus factor",
  "haemoglobin genotype",
  "hemoglobin genotype",
  "genotype",
]);

const CROSSMATCH_NAMES = new Set([
  "blood grouping crossmatch",
  "blood grouping and crossmatch",
  "grouping crossmatch",
  "grouping and crossmatch",
  "crossmatch",
  "cross match",
]);

const QUALITATIVE_NAMES = new Set([
  "hiv",
  "hiv 1 2 screening test",
  "hiv 1 and 2 screening test",
  "hiv i ii",
  "hiv i and ii",
  "hiv screening",
  "hiv 1 and 2",

  "hepatitis b surface antigen",
  "hepatitis b surface antigen hbsag",
  "hbsag",

  "hepatitis c virus",
  "hepatitis c virus hcv",
  "hcv",

  "vdrl",
  "rapid plasma reagin",
  "rpr",

  "rheumatoid factor",
  "rf",

  "anti streptolysin o titre",
  "anti streptolysin o titer",
  "aso titre",
  "aso titer",

  "pregnancy test",
  "beta hcg",
  "beta human chorionic gonadotropin",

  "helicobacter pylori",

  "faecal occult blood",
  "fecal occult blood",

  "crp qualitative",
]);

const WIDAL_NAMES = new Set([
  "widal",
  "widal test",
]);

const HAEMATOLOGY_NAMES = new Set([
  "pcv",
  "packed cell volume",
  "hemoglobin",
  "haemoglobin",
  "wbc",
  "total wbc",
  "white blood cell count",
  "platelet count",
  "platelets",
  "esr",
  "erythrocyte sedimentation rate",
  "reticulocyte count",
  "blood film",
  "peripheral blood film",
  "bleeding time",
  "clotting time",
  "prothrombin time",
  "activated partial thromboplastin time",
  "aptt",
  "international normalized ratio",
  "inr",
  "c reactive protein",
  "crp",
]);

const ENDOCRINOLOGY_NAMES = new Set([
  "tsh",
  "thyroid stimulating hormone",
  "thyroid stimulating hormone tsh",

  "t3",
  "t4",
  "ft3",
  "free t3",
  "ft4",
  "free t4",

  "fsh",
  "follicle stimulating hormone",

  "lh",
  "luteinizing hormone",

  "prolactin",
  "progesterone",
  "testosterone",
  "estradiol",
  "oestradiol",

  "amh",
  "anti mullerian hormone",

  "cortisol",
  "insulin",
  "c peptide",
  "pth",

  "vitamin d",
  "vitamin d3",

  "psa",
  "prostate specific antigen",
  "total psa",
  "free psa",
]);

const CHEMISTRY_SINGLE_NAMES = new Set([
  "fbs",
  "fasting blood sugar",
  "fasting blood glucose",

  "rbs",
  "random blood sugar",
  "random blood glucose",

  "hba1c",
  "glycated haemoglobin",
  "glycated hemoglobin",

  "uric acid",
  "calcium",
  "total calcium",
  "ionized calcium",
  "magnesium",
  "phosphorus",

  "creatinine",
  "urea",
  "blood urea",
  "bun",

  "d dimer",
]);

const URINALYSIS_NAMES = new Set([
  "urinalysis",
  "urine analysis",
  "routine urinalysis",
  "routine urine analysis",
]);

const MALARIA_NAMES = new Set([
  "malaria parasite",
  "malaria parasites",
  "malaria microscopy",
  "malaria parasite test",
  "malaria parasite examination",
  "mp",
]);

const MCS_NAMES = new Set([
  "culture sensitivity",
  "culture and sensitivity",
  "culture sensitivity test",
  "mcs",
  "microbiology culture sensitivity",
]);

const BLOOD_CULTURE_NAMES = new Set([
  "blood culture",
  "bloodculture",
]);

const STOOL_NAMES = new Set([
  "stool analysis",
  "stool examination",
  "stool microscopy",
  "stool routine examination",
]);

const SFA_NAMES = new Set([
  "seminal fluid analysis",
  "semen analysis",
  "seminal fluid examination",
  "sfa",
]);

const DRUG_SCREEN_NAMES = new Set([
  "drug screening",
  "drug screen",
  "drug abuse screening",
  "drug abuse screen",
]);

const DONOR_SCREENING_NAMES = new Set([
  "donor screening",
  "blood donor screening",
]);

/* =========================================================
   CHEMISTRY PANELS
========================================================= */

const CHEMISTRY_PANEL_NAMES = new Set([
  "kft",
  "kidney function test",
  "kidney function tests",
  "kidney profile",

  "rft",
  "renal function test",
  "renal function tests",
  "renal profile",

  "lft",
  "liver function test",
  "liver function tests",
  "liver profile",
  "hepatic function test",
  "hepatic function tests",
  "hepatic profile",

  "electrolyte urea creatinine",
  "electrolytes urea creatinine",
  "electrolytes urea and creatinine",
  "euc",

  "lipid profile",
  "fasting lipid profile",
  "lipid panel",
  "flp",

  "free tft",
  "total tft",

  "hormonal profile",

  "cardiac panel",
  "cardiac profile",
  "cardiac enzymes",
  "cardiac markers",

  "iron profile",
  "iron studies",
  "iron panel",

  "bone profile",
  "bone panel",

  "quantitative panel",
]);

/* =========================================================
   ENDOCRINOLOGY PANELS
========================================================= */

const ENDOCRINOLOGY_PANEL_NAMES = new Set([
  "tft",
  "thyroid function test",
  "thyroid function tests",
  "thyroid profile",
  "thyroid panel",

  "free tft",
  "total tft",

  "hormonal profile",
]);

/* =========================================================
   HAEMATOLOGY PANELS
========================================================= */

const HAEMATOLOGY_PANEL_NAMES = new Set([
  "fbc",
  "cbc",
  "complete blood count",
  "full blood count",

  "coagulation profile",
  "coagulation panel",

  "cd4 count",
]);

/* =========================================================
   PARAMETER EXTRACTION
========================================================= */

function extractParameterArray(
  test = {},
  parameters = []
) {
  const candidates = [
    parameters,

    test?.parameters,

    test?.panelTests,
    test?.panel_tests,

    test?.tests,

    test?.master_tests,

    test?.groupedTests,
    test?.grouped_tests,

    test?.panelParameters,
    test?.panel_parameters,
  ];

  for (const candidate of candidates) {
    if (
      Array.isArray(candidate) &&
      candidate.length > 0
    ) {
      return candidate;
    }
  }

  return [];
}

/* =========================================================
   PARAMETER NORMALIZATION
========================================================= */

function normalizeParameters(
  rawParameters
) {
  return rawParameters
    .filter(Boolean)
    .map((item, index) => {
      const nestedMasterTest =
        item?.master_tests ||
        item?.masterTest ||
        item?.master_test ||
        item?.test ||
        null;

      const source =
        nestedMasterTest &&
        typeof nestedMasterTest === "object" &&
        !Array.isArray(nestedMasterTest)
          ? {
              ...nestedMasterTest,
              ...item,
            }
          : item;

      const name =
        source?.parameter_name ||
        source?.parameterName ||
        source?.parameter ||
        source?.test_name ||
        source?.testName ||
        source?.name ||
        "";

      return {
        id:
          source?.id ??
          source?.test_id ??
          source?.master_test_id ??
          source?.masterTestId ??
          source?.panel_test_id ??
          `parameter-${index}`,

        panelTestId:
          source?.panel_test_id ??
          source?.panelTestId ??
          null,

        testId:
          source?.test_id ??
          source?.testId ??
          source?.master_test_id ??
          source?.masterTestId ??
          source?.id ??
          null,

        masterTestId:
          source?.master_test_id ??
          source?.masterTestId ??
          source?.test_id ??
          source?.testId ??
          null,

        name: String(name).trim(),

        unit:
          source?.unit ??
          source?.units ??
          "",

        resultType:
          source?.result_type ??
          source?.resultType ??
          source?.template_type ??
          source?.templateType ??
          "Numeric",

        maleRange:
          source?.male_range ??
          source?.maleRange ??
          "",

        femaleRange:
          source?.female_range ??
          source?.femaleRange ??
          "",

        childRange:
          source?.child_range ??
          source?.childRange ??
          "",

        elderlyRange:
          source?.elderly_range ??
          source?.elderlyRange ??
          "",

        referenceValue:
          source?.reference_value ??
          source?.referenceValue ??
          source?.reference ??
          "",

        criticalLow:
          source?.critical_low ??
          source?.criticalLow ??
          "",

        criticalHigh:
          source?.critical_high ??
          source?.criticalHigh ??
          "",

        options:
          source?.options ??
          "",

        decimalPlaces:
          source?.decimal_places ??
          source?.decimalPlaces ??
          0,

        displayOrder:
          source?.display_order ??
          source?.displayOrder ??
          index + 1,

        resultCategory:
          source?.result_category ??
          source?.resultCategory ??
          "",

        specimen:
          source?.specimen ??
          "",

        methodology:
          source?.methodology ??
          "",

        instrument:
          source?.instrument ??
          "",
      };
    })
    .filter(
      (parameter) =>
        parameter.name !== ""
    )
    .sort(
      (a, b) =>
        Number(a.displayOrder || 9999) -
        Number(b.displayOrder || 9999)
    );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ResultTemplateRenderer({
  selectedTest = null,
  patient = {},
  resultData = {},
  setResultData,
  parameters = [],
}) {
  /* ========================================================
     SAFETY
  ======================================================== */

  if (!selectedTest) {
    return null;
  }

  /* ========================================================
     BASIC TEST INFORMATION
  ======================================================== */

  const test = selectedTest;

  const testName =
    getTestName(test);

  const testType =
    getTestType(test);

  const templateType =
    getTemplateType(test);

  const department =
    getDepartment(test);

  /* ========================================================
     EXPLICIT TYPE
  ======================================================== */

  const explicitPanel =
    isExplicitPanelType(
      testType
    );

  const explicitSingle =
    isExplicitSingleType(
      testType
    );

  /* ========================================================
     SPECIAL TEST IDENTIFICATION
  ======================================================== */

  const isCBC =
    CBC_NAMES.has(testName);

  const isBloodGrouping =
    BLOOD_GROUPING_NAMES.has(
      testName
    );

  const isCrossmatch =
    CROSSMATCH_NAMES.has(
      testName
    );

  const isQualitative =
    QUALITATIVE_NAMES.has(
      testName
    );

  const isWidal =
    WIDAL_NAMES.has(testName);

  const isHaematologySingle =
    HAEMATOLOGY_NAMES.has(
      testName
    );

  const isEndocrinologySingle =
    ENDOCRINOLOGY_NAMES.has(
      testName
    );

  const isChemistrySingle =
    CHEMISTRY_SINGLE_NAMES.has(
      testName
    );

  const isUrinalysis =
    URINALYSIS_NAMES.has(
      testName
    );

  const isMalaria =
    MALARIA_NAMES.has(
      testName
    );

  const isBloodCulture =
    BLOOD_CULTURE_NAMES.has(
      testName
    ) ||
    templateType === "blood_culture" ||
    templateType === "bloodculture";

  const isMCS =
    MCS_NAMES.has(testName);

  const isStool =
    STOOL_NAMES.has(testName);

  const isSFA =
    SFA_NAMES.has(testName);

  const isDrugScreen =
    DRUG_SCREEN_NAMES.has(
      testName
    ) ||
    testName.includes("drug");

  const isDonorScreening =
    DONOR_SCREENING_NAMES.has(
      testName
    );

  /* ========================================================
     PANEL NAME IDENTIFICATION
  ======================================================== */

  const isKnownChemistryPanel =
    CHEMISTRY_PANEL_NAMES.has(
      testName
    );

  const isKnownEndocrinologyPanel =
    ENDOCRINOLOGY_PANEL_NAMES.has(
      testName
    );

  const isKnownHaematologyPanel =
    HAEMATOLOGY_PANEL_NAMES.has(
      testName
    );

  /* ========================================================
     DEPARTMENT
  ======================================================== */

  const isChemistryDepartment =
    department.includes(
      "chemistry"
    ) ||
    department.includes(
      "chemical pathology"
    );

  const isHaematologyDepartment =
    department.includes(
      "haematology"
    ) ||
    department.includes(
      "hematology"
    );

  const isEndocrinologyDepartment =
    department.includes(
      "endocrinology"
    );

  const isMicrobiologyDepartment =
    department.includes(
      "microbiology"
    );

  /* ========================================================
     TEMPLATE FLAGS
  ======================================================== */

  const isTemplatePanel =
    templateType === "panel" ||
    templateType === "chemistry_panel";

  const isTemplateSingle =
    templateType ===
    "chemistry_single";

  /* ========================================================
     PARAMETERS
========================================================= */

  const rawParameters =
    extractParameterArray(
      test,
      parameters
    );

  const normalizedParameters =
    normalizeParameters(
      rawParameters
    );

  /* ========================================================
     PANEL DETECTION
     
     IMPORTANT:
     Parameters alone do NOT determine panel status.
  ======================================================== */

  const isPanel =
    !explicitSingle &&
    (
      explicitPanel ||
      isTemplatePanel ||
      isKnownChemistryPanel ||
      isKnownEndocrinologyPanel ||
      isKnownHaematologyPanel
    );

  /* ========================================================
     TEMPLATE SELECTION
  ======================================================== */

  let template = "";

  /* --------------------------------------------------------
     1. CBC
  -------------------------------------------------------- */

  if (isCBC) {
    template = "cbc";
  }

  /* --------------------------------------------------------
     2. SPECIAL TESTS
  -------------------------------------------------------- */

  else if (isCrossmatch) {
    template =
      "grouping_crossmatch";
  }

  else if (isBloodGrouping) {
    template =
      "blood_grouping_genotype";
  }

  else if (isWidal) {
    template = "widal";
  }

  else if (isMalaria) {
    template =
      "malaria_parasite";
  }

  else if (isBloodCulture) {
    template =
      "blood_culture";
  }

  else if (isMCS) {
    template = "mcs";
  }

  else if (isUrinalysis) {
    template = "urinalysis";
  }

  else if (isStool) {
    template = "stool";
  }

  else if (isSFA) {
    template = "sfa";
  }

  else if (isDrugScreen) {
    template = "drug_screen";
  }

  else if (isDonorScreening) {
    template =
      "donor_screening";
  }

  else if (isQualitative) {
    template = "qualitative";
  }

  /* --------------------------------------------------------
     3. EXPLICIT CHEMISTRY SINGLE
  -------------------------------------------------------- */

  else if (isTemplateSingle) {
    template =
      "chemistry_single";
  }

  /* --------------------------------------------------------
     4. ENDOCRINOLOGY SINGLE
  -------------------------------------------------------- */

  else if (
    explicitSingle &&
    isEndocrinologySingle
  ) {
    template =
      "endocrinology_single";
  }

  else if (isEndocrinologySingle) {
    template =
      "endocrinology_single";
  }

  /* --------------------------------------------------------
     5. HAEMATOLOGY SINGLE
  -------------------------------------------------------- */

  else if (isHaematologySingle) {
    template =
      "haematology_single";
  }

  /* --------------------------------------------------------
     6. HAEMATOLOGY PANELS
  -------------------------------------------------------- */

  else if (
    isKnownHaematologyPanel ||
    (
      isPanel &&
      isHaematologyDepartment
    )
  ) {
    template = "cbc";
  }

  /* --------------------------------------------------------
     7. ENDOCRINOLOGY PANELS
  -------------------------------------------------------- */

  else if (
    isKnownEndocrinologyPanel
  ) {
    template =
      "chemistry_panel";
  }

  /* --------------------------------------------------------
     8. CHEMISTRY PANELS
  -------------------------------------------------------- */

  else if (
    isKnownChemistryPanel ||
    (
      isPanel &&
      isChemistryDepartment
    )
  ) {
    template =
      "chemistry_panel";
  }

  /* --------------------------------------------------------
     9. CHEMISTRY SINGLE
  -------------------------------------------------------- */

  else if (isChemistrySingle) {
    template =
      "chemistry_single";
  }

  /* --------------------------------------------------------
     10. DEPARTMENT FALLBACK
  -------------------------------------------------------- */

  else if (isChemistryDepartment) {
    template =
      "chemistry_single";
  }

  else if (isHaematologyDepartment) {
    template =
      "haematology_single";
  }

  else if (isEndocrinologyDepartment) {
    template =
      "endocrinology_single";
  }

  else if (isMicrobiologyDepartment) {
    template = "mcs";
  }

  /* --------------------------------------------------------
     11. SAFE DEFAULT
  -------------------------------------------------------- */

  else {
    template = "qualitative";
  }

  /* ========================================================
     CHEMISTRY PANEL OBJECT
  ======================================================== */

  const chemistryPanelTest = {
    ...test,

    parameters:
      normalizedParameters,

    panelTests:
      normalizedParameters,

    panel_tests:
      normalizedParameters,

    tests:
      normalizedParameters,

    master_tests:
      normalizedParameters,

    groupedTests:
      normalizedParameters,

    grouped_tests:
      normalizedParameters,

    test_type:
      test?.test_type ||
      test?.testType ||
      "Panel",

    template_type:
      "chemistry_panel",

    is_panel: true,

    isPanel: true,
  };

  /* ========================================================
     DEBUG
  ======================================================== */

  console.log(
    "[ResultTemplateRenderer]",
    {
      testName,
      testType,
      templateType,
      department,

      explicitPanel,
      explicitSingle,

      isCBC,
      isBloodGrouping,
      isCrossmatch,
      isQualitative,
      isWidal,

      isHaematologySingle,
      isEndocrinologySingle,
      isChemistrySingle,

      isKnownChemistryPanel,
      isKnownEndocrinologyPanel,
      isKnownHaematologyPanel,

      parameterCount:
        normalizedParameters.length,

      isPanel,

      template,
    }
  );

  /* ========================================================
     PANEL WARNING
  ======================================================== */

  if (
    template === "chemistry_panel" &&
    normalizedParameters.length === 0
  ) {
    console.warn(
      "[ResultTemplateRenderer] Chemistry panel detected without parameters.",
      {
        testId:
          test?.id ??
          test?.test_id ??
          test?.master_test_id ??
          null,

        testName:
          test?.test_name ??
          test?.testName ??
          "",

        testType,
        department,
      }
    );
  }

  /* ========================================================
     ROUTER
  ======================================================== */

  switch (template) {
    /* ======================================================
       CBC
    ====================================================== */

    case "cbc":
      return (
        <CBCPanel
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       BLOOD GROUPING / GENOTYPE
    ====================================================== */

    case "blood_grouping_genotype":
      return (
        <BloodGroupingGenotypeForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       GROUPING / CROSSMATCH
    ====================================================== */

    case "grouping_crossmatch":
      return (
        <GroupingCrossMatchForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       HAEMATOLOGY SINGLE
    ====================================================== */

    case "haematology_single":
      return (
        <HaematologySingleForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       QUALITATIVE
    ====================================================== */

    case "qualitative":
      return (
        <QualitativeForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       WIDAL
    ====================================================== */

    case "widal":
      return (
        <WidalForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       ENDOCRINOLOGY SINGLE
    ====================================================== */

    case "endocrinology_single":
      return (
        <EndocrinologySingleForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       URINALYSIS
    ====================================================== */

    case "urinalysis":
      return (
        <UrinalysisForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       MALARIA
    ====================================================== */

    case "malaria_parasite":
      return (
        <MalariaParasiteForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       BLOOD CULTURE
    ====================================================== */

    case "blood_culture":
      return (
        <BloodCultureForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       MCS
    ====================================================== */

    case "mcs":
      return (
        <MCSForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       STOOL
    ====================================================== */

    case "stool":
      return (
        <StoolAnalysisForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       SFA
    ====================================================== */

    case "sfa":
      return (
        <SFAForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       DRUG SCREEN
    ====================================================== */

    case "drug_screen":
      return (
        <DrugScreenForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       DONOR SCREENING
    ====================================================== */

    case "donor_screening":
      return (
        <DonorScreeningForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       CHEMISTRY PANEL
    ====================================================== */

    case "chemistry_panel":
      return (
        <ChemistryPanelForm
          patient={patient}
          test={chemistryPanelTest}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       CHEMISTRY SINGLE
    ====================================================== */

    case "chemistry_single":
      return (
        <ChemistrySingleForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );

    /* ======================================================
       DEFAULT
    ====================================================== */

    default:
      return (
        <QualitativeForm
          patient={patient}
          test={test}
          resultData={resultData}
          setResultData={setResultData}
        />
      );
  }
}