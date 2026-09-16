/* ==========================================================
   PEFA LAB
   SPECIAL LABORATORY RESULT ENTRY RESOLVER
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/resolver/SpecialLaboratoryResultEntryResolver.jsx

   PURPOSE:
   - Resolve registered special laboratory tests.
   - Route special tests to dedicated result-entry forms.
   - Keep special-test routing OUT of LaboratoryResultEntry.jsx.
   - Never query Supabase.
   - Never save directly to Supabase.
   - Pass the authoritative laboratory result record
     to the dedicated result-entry component.

   IMPORTANT QUALITATIVE RULE:
   ----------------------------------------------------------
   Qualitative tests such as:

      HBsAg
      HIV 1 & 2
      HCV
      VDRL
      Pregnancy Test
      Syphilis
      etc.

   are routed directly to QualitativeResultEntry.

   LaboratoryResultEntry.jsx MUST NOT attempt to resolve
   their master test before this resolver is used.

   SAVE / EDIT:
   ----------------------------------------------------------
   The dedicated component manages its UI state.

   Actual database persistence remains controlled by the
   parent through onSaved / onChange / supplied callbacks.

   ========================================================== */

import React, { useMemo } from "react";

/* ==========================================================
   SPECIAL RESULT ENTRY COMPONENTS
   ========================================================== */

import ABOBloodGroupResultEntry from "../special/ABOBloodGroupResultEntry";
import RoutineUrinalysisResultEntry from "../special/RoutineUrinalysisResultEntry";
import MalariaParasiteResultEntry from "../special/MalariaParasiteResultEntry";
import MCSResultEntry from "../special/MCSResultEntry";
import BloodCultureResultEntry from "../special/BloodCultureResultEntry";
import SFAResultEntry from "../special/SFAResultEntry";
import DonorScreeningResultEntry from "../special/DonorScreeningResultEntry";
import StoolMCSResultEntry from "../special/StoolMCSResultEntry";
import WidalResultEntry from "../special/WidalResultEntry";
import DrugPanelResultEntry from "../special/DrugPanelResultEntry";
import HepatitisBPanelResultEntry from "../special/HepatitisBPanelResultEntry";
import QualitativeResultEntry from "../special/QualitativeResultEntry";
import BloodGroupingCrossmatchingResultEntry from "../special/BloodGroupingCrossmatchingResultEntry";

/* ==========================================================
   TEXT HELPERS
   ========================================================== */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/* ==========================================================
   TEST NAME RESOLUTION
   ========================================================== */

const getTestName = (test) =>
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
  "";

/* ==========================================================
   PANEL NAME RESOLUTION
   ========================================================== */

const getPanelName = (test) =>
  test?.panel_name ||
  test?.panelName ||
  test?.masterTest?.panel_name ||
  test?.master_test?.panel_name ||
  "";

/* ==========================================================
   TEST TYPE RESOLUTION
   ========================================================== */

const getTestType = (test) =>
  normalizeText(
    test?.test_type ||
      test?.testType ||
      test?.result_type ||
      test?.resultType ||
      test?.type ||
      test?.masterTest?.test_type ||
      test?.master_test?.test_type ||
      test?.masterTest?.result_type ||
      test?.master_test?.result_type ||
      ""
  );

/* ==========================================================
   RESULT TYPE RESOLUTION
   ========================================================== */

const getResultType = (test) =>
  normalizeText(
    test?.result_type ||
      test?.resultType ||
      test?.masterTest?.result_type ||
      test?.master_test?.result_type ||
      ""
  );

/* ==========================================================
   CANONICAL TEST NAME
   ========================================================== */

const canonicalTestName = (test) =>
  normalizeText(
    [
      getTestName(test),
      getPanelName(test),
    ]
      .filter(Boolean)
      .join(" ")
  );

/* ==========================================================
   QUALITATIVE IDENTITY HELPERS
   ========================================================== */

/*
 * These explicit names are intentionally included because
 * many qualitative tests are registered as ordinary tests
 * rather than having the literal word "qualitative" in their
 * name.
 */

const QUALITATIVE_NAME_PATTERNS = [
  "hbsag",
  "hepatitis b surface antigen",
  "hepatitis b surface antigen (hbsag)",

  "hiv",
  "hiv 1",
  "hiv 2",
  "hiv 1 & 2",
  "hiv 1 and 2",
  "hiv 1/2",
  "hiv screening",
  "hiv screening test",

  "hcv",
  "hepatitis c",
  "hepatitis c antibody",
  "anti-hcv",

  "vdrl",
  "rpr",
  "syphilis",

  "pregnancy test",
  "pregnancy",
  "beta hcg",
  "β-hcg",
  "hcg",

  "aso",
  "aso titre",
  "aso titer",

  "rf",
  "rheumatoid factor",

  "malaria rapid",
  "malaria rapid test",
  "malaria rapid diagnostic test",
  "malaria rdt",
  "malaria rpd",

  "typhoid rapid",
  "typhoid rapid test",

  "dengue",
  "dengue ns1",
  "dengue igg",
  "dengue igm",

  "covid",
  "covid-19",
  "covid 19",
  "sars-cov-2",

  "rotavirus",
  "adenovirus",

  "h pylori",
  "h. pylori",
  "helicobacter pylori",

  "occult blood",
  "faecal occult blood",
  "fecal occult blood",

  "strep a",
  "streptococcus pyogenes",

  "toxoplasma",
  "rubella",
  "cmv",

  "torch",

  "antigen",
  "antibody",
];

const isExplicitQuantitativeIdentity = (test) => {
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

const isExplicitQualitativeTest = (test, name) => {
  if (isExplicitQuantitativeIdentity(test)) return false;

  const resultType = getResultType(test);
  const testType = getTestType(test);

  /*
   * Strong metadata signals.
   */
  if (
    resultType.includes("qualitative") ||
    resultType.includes("qual") ||
    testType.includes("qualitative") ||
    testType.includes("qual")
  ) {
    return true;
  }

  /*
   * Explicit registration naming.
   */
  if (
    name.includes("qualitative") ||
    name.includes("qualitative test") ||
    name.includes("rapid test") ||
    name.includes("rapid diagnostic test") ||
    name.includes("rapid diagnostic") ||
    name.includes(" rdt") ||
    name.endsWith(" rdt") ||
    name.includes(" rpd") ||
    name.endsWith(" rpd")
  ) {
    return true;
  }

  /*
   * Exact / strong known qualitative identities.
   */
  return QUALITATIVE_NAME_PATTERNS.some(
    (pattern) =>
      name === pattern ||
      name.includes(pattern)
  );
};

/* ==========================================================
   SPECIAL TEST REGISTRY
   ----------------------------------------------------------
   Specific matches MUST come before broad matches.
   ========================================================== */

const SPECIAL_TESTS = [
  /* ========================================================
     BLOOD GROUPING & CROSSMATCHING
     --------------------------------------------------------
     Database metadata may classify this as Single/Text, but it
     has a dedicated structured Blood Bank result-entry form.
     This MUST be resolved before generic Blood Group matching.
     ======================================================== */

  {
    key: "blood_grouping_crossmatching",
    label: "Blood Grouping & Crossmatching",

    matches: (name) =>
      name === "grouping & cross matching" ||
      name === "grouping and cross matching" ||
      name === "grouping cross matching" ||
      name === "blood grouping & cross matching" ||
      name === "blood grouping and cross matching" ||
      name === "blood grouping cross matching" ||
      name.includes("grouping & cross matching") ||
      name.includes("grouping and cross matching"),

    Component: BloodGroupingCrossmatchingResultEntry,
  },

  /* ========================================================
     ABO BLOOD GROUP & RHESUS
     ======================================================== */

  {
    key: "abo_blood_group_rhesus",
    label: "ABO Blood Group & Rhesus Factor",

    matches: (name) =>
      name === "blood group" ||
      name.includes("blood group") ||
      name.includes("abo blood group") ||
      name.includes("abo group") ||
      name.includes("blood group and rhesus") ||
      name.includes("blood group & rhesus") ||
      name.includes("blood group rhesus") ||
      name.includes("abo & rhesus") ||
      name.includes("abo rhesus") ||
      name.includes("abo blood grouping") ||
      name.includes("blood grouping rhesus"),

    Component: ABOBloodGroupResultEntry,
  },

  /* ========================================================
     ROUTINE URINALYSIS
     ======================================================== */

  {
    key: "routine_urinalysis",
    label: "Routine Urinalysis",

    matches: (name) =>
      name === "routine urinalysis" ||
      name.includes("routine urinalysis") ||
      name.includes("urinalysis") ||
      name.includes("urine routine examination") ||
      name.includes("routine urine examination"),

    Component: RoutineUrinalysisResultEntry,
  },

  /* ========================================================
     MALARIA PARASITE — MICROSCOPY
     ======================================================== */

  {
    key: "malaria_parasite",
    label: "Malaria Parasite — Microscopy",

    matches: (name) =>
      (
        name.includes("malaria parasite") ||
        name.includes("malaria microscopy") ||
        name.includes("mp microscopy") ||
        name === "mp"
      ) &&
      !name.includes("rapid") &&
      !name.includes("rdt") &&
      !name.includes("rpd"),

    Component: MalariaParasiteResultEntry,
  },

  /* ========================================================
     BLOOD CULTURE
     ======================================================== */

  {
    key: "blood_culture",
    label: "Blood Culture",

    matches: (name) =>
      name.includes("blood culture") ||
      name.includes("blood culture mcs") ||
      name.includes("blood culture & sensitivity") ||
      name.includes("blood culture and sensitivity"),

    Component: BloodCultureResultEntry,
  },

  /* ========================================================
     STOOL MCS
     --------------------------------------------------------
     MUST COME BEFORE GENERIC MCS.
     ======================================================== */

  {
    key: "stool_mcs",
    label: "Stool MCS",

    matches: (name) =>
      name.includes("stool mcs") ||
      name.includes(
        "stool microscopy culture sensitivity"
      ) ||
      name.includes(
        "stool microscopy, culture and sensitivity"
      ) ||
      name.includes(
        "stool microscopy culture & sensitivity"
      ),

    Component: StoolMCSResultEntry,
  },

  /* ========================================================
     HIGH VAGINAL SWAB — CULTURE & SENSITIVITY
     --------------------------------------------------------
     This must be treated as a dedicated Microbiology MCS form
     even when the registration metadata incorrectly says
     Quantitative or lacks a result_type.
     ======================================================== */

  {
    key: "high_vaginal_swab_mcs",
    label: "High Vaginal Swab Culture & Sensitivity",

    matches: (name) =>
      name.includes("high vaginal swab") ||
      name.includes("hvs cs") ||
      name.includes("hvs-cs") ||
      (
        name.includes("vaginal swab") &&
        (
          name.includes("culture") ||
          name.includes("sensitivity") ||
          name.includes("mcs")
        )
      ),

    Component: MCSResultEntry,
  },

  /* ========================================================
     GENERIC MCS
     ======================================================== */

  {
    key: "mcs",
    label: "MCS",

    matches: (name) =>
      name.includes("urine mcs") ||
      name.includes("urinalysis mcs") ||
      name.includes("mcs") ||
      name.includes(
        "microscopy culture sensitivity"
      ) ||
      name.includes(
        "microscopy, culture and sensitivity"
      ) ||
      name.includes("culture and sensitivity"),

    Component: MCSResultEntry,
  },

  /* ========================================================
     SEMINAL FLUID ANALYSIS
     ======================================================== */

  {
    key: "sfa",
    label: "Seminal Fluid Analysis",

    matches: (name) =>
      name.includes("seminal fluid analysis") ||
      name.includes("seminal fluid") ||
      name.includes("semen analysis") ||
      name.includes("semen examination") ||
      name === "sfa",

    Component: SFAResultEntry,
  },

  /* ========================================================
     DONOR SCREENING
     ======================================================== */

  {
    key: "donor_screening",
    label: "Donor Screening",

    matches: (name) =>
      name.includes("donor screening") ||
      name.includes("blood donor screening") ||
      name.includes("donor screen"),

    Component: DonorScreeningResultEntry,
  },

  /* ========================================================
     WIDAL
     ======================================================== */

  {
    key: "widal",
    label: "Widal",

    matches: (name) =>
      name.includes("widal") ||
      name.includes("widal test") ||
      name.includes("widal reaction"),

    Component: WidalResultEntry,
  },

  /* ========================================================
     DRUG PANEL / TOXICOLOGY
     ======================================================== */

  {
    key: "drug_panel",
    label: "Drug Panel / Toxicology",

    matches: (name) =>
      name.includes("drug panel") ||
      name.includes("drug screen") ||
      name.includes("drug screening") ||
      name.includes("toxicology") ||
      name.includes("toxicology panel") ||
      name.includes("drugs of abuse") ||
      name.includes("drug abuse screen"),

    Component: DrugPanelResultEntry,
  },

  /* ========================================================
     HEPATITIS B PANEL
     --------------------------------------------------------
     This is deliberately BEFORE generic qualitative routing.
     ======================================================== */

  {
    key: "hepatitis_b_panel",
    label: "Hepatitis B Panel",

    matches: (name) =>
      name.includes("hepatitis b panel") ||
      name.includes("hepatitis b profile") ||
      name.includes(
        "hepatitis b screening panel"
      ) ||
      name.includes("hepatitis b screen") ||
      name.includes("hbv panel") ||
      name.includes("hbv profile"),

    Component: HepatitisBPanelResultEntry,
  },

  /* ========================================================
     QUALITATIVE TEST
     --------------------------------------------------------
     This MUST remain near the bottom.

     It catches:
       HBsAg
       HIV 1 & 2
       HCV
       VDRL
       Pregnancy Test
       etc.

     It does NOT query master_tests.
     ======================================================== */

  {
    key: "qualitative",
    label: "Qualitative Test",

    matches: (name, test) =>
      isExplicitQualitativeTest(test, name),

    Component: QualitativeResultEntry,
  },
];

/* ==========================================================
   RESOLVER
   ========================================================== */

export function resolveSpecialLaboratoryResultEntry(test) {
  const primaryName = normalizeText(getTestName(test));
  const panelName = normalizeText(getPanelName(test));
  const name = canonicalTestName(test);

  if (!name) {
    return {
      isSpecial: false,
      key: null,
      label: null,
      Component: null,
      test,
      canonicalName: "",
    };
  }

  /*
   * Quantitative identities always escape the special resolver.
   */
  if (isExplicitQuantitativeIdentity(test)) {
    return {
      isSpecial: false,
      key: null,
      label: null,
      Component: null,
      test,
      canonicalName: name,
    };
  }

  /*
   * Resolve special tests from the PRIMARY test name first.
   * This prevents a child such as HBsAg carrying panel_name =
   * "Hepatitis B Panel" from being hijacked by the panel route.
   */
  const primaryDefinition = SPECIAL_TESTS.find((item) =>
    item.matches(primaryName, test)
  );

  const definition =
    primaryDefinition ||
    (panelName
      ? SPECIAL_TESTS.find((item) => item.matches(panelName, test))
      : null) ||
    SPECIAL_TESTS.find((item) => item.matches(name, test));

  if (!definition) {
    return {
      isSpecial: false,
      key: null,
      label: null,
      Component: null,
      test,
      canonicalName: name,
    };
  }

  return {
    isSpecial: true,
    key: definition.key,
    label: definition.label,
    Component: definition.Component,
    test,
    canonicalName: name,
  };
}

/* ==========================================================
   PUBLIC HELPERS
   ========================================================== */

export function getSpecialLaboratoryResultEntryType(test) {
  return resolveSpecialLaboratoryResultEntry(test).key;
}

export function isSpecialLaboratoryResultEntry(test) {
  return resolveSpecialLaboratoryResultEntry(test).isSpecial;
}

/* ==========================================================
   MAIN RESOLVER COMPONENT
   ========================================================== */

export default function SpecialLaboratoryResultEntryResolver({
  test,
  result,
  registration,
  patient,

  /*
   * Parent persistence callback.
   */
  onSaved,

  /*
   * Parent change callback.
   */
  onChange,

  onCancel,
  onBack,

  /*
   * Existing result is read-only initially.
   * The dedicated form can enter Edit Mode.
   */
  readOnly = false,

  disabled = false,

  /*
   * Optional explicit edit state.
   */
  editMode = false,

  ...rest
}) {
  const resolved = useMemo(
    () =>
      resolveSpecialLaboratoryResultEntry(test),
    [test]
  );

  if (
    !resolved.isSpecial ||
    !resolved.Component
  ) {
    return null;
  }

  const Component = resolved.Component;

  /*
   * IMPORTANT COMPATIBILITY BRIDGE
   * --------------------------------------------------------
   * Most special result forms use the modern:
   *     result / onChange / onSaved
   * contract.
   *
   * MalariaParasiteResultEntry historically uses:
   *     resultData / setResultData / onSave
   *
   * The dashboard review therefore supplies BOTH contracts.
   * The saved laboratory_results.result object is passed directly
   * to resultData so the malaria form opens with the actual saved
   * values instead of an empty form.
   */
  const savedResultValue =
    result?.result &&
    typeof result.result === "object" &&
    !Array.isArray(result.result)
      ? result.result
      : {};

  const handleLegacyChange = (nextValue) => {
    if (typeof onChange === "function") {
      onChange(nextValue);
    }
  };

  const handleLegacySave = (nextValue) => {
    if (typeof onSaved === "function") {
      onSaved(nextValue);
    }
  };

  return (
    <Component
      test={test}
      result={result}
      resultData={savedResultValue}
      setResultData={handleLegacyChange}
      registration={registration}
      patient={patient}
      onSaved={onSaved}
      onChange={onChange}
      onSave={handleLegacySave}
      onCancel={onCancel}
      onBack={onBack}
      readOnly={readOnly}
      disabled={disabled}
      editMode={editMode}
      {...rest}
    />
  );
}

/* ==========================================================
   PUBLIC REGISTRY
   ========================================================== */

export {
  SPECIAL_TESTS,
  canonicalTestName,
  getTestName,
  getPanelName,
  getTestType,
  getResultType,
};
