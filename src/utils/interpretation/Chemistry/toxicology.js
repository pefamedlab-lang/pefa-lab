import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   TOXICOLOGY INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Ethanol
   • Paracetamol (Acetaminophen)
   • Salicylate
   • Lithium
   • Digoxin
   • Carboxyhaemoglobin (COHb)
   • Methaemoglobin (MetHb)

   Detects
   ----------------------------------------------------------
   • Normal toxicology profile
   • Alcohol intoxication
   • Paracetamol toxicity
   • Salicylate toxicity
   • Lithium toxicity
   • Digoxin toxicity
   • Carbon monoxide exposure
   • Methaemoglobinaemia
========================================================== */

export default function interpretToxicology(

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

  const ethanol =
    getNumericResult(resultMap, "Ethanol");

  const paracetamol =
    getNumericResult(resultMap, "Paracetamol") ??
    getNumericResult(resultMap, "Acetaminophen");

  const salicylate =
    getNumericResult(resultMap, "Salicylate");

  const lithium =
    getNumericResult(resultMap, "Lithium");

  const digoxin =
    getNumericResult(resultMap, "Digoxin");

  const cohb =
    getNumericResult(resultMap, "Carboxyhaemoglobin") ??
    getNumericResult(resultMap, "COHb");

  const methb =
    getNumericResult(resultMap, "Methaemoglobin") ??
    getNumericResult(resultMap, "MetHb");

  /* ======================================================
     REFERENCE LIMITS
  ====================================================== */

  const ETHANOL_ULN = 10;      // mg/dL (or local equivalent)
  const PARACETAMOL_ULN = 20;  // mg/L (timing dependent)
  const SALICYLATE_ULN = 300;  // mg/L
  const LITHIUM_ULN = 1.2;     // mmol/L
  const DIGOXIN_ULN = 2.0;     // ng/mL
  const COHB_ULN = 3;          // %
  const METHB_ULN = 2;         // %

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const ethanolHigh =
    ethanol !== null &&
    ethanol > ETHANOL_ULN;

  const paracetamolHigh =
    paracetamol !== null &&
    paracetamol > PARACETAMOL_ULN;

  const salicylateHigh =
    salicylate !== null &&
    salicylate > SALICYLATE_ULN;

  const lithiumHigh =
    lithium !== null &&
    lithium > LITHIUM_ULN;

  const digoxinHigh =
    digoxin !== null &&
    digoxin > DIGOXIN_ULN;

  const cohbHigh =
    cohb !== null &&
    cohb > COHB_ULN;

  const methbHigh =
    methb !== null &&
    methb > METHB_ULN;

  /* ======================================================
     SEVERE TOXICITY FLAGS
  ====================================================== */

  const severeEthanol =
    ethanol !== null &&
    ethanol >= 300;

  const severeParacetamol =
    paracetamol !== null &&
    paracetamol >= 150;

  const severeSalicylate =
    salicylate !== null &&
    salicylate >= 500;

  const severeLithium =
    lithium !== null &&
    lithium >= 2.5;

  const severeDigoxin =
    digoxin !== null &&
    digoxin >= 4.0;

  const severeCOHb =
    cohb !== null &&
    cohb >= 20;

  const severeMetHb =
    methb !== null &&
    methb >= 20;

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

  function hasValue(
    value
  ) {

    return (
      value !== null &&
      !Number.isNaN(value)
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

  const ethanolFold =
    foldIncrease(
      ethanol,
      ETHANOL_ULN
    );

  const paracetamolFold =
    foldIncrease(
      paracetamol,
      PARACETAMOL_ULN
    );

  const salicylateFold =
    foldIncrease(
      salicylate,
      SALICYLATE_ULN
    );

  const lithiumFold =
    foldIncrease(
      lithium,
      LITHIUM_ULN
    );

  const digoxinFold =
    foldIncrease(
      digoxin,
      DIGOXIN_ULN
    );

  /* ======================================================
     ETHANOL
  ====================================================== */

  if (hasValue(ethanol)) {

    if (!ethanolHigh) {

      interpretation +=
        "Blood ethanol concentration is within the reference interval.\n\n";

    }

    else if (ethanol < 80) {

      interpretation +=
        "Blood ethanol concentration is elevated, indicating recent alcohol consumption. Clinical impairment varies according to individual tolerance.\n\n";

    }

    else if (!severeEthanol) {

      interpretation +=
        "Blood ethanol concentration is consistent with significant alcohol intoxication. Clinical correlation is recommended.\n\n";

    }

    else {

      interpretation +=
        "Blood ethanol concentration is markedly elevated and may be associated with severe intoxication, respiratory depression and coma.\n\n";

    }

  }

  /* ======================================================
     PARACETAMOL
  ====================================================== */

  if (hasValue(paracetamol)) {

    if (!paracetamolHigh) {

      interpretation +=
        "Paracetamol concentration is within the expected range. Interpretation must consider the time since ingestion.\n\n";

    }

    else if (!severeParacetamol) {

      interpretation +=
        "Paracetamol concentration is elevated. Interpretation should be performed using the Rumack-Matthew nomogram where an acute overdose is suspected.\n\n";

    }

    else {

      interpretation +=
        "Markedly elevated paracetamol concentration. Potentially toxic exposure should be considered and urgent assessment is recommended.\n\n";

    }

  }

  /* ======================================================
     SALICYLATE
  ====================================================== */

  if (hasValue(salicylate)) {

    if (!salicylateHigh) {

      interpretation +=
        "Salicylate concentration is within the expected range.\n\n";

    }

    else if (!severeSalicylate) {

      interpretation +=
        "Salicylate concentration is elevated. Clinical correlation is recommended, particularly if symptoms of salicylate toxicity are present.\n\n";

    }

    else {

      interpretation +=
        "Marked salicylate elevation is compatible with significant salicylate toxicity.\n\n";

    }

  }

  /* ======================================================
     LITHIUM
  ====================================================== */

  if (hasValue(lithium)) {

    if (!lithiumHigh) {

      interpretation +=
        "Lithium concentration is within the therapeutic range.\n\n";

    }

    else if (!severeLithium) {

      interpretation +=
        "Lithium concentration is above the therapeutic range and increases the risk of lithium toxicity.\n\n";

    }

    else {

      interpretation +=
        "Marked lithium elevation is compatible with severe lithium toxicity.\n\n";

    }

  }

  /* ======================================================
     DIGOXIN
  ====================================================== */

  if (hasValue(digoxin)) {

    if (!digoxinHigh) {

      interpretation +=
        "Digoxin concentration is within the therapeutic range.\n\n";

    }

    else if (!severeDigoxin) {

      interpretation +=
        "Digoxin concentration is elevated and may be associated with digoxin toxicity in susceptible patients.\n\n";

    }

    else {

      interpretation +=
        "Markedly elevated digoxin concentration is compatible with severe digoxin toxicity.\n\n";

    }

  }

  /* ======================================================
     CARBOXYHAEMOGLOBIN
  ====================================================== */

  if (hasValue(cohb)) {

    if (!cohbHigh) {

      interpretation +=
        "Carboxyhaemoglobin concentration is within the expected range.\n\n";

    }

    else if (!severeCOHb) {

      interpretation +=
        "Carboxyhaemoglobin is elevated, indicating carbon monoxide exposure. Clinical correlation is recommended.\n\n";

    }

    else {

      interpretation +=
        "Marked elevation of carboxyhaemoglobin is consistent with significant carbon monoxide poisoning.\n\n";

    }

  }

  /* ======================================================
     METHAEMOGLOBIN
  ====================================================== */

  if (hasValue(methb)) {

    if (!methbHigh) {

      interpretation +=
        "Methaemoglobin concentration is within the reference interval.\n\n";

    }

    else if (!severeMetHb) {

      interpretation +=
        "Methaemoglobin concentration is elevated and may contribute to impaired oxygen delivery.\n\n";

    }

    else {

      interpretation +=
        "Marked methaemoglobinaemia is present and may require urgent treatment depending on the clinical presentation.\n\n";

    }

  }

  /* ======================================================
     GENERAL COMMENT
  ====================================================== */

  interpretation +=
    "Drug and toxin concentrations should always be interpreted together with the time of exposure, clinical presentation, concurrent medications and other relevant laboratory investigations.\n\n";

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Multiple Toxic Exposures
  ------------------------------------------------------ */

  if (

    [
      ethanolHigh,
      paracetamolHigh,
      salicylateHigh,
      lithiumHigh,
      digoxinHigh,
      cohbHigh,
      methbHigh,

    ].filter(Boolean).length >= 2

  ) {

    impression =
      "Multiple toxicological abnormalities detected.";

    recommendation =
      "Urgent clinical assessment is recommended. Correlate with the patient's history, examination findings and additional toxicology investigations.";

  }

  /*
     Severe Carbon Monoxide Poisoning
  ------------------------------------------------------ */

  else if (

    severeCOHb

  ) {

    impression =
      "Findings are consistent with significant carbon monoxide poisoning.";

    recommendation =
      "Immediate administration of high-flow oxygen is recommended. Consider hyperbaric oxygen therapy where clinically indicated.";

  }

  /*
     Severe Methaemoglobinaemia
  ------------------------------------------------------ */

  else if (

    severeMetHb

  ) {

    impression =
      "Significant methaemoglobinaemia.";

    recommendation =
      "Urgent clinical evaluation is required. Consider methylene blue therapy where appropriate and investigate the underlying cause.";

  }

  /*
     Severe Lithium Toxicity
  ------------------------------------------------------ */

  else if (

    severeLithium

  ) {

    impression =
      "Severe lithium toxicity.";

    recommendation =
      "Immediate clinical assessment is required. Repeat lithium concentration, assess renal function and consider haemodialysis according to current treatment guidelines.";

  }

  /*
     Severe Digoxin Toxicity
  ------------------------------------------------------ */

  else if (

    severeDigoxin

  ) {

    impression =
      "Severe digoxin toxicity.";

    recommendation =
      "Urgent cardiac monitoring is recommended. Evaluate serum potassium, ECG findings and consider digoxin-specific antibody fragments where indicated.";

  }

  /*
     Significant Paracetamol Toxicity
  ------------------------------------------------------ */

  else if (

    severeParacetamol

  ) {

    impression =
      "Potentially toxic paracetamol exposure.";

    recommendation =
      "Interpret the concentration using the Rumack–Matthew nomogram where applicable. Consider N-acetylcysteine treatment according to local poisoning guidelines.";

  }

  /*
     Significant Salicylate Toxicity
  ------------------------------------------------------ */

  else if (

    severeSalicylate

  ) {

    impression =
      "Significant salicylate toxicity.";

    recommendation =
      "Assess acid-base status, renal function and serum electrolytes. Urinary alkalinisation or haemodialysis may be required depending on severity.";

  }

  /*
     Alcohol Intoxication
  ------------------------------------------------------ */

  else if (

    ethanolHigh

  ) {

    impression =
      "Alcohol intoxication.";

    recommendation =
      "Interpret together with neurological status, blood glucose and clinical findings. Monitor airway and cardiorespiratory function where appropriate.";

  }

  /*
     Mild Carbon Monoxide Exposure
  ------------------------------------------------------ */

  else if (

    cohbHigh

  ) {

    impression =
      "Carbon monoxide exposure.";

    recommendation =
      "Correlate with exposure history and clinical symptoms. Repeat measurement after oxygen therapy if clinically indicated.";

  }

  /*
     Mild Methaemoglobinaemia
  ------------------------------------------------------ */

  else if (

    methbHigh

  ) {

    impression =
      "Methaemoglobinaemia.";

    recommendation =
      "Review medication and chemical exposure history. Correlate with oxygen saturation and clinical findings.";

  }

  /*
     Therapeutic Toxicology Profile
  ------------------------------------------------------ */

  else {

    impression =
      "No significant toxicological abnormality detected.";

    recommendation =
      "Interpret laboratory findings together with the patient's clinical presentation and exposure history.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("No significant toxicological abnormality")

  ) {

    recommendation =
      "Interpret laboratory findings together with the patient's clinical presentation and exposure history.";

  }

  else if (

    impression.includes("Multiple toxicological abnormalities")

  ) {

    recommendation =
      "Urgent toxicology consultation is recommended. Assess airway, breathing and circulation, perform ECG monitoring where indicated, and investigate for additional toxic substances.";

  }

  else if (

    impression.includes("Alcohol intoxication")

  ) {

    recommendation =
      "Monitor neurological status, airway protection and blood glucose. Provide supportive care and investigate for associated trauma or co-ingested substances where appropriate.";

  }

  else if (

    impression.includes("paracetamol")

  ) {

    recommendation =
      "Interpret the result in relation to the time since ingestion using the Rumack–Matthew nomogram where applicable. Assess liver function and initiate N-acetylcysteine therapy if indicated.";

  }

  else if (

    impression.includes("salicylate")

  ) {

    recommendation =
      "Monitor acid-base status, renal function and electrolytes. Consider urinary alkalinisation or haemodialysis in severe poisoning according to current treatment guidelines.";

  }

  else if (

    impression.includes("lithium")

  ) {

    recommendation =
      "Repeat lithium concentration, assess renal function and hydration status, and obtain ECG monitoring. Consider nephrology consultation and haemodialysis for severe toxicity.";

  }

  else if (

    impression.includes("digoxin")

  ) {

    recommendation =
      "Continuous ECG monitoring is recommended. Measure serum potassium and renal function. Consider digoxin immune Fab where clinically indicated.";

  }

  else if (

    impression.includes("carbon monoxide")

  ) {

    recommendation =
      "Administer 100% oxygen immediately. Evaluate the need for hyperbaric oxygen therapy based on clinical status, COHb concentration and local treatment protocols.";

  }

  else if (

    impression.includes("methaemoglobinaemia")

  ) {

    recommendation =
      "Identify and discontinue the causative agent where possible. Assess symptom severity and consider methylene blue therapy when clinically indicated.";

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