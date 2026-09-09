import React, { useMemo } from "react";
import PrintPanelResult from "../PrintPanelResult";

/**
 * PANEL PRINT RESOLVER
 *
 * Uses the same panel identity vocabulary as the laboratory result-entry
 * resolver. It does not query Supabase or alter the result payload.
 *
 * Every recognized panel is returned as an atomic print page.
 */

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

const getName = (test = {}) =>
  firstValue(
    test?.panel_name,
    test?.panelName,
    test?.test_name,
    test?.testName,
    test?.name,
    test?.test_type,
    ""
  );

const getDepartment = (test = {}) =>
  firstValue(
    test?.department,
    test?.department_name,
    test?.departmentName,
    ""
  );

const getTemplate = (test = {}) =>
  firstValue(
    test?.template_type,
    test?.templateType,
    test?.result_template,
    test?.resultTemplate,
    ""
  );

const PANEL_REGISTRY = [
  { key: "lft", matches: ["lft", "liver function test", "liver function profile", "liver profile"] },
  { key: "rft", matches: ["rft", "kft", "renal function test", "renal function profile", "renal profile"] },
  { key: "flp", matches: ["flp", "lipid profile", "lipid panel", "full lipid profile"] },
  { key: "cbc", matches: ["cbc", "fbc", "full blood count", "complete blood count"] },
  { key: "coagulation_profile", matches: ["coagulation profile", "coagulation panel", "clotting profile", "clotting screen"] },
  { key: "iron_profile", matches: ["iron profile", "iron studies", "iron panel"] },
  { key: "serum_electrolytes", matches: ["serum electrolytes", "electrolyte profile", "electrolyte panel", "urea and electrolytes", "urea & electrolytes"] },
  { key: "serum_bilirubin", matches: ["serum bilirubin", "bilirubin profile", "bilirubin panel", "total and direct bilirubin"] },
  { key: "serum_calcium", matches: ["serum calcium", "calcium profile", "calcium panel"] },
  { key: "free_tft", matches: ["free tft", "free thyroid function test", "free thyroid profile"] },
  { key: "total_tft", matches: ["total tft", "total thyroid function test", "total thyroid profile"] },
  { key: "thyroid", matches: ["thyroid panel", "thyroid profile", "thyroid function panel"] },
  { key: "female_hormonal_day_3", matches: ["female hormonal profile day 3", "female hormone profile day 3"] },
  { key: "female_hormonal_day_21", matches: ["female hormonal profile day 21", "female hormone profile day 21"] },
  { key: "full_female_hormonal_profile", matches: ["full female hormonal profile", "complete female hormonal profile"] },
  { key: "male_hormonal_profile", matches: ["male hormonal profile", "male hormone profile", "male fertility profile"] },
  { key: "fertility_hormonal_profile", matches: ["fertility hormonal profile", "fertility hormone profile"] },
  { key: "adrenal", matches: ["adrenal panel", "adrenal hormonal panel", "adrenal hormone profile"] },
  { key: "pituitary", matches: ["pituitary panel", "pituitary hormonal panel", "pituitary hormone profile"] },
  { key: "pancreatic_endocrine", matches: ["pancreatic endocrine panel", "pancreatic endocrine profile"] },
  { key: "pregnancy_endocrine", matches: ["pregnancy endocrine panel", "pregnancy hormonal profile", "pregnancy hormone profile"] },
];

const findDefinition = (test) => {
  const name = normalize(getName(test));
  const template = normalize(getTemplate(test));

  return (
    PANEL_REGISTRY.find((item) =>
      item.matches.some((pattern) => {
        const p = normalize(pattern);
        return name === p || name.includes(p) || template === p;
      })
    ) || null
  );
};

export function resolvePrintPanel(test) {
  const definition = findDefinition(test);

  return {
    isPanel: Boolean(definition),
    key: definition?.key || null,
    panelName: getName(test),
    department: getDepartment(test),
    Component: definition ? PrintPanelResult : null,
    test,
  };
}

export function isPrintPanel(test) {
  return resolvePrintPanel(test).isPanel;
}

export default function PrintPanelLaboratoryResultEntryResolver({
  test,
  results = [],
  patient = {},
  department = "",
  ...rest
}) {
  const resolved = useMemo(
    () => resolvePrintPanel(test || results?.[0] || {}),
    [test, results]
  );

  if (!resolved.isPanel || !resolved.Component) return null;

  const Component = resolved.Component;

  return (
    <Component
      results={results}
      patient={patient}
      department={department || resolved.department}
      panelName={resolved.panelName}
      panelKey={resolved.key}
      test={test}
      {...rest}
    />
  );
}

export { PANEL_REGISTRY, normalize, getName, getDepartment, getTemplate };
