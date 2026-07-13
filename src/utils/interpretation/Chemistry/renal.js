import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   RENAL FUNCTION INTERPRETATION ENGINE
========================================================== */

export default function interpretRenal(

  report = {},

  resultMap = {}

) {

  const urea =
    getNumericResult(
      resultMap,
      "Urea"
    );

  const bun =
    getNumericResult(
      resultMap,
      "BUN"
    );

  const creatinine =
    getNumericResult(
      resultMap,
      "Creatinine"
    );

  const egfr =
    getNumericResult(
      resultMap,
      "eGFR"
    );

  const uricAcid =
    getNumericResult(
      resultMap,
      "Uric Acid"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     UREA
  ====================================================== */

  if (urea !== null) {

    if (urea < 2.5) {

      interpretation +=
        "Blood urea concentration is below the reference interval.\n\n";

    }

    else if (urea <= 8.3) {

      interpretation +=
        "Blood urea concentration is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Blood urea concentration is elevated, suggesting reduced renal clearance, dehydration, increased protein catabolism or gastrointestinal bleeding.\n\n";

    }

  }

  /* ======================================================
     CREATININE
  ====================================================== */

  if (creatinine !== null) {

    if (creatinine <= 120) {

      interpretation +=
        "Serum creatinine is within the reference interval.\n\n";

    }

    else if (creatinine <= 180) {

      interpretation +=
        "Serum creatinine is mildly elevated, suggesting impaired renal function.\n\n";

    }

    else if (creatinine <= 400) {

      interpretation +=
        "Serum creatinine is moderately elevated, consistent with significant renal impairment.\n\n";

    }

    else {

      interpretation +=
        "Serum creatinine is markedly elevated, indicating severe renal dysfunction.\n\n";

    }

  }

  /* ======================================================
     eGFR
  ====================================================== */

  if (egfr !== null) {

    if (egfr >= 90) {

      interpretation +=
        "Estimated glomerular filtration rate is preserved.\n\n";

    }

    else if (egfr >= 60) {

      interpretation +=
        "Estimated glomerular filtration rate suggests mildly reduced kidney function (CKD G2 if persistent).\n\n";

    }

    else if (egfr >= 45) {

      interpretation +=
        "Estimated glomerular filtration rate is consistent with Stage G3a chronic kidney disease if persistent.\n\n";

    }

    else if (egfr >= 30) {

      interpretation +=
        "Estimated glomerular filtration rate is consistent with Stage G3b chronic kidney disease.\n\n";

    }

    else if (egfr >= 15) {

      interpretation +=
        "Estimated glomerular filtration rate indicates severe chronic kidney disease (Stage G4).\n\n";

    }

    else {

      interpretation +=
        "Estimated glomerular filtration rate indicates kidney failure (Stage G5).\n\n";

    }

  }

  /* ======================================================
     URIC ACID
  ====================================================== */

  if (uricAcid !== null) {

    if (uricAcid > 420) {

      interpretation +=
        "Serum uric acid is elevated (hyperuricaemia), increasing the risk of gout and urate nephropathy.\n\n";

    }

    else {

      interpretation +=
        "Serum uric acid is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     BUN
  ====================================================== */

  if (bun !== null) {

    if (bun > 20) {

      interpretation +=
        "Blood urea nitrogen is elevated.\n\n";

    }

  }

  /* ======================================================
     CLINICAL PATTERNS
  ====================================================== */

  if (

    creatinine > 120 &&

    egfr !== null &&

    egfr < 60

  ) {

    impression =
      "Findings are consistent with chronic kidney disease.";

    recommendation =
      "Correlation with clinical history, urine protein assessment, blood pressure control and serial renal function monitoring is recommended.";

  }

  else if (

    creatinine > 120 &&

    urea > 8.3

  ) {

    impression =
      "Findings suggest impaired renal function.";

    recommendation =
      "Clinical correlation and repeat renal profile are recommended.";

  }

  else if (

    urea > 8.3 &&

    creatinine <= 120

  ) {

    impression =
      "Elevated urea with preserved creatinine may reflect dehydration, increased protein intake or increased protein catabolism.";

    recommendation =
      "Assess hydration status and correlate clinically.";

  }

  else {

    impression =
      "Renal function is within acceptable laboratory limits.";

    recommendation =
      "Interpret together with the patient's clinical condition.";

  }

  /* ======================================================
     DIABETIC NEPHROPATHY
  ====================================================== */

  const glucose =
    getNumericResult(
      resultMap,
      "Glucose"
    );

  const hba1c =
    getNumericResult(
      resultMap,
      "HbA1c"
    );

  if (

    (glucose >= 7 ||

      hba1c >= 6.5) &&

    creatinine > 120

  ) {

    impression =
      "Findings suggest diabetes mellitus with associated renal impairment.";

    recommendation =
      "Assessment of urine albumin-creatinine ratio, eGFR trend and nephrology review is recommended.";

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}