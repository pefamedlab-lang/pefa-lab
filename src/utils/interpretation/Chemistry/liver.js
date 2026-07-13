import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   LIVER FUNCTION INTERPRETATION ENGINE
========================================================== */

export default function interpretLiver(

  report = {},

  resultMap = {}

) {

  const alt =
    getNumericResult(resultMap, "ALT") ??
    getNumericResult(resultMap, "SGPT");

  const ast =
    getNumericResult(resultMap, "AST") ??
    getNumericResult(resultMap, "SGOT");

  const alp =
    getNumericResult(resultMap, "ALP");

  const ggt =
    getNumericResult(resultMap, "GGT");

  const albumin =
    getNumericResult(resultMap, "Albumin");

  const protein =
    getNumericResult(resultMap, "Total Protein");

  const globulin =
    getNumericResult(resultMap, "Globulin");

  const agratio =
    getNumericResult(resultMap, "A/G Ratio");

  const totalBilirubin =
    getNumericResult(resultMap, "Total Bilirubin");

  const directBilirubin =
    getNumericResult(resultMap, "Direct Bilirubin");

  const indirectBilirubin =
    getNumericResult(resultMap, "Indirect Bilirubin");

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     ALT
  ====================================================== */

  if (alt !== null) {

    if (alt <= 40) {

      interpretation +=
        "Alanine aminotransferase (ALT) is within the reference interval.\n\n";

    }

    else if (alt <= 120) {

      interpretation +=
        "ALT is mildly elevated, suggesting mild hepatocellular injury.\n\n";

    }

    else {

      interpretation +=
        "ALT is markedly elevated, indicating significant hepatocellular injury.\n\n";

    }

  }

  /* ======================================================
     AST
  ====================================================== */

  if (ast !== null) {

    if (ast <= 40) {

      interpretation +=
        "Aspartate aminotransferase (AST) is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "AST is elevated.\n\n";

    }

  }

  /* ======================================================
     ALP
  ====================================================== */

  if (alp !== null) {

    if (alp <= 130) {

      interpretation +=
        "Alkaline phosphatase is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Alkaline phosphatase is elevated.\n\n";

    }

  }

  /* ======================================================
     GGT
  ====================================================== */

  if (ggt !== null) {

    if (ggt <= 60) {

      interpretation +=
        "Gamma-glutamyl transferase is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Gamma-glutamyl transferase is elevated.\n\n";

    }

  }

  /* ======================================================
     ALBUMIN
  ====================================================== */

  if (albumin !== null) {

    if (albumin < 35) {

      interpretation +=
        "Serum albumin is reduced, suggesting impaired hepatic synthetic function, malnutrition or protein loss.\n\n";

    }

    else {

      interpretation +=
        "Serum albumin is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     TOTAL PROTEIN
  ====================================================== */

  if (protein !== null) {

    if (protein < 60) {

      interpretation +=
        "Total protein is below the reference interval.\n\n";

    }

    else if (protein > 82) {

      interpretation +=
        "Total protein is elevated.\n\n";

    }

    else {

      interpretation +=
        "Total protein is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     GLOBULIN
  ====================================================== */

  if (globulin !== null) {

    if (globulin > 35) {

      interpretation +=
        "Globulin concentration is elevated.\n\n";

    }

  }

  /* ======================================================
     A/G RATIO
  ====================================================== */

  if (agratio !== null) {

    if (agratio < 1.0) {

      interpretation +=
        "Albumin/Globulin ratio is reduced.\n\n";

    }

  }

  /* ======================================================
     BILIRUBIN
  ====================================================== */

  if (totalBilirubin !== null) {

    if (totalBilirubin <= 21) {

      interpretation +=
        "Total bilirubin is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Hyperbilirubinaemia is present.\n\n";

    }

  }

  if (

    directBilirubin !== null &&

    totalBilirubin !== null &&

    directBilirubin > 0.2 * totalBilirubin

  ) {

    interpretation +=
      "The bilirubin pattern is predominantly conjugated.\n\n";

  }

  if (

    indirectBilirubin !== null &&

    totalBilirubin !== null &&

    indirectBilirubin > directBilirubin

  ) {

    interpretation +=
      "The bilirubin pattern is predominantly unconjugated.\n\n";

  }

  /* ======================================================
     CLINICAL PATTERNS
  ====================================================== */

  if (

    alt > 40 &&

    ast > 40 &&

    alp <= 130

  ) {

    impression =
      "Pattern is consistent with hepatocellular liver injury.";

  }

  else if (

    alp > 130 &&

    ggt > 60

  ) {

    impression =
      "Pattern is suggestive of cholestatic liver disease.";

  }

  else if (

    alt > 40 &&

    alp > 130

  ) {

    impression =
      "Mixed hepatocellular and cholestatic liver injury pattern.";

  }

  else if (

    albumin < 35

  ) {

    impression =
      "Evidence of impaired hepatic synthetic function or chronic systemic disease.";

  }

  else if (

    totalBilirubin > 21

  ) {

    impression =
      "Hyperbilirubinaemia detected.";

  }

  else {

    impression =
      "Liver function parameters are within acceptable laboratory limits.";

  }

  /* ======================================================
     RECOMMENDATION
  ====================================================== */

  if (

    impression !==

    "Liver function parameters are within acceptable laboratory limits."

  ) {

    recommendation =
      "Interpret alongside the patient's clinical findings. Viral hepatitis screening, abdominal ultrasound, repeat liver function tests and specialist review may be indicated depending on the clinical context.";

  }

  else {

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