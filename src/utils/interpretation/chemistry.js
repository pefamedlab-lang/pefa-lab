import {
  createInterpretation,
  defaultInterpretation,
  getNumericResult,
} from "./helpers";

import {
  getChemistryInterpretation,
} from "../chemistryInterpretation";

import {
  generateAutoInterpretation,
} from "../generateAutoInterpretation";

/* ==========================================================
   CHEMISTRY INTERPRETATION ENGINE
========================================================== */

export default function interpretChemistry(
  report = {},
  resultMap = {}
) {

  const testName = (
    report.test_type ||
    report.test_name ||
    ""
  ).trim();

  /* ======================================================
     SPECIAL CHEMISTRY PANELS
  ====================================================== */

  const supportedProfiles = [

    "LFT",
    "KFT",
    "Lipid Profile",
    "Diabetes Profile",

  ];

  if (
    supportedProfiles.includes(testName)
  ) {

    const output =
      getChemistryInterpretation(
        testName,
        resultMap
      );

    return createInterpretation({

      interpretation:

        output?.interpretation ||

        "Results are within acceptable laboratory reference limits.",

      impression:

        output?.impression ||

        "No significant biochemical abnormality detected.",

      recommendation:

        output?.recommendation ||

        "Clinical correlation is advised.",

    });

  }

  /* ======================================================
     ELECTROLYTES
  ====================================================== */

  if (
    testName === "Electrolytes" ||
    testName === "Electrolytes/Urea/Creatinine"
  ) {

    const sodium =
      getNumericResult(
        resultMap,
        "Sodium"
      );

    const potassium =
      getNumericResult(
        resultMap,
        "Potassium"
      );

    const chloride =
      getNumericResult(
        resultMap,
        "Chloride"
      );

    const bicarbonate =
      getNumericResult(
        resultMap,
        "Bicarbonate"
      );

    const urea =
      getNumericResult(
        resultMap,
        "Urea"
      );

    const creatinine =
      getNumericResult(
        resultMap,
        "Creatinine"
      );

    const interpretation =
      generateAutoInterpretation(
        resultMap
      );

    let impression =
      "Electrolyte profile reviewed.";

    if (
      creatinine > 120 ||
      urea > 8
    ) {

      impression =
        "Renal function parameters are elevated.";

    }

    return createInterpretation({

      interpretation,

      impression,

      recommendation:
        "Interpret alongside hydration status and renal assessment.",

    });

  }

  /* ======================================================
     BLOOD GLUCOSE
  ====================================================== */

  if (
    testName ===
      "Fasting Blood Sugar" ||
    testName ===
      "Random Blood Sugar"
  ) {

    const glucose =
      getNumericResult(
        resultMap,
        "Glucose"
      );

    let impression =
      "Blood glucose level reviewed.";

    if (
      glucose >= 7.0
    ) {

      impression =
        "Hyperglycaemia detected.";

    }

    if (
      glucose < 3.5
    ) {

      impression =
        "Hypoglycaemia detected.";

    }

    return createInterpretation({

      interpretation:
        generateAutoInterpretation(
          resultMap
        ),

      impression,

      recommendation:
        "Interpret together with diabetic history and HbA1c where indicated.",

    });

  }

  /* ======================================================
     GENERAL CHEMISTRY
  ====================================================== */

  const auto =
    generateAutoInterpretation(
      resultMap
    );

  if (auto) {

    return createInterpretation({

      interpretation: auto,

      impression:
        "Clinical correlation is advised.",

      recommendation:
        "Review together with patient's clinical findings.",

    });

  }

  return defaultInterpretation();

}