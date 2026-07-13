import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   ELECTROLYTE INTERPRETATION ENGINE
========================================================== */

export default function interpretElectrolytes(

  report = {},

  resultMap = {}

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
    ) ??

    getNumericResult(
      resultMap,
      "HCO3"
    );

  const glucose =
    getNumericResult(
      resultMap,
      "Glucose"
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

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     SODIUM
  ====================================================== */

  if (sodium !== null) {

    if (sodium < 135) {

      interpretation +=
        "Serum sodium is reduced (hyponatraemia).\n\n";

    }

    else if (sodium <= 145) {

      interpretation +=
        "Serum sodium is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum sodium is elevated (hypernatraemia).\n\n";

    }

  }

  /* ======================================================
     POTASSIUM
  ====================================================== */

  if (potassium !== null) {

    if (potassium < 3.5) {

      interpretation +=
        "Serum potassium is reduced (hypokalaemia).\n\n";

    }

    else if (potassium <= 5.0) {

      interpretation +=
        "Serum potassium is within the reference interval.\n\n";

    }

    else if (potassium <= 6.0) {

      interpretation +=
        "Serum potassium is elevated (hyperkalaemia).\n\n";

    }

    else {

      interpretation +=
        "Severe hyperkalaemia detected. This may predispose to life-threatening cardiac arrhythmias.\n\n";

    }

  }

  /* ======================================================
     CHLORIDE
  ====================================================== */

  if (chloride !== null) {

    if (chloride < 98) {

      interpretation +=
        "Serum chloride is reduced.\n\n";

    }

    else if (chloride <= 107) {

      interpretation +=
        "Serum chloride is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum chloride is elevated.\n\n";

    }

  }

  /* ======================================================
     BICARBONATE
  ====================================================== */

  if (bicarbonate !== null) {

    if (bicarbonate < 22) {

      interpretation +=
        "Serum bicarbonate is reduced, suggesting metabolic acidosis.\n\n";

    }

    else if (bicarbonate <= 30) {

      interpretation +=
        "Serum bicarbonate is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum bicarbonate is elevated, suggesting metabolic alkalosis.\n\n";

    }

  }

  /* ======================================================
     ANION GAP
  ====================================================== */

  let anionGap = null;

  if (

    sodium !== null &&

    chloride !== null &&

    bicarbonate !== null

  ) {

    anionGap =
      sodium -
      chloride -
      bicarbonate;

    interpretation +=
      `Calculated anion gap is ${anionGap.toFixed(1)} mmol/L.\n\n`;

  }

  /* ======================================================
     HIGH ANION GAP METABOLIC ACIDOSIS
  ====================================================== */

  if (

    anionGap !== null &&

    anionGap > 16 &&

    bicarbonate < 22

  ) {

    impression =
      "High anion gap metabolic acidosis.";

    recommendation =
      "Evaluate for diabetic ketoacidosis, lactic acidosis, renal failure or toxic ingestions.";

  }

  /* ======================================================
     HYPERCHLORAEMIC ACIDOSIS
  ====================================================== */

  else if (

    bicarbonate < 22 &&

    chloride > 107

  ) {

    impression =
      "Hyperchloraemic metabolic acidosis.";

    recommendation =
      "Consider diarrhoea, renal tubular acidosis or excessive saline administration.";

  }

  /* ======================================================
     METABOLIC ALKALOSIS
  ====================================================== */

  else if (

    bicarbonate > 30

  ) {

    impression =
      "Metabolic alkalosis.";

    recommendation =
      "Correlate with vomiting, diuretic therapy and volume status.";

  }

  /* ======================================================
     HYPONATRAEMIA
  ====================================================== */

  else if (

    sodium < 135

  ) {

    impression =
      "Hyponatraemia.";

    recommendation =
      "Assess hydration status, urine sodium and serum osmolality.";

  }

  /* ======================================================
     HYPERNATRAEMIA
  ====================================================== */

  else if (

    sodium > 145

  ) {

    impression =
      "Hypernatraemia.";

    recommendation =
      "Clinical assessment for dehydration or diabetes insipidus is recommended.";

  }

  /* ======================================================
     HYPOKALAEMIA
  ====================================================== */

  else if (

    potassium < 3.5

  ) {

    impression =
      "Hypokalaemia.";

    recommendation =
      "Assess gastrointestinal losses, medications and serum magnesium.";

  }

  /* ======================================================
     HYPERKALAEMIA
  ====================================================== */

  else if (

    potassium > 5.0

  ) {

    impression =
      "Hyperkalaemia.";

    recommendation =
      "Repeat urgently if unexpected. ECG monitoring is advised, especially when potassium exceeds 6.0 mmol/L.";

  }

  /* ======================================================
     DEHYDRATION
  ====================================================== */

  if (

    sodium > 145 &&

    urea > 8.3 &&

    creatinine <= 120

  ) {

    interpretation +=
      "The biochemical pattern is compatible with dehydration.\n\n";

  }

  /* ======================================================
     POSSIBLE DKA
  ====================================================== */

  if (

    glucose >= 11.1 &&

    bicarbonate < 18 &&

    anionGap > 16

  ) {

    impression =
      "Biochemical findings are suggestive of diabetic ketoacidosis.";

    recommendation =
      "Urgent clinical evaluation with blood ketones, arterial blood gases and immediate treatment is recommended.";

  }

  /* ======================================================
     ADDISONIAN PATTERN
  ====================================================== */

  if (

    sodium < 135 &&

    potassium > 5.0

  ) {

    interpretation +=
      "The combination of hyponatraemia and hyperkalaemia may be seen in adrenal insufficiency.\n\n";

  }

  /* ======================================================
     SIADH PATTERN
  ====================================================== */

  if (

    sodium < 130 &&

    urea < 3.0

  ) {

    interpretation +=
      "This biochemical pattern may be compatible with syndrome of inappropriate antidiuretic hormone secretion (SIADH).\n\n";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  if (!impression) {

    impression =
      "Electrolyte profile is within acceptable laboratory limits.";

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