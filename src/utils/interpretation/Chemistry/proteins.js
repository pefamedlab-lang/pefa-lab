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

  const globulin =
    getNumericResult(
      resultMap,
      "Globulin"
    );

  const agRatio =
    getNumericResult(
      resultMap,
      "A/G Ratio"
    );

  const creatinine =
    getNumericResult(
      resultMap,
      "Creatinine"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     TOTAL PROTEIN
  ====================================================== */

  if (totalProtein !== null) {

    if (totalProtein < 60) {

      interpretation +=
        "Total serum protein is below the reference interval, suggesting hypoproteinaemia.\n\n";

    }

    else if (totalProtein <= 82) {

      interpretation +=
        "Total serum protein is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Total serum protein is elevated (hyperproteinaemia).\n\n";

    }

  }

  /* ======================================================
     ALBUMIN
  ====================================================== */

  if (albumin !== null) {

    if (albumin < 35) {

      interpretation +=
        "Serum albumin is reduced. This may occur in chronic liver disease, nephrotic syndrome, malnutrition, protein-losing enteropathy or systemic inflammation.\n\n";

    }

    else if (albumin <= 50) {

      interpretation +=
        "Serum albumin is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum albumin is elevated, usually reflecting dehydration.\n\n";

    }

  }

  /* ======================================================
     GLOBULIN
  ====================================================== */

  if (globulin !== null) {

    if (globulin < 20) {

      interpretation +=
        "Globulin concentration is reduced.\n\n";

    }

    else if (globulin <= 35) {

      interpretation +=
        "Globulin concentration is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Globulin concentration is elevated, suggesting chronic inflammation, autoimmune disease or plasma cell disorders.\n\n";

    }

  }

  /* ======================================================
     A/G RATIO
  ====================================================== */

  if (agRatio !== null) {

    if (agRatio < 1.0) {

      interpretation +=
        "Albumin/Globulin ratio is reduced.\n\n";

    }

    else if (agRatio <= 2.2) {

      interpretation +=
        "Albumin/Globulin ratio is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Albumin/Globulin ratio is elevated.\n\n";

    }

  }

  /* ======================================================
     MULTIPLE MYELOMA PATTERN
  ====================================================== */

  if (

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
     CHRONIC INFLAMMATION
  ====================================================== */

  else if (

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

    albumin < 30 &&

    creatinine <= 120

  ) {

    impression =
      "Marked hypoalbuminaemia may reflect renal protein loss such as nephrotic syndrome.";

    recommendation =
      "Urinalysis and urine protein quantification are recommended.";

  }

  /* ======================================================
     MALNUTRITION
  ====================================================== */

  else if (

    albumin < 35 &&

    totalProtein < 60

  ) {

    impression =
      "Protein profile is compatible with protein deficiency or impaired hepatic synthesis.";

    recommendation =
      "Nutritional assessment and liver function evaluation are advised.";

  }

  /* ======================================================
     DEHYDRATION
  ====================================================== */

  else if (

    albumin > 50 &&

    totalProtein > 82

  ) {

    impression =
      "Protein profile suggests haemoconcentration due to dehydration.";

    recommendation =
      "Interpret together with hydration status.";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  else {

    impression =
      "Protein profile is within acceptable laboratory limits.";

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