/*
 * ==========================================================
 * PEFA ENTERPRISE LIS
 * PrintSpecialLaboratoryResultEntryResolver.jsx
 * ==========================================================
 *
 * Resolves SPECIAL laboratory results to their dedicated
 * professional report renderer.
 *
 * These tests should NOT be forced into the generic chemistry
 * or quantitative table.
 *
 * Supported:
 *
 *   Widal
 *   Malaria Parasite
 *   Blood Culture
 *   Microbiology MCS
 *   Urinalysis
 *   Stool Analysis
 *   Seminal Fluid Analysis
 *   Drug Screening
 *   Grouping & Cross Matching
 *   Donor Screening
 *
 * ==========================================================
 */

import React from "react";

import PrintWidal from "./PrintWidal";
import PrintQualitative from "./PrintQualitative";

import PrintUrinalysis from "./PrintUrinalysis";
import PrintSFA from "./PrintSFA";

import PrintDrugScreen from "./PrintDrugScreen";

import PrintGroupingCrossMatch from "./PrintGroupingCrossMatch";

import PrintDonorScreening from "./PrintDonorScreening";

import PrintMicrobiologyMCS from "./PrintMicrobiologyMCS";
import PrintBloodCulture from "./PrintBloodCulture";

import PrintStoolAnalysis from "./PrintStoolAnalysis";

import PrintMalariaParasite from "./PrintMalariaParasite";

/* ==========================================================
   NORMALIZATION
   ========================================================== */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

/* ==========================================================
   TEST NAME
   ========================================================== */

const getTestName = (item = {}) =>
  normalize(
    item?.test_name ||
    item?.testName ||
    item?.test ||
    item?.name ||
    item?.parameter ||
    item?.parameter_name ||
    item?.parameterName ||
    item?.analyte ||
    item?.label
  );

/* ==========================================================
   TEMPLATE
   ========================================================== */

const getTemplateType = (item = {}) =>
  normalize(
    item?.template_type ||
    item?.templateType ||
    item?.template ||
    ""
  );

/* ==========================================================
   SPECIAL TEST DETECTION
   ========================================================== */

const isWidal = (
  testName,
  template
) =>
  testName === "widal" ||
  testName === "widal test" ||
  testName.includes("widal") ||
  template === "widal";

const isMalaria = (
  testName,
  template
) =>
  testName === "malaria parasite" ||
  testName === "malaria parasites" ||
  testName === "malaria microscopy" ||
  testName === "malaria parasite test" ||
  testName === "mp" ||
  testName.includes("malaria") ||
  template === "malaria parasite" ||
  template === "malaria";

const isUrinalysis = (
  testName,
  template
) =>
  testName === "urinalysis" ||
  testName === "urine analysis" ||
  testName === "routine urinalysis" ||
  testName === "routine urine analysis" ||
  template === "urinalysis" ||
  template === "urine analysis";

const isStoolAnalysis = (
  testName,
  template
) =>
  testName === "stool analysis" ||
  testName === "stool examination" ||
  testName === "stool microscopy" ||
  testName === "stool routine examination" ||
  testName.includes("stool") ||
  template === "stool analysis";

const isSFA = (
  testName,
  template
) =>
  testName === "sfa" ||
  testName.includes("seminal") ||
  testName.includes("semen") ||
  template === "sfa" ||
  template === "semen analysis";

const isDrugScreen = (
  testName,
  template
) =>
  testName.includes("drug") ||
  testName.includes("toxicology") ||
  template === "drug screen" ||
  template === "drug_screen";

const isGroupingCrossMatch = (
  testName,
  template
) =>
  testName.includes("crossmatch") ||
  testName.includes("cross match") ||
  (
    testName.includes("grouping") &&
    testName.includes("cross")
  ) ||
  template === "crossmatch" ||
  template === "grouping crossmatch";

const isDonorScreening = (
  testName,
  template
) =>
  testName.includes("donor") ||
  template === "donor screening";

const isBloodCulture = (
  testName,
  template
) =>
  testName === "blood culture" ||
  testName.includes("blood culture") ||
  testName.includes("bloodculture") ||
  template === "blood culture" ||
  template === "bloodculture";

const isMCS = (
  testName,
  template
) =>
  testName === "mcs" ||
  testName.includes("culture sensitivity") ||
  testName.includes(
    "culture and sensitivity"
  ) ||
  testName.includes(
    "microbiology culture"
  ) ||
  testName.includes("sensitivity") ||
  template === "mcs" ||
  template === "culture sensitivity";

/* ==========================================================
   RESOLVE
   ========================================================== */

const resolveSpecialRenderer = ({
  results,
}) => {
  const first =
    results?.[0] || {};

  const testName =
    getTestName(first);

  const template =
    getTemplateType(first);

  if (
    isBloodCulture(
      testName,
      template
    )
  ) {
    return {
      name: "blood-culture",
      Component:
        PrintBloodCulture,
    };
  }

  if (
    isMalaria(
      testName,
      template
    )
  ) {
    return {
      name: "malaria",
      Component:
        PrintMalariaParasite,
    };
  }

  if (
    isWidal(
      testName,
      template
    )
  ) {
    return {
      name: "widal",
      Component:
        PrintWidal,
    };
  }

  if (
    isGroupingCrossMatch(
      testName,
      template
    )
  ) {
    return {
      name: "grouping-crossmatch",
      Component:
        PrintGroupingCrossMatch,
    };
  }

  if (
    isDonorScreening(
      testName,
      template
    )
  ) {
    return {
      name: "donor-screening",
      Component:
        PrintDonorScreening,
    };
  }

  if (
    isUrinalysis(
      testName,
      template
    )
  ) {
    return {
      name: "urinalysis",
      Component:
        PrintUrinalysis,
    };
  }

  if (
    isStoolAnalysis(
      testName,
      template
    )
  ) {
    return {
      name: "stool-analysis",
      Component:
        PrintStoolAnalysis,
    };
  }

  if (
    isSFA(
      testName,
      template
    )
  ) {
    return {
      name: "sfa",
      Component:
        PrintSFA,
    };
  }

  if (
    isDrugScreen(
      testName,
      template
    )
  ) {
    return {
      name: "drug-screen",
      Component:
        PrintDrugScreen,
    };
  }

  if (
    isMCS(
      testName,
      template
    )
  ) {
    return {
      name: "microbiology-mcs",
      Component:
        PrintMicrobiologyMCS,
    };
  }

  return null;
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function PrintSpecialLaboratoryResultEntryResolver({
  results = [],
  patient = {},
  printMode = "internal",

  /*
   * Optional explicit template override.
   */
  forceTemplate = "",
}) {
  if (
    !Array.isArray(results) ||
    results.length === 0
  ) {
    return null;
  }

  let resolved = null;

  if (forceTemplate) {
    const forced =
      normalize(
        forceTemplate
      );

    const forcedMap = {
      widal: PrintWidal,

      malaria:
        PrintMalariaParasite,

      "malaria parasite":
        PrintMalariaParasite,

      urinalysis:
        PrintUrinalysis,

      "urine analysis":
        PrintUrinalysis,

      stool:
        PrintStoolAnalysis,

      "stool analysis":
        PrintStoolAnalysis,

      sfa:
        PrintSFA,

      "semen analysis":
        PrintSFA,

      "drug screen":
        PrintDrugScreen,

      drug_screen:
        PrintDrugScreen,

      crossmatch:
        PrintGroupingCrossMatch,

      "grouping crossmatch":
        PrintGroupingCrossMatch,

      "donor screening":
        PrintDonorScreening,

      "blood culture":
        PrintBloodCulture,

      bloodculture:
        PrintBloodCulture,

      mcs:
        PrintMicrobiologyMCS,

      "culture sensitivity":
        PrintMicrobiologyMCS,
    };

    if (
      forcedMap[forced]
    ) {
      resolved = {
        name: forced,
        Component:
          forcedMap[forced],
      };
    }
  }

  if (!resolved) {
    resolved =
      resolveSpecialRenderer({
        results,
      });
  }

  if (!resolved) {
    return null;
  }

  console.log(
    "[PrintSpecialLaboratoryResultEntryResolver] →",
    resolved.name
  );

  const Component =
    resolved.Component;

  return (
    <Component
      results={results}
      patient={patient}
      printMode={printMode}
    />
  );
}