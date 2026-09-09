import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   BONE & MINERAL PROFILE INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Calcium
   • Corrected Calcium
   • Phosphate
   • Magnesium
   • Alkaline Phosphatase (ALP)
   • Vitamin D (25-OH)
   • Parathyroid Hormone (PTH)

   Detects
   ----------------------------------------------------------
   • Normal bone profile
   • Hypocalcaemia
   • Hypercalcaemia
   • Vitamin D deficiency
   • Hyperparathyroidism
   • Hypoparathyroidism
   • Osteomalacia
   • Renal bone disease
   • Metabolic bone disease
========================================================== */

export default function interpretBone(

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

  const calcium =
    getNumericResult(
      resultMap,
      "Calcium"
    );

  const correctedCalcium =
    getNumericResult(
      resultMap,
      "Corrected Calcium"
    );

  const phosphate =
    getNumericResult(
      resultMap,
      "Phosphate"
    ) ??
    getNumericResult(
      resultMap,
      "Phosphorus"
    );

  const magnesium =
    getNumericResult(
      resultMap,
      "Magnesium"
    );

  const alp =
    getNumericResult(
      resultMap,
      "ALP"
    ) ??
    getNumericResult(
      resultMap,
      "Alkaline Phosphatase"
    );

  const vitaminD =
    getNumericResult(
      resultMap,
      "Vitamin D"
    ) ??
    getNumericResult(
      resultMap,
      "25-OH Vitamin D"
    );

  const pth =
    getNumericResult(
      resultMap,
      "PTH"
    ) ??
    getNumericResult(
      resultMap,
      "Parathyroid Hormone"
    );

  /* ======================================================
     USE CORRECTED CALCIUM IF AVAILABLE
  ====================================================== */

  const corrected =
    correctedCalcium ?? calcium;

  /* ======================================================
     REFERENCE LIMITS

     (Adult reference values)
  ====================================================== */

  const CALCIUM_LOW = 2.10;
  const CALCIUM_HIGH = 2.60;

  const PHOSPHATE_LOW = 0.80;
  const PHOSPHATE_HIGH = 1.50;

  const MAGNESIUM_LOW = 0.70;
  const MAGNESIUM_HIGH = 1.05;

  const ALP_HIGH = 120;

  const VITD_DEFICIENT = 25;
  const VITD_INSUFFICIENT = 50;

  const PTH_HIGH = 65;
  const PTH_LOW = 15;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const calciumLow =
    corrected !== null &&
    corrected < CALCIUM_LOW;

  const calciumHigh =
    corrected !== null &&
    corrected > CALCIUM_HIGH;

  const phosphateLow =
    phosphate !== null &&
    phosphate < PHOSPHATE_LOW;

  const phosphateHigh =
    phosphate !== null &&
    phosphate > PHOSPHATE_HIGH;

  const magnesiumLow =
    magnesium !== null &&
    magnesium < MAGNESIUM_LOW;

  const magnesiumHigh =
    magnesium !== null &&
    magnesium > MAGNESIUM_HIGH;

  const alpHigh =
    alp !== null &&
    alp > ALP_HIGH;

  const vitaminDDeficient =
    vitaminD !== null &&
    vitaminD < VITD_DEFICIENT;

  const vitaminDInsufficient =
    vitaminD !== null &&
    vitaminD >= VITD_DEFICIENT &&
    vitaminD < VITD_INSUFFICIENT;

  const pthLow =
    pth !== null &&
    pth < PTH_LOW;

  const pthHigh =
    pth !== null &&
    pth > PTH_HIGH;

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

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

  const alpFold =
    foldIncrease(
      alp,
      ALP_HIGH
    );

  /* ======================================================
     CALCIUM (Corrected Calcium Preferred)
  ====================================================== */

  if (corrected !== null) {

    if (calciumLow) {

      interpretation +=
        "Corrected serum calcium is below the reference interval, consistent with hypocalcaemia. Clinical correlation is recommended to determine the underlying cause.\n\n";

    }

    else if (!calciumHigh) {

      interpretation +=
        "Corrected serum calcium is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Corrected serum calcium is elevated (hypercalcaemia). Correlation with parathyroid hormone concentration and clinical findings is recommended.\n\n";

    }

  }

  /* ======================================================
     PHOSPHATE
  ====================================================== */

  if (phosphate !== null) {

    if (phosphateLow) {

      interpretation +=
        "Serum phosphate is below the reference interval (hypophosphataemia). This may occur in hyperparathyroidism, vitamin D deficiency, refeeding syndrome or renal phosphate wasting.\n\n";

    }

    else if (!phosphateHigh) {

      interpretation +=
        "Serum phosphate is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum phosphate is elevated (hyperphosphataemia). This may occur in chronic kidney disease, hypoparathyroidism or excessive phosphate intake.\n\n";

    }

  }

  /* ======================================================
     MAGNESIUM
  ====================================================== */

  if (magnesium !== null) {

    if (magnesiumLow) {

      interpretation +=
        "Serum magnesium is below the reference interval (hypomagnesaemia). This may contribute to refractory hypocalcaemia, cardiac arrhythmias and neuromuscular symptoms.\n\n";

    }

    else if (!magnesiumHigh) {

      interpretation +=
        "Serum magnesium is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum magnesium is elevated (hypermagnesaemia), which may occur in renal impairment or excessive magnesium administration.\n\n";

    }

  }

  /* ======================================================
     ALKALINE PHOSPHATASE (ALP)
  ====================================================== */

  if (alp !== null) {

    if (!alpHigh) {

      interpretation +=
        "Alkaline phosphatase (ALP) is within the reference interval.\n\n";

    }

    else if (alpFold < 2) {

      interpretation +=
        "Alkaline phosphatase (ALP) is mildly elevated. This may reflect increased bone turnover or hepatobiliary disease.\n\n";

    }

    else {

      interpretation +=
        "Marked elevation of alkaline phosphatase suggests increased osteoblastic activity or significant hepatobiliary disease. Correlation with liver enzymes is recommended.\n\n";

    }

  }

  /* ======================================================
     VITAMIN D
  ====================================================== */

  if (vitaminD !== null) {

    if (vitaminDDeficient) {

      interpretation +=
        "Vitamin D concentration is within the deficient range and may contribute to osteomalacia, secondary hyperparathyroidism and impaired bone mineralisation.\n\n";

    }

    else if (vitaminDInsufficient) {

      interpretation +=
        "Vitamin D concentration is insufficient. Optimisation of vitamin D status may be beneficial depending on the clinical context.\n\n";

    }

    else {

      interpretation +=
        "Vitamin D concentration is adequate.\n\n";

    }

  }

  /* ======================================================
     PARATHYROID HORMONE (PTH)
  ====================================================== */

  if (pth !== null) {

    if (pthLow) {

      interpretation +=
        "Parathyroid hormone (PTH) is below the reference interval, which may occur in hypoparathyroidism or PTH-independent hypercalcaemia.\n\n";

    }

    else if (!pthHigh) {

      interpretation +=
        "Parathyroid hormone (PTH) is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Parathyroid hormone (PTH) is elevated, suggesting increased parathyroid activity. Interpretation should consider serum calcium, phosphate and vitamin D status.\n\n";

    }

  }

  /* ======================================================
     COMBINED BONE PROFILE
  ====================================================== */

  if (

    calciumLow &&
    vitaminDDeficient &&
    alpHigh

  ) {

    interpretation +=
      "Concurrent hypocalcaemia, vitamin D deficiency and elevated ALP are compatible with osteomalacia or severe vitamin D deficiency.\n\n";

  }

  else if (

    calciumHigh &&
    pthHigh

  ) {

    interpretation +=
      "Concurrent hypercalcaemia and elevated PTH strongly suggest primary hyperparathyroidism.\n\n";

  }

  else if (

    calciumLow &&
    pthLow

  ) {

    interpretation +=
      "Concurrent hypocalcaemia with a low PTH concentration is compatible with hypoparathyroidism.\n\n";

  }

  else if (

    phosphateHigh &&
    calciumLow &&
    pthHigh

  ) {

    interpretation +=
      "This biochemical pattern may occur in chronic kidney disease with secondary hyperparathyroidism (renal bone disease).\n\n";

  }

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Primary Hyperparathyroidism
  ------------------------------------------------------ */

  if (

    calciumHigh &&
    pthHigh

  ) {

    impression =
      "Biochemical findings are consistent with primary hyperparathyroidism.";

    recommendation =
      "Correlation with clinical findings, renal function and urinary calcium excretion is recommended. Endocrine assessment and parathyroid imaging may be indicated.";

  }

  /*
     Secondary Hyperparathyroidism
  ------------------------------------------------------ */

  else if (

    pthHigh &&
    (
      vitaminDDeficient ||
      calciumLow
    )

  ) {

    impression =
      "Pattern is suggestive of secondary hyperparathyroidism.";

    recommendation =
      "Evaluate for vitamin D deficiency, chronic kidney disease and disorders of calcium metabolism. Appropriate treatment of the underlying cause is recommended.";

  }

  /*
     Hypoparathyroidism
  ------------------------------------------------------ */

  else if (

    calciumLow &&
    pthLow

  ) {

    impression =
      "Biochemical findings are consistent with hypoparathyroidism.";

    recommendation =
      "Clinical correlation is recommended. Assessment of magnesium status, autoimmune disease and previous neck surgery should be considered.";

  }

  /*
     Vitamin D Deficiency
  ------------------------------------------------------ */

  else if (

    vitaminDDeficient &&
    !calciumHigh

  ) {

    impression =
      "Vitamin D deficiency.";

    recommendation =
      "Vitamin D replacement should be considered where clinically appropriate. Repeat assessment after treatment may be indicated.";

  }

  /*
     Osteomalacia
  ------------------------------------------------------ */

  else if (

    vitaminDDeficient &&
    calciumLow &&
    alpHigh

  ) {

    impression =
      "Biochemical findings are compatible with osteomalacia.";

    recommendation =
      "Clinical correlation and assessment of bone health are recommended. Vitamin D replacement and investigation of the underlying cause should be considered.";

  }

  /*
     Renal Bone Disease
  ------------------------------------------------------ */

  else if (

    phosphateHigh &&
    calciumLow &&
    pthHigh

  ) {

    impression =
      "Pattern is compatible with renal bone disease (secondary hyperparathyroidism associated with chronic kidney disease).";

    recommendation =
      "Interpret together with renal function tests. Nephrology review and management of chronic kidney disease-related mineral bone disorder may be appropriate.";

  }

  /*
     Hypercalcaemia
  ------------------------------------------------------ */

  else if (

    calciumHigh

  ) {

    impression =
      "Hypercalcaemia.";

    recommendation =
      "Interpret together with parathyroid hormone concentration, renal function, vitamin D status and clinical findings to determine the underlying cause.";

  }

  /*
     Hypocalcaemia
  ------------------------------------------------------ */

  else if (

    calciumLow

  ) {

    impression =
      "Hypocalcaemia.";

    recommendation =
      "Evaluate vitamin D status, magnesium concentration, parathyroid hormone and renal function. Clinical correlation is recommended.";

  }

  /*
     Metabolic Bone Disease
  ------------------------------------------------------ */

  else if (

    alpHigh &&
    (
      calciumLow ||
      phosphateLow
    )

  ) {

    impression =
      "Biochemical findings suggest metabolic bone disease.";

    recommendation =
      "Correlation with vitamin D status, parathyroid hormone, imaging and clinical findings is recommended.";

  }

  /*
     Normal Bone Profile
  ------------------------------------------------------ */

  else {

    impression =
      "Bone and mineral profile is within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation is advised.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("within acceptable")

  ) {

    recommendation =
      "Routine clinical correlation is advised.";

  }

  else if (

    impression.includes("primary hyperparathyroidism")

  ) {

    recommendation =
      "Assess urinary calcium excretion, renal function and bone mineral density where appropriate. Endocrinology referral and parathyroid imaging may be indicated.";

  }

  else if (

    impression.includes("secondary hyperparathyroidism")

  ) {

    recommendation =
      "Investigate vitamin D deficiency, chronic kidney disease and calcium balance. Appropriate treatment of the underlying cause is recommended.";

  }

  else if (

    impression.includes("hypoparathyroidism")

  ) {

    recommendation =
      "Evaluate serum magnesium, phosphate and vitamin D concentrations. Consider autoimmune disease or previous thyroid/parathyroid surgery where clinically appropriate.";

  }

  else if (

    impression.includes("Vitamin D deficiency")

  ) {

    recommendation =
      "Vitamin D replacement should be considered according to current clinical guidelines. Repeat testing after treatment may be appropriate.";

  }

  else if (

    impression.includes("osteomalacia")

  ) {

    recommendation =
      "Assess dietary calcium intake, vitamin D replacement, renal function and possible malabsorption. Bone imaging may be indicated in symptomatic patients.";

  }

  else if (

    impression.includes("renal bone disease")

  ) {

    recommendation =
      "Interpret together with renal function tests and nephrology assessment. Management of CKD-mineral and bone disorder (CKD-MBD) should follow current clinical guidelines.";

  }

  else if (

    impression.includes("Hypercalcaemia")

  ) {

    recommendation =
      "Further evaluation should include parathyroid hormone, vitamin D status, renal function and assessment for malignancy where clinically indicated.";

  }

  else if (

    impression.includes("Hypocalcaemia")

  ) {

    recommendation =
      "Evaluate vitamin D status, magnesium concentration, parathyroid hormone and renal function. Correct the underlying cause where appropriate.";

  }

  else if (

    impression.includes("metabolic bone disease")

  ) {

    recommendation =
      "Correlate with vitamin D, parathyroid hormone, renal function and radiological findings. Specialist assessment may be appropriate.";

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