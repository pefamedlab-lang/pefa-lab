import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   PANCREATIC ENZYME INTERPRETATION ENGINE
========================================================== */

export default function interpretPancreas(

  report = {},

  resultMap = {}

) {

  const amylase =
    getNumericResult(
      resultMap,
      "Amylase"
    );

  const lipase =
    getNumericResult(
      resultMap,
      "Lipase"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     AMYLASE
  ====================================================== */

  if (amylase !== null) {

    if (amylase <= 100) {

      interpretation +=
        "Serum amylase is within the reference interval.\n\n";

    }

    else if (amylase <= 300) {

      interpretation +=
        "Serum amylase is mildly elevated.\n\n";

    }

    else {

      interpretation +=
        "Serum amylase is markedly elevated.\n\n";

    }

  }

  /* ======================================================
     LIPASE
  ====================================================== */

  if (lipase !== null) {

    if (lipase <= 60) {

      interpretation +=
        "Serum lipase is within the reference interval.\n\n";

    }

    else if (lipase <= 180) {

      interpretation +=
        "Serum lipase is mildly elevated.\n\n";

    }

    else {

      interpretation +=
        "Serum lipase is markedly elevated.\n\n";

    }

  }

  /* ======================================================
     ACUTE PANCREATITIS
  ====================================================== */

  if (

    lipase > 180 &&

    amylase > 300

  ) {

    impression =
      "Biochemical findings are highly suggestive of acute pancreatitis.";

    recommendation =
      "Correlate with acute abdominal pain, abdominal imaging and clinical findings. Urgent medical evaluation is recommended.";

  }

  /* ======================================================
     LIPASE PREDOMINANT
  ====================================================== */

  else if (

    lipase > 180

  ) {

    impression =
      "Marked lipase elevation consistent with pancreatic injury.";

    recommendation =
      "Clinical correlation and pancreatic imaging are recommended.";

  }

  /* ======================================================
     AMYLASE PREDOMINANT
  ====================================================== */

  else if (

    amylase > 300

  ) {

    impression =
      "Marked hyperamylasaemia.";

    recommendation =
      "Consider acute pancreatitis as well as salivary gland disease, renal impairment or gastrointestinal pathology.";

  }

  /* ======================================================
     CHRONIC PANCREATIC DISEASE
  ====================================================== */

  else if (

    lipase > 60 ||

    amylase > 100

  ) {

    impression =
      "Mild pancreatic enzyme elevation.";

    recommendation =
      "Interpret together with clinical history and imaging findings.";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  else {

    impression =
      "Pancreatic enzyme profile is within acceptable laboratory limits.";

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