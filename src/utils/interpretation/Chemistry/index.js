import defaultInterpretation from "../defaultInterpretation";
import { getScientistOverride } from "../helpers";

import interpretLiver from "./liver";
import interpretBilirubin from "./bilirubin";
import interpretElectrolytes from "./electrolytes";
import interpretDiabetes from "./diabetes";
import interpretLipid from "./lipid";
import interpretMinerals from "./minerals";
import interpretPancreas from "./pancreas";
import interpretProteins from "./proteins";
import interpretCardiac from "./cardiac";
import interpretThyroid from "./thyroid";
import interpretIronStudies from "./ironStudies";
import interpretInflammatory from "./inflammatory";
import interpretTumorMarkers from "./tumorMarkers";

/* ==========================================================
   CHEMISTRY MASTER DISPATCHER
========================================================== */

const ENGINE_MAP = {
  liver: interpretLiver,
  lft: interpretLiver,
  "liver function": interpretLiver,
  "liver function test": interpretLiver,
  "liver function tests": interpretLiver,

  bilirubin: interpretBilirubin,

  electrolytes: interpretElectrolytes,
  electrolyte: interpretElectrolytes,
  uec: interpretElectrolytes,
  ureaelectrolytes: interpretElectrolytes,
  "urea electrolytes": interpretElectrolytes,
  "renal profile": interpretElectrolytes,

  diabetes: interpretDiabetes,
  glucose: interpretDiabetes,
  hba1c: interpretDiabetes,
  diabetic: interpretDiabetes,

  lipid: interpretLipid,
  lipids: interpretLipid,
  "lipid profile": interpretLipid,

  minerals: interpretMinerals,
  mineral: interpretMinerals,
  "mineral profile": interpretMinerals,

  pancreas: interpretPancreas,
  pancreatic: interpretPancreas,
  amylase: interpretPancreas,
  lipase: interpretPancreas,

  proteins: interpretProteins,
  protein: interpretProteins,
  "protein profile": interpretProteins,

  cardiac: interpretCardiac,
  troponin: interpretCardiac,
  ckmb: interpretCardiac,
  "cardiac markers": interpretCardiac,

  thyroid: interpretThyroid,
  tft: interpretThyroid,
  "thyroid function": interpretThyroid,
  "thyroid function test": interpretThyroid,
  "thyroid function tests": interpretThyroid,

  iron: interpretIronStudies,
  "iron studies": interpretIronStudies,
  "iron profile": interpretIronStudies,
  ferritin: interpretIronStudies,

  inflammatory: interpretInflammatory,
  inflammation: interpretInflammatory,
  crp: interpretInflammatory,
  esr: interpretInflammatory,
  procalcitonin: interpretInflammatory,

  tumor: interpretTumorMarkers,
  tumour: interpretTumorMarkers,
  "tumor markers": interpretTumorMarkers,
  "tumour markers": interpretTumorMarkers,
  psa: interpretTumorMarkers,
  afp: interpretTumorMarkers,
  cea: interpretTumorMarkers,
};

export default function interpretChemistry(
  report = {},
  resultMap = {}
) {
  /* ======================================================
     SCIENTIST OVERRIDE
  ====================================================== */

  const override = getScientistOverride(report);

  if (override) {
    return override;
  }

  /* ======================================================
     DETERMINE ENGINE
  ====================================================== */

  const engine = (
    report.interpretation_engine ||
    report.engine ||
    report.test_type ||
    report.test_name ||
    ""
  )
    .trim()
    .toLowerCase();

  const interpreter = ENGINE_MAP[engine];

  if (typeof interpreter === "function") {
    return interpreter(report, resultMap);
  }

  /* ======================================================
     FALLBACK
  ====================================================== */

  return defaultInterpretation(report, resultMap);
}