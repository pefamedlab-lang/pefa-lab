import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   CARDIAC BIOMARKER INTERPRETATION ENGINE
========================================================== */

export default function interpretCardiac(

  report = {},

  resultMap = {}

) {

  const troponinI =
    getNumericResult(
      resultMap,
      "Troponin I"
    );

  const troponinT =
    getNumericResult(
      resultMap,
      "Troponin T"
    );

  const ckmb =
    getNumericResult(
      resultMap,
      "CK-MB"
    );

  const ck =
    getNumericResult(
      resultMap,
      "Creatine Kinase"
    ) ??
    getNumericResult(
      resultMap,
      "CK Total"
    );

  const ldh =
    getNumericResult(
      resultMap,
      "LDH"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     TROPONIN
  ====================================================== */

  const troponin =
    troponinI ?? troponinT;

  if (troponin !== null) {

    if (troponin <= 0.04) {

      interpretation +=
        "Cardiac troponin is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Cardiac troponin is elevated, indicating myocardial injury.\n\n";

    }

  }

  /* ======================================================
     CK-MB
  ====================================================== */

  if (ckmb !== null) {

    if (ckmb <= 25) {

      interpretation +=
        "CK-MB is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "CK-MB is elevated, supporting myocardial injury where clinically appropriate.\n\n";

    }

  }

  /* ======================================================
     TOTAL CK
  ====================================================== */

  if (ck !== null) {

    if (ck <= 190) {

      interpretation +=
        "Total creatine kinase is within the reference interval.\n\n";

    }

    else if (ck <= 1000) {

      interpretation +=
        "Creatine kinase is elevated, suggesting muscle injury.\n\n";

    }

    else {

      interpretation +=
        "Marked elevation of creatine kinase is present, compatible with severe skeletal muscle injury or rhabdomyolysis.\n\n";

    }

  }

  /* ======================================================
     LDH
  ====================================================== */

  if (ldh !== null) {

    if (ldh <= 250) {

      interpretation +=
        "LDH is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "LDH is elevated, reflecting tissue injury but is non-specific.\n\n";

    }

  }

  /* ======================================================
     ACUTE MI
  ====================================================== */

  if (

    troponin > 0.04 &&

    ckmb > 25

  ) {

    impression =
      "Biochemical findings are consistent with acute myocardial injury.";

    recommendation =
      "Interpret together with symptoms, serial troponin measurements and ECG findings. Urgent cardiology assessment is recommended.";

  }

  /* ======================================================
     ISOLATED TROPONIN
  ====================================================== */

  else if (

    troponin > 0.04

  ) {

    impression =
      "Elevated cardiac troponin.";

    recommendation =
      "Clinical correlation is required as elevated troponin may occur in myocardial infarction, myocarditis, heart failure, pulmonary embolism and renal impairment.";

  }

  /* ======================================================
     RHABDOMYOLYSIS
  ====================================================== */

  else if (

    ck > 1000

  ) {

    impression =
      "Marked skeletal muscle injury.";

    recommendation =
      "Assess for rhabdomyolysis, renal impairment and electrolyte disturbances.";

  }

  /* ======================================================
     MUSCLE INJURY
  ====================================================== */

  else if (

    ck > 190

  ) {

    impression =
      "Raised creatine kinase.";

    recommendation =
      "Consider recent exercise, intramuscular injections, trauma or myopathy.";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  else {

    impression =
      "Cardiac biomarkers are within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation.";

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}