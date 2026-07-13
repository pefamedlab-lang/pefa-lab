import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   IRON STUDIES INTERPRETATION ENGINE
========================================================== */

export default function interpretIronStudies(

  report = {},

  resultMap = {}

) {

  const iron =
    getNumericResult(
      resultMap,
      "Serum Iron"
    ) ??

    getNumericResult(
      resultMap,
      "Iron"
    );

  const ferritin =
    getNumericResult(
      resultMap,
      "Ferritin"
    );

  const tibc =
    getNumericResult(
      resultMap,
      "TIBC"
    );

  const uibc =
    getNumericResult(
      resultMap,
      "UIBC"
    );

  let saturation =
    getNumericResult(
      resultMap,
      "Transferrin Saturation"
    );

  if (

    saturation === null &&

    iron !== null &&

    tibc !== null &&

    tibc > 0

  ) {

    saturation =
      (iron / tibc) * 100;

  }

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     SERUM IRON
  ====================================================== */

  if (iron !== null) {

    if (iron < 10) {

      interpretation +=
        "Serum iron is reduced.\n\n";

    }

    else if (iron <= 30) {

      interpretation +=
        "Serum iron is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum iron is elevated.\n\n";

    }

  }

  /* ======================================================
     FERRITIN
  ====================================================== */

  if (ferritin !== null) {

    if (ferritin < 15) {

      interpretation +=
        "Ferritin is markedly reduced, indicating depleted iron stores.\n\n";

    }

    else if (ferritin < 30) {

      interpretation +=
        "Ferritin is mildly reduced.\n\n";

    }

    else if (ferritin <= 300) {

      interpretation +=
        "Ferritin is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Ferritin is elevated.\n\n";

    }

  }

  /* ======================================================
     TIBC
  ====================================================== */

  if (tibc !== null) {

    if (tibc > 72) {

      interpretation +=
        "Total iron-binding capacity is elevated.\n\n";

    }

    else if (tibc < 45) {

      interpretation +=
        "Total iron-binding capacity is reduced.\n\n";

    }

  }

  /* ======================================================
     TRANSFERRIN SATURATION
  ====================================================== */

  if (saturation !== null) {

    interpretation +=
      `Calculated transferrin saturation is ${saturation.toFixed(1)}%.\n\n`;

  }

  /* ======================================================
     IRON DEFICIENCY
  ====================================================== */

  if (

    ferritin < 15 &&

    iron < 10 &&

    tibc > 72

  ) {

    impression =
      "Iron deficiency.";

    recommendation =
      "Investigate the cause of iron deficiency including chronic blood loss, nutritional deficiency or malabsorption.";

  }

  /* ======================================================
     IRON DEFICIENCY ANAEMIA
  ====================================================== */

  else if (

    ferritin < 15 &&

    saturation < 15

  ) {

    impression =
      "Iron deficiency anaemia is likely.";

    recommendation =
      "Full blood count and clinical evaluation are recommended.";

  }

  /* ======================================================
     ANAEMIA OF CHRONIC DISEASE
  ====================================================== */

  else if (

    ferritin > 100 &&

    iron < 10 &&

    tibc < 45

  ) {

    impression =
      "Pattern is compatible with anaemia of chronic disease.";

    recommendation =
      "Interpret alongside inflammatory markers and clinical findings.";

  }

  /* ======================================================
     IRON OVERLOAD
  ====================================================== */

  else if (

    ferritin > 300 &&

    saturation > 45

  ) {

    impression =
      "Iron overload.";

    recommendation =
      "Clinical assessment for hereditary haemochromatosis or secondary iron overload is advised.";

  }

  /* ======================================================
     POSSIBLE HAEMOCHROMATOSIS
  ====================================================== */

  else if (

    ferritin > 1000 &&

    saturation > 50

  ) {

    impression =
      "Marked iron overload highly suggestive of haemochromatosis.";

    recommendation =
      "Further evaluation including HFE genetic testing and hepatology review should be considered.";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  else {

    impression =
      "Iron studies are within acceptable laboratory limits.";

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