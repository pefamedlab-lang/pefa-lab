/*
 * ==========================================================
 * PEFA ENTERPRISE LIS
 * PrintPanelLaboratoryResultEntryResolver.jsx
 * ==========================================================
 *
 * PURPOSE
 * ----------------------------------------------------------
 * Resolves PANEL / PROFILE laboratory results to the correct
 * specialized print renderer.
 *
 * This component does NOT:
 *   - modify Supabase payloads
 *   - calculate laboratory results
 *   - calculate reference ranges
 *   - change flags
 *   - save results
 *
 * It only decides WHICH PANEL RENDERER should print the result.
 *
 * Current supported panel families:
 *
 *   Chemistry
 *     - LFT
 *     - RFT / KFT
 *     - FLP
 *     - EUC
 *     - Chemistry profiles
 *
 *   Haematology
 *     - FBC / CBC
 *     - Coagulation
 *     - CD4
 *
 *   Endocrinology
 *     - TFT
 *     - Hormonal profiles
 *
 * ==========================================================
 */

import React from "react";

import PrintChemistryTable from "./PrintChemistryTable";

import PrintEndocrinologyPanel from "./PrintEndocrinologyPanel";

import PrintHaematology from "./PrintHaematology";

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
   PANEL NAME
   ========================================================== */

const getPanelName = (panel = {}, results = []) => {
  const direct =
    panel?.panelName ||
    panel?.panel_name ||
    panel?.panelType ||
    panel?.panel_type ||
    panel?.profileName ||
    panel?.profile_name ||
    "";

  if (normalize(direct)) {
    return String(direct).trim();
  }

  const first =
    results?.[0] || {};

  return (
    first?.panel_name ||
    first?.panelName ||
    first?.panel_type ||
    first?.panelType ||
    first?.profile_name ||
    first?.profileName ||
    first?.test_name ||
    first?.testName ||
    ""
  );
};

/* ==========================================================
   CATEGORY
   ========================================================== */

const getCategory = ({
  panel,
  results,
  category,
}) => {
  const supplied =
    normalize(category);

  if (supplied) {
    return supplied;
  }

  const panelCategory =
    normalize(
      panel?.category ||
      panel?.resultCategory ||
      panel?.result_category
    );

  if (panelCategory) {
    return panelCategory;
  }

  const categories =
    (results || [])
      .map(
        (item) =>
          normalize(
            item?.department ||
            item?.result_category ||
            item?.resultCategory ||
            item?.category ||
            ""
          )
      )
      .filter(Boolean);

  if (
    categories.some(
      (value) =>
        value.includes("endocr")
    )
  ) {
    return "endocrinology";
  }

  if (
    categories.some(
      (value) =>
        value.includes("haemat") ||
        value.includes("hemat")
    )
  ) {
    return "haematology";
  }

  if (
    categories.some(
      (value) =>
        value.includes("chem")
    )
  ) {
    return "chemistry";
  }

  return "";
};

/* ==========================================================
   KNOWN PANEL FAMILIES
   ========================================================== */

const CHEMISTRY_PANELS = new Set([
  "lft",
  "liver function test",
  "liver function tests",
  "liver profile",
  "hepatic function test",
  "hepatic function tests",
  "hepatic profile",

  "rft",
  "renal function test",
  "renal function tests",
  "renal profile",

  "kft",
  "kidney function test",
  "kidney function tests",
  "kidney profile",

  "euc",
  "electrolyte urea creatinine",
  "electrolytes urea creatinine",
  "electrolytes urea and creatinine",

  "flp",
  "lipid profile",
  "lipid profile flp",
  "fasting lipid profile",
  "fasting lipid profile flp",
  "lipid panel",

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

const HAEMATOLOGY_PANELS = new Set([
  "fbc",
  "cbc",
  "complete blood count",
  "full blood count",

  "coagulation profile",

  "cd4",
  "cd4 count",
]);

const ENDOCRINOLOGY_PANELS = new Set([
  "tft",
  "free tft",
  "total tft",

  "thyroid profile",
  "thyroid function test",
  "thyroid function tests",
  "thyroid panel",

  "hormonal profile",
]);

/* ==========================================================
   ANALYTE FALLBACKS
   ========================================================== */

const CHEMISTRY_ANALYTES = new Set([
  "urea",
  "blood urea",
  "bun",
  "creatinine",

  "sodium",
  "potassium",
  "chloride",
  "bicarbonate",
  "hco3",
  "egfr",

  "ast",
  "alt",
  "alp",
  "ggt",

  "bilirubin",
  "total bilirubin",
  "direct bilirubin",
  "indirect bilirubin",

  "albumin",
  "total protein",

  "cholesterol",
  "total cholesterol",
  "hdl",
  "hdl cholesterol",
  "ldl",
  "ldl cholesterol",
  "triglycerides",
  "vldl",

  "calcium",
  "total calcium",
  "ionized calcium",
  "magnesium",
  "phosphorus",
  "uric acid",

  "fbs",
  "fasting blood sugar",
  "fasting blood glucose",

  "rbs",
  "random blood sugar",
  "random blood glucose",

  "hba1c",
]);

/* ==========================================================
   PANEL FAMILY RESOLUTION
   ========================================================== */

const resolvePanelFamily = ({
  panel,
  results,
  category,
}) => {
  const panelName =
    normalize(
      getPanelName(
        panel,
        results
      )
    );

  const resolvedCategory =
    getCategory({
      panel,
      results,
      category,
    });

  /* --------------------------------------------------------
     Endocrinology gets priority.
     TFT can overlap with chemistry.
     -------------------------------------------------------- */

  if (
    resolvedCategory.includes(
      "endocr"
    )
  ) {
    return "endocrinology";
  }

  if (
    ENDOCRINOLOGY_PANELS.has(
      panelName
    )
  ) {
    return "endocrinology";
  }

  /* --------------------------------------------------------
     Chemistry
     -------------------------------------------------------- */

  if (
    resolvedCategory.includes(
      "chem"
    )
  ) {
    return "chemistry";
  }

  if (
    CHEMISTRY_PANELS.has(
      panelName
    )
  ) {
    return "chemistry";
  }

  /* --------------------------------------------------------
     Haematology
     -------------------------------------------------------- */

  if (
    resolvedCategory.includes(
      "haemat"
    ) ||
    resolvedCategory.includes(
      "hemat"
    )
  ) {
    return "haematology";
  }

  if (
    HAEMATOLOGY_PANELS.has(
      panelName
    )
  ) {
    return "haematology";
  }

  /* --------------------------------------------------------
     Chemistry analyte fallback
     -------------------------------------------------------- */

  const chemistryCount =
    (results || []).filter(
      (item) =>
        CHEMISTRY_ANALYTES.has(
          normalize(
            item?.test_name ||
            item?.testName ||
            item?.parameter ||
            item?.parameter_name ||
            item?.name ||
            item?.analyte
          )
        )
    ).length;

  if (
    chemistryCount >= 2
  ) {
    return "chemistry";
  }

  return "";
};

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function PrintPanelLaboratoryResultEntryResolver({
  results = [],
  patient = {},
  printMode = "internal",

  panel = null,
  panelCategory = "",
  department = "",

  /* Optional explicit override. */
  forceRenderer = "",
}) {
  if (
    !Array.isArray(results) ||
    results.length === 0
  ) {
    return null;
  }

  const family =
    normalize(
      forceRenderer
    ) ||
    resolvePanelFamily({
      panel,
      results,
      category:
        panelCategory ||
        department,
    });

  const panelName =
    getPanelName(
      panel,
      results
    );

  const commonProps = {
    results,
    patient,
    printMode,
  };

  /* ========================================================
     CHEMISTRY
     ======================================================== */

  if (
    family ===
      "chemistry" ||
    family.includes(
      "chemistry"
    )
  ) {
    console.log(
      "[PrintPanelLaboratoryResultEntryResolver] → CHEMISTRY",
      panelName
    );

    return (
      <PrintChemistryTable
        {...commonProps}
      />
    );
  }

  /* ========================================================
     HAEMATOLOGY
     ======================================================== */

  if (
    family ===
      "haematology" ||
    family ===
      "hematology"
  ) {
    console.log(
      "[PrintPanelLaboratoryResultEntryResolver] → HAEMATOLOGY",
      panelName
    );

    return (
      <PrintHaematology
        {...commonProps}
      />
    );
  }

  /* ========================================================
     ENDOCRINOLOGY
     ======================================================== */

  if (
    family ===
      "endocrinology"
  ) {
    console.log(
      "[PrintPanelLaboratoryResultEntryResolver] → ENDOCRINOLOGY",
      panelName
    );

    return (
      <PrintEndocrinologyPanel
        {...commonProps}
      />
    );
  }

  /* ========================================================
     SAFE FALLBACK
     ======================================================== */

  console.warn(
    "[PrintPanelLaboratoryResultEntryResolver] No panel renderer found:",
    {
      family,
      panelName,
      department,
      results,
    }
  );

  return null;
}