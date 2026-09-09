import React, { useMemo } from "react";

/**
 * SPECIAL LABORATORY PRINT RESOLVER
 *
 * Existing specialized renderers remain the actual visual forms:
 * Widal, Qualitative, Urinalysis, SFA, Drug Screen, Blood Bank,
 * Microbiology MCS, Blood Culture, Stool Analysis and MP.
 *
 * This resolver only identifies the renderer and preserves the
 * existing results/patient/printMode contract.
 */

import PrintWidal from "../PrintWidal";
import PrintQualitative from "../PrintQualitative";
import PrintUrinalysis from "../PrintUrinalysis";
import PrintSFA from "../PrintSFA";
import PrintDrugScreen from "../PrintDrugScreen";
import PrintGroupingCrossMatch from "../PrintGroupingCrossMatch";
import PrintDonorScreening from "../PrintDonorScreening";
import PrintMicrobiologyMCS from "../PrintMicrobiologyMCS";
import PrintBloodCulture from "../PrintBloodCulture";
import PrintStoolAnalysis from "../PrintStoolAnalysis";
import PrintMalariaParasite from "../PrintMalariaParasite";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const firstValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && !value.trim()) continue;
    return value;
  }
  return "";
};

const getName = (row = {}) =>
  firstValue(
    row?.test_name,
    row?.testName,
    row?.panel_name,
    row?.panelName,
    row?.name,
    row?.test_type,
    ""
  );

const getTemplate = (row = {}) =>
  firstValue(
    row?.template_type,
    row?.templateType,
    row?.result_template,
    row?.resultTemplate,
    ""
  );

const SPECIAL_REGISTRY = [
  {
    key: "widal",
    matches: (name, template) =>
      name.includes("widal") || template.includes("widal"),
    Component: PrintWidal,
  },
  {
    key: "malaria_parasite",
    matches: (name, template) =>
      name === "mp" ||
      name.includes("malaria parasite") ||
      name.includes("malaria microscopy") ||
      template.includes("malaria_parasite"),
    Component: PrintMalariaParasite,
  },
  {
    key: "blood_culture",
    matches: (name, template) =>
      name.includes("blood culture") ||
      name.includes("bloodculture") ||
      template.includes("blood_culture"),
    Component: PrintBloodCulture,
  },
  {
    key: "stool_analysis",
    matches: (name) =>
      name.includes("stool analysis") ||
      name.includes("stool examination") ||
      name.includes("stool mcs"),
    Component: PrintStoolAnalysis,
  },
  {
    key: "sfa",
    matches: (name) =>
      name === "sfa" ||
      name.includes("seminal fluid") ||
      name.includes("semen analysis") ||
      name.includes("semen examination"),
    Component: PrintSFA,
  },
  {
    key: "urinalysis",
    matches: (name) =>
      name.includes("urinalysis") ||
      name.includes("routine urine examination"),
    Component: PrintUrinalysis,
  },
  {
    key: "drug_screen",
    matches: (name, template) =>
      name.includes("drug screen") ||
      name.includes("drug screening") ||
      name.includes("drug panel") ||
      name.includes("toxicology") ||
      template.includes("drug"),
    Component: PrintDrugScreen,
  },
  {
    key: "donor_screening",
    matches: (name) =>
      name.includes("donor screening") ||
      name.includes("blood donor screening"),
    Component: PrintDonorScreening,
  },
  {
    key: "grouping_crossmatch",
    matches: (name) =>
      name.includes("crossmatch") ||
      name.includes("cross match") ||
      name.includes("grouping"),
    Component: PrintGroupingCrossMatch,
  },
  {
    key: "microbiology_mcs",
    matches: (name, template) =>
      name.includes("mcs") ||
      name.includes("microscopy culture sensitivity") ||
      name.includes("culture and sensitivity") ||
      template.includes("mcs"),
    Component: PrintMicrobiologyMCS,
  },
  {
    key: "qualitative",
    matches: (name, template) => {
      const known = [
        "hbsag", "hepatitis b surface antigen",
        "hcv", "hepatitis c",
        "hiv", "hiv 1 & 2", "hiv 1 and 2",
        "vdrl", "rpr", "syphilis",
        "pregnancy test", "pregnancy",
        "beta hcg", "hcg",
        "aso", "crp", "rheumatoid factor",
        "rf", "genotype",
      ];

      return (
        template.includes("qualitative") ||
        template.includes("rapid") ||
        known.some((item) => name === item || name.includes(item))
      );
    },
    Component: PrintQualitative,
  },
];

export function resolvePrintSpecial(test) {
  const name = normalize(getName(test));
  const template = normalize(getTemplate(test));

  const definition = SPECIAL_REGISTRY.find((item) =>
    item.matches(name, template)
  );

  return {
    isSpecial: Boolean(definition),
    key: definition?.key || null,
    Component: definition?.Component || null,
    test,
  };
}

export function isPrintSpecial(test) {
  return resolvePrintSpecial(test).isSpecial;
}

export default function PrintSpecialLaboratoryResultEntryResolver({
  test,
  results = [],
  patient = {},
  printMode = "internal",
  ...rest
}) {
  const resolved = useMemo(
    () => resolvePrintSpecial(test || results?.[0] || {}),
    [test, results]
  );

  if (!resolved.isSpecial || !resolved.Component) return null;

  const Component = resolved.Component;

  return (
    <div className="pefa-print-atomic-special">
      <Component
        results={results}
        patient={patient}
        printMode={printMode}
        test={test}
        {...rest}
      />
    </div>
  );
}

export { SPECIAL_REGISTRY, normalize, getName, getTemplate };
