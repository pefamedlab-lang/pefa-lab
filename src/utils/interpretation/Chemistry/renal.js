import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   RENAL FUNCTION INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Urea
   • Creatinine
   • eGFR
   • Uric Acid
   • BUN (optional)

   Detects
   ----------------------------------------------------------
   • Normal renal function
   • Reduced renal function
   • Acute kidney injury (possible)
   • Chronic kidney disease (possible)
   • Azotaemia
   • Hyperuricaemia
   • Hypouricaemia
========================================================== */

export default function interpretRenal(

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
     RESULTS
  ====================================================== */

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
    ) ??
    getNumericResult(
      resultMap,
      "Estimated GFR"
    );

  const uricAcid =
    getNumericResult(
      resultMap,
      "Uric Acid"
    ) ??
    getNumericResult(
      resultMap,
      "Urate"
    );

  /* ======================================================
     REFERENCE LIMITS

     (May later be loaded dynamically from the LIS)
  ====================================================== */

  const UREA_ULN = 7.5;
  const CREATININE_ULN = 110;
  const EGFR_LOW = 60;
  const URIC_ACID_ULN = 420;
  const URIC_ACID_LOW = 150;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

/* ======================================================
   DERIVED FLAGS
====================================================== */

const ureaHigh =
  urea !== null &&
  urea > UREA_ULN;

const creatinineHigh =
  creatinine !== null &&
  creatinine > CREATININE_ULN;

const egfrLow =
  egfr !== null &&
  egfr < EGFR_LOW;

const uricAcidHigh =
  uricAcid !== null &&
  uricAcid > URIC_ACID_ULN;

const uricAcidLow =
  uricAcid !== null &&
  uricAcid < URIC_ACID_LOW;

/* ======================================================
   HELPER FUNCTIONS
====================================================== */

function foldIncrease(
  value,
  upperLimit
) {

  if (
    value === null ||
    upperLimit <= 0
  ) {
    return null;
  }

  return value / upperLimit;

}

function isHigh(
  value,
  upperLimit
) {

  return (
    value !== null &&
    value > upperLimit
  );

}

function isLow(
  value,
  lowerLimit
) {

  return (
    value !== null &&
    value < lowerLimit
  );

}

const ureaFold =
  foldIncrease(
    urea,
    UREA_ULN
  );

const creatinineFold =
  foldIncrease(
    creatinine,
    CREATININE_ULN
  );

/* ======================================================
   UREA
====================================================== */

if (urea !== null) {

  if (urea <= UREA_ULN) {

    interpretation +=
      "Serum urea is within the reference interval.\n\n";

  }

  else if (ureaFold < 2) {

    interpretation +=
      "Serum urea is mildly elevated. This may occur with dehydration, increased protein intake, gastrointestinal bleeding or early renal impairment.\n\n";

  }

  else {

    interpretation +=
      "Serum urea is markedly elevated, suggesting significant azotaemia. Correlation with creatinine, eGFR and the patient's clinical status is recommended.\n\n";

  }

}

/* ======================================================
   CREATININE
====================================================== */

if (creatinine !== null) {

  if (creatinine <= CREATININE_ULN) {

    interpretation +=
      "Serum creatinine is within the reference interval.\n\n";

  }

  else if (creatinineFold < 2) {

    interpretation +=
      "Serum creatinine is mildly elevated, suggesting reduced renal function.\n\n";

  }

  else if (creatinineFold < 5) {

    interpretation +=
      "Serum creatinine is moderately elevated, indicating significant impairment of renal function.\n\n";

  }

  else {

    interpretation +=
      "Serum creatinine is markedly elevated, consistent with severe renal impairment.\n\n";

  }

}

/* ======================================================
   eGFR
====================================================== */

if (egfr !== null) {

  if (egfr >= 90) {

    interpretation +=
      "Estimated glomerular filtration rate (eGFR) is within the normal range.\n\n";

  }

  else if (egfr >= 60) {

    interpretation +=
      "eGFR shows mildly reduced renal function. Interpretation should consider the patient's age and clinical context.\n\n";

  }

  else if (egfr >= 30) {

    interpretation +=
      "eGFR indicates moderate reduction in kidney function (CKD Stage 3 if persistent for more than three months).\n\n";

  }

  else if (egfr >= 15) {

    interpretation +=
      "eGFR indicates severe reduction in kidney function (CKD Stage 4 if persistent).\n\n";

  }

  else {

    interpretation +=
      "eGFR is markedly reduced, consistent with kidney failure (CKD Stage 5 if persistent).\n\n";

  }

}

/* ======================================================
   URIC ACID
====================================================== */

if (uricAcid !== null) {

  if (uricAcid < URIC_ACID_LOW) {

    interpretation +=
      "Serum uric acid is below the reference interval. This may occur in severe liver disease, SIADH, certain medications or inherited metabolic disorders.\n\n";

  }

  else if (uricAcid <= URIC_ACID_ULN) {

    interpretation +=
      "Serum uric acid is within the reference interval.\n\n";

  }

  else if (uricAcid <= 600) {

    interpretation +=
      "Serum uric acid is elevated (hyperuricaemia). This may be associated with gout, reduced renal excretion, increased cell turnover or metabolic disorders.\n\n";

  }

  else {

    interpretation +=
      "Marked hyperuricaemia is present, increasing the risk of gout, uric acid nephrolithiasis and urate nephropathy.\n\n";

  }

}

/* ======================================================
   RENAL PATTERN RECOGNITION
====================================================== */

if (

  creatinineHigh &&
  egfrLow &&
  ureaHigh

) {

  impression =
    "Biochemical findings are consistent with impaired renal function.";

  recommendation =
    "Clinical correlation is recommended. Review hydration status, medication history and consider renal imaging and nephrology referral where appropriate.";

}

else if (

  creatinineHigh &&
  egfrLow

) {

  impression =
    "Reduced glomerular filtration with impaired renal function.";

  recommendation =
    "Repeat renal function tests where appropriate and investigate for acute or chronic kidney disease based on the clinical history.";

}

else if (

  ureaHigh &&
  !creatinineHigh

) {

  impression =
    "Isolated elevation of serum urea (azotaemia).";

  recommendation =
    "Consider dehydration, high protein intake, gastrointestinal bleeding or increased protein catabolism. Clinical correlation is advised.";

}

else if (

  uricAcidHigh &&
  !creatinineHigh

) {

  impression =
    "Hyperuricaemia.";

  recommendation =
    "Interpret together with symptoms of gout, renal stone disease and metabolic risk factors. Lifestyle modification and further evaluation may be indicated.";

}

else if (

  uricAcidLow

) {

  impression =
    "Hypouricaemia.";

  recommendation =
    "Interpret in conjunction with the clinical findings and medication history.";

}

else {

  impression =
    "Renal function tests are within acceptable laboratory limits.";

  recommendation =
    "Routine clinical correlation.";

}

/* ======================================================
   RETURN INTERPRETATION
====================================================== */

return createInterpretation({

  interpretation:
    interpretation.trim(),

  impression,

  recommendation,

});

}