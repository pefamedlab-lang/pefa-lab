import {
  createInterpretation,
  getScientistOverride,
} from "./helpers";

/* ==========================================================
   DEFAULT INTERPRETATION ENGINE
========================================================== */

export default function defaultInterpretation(
  report = {},
  resultMap = {}
) {
  /* ======================================================
     SCIENTIST OVERRIDE
  ====================================================== */

  const override =
    getScientistOverride(report);

  if (override) {
    return override;
  }

  /* ======================================================
     NO RESULTS
  ====================================================== */

  const hasResults =
    resultMap &&
    Object.keys(resultMap).length > 0;

  if (!hasResults) {
    return createInterpretation({

      interpretation:
        "No laboratory results are available for automated interpretation.",

      impression:
        "Interpretation unavailable.",

      recommendation:
        "Review the analytical results and correlate with the patient's clinical presentation.",

    });
  }

  /* ======================================================
     DEFAULT
  ====================================================== */

  return createInterpretation({

    interpretation:
      "Automated interpretation is not available for this investigation. Laboratory findings should be interpreted in conjunction with the patient's history, physical examination, reference intervals and other relevant investigations.",

    impression:
      "No automated interpretation generated.",

    recommendation:
      "Clinical correlation is recommended. Consult the reporting laboratory scientist or pathologist where appropriate.",

  });
}