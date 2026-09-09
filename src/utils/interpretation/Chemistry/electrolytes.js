import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   ELECTROLYTE INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Sodium (Na+)
   • Potassium (K+)
   • Chloride (Cl−)
   • Bicarbonate (HCO₃⁻ / CO₂)
   • Anion Gap (optional)

   Detects
   ----------------------------------------------------------
   • Normal electrolyte profile
   • Hyponatraemia
   • Hypernatraemia
   • Hypokalaemia
   • Hyperkalaemia
   • Hypochloraemia
   • Hyperchloraemia
   • Metabolic acidosis
   • Metabolic alkalosis
   • High anion gap metabolic acidosis
========================================================== */

export default function interpretElectrolyte(

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

  const sodium =
    getNumericResult(resultMap, "Sodium") ??
    getNumericResult(resultMap, "Na");

  const potassium =
    getNumericResult(resultMap, "Potassium") ??
    getNumericResult(resultMap, "K");

  const chloride =
    getNumericResult(resultMap, "Chloride") ??
    getNumericResult(resultMap, "Cl");

  const bicarbonate =
    getNumericResult(resultMap, "Bicarbonate") ??
    getNumericResult(resultMap, "HCO3") ??
    getNumericResult(resultMap, "CO2");

  const urea =
    getNumericResult(resultMap, "Urea");

  const creatinine =
    getNumericResult(resultMap, "Creatinine");

  /* ======================================================
     REFERENCE LIMITS
  ====================================================== */

  const NA_LOW = 135;
  const NA_HIGH = 145;

  const K_LOW = 3.5;
  const K_HIGH = 5.2;

  const CL_LOW = 98;
  const CL_HIGH = 107;

  const HCO3_LOW = 22;
  const HCO3_HIGH = 29;

  const UREA_HIGH = 7.5;

  const CREATININE_HIGH = 110;

  let interpretation = "";
  let impression = "";
  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const sodiumLow =
    sodium !== null &&
    sodium < NA_LOW;

  const sodiumHigh =
    sodium !== null &&
    sodium > NA_HIGH;

  const potassiumLow =
    potassium !== null &&
    potassium < K_LOW;

  const potassiumHigh =
    potassium !== null &&
    potassium > K_HIGH;

  const chlorideLow =
    chloride !== null &&
    chloride < CL_LOW;

  const chlorideHigh =
    chloride !== null &&
    chloride > CL_HIGH;

  const bicarbonateLow =
    bicarbonate !== null &&
    bicarbonate < HCO3_LOW;

  const bicarbonateHigh =
    bicarbonate !== null &&
    bicarbonate > HCO3_HIGH;

  const ureaHigh =
    urea !== null &&
    urea > UREA_HIGH;

  const creatinineHigh =
    creatinine !== null &&
    creatinine > CREATININE_HIGH;

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

  function isHigh(value, upperLimit) {

    return (
      value !== null &&
      value > upperLimit
    );

  }

  function isLow(value, lowerLimit) {

    return (
      value !== null &&
      value < lowerLimit
    );

  }

  function hasRenalImpairment() {

    return (
      ureaHigh ||
      creatinineHigh
    );

  }

  /* ======================================================
     SODIUM (Na+)
  ====================================================== */

  if (sodium !== null) {

    if (isLow(sodium, NA_LOW)) {

      interpretation +=
        "Serum sodium is decreased (hyponatraemia). This may occur in fluid overload states, syndrome of inappropriate antidiuretic hormone secretion (SIADH), diuretic therapy, adrenal insufficiency or gastrointestinal sodium loss.\n\n";

    }

    else if (isHigh(sodium, NA_HIGH)) {

      interpretation +=
        "Serum sodium is elevated (hypernatraemia), usually reflecting free water deficit, dehydration or impaired water intake.\n\n";

    }

    else {

      interpretation +=
        "Serum sodium is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     POTASSIUM (K+)
  ====================================================== */

  if (potassium !== null) {

    if (isLow(potassium, K_LOW)) {

      interpretation +=
        "Serum potassium is decreased (hypokalaemia). Possible causes include gastrointestinal losses, diuretic therapy, insulin administration or intracellular potassium shift. Significant hypokalaemia may predispose to cardiac arrhythmias.\n\n";

    }

    else if (isHigh(potassium, K_HIGH)) {

      interpretation +=
        "Serum potassium is elevated (hyperkalaemia). This may occur in renal impairment, metabolic acidosis, hypoaldosteronism or excessive potassium intake. Significant hyperkalaemia requires prompt clinical assessment because of the risk of life-threatening cardiac arrhythmias.\n\n";

    }

    else {

      interpretation +=
        "Serum potassium is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     SODIUM (Na+)
  ====================================================== */

  if (sodium !== null) {

    if (isLow(sodium, NA_LOW)) {

      interpretation +=
        "Serum sodium is decreased (hyponatraemia). This may occur in fluid overload states, syndrome of inappropriate antidiuretic hormone secretion (SIADH), diuretic therapy, adrenal insufficiency or gastrointestinal sodium loss.\n\n";

    }

    else if (isHigh(sodium, NA_HIGH)) {

      interpretation +=
        "Serum sodium is elevated (hypernatraemia), usually reflecting free water deficit, dehydration or impaired water intake.\n\n";

    }

    else {

      interpretation +=
        "Serum sodium is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     POTASSIUM (K+)
  ====================================================== */

  if (potassium !== null) {

    if (isLow(potassium, K_LOW)) {

      interpretation +=
        "Serum potassium is decreased (hypokalaemia). Possible causes include gastrointestinal losses, diuretic therapy, insulin administration or intracellular potassium shift. Significant hypokalaemia may predispose to cardiac arrhythmias.\n\n";

    }

    else if (isHigh(potassium, K_HIGH)) {

      interpretation +=
        "Serum potassium is elevated (hyperkalaemia). This may occur in renal impairment, metabolic acidosis, hypoaldosteronism or excessive potassium intake. Significant hyperkalaemia requires prompt clinical assessment because of the risk of life-threatening cardiac arrhythmias.\n\n";

    }

    else {

      interpretation +=
        "Serum potassium is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     CHLORIDE (Cl−)
  ====================================================== */

  if (chloride !== null) {

    if (isLow(chloride, CL_LOW)) {

      interpretation +=
        "Serum chloride is decreased (hypochloraemia). This may occur with prolonged vomiting, diuretic therapy, metabolic alkalosis or excessive gastrointestinal chloride loss.\n\n";

    }

    else if (isHigh(chloride, CL_HIGH)) {

      interpretation +=
        "Serum chloride is elevated (hyperchloraemia). This finding may be associated with dehydration, hyperchloraemic metabolic acidosis, renal tubular disorders or excessive chloride administration.\n\n";

    }

    else {

      interpretation +=
        "Serum chloride is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     BICARBONATE (HCO3−)
  ====================================================== */

  if (bicarbonate !== null) {

    if (isLow(bicarbonate, HCO3_LOW)) {

      interpretation +=
        "Serum bicarbonate is reduced, indicating metabolic acidosis or compensation for respiratory alkalosis. Clinical correlation is recommended.\n\n";

    }

    else if (isHigh(bicarbonate, HCO3_HIGH)) {

      interpretation +=
        "Serum bicarbonate is elevated, consistent with metabolic alkalosis or compensation for chronic respiratory acidosis.\n\n";

    }

    else {

      interpretation +=
        "Serum bicarbonate is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     ACID–BASE PATTERN
  ====================================================== */

  if (

    bicarbonateLow &&
    chlorideHigh

  ) {

    interpretation +=
      "The combination of low bicarbonate and elevated chloride is compatible with hyperchloraemic metabolic acidosis.\n\n";

  }

  else if (

    bicarbonateLow

  ) {

    interpretation +=
      "Reduced bicarbonate is compatible with metabolic acidosis. Correlation with blood gas analysis, serum lactate and anion gap is recommended where clinically indicated.\n\n";

  }

  else if (

    bicarbonateHigh &&
    chlorideLow

  ) {

    interpretation +=
      "Elevated bicarbonate with reduced chloride is compatible with metabolic alkalosis, commonly associated with vomiting, diuretic therapy or mineralocorticoid excess.\n\n";

  }

  else if (

    bicarbonateHigh

  ) {

    interpretation +=
      "Elevated bicarbonate is consistent with metabolic alkalosis or chronic respiratory compensation.\n\n";

  }

  /* ======================================================
     UREA
  ====================================================== */

  if (urea !== null) {

    if (urea <= UREA_HIGH) {

      interpretation +=
        "Serum urea is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum urea is elevated. This may occur with dehydration, increased protein catabolism, gastrointestinal bleeding or impaired renal function.\n\n";

    }

  }

  /* ======================================================
     CREATININE
  ====================================================== */

  if (creatinine !== null) {

    if (creatinine <= CREATININE_HIGH) {

      interpretation +=
        "Serum creatinine is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum creatinine is elevated, indicating reduced glomerular filtration rate (GFR) until proven otherwise. Correlation with estimated GFR (eGFR), urine findings and clinical assessment is recommended.\n\n";

    }

  }

  /* ======================================================
     RENAL FUNCTION ASSESSMENT
  ====================================================== */

  if (

    ureaHigh &&
    creatinineHigh

  ) {

    interpretation +=
      "Concurrent elevation of serum urea and creatinine is consistent with impaired renal function. Correlation with estimated glomerular filtration rate (eGFR), urinalysis and renal imaging may be appropriate depending on the clinical setting.\n\n";

  }

  else if (

    ureaHigh &&
    !creatinineHigh

  ) {

    interpretation +=
      "Elevation of urea with a normal creatinine may reflect dehydration, increased protein intake, gastrointestinal bleeding or enhanced protein catabolism rather than intrinsic renal impairment.\n\n";

  }

  else if (

    creatinineHigh &&
    !ureaHigh

  ) {

    interpretation +=
      "Isolated elevation of creatinine may indicate early renal impairment, reduced muscle clearance or laboratory variation. Interpretation should include estimated GFR and serial measurements where appropriate.\n\n";

  }

  else {

    interpretation +=
      "Overall renal biochemical markers are within expected laboratory limits.\n\n";

  }

  /* ======================================================
     CLINICAL PATTERN RECOGNITION
  ====================================================== */

  /*
     Acute Kidney Injury / Renal Impairment
  ------------------------------------------------------ */

  if (

    creatinineHigh &&
    ureaHigh

  ) {

    impression =
      "Biochemical findings are consistent with impaired renal function.";

    recommendation =
      "Correlation with estimated glomerular filtration rate (eGFR), urinalysis, urine output and clinical findings is recommended. Repeat renal function tests and nephrology review should be considered where appropriate.";

  }

  /*
     Dehydration / Pre-renal Pattern
  ------------------------------------------------------ */

  else if (

    sodiumHigh &&
    ureaHigh &&
    !creatinineHigh

  ) {

    impression =
      "Results are suggestive of dehydration or pre-renal azotaemia.";

    recommendation =
      "Assess hydration status and correlate with clinical findings. Repeat testing following appropriate fluid replacement may be indicated.";

  }

  /*
     Hyperkalaemia with Renal Dysfunction
  ------------------------------------------------------ */

  else if (

    potassiumHigh &&
    creatinineHigh

  ) {

    impression =
      "Hyperkalaemia associated with impaired renal function.";

    recommendation =
      "Prompt clinical assessment is recommended. ECG monitoring and urgent treatment may be required depending on potassium concentration and clinical presentation.";

  }

  /*
     Isolated Hyperkalaemia
  ------------------------------------------------------ */

  else if (

    potassiumHigh

  ) {

    impression =
      "Hyperkalaemia.";

    recommendation =
      "Exclude specimen haemolysis where appropriate. Correlate with renal function, medications and ECG findings.";

  }

  /*
     Isolated Hypokalaemia
  ------------------------------------------------------ */

  else if (

    potassiumLow

  ) {

    impression =
      "Hypokalaemia.";

    recommendation =
      "Assess for gastrointestinal loss, diuretic therapy or endocrine disorders. Potassium replacement may be required depending on severity.";

  }

  /*
     Hyponatraemia
  ------------------------------------------------------ */

  else if (

    sodiumLow

  ) {

    impression =
      "Hyponatraemia.";

    recommendation =
      "Interpret together with volume status, serum osmolality and urinary sodium where clinically indicated.";

  }

  /*
     Hypernatraemia
  ------------------------------------------------------ */

  else if (

    sodiumHigh

  ) {

    impression =
      "Hypernatraemia.";

    recommendation =
      "Evaluate hydration status and underlying cause of water deficit.";

  }

  /*
     Metabolic Acidosis
  ------------------------------------------------------ */

  else if (

    bicarbonateLow

  ) {

    impression =
      "Biochemical findings are consistent with metabolic acidosis.";

    recommendation =
      "Correlation with arterial or venous blood gas analysis, serum lactate and anion gap is recommended.";

  }

  /*
     Metabolic Alkalosis
  ------------------------------------------------------ */

  else if (

    bicarbonateHigh

  ) {

    impression =
      "Biochemical findings are consistent with metabolic alkalosis.";

    recommendation =
      "Interpret together with chloride concentration, clinical history and medication use.";

  }

  /*
     Normal Profile
  ------------------------------------------------------ */

  else {

    impression =
      "Electrolytes and renal function are within acceptable laboratory limits.";

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

    impression.includes("dehydration")

  ) {

    recommendation =
      "Assess hydration status clinically and repeat electrolyte measurements after appropriate fluid replacement where indicated.";

  }

  else if (

    impression.includes("renal function")

  ) {

    recommendation =
      "Further renal assessment including estimated glomerular filtration rate (eGFR), urinalysis, urine protein quantification and renal ultrasound should be considered where clinically appropriate.";

  }

  else if (

    impression.includes("Hyperkalaemia")

  ) {

    recommendation =
      "Prompt clinical assessment is recommended. Review medications, exclude specimen haemolysis and perform ECG monitoring where potassium elevation is clinically significant.";

  }

  else if (

    impression.includes("Hypokalaemia")

  ) {

    recommendation =
      "Investigate gastrointestinal losses, diuretic therapy, endocrine disorders and magnesium deficiency. Potassium replacement may be required depending on severity.";

  }

  else if (

    impression.includes("Hyponatraemia")

  ) {

    recommendation =
      "Interpret together with serum osmolality, urine sodium concentration and assessment of volume status to determine the underlying cause.";

  }

  else if (

    impression.includes("Hypernatraemia")

  ) {

    recommendation =
      "Evaluate hydration status and identify the underlying cause of free water deficit. Correct sodium abnormalities gradually where clinically indicated.";

  }

  else if (

    impression.includes("metabolic acidosis")

  ) {

    recommendation =
      "Blood gas analysis, serum lactate and anion gap calculation are recommended to determine the underlying cause of the metabolic acidosis.";

  }

  else if (

    impression.includes("metabolic alkalosis")

  ) {

    recommendation =
      "Review chloride concentration, gastrointestinal losses and diuretic therapy. Clinical correlation is recommended.";

  }

  /* ======================================================
     RETURN
  ====================================================== */

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}