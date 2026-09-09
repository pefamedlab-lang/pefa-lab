import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   BLOOD GAS INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • pH
   • pCO₂
   • HCO₃⁻
   • Base Excess
   • pO₂
   • Oxygen Saturation (SaO₂)
   • Lactate
   • Sodium
   • Chloride
   • Potassium (optional)

   Detects
   ----------------------------------------------------------
   • Normal acid-base status
   • Metabolic acidosis
   • Metabolic alkalosis
   • Respiratory acidosis
   • Respiratory alkalosis
   • Mixed acid-base disorders
   • High anion gap acidosis
   • Respiratory failure
   • Lactic acidosis
========================================================== */

export default function interpretBloodGas(

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

  const pH =
    getNumericResult(resultMap, "pH");

  const pco2 =
    getNumericResult(resultMap, "pCO2") ??
    getNumericResult(resultMap, "PCO2");

  const hco3 =
    getNumericResult(resultMap, "HCO3") ??
    getNumericResult(resultMap, "Bicarbonate");

  const baseExcess =
    getNumericResult(resultMap, "Base Excess");

  const po2 =
    getNumericResult(resultMap, "pO2") ??
    getNumericResult(resultMap, "PO2");

  const sao2 =
    getNumericResult(resultMap, "SaO2") ??
    getNumericResult(resultMap, "Oxygen Saturation");

  const lactate =
    getNumericResult(resultMap, "Lactate");

  const sodium =
    getNumericResult(resultMap, "Sodium");

  const chloride =
    getNumericResult(resultMap, "Chloride");

  const potassium =
    getNumericResult(resultMap, "Potassium");

  /* ======================================================
     REFERENCE LIMITS
  ====================================================== */

  const PH_LOW = 7.35;
  const PH_HIGH = 7.45;

  const PCO2_LOW = 35;
  const PCO2_HIGH = 45;

  const HCO3_LOW = 22;
  const HCO3_HIGH = 28;

  const PO2_LOW = 80;

  const SAO2_LOW = 95;

  const LACTATE_HIGH = 2.0;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const acidemia =
    pH !== null &&
    pH < PH_LOW;

  const alkalemia =
    pH !== null &&
    pH > PH_HIGH;

  const respiratoryAcidosis =
    pco2 !== null &&
    pco2 > PCO2_HIGH;

  const respiratoryAlkalosis =
    pco2 !== null &&
    pco2 < PCO2_LOW;

  const metabolicAcidosis =
    hco3 !== null &&
    hco3 < HCO3_LOW;

  const metabolicAlkalosis =
    hco3 !== null &&
    hco3 > HCO3_HIGH;

  const hypoxaemia =
    po2 !== null &&
    po2 < PO2_LOW;

  const lowSaturation =
    sao2 !== null &&
    sao2 < SAO2_LOW;

  const lactateHigh =
    lactate !== null &&
    lactate > LACTATE_HIGH;

  /* ======================================================
     ANION GAP
  ====================================================== */

  const anionGap =

    sodium !== null &&
    chloride !== null &&
    hco3 !== null

      ? sodium - (chloride + hco3)

      : null;

  const highAnionGap =

    anionGap !== null &&
    anionGap > 16;

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

  function hasValue(
    value
  ) {

    return (
      value !== null &&
      !Number.isNaN(value)
    );

  }

  /* ======================================================
     pH
  ====================================================== */

  if (hasValue(pH)) {

    if (acidemia) {

      interpretation +=
        "Blood pH demonstrates acidaemia.\n\n";

    }

    else if (alkalemia) {

      interpretation +=
        "Blood pH demonstrates alkalaemia.\n\n";

    }

    else {

      interpretation +=
        "Blood pH is within the physiological reference interval.\n\n";

    }

  }

  /* ======================================================
     pCO₂
  ====================================================== */

  if (hasValue(pco2)) {

    if (respiratoryAcidosis) {

      interpretation +=
        "Partial pressure of carbon dioxide (pCO₂) is elevated, indicating respiratory carbon dioxide retention.\n\n";

    }

    else if (respiratoryAlkalosis) {

      interpretation +=
        "Partial pressure of carbon dioxide (pCO₂) is reduced, consistent with hyperventilation.\n\n";

    }

    else {

      interpretation +=
        "Partial pressure of carbon dioxide (pCO₂) is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     HCO₃⁻
  ====================================================== */

  if (hasValue(hco3)) {

    if (metabolicAcidosis) {

      interpretation +=
        "Bicarbonate concentration is reduced, indicating a metabolic acid-base disturbance.\n\n";

    }

    else if (metabolicAlkalosis) {

      interpretation +=
        "Bicarbonate concentration is elevated, indicating a metabolic alkalotic process.\n\n";

    }

    else {

      interpretation +=
        "Bicarbonate concentration is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     BASE EXCESS
  ====================================================== */

  if (hasValue(baseExcess)) {

    if (baseExcess < -2) {

      interpretation +=
        "Negative base excess supports the presence of metabolic acidosis.\n\n";

    }

    else if (baseExcess > 2) {

      interpretation +=
        "Positive base excess supports the presence of metabolic alkalosis.\n\n";

    }

    else {

      interpretation +=
        "Base excess is within the expected range.\n\n";

    }

  }

  /* ======================================================
     pO₂
  ====================================================== */

  if (hasValue(po2)) {

    if (hypoxaemia) {

      interpretation +=
        "Partial pressure of oxygen (pO₂) is reduced, indicating hypoxaemia.\n\n";

    }

    else {

      interpretation +=
        "Partial pressure of oxygen (pO₂) is adequate.\n\n";

    }

  }

  /* ======================================================
     OXYGEN SATURATION
  ====================================================== */

  if (hasValue(sao2)) {

    if (lowSaturation) {

      interpretation +=
        "Oxygen saturation is below the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Oxygen saturation is within the expected range.\n\n";

    }

  }

  /* ======================================================
     LACTATE
  ====================================================== */

  if (hasValue(lactate)) {

    if (lactateHigh) {

      interpretation +=
        "Lactate is elevated, indicating hyperlactataemia. Causes include tissue hypoperfusion, sepsis, seizures or impaired lactate clearance.\n\n";

    }

    else {

      interpretation +=
        "Lactate concentration is within the reference interval.\n\n";

    }

  }

  /* ======================================================
     ANION GAP
  ====================================================== */

  if (anionGap !== null) {

    interpretation +=
      `Calculated anion gap is ${anionGap.toFixed(1)} mmol/L.\n\n`;

    if (highAnionGap) {

      interpretation +=
        "The anion gap is elevated, supporting the presence of a high anion gap metabolic acidosis.\n\n";

    }

    else {

      interpretation +=
        "The calculated anion gap is within the expected range.\n\n";

    }

  }

  /* ======================================================
     OXYGENATION SUMMARY
  ====================================================== */

  if (

    hypoxaemia &&
    lowSaturation

  ) {

    interpretation +=
      "Reduced oxygen tension together with reduced oxygen saturation confirms impaired oxygenation.\n\n";

  }

  /* ======================================================
     METABOLIC ACIDOSIS SUMMARY
  ====================================================== */

  if (

    metabolicAcidosis &&
    lactateHigh

  ) {

    interpretation +=
      "Concurrent metabolic acidosis and hyperlactataemia are compatible with lactic acidosis in the appropriate clinical setting.\n\n";

  }

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     High Anion Gap Metabolic Acidosis
  ------------------------------------------------------ */

  if (

    acidemia &&
    metabolicAcidosis &&
    highAnionGap

  ) {

    impression =
      "High anion gap metabolic acidosis.";

    recommendation =
      "Consider diabetic ketoacidosis, lactic acidosis, uraemia or toxin ingestion. Correlate with glucose, ketones, renal function, lactate and the clinical findings.";

  }

  /*
     Lactic Acidosis
  ------------------------------------------------------ */

  else if (

    acidemia &&
    metabolicAcidosis &&
    lactateHigh

  ) {

    impression =
      "Metabolic acidosis with hyperlactataemia (lactic acidosis).";

    recommendation =
      "Urgent assessment is recommended. Evaluate for sepsis, shock, hypoxia, seizures or impaired tissue perfusion.";

  }

  /*
     Metabolic Acidosis
  ------------------------------------------------------ */

  else if (

    acidemia &&
    metabolicAcidosis &&
    !respiratoryAcidosis

  ) {

    impression =
      "Primary metabolic acidosis.";

    recommendation =
      "Interpret together with the anion gap, renal function, glucose, ketones and lactate to determine the underlying cause.";

  }

  /*
     Metabolic Alkalosis
  ------------------------------------------------------ */

  else if (

    alkalemia &&
    metabolicAlkalosis

  ) {

    impression =
      "Primary metabolic alkalosis.";

    recommendation =
      "Consider vomiting, diuretic therapy, mineralocorticoid excess or excessive alkali administration.";

  }

  /*
     Respiratory Acidosis
  ------------------------------------------------------ */

  else if (

    acidemia &&
    respiratoryAcidosis

  ) {

    impression =
      "Primary respiratory acidosis.";

    recommendation =
      "Evaluate for hypoventilation, chronic obstructive pulmonary disease, neuromuscular disease or central respiratory depression.";

  }

  /*
     Respiratory Alkalosis
  ------------------------------------------------------ */

  else if (

    alkalemia &&
    respiratoryAlkalosis

  ) {

    impression =
      "Primary respiratory alkalosis.";

    recommendation =
      "Consider anxiety-related hyperventilation, pulmonary embolism, hypoxaemia, pregnancy or early sepsis.";

  }

  /*
     Mixed Metabolic and Respiratory Acidosis
  ------------------------------------------------------ */

  else if (

    acidemia &&
    metabolicAcidosis &&
    respiratoryAcidosis

  ) {

    impression =
      "Mixed metabolic and respiratory acidosis.";

    recommendation =
      "Urgent clinical evaluation is recommended as this pattern may occur in critically ill patients.";

  }

  /*
     Mixed Metabolic and Respiratory Alkalosis
  ------------------------------------------------------ */

  else if (

    alkalemia &&
    metabolicAlkalosis &&
    respiratoryAlkalosis

  ) {

    impression =
      "Mixed metabolic and respiratory alkalosis.";

    recommendation =
      "Interpret together with the patient's clinical condition and medication history.";

  }

  /*
     Type I Respiratory Failure
  ------------------------------------------------------ */

  else if (

    hypoxaemia &&
    !respiratoryAcidosis

  ) {

    impression =
      "Hypoxaemic respiratory failure (Type I respiratory failure).";

    recommendation =
      "Clinical correlation and assessment of pulmonary disease are recommended.";

  }

  /*
     Type II Respiratory Failure
  ------------------------------------------------------ */

  else if (

    hypoxaemia &&
    respiratoryAcidosis

  ) {

    impression =
      "Hypercapnic respiratory failure (Type II respiratory failure).";

    recommendation =
      "Urgent respiratory assessment is recommended. Correlate with ventilatory status and underlying pulmonary or neuromuscular disease.";

  }

  /*
     Possible Diabetic Ketoacidosis
  ------------------------------------------------------ */

  else if (

    acidemia &&
    metabolicAcidosis &&
    highAnionGap &&
    lactate === null

  ) {

    impression =
      "High anion gap metabolic acidosis. Diabetic ketoacidosis should be considered where clinically appropriate.";

    recommendation =
      "Correlate with blood glucose, serum ketones, renal function and clinical findings.";

  }

  /*
     Normal Blood Gas
  ------------------------------------------------------ */

  else {

    impression =
      "Blood gas findings are within acceptable physiological limits.";

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

    impression.includes("High anion gap metabolic acidosis")

  ) {

    recommendation =
      "Urgent evaluation is recommended. Correlate with serum glucose, ketones, lactate, renal function and toxicology where clinically indicated.";

  }

  else if (

    impression.includes("lactic acidosis")

  ) {

    recommendation =
      "Investigate for sepsis, shock, tissue hypoperfusion, severe hypoxaemia or seizures. Serial lactate measurements are recommended to monitor response to treatment.";

  }

  else if (

    impression.includes("Primary metabolic acidosis")

  ) {

    recommendation =
      "Interpret together with anion gap, renal function, glucose, ketones and lactate. Identify and treat the underlying cause.";

  }

  else if (

    impression.includes("Primary metabolic alkalosis")

  ) {

    recommendation =
      "Review fluid status, serum electrolytes, medication history (especially diuretics) and gastrointestinal losses. Correct the underlying disorder.";

  }

  else if (

    impression.includes("Primary respiratory acidosis")

  ) {

    recommendation =
      "Assess airway, ventilation and underlying respiratory disease. Consider arterial blood gas monitoring and ventilatory support where clinically appropriate.";

  }

  else if (

    impression.includes("Primary respiratory alkalosis")

  ) {

    recommendation =
      "Evaluate for hyperventilation, pulmonary disease, anxiety, pregnancy or early sepsis. Manage the underlying cause.";

  }

  else if (

    impression.includes("Mixed metabolic and respiratory")

  ) {

    recommendation =
      "This mixed acid-base disturbance usually indicates significant illness. Urgent clinical assessment and management of the underlying cause are recommended.";

  }

  else if (

    impression.includes("Type I respiratory failure")

  ) {

    recommendation =
      "Assess oxygenation, perform chest imaging where indicated and initiate appropriate oxygen therapy while treating the underlying pulmonary disorder.";

  }

  else if (

    impression.includes("Type II respiratory failure")

  ) {

    recommendation =
      "Urgent respiratory assessment is required. Consider ventilatory support where appropriate and investigate causes of alveolar hypoventilation.";

  }

  else if (

    impression.includes("Diabetic ketoacidosis")

  ) {

    recommendation =
      "Immediately assess blood glucose, serum or capillary ketones, electrolytes and renal function. Initiate diabetic ketoacidosis management according to institutional protocols if confirmed.";

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