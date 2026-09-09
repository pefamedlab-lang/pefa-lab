import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   PROTEIN PROFILE INTERPRETATION ENGINE
========================================================== */

export default function interpretProteins(

  report = {},

  resultMap = {}

) {

  const totalProtein =
    getNumericResult(
      resultMap,
      "Total Protein"
    );

  const albumin =
    getNumericResult(
      resultMap,
      "Albumin"
    );

  let globulin =
    getNumericResult(
      resultMap,
      "Globulin"
    );

  if (
    globulin === null &&
    totalProtein !== null &&
    albumin !== null
  ) {
    globulin =
      totalProtein - albumin;
  }

  let agRatio =
    getNumericResult(
      resultMap,
      "A/G Ratio"
    );

  if (
    agRatio === null &&
    albumin !== null &&
    globulin !== null &&
    globulin > 0
  ) {
    agRatio =
      albumin / globulin;
  }

  const creatinine =
    getNumericResult(
      resultMap,
      "Creatinine"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  let abnormal = false;

  /* ======================================================
     TOTAL PROTEIN
  ====================================================== */

  if (totalProtein !== null) {

    if (totalProtein < 60) {

      abnormal = true;

      interpretation +=
        "Total serum protein is below the reference interval, suggesting hypoproteinaemia.\n\n";

    }

    else if (totalProtein <= 82) {

      interpretation +=
        "Total serum protein is within the reference interval.\n\n";

    }

    else {

      abnormal = true;

      interpretation +=
        "Total serum protein is elevated (hyperproteinaemia).\n\n";

    }

  }

  /* ======================================================
     ALBUMIN
  ====================================================== */

  if (albumin !== null) {

    if (albumin < 35) {

      abnormal = true;

      interpretation +=
        "Serum albumin is reduced. This may occur in chronic liver disease, nephrotic syndrome, malnutrition, protein-losing enteropathy or systemic inflammation.\n\n";

    }

    else if (albumin <= 50) {

      interpretation +=
        "Serum albumin is within the reference interval.\n\n";

    }

    else {

      abnormal = true;

      interpretation +=
        "Serum albumin is elevated, usually reflecting dehydration.\n\n";

    }

  }

  /* ======================================================
     GLOBULIN
  ====================================================== */

  if (globulin !== null) {

    if (globulin < 20) {

      abnormal = true;

      interpretation +=
        "Globulin concentration is reduced.\n\n";

    }

    else if (globulin <= 35) {

      interpretation +=
        "Globulin concentration is within the reference interval.\n\n";

    }

    else {

      abnormal = true;

      interpretation +=
        "Globulin concentration is elevated, suggesting chronic inflammation, autoimmune disease or plasma cell disorders.\n\n";

    }

  }

  /* ======================================================
     A/G RATIO
  ====================================================== */

  if (agRatio !== null) {

    if (agRatio < 1.0) {

      abnormal = true;

      interpretation +=
        "Albumin/Globulin ratio is reduced.\n\n";

    }

    else if (agRatio <= 2.2) {

      interpretation +=
        "Albumin/Globulin ratio is within the reference interval.\n\n";

    }

    else {

      abnormal = true;

      interpretation +=
        "Albumin/Globulin ratio is elevated.\n\n";

    }

  }

  /* ======================================================
     MULTIPLE MYELOMA PATTERN
  ====================================================== */

  if (

    totalProtein !== null &&
    globulin !== null &&
    agRatio !== null &&
    totalProtein > 90 &&
    globulin > 45 &&
    agRatio < 1.0

  ) {

    impression =
      "Protein profile is suggestive of monoclonal gammopathy or plasma cell dyscrasia.";

    recommendation =
      "Serum protein electrophoresis, immunofixation and serum free light chain assay are recommended where clinically indicated.";

  }

  /* ======================================================
     CHRONIC INFLAMMATORY PATTERN
  ====================================================== */

  else if (

    globulin !== null &&
    albumin !== null &&
    globulin > 35 &&
    albumin < 35

  ) {

    impression =
      "Protein pattern is compatible with chronic inflammatory disease.";

    recommendation =
      "Interpret alongside CRP, ESR and clinical findings.";

  }

  /* ======================================================
     NEPHROTIC PATTERN
  ====================================================== */

  else if (

    albumin !== null &&
    creatinine !== null &&
    albumin < 30 &&
    creatinine <= 120

  ) {

    impression =
      "Marked hypoalbuminaemia may reflect renal protein loss such as nephrotic syndrome.";

    recommendation =
      "Urinalysis and urine protein quantification are recommended.";

  }

  /* ======================================================
     MALNUTRITION / REDUCED SYNTHESIS
  ====================================================== */

  else if (

    albumin !== null &&
    totalProtein !== null &&
    albumin < 35 &&
    totalProtein < 60

  ) {

    impression =
      "Protein profile is compatible with protein deficiency or impaired hepatic protein synthesis.";

    recommendation =
      "Nutritional assessment and liver function evaluation are advised.";

  }

  /* ======================================================
     DEHYDRATION
  ====================================================== */

  else if (

    albumin !== null &&
    totalProtein !== null &&
    albumin > 50 &&
    totalProtein > 82

  ) {

    impression =
      "Protein profile suggests haemoconcentration due to dehydration.";

    recommendation =
      "Interpret together with hydration status.";

  }

  /* ======================================================
     ISOLATED HYPOALBUMINAEMIA
  ====================================================== */

  else if (

    albumin !== null &&
    albumin < 35

  ) {

    impression =
      "Hypoalbuminaemia.";

    recommendation =
      "Assess nutritional status, liver function and renal protein loss.";

  }

  /* ======================================================
     ISOLATED HYPERGLOBULINAEMIA
  ====================================================== */

  else if (

    globulin !== null &&
    globulin > 35

  ) {

    impression =
      "Hyperglobulinaemia.";

    recommendation =
      "Consider chronic inflammatory disorders, autoimmune disease or plasma cell disorders where clinically appropriate.";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  else if (!abnormal) {

    impression =
      "Protein profile is within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation.";

  }

  else {

    impression =
      "Abnormal protein profile detected.";

    recommendation =
      "Interpret alongside the patient's clinical findings and other biochemical investigations.";

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}