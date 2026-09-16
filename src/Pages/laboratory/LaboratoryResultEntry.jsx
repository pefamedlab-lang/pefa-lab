/* ==========================================================
   PEFA LAB
   LABORATORY RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/LaboratoryResultEntry.jsx

   ARCHITECTURE
   ----------------------------------------------------------

   REGISTERED PATIENT
          ↓
   REGISTERED TEST
          ↓
   INITIALIZE laboratory_results
          ↓
   selectedResult
          ↓
   RESULT ROUTER
          │
          ├── ROUTINE URINALYSIS
          │      └── Local legacy form
          │
          ├── SPECIAL TEST
          │      └── SpecialLaboratoryResultEntryResolver
          │
          ├── PANEL TEST
          │      └── PanelLaboratoryResultEntryResolver
          │             │
          │             ├── HAEMATOLOGY
          │             │     ├── CBC / FBC
          │             │     ├── Coagulation Profile
          │             │     ├── ESR
          │             │     ├── Iron Profile
          │             │     └── Hb Electrophoresis
          │             │
          │             ├── CLINICAL CHEMISTRY
          │             │     ├── LFT
          │             │     ├── RFT
          │             │     ├── FLP
          │             │     ├── Serum Bilirubin
          │             │     ├── Serum Electrolytes
          │             │     └── Serum Calcium
          │             │
          │             └── ENDOCRINOLOGY
          │                   ├── Free TFT
          │                   ├── Total TFT
          │                   ├── Female Day 3
          │                   ├── Female Day 21
          │                   ├── Full Female Profile
          │                   ├── Male Hormonal Profile
          │                   ├── Thyroid
          │                   ├── Fertility
          │                   ├── Adrenal
          │                   ├── Pituitary
          │                   ├── Pancreatic Endocrine
          │                   └── Pregnancy Endocrine
          │
          └── UNMAPPED SINGLE TEST
                 └── Generic pending state

   IMPORTANT ID RULE
   ----------------------------------------------------------
   master_tests.id
        ≠
   laboratory_results.test_id
        ≠
   laboratory_results.id

   laboratory_results.id is the authoritative result ID.

   IMPORTANT PANEL RULE
   ----------------------------------------------------------
   PanelLaboratoryResultEntryResolver:
      - does NOT query Supabase
      - does NOT save results
      - does NOT resolve individual master tests

   LaboratoryResultEntry:
      - owns laboratory_results initialization
      - owns persistence
      - owns selectedResult
      - owns panel form save boundary

   PANEL SAVE FLOW
   ----------------------------------------------------------

   Dedicated Panel Form
          ↓
      onChange(form)
          ↓
      panelForm
          ↓
      user clicks Save
          ↓
      onSaved(finalForm)
          ↓
   LaboratoryResultEntry
          ↓
   laboratory_results.result
          ↓
   result_status = Performed

   This component therefore remains the persistence boundary.

   ========================================================== */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Loader2,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";

/* ==========================================================
   SUPABASE
   ========================================================== */

import { supabase } from "../../supabase";

import SavedResultHydrator from "./SavedResultHydrator";

/* ==========================================================
   BLOOD BANK — GROUPING & CROSSMATCHING
   ========================================================== */

import BloodGroupingCrossmatchingResultEntry from "./special/BloodGroupingCrossmatchingResultEntry";

/* ==========================================================
   SPECIAL RESULT RESOLVER
   ========================================================== */

import SpecialLaboratoryResultEntryResolver, {
  resolveSpecialLaboratoryResultEntry,
  isSpecialLaboratoryResultEntry,
} from "./resolver/SpecialLaboratoryResultEntryResolver";

/* ==========================================================
   PANEL RESULT RESOLVER
   ----------------------------------------------------------
   Owns:

   - Haematology panels
   - Chemistry panels
   - Endocrine panels

   No Supabase.
   No persistence.
   No master-test resolution.
   ========================================================== */

import PanelLaboratoryResultEntryResolver, {
  resolvePanelLaboratoryResultEntry,
  isPanelLaboratoryResultEntry,
} from "./resolver/PanelLaboratoryResultEntryResolver";

/* ==========================================================
   ROUTINE URINALYSIS
   ----------------------------------------------------------
   Legacy/simple result-entry form.
   ========================================================== */

import ChemistrySingleResultEntry from "./panel/chemistry/ChemistrySingleResultEntry";

/* ==========================================================
   PANEL PARAMETER SERVICE
   ----------------------------------------------------------
   Loads authoritative child master_tests metadata for panels.
   ========================================================== */

/* ==========================================================
   CSS
   ========================================================== */

import "./LaboratoryResultEntry.css";


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const text = (value) =>
  String(value ?? "").trim();


const normalizeText = (value) =>
  text(value)
    .replace(/\s+/g, " ")
    .toLowerCase();


/**
 * QUANTITATIVE SINGLE — MASTER TEST ALIASES
 * FBS/RBS (GLUCOMETER) use the same master test as FBS/RBS.
 * No duplicate master_tests record is required.
 */
function normalizeQuantitativeSingleTestName(value = "") {
  const n = String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

  const aliases = {
    "FBS (GLUCOMETER)": "FBS",
    "FBS(GLUCOMETER)": "FBS",
    "FBS - GLUCOMETER": "FBS",
    "FBS – GLUCOMETER": "FBS",
    "FASTING BLOOD SUGAR (GLUCOMETER)": "FBS",
    "FASTING BLOOD GLUCOSE (GLUCOMETER)": "FBS",
    "RBS (GLUCOMETER)": "RBS",
    "RBS(GLUCOMETER)": "RBS",
    "RBS - GLUCOMETER": "RBS",
    "RBS – GLUCOMETER": "RBS",
    "RANDOM BLOOD SUGAR (GLUCOMETER)": "RBS",
    "RANDOM BLOOD GLUCOSE (GLUCOMETER)": "RBS",
    "RANDOM PLASMA GLUCOSE (GLUCOMETER)": "RBS",
  };

  return aliases[n] || String(value || "").trim();
}


/* ==========================================================
   UUID VALIDATION
   ========================================================== */

const isUuid = (value) => {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value).trim()
  );
};


/* ==========================================================
   QUERY PARAMETER
   ========================================================== */

const getQueryValue = (
  searchParams,
  keys = []
) => {
  for (const key of keys) {
    const value =
      searchParams.get(key);

    if (
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return "";
};


/* ==========================================================
   PATIENT HELPERS
   ========================================================== */

const getPatientName = (
  registration
) =>
  registration?.full_name ||
  registration?.patient_name ||
  registration?.patientName ||
  registration?.patient?.full_name ||
  registration?.patient?.patient_name ||
  "Unknown Patient";


const getPatientId = (
  registration
) =>
  registration?.patient_id ||
  registration?.patientId ||
  registration?.patient?.patient_id ||
  "—";


const getLabNumber = (
  registration
) =>
  registration?.lab_number ||
  registration?.labNumber ||
  "";


const getRegistrationNumber = (
  registration
) =>
  registration?.registration_number ||
  registration?.registrationNumber ||
  "";


/* ==========================================================
   TEST HELPERS
   ========================================================== */

const getTestName = (
  test
) =>
  test?.test_name ||
  test?.testName ||
  test?.name ||
  test?.test ||
  test?.service_name ||
  test?.serviceName ||
  test?.masterTest?.test_name ||
  test?.master_test?.test_name ||
  test?.masterTest?.name ||
  test?.master_test?.name ||
  "Laboratory Test";


const getPanelName = (
  test
) =>
  test?.panel_name ||
  test?.panelName ||
  test?.masterTest?.panel_name ||
  test?.master_test?.panel_name ||
  "";


const getDepartment = (
  test
) =>
  test?.department ||
  test?.department_name ||
  test?.departmentName ||
  test?.category ||
  test?.masterTest?.department ||
  test?.master_test?.department ||
  "Laboratory";


const getTestType = (
  test
) =>
  test?.test_type ||
  test?.testType ||
  test?.masterTest?.test_type ||
  test?.master_test?.test_type ||
  "";


const getMasterTestId = (
  test
) =>
  test?.master_test_id ??
  test?.masterTestId ??
  test?.masterTest?.id ??
  test?.master_test?.id ??
  null;


const getTestCode = (
  test
) =>
  test?.test_code ||
  test?.testCode ||
  test?.code ||
  test?.masterTest?.test_code ||
  test?.master_test?.test_code ||
  null;


const getSpecimen = (
  test
) =>
  test?.specimen ||
  test?.sample_type ||
  test?.sampleType ||
  test?.masterTest?.specimen ||
  test?.master_test?.specimen ||
  null;


/* ==========================================================
   ACTUAL LABORATORY RESULT TEST UUID
   ----------------------------------------------------------
   NEVER use numeric master_tests.id here.
   ========================================================== */

const getLaboratoryResultTestId = (
  test
) => {
  const candidates = [
    test?.laboratory_result_test_id,
    test?.laboratoryResultTestId,
    test?.result_test_id,
    test?.resultTestId,
    test?.laboratory_test_id,
    test?.laboratoryTestId,
  ];

  return (
    candidates.find(isUuid) ||
    null
  );
};


/* ==========================================================
   ROUTINE URINALYSIS DETECTION
   ----------------------------------------------------------
   Deliberately local.

   It never enters:
   - master_tests resolution
   - panel resolution
   - special resolver
   ========================================================== */

const isRoutineUrinalysis = (
  test
) => {
  const name =
    normalizeText(
      getTestName(test)
    );

  const panel =
    normalizeText(
      getPanelName(test)
    );

  const combined =
    `${name} ${panel}`;

  return (
    name ===
      "routine urinalysis" ||
    name ===
      "routine urinalysis test" ||
    name ===
      "urinalysis" ||
    name ===
      "routine urine" ||
    name ===
      "routine urine examination" ||
    combined.includes(
      "routine urinalysis"
    )
  );
};


/* ==========================================================
   BLOOD BANK DEDICATED TEST DETECTION
   ----------------------------------------------------------
   "Grouping & Cross Matching" is a Single master test with
   template_type/result_category = blood_bank. It nevertheless
   has a structured dedicated result-entry component.
   ========================================================== */

const isGroupingCrossMatchingTest = (test) => {
  if (!test) return false;

  const name = normalizeText(getTestName(test))
    .replace(/[()\\/\\-]+/g, " ")
    .replace(/&/g, " and ")
    .replace(/\\s+/g, " ")
    .trim();

  return [
    "grouping and cross matching",
    "grouping cross matching",
    "blood grouping and cross matching",
    "blood grouping cross matching",
  ].includes(name);
};


/* ==========================================================
   SPECIAL TEST DETECTION
   ========================================================== */

const isCanonicalQuantitativeSingleTest = (test) => {
  if (!test) return false;
  const name = normalizeText(getTestName(test))
    .replace(/[()\/\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return [
    "crp",
    "c reactive protein",
    "c reactive protein crp",
    "total psa",
    "psa",
    "prostate specific antigen",
    "prostate specific antigen psa",
  ].includes(name);
};


const isLocalSpecialTest = (test) => {
  if (!test) return false;
  if (isGroupingCrossMatchingTest(test)) return false;
  if (isCanonicalQuantitativeSingleTest(test)) return false;
  if (isRoutineUrinalysis(test)) return true;

  /*
   * Canonical master metadata has priority over name-based legacy
   * special-test detection. This prevents quantitative tests such as
   * TOTAL PSA, CRP, AMH and other numeric assays from being hijacked
   * by a broad special-test resolver.
   */
  const master = test?.masterTest || test?.master_test || {};
  const resultType = normalizeText(
    test?.result_type || master?.result_type
  );
  const testType = normalizeText(
    test?.test_type || master?.test_type
  );

  if (
    isQuantitativeResultType(resultType) ||
    ["quantitative", "numeric", "number", "decimal", "float", "integer", "double"].includes(resultType)
  ) {
    return false;
  }

  if (testType === "panel" || resultType === "panel") {
    return false;
  }

  return isSpecialLaboratoryResultEntry(test);
};


/* ==========================================================
   DATE FORMAT
   ========================================================== */

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  );
};


/* ==========================================================
   REGISTERED TEST EXTRACTION
   ========================================================== */

const extractRegistrationTests = (
  registration
) => {
  const candidates = [
    registration?.tests,
    registration?.selected_tests,
    registration?.selectedTests,
    registration?.registration_tests,
    registration?.registrationTests,
    registration?.test_items,
    registration?.testItems,
    registration?.services,
    registration?.registered_tests,
    registration?.registeredTests,
  ];

  for (
    const value of candidates
  ) {
    if (
      Array.isArray(value)
    ) {
      return value;
    }
  }

  return [];
};


/* ==========================================================
   NORMALIZE REGISTERED TEST
   ========================================================== */

const normalizeRegisteredTest = (
  test,
  registration,
  index
) => ({
  ...test,

  _entryKey:
    test?.id ??
    test?.test_id ??
    test?.testId ??
    test?.master_test_id ??
    test?.masterTestId ??
    `${registration?.id ?? "registration"}-${index}`,

  test_name:
    getTestName(test),

  panel_name:
    getPanelName(test),

  department:
    getDepartment(test),

  test_type:
    getTestType(test),

  master_test_id:
    getMasterTestId(test),

  test_code:
    getTestCode(test),

  specimen:
    getSpecimen(test),

  laboratory_result_test_id:
    getLaboratoryResultTestId(test),

  /* Preserve registration-time identity even when master metadata
     later replaces the display name/code. */
  _registeredTestName:
    getTestName(test),

  _registeredTestCode:
    getTestCode(test),
});


/* ==========================================================
   NORMALIZE REGISTRATION
   ========================================================== */

const normalizeRegistration = (
  registration
) => {
  if (!registration) {
    return null;
  }

  const tests =
    extractRegistrationTests(
      registration
    ).map(
      (test, index) =>
        normalizeRegisteredTest(
          test,
          registration,
          index
        )
    );

  return {
    ...registration,

    _patientName:
      getPatientName(
        registration
      ),

    _patientId:
      getPatientId(
        registration
      ),

    _labNumber:
      getLabNumber(
        registration
      ),

    _registrationNumber:
      getRegistrationNumber(
        registration
      ),

    _tests:
      tests,
  };
};


/* ==========================================================
   NORMALIZE SEARCH RESPONSE
   ========================================================== */

const normalizeRegistrationResponse = (
  data
) => {
  const rows =
    Array.isArray(data)
      ? data
      : Array.isArray(
          data?.registrations
        )
      ? data.registrations
      : data
      ? [data]
      : [];

  return rows
    .map(
      normalizeRegistration
    )
    .filter(Boolean);
};


/* ==========================================================
   SEARCH MATCH
   ========================================================== */

const registrationMatchesSearch = (
  registration,
  searchValue
) => {
  const query =
    normalizeText(
      searchValue
    );

  if (!query) {
    return true;
  }

  const tests =
    registration?._tests ||
    [];

  const testText =
    tests
      .map(
        (test) =>
          [
            getTestName(test),
            getPanelName(test),
            getDepartment(test),
            getTestType(test),
          ]
            .filter(Boolean)
            .join(" ")
      )
      .join(" ");

  const searchable = [
    registration?.full_name,
    registration?.patient_name,
    registration?.patientName,
    registration?.patient_id,
    registration?.patientId,
    registration?.registration_number,
    registration?.registrationNumber,
    registration?.lab_number,
    registration?.labNumber,
    testText,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeText(
    searchable
  ).includes(query);
};


/* ==========================================================
   DEFAULT URINALYSIS RESULT DATA
   ========================================================== */

/* ==========================================================
   BUILT-IN CHEMISTRY PANEL STARTER PARAMETERS
   ----------------------------------------------------------
   These rows are UI safety definitions. They are placed into
   panelParameters immediately so a slow Supabase metadata lookup
   can NEVER leave LFT/FLP/RFT on an indefinite loading screen.
   Database metadata still replaces/enriches these rows when it
   becomes available.
   ========================================================== */

const BUILTIN_HAEMATOLOGY_PANEL_PARAMETERS = {
  "complete blood count": [
    ["Haemoglobin", "g/dL", "Male: 13.0 - 17.0; Female: 12.0 - 15.0"],
    ["Haematocrit", "%", "Male: 40 - 52; Female: 36 - 46"],
    ["RBC", "×10¹²/L", "Male: 4.5 - 5.9; Female: 4.1 - 5.1"],
    ["WBC", "×10⁹/L", "4.0 - 11.0"],
    ["Platelets", "×10⁹/L", "150 - 400"],
    ["MCV", "fL", "80 - 100"],
    ["MCH", "pg", "27 - 33"],
    ["MCHC", "g/dL", "32 - 36"],
    ["RDW-CV", "%", "11.5 - 14.5"],
    ["RDW-SD", "fL", "39 - 46"],
    ["Neutrophils", "%", "40 - 75"],
    ["Lymphocytes", "%", "20 - 45"],
    ["Monocytes", "%", "2 - 10"],
    ["Eosinophils", "%", "1 - 6"],
    ["Basophils", "%", "0 - 2"],
    ["Neutrophils Absolute", "×10⁹/L", "2.0 - 7.5"],
    ["Lymphocytes Absolute", "×10⁹/L", "1.0 - 4.0"],
    ["Monocytes Absolute", "×10⁹/L", "0.2 - 1.0"],
    ["Eosinophils Absolute", "×10⁹/L", "0.0 - 0.5"],
    ["Basophils Absolute", "×10⁹/L", "0.0 - 0.1"],
  ],
};

const BUILTIN_CHEMISTRY_PANEL_PARAMETERS = {
  "liver function test": [
    ["AST", "U/L", "10 - 40"],
    ["ALT", "U/L", "7 - 56"],
    ["ALP", "U/L", "44 - 147"],
    ["GGT", "U/L", "8 - 61"],
    ["Total Protein", "g/dL", "6.0 - 8.3"],
    ["Albumin", "g/dL", "3.5 - 5.0"],
    ["Globulin", "g/dL", "2.0 - 3.5"],
    ["A/G Ratio", "Ratio", "1.0 - 2.2"],
    ["Total Bilirubin", "mg/dL", "0.2 - 1.2"],
    ["Direct Bilirubin", "mg/dL", "0.0 - 0.3"],
    ["Indirect Bilirubin", "mg/dL", "0.2 - 0.9"],
    ["AST/ALT Ratio", "Ratio", "0.7 - 1.3"],
  ],
  "lipid profile": [
    ["Total Cholesterol", "mg/dL", "0 - 200"],
    ["Triglycerides", "mg/dL", "0 - 150"],
    ["HDL Cholesterol", "mg/dL", "> 40"],
    ["LDL Cholesterol", "mg/dL", "0 - 100"],
    ["VLDL Cholesterol", "mg/dL", "5 - 40"],
    ["Non-HDL Cholesterol", "mg/dL", "0 - 130"],
    ["Cholesterol/HDL Ratio", "Ratio", "0 - 5.0"],
    ["LDL/HDL Ratio", "Ratio", "0 - 3.5"],
    ["Triglycerides/HDL Ratio", "Ratio", "0 - 3.5"],
  ],
  "renal function test": [
    ["Urea", "mg/dL", "15 - 45"],
    ["Creatinine", "mg/dL", "0.59 - 1.35"],
    ["Sodium", "mmol/L", "135 - 145"],
    ["Potassium", "mmol/L", "3.5 - 5.1"],
    ["Chloride", "mmol/L", "98 - 107"],
    ["Bicarbonate", "mmol/L", "22 - 29"],
    ["eGFR", "mL/min/1.73 m²", ">= 90"],
  ],
};

const getBuiltinHaematologyPanelParameters = (panelName) => {
  const key = normalizeText(panelName);
  const rows = BUILTIN_HAEMATOLOGY_PANEL_PARAMETERS[key] || [];

  return rows.map(([name, unit, reference_value], index) => {
    const normalizedName = normalizeText(name);
    const absolute = normalizedName.includes("absolute");

    return {
      key: normalizedName.replace(/[^a-z0-9]+/g, "_"),
      name,
      test_name: name,
      parameter_name: name,
      analyteIdentity: normalizedName.replace(/[^a-z0-9]+/g, "_"),
      analyte_identity: normalizedName.replace(/[^a-z0-9]+/g, "_"),
      unit,
      result_unit: unit,
      reference_value,
      reference_range: reference_value,
      calculated: absolute ? true : false,
      isCalculated: absolute ? true : false,
      is_calculated: absolute ? true : false,
      /* MCV/MCH/MCHC are analyser-entry fields and MUST remain editable. */
      readOnly: absolute,
      read_only: absolute,
      display_order: index + 1,
    };
  });
};

const BUILTIN_CHEMISTRY_EXTRA_PANEL_PARAMETERS = {
  "serum electrolyte": [
    ["Sodium", "mmol/L", "135 - 145"],
    ["Potassium", "mmol/L", "3.5 - 5.1"],
    ["Chloride", "mmol/L", "98 - 107"],
    ["Bicarbonate", "mmol/L", "22 - 29"],
  ],
  "serum electrolytes": [
    ["Sodium", "mmol/L", "135 - 145"],
    ["Potassium", "mmol/L", "3.5 - 5.1"],
    ["Chloride", "mmol/L", "98 - 107"],
    ["Bicarbonate", "mmol/L", "22 - 29"],
  ],
  "serum bilirubin": [
    ["Total Bilirubin", "mg/dL", "0.2 - 1.2"],
    ["Direct Bilirubin", "mg/dL", "0.0 - 0.3"],
    ["Indirect Bilirubin", "mg/dL", "0.2 - 0.9"],
  ],
};

const getBuiltinChemistryPanelParameters = (panelName) => {
  const key = normalizeText(panelName);
  const rows =
    BUILTIN_CHEMISTRY_PANEL_PARAMETERS[key] ||
    BUILTIN_CHEMISTRY_EXTRA_PANEL_PARAMETERS[key] ||
    [];

  return rows.map(([name, unit, reference_value], index) => {
    const normalizedName = normalizeText(name);
    const calculated = new Set([
      "globulin",
      "a/g ratio",
      "indirect bilirubin",
      "ast/alt ratio",
      "ldl cholesterol",
      "vldl cholesterol",
      "non-hdl cholesterol",
      "cholesterol/hdl ratio",
      "ldl/hdl ratio",
      "triglycerides/hdl ratio",
    ]).has(normalizedName);

    return {
      key: normalizedName.replace(/[^a-z0-9]+/g, "_"),
      name,
      test_name: name,
      parameter_name: name,
      unit,
      result_unit: unit,
      reference_value,
      calculated,
      isCalculated: calculated,
      readOnly: calculated,
      read_only: calculated,
      display_order: index + 1,
    };
  });
};

/* ==========================================================
   BUILT-IN ENDOCRINE / HORMONAL PANEL METADATA FALLBACK
   ----------------------------------------------------------
   master_tests remains authoritative. These definitions are only a
   safety fallback when a child row does not contain unit/reference
   metadata. They also ensure live flagging is possible in the panel
   form instead of showing "Not configured" for every analyte.
   ========================================================== */

const BUILTIN_ENDOCRINE_PANEL_PARAMETERS = {
  "female hormonal profile (day 3)": [
    ["FSH", "mIU/mL", "3.5 - 12.5"],
    ["LH", "mIU/mL", "2.4 - 12.6"],
    ["Prolactin", "ng/mL", "4.8 - 23.3"],
    ["Estradiol", "pg/mL", "25 - 166"],
    ["Testosterone", "ng/dL", "15 - 70"],
  ],
  "female hormonal profile - day 3": [
    ["FSH", "mIU/mL", "3.5 - 12.5"],
    ["LH", "mIU/mL", "2.4 - 12.6"],
    ["Prolactin", "ng/mL", "4.8 - 23.3"],
    ["Estradiol", "pg/mL", "25 - 166"],
    ["Testosterone", "ng/dL", "15 - 70"],
  ],
  "female hormonal profile (day 21)": [
    ["Progesterone", "ng/mL", "5 - 20"],
    ["Estradiol", "pg/mL", "44 - 211"],
    ["Prolactin", "ng/mL", "4.8 - 23.3"],
  ],
  "female hormonal profile - day 21": [
    ["Progesterone", "ng/mL", "5 - 20"],
    ["Estradiol", "pg/mL", "44 - 211"],
    ["Prolactin", "ng/mL", "4.8 - 23.3"],
  ],
  "female hormonal profile (amenorrhea)": [
    ["FSH", "mIU/mL", "3.5 - 12.5"],
    ["LH", "mIU/mL", "2.4 - 12.6"],
    ["Prolactin", "ng/mL", "4.8 - 23.3"],
    ["Estradiol", "pg/mL", "25 - 166"],
    ["Testosterone", "ng/dL", "15 - 70"],
    ["Progesterone", "ng/mL", "0.2 - 1.5"],
  ],
  "male hormonal profile": [
    ["FSH", "mIU/mL", "1.5 - 12.4"],
    ["LH", "mIU/mL", "1.7 - 8.6"],
    ["Prolactin", "ng/mL", "4.0 - 15.2"],
    ["Testosterone", "ng/dL", "300 - 1000"],
    ["Estradiol", "pg/mL", "10 - 40"],
  ],
  "total thyroid profile (t3/t4/tsh)": [
    ["Total T3", "ng/dL", "80 - 200"],
    ["Total T4", "µg/dL", "4.5 - 11.7"],
    ["TSH", "µIU/mL", "0.4 - 4.0"],
  ],
  "free thyroid profile (t3/t4/tsh)": [
    ["Free T3", "pg/mL", "2.0 - 4.4"],
    ["Free T4", "ng/dL", "0.8 - 1.8"],
    ["TSH", "µIU/mL", "0.4 - 4.0"],
  ],
  "free tft": [
    ["Free T3", "pg/mL", "2.0 - 4.4"],
    ["Free T4", "ng/dL", "0.8 - 1.8"],
    ["TSH", "µIU/mL", "0.4 - 4.0"],
  ],
  "total tft": [
    ["Total T3", "ng/dL", "80 - 200"],
    ["Total T4", "µg/dL", "4.5 - 11.7"],
    ["TSH", "µIU/mL", "0.4 - 4.0"],
  ],
};

const getBuiltinEndocrinePanelParameters = (panelName) => {
  const key = normalizeText(panelName);
  const rows = BUILTIN_ENDOCRINE_PANEL_PARAMETERS[key] || [];

  return rows.map(([name, unit, reference_value], index) => ({
    key: normalizeText(name).replace(/[^a-z0-9]+/g, "_"),
    name,
    test_name: name,
    parameter_name: name,
    analyteIdentity: normalizeText(name).replace(/[^a-z0-9]+/g, "_"),
    analyte_identity: normalizeText(name).replace(/[^a-z0-9]+/g, "_"),
    unit,
    result_unit: unit,
    reference_value,
    reference_range: reference_value,
    referenceRanges: [reference_value],
    display_order: index + 1,
    calculated: false,
    isCalculated: false,
    is_calculated: false,
    readOnly: false,
    read_only: false,
    _builtinFallback: true,
  }));
};

const normalizePanelParameter = (row, index = 0) => {
  const source = row || {};

  const name =
    text(
      source.name ||
      source.test_name ||
      source.parameter_name ||
      source.parameterName ||
      source.analyte ||
      source.analyte_name ||
      source.analyteName
    ) || `Parameter ${index + 1}`;

  const normalizedName = normalizeText(name);

  const key =
    text(source.key) ||
    normalizedName.replace(/[^a-z0-9]+/g, "_");

  /*
   * IMPORTANT:
   * CBC components may use analyteIdentity internally.
   * Always provide it explicitly.
   */
  const analyteIdentity =
    text(
      source.analyteIdentity ||
      source.analyte_identity ||
      source.identity ||
      source.parameter_code ||
      source.test_code ||
      key
    ) || key;

  const manualCBC =
    [
      "mcv",
      "mch",
      "mchc",
    ].includes(normalizedName);

  const calculated =
    manualCBC
      ? false
      : Boolean(
          source.calculated ??
          source.isCalculated ??
          source.is_calculated ??
          false
        );

  return {
    ...source,

    key,

    name,

    test_name:
      source.test_name ||
      name,

    parameter_name:
      source.parameter_name ||
      name,

    analyteIdentity,

    analyte_identity:
      source.analyte_identity ||
      analyteIdentity,

    unit:
      source.unit ||
      source.result_unit ||
      "",

    result_unit:
      source.result_unit ||
      source.unit ||
      "",

    reference_value:
      source.reference_value ||
      source.reference_range ||
      "",

    reference_range:
      source.reference_range ||
      source.reference_value ||
      "",

    referenceRanges:
      Array.isArray(source.referenceRanges)
        ? source.referenceRanges
        : (source.reference_range || source.reference_value)
        ? [source.reference_range || source.reference_value]
        : [],

    calculated,

    isCalculated:
      calculated,

    is_calculated:
      calculated,

    /*
     * MCV, MCH and MCHC MUST remain manually editable.
     */
    readOnly:
      manualCBC
        ? false
        : Boolean(
            source.readOnly ??
            source.read_only ??
            calculated
          ),

    read_only:
      manualCBC
        ? false
        : Boolean(
            source.read_only ??
            source.readOnly ??
            calculated
          ),

    display_order:
      Number(
        source.display_order ??
        source.displayOrder ??
        index + 1
      ),
  };
};


const normalizePanelParameters = (
  rows
) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  const byKey = new Map();

  rows.forEach(
    (row, index) => {
      const normalized =
        normalizePanelParameter(
          row,
          index
        );

      const key =
        normalizeText(
          normalized.analyteIdentity ||
          normalized.key ||
          normalized.name
        ).replace(
          /[^a-z0-9]+/g,
          "_"
        );

      if (!key) {
        return;
      }

      const existing =
        byKey.get(key);

      /*
       * Database metadata enriches built-in metadata,
       * but never removes the safe identity fields.
       */
      byKey.set(
        key,
        {
          ...(existing || {}),
          ...normalized,

          analyteIdentity:
            normalized.analyteIdentity ||
            existing?.analyteIdentity ||
            key,
        }
      );
    }
  );

  return [
    ...byKey.values(),
  ].sort(
    (a, b) =>
      Number(a.display_order || 9999) -
      Number(b.display_order || 9999)
  );
};

const EMPTY_URINALYSIS_RESULT = {
  colour: "",
  appearance: "",
  specificGravity: "",
  ph: "",

  protein: "",
  glucose: "",
  ketone: "",
  bilirubin: "",
  leucocyte: "",
  nitrite: "",
  blood: "",
  urobilinogen: "",

  pusCells: "",
  rbc: "",
  epithelialCells: "",
  casts: "",
  crystals: "",
  yeastCells: "",
  bacteria: "",
  parasites: "",

  comment: "",
  impression: "",
};


/* ==========================================================
   RESULT TYPE / QUANTITATIVE HELPERS
   ========================================================== */

const getResultType = (test) =>
  test?.result_type ||
  test?.resultType ||
  test?.masterTest?.result_type ||
  test?.master_test?.result_type ||
  "";

const isQuantitativeResultType = (value) => {
  const normalized = normalizeText(value)
    .replace(/[_-]+/g, " ");

  return (
    normalized.includes("quantitative") ||
    normalized.includes("numeric") ||
    normalized.includes("number") ||
    normalized.includes("decimal") ||
    normalized === "float" ||
    normalized === "integer" ||
    normalized === "double"
  );
};

const isQuantitativeSingleTest = (test) => {
  if (!test) return false;

  if (isQuantitativeResultType(getResultType(test))) {
    return true;
  }

  const master =
    test?.masterTest ||
    test?.master_test ||
    {};

  const unit =
    test?.unit ||
    master?.unit ||
    test?.result_unit ||
    "";

  const reference =
    test?.reference_range ||
    test?.referenceRange ||
    test?.reference_value ||
    test?.referenceValue ||
    master?.reference_range ||
    master?.reference_value ||
    master?.male_range ||
    master?.female_range ||
    master?.child_range ||
    master?.elderly_range ||
    "";

  const testName = normalizeText(getTestName(test));
  if (testName === "erythrocyte sedimentation rate" || testName === "esr") {
    return true;
  }

  return Boolean(unit && reference);
};

const getTestUnit = (test) => {
  const configuredUnit =
    test?.unit ||
    test?.result_unit ||
    test?.resultUnit ||
    test?.masterTest?.unit ||
    test?.master_test?.unit ||
    "";

  if (configuredUnit) return configuredUnit;

  // ESR is an established quantitative hematology test.
  // Legacy registrations may not have unit metadata populated.
  const testName = normalizeText(getTestName(test));
  if (
    testName === "erythrocyte sedimentation rate" ||
    testName === "esr"
  ) {
    return "mm/hr";
  }

  return "";
};

const getPatientSex = (patient) =>
  normalizeText(
    patient?.sex ||
    patient?.gender ||
    patient?.patient?.sex ||
    patient?.patient?.gender
  );

const getPatientAge = (patient) => {
  const direct = [
    patient?.age,
    patient?.age_years,
    patient?.ageYears,
    patient?.patient_age,
    patient?.patientAge,
    patient?.patient?.age,
  ];

  for (const value of direct) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
      return numeric;
    }
  }

  const dob =
    patient?.date_of_birth ||
    patient?.dateOfBirth ||
    patient?.dob ||
    patient?.patient?.date_of_birth ||
    patient?.patient?.dob;

  if (!dob) return null;

  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age =
    today.getFullYear() -
    birth.getFullYear();

  const month =
    today.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (month === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

const getReferenceRangeForPatient = (
  test,
  patient
) => {
  const master =
    test?.masterTest ||
    test?.master_test ||
    test ||
    {};

  const sex =
    getPatientSex(patient);

  const age =
    getPatientAge(patient);

  // PEFA canonical glucose ranges. These overrides prevent stale or
  // incorrectly configured master-test metadata from changing the
  // laboratory-approved display range for the glucose single tests.
  const canonicalTestName = normalizeText(
    normalizeQuantitativeSingleTestName(
      test?.test_name || test?.testName || test?.name || ""
    )
  );

  if (
    canonicalTestName === "rbs" ||
    canonicalTestName === "random blood sugar" ||
    canonicalTestName === "random blood glucose" ||
    canonicalTestName === "random plasma glucose"
  ) {
    return "90.0 - 180.0 mg/dL";
  }

  if (
    canonicalTestName === "fbs" ||
    canonicalTestName === "fasting blood sugar" ||
    canonicalTestName === "fasting blood glucose" ||
    canonicalTestName === "fasting plasma glucose"
  ) {
    return "70 - 110 mg/dL";
  }

  /*
   * PEFA master_tests schema:
   *   child_range
   *   elderly_range
   *   male_range
   *   female_range
   *   normal_low
   *   normal_high
   *   reference_value
   *
   * Patient-specific ranges take priority.
   */

  if (
    Number.isFinite(age) &&
    age < 18 &&
    text(master.child_range)
  ) {
    return text(
      master.child_range
    );
  }

  if (
    Number.isFinite(age) &&
    age >= 65 &&
    text(master.elderly_range)
  ) {
    return text(
      master.elderly_range
    );
  }

  if (
    sex === "male" &&
    text(master.male_range)
  ) {
    return text(
      master.male_range
    );
  }

  if (
    sex === "female" &&
    text(master.female_range)
  ) {
    return text(
      master.female_range
    );
  }

  /*
   * Generic configured reference range.
   */
  if (
    text(master.reference_range)
  ) {
    return text(
      master.reference_range
    );
  }

  /*
   * Some PEFA master_tests rows use reference_value.
   */
  if (
    text(master.reference_value)
  ) {
    return text(
      master.reference_value
    );
  }

  /*
   * ESR legacy fallback.
   * Some existing registrations have no master_tests metadata,
   * so provide the standard adult sex-specific display range.
   */
  const testName = normalizeText(getTestName(test));
  if (
    testName === "erythrocyte sedimentation rate" ||
    testName === "esr"
  ) {
    if (sex === "male") return "0 - 15";
    if (sex === "female") return "0 - 20";
    return "0 - 15 (Male); 0 - 20 (Female)";
  }

  /*
   * PEFA also stores normal_low / normal_high.
   * Build the display range when both are present.
   */
  const normalLow =
    text(master.normal_low);

  const normalHigh =
    text(master.normal_high);

  if (
    normalLow &&
    normalHigh
  ) {
    return `${normalLow} - ${normalHigh}`;
  }

  if (normalLow) {
    return `>= ${normalLow}`;
  }

  if (normalHigh) {
    return `<= ${normalHigh}`;
  }

  return "";
};

const parseNumeric = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numeric = Number(
    String(value)
      .replace(/,/g, "")
      .trim()
  );

  return Number.isFinite(numeric)
    ? numeric
    : null;
};

const parseReferenceRange = (reference) => {
  const raw = text(reference)
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!raw) return null;

  let match = raw.match(
    /^\s*(?:>=|≥|>)\s*(-?\d+(?:\.\d+)?)\s*$/i
  );

  if (match) {
    return {
      type: "minimum",
      min: Number(match[1]),
      max: null,
    };
  }

  match = raw.match(
    /^\s*(?:<=|≤|<)\s*(-?\d+(?:\.\d+)?)\s*$/i
  );

  if (match) {
    return {
      type: "maximum",
      min: null,
      max: Number(match[1]),
    };
  }

  match = raw.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*(?:to|\.\.|-)\s*(-?\d+(?:\.\d+)?)\s*$/i
  );

  if (match) {
    const first = Number(match[1]);
    const second = Number(match[2]);

    return {
      type: "range",
      min: Math.min(first, second),
      max: Math.max(first, second),
    };
  }

  return null;
};

const calculateNumericFlag = (
  value,
  reference,
  criticalLow,
  criticalHigh
) => {
  const numericValue = parseNumeric(value);
  if (numericValue === null) return "";

  const range = parseReferenceRange(reference);
  if (!range) return "";

  const lowCritical = parseNumeric(criticalLow);
  const highCritical = parseNumeric(criticalHigh);

  if (
    lowCritical !== null &&
    numericValue < lowCritical
  ) {
    return "CRITICAL LOW";
  }

  if (
    highCritical !== null &&
    numericValue > highCritical
  ) {
    return "CRITICAL HIGH";
  }

  if (range.type === "minimum") {
    return numericValue >= range.min
      ? "NORMAL"
      : "LOW";
  }

  if (range.type === "maximum") {
    return numericValue <= range.max
      ? "NORMAL"
      : "HIGH";
  }

  if (range.type === "range") {
    if (numericValue < range.min) return "LOW";
    if (numericValue > range.max) return "HIGH";
    return "NORMAL";
  }

  return "";
};

/*
 * ================================================================
 * SAVED RESULT PARAMETER BRIDGE
 * ----------------------------------------------------------------
 * Some panel forms (notably CBC/Hematology) need TWO things:
 *
 *   1. parameter definitions (analytes)
 *   2. saved parameter values
 *
 * Previously the parent supplied an empty panelParameters array when
 * the parameter engine failed/returned late. The child then created
 * ZERO rows even though laboratory_results.result already contained
 * saved values.
 *
 * This bridge derives the parameter definitions directly from the
 * saved payload as a fallback. It does NOT change the database
 * payload contract and does NOT make individual forms responsible
 * for persistence.
 * ================================================================
 */
const parseSavedResultObject = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return null;
};

const getSavedParameterCollection = (result) => {
  const payload =
    parseSavedResultObject(result?.result) ||
    (result && typeof result === "object" ? result : null);

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidates = [
    payload.parameters,
    payload.parameter_results,
    payload.parameterResults,
    payload.results,
    payload.analytes,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) {
      return candidate;
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      return Object.entries(candidate).map(
        ([key, value]) => ({
          ...(value && typeof value === "object" ? value : {}),
          key:
            value?.key ||
            key,
          name:
            value?.name ||
            value?.parameter_name ||
            value?.parameterName ||
            key,
          result:
            value?.result ??
            value?.value ??
            "",
          value:
            value?.value ??
            value?.result ??
            "",
        })
      );
    }
  }

  return [];
};

const buildSavedParameterBridge = (
  result,
  liveParameters
) => {
  if (
    Array.isArray(liveParameters) &&
    liveParameters.length
  ) {
    return liveParameters;
  }

  return getSavedParameterCollection(
    result
  );
};

const getStoredResultValue = (result) => {
  if (!result) return "";

  if (
    result.result !== null &&
    result.result !== undefined &&
    result.result !== "" &&
    typeof result.result !== "object"
  ) {
    return result.result;
  }

  if (
    result.result_numeric !== null &&
    result.result_numeric !== undefined &&
    result.result_numeric !== ""
  ) {
    return result.result_numeric;
  }

  if (
    result.result_value !== null &&
    result.result_value !== undefined
  ) {
    return result.result_value;
  }

  if (
    result.value !== null &&
    result.value !== undefined
  ) {
    return result.value;
  }

  return "";
};

const mergeResolvedMasterTest = (
  registeredTest,
  masterTest
) => {
  if (!registeredTest) return null;
  if (!masterTest) return registeredTest;

  return {
    ...registeredTest,

    /* Preserve registered-test identity. */
    id: registeredTest.id,
    test_id: registeredTest.test_id,

    masterTest,
    master_test: masterTest,
    master_test_id:
      masterTest.id ??
      registeredTest.master_test_id ??
      registeredTest.masterTestId ??
      null,

    test_name:
      masterTest.test_name ||
      registeredTest.test_name,

    test_code:
      masterTest.test_code ||
      registeredTest.test_code,

    department:
      masterTest.department ||
      registeredTest.department,

    test_type:
      masterTest.test_type ||
      registeredTest.test_type,

    result_type:
      masterTest.result_type ||
      registeredTest.result_type,

    unit:
      masterTest.unit ||
      registeredTest.unit,

    specimen:
      masterTest.specimen ||
      registeredTest.specimen,

    reference_value:
      masterTest.reference_value ??
      registeredTest.reference_value,

    reference_range:
      masterTest.reference_range ??
      registeredTest.reference_range,

    male_range:
      masterTest.male_range ??
      registeredTest.male_range,

    female_range:
      masterTest.female_range ??
      registeredTest.female_range,

    child_range:
      masterTest.child_range ??
      registeredTest.child_range,

    elderly_range:
      masterTest.elderly_range ??
      registeredTest.elderly_range,

    critical_low:
      masterTest.critical_low ??
      registeredTest.critical_low,

    critical_high:
      masterTest.critical_high ??
      registeredTest.critical_high,

    result_category:
      masterTest.result_category ??
      registeredTest.result_category,

    result_template:
      masterTest.result_template ??
      registeredTest.result_template,

    template_type:
      masterTest.template_type ??
      registeredTest.template_type,
  };
};

/* ==========================================================
   CANONICAL PANEL CLASSIFICATION
   ----------------------------------------------------------
   IMPORTANT:
   panel_name alone NEVER makes a test a panel.

   Several legitimate standalone tests carry panel_name metadata
   (for example TSH, Calcium, Amylase and Lipase). Panel routing
   must therefore use explicit panel metadata only.
   ========================================================== */
const KNOWN_CANONICAL_PANEL_NAMES = new Set([
  "cbc", "fbc", "cbc panel", "fbc panel", "complete blood count", "full blood count",
  "lft", "lft panel", "liver function test", "liver function profile", "liver profile",
  "rft", "rft panel", "renal function test", "renal function profile", "renal profile",
  "flp", "flp panel", "lipid profile", "lipid panel", "fasting lipid profile",
  "serum bilirubin", "bilirubin profile", "bilirubin panel",
  "serum electrolytes", "electrolyte profile", "electrolyte panel", "urea electrolytes",
]);

const isPanelChildIdentity = (test = {}) => {
  if (test?._panelChild === true) return true;
  const type = normalizeText(test?.test_type || test?.testType);
  const parent = normalizeText(test?.parent_panel || test?.parentPanel || test?.panel_name || test?.panelName);
  return (type === "panel test" || type === "panel child" || type === "child panel test") && Boolean(parent);
};

const isKnownCanonicalPanelName = (test = {}) => {
  const names = [test?.test_name, test?.testName, test?.name, test?.masterTest?.test_name, test?.master_test?.test_name]
    .map(normalizeText).filter(Boolean);
  return names.some((name) => KNOWN_CANONICAL_PANEL_NAMES.has(name));
};

const isCanonicalPanelTest = (test) => {
  if (!test) return false;
  if (isPanelChildIdentity(test)) return false;
  const master = test?.masterTest || test?.master_test || {};
  return Boolean(
    test?.is_panel === true ||
    master?.is_panel === true ||
    normalizeText(test?.test_type || master?.test_type) === "panel" ||
    normalizeText(test?.result_type || master?.result_type) === "panel" ||
    isKnownCanonicalPanelName(test)
  );
};

const getCanonicalPanelName = (test) => {
  const master =
    test?.masterTest ||
    test?.master_test ||
    {};

  return text(
    master?.test_name && master?.is_panel
      ? master.test_name
      : test?.panel_name ||
        test?.panelName ||
        master?.panel_name ||
        (isCanonicalPanelTest(test) ? master?.test_name : "")
  );
};

/* ==========================================================
   COMPONENT
   ========================================================== */


/* ==========================================================
   STAFF / AUDIT HELPERS
   ========================================================== */
const safeJson = (value) => {
  try { return JSON.stringify(value ?? null, null, 2); }
  catch { return String(value ?? ""); }
};

const parseLocalStorageObject = (key) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch { return null; }
};

const LAB_RESULT_ENTRY_CACHE_PREFIX = "pefa:laboratory-result-entry:";

const getLaboratoryResultEntryCacheKey = (resultId) =>
  `${LAB_RESULT_ENTRY_CACHE_PREFIX}${String(resultId ?? "").trim()}`;

const cacheLaboratoryResultEntry = (result) => {
  if (!result?.id || !hasMeaningfulResultPayload(result?.result)) return;

  try {
    window.localStorage.setItem(
      getLaboratoryResultEntryCacheKey(result.id),
      JSON.stringify({
        id: result.id,
        result: result.result,
        result_status: result.result_status || "Performed",
        updated_at: result.updated_at || new Date().toISOString(),
        cached_at: new Date().toISOString(),
      })
    );
  } catch (cacheError) {
    console.warn("[PEFA RESULT ENTRY] Could not cache saved result locally:", cacheError);
  }
};

const getCachedLaboratoryResultEntry = (resultId) => {
  if (!resultId) return null;

  try {
    const raw = window.localStorage.getItem(
      getLaboratoryResultEntryCacheKey(resultId)
    );

    if (!raw) return null;

    const cached = JSON.parse(raw);

    return cached &&
      String(cached.id) === String(resultId) &&
      hasMeaningfulResultPayload(cached.result)
      ? cached
      : null;
  } catch {
    return null;
  }
};

const normalizeStaffRecord = (staff = {}) => ({
  id: staff?.id ?? staff?.staff_id ?? staff?.user_id ?? null,
  auth_user_id: staff?.auth_user_id ?? staff?.authUserId ?? staff?.auth_id ?? null,
  username: text(staff?.username ?? staff?.user_name ?? staff?.userName),
  full_name: text(staff?.full_name ?? staff?.fullName ?? staff?.name ?? staff?.user_name ?? staff?.username),
  role: text(staff?.role ?? staff?.designation),
  designation: text(staff?.designation ?? staff?.role),
  signature_url: text(staff?.signature_url ?? staff?.signatureUrl ?? staff?.signature),
});

const parsePersistedResultPayload = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return parsed ?? raw;
    } catch {
      return raw;
    }
  }

  return value;
};

const hasMeaningfulResultPayload = (value) => {
  const parsed = parsePersistedResultPayload(value);

  if (parsed === null || parsed === undefined) return false;

  if (typeof parsed === "string") {
    return text(parsed) !== "";
  }

  if (typeof parsed === "number" || typeof parsed === "boolean") {
    return true;
  }

  if (Array.isArray(parsed)) {
    return parsed.length > 0;
  }

  if (typeof parsed === "object") {
    return Object.entries(parsed).some(([key, item]) => {
      if (key.startsWith("__pefa")) return false;
      return hasMeaningfulResultPayload(item);
    });
  }

  return false;
};

const resultPayloadsEqual = (a, b) => {
  try { return JSON.stringify(a ?? null) === JSON.stringify(b ?? null); }
  catch { return String(a ?? "") === String(b ?? ""); }
};

const isPreviouslySavedLaboratoryResult = (result) => {
  if (!result) return false;
  const status = normalizeText(result.result_status);
  const releaseStatus = normalizeText(result.release_status);
  const authorizationStatus = normalizeText(result.authorization_status);
  return (
    hasMeaningfulResultPayload(result.result) ||
    ["performed", "verified", "authorized", "released"].includes(status) ||
    ["performed", "released"].includes(releaseStatus) ||
    ["authorized", "verified"].includes(authorizationStatus)
  );
};

const buildStaffPersistenceFields = (staff, existing = null) => {
  const normalized = normalizeStaffRecord(staff);
  if (!normalized.full_name) return {};

  // Never overwrite the original "entered by" identity during an edit.
  // However, always refresh the signature URL when the current staff profile
  // has one, so older results can acquire the staff signature without
  // changing who originally entered the result.
  if (text(existing?.entered_by)) {
    return normalized.signature_url
      ? { entered_by_signature_url: normalized.signature_url }
      : {};
  }

  return {
    entered_by: normalized.full_name,
    entered_by_name: normalized.full_name,
    entered_by_user_id: normalized.id ?? null,
    entered_by_username: normalized.username || null,
    entered_by_role: normalized.role || normalized.designation || null,
    entered_by_signature_url: normalized.signature_url || null,
    entered_at: new Date().toISOString(),
  };
};

export default function LaboratoryResultEntry() {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* ========================================================
     URL
     ======================================================== */

  const searchParams =
    useMemo(
      () =>
        new URLSearchParams(
          location.search
        ),
      [location.search]
    );

  const initialLabNumber =
    getQueryValue(
      searchParams,
      [
        "lab_number",
        "labNumber",
        "lab",
      ]
    );

  const initialRegistrationId =
    getQueryValue(
      searchParams,
      [
        "registration_id",
        "registrationId",
        "registration",
        "id",
      ]
    );


  /* ========================================================
     STATE
     ======================================================== */

  const [
    labNumber,
    setLabNumber,
  ] = useState(
    initialLabNumber
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    hasSearched,
    setHasSearched,
  ] = useState(Boolean(initialLabNumber));

  const [
    registrations,
    setRegistrations,
  ] = useState([]);

  const [
    selectedRegistration,
    setSelectedRegistration,
  ] = useState(null);

  const [
    selectedTest,
    setSelectedTest,
  ] = useState(null);

  const [
    selectedResult,
    setSelectedResult,
  ] = useState(null);

  const [
    hydrationState,
    setHydrationState,
  ] = useState({
    loading: false,
    found: false,
    payloadFound: false,
    resultId: null,
    source: "none",
    error: "",
  });

  /*
   * Current unsaved panel form.
   *
   * IMPORTANT:
   *
   * selectedResult =
   * authoritative laboratory_results row.
   *
   * panelForm =
   * current unsaved UI state.
   */
  const [
    panelForm,
    setPanelForm,
  ] = useState(null);

  /* ========================================================
     AUTHORITATIVE PANEL PARAMETERS
     ======================================================== */

  const [
    panelParameters,
    setPanelParameters,
  ] = useState([]);

  const [
    panelParameterSource,
    setPanelParameterSource,
  ] = useState(null);

  const [
    panelParameterLoading,
    setPanelParameterLoading,
  ] = useState(false);

  const [
    panelParameterError,
    setPanelParameterError,
  ] = useState("");

  const [
    singleValue,
    setSingleValue,
  ] = useState("");

  const [
    savingSingle,
    setSavingSingle,
  ] = useState(false);

  const [
    urinalysisData,
    setUrinalysisData,
  ] = useState(
    EMPTY_URINALYSIS_RESULT
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    initializingResult,
    setInitializingResult,
  ] = useState(false);

  const [
    savingUrinalysis,
    setSavingUrinalysis,
  ] = useState(false);

  const [
    savingPanel,
    setSavingPanel,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [currentStaff, setCurrentStaff] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);
  const [editReason, setEditReason] = useState("");
  const [editReasonError, setEditReasonError] = useState("");
  const [pendingSave, setPendingSave] = useState(null);
  const [savingPendingEdit, setSavingPendingEdit] = useState(false);


  /* ========================================================
     CURRENT STAFF IDENTITY
     ======================================================== */
  useEffect(() => {
    let cancelled = false;
    const loadCurrentStaff = async () => {
      setStaffLoading(true);
      try {
        // Resolve the actual current staff identity, then hydrate it from
        // staff_users so the latest signature_url is never taken from a
        // stale localStorage copy.
        let cachedStaff = null;
        for (const key of ["pefaUser", "pefa_user", "currentUser", "current_user", "staffUser", "staff_user"]) {
          const stored = parseLocalStorageObject(key);
          if (stored) {
            const normalized = normalizeStaffRecord(stored);
            if (normalized.full_name || normalized.id || normalized.username || normalized.auth_user_id) {
              cachedStaff = normalized;
              break;
            }
          }
        }

        if (cachedStaff) {
          let staffQuery = supabase.from("staff_users").select("*").limit(1);
          if (cachedStaff.auth_user_id && isUuid(cachedStaff.auth_user_id)) {
            staffQuery = staffQuery.eq("auth_user_id", cachedStaff.auth_user_id);
          } else if (cachedStaff.id !== null && cachedStaff.id !== undefined && String(cachedStaff.id).trim() !== "") {
            staffQuery = staffQuery.eq("id", cachedStaff.id);
          } else if (cachedStaff.username) {
            staffQuery = staffQuery.eq("username", cachedStaff.username);
          }

          const { data: staffRows, error: cachedStaffError } = await staffQuery;
          if (!cachedStaffError && staffRows?.[0]) {
            const hydrated = normalizeStaffRecord(staffRows[0]);
            if (!cancelled) setCurrentStaff(hydrated);
            return;
          }

          // If the database lookup cannot resolve the cached identity, keep
          // the cached identity as a fallback, but do not pretend it has a
          // signature unless one is actually present.
          if (!cancelled) setCurrentStaff(cachedStaff);
          return;
        }

        let authUser = null;
        try {
          const { data } = await supabase.auth.getUser();
          authUser = data?.user || null;
        } catch (authError) {
          console.warn("[PEFA RESULT ENTRY] Auth staff lookup unavailable:", authError);
        }

        if (authUser?.id) {
          const { data: staff } = await supabase
            .from("staff_users")
            .select("*")
            .eq("auth_user_id", authUser.id)
            .maybeSingle();

          const normalized = normalizeStaffRecord(staff || {
            id: authUser.id,
            auth_user_id: authUser.id,
            username: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
            role: authUser.user_metadata?.role || "",
          });

          if (normalized.full_name || normalized.username) {
            if (!cancelled) setCurrentStaff(normalized);
            return;
          }
        }

        if (!cancelled) {
          setCurrentStaff(null);
          setError("Unable to identify the logged-in laboratory staff member. Please sign in again before entering or editing results.");
        }
      } finally {
        if (!cancelled) setStaffLoading(false);
      }
    };
    loadCurrentStaff();
    return () => { cancelled = true; };
  }, []);

  /* ========================================================
     DIRECT REGISTRATION SEARCH
     ======================================================== */

  const searchRegistrationsDirectly =
    useCallback(
      async ({
        requestedLabNumber = "",
        requestedSearch = "",
      } = {}) => {
        let query =
          supabase
            .from("registrations")
            .select("*")
            .order(
              "id",
              {
                ascending: false,
              }
            )
            .limit(100);

        const lab =
          text(
            requestedLabNumber
          );

        if (lab) {
          query =
            query.eq(
              "lab_number",
              lab
            );
        }

        const {
          data,
          error: queryError,
        } = await query;

        if (queryError) {
          throw queryError;
        }

        let normalized =
          normalizeRegistrationResponse(
            data
          );

        const requestedSearchText =
          text(
            requestedSearch
          );

        if (
          requestedSearchText
        ) {
          normalized =
            normalized.filter(
              (registration) =>
                registrationMatchesSearch(
                  registration,
                  requestedSearchText
                )
            );
        }

        return normalized;
      },
      []
    );


  /* ========================================================
     LOAD REGISTRATIONS
     ======================================================== */

  const loadRegistrations =
    useCallback(
      async ({
        requestedLabNumber = "",
        requestedSearch = "",
      } = {}) => {
        const requestedLab = text(requestedLabNumber);

        if (!requestedLab) {
          setHasSearched(false);
          setRegistrations([]);
          setSelectedRegistration(null);
          setSelectedTest(null);
          setSelectedResult(null);
          setPanelForm(null);
          return;
        }

        setLoading(true);
        setHasSearched(true);
        setError("");
        setSuccess("");

        try {
          const normalized =
            await searchRegistrationsDirectly({
              requestedLabNumber: requestedLab,
              requestedSearch: "",
            });

          setRegistrations(
            normalized
          );

          if (
            initialRegistrationId
          ) {
            const matching =
              normalized.find(
                (registration) =>
                  String(
                    registration.id
                  ) ===
                  String(
                    initialRegistrationId
                  )
              );

            if (matching) {
              setSelectedRegistration(
                matching
              );
            }
          } else if (
            normalized.length === 1
          ) {
            setSelectedRegistration(
              normalized[0]
            );
          }

          setSelectedTest(null);
          setSelectedResult(null);
          setPanelForm(null);

        } catch (err) {
          console.error(
            "LaboratoryResultEntry registration search failed:",
            err
          );

          setRegistrations([]);
          setSelectedRegistration(null);
          setSelectedTest(null);
          setSelectedResult(null);
          setPanelForm(null);

          setError(
            err?.message ||
              "Unable to load laboratory registrations."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        initialRegistrationId,
        searchRegistrationsDirectly,
      ]
    );


  /* ========================================================
     INITIAL LOAD
     ======================================================== */

  useEffect(() => {
    if (!initialLabNumber) {
      setHasSearched(false);
      setRegistrations([]);
      return;
    }

    loadRegistrations({
      requestedLabNumber: initialLabNumber,
      requestedSearch: "",
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialLabNumber,
  ]);


  /* ========================================================
     MASTER TEST RESOLUTION
     --------------------------------------------------------
     ONLY SINGLE / UNMAPPED TESTS COME HERE.

     Routine Urinalysis:
       skipped

     Special:
       skipped

     Panel:
       skipped

     This is intentional.

     PanelLaboratoryResultEntryResolver owns panel identity.
     ======================================================== */

  
/**
 * PEFA FBS REFERENCE RANGE
 * Canonical laboratory reference interval for FBS:
 * 70 - 110 mg/dL
 *
 * This applies to FBS and FBS (GLUCOMETER), and RBS and RBS (GLUCOMETER)
 * because the glucometer variants resolve to their canonical master tests.
 */
const getCanonicalQuantitativeReferenceRange = (test = {}, fallback = "") => {
  const normalized = normalizeText(
    normalizeQuantitativeSingleTestName(
      test?.test_name || test?.testName || test?.name || ""
    )
  );

  if (
    normalized === "fbs" ||
    normalized === "fasting blood sugar" ||
    normalized === "fasting blood glucose" ||
    normalized === "fasting plasma glucose"
  ) {
    return "70 - 110 mg/dL";
  }

  if (
    normalized === "rbs" ||
    normalized === "random blood sugar" ||
    normalized === "random blood glucose" ||
    normalized === "random plasma glucose"
  ) {
    return "90.0 - 180.0 mg/dL";
  }

  return fallback || "";
};

const resolveMasterTest =
    useCallback(
      async (test) => {
        const originalTestName = getTestName(test);
        const testName = normalizeQuantitativeSingleTestName(originalTestName);
        const testCode = getTestCode(test);

        if (!testName && !testCode) {
          throw new Error(
            "The registered test has no test name or test code."
          );
        }

        const clean = (value) =>
          normalizeText(value)
            .replace(/[()]/g, " ")
            .replace(/[\\/]/g, " ")
            .replace(/[._-]+/g, " ")
            .replace(/\bhaemoglobin\b/g, "hemoglobin")
            .replace(/\bhaematology\b/g, "hematology")
            .replace(/\s+/g, " ")
            .trim();

        const aliases = (value) => {
          const n = clean(value);
          const values = [value, n];

          if (
            ["hba1c", "hb a1c", "hemoglobin a1c", "haemoglobin a1c"].includes(n) ||
            n.includes("glycated hemoglobin") ||
            n.includes("glycated haemoglobin") ||
            n.includes("glycosylated hemoglobin") ||
            n.includes("glycosylated haemoglobin")
          ) {
            values.push(
              "HbA1c",
              "Glycated Haemoglobin",
              "Glycated Hemoglobin",
              "Haemoglobin A1c",
              "Hemoglobin A1c"
            );
          }

          if (["fbs", "fasting blood sugar", "fasting blood glucose", "fasting plasma glucose", "fbs glucometer", "fasting blood sugar glucometer", "fasting blood glucose glucometer", "fasting plasma glucose glucometer"].includes(n)) {
            values.push(
              "FBS",
              "FBS (GLUCOMETER)",
              "Fasting Blood Sugar",
              "Fasting Blood Sugar (GLUCOMETER)",
              "Fasting Blood Glucose",
              "Fasting Blood Glucose (GLUCOMETER)"
            );
          }

          if (["rbs", "random blood sugar", "random blood glucose", "random plasma glucose", "rbs glucometer", "random blood sugar glucometer", "random blood glucose glucometer", "random plasma glucose glucometer"].includes(n)) {
            values.push(
              "RBS",
              "RBS (GLUCOMETER)",
              "Random Blood Sugar",
              "Random Blood Sugar (GLUCOMETER)",
              "Random Blood Glucose",
              "Random Blood Glucose (GLUCOMETER)",
              "Random Plasma Glucose (GLUCOMETER)"
            );
          }

          if (["tsh", "thyrotropin", "thyroid stimulating hormone"].includes(n)) {
            values.push("TSH", "Thyrotropin", "Thyroid Stimulating Hormone");
          }

          if (n === "cpr" || n === "crp" || n.includes("c reactive protein")) {
            values.push("CRP", "C-Reactive Protein", "CPR");
          }

          if (n === "psa" || n === "total psa") {
            values.push("Total PSA", "PSA");
          }

          if (n === "amh" || n.includes("anti mullerian hormone")) {
            values.push("AMH", "Anti-Müllerian Hormone", "Anti Mullerian Hormone");
          }

          return [...new Set(values.map(clean).filter(Boolean))];
        };

        const scoreRow = (row) => {
          let score = 0;
          if (row?.active === true) score += 1000;
          if (row?.is_primary === true) score += 500;
          if (row?.is_panel === false) score += 100;
          if (normalizeText(row?.test_type) === "single") score += 80;
          if (isQuantitativeResultType(row?.result_type)) score += 40;
          return score;
        };

        const chooseBest = (rows, wanted) => {
          const wantedName = clean(wanted);
          const wantedAliases = new Set(aliases(wanted));

          const matches = (row) => {
            const rowName = clean(row?.test_name);
            const rowCode = clean(row?.test_code);
            return (
              rowName === wantedName ||
              (!!rowCode && rowCode === wantedName) ||
              wantedAliases.has(rowName) ||
              wantedAliases.has(rowCode)
            );
          };

          return (rows || [])
            .filter(matches)
            .sort((a, b) => scoreRow(b) - scoreRow(a))[0] || null;
        };

        /* ------------------------------------------------------
           CANONICAL PANEL FALLBACK
           ------------------------------------------------------
           Some legacy registration rows contain a valid master_test_id
           or panel identity but the master_tests lookup can be stale,
           incomplete, or temporarily unavailable. Do NOT block panel
           result entry in that situation. Preserve the authoritative
           registered identity and let the dedicated panel resolver
           route by canonical name.
        */
        const canonicalPanelName = normalizeText(
          test?.test_name ||
          test?.testName ||
          test?.name ||
          test?.panel_name ||
          test?.panelName ||
          ""
        );

        const knownPanelNames = new Set([
          "cbc", "fbc", "complete blood count", "full blood count",
          "lft", "liver function test", "liver function profile", "liver profile",
          "rft", "renal function test", "renal function profile", "renal profile",
          "flp", "lipid profile", "lipid panel", "fasting lipid profile",
          "serum bilirubin", "bilirubin profile", "bilirubin panel",
          "serum electrolytes", "electrolyte profile", "electrolyte panel",
        ]);

        const isKnownPanelRequest =
          knownPanelNames.has(canonicalPanelName) ||
          isCanonicalPanelTest(test);

        /* 1. Explicit numeric master_tests.id. */
        const candidateId = getMasterTestId(test);
        if (
          candidateId !== null &&
          candidateId !== undefined &&
          candidateId !== "" &&
          Number.isFinite(Number(candidateId))
        ) {
          const { data, error } = await supabase
            .from("master_tests")
            .select("*")
            .eq("id", Number(candidateId))
            .maybeSingle();

          if (error) throw error;
          if (data?.id) return data;
        }

        /* 2. Exact test_code. */
        if (testCode) {
          const { data, error } = await supabase
            .from("master_tests")
            .select("*")
            .ilike("test_code", String(testCode).trim())
            .limit(100);

          if (error) throw error;
          const exactCode = (data || []).find(
            (row) => clean(row?.test_code) === clean(testCode)
          );
          if (exactCode?.id) return exactCode;
        }

        /* 3. Exact/alias test-name lookup, preferring active primary rows. */
        const lookupNames = aliases(testName);
        for (const wanted of lookupNames) {
          const { data, error } = await supabase
            .from("master_tests")
            .select("*")
            .ilike("test_name", String(wanted).trim())
            .limit(100);

          if (error) throw error;
          const best = chooseBest(data, testName);
          if (best?.id) return best;
        }

        /* 4. Contains fallback for legacy spelling. */
        for (const wanted of lookupNames.slice(0, 6)) {
          const { data, error } = await supabase
            .from("master_tests")
            .select("*")
            .ilike("test_name", `%${String(wanted).trim()}%`)
            .limit(100);

          if (error) throw error;
          const best = chooseBest(data, testName);
          if (best?.id) return best;
        }

        /* ------------------------------------------------------
           SAFE CANONICAL PANEL FALLBACK
           ------------------------------------------------------
           Preserve the registered panel even when master_tests cannot
           be resolved. This is intentionally limited to known panel
           identities so standalone tests such as Malaria RDT are still
           required to resolve normally.
        */
        if (isKnownPanelRequest) {
          const fallbackId = getMasterTestId(test);

          return {
            ...(test?.masterTest || {}),
            ...(test?.master_test || {}),
            id:
              fallbackId !== null &&
              fallbackId !== undefined &&
              fallbackId !== "" &&
              Number.isFinite(Number(fallbackId))
                ? Number(fallbackId)
                : null,
            test_name: testName,
            test_code: testCode || test?.code || "",
            department: getDepartment(test),
            test_type: "Panel",
            result_type: "Panel",
            is_panel: true,
            panel_name:
              test?.panel_name ||
              test?.panelName ||
              testName,
          };
        }

        throw new Error(
          `Unable to resolve master test for "${testName || testCode}".`
        );
      },
      []
    );

  /* ========================================================
     RESOLVE CANONICAL PANEL + CHILD MASTER TESTS
     --------------------------------------------------------
     This is the authoritative panel bridge.

     Parent identity comes from master_tests.
     Child identity comes from master_tests.parent_panel.

     Children are NOT filtered by is_primary because a panel child
     can legitimately be non-primary while the same test exists as
     a standalone service.
     ======================================================== */
  const resolvePanelMasterAndChildren = useCallback(
    async (test) => {
      const masterTest =
        test?.masterTest ||
        test?.master_test ||
        await resolveMasterTest(test);

      /*
       * A canonical panel must have a usable panel identity, but the
       * parent master_tests.id is not required for routing. Some legacy
       * registrations contain the correct panel name while their
       * master_test_id is stale/null. In that case the panel children
       * are still authoritative and can be resolved by parent_panel.
       */
      const panelName = text(
        masterTest?.is_panel === true
          ? masterTest.test_name
          : masterTest?.panel_name ||
            test?.panel_name ||
            test?.panelName ||
            getTestName(test)
      );

      if (!panelName) {
        throw new Error(
          `Unable to resolve the panel identity for "${getTestName(test)}".`
        );
      }

      if (!panelName) {
        throw new Error(
          `Panel "${getTestName(test)}" has no panel name in master_tests.`
        );
      }

      let { data: children, error } = await supabase
        .from("master_tests")
        .select("*")
        .eq("active", true)
        .eq("parent_panel", panelName)
        .order("id", { ascending: true });

      if (error) throw error;

      /* Case-insensitive fallback for legacy capitalization. */
      if (!children?.length) {
        const { data: allActive, error: fallbackError } = await supabase
          .from("master_tests")
          .select("*")
          .eq("active", true)
          .order("id", { ascending: true });

        if (fallbackError) throw fallbackError;

        children = (allActive || []).filter(
          (row) => normalizeText(row?.parent_panel) === normalizeText(panelName)
        );
      }

      const normalizedChildren = (children || []).map((child, index) => ({
        ...child,
        master_test_id: child.id,
        masterTestId: child.id,
        masterTest: child,
        master_test: child,
        _panelChild: true,
        _panelParentId: masterTest?.id ?? null,
        _panelParentName: panelName,
        display_order: Number(child.display_order ?? child.id ?? index + 1),
      }));

      return {
        masterTest,
        panelName,
        panelId: masterTest?.id ?? null,
        children: normalizedChildren,
      };
    },
    [resolveMasterTest]
  );

  /* ========================================================
     FIND EXISTING LABORATORY RESULT
     --------------------------------------------------------
     SAFE ORDER:

       1. registration_id + actual UUID test_id
       2. registration_id + test_name
     ======================================================== */

  /* ========================================================
     FIND EXISTING LABORATORY RESULT
     ----------------------------------------------------------
     IMPORTANT:

     The registration-created laboratory_results rows are the
     authoritative records. Result Entry must reuse those rows;
     it must NEVER create a second row merely because the
     registered test name differs from the resolved master-test
     name (for example Fasting Blood Sugar vs Fasting Blood
     Glucose).

     Resolution order:
       1. Exact registration + UUID test_id
       2. Exact registration + normalized test code/name
       3. Lab number + normalized test code/name
       4. Registration result pool + semantic aliases

     laboratory_results.id is ALWAYS returned unchanged.
     ======================================================== */

  const findExistingLaboratoryResult =
    useCallback(
      async (
        registration,
        test
      ) => {
        const registrationId =
          Number(
            registration?.id
          );

        if (!Number.isFinite(registrationId)) {
          throw new Error(
            "Invalid registration ID while locating laboratory result."
          );
        }

        const labNumber =
          text(
            getLabNumber(registration)
          );

        const registeredName =
          text(
            test?._registeredTestName
          );

        const masterName =
          text(
            test?.masterTest?.test_name ||
            test?.master_test?.test_name
          );

        const currentName =
          text(
            getTestName(test)
          );

        const registeredCode =
          text(
            test?._registeredTestCode
          );

        const currentCode =
          text(
            getTestCode(test)
          );

        const laboratoryResultTestId =
          getLaboratoryResultTestId(
            test
          );

        const normalizeLookup =
          (value) =>
            normalizeText(value)
              .replace(/[()]/g, " ")
              .replace(/[\\/]/g, " ")
              .replace(/[._-]+/g, " ")
              .replace(/\s+/g, " ")
              .trim();

        const isHbA1c =
          (value) => {
            const normalized =
              normalizeLookup(value);

            return (
              normalized === "hba1c" ||
              normalized === "hb a1c" ||
              normalized.includes("glycated haemoglobin") ||
              normalized.includes("glycated hemoglobin") ||
              normalized.includes("glycosylated haemoglobin") ||
              normalized.includes("glycosylated hemoglobin") ||
              normalized.includes("haemoglobin a1c") ||
              normalized.includes("hemoglobin a1c")
            );
          };

        const isFbs =
          (value) => {
            const normalized =
              normalizeLookup(value);

            return (
              normalized === "fbs" ||
              normalized === "fasting blood sugar" ||
              normalized === "fasting blood glucose" ||
              normalized === "fasting plasma glucose"
            );
          };

        const isRbs =
          (value) => {
            const normalized =
              normalizeLookup(value);

            return (
              normalized === "rbs" ||
              normalized === "random blood sugar" ||
              normalized === "random blood glucose" ||
              normalized === "random plasma glucose"
            );
          };

        const isTsh =
          (value) => {
            const normalized =
              normalizeLookup(value);

            return (
              normalized === "tsh" ||
              normalized === "thyrotropin" ||
              normalized === "thyroid stimulating hormone"
            );
          };

        const names = [
          registeredName,
          currentName,
          masterName,
        ]
          .filter(Boolean)
          .map(normalizeLookup);

        const codes = [
          registeredCode,
          currentCode,
        ]
          .filter(Boolean)
          .map(normalizeLookup);

        const matchesRow =
          (row) => {
            if (!row) return false;

            if (
              laboratoryResultTestId &&
              isUuid(row.test_id) &&
              String(row.test_id).toLowerCase() ===
                String(laboratoryResultTestId).toLowerCase()
            ) {
              return true;
            }

            const rowName =
              normalizeLookup(
                row.test_name
              );

            const rowCode =
              normalizeLookup(
                row.test_code
              );

            if (
              rowCode &&
              codes.includes(rowCode)
            ) {
              return true;
            }

            if (
              rowName &&
              names.includes(rowName)
            ) {
              return true;
            }

            /* Canonical aliases used by PEFA registrations. */
            if (
              names.some(isHbA1c) &&
              isHbA1c(rowName)
            ) {
              return true;
            }

            if (
              names.some(isFbs) &&
              isFbs(rowName)
            ) {
              return true;
            }

            if (
              names.some(isRbs) &&
              isRbs(rowName)
            ) {
              return true;
            }

            if (
              names.some(isTsh) &&
              isTsh(rowName)
            ) {
              return true;
            }

            return false;
          };

        const fetchRows =
          async (column, value) => {
            if (!value) return [];

            const {
              data,
              error,
            } = await supabase
              .from("laboratory_results")
              .select("*")
              .eq(column, value)
              .order("id", {
                ascending: true,
              });

            if (error) {
              throw error;
            }

            return Array.isArray(data)
              ? data
              : [];
          };

        /* ----------------------------------------------------
           1. Exact UUID relationship.
           ---------------------------------------------------- */
        if (laboratoryResultTestId) {
          const {
            data,
            error,
          } = await supabase
            .from("laboratory_results")
            .select("*")
            .eq("registration_id", registrationId)
            .eq("test_id", laboratoryResultTestId)
            .order("id", {
              ascending: false,
            });

          if (error) {
            throw error;
          }

          const rows = Array.isArray(data) ? data : [];

          /*
           * NEVER accept the first matching row blindly.
           * Registration creation can leave a Pending/blank row while
           * another row already contains the actual saved payload.
           */
          if (rows.length) {
            const meaningful = rows.filter(
              (row) =>
                hasMeaningfulResultPayload(row?.result) ||
                ["performed", "verified", "authorized", "released"].includes(
                  normalizeText(row?.result_status)
                )
            );

            const preferred =
              (meaningful.length ? meaningful : rows)
                .sort((a, b) => {
                  const aDate =
                    new Date(
                      a?.updated_at ||
                      a?.created_at ||
                      0
                    ).getTime() || 0;
                  const bDate =
                    new Date(
                      b?.updated_at ||
                      b?.created_at ||
                      0
                    ).getTime() || 0;

                  if (aDate !== bDate) {
                    return bDate - aDate;
                  }

                  return Number(b?.id || 0) - Number(a?.id || 0);
                })[0];

            if (preferred?.id) {
              return preferred;
            }
          }
        }

        /* ----------------------------------------------------
           2. Search every result belonging to the registration.
           Do NOT depend on exact test_name equality.
           ---------------------------------------------------- */
        const registrationRows =
          await fetchRows(
            "registration_id",
            registrationId
          );

        const registrationMatches =
          registrationRows.filter(
            matchesRow
          );

        if (registrationMatches.length) {
          const preferred =
            [...registrationMatches].sort((a, b) => {
              const aMeaningful =
                hasMeaningfulResultPayload(a?.result) ||
                ["performed", "verified", "authorized", "released"].includes(
                  normalizeText(a?.result_status)
                );
              const bMeaningful =
                hasMeaningfulResultPayload(b?.result) ||
                ["performed", "verified", "authorized", "released"].includes(
                  normalizeText(b?.result_status)
                );

              if (aMeaningful !== bMeaningful) {
                return bMeaningful ? 1 : -1;
              }

              const aDate =
                new Date(a?.updated_at || a?.created_at || 0).getTime() || 0;
              const bDate =
                new Date(b?.updated_at || b?.created_at || 0).getTime() || 0;

              if (aDate !== bDate) {
                return bDate - aDate;
              }

              return Number(b?.id || 0) - Number(a?.id || 0);
            })[0];

          if (preferred?.id) {
            return preferred;
          }
        }

        /* ----------------------------------------------------
           3. Fallback to lab_number.
           This protects against installations where the existing
           result rows were created with the lab number as their
           stable registration linkage.
           ---------------------------------------------------- */
        if (labNumber) {
          const labRows =
            await fetchRows(
              "lab_number",
              labNumber
            );

          const labMatches =
            labRows.filter(
              matchesRow
            );

          if (labMatches.length) {
            const preferred =
              [...labMatches].sort((a, b) => {
                const aMeaningful =
                  hasMeaningfulResultPayload(a?.result) ||
                  ["performed", "verified", "authorized", "released"].includes(
                    normalizeText(a?.result_status)
                  );
                const bMeaningful =
                  hasMeaningfulResultPayload(b?.result) ||
                  ["performed", "verified", "authorized", "released"].includes(
                    normalizeText(b?.result_status)
                  );

                if (aMeaningful !== bMeaningful) {
                  return bMeaningful ? 1 : -1;
                }

                const aDate =
                  new Date(a?.updated_at || a?.created_at || 0).getTime() || 0;
                const bDate =
                  new Date(b?.updated_at || b?.created_at || 0).getTime() || 0;

                if (aDate !== bDate) {
                  return bDate - aDate;
                }

                return Number(b?.id || 0) - Number(a?.id || 0);
              })[0];

            if (preferred?.id) {
              return preferred;
            }
          }
        }

        return null;
      },
      []
    );


  /* ========================================================
     INITIALIZE LABORATORY RESULT
     --------------------------------------------------------
     IMPORTANT:

     Panels do NOT need master_tests resolution here.

     The panel resolver already owns panel identity.

     We still create/reuse the authoritative
     laboratory_results row.
     ======================================================== */

  const initializeLaboratoryResult =
    useCallback(
      async (
        registration,
        test
      ) => {
        if (
          !registration?.id
        ) {
          throw new Error(
            "A valid registration is required."
          );
        }

        if (!test) {
          throw new Error(
            "A registered laboratory test is required."
          );
        }

        const registrationId =
          Number(
            registration.id
          );

        if (
          !Number.isFinite(
            registrationId
          )
        ) {
          throw new Error(
            "Invalid registration ID."
          );
        }

        const testName =
          getTestName(test);

        if (!testName) {
          throw new Error(
            "The registered test has no test name."
          );
        }


        /* ====================================================
           TEST CLASSIFICATION
           ==================================================== */

        const routineUrinalysis =
          isRoutineUrinalysis(
            test
          );

        const specialTest =
          isLocalSpecialTest(
            test
          );

        const panelTest =
          isCanonicalPanelTest(test) ||
          isPanelLaboratoryResultEntry(test);


        /* ====================================================
           MASTER TEST

           Skip for:

           - Routine Urinalysis
           - Special tests
           - Dedicated panels
           ==================================================== */

        /*
         * Reuse an existing authoritative result BEFORE resolving
         * master_tests. Legacy/unmapped registrations such as ESR
         * must remain editable even when their master test is absent.
         */
        const existing =
          await findExistingLaboratoryResult(
            registration,
            test
          );

        if (existing) {
          if (!existing.id) {
            throw new Error(
              "The existing laboratory result has no ID."
            );
          }

          return existing;
        }

        let masterTest =
          test?.masterTest ||
          test?.master_test ||
          null;

        if (
          !masterTest &&
          !routineUrinalysis &&
          !specialTest &&
          !panelTest
        ) {
          masterTest =
            await resolveMasterTest(
              test
            );
        }


        /* ====================================================
           ACTUAL UUID TEST ID
           ==================================================== */

        const laboratoryResultTestId =
          getLaboratoryResultTestId(
            test
          );


        /* ====================================================
           CREATE RESULT
           ==================================================== */

        const payload = {
          registration_id:
            registrationId,

          registration_number:
            getRegistrationNumber(
              registration
            ) || null,

          patient_id:
            getPatientId(
              registration
            ) || null,

          lab_number:
            getLabNumber(
              registration
            ) || null,

          patient_name:
            getPatientName(
              registration
            ) || null,

          /*
           * IMPORTANT:
           *
           * Only a valid laboratory-result UUID
           * may enter laboratory_results.test_id.
           */
          ...(laboratoryResultTestId
            ? {
                test_id:
                  laboratoryResultTestId,
              }
            : {}),

          test_code:
            masterTest?.test_code ||
            getTestCode(test) ||
            null,

          test_name:
            masterTest?.test_name ||
            testName,

          category:
            masterTest?.department ||
            getDepartment(test),

          department:
            masterTest?.department ||
            getDepartment(test),

          specimen:
            masterTest?.specimen ||
            getSpecimen(test) ||
            null,

          result: null,

          result_status:
            "Pending",

          authorization_status:
            "Pending",

          release_status:
            "Pending",
        };


        const {
          data: created,
          error: createError,
        } =
          await supabase
            .from(
              "laboratory_results"
            )
            .insert(
              payload
            )
            .select("*")
            .single();

        if (createError) {
          throw createError;
        }

        if (!created?.id) {
          throw new Error(
            "Laboratory result was created but no result ID was returned."
          );
        }

        return created;
      },
      [
        findExistingLaboratoryResult,
        resolveMasterTest,
      ]
    );


  /* ========================================================
     SELECT REGISTRATION
     ======================================================== */

  const handleSelectRegistration =
    useCallback(
      (registration) => {
        setError("");
        setSuccess("");

        setSelectedRegistration(
          registration
        );

        setSelectedTest(null);
        setSelectedResult(null);
        setHydrationState({
          loading: false,
          found: false,
          payloadFound: false,
          resultId: null,
          source: "none",
          error: "",
        });
        setPanelForm(null);
        setSingleValue("");

        setUrinalysisData(
          EMPTY_URINALYSIS_RESULT
        );
      },
      []
    );


  /* ========================================================
     SELECT TEST
     --------------------------------------------------------
     This always initializes/reuses laboratory_results FIRST.
     ======================================================== */

  const handleSelectTest = async (test) => {
    if (!selectedRegistration) {
      setError("Please select a patient registration first.");
      return;
    }

    setError("");
    setSuccess("");
    setSelectedResult(null);
    setHydrationState({
      loading: false,
      found: false,
      payloadFound: false,
      resultId: null,
      source: "none",
      error: "",
    });
    setPanelForm(null);
    setPanelParameters([]);
    setPanelParameterSource(null);
    setPanelParameterError("");
    setInitializingResult(true);

    try {
      const routineUrinalysis = isRoutineUrinalysis(test);

      let resolvedTest = { ...test };
      let masterTest = null;
      let panelInfo = null;
      let specialTest = false;

      /* ------------------------------------------------------
         CANONICAL MASTER RESOLUTION
         ------------------------------------------------------
         Panels are resolved BEFORE routing. This is the critical
         fix: the raw registration row is no longer trusted to
         decide whether the selected test is a panel.
         ------------------------------------------------------ */
      if (!routineUrinalysis && !specialTest) {
        if (test?.masterTest || test?.master_test) {
          masterTest = test.masterTest || test.master_test;
        } else if (isKnownCanonicalPanelName(test)) {
          try {
            masterTest = await resolveMasterTest(test);
          } catch (masterError) {
            console.warn(
              "[PEFA RESULT ENTRY] Canonical panel master lookup failed; using safe panel fallback:",
              getTestName(test),
              masterError
            );
            masterTest = {
              ...(test || {}),
              id: getMasterTestId(test) ?? test?.test_id ?? null,
              test_name: getTestName(test),
              test_code: getTestCode(test),
              department: getDepartment(test),
              test_type: "Panel",
              result_type: "Panel",
              is_panel: true,
              panel_name: getTestName(test),
            };
          }
        } else {
          masterTest = await resolveMasterTest(test);
        }

        if (isCanonicalPanelTest(masterTest)) {
          panelInfo = await resolvePanelMasterAndChildren({
            ...test,
            masterTest,
            master_test: masterTest,
            master_test_id: masterTest.id,
          });
        }

        resolvedTest = mergeResolvedMasterTest(test, masterTest);

        resolvedTest = {
          ...resolvedTest,
          masterTest,
          master_test: masterTest,
          master_test_id: masterTest.id,
          _registeredTestName:
            test?._registeredTestName || getTestName(test),
          _registeredTestCode:
            test?._registeredTestCode || getTestCode(test),
          test_name: masterTest.test_name || getTestName(test),
          test_code: masterTest.test_code || getTestCode(test),
          department: masterTest.department || getDepartment(test),
          test_type: masterTest.test_type || getTestType(test),
          result_type: masterTest.result_type || getResultType(test),
          unit: masterTest.unit || test?.unit || test?.result_unit || "",
          result_unit: masterTest.result_unit || test?.result_unit || "",
          reference_range: masterTest.reference_range || test?.reference_range || "",
          reference_value: masterTest.reference_value || test?.reference_value || "",
          male_range: masterTest.male_range || test?.male_range || "",
          female_range: masterTest.female_range || test?.female_range || "",
          child_range: masterTest.child_range || test?.child_range || "",
          elderly_range: masterTest.elderly_range || test?.elderly_range || "",
          critical_low: masterTest.critical_low ?? test?.critical_low ?? null,
          critical_high: masterTest.critical_high ?? test?.critical_high ?? null,
          normal_low: masterTest.normal_low ?? test?.normal_low ?? null,
          normal_high: masterTest.normal_high ?? test?.normal_high ?? null,
          panel_name:
            masterTest.panel_name ||
            (panelInfo?.panelName || test?.panel_name || ""),
          is_panel: Boolean(panelInfo || masterTest.is_panel === true),
          _panelId: panelInfo?.panelId ?? masterTest.id ?? null,
          _panelChildren: panelInfo?.children || [],
        };
      }

      /* ------------------------------------------------------
         CANONICAL QUANTITATIVE METADATA OVERRIDE
         ------------------------------------------------------ */
      if (isCanonicalQuantitativeSingleTest(resolvedTest)) {
        resolvedTest = {
          ...resolvedTest,
          test_type: "Single",
          result_type: "Quantitative",
          is_panel: false,
          panel_name: "",
          masterTest: {
            ...(resolvedTest.masterTest || {}),
            test_type: "Single",
            result_type: "Quantitative",
            is_panel: false,
            panel_name: "",
          },
        };
      }

      /*
       * Special routing is decided only after canonical master metadata
       * has been attached. This is what prevents Total PSA / CRP / AMH
       * from entering the legacy qualitative resolver.
       */
      specialTest =
        !routineUrinalysis &&
        !isCanonicalQuantitativeSingleTest(resolvedTest) &&
        !isCanonicalPanelTest(resolvedTest) &&
        isLocalSpecialTest(resolvedTest);

      const panelTest =
        !routineUrinalysis &&
        !specialTest &&
        (Boolean(panelInfo) || isCanonicalPanelTest(resolvedTest));

      /* ------------------------------------------------------
         INITIALIZE/REUSE THE AUTHORITATIVE RESULT ROW.
         ------------------------------------------------------ */
      const databaseResult = await initializeLaboratoryResult(
        selectedRegistration,
        resolvedTest
      );

      if (!databaseResult?.id) {
        throw new Error(
          "Laboratory result initialization returned no authoritative result ID."
        );
      }

      /*
       * LAST-SAVED RESULT RETENTION
       * ------------------------------------------------------
       * The database row is authoritative whenever it contains
       * a meaningful saved result. If an older/legacy row returns
       * a blank result, recover the last verified successful save
       * from the browser cache for this exact laboratory_results.id.
       *
       * This NEVER creates a second laboratory result row and NEVER
       * replaces a meaningful database result with stale cache data.
       */
      const cachedResult = getCachedLaboratoryResultEntry(
        databaseResult.id
      );

      const authoritativeResult =
        hasMeaningfulResultPayload(databaseResult.result) ||
        ["performed", "verified", "authorized", "released"].includes(
          normalizeText(databaseResult.result_status)
        )
          ? {
              ...databaseResult,
              result: parsePersistedResultPayload(
                databaseResult.result
              ),
            }
          : cachedResult
          ? {
              ...databaseResult,
              result: parsePersistedResultPayload(
                cachedResult.result
              ),
              result_status:
                databaseResult.result_status ||
                cachedResult.result_status ||
                "Performed",
              updated_at:
                databaseResult.updated_at ||
                cachedResult.updated_at ||
                null,
            }
          : {
              ...databaseResult,
              result: parsePersistedResultPayload(
                databaseResult.result
              ),
            };

      const result = authoritativeResult;

      setSelectedTest(resolvedTest);
      setSelectedResult(result);

      console.info(
        "[PEFA RESULT ENTRY] Canonical routing resolved:",
        {
          resultId: result.id,
          masterTestId: masterTest?.id ?? null,
          testName: resolvedTest.test_name,
          department: resolvedTest.department,
          testType: resolvedTest.test_type,
          resultType: resolvedTest.result_type,
          isPanel: panelTest,
          panelName: resolvedTest.panel_name || null,
          childCount: resolvedTest._panelChildren?.length || 0,
        }
      );

      /* ------------------------------------------------------
         EDIT-MODE HYDRATION
         ------------------------------------------------------ */
      const storedResultValue = getStoredResultValue(result);
      setSingleValue(storedResultValue);

      const persistedResultPayload =
        hasMeaningfulResultPayload(result?.result)
          ? parsePersistedResultPayload(result.result)
          : parsePersistedResultPayload(
              getCachedLaboratoryResultEntry(result?.id)?.result
            );

      if (
        persistedResultPayload &&
        typeof persistedResultPayload === "object" &&
        !Array.isArray(persistedResultPayload)
      ) {
        setPanelForm(persistedResultPayload);

        if (isRoutineUrinalysis(resolvedTest)) {
          setUrinalysisData({
            ...EMPTY_URINALYSIS_RESULT,
            ...persistedResultPayload,
          });
        }
      } else {
        setPanelForm(null);
        if (isRoutineUrinalysis(resolvedTest)) {
          setUrinalysisData(EMPTY_URINALYSIS_RESULT);
        }
      }

      /* Result entry is presented in the modal below. */
    } catch (err) {
      console.error(
        "LaboratoryResultEntry result initialization/routing failed:",
        err
      );
      setSelectedTest(null);
      setSelectedResult(null);
      setPanelForm(null);
      setError(
        err?.message || "Unable to initialize laboratory result."
      );
    } finally {
      setInitializingResult(false);
    }
  };

  /* ========================================================
     SEARCH
     ======================================================== */

  const handleSearch =
    async (event) => {
      event?.preventDefault();

      const requestedLabNumber = text(labNumber);

      if (!requestedLabNumber) {
        setHasSearched(false);
        setRegistrations([]);
        setSelectedRegistration(null);
        setSelectedTest(null);
        setSelectedResult(null);
        setPanelForm(null);
        setSingleValue("");
        setError("Enter the patient's Lab Number to search.");
        return;
      }

      setSearch("");
      setSelectedRegistration(null);
      setSelectedTest(null);
      setSelectedResult(null);
      setPanelForm(null);
      setSingleValue("");

      await loadRegistrations({
        requestedLabNumber,
        requestedSearch: "",
      });
    };

  /* ========================================================
     RESET
     ======================================================== */

  const handleReset =
    async () => {
      setLabNumber("");
      setSearch("");
      setHasSearched(false);

      setSelectedRegistration(
        null
      );

      setSelectedTest(null);
      setSelectedResult(null);
      setPanelForm(null);
      setSingleValue("");

      setUrinalysisData(
        EMPTY_URINALYSIS_RESULT
      );

      setError("");
      setSuccess("");

      await loadRegistrations({
        requestedLabNumber:
          "",
        requestedSearch:
          "",
      });
    };


  /* ========================================================
     REFRESH
     ======================================================== */

  const handleRefresh =
    async () => {
      const requestedLabNumber = text(labNumber);

      if (!requestedLabNumber) return;

      await loadRegistrations({
        requestedLabNumber,
        requestedSearch: "",
      });
    };

  /* ========================================================
     SPECIAL RESOLUTION
     ======================================================== */

  const selectedTestResolution =
    useMemo(
      () => {
        if (
          !selectedTest
        ) {
          return null;
        }

        if (
          isRoutineUrinalysis(
            selectedTest
          )
        ) {
          return {
            key:
              "routine_urinalysis",

            label:
              "Routine Urinalysis",
          };
        }

        if (
          isQuantitativeResultType(getResultType(selectedTest)) ||
          isCanonicalPanelTest(selectedTest)
        ) {
          return null;
        }

        return resolveSpecialLaboratoryResultEntry(
          selectedTest
        );
      },
      [
        selectedTest,
      ]
    );


  const selectedTestIsSpecial =
    useMemo(
      () =>
        selectedTest
          ? !isCanonicalQuantitativeSingleTest(selectedTest) &&
            isLocalSpecialTest(selectedTest)
          : false,
      [
        selectedTest,
      ]
    );


  const selectedTestIsGroupingCrossMatching =
    useMemo(
      () =>
        Boolean(
          selectedTest &&
          isGroupingCrossMatchingTest(selectedTest)
        ),
      [selectedTest]
    );


  const selectedTestIsRoutineUrinalysis =
    useMemo(
      () =>
        selectedTest
          ? isRoutineUrinalysis(
              selectedTest
            )
          : false,
      [
        selectedTest,
      ]
    );


  /* ========================================================
     PANEL RESOLUTION
     ======================================================== */

  const selectedPanelResolution =
    useMemo(
      () => {
        if (
          !selectedTest
        ) {
          return null;
        }

        return resolvePanelLaboratoryResultEntry(
          selectedTest
        );
      },
      [
        selectedTest,
      ]
    );


  const selectedTestIsPanel =
    useMemo(
      () =>
        selectedTest
          ? isCanonicalPanelTest(selectedTest)
          : false,
      [selectedTest]
    );


  /* ========================================================
     AUTHORITATIVE PANEL PARAMETER BRIDGE
     --------------------------------------------------------
     The panel resolver is database-free. This parent loads the
     child master_tests metadata and passes it down unchanged.
     ======================================================== */

  const selectedPanelLookup = useMemo(() => {
    if (!selectedTestIsPanel || !selectedTest) {
      return {
        panelName: "",
        panelId: null,
        children: [],
      };
    }

    const master =
      selectedTest?.masterTest ||
      selectedTest?.master_test ||
      {};

    return {
      panelName:
        text(
          selectedTest?._panelParentName ||
          selectedTest?.panel_name ||
          (master?.is_panel ? master?.test_name : "")
        ),
      panelId:
        selectedTest?._panelId ??
        master?.id ??
        null,
      children: Array.isArray(selectedTest?._panelChildren)
        ? selectedTest._panelChildren
        : [],
    };
  }, [selectedTest, selectedTestIsPanel]);

  useEffect(() => {
    if (!selectedTestIsPanel || !selectedTest) {
      setPanelParameters([]);
      setPanelParameterSource(null);
      setPanelParameterLoading(false);
      setPanelParameterError("");
      return undefined;
    }

    let cancelled = false;

    const builtinRows = [
      ...getBuiltinChemistryPanelParameters(selectedPanelLookup.panelName),
      ...getBuiltinHaematologyPanelParameters(selectedPanelLookup.panelName),
      ...getBuiltinEndocrinePanelParameters(selectedPanelLookup.panelName),
    ];

    /* --------------------------------------------------------
       AUTHORITATIVE DATABASE CHILDREN
       --------------------------------------------------------
       These rows were already resolved from master_tests.parent_panel
       during handleSelectTest. No second service lookup is required.
       -------------------------------------------------------- */
    const databaseRows = selectedPanelLookup.children.map((child, index) => {
      const builtinForChild =
        getBuiltinEndocrinePanelParameters(selectedPanelLookup.panelName)
          .find((row) =>
            normalizeText(row?.name) === normalizeText(child?.test_name)
          ) || null;

      const databaseReference = getReferenceRangeForPatient(
        child,
        selectedRegistration
      );

      const unit =
        text(child?.unit) ||
        text(child?.result_unit) ||
        text(builtinForChild?.unit);

      const reference =
        text(databaseReference) ||
        text(child?.reference_range) ||
        text(child?.reference_value) ||
        text(builtinForChild?.reference_range);

      const key =
        child?.test_code ||
        child?.key ||
        normalizeText(child?.test_name).replace(/[^a-z0-9]+/g, "_");

      return {
        ...child,
        key,
        name: child?.test_name,
        test_name: child?.test_name,
        parameter_name: child?.test_name,
        analyteIdentity: key,
        analyte_identity: key,
        unit,
        result_unit: unit,
        reference_value: reference,
        reference_range: reference,
        referenceRanges: reference ? [reference] : [],
        display_order: Number(child?.display_order ?? child?.id ?? index + 1),
        master_test_id: child?.id,
        masterTest: child,
        master_test: child,
        _panelChild: true,
      };
    });

    const merged = normalizePanelParameters([
      ...builtinRows,
      ...databaseRows,
    ]);

    setPanelParameters(merged);
    setPanelParameterSource(
      databaseRows.length
        ? "master_tests.parent_panel"
        : builtinRows.length
        ? "built-in"
        : null
    );
    setPanelParameterLoading(false);

    if (!merged.length) {
      setPanelParameterError(
        `No child master_tests were found for ${
          selectedPanelLookup.panelName || "this panel"
        }.`
      );
    } else {
      setPanelParameterError("");
    }

    return () => {
      cancelled = true;
    };
  }, [
    selectedTest,
    selectedTestIsPanel,
    selectedPanelLookup,
    selectedRegistration,
  ]);

  /* ========================================================
     QUANTITATIVE SINGLE TEST
     ======================================================== */

  const selectedTestIsQuantitative =
    useMemo(
      () =>
        Boolean(
          selectedTest &&
          !selectedTestIsPanel &&
          !selectedTestIsRoutineUrinalysis &&
          (
            isCanonicalQuantitativeSingleTest(selectedTest) ||
            (
              !selectedTestIsSpecial &&
              isQuantitativeSingleTest(selectedTest)
            )
          )
        ),
      [
        selectedTest,
        selectedTestIsSpecial,
        selectedTestIsPanel,
        selectedTestIsRoutineUrinalysis,
      ]
    );

  const selectedReferenceRange =
    useMemo(
      () =>
        selectedTest
          ? getReferenceRangeForPatient(
              selectedTest,
              selectedRegistration
            )
          : "",
      [
        selectedTest,
        selectedRegistration,
      ]
    );

  const selectedCriticalLow =
    selectedTest?.critical_low ??
    selectedTest?.masterTest?.critical_low ??
    selectedTest?.master_test?.critical_low ??
    null;

  const selectedCriticalHigh =
    selectedTest?.critical_high ??
    selectedTest?.masterTest?.critical_high ??
    selectedTest?.master_test?.critical_high ??
    null;

  const selectedSingleFlag =
    useMemo(
      () =>
        selectedTestIsQuantitative
          ? calculateNumericFlag(
              singleValue,
              selectedReferenceRange,
              selectedCriticalLow,
              selectedCriticalHigh
            )
          : "",
      [
        selectedTestIsQuantitative,
        singleValue,
        selectedReferenceRange,
        selectedCriticalLow,
        selectedCriticalHigh,
      ]
    );

  /*
   * Presentation-only result object for the generic quantitative
   * single-test form. It injects the patient-specific reference
   * range and live calculated flag without changing the database
   * row until the user explicitly saves.
   */
  const effectiveSavedPanelParameters =
    useMemo(
      () =>
        buildSavedParameterBridge(
          selectedResult,
          panelParameters
        ),
      [
        selectedResult,
        panelParameters,
      ]
    );


const selectedSingleDisplayResult =
    useMemo(
      () => ({
        ...(selectedResult || {}),
        result: singleValue,
        unit:
          getTestUnit(selectedTest) ||
          selectedResult?.unit ||
          "",
        reference_range:
          selectedReferenceRange ||
          selectedResult?.reference_range ||
          "",
        flag:
          selectedSingleFlag ||
          selectedResult?.flag ||
          selectedResult?.result_flag ||
          "",
      }),
      [
        selectedResult,
        selectedTest,
        singleValue,
        selectedReferenceRange,
        selectedSingleFlag,
      ]
    );


  /* ========================================================
     REGISTERED TESTS
     ======================================================== */

  const registeredTests =
    useMemo(
      () =>
        selectedRegistration
          ? (
              selectedRegistration._tests ||
              extractRegistrationTests(
                selectedRegistration
              )
            )
          : [],
      [
        selectedRegistration,
      ]
    );


  /* ========================================================
     STATUS
     ======================================================== */

  const getRegistrationTestStatus =
    (test) =>
      test?.result_status ||
      test?.status ||
      "Registered";


  const getStatusClass =
    (status) =>
      normalizeText(
        status
      ).replace(
        /\s+/g,
        "-"
      );


  /* ========================================================
     CENTRAL RESULT PERSISTENCE / AUDIT ENGINE
     ======================================================== */
  const commitResultPersistence = useCallback(async ({
    resultId, resultPayload, resultStatus = "Performed", previousResult, previousStatus,
    action = "Result Edited", afterSaved, editReasonValue = "",
  }) => {
    if (!resultId) throw new Error("No laboratory result record is available.");
    if (!currentStaff?.full_name) throw new Error("The logged-in laboratory staff identity could not be resolved. Result saving is blocked.");

    const existingResult = selectedResult || {};
    const isEdit = isPreviouslySavedLaboratoryResult(existingResult);
    const changed = !resultPayloadsEqual(previousResult, resultPayload);
    if (isEdit && changed && !text(editReasonValue)) {
      throw new Error("A reason for editing this result is required.");
    }

    const updatePayload = {
      result: resultPayload,
      result_status: resultStatus,
      ...buildStaffPersistenceFields(currentStaff, existingResult),
    };

    const { error: updateError } = await supabase
      .from("laboratory_results")
      .update(updatePayload)
      .eq("id", resultId);
    if (updateError) throw updateError;

    const { data: savedResult, error: verifyError } = await supabase
      .from("laboratory_results")
      .select("*")
      .eq("id", resultId)
      .maybeSingle();
    if (verifyError) throw verifyError;
    if (!savedResult?.id) throw new Error("The result was saved but could not be verified.");

    if (isEdit && changed) {
      const description = [
        "Laboratory result edited.",
        `Lab Number: ${getLabNumber(selectedRegistration) || savedResult.lab_number || "—"}`,
        `Patient: ${getPatientName(selectedRegistration) || savedResult.patient_name || "—"}`,
        `Test: ${getTestName(selectedTest) || savedResult.test_name || "Laboratory Test"}`,
        `Laboratory Result ID: ${savedResult.id}`,
        `Edited By: ${currentStaff.full_name}`,
        `Staff ID: ${currentStaff.id ?? "—"}`,
        `Username: ${currentStaff.username || "—"}`,
        `Role: ${currentStaff.role || currentStaff.designation || "—"}`,
        `Reason: ${text(editReasonValue)}`,
        `Previous Status: ${previousStatus || "—"}`,
        `New Status: ${resultStatus || "—"}`,
        `Previous Result: ${safeJson(previousResult)}`,
        `New Result: ${safeJson(resultPayload)}`,
      ].join("\n");

      const { error: auditError } = await supabase.from("audit_logs").insert([{
        user_name: currentStaff.full_name || currentStaff.username || "Unknown",
        user_role: currentStaff.role || currentStaff.designation || "",
        action: action || "Result Edited",
        module: "Laboratory Result Entry",
        description,
      }]);

      if (auditError) {
        const { error: rollbackError } = await supabase
          .from("laboratory_results")
          .update({ result: previousResult, result_status: previousStatus || "Performed" })
          .eq("id", resultId);
        console.error("[PEFA RESULT ENTRY] Audit logging failed; rollback attempted:", { auditError, rollbackError });
        if (rollbackError) throw new Error(`Result changed but mandatory audit logging and rollback both failed. ${auditError.message || "Contact the LIS administrator."}`);
        throw new Error(`Result update was blocked because the mandatory audit log could not be written. The previous result has been restored. ${auditError.message || "Please try again."}`);
      }
    }

    /*
     * DURABLE FORM RETENTION
     * ------------------------------------------------------
     * Cache only AFTER every mandatory save/audit operation has
     * succeeded. If audit logging fails and the database is rolled
     * back, the failed edit is therefore never cached.
     *
     * Supabase remains the authoritative source of truth.
     */
    cacheLaboratoryResultEntry(savedResult);

    setSelectedResult(savedResult);
    if (typeof afterSaved === "function") await afterSaved(savedResult);
    return savedResult;
  }, [currentStaff, selectedResult, selectedRegistration, selectedTest]);

  const requestResultPersistence = useCallback(async (args) => {
    if (!args?.resultId) { setError("No laboratory result record is available."); return { queued: false, saved: false }; }
    if (!currentStaff?.full_name) { setError("The logged-in laboratory staff identity could not be resolved. Result saving is blocked."); return { queued: false, saved: false }; }

    const isEdit = isPreviouslySavedLaboratoryResult(selectedResult);
    const changed = !resultPayloadsEqual(args.previousResult, args.resultPayload);
    if (isEdit && changed) {
      setEditReason("");
      setEditReasonError("");
      setPendingSave({ ...args, originalResult: selectedResult });
      return { queued: true, saved: false };
    }

    const saved = await commitResultPersistence({ ...args, action: "Result Saved" });
    return { queued: false, saved: Boolean(saved?.id) };
  }, [currentStaff, selectedResult, commitResultPersistence]);

  const handleConfirmEditReason = useCallback(async () => {
    if (!pendingSave) return;
    const reason = text(editReason);
    if (!reason) { setEditReasonError("Reason for editing is mandatory. The result cannot be updated without a reason."); return; }
    if (reason.length < 5) { setEditReasonError("Please provide a meaningful reason for the edit (at least 5 characters)."); return; }
    setSavingPendingEdit(true);
    setEditReasonError("");
    setError("");
    try {
      const savedResult = await commitResultPersistence({
        ...pendingSave,
        editReasonValue: reason,
      });

      if (savedResult?.id) {
        const message =
          pendingSave.successMessage ||
          `${getTestName(selectedTest)} result successfully updated.`;
        setSuccess(message);
        window.alert(message);
      }

      setPendingSave(null);
      setEditReason("");
      setEditReasonError("");

      if (savedResult?.id) {
        navigate(-1);
      }
    } catch (err) {
      console.error("[PEFA RESULT ENTRY] Result edit failed:", err);
      setError(err?.message || "Unable to update the laboratory result.");
    } finally { setSavingPendingEdit(false); }
  }, [commitResultPersistence, editReason, pendingSave, navigate, selectedTest]);

  const handleCancelEditReason = useCallback(() => {
    if (savingPendingEdit) return;
    setPendingSave(null);
    setEditReason("");
    setEditReasonError("");
  }, [savingPendingEdit]);

  /* ========================================================
     SAVE ROUTINE URINALYSIS
     ======================================================== */
  const handleSaveRoutineUrinalysis = useCallback(async () => {
    if (!selectedResult?.id) { setError("No laboratory result record is available."); return; }
    setSavingUrinalysis(true); setError(""); setSuccess("");
    try {
      const outcome = await requestResultPersistence({
        resultId: selectedResult.id, resultPayload: urinalysisData, resultStatus: "Performed",
        previousResult: selectedResult?.result ?? null, previousStatus: selectedResult?.result_status || "Pending",
        action: "Result Edited",
      });
      if (outcome?.queued) return;
      if (outcome?.saved) { const message = "Routine Urinalysis result successfully saved."; setSuccess(message); window.alert(message); navigate(-1); }
    } catch (err) { setError(err?.message || "Unable to save Routine Urinalysis result."); }
    finally { setSavingUrinalysis(false); }
  }, [selectedResult, urinalysisData, requestResultPersistence, navigate]);


  /* ========================================================
     SPECIAL SAVE CALLBACK
     ======================================================== */
  const handleSpecialSaved = useCallback(async (specialResultData) => {
    const authoritativeResultId = selectedResult?.id;
    if (!authoritativeResultId) { setError("No laboratory result record is available."); return; }
    if (specialResultData === null || specialResultData === undefined) { setError("No special laboratory result data was supplied."); return; }

    const looksLikeLaboratoryResultRow = typeof specialResultData === "object" && !Array.isArray(specialResultData) && (
      Object.prototype.hasOwnProperty.call(specialResultData, "registration_id") ||
      Object.prototype.hasOwnProperty.call(specialResultData, "result_status") ||
      Object.prototype.hasOwnProperty.call(specialResultData, "test_id") ||
      Object.prototype.hasOwnProperty.call(specialResultData, "lab_number")
    );
    let resultPayload = looksLikeLaboratoryResultRow ? specialResultData.result : specialResultData;
    if (looksLikeLaboratoryResultRow && specialResultData?.id != null && String(specialResultData.id) !== String(authoritativeResultId)) {
      setError("The returned laboratory result belongs to a different result record."); return;
    }
    if (resultPayload === null || resultPayload === undefined) { setError("The special laboratory result contains no result data."); return; }

    try {
      const outcome = await requestResultPersistence({
        resultId: authoritativeResultId, resultPayload, resultStatus: "Performed",
        previousResult: selectedResult?.result ?? null, previousStatus: selectedResult?.result_status || "Pending",
        action: "Result Edited",
      });
      if (outcome?.queued) return;
      if (outcome?.saved) { const message = `${getTestName(selectedTest)} result successfully saved.`; setSuccess(message); window.alert(message); navigate(-1); }
    } catch (err) { setError(err?.message || "Unable to save special laboratory result."); }
  }, [selectedResult, selectedTest, requestResultPersistence, navigate]);


  /* ========================================================
     SPECIAL CANCEL
     ======================================================== */

  const handleSpecialCancel =
    useCallback(
      () => {
        setSelectedTest(
          null
        );

        setSelectedResult(
          null
        );

        setPanelForm(
          null
        );

        setError("");
        setSuccess("");
      },
      []
    );


  /* ========================================================
     SPECIAL BACK
     ======================================================== */

  const handleSpecialBack =
    useCallback(
      () => {
        setSelectedTest(
          null
        );

        setSelectedResult(
          null
        );

        setPanelForm(
          null
        );

        setError("");
        setSuccess("");

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });
      },
      []
    );


  /* ========================================================
     PANEL CHANGE
     --------------------------------------------------------
     This is deliberately LOCAL.

     It does NOT write to Supabase.

     It keeps the currently edited panel form
     separate from selectedResult.
     ======================================================== */

  const handlePanelChange =
    useCallback(
      (form) => {
        setPanelForm(
          form
        );
      },
      []
    );


  /* ========================================================
     PANEL SAVE
     ======================================================== */
  const handlePanelSaved = useCallback(async (finalForm) => {
    if (!selectedResult?.id) { setError("No laboratory result record is available."); return; }
    if (!finalForm || typeof finalForm !== "object") { setError("No panel result data was supplied."); return; }
    setSavingPanel(true); setError(""); setSuccess("");
    try {
      const outcome = await requestResultPersistence({
        resultId: selectedResult.id, resultPayload: finalForm, resultStatus: "Performed",
        previousResult: selectedResult?.result ?? null, previousStatus: selectedResult?.result_status || "Pending",
        action: "Result Edited",
      });
      if (outcome?.queued) return;
      if (outcome?.saved) { const message = `${getTestName(selectedTest)} result successfully saved/updated.`; setSuccess(message); window.alert(message); navigate(-1); }
    } catch (err) { setError(err?.message || "Unable to save or update panel result."); }
    finally { setSavingPanel(false); }
  }, [selectedResult, selectedTest, requestResultPersistence, navigate]);


  /* ========================================================
     PANEL SAVE ALIAS
     --------------------------------------------------------
     Some dedicated panel forms expose onSave instead
     of onSaved.
     ======================================================== */

  const handlePanelSave =
    useCallback(
      (form) =>
        handlePanelSaved(
          form
        ),
      [
        handlePanelSaved,
      ]
    );


  /* ========================================================
     PANEL CANCEL
     ======================================================== */

  const handlePanelCancel =
    useCallback(
      () => {
        setPanelForm(
          null
        );

        setSelectedTest(
          null
        );

        setSelectedResult(
          null
        );

        setError("");
        setSuccess("");
      },
      []
    );


  /* ========================================================
     PANEL BACK
     ======================================================== */

  const handlePanelBack =
    useCallback(
      () => {
        setPanelForm(
          null
        );

        setSelectedTest(
          null
        );

        setSelectedResult(
          null
        );

        setError("");
        setSuccess("");

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });
      },
      []
    );


  /* ========================================================
     SAVE QUANTITATIVE SINGLE TEST
     ======================================================== */
  const handleSingleSaved = useCallback(async () => {
    if (!selectedResult?.id) { setError("No laboratory result record is available."); return; }
    if (singleValue === "" || singleValue === null || singleValue === undefined) { setError("Please enter a quantitative result before saving."); return; }
    setSavingSingle(true); setError(""); setSuccess("");
    try {
      const numericValue = parseNumeric(singleValue);
      const valueToSave = numericValue === null ? String(singleValue).trim() : numericValue;
      const outcome = await requestResultPersistence({
        resultId: selectedResult.id, resultPayload: valueToSave, resultStatus: "Performed",
        previousResult: selectedResult?.result ?? null, previousStatus: selectedResult?.result_status || "Pending",
        action: "Result Edited",
      });
      if (outcome?.queued) return;
      if (outcome?.saved) { const message = `${getTestName(selectedTest)} result successfully saved/updated.`; setSuccess(message); window.alert(message); navigate(-1); }
    } catch (err) { setError(err?.message || "Unable to save or update quantitative result."); }
    finally { setSavingSingle(false); }
  }, [selectedResult, singleValue, selectedTest, requestResultPersistence, navigate]);


  /* ========================================================
     ENTRY MODE
     ======================================================== */

  const entryModeLabel =
    selectedTestIsRoutineUrinalysis
      ? "Routine Urinalysis"
      : selectedTestIsSpecial
      ? selectedTestResolution?.label ||
        "Special Test"
      : selectedTestIsPanel
      ? selectedPanelResolution?.label ||
        "Panel Result"
      : selectedTestIsQuantitative
      ? "Quantitative Laboratory Test"
      : "Laboratory Test";


  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="laboratory-result-entry pefa-result-entry-premium">

      {/* ==================================================
          HEADER
         ================================================== */}

      <header className="laboratory-result-entry__header">

        <div className="laboratory-result-entry__header-left">

          <button
            type="button"
            className="laboratory-result-entry__back"
            onClick={() =>
              navigate(-1)
            }
            title="Go back"
          >
            <ArrowLeft
              size={18}
            />
          </button>

          <div>

            <div className="laboratory-result-entry__eyebrow">
              PEFA LABORATORY
            </div>

            <h1>
              Laboratory Result Entry
            </h1>

            <p>
              Select a registered
              laboratory test to
              enter its result.
            </p>

          </div>

        </div>


        <div className="laboratory-result-entry__header-actions">

          <button
            type="button"
            className="laboratory-result-entry__button laboratory-result-entry__button--secondary"
            onClick={
              handleRefresh
            }
            disabled={
              loading ||
              initializingResult
            }
          >

            {loading ? (
              <Loader2
                size={17}
                className="laboratory-result-entry__spin"
              />
            ) : (
              <RefreshCw
                size={17}
              />
            )}

            Refresh

          </button>

        </div>

      </header>


      {/* ==================================================
          SEARCH
         ================================================== */}

      <form
        className="laboratory-result-entry__search laboratory-result-entry__search--lab-only"
        onSubmit={handleSearch}
      >
        <div className="laboratory-result-entry__search-box">

          <div className="laboratory-result-entry__search-icon">
            <Search size={21} />
          </div>

          <div className="laboratory-result-entry__search-content">
            <label htmlFor="lab-number">
              SEARCH BY LAB NUMBER
            </label>

            <input
              id="lab-number"
              type="text"
              value={labNumber}
              autoComplete="off"
              spellCheck="false"
              placeholder="Enter Lab Number e.g. LAB260996"
              onChange={(event) =>
                setLabNumber(event.target.value)
              }
            />

            <span>
              Only the exact Lab Number is used to retrieve the patient's
              registration and its registered tests.
            </span>
          </div>

          <button
            type="submit"
            className="laboratory-result-entry__button laboratory-result-entry__button--primary laboratory-result-entry__search-button"
            disabled={loading}
          >
            {loading ? (
              <Loader2
                size={18}
                className="laboratory-result-entry__spin"
              />
            ) : (
              <Search size={18} />
            )}
            Search Lab Number
          </button>

          <button
            type="button"
            className="laboratory-result-entry__button laboratory-result-entry__button--secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </button>

        </div>
      </form>


      {/* ==================================================
          ERROR
         ================================================== */}

      {error && (
        <div className="laboratory-result-entry__message laboratory-result-entry__message--error">

          <AlertCircle
            size={18}
          />

          <span>
            {error}
          </span>

        </div>
      )}


      {/* ==================================================
          SUCCESS
         ================================================== */}

      {success && (
        <div className="laboratory-result-entry__message laboratory-result-entry__message--success">

          <CheckCircle2
            size={18}
          />

          <span>
            {success}
          </span>

        </div>
      )}


      {!staffLoading && currentStaff && (
        <div className="laboratory-result-entry__message" style={{ color: "#0f766e", background: "#f0fdfa", borderColor: "#99f6e4" }}>
          <User size={18} />
          <span><strong>Entered by:</strong> {currentStaff.full_name}{currentStaff.role ? ` • ${currentStaff.role}` : ""}</span>
        </div>
      )}

      {/* ==================================================
          REGISTRATION LIST
         ================================================== */}

      {hasSearched &&
        !loading &&
        registrations.length >
          0 && (
        <section className="laboratory-result-entry__registrations">

          <div className="laboratory-result-entry__section-header">

            <div>

              <div className="laboratory-result-entry__section-eyebrow">
                REGISTERED PATIENTS
              </div>

              <h2>
                Laboratory Registrations
              </h2>

              <p>
                Select the patient
                registration whose
                tests you want to
                process.
              </p>

            </div>

            <div className="laboratory-result-entry__section-count">
              {
                registrations.length
              }{" "}
              registration
              {registrations.length ===
              1
                ? ""
                : "s"}
            </div>

          </div>


          <div className="laboratory-result-entry__registration-grid">

            {registrations.map(
              (
                registration,
                index
              ) => {

                const selected =
                  selectedRegistration?.id ===
                  registration.id;

                const tests =
                  registration._tests ||
                  [];

                return (
                  <button
                    type="button"
                    key={
                      registration.id ||
                      registration.registration_number ||
                      `${registration._labNumber}-${index}`
                    }
                    className={`laboratory-result-entry__registration-card ${
                      selected
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectRegistration(
                        registration
                      )
                    }
                  >

                    <div className="laboratory-result-entry__registration-icon">

                      <User
                        size={20}
                      />

                    </div>


                    <div className="laboratory-result-entry__registration-main">

                      <strong>
                        {
                          registration._patientName
                        }
                      </strong>

                      <span>
                        Patient ID:{" "}
                        {
                          registration._patientId
                        }
                      </span>

                      <span>
                        Lab No:{" "}
                        {
                          registration._labNumber ||
                          "—"
                        }
                      </span>

                      <span>
                        Registered:{" "}
                        {formatDate(
                          registration.created_at
                        )}
                      </span>

                    </div>


                    <div className="laboratory-result-entry__registration-meta">

                      <span>
                        {
                          tests.length
                        }
                      </span>

                      <small>
                        test
                        {tests.length ===
                        1
                          ? ""
                          : "s"}
                      </small>

                    </div>


                    <ChevronRight
                      size={18}
                    />

                  </button>
                );
              }
            )}

          </div>

        </section>
      )}


      {/* ==================================================
          EMPTY
         ================================================== */}

      {hasSearched &&
        !loading &&
        registrations.length ===
          0 && (
        <div className="laboratory-result-entry__empty">

          <div className="laboratory-result-entry__empty-icon">

            <ClipboardList
              size={28}
            />

          </div>

          <h2>
            No laboratory registration found
          </h2>

          <p>
            No registration was found for this Lab Number.
            Confirm the Lab Number and search again.
          </p>

        </div>
      )}


      {/* ==================================================
          LOADING
         ================================================== */}

      {loading && (
        <div className="laboratory-result-entry__loading">

          <Loader2
            size={28}
            className="laboratory-result-entry__spin"
          />

          <span>
            Searching laboratory
            registrations...
          </span>

        </div>
      )}


      {/* ==================================================
          RESULT INITIALIZATION
         ================================================== */}

      {initializingResult && (
        <div className="laboratory-result-entry__loading">

          <Loader2
            size={28}
            className="laboratory-result-entry__spin"
          />

          <span>
            Initializing laboratory
            result...
          </span>

        </div>
      )}


      {/* ==================================================
          SELECTED REGISTRATION
         ================================================== */}

      {!loading &&
        selectedRegistration && (
        <section className="laboratory-result-entry__patient">

          <div className="laboratory-result-entry__patient-header">

            <div className="laboratory-result-entry__patient-icon">

              <User
                size={22}
              />

            </div>


            <div>

              <div className="laboratory-result-entry__section-eyebrow">
                SELECTED REGISTRATION
              </div>

              <h2>
                {
                  selectedRegistration._patientName
                }
              </h2>

              <p>
                Patient ID:{" "}
                {
                  selectedRegistration._patientId
                }
              </p>

            </div>


            <div className="laboratory-result-entry__patient-identifiers">

              <div>

                <span>
                  Lab Number
                </span>

                <strong>
                  {
                    selectedRegistration._labNumber ||
                    "—"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Registration
                </span>

                <strong>
                  {
                    selectedRegistration._registrationNumber ||
                    "—"
                  }
                </strong>

              </div>

            </div>

          </div>


          {/* ==================================================
              REGISTERED TESTS
             ================================================== */}

          <div className="laboratory-result-entry__tests">

            <div className="laboratory-result-entry__section-header">

              <div>

                <div className="laboratory-result-entry__section-eyebrow">
                  REGISTERED TESTS
                </div>

                <h2>
                  Tests Awaiting Result Entry
                </h2>

                <p>
                  Select a registered
                  test to open its
                  appropriate result
                  entry form.
                </p>

              </div>


              <div className="laboratory-result-entry__section-count">

                {
                  registeredTests.length
                }{" "}
                test
                {registeredTests.length ===
                1
                  ? ""
                  : "s"}

              </div>

            </div>


            {registeredTests.length ===
            0 ? (

              <div className="laboratory-result-entry__empty laboratory-result-entry__empty--compact">

                <FlaskConical
                  size={25}
                />

                <span>
                  No laboratory tests
                  were found in this
                  registration.
                </span>

              </div>

            ) : (

              <div className="laboratory-result-entry__test-grid">

                {registeredTests.map(
                  (
                    test,
                    index
                  ) => {

                    const routine =
                      isRoutineUrinalysis(
                        test
                      );

                    const special =
                      !routine &&
                      !isCanonicalQuantitativeSingleTest(test) &&
                      isSpecialLaboratoryResultEntry(
                        test
                      );

                    const panel =
                      !routine &&
                      !special &&
                      (isCanonicalPanelTest(test) ||
                        isPanelLaboratoryResultEntry(test));

                    const specialResolution =
                      special
                        ? resolveSpecialLaboratoryResultEntry(
                            test
                          )
                        : null;

                    const panelResolution =
                      panel
                        ? resolvePanelLaboratoryResultEntry(
                            test
                          )
                        : null;

                    const selected =
                      selectedTest?._entryKey ===
                      test?._entryKey;


                    let typeLabel =
                      getTestType(
                        test
                      ) ||
                      "TEST";

                    let typeClass =
                      "generic";


                    if (
                      routine
                    ) {
                      typeLabel =
                        "Routine Urinalysis";

                      typeClass =
                        "special";

                    } else if (
                      special
                    ) {
                      typeLabel =
                        specialResolution?.label ||
                        "SPECIAL";

                      typeClass =
                        "special";

                    } else if (
                      panel
                    ) {
                      typeLabel =
                        panelResolution?.label ||
                        "PANEL";

                      typeClass =
                        "panel";
                    }


                    return (
                      <button
                        type="button"
                        key={
                          test?._entryKey ||
                          `${getTestName(
                            test
                          )}-${index}`
                        }
                        className={`laboratory-result-entry__test-card ${
                          selected
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleSelectTest(
                            test
                          )
                        }
                        disabled={
                          initializingResult
                        }
                      >

                        <div className="laboratory-result-entry__test-card-icon">

                          {initializingResult &&
                          selected ? (

                            <Loader2
                              size={19}
                              className="laboratory-result-entry__spin"
                            />

                          ) : (

                            <FlaskConical
                              size={19}
                            />

                          )}

                        </div>


                        <div className="laboratory-result-entry__test-card-main">

                          <strong>
                            {
                              getTestName(
                                test
                              )
                            }
                          </strong>

                          {getPanelName(
                            test
                          ) && (
                            <span>
                              {
                                getPanelName(
                                  test
                                )
                              }
                            </span>
                          )}

                          <small>
                            {
                              getDepartment(
                                test
                              )
                            }
                          </small>

                        </div>


                        <div className="laboratory-result-entry__test-card-type">

                          <span
                            className={
                              typeClass ===
                              "special"
                                ? "special"
                                : typeClass ===
                                  "panel"
                                ? "panel"
                                : "generic"
                            }
                          >
                            {
                              typeLabel
                            }
                          </span>


                          <span
                            className={`laboratory-result-entry__registration-status laboratory-result-entry__registration-status--${getStatusClass(
                              getRegistrationTestStatus(
                                test
                              )
                            )}`}
                          >
                            {
                              getRegistrationTestStatus(
                                test
                              )
                            }
                          </span>

                        </div>


                        <ChevronRight
                          size={17}
                        />

                      </button>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </section>
      )}


      {/* ==================================================
          SELECTED RESULT ENTRY
         ================================================== */}

      {selectedTest && (
        <div
          className="laboratory-result-entry__result-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="laboratory-result-entry-modal-title"
        >
          <div
            className="laboratory-result-entry__result-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleSpecialCancel();
              }
            }}
          />

          <section
            id="laboratory-result-entry-form"
            className="laboratory-result-entry__form-section laboratory-result-entry__form-section--modal"
          >

          <div className="laboratory-result-entry__modal-topbar">
            <div className="laboratory-result-entry__modal-identity">
              <div className="laboratory-result-entry__modal-icon">
                <FlaskConical size={20} />
              </div>

              <div>
                <span>LABORATORY RESULT ENTRY</span>
                <strong id="laboratory-result-entry-modal-title">
                  {getTestName(selectedTest)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="laboratory-result-entry__modal-close"
              aria-label="Close result entry"
              title="Close result entry"
              onClick={handleSpecialCancel}
            >
              <X size={20} />
            </button>
          </div>

          <div className="laboratory-result-entry__modal-body">

            <SavedResultHydrator
              key={`saved-hydrator-${selectedRegistration?.id || "none"}-${selectedTest?._entryKey || selectedTest?.test_id || selectedTest?.id || getTestName(selectedTest) || "test"}-${selectedResult?.id || "none"}`}
              registration={selectedRegistration}
              test={selectedTest}
              result={selectedResult}
              onStateChange={setHydrationState}
              onHydrated={(hydrated) => {
                setSelectedResult((previous) => {
                  const a = [
                    previous?.id || "",
                    JSON.stringify(previous?.result ?? null),
                    previous?.result_status || "",
                  ].join("|");

                  const b = [
                    hydrated?.id || "",
                    JSON.stringify(hydrated?.result ?? null),
                    hydrated?.result_status || "",
                  ].join("|");

                  return a === b ? previous : hydrated;
                });

                const payload = hydrated?.result;

                if (
                  payload &&
                  typeof payload === "object" &&
                  !Array.isArray(payload)
                ) {
                  setPanelForm(payload);

                  if (isRoutineUrinalysis(selectedTest)) {
                    setUrinalysisData({
                      ...EMPTY_URINALYSIS_RESULT,
                      ...payload,
                    });
                  }
                }

                setSingleValue(getStoredResultValue(hydrated));
              }}
            />

            {!hydrationState.loading &&
              selectedTestIsPanel &&
              hydrationState.payloadFound &&
              panelParameters.length === 0 &&
              effectiveSavedPanelParameters.length > 0 && (
                <div className="pefa-saved-parameter-bridge">
                  <Database size={16} />
                  <div>
                    <strong>Saved result restored</strong>
                    <span>
                      {effectiveSavedPanelParameters.length} saved parameter
                      {effectiveSavedPanelParameters.length === 1 ? "" : "s"} loaded
                      directly from the saved laboratory result.
                    </span>
                  </div>
                </div>
              )}

            {hydrationState.loading && (
              <div className="pefa-hydration-loading">
                <Loader2 size={17} className="pefa-hydrator-spin" />
                Retrieving the last saved result…
              </div>
            )}
            {hydrationState.error && (
              <div className="pefa-hydration-error">
                <AlertCircle size={17} />
                <div>
                  <strong>Result hydration problem</strong>
                  <span>{hydrationState.error}</span>
                </div>
              </div>
            )}

          <div className="laboratory-result-entry__form-header">

            <div>

              <div className="laboratory-result-entry__section-eyebrow">
                RESULT ENTRY
              </div>

              <h2>
                {
                  getTestName(
                    selectedTest
                  )
                }
              </h2>

              <p>
                {
                  selectedRegistration?._patientName ||
                  "Patient"
                }{" "}
                •{" "}
                {
                  selectedRegistration?._labNumber ||
                  "No Lab Number"
                }
              </p>

            </div>


            <div className="laboratory-result-entry__form-mode">

              <span>
                ENTRY TYPE
              </span>

              <strong>
                {
                  entryModeLabel
                }
              </strong>

            </div>

          </div>


          {/* ==================================================
              RESULT ID GUARD
             ================================================== */}

          {!selectedResult &&
            !initializingResult && (
            <div className="laboratory-result-entry__message laboratory-result-entry__message--error">

              <AlertCircle
                size={18}
              />

              <span>
                No laboratory result
                record is available
                for this test. Please
                select the test again.
              </span>

            </div>
          )}


          {/* ==================================================
              BLOOD BANK — GROUPING & CROSSMATCHING
              --------------------------------------------------
              Dedicated structured route for the PEFA
              "Grouping & Cross Matching" test.
             ================================================== */}

          {selectedTestIsGroupingCrossMatching &&
          selectedResult ? (

            <div className="laboratory-result-entry__special-wrapper">

              <BloodGroupingCrossmatchingResultEntry
                key={`blood-bank-grouping-${selectedResult?.id || "new"}-${selectedTest?._entryKey || "test"}`}
                test={selectedTest}
                registration={selectedRegistration}
                patient={selectedRegistration}
                result={selectedResult}
                initialResult={selectedResult}
                existingResult={selectedResult}

                onSave={handleSpecialSaved}
                onSaved={handleSpecialSaved}
                onCancel={handleSpecialCancel}
                onBack={handleSpecialBack}

                readOnly={false}
                disabled={initializingResult}
                editMode={Boolean(selectedResult?.id)}
                saving={initializingResult}
              />

            </div>

          ) : null}


          {/* ==================================================
              SPECIAL RESULT RESOLVER
              --------------------------------------------------
              Routine Urinalysis is intentionally routed through
              the same authoritative special-test resolver as the
              other dedicated special result forms.

              This prevents LaboratoryResultEntry from maintaining
              a second Routine Urinalysis implementation.
             ================================================== */}

          {!selectedTestIsGroupingCrossMatching &&
          selectedTestIsSpecial &&
          selectedResult ? (

            <div className="laboratory-result-entry__special-wrapper">

              <SpecialLaboratoryResultEntryResolver
                key={`special-${selectedResult?.id || "new"}-${selectedTest?._entryKey || "test"}`}
                test={selectedTest}
                registration={selectedRegistration}
                patient={selectedRegistration}
                result={selectedResult}
                initialResult={selectedResult}
                existingResult={selectedResult}

                onSaved={handleSpecialSaved}
                onCancel={handleSpecialCancel}
                onBack={handleSpecialBack}

                readOnly={false}
                disabled={initializingResult}
                editMode={Boolean(selectedResult?.id)}
              />

            </div>

          ) : null}


          {/* ==================================================
              DEDICATED PANEL RESOLVER
              --------------------------------------------------
              This is now the central route for:

              HAEMATOLOGY
              CLINICAL CHEMISTRY
              ENDOCRINOLOGY
             ================================================== */}

          {!selectedTestIsRoutineUrinalysis &&
          !selectedTestIsSpecial &&
          selectedTestIsPanel &&
          selectedResult ? (

            <div className="laboratory-result-entry__panel-wrapper">

              <PanelLaboratoryResultEntryResolver
  key={`panel-${selectedResult?.id || "new"}-${selectedTest?._entryKey || "test"}`}

                test={
                  selectedTest
                }

                result={
                  selectedResult
                }

                initialResult={
                  selectedResult
                }

                existingResult={
                  selectedResult
                }

                registration={
                  selectedRegistration
                }

                patient={
                  selectedRegistration
                }

                parameters={
                  effectiveSavedPanelParameters
                }

                analytes={
                  effectiveSavedPanelParameters
                }

                parameterSource={
                  panelParameterSource
                }

                parameterLoading={
                  panelParameterLoading
                }

                parameterError={
                  panelParameterError
                }

                demographics={{
                  sex:
                    selectedRegistration?.sex ||
                    selectedRegistration?.gender ||
                    selectedRegistration?.patient?.sex ||
                    selectedRegistration?.patient?.gender ||
                    "",
                  age:
                    selectedRegistration?.age ??
                    selectedRegistration?.patient_age ??
                    selectedRegistration?.patient?.age ??
                    null,
                }}

                /*
                 * Live unsaved form changes.
                 */
                onChange={
                  handlePanelChange
                }

                /*
                 * Main persistence boundary.
                 */
                onSaved={
                  handlePanelSaved
                }

                /*
                 * Compatibility with panel forms
                 * exposing onSave.
                 */
                onSave={
                  handlePanelSave
                }

                onCancel={
                  handlePanelCancel
                }

                onBack={
                  handlePanelBack
                }

                readOnly={
                  false
                }

                disabled={
                  initializingResult ||
                  savingPanel
                }

                editMode={
                  Boolean(
                    selectedResult?.id
                  )
                }

              />

            </div>

          ) : null}


          {/* ==================================================
              QUANTITATIVE SINGLE TEST
              --------------------------------------------------
              Ordinary quantitative singles use the existing
              ChemistrySingleResultEntry component. This parent
              remains the persistence boundary.
             ================================================== */}

          {!selectedTestIsRoutineUrinalysis &&
          !selectedTestIsGroupingCrossMatching &&
          !selectedTestIsSpecial &&
          !selectedTestIsPanel &&
          selectedTestIsQuantitative &&
          selectedResult ? (

            <div className="laboratory-result-entry__panel-wrapper">

              <div
                style={{
                  marginBottom: "14px",
                  padding: "14px 16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap: "12px",
                }}
              >
                <div>
                  <small style={{ color: "#64748b" }}>
                    Result Type
                  </small>
                  <strong style={{ display: "block" }}>
                    {getResultType(selectedTest) ||
                      "Quantitative"}
                  </strong>
                </div>

                <div>
                  <small style={{ color: "#64748b" }}>
                    Unit
                  </small>
                  <strong style={{ display: "block" }}>
                    {getTestUnit(selectedTest) || "—"}
                  </strong>
                </div>

                <div>
                  <small style={{ color: "#64748b" }}>
                    Reference Range
                  </small>
                  <strong style={{ display: "block" }}>
                    {selectedReferenceRange ||
                      "Not configured"}
                  </strong>
                </div>

                <div>
                  <small style={{ color: "#64748b" }}>
                    Flag
                  </small>
                  <strong style={{ display: "block" }}>
                    {selectedSingleFlag || "—"}
                  </strong>
                </div>
              </div>

              <ChemistrySingleResultEntry
                key={`single-${selectedResult?.id || "new"}-${selectedTest?._entryKey || "test"}`}
                test={selectedTest}
                result={selectedSingleDisplayResult}
                initialResult={selectedResult}
                existingResult={selectedResult}
                registration={selectedRegistration}
                patient={selectedRegistration}
                grouped={false}
                editMode={isPreviouslySavedLaboratoryResult(selectedResult)}
                readOnly={false}
                disabled={
                  initializingResult ||
                  savingSingle
                }
                onResultChange={({ value }) => {
                  setSingleValue(value ?? "");
                }}
                onSaved={handleSingleSaved}
                onCancel={handlePanelCancel}
                onBack={handlePanelBack}
              />

            </div>

          ) : null}


          {/* ==================================================
              UNMAPPED SINGLE TEST
              --------------------------------------------------
              Panels should NEVER reach this block.

              If they do, the problem is in the panel
              resolver registry rather than persistence.
             ================================================== */}

          {!selectedTestIsRoutineUrinalysis &&
          !selectedTestIsGroupingCrossMatching &&
          !selectedTestIsSpecial &&
          !selectedTestIsPanel &&
          !selectedTestIsQuantitative &&
          selectedTest && (

            <div className="laboratory-result-entry__pending-router">

              <div className="laboratory-result-entry__pending-router-icon">

                <FlaskConical
                  size={30}
                />

              </div>


              <h3>
                Result Entry Form Pending
              </h3>


              <p>
                This registered test
                is currently classified
                as a single laboratory
                test but does not yet
                have a dedicated result
                entry form.
              </p>


              <div className="laboratory-result-entry__pending-test">

                <div>

                  <span>
                    Test
                  </span>

                  <strong>
                    {
                      getTestName(
                        selectedTest
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Type
                  </span>

                  <strong>
                    {
                      getTestType(
                        selectedTest
                      ) ||
                      "Not specified"
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Department
                  </span>

                  <strong>
                    {
                      getDepartment(
                        selectedTest
                      )
                    }
                  </strong>

                </div>

              </div>

            </div>

          )}

          </div>
        </section>
        </div>
      )}


      {pendingSave && (
        <div role="dialog" aria-modal="true" aria-labelledby="pefa-edit-reason-title" style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,.58)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "min(560px,100%)", background: "#fff", borderRadius: 16, boxShadow: "0 24px 70px rgba(15,23,42,.25)", overflow: "hidden" }}>
            <div style={{ padding: "20px 22px", borderBottom: "1px solid #e2e8f0", background: "#fff7ed" }}>
              <strong style={{ color: "#9a3412" }}>RESULT EDIT REQUIRES JUSTIFICATION</strong>
              <h2 id="pefa-edit-reason-title" style={{ margin: "8px 0 4px", color: "#0f172a" }}>Why is this result being changed?</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>A reason is required before an existing laboratory result can be modified. The reason and your staff identity will be added to the activity log.</p>
            </div>
            <div style={{ padding: 22 }}>
              <label htmlFor="pefa-result-edit-reason" style={{ display: "block", marginBottom: 7, fontWeight: 800 }}>Reason for Editing <span style={{ color: "#dc2626" }}>*</span></label>
              <textarea id="pefa-result-edit-reason" value={editReason} onChange={(e) => { setEditReason(e.target.value); if (editReasonError) setEditReasonError(""); }} placeholder="Enter the reason for changing this result..." rows={5} autoFocus disabled={savingPendingEdit} style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: 12, border: `1px solid ${editReasonError ? "#dc2626" : "#cbd5e1"}`, borderRadius: 10, fontFamily: "inherit", fontSize: 14 }} />
              {editReasonError && <div style={{ marginTop: 7, color: "#b91c1c", fontSize: 12, fontWeight: 700 }}>{editReasonError}</div>}
              <div style={{ marginTop: 12, padding: 11, borderRadius: 9, background: "#f8fafc", color: "#475569", fontSize: 12 }}>Editing staff: <strong>{currentStaff?.full_name || "—"}</strong>{currentStaff?.role ? ` • ${currentStaff.role}` : ""}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, padding: "14px 22px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <button type="button" onClick={handleCancelEditReason} disabled={savingPendingEdit} style={{ border: 0, borderRadius: 8, padding: "10px 17px", background: "#e2e8f0", fontWeight: 800 }}>Cancel</button>
              <button type="button" onClick={handleConfirmEditReason} disabled={savingPendingEdit || !text(editReason)} style={{ border: 0, borderRadius: 8, padding: "10px 18px", background: "#0f766e", color: "#fff", fontWeight: 800, opacity: savingPendingEdit || !text(editReason) ? .55 : 1 }}>{savingPendingEdit ? "Saving Edit…" : "Confirm & Update Result"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          FOOTER
         ================================================== */}

      <footer className="laboratory-result-entry__footer">

        <span>
          PEFA LAB • Laboratory Result Entry
        </span>

        <span>
          {selectedTest
            ? `Selected: ${getTestName(
                selectedTest
              )}`
            : "Select a registered test to begin result entry"}
        </span>

      </footer>

    </div>
  );
}