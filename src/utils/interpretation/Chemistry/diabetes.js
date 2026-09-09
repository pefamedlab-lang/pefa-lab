import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   DIABETES INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Fasting Blood Glucose (FBG)
   • Random Blood Glucose (RBG)
   • 2-Hour OGTT Glucose
   • HbA1c
   • Estimated Average Glucose (optional)

   Detects
   ----------------------------------------------------------
   • Normal glucose regulation
   • Impaired fasting glucose
   • Impaired glucose tolerance
   • Diabetes mellitus
   • Poor glycaemic control
   • Excellent glycaemic control
   • Possible hypoglycaemia
========================================================== */

export default function interpretDiabetes(

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

  const fastingGlucose =
    getNumericResult(
      resultMap,
      "Fasting Glucose"
    ) ??
    getNumericResult(
      resultMap,
      "FBG"
    ) ??
    getNumericResult(
      resultMap,
      "Fasting Blood Glucose"
    );

  const randomGlucose =
    getNumericResult(
      resultMap,
      "Random Glucose"
    ) ??
    getNumericResult(
      resultMap,
      "RBG"
    ) ??
    getNumericResult(
      resultMap,
      "Random Blood Glucose"
    );

  const ogtt =
    getNumericResult(
      resultMap,
      "2 Hour Glucose"
    ) ??
    getNumericResult(
      resultMap,
      "OGTT"
    );

  const hba1c =
    getNumericResult(
      resultMap,
      "HbA1c"
    ) ??
    getNumericResult(
      resultMap,
      "Glycated Haemoglobin"
    );

  const eag =
    getNumericResult(
      resultMap,
      "Estimated Average Glucose"
    ) ??
    getNumericResult(
      resultMap,
      "eAG"
    );

  /* ======================================================
     REFERENCE LIMITS
     (WHO / ADA based)
  ====================================================== */

  const FBG_LOW = 3.9;
  const FBG_IFG = 5.6;
  const FBG_DIABETES = 7.0;

  const RANDOM_DIABETES = 11.1;

  const OGTT_IGT = 7.8;
  const OGTT_DIABETES = 11.1;

  const HBA1C_NORMAL = 5.7;
  const HBA1C_PREDIABETES = 6.5;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const fastingLow =
    fastingGlucose !== null &&
    fastingGlucose < FBG_LOW;

  const impairedFasting =
    fastingGlucose !== null &&
    fastingGlucose >= FBG_IFG &&
    fastingGlucose < FBG_DIABETES;

  const fastingDiabetes =
    fastingGlucose !== null &&
    fastingGlucose >= FBG_DIABETES;

  const randomDiabetes =
    randomGlucose !== null &&
    randomGlucose >= RANDOM_DIABETES;

  const impairedGlucoseTolerance =
    ogtt !== null &&
    ogtt >= OGTT_IGT &&
    ogtt < OGTT_DIABETES;

  const ogttDiabetes =
    ogtt !== null &&
    ogtt >= OGTT_DIABETES;

  const hba1cPrediabetes =
    hba1c !== null &&
    hba1c >= HBA1C_NORMAL &&
    hba1c < HBA1C_PREDIABETES;

  const hba1cDiabetes =
    hba1c !== null &&
    hba1c >= HBA1C_PREDIABETES;

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

  function isHigh(
    value,
    upperLimit
  ) {

    return (
      value !== null &&
      value >= upperLimit
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

  /* ======================================================
     FASTING BLOOD GLUCOSE (FBG)
  ====================================================== */

  if (fastingGlucose !== null) {

    if (fastingLow) {

      interpretation +=
        "Fasting blood glucose is below the reference interval, consistent with hypoglycaemia. Clinical correlation is recommended to determine the underlying cause.\n\n";

    }

    else if (fastingGlucose < FBG_IFG) {

      interpretation +=
        "Fasting blood glucose is within the normal reference interval.\n\n";

    }

    else if (impairedFasting) {

      interpretation +=
        "Fasting blood glucose is within the impaired fasting glucose (prediabetes) range, indicating an increased risk of developing diabetes mellitus.\n\n";

    }

    else {

      interpretation +=
        "Fasting blood glucose is within the diagnostic range for diabetes mellitus. Confirmation with repeat testing or an alternative diagnostic test is recommended unless unequivocal hyperglycaemia is present.\n\n";

    }

  }

  /* ======================================================
     RANDOM BLOOD GLUCOSE
  ====================================================== */

  if (randomGlucose !== null) {

    if (randomGlucose < RANDOM_DIABETES) {

      interpretation +=
        "Random blood glucose is below the diagnostic threshold for diabetes mellitus.\n\n";

    }

    else {

      interpretation +=
        "Random blood glucose is within the diagnostic range for diabetes mellitus. Diagnosis should be interpreted alongside symptoms and confirmed according to current clinical guidelines where appropriate.\n\n";

    }

  }

  /* ======================================================
     2-HOUR OGTT
  ====================================================== */

  if (ogtt !== null) {

    if (ogtt < OGTT_IGT) {

      interpretation +=
        "The 2-hour oral glucose tolerance test (OGTT) result is within the normal range.\n\n";

    }

    else if (impairedGlucoseTolerance) {

      interpretation +=
        "The 2-hour OGTT result demonstrates impaired glucose tolerance (prediabetes).\n\n";

    }

    else {

      interpretation +=
        "The 2-hour OGTT result is within the diagnostic range for diabetes mellitus.\n\n";

    }

  }

  /* ======================================================
     HbA1c
  ====================================================== */

  if (hba1c !== null) {

    if (hba1c < HBA1C_NORMAL) {

      interpretation +=
        "HbA1c is within the non-diabetic reference range.\n\n";

    }

    else if (hba1cPrediabetes) {

      interpretation +=
        "HbA1c is within the prediabetes range, indicating an increased risk of progression to diabetes mellitus.\n\n";

    }

    else {

      interpretation +=
        "HbA1c is within the diagnostic range for diabetes mellitus and reflects chronic hyperglycaemia over the preceding 2–3 months.\n\n";

    }

  }

  /* ======================================================
     ESTIMATED AVERAGE GLUCOSE (eAG)
  ====================================================== */

  if (eag !== null) {

    interpretation +=
      `Estimated average glucose (eAG) is ${eag.toFixed(1)} mmol/L, representing the approximate average blood glucose over the preceding 2–3 months.\n\n`;

  }

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Hypoglycaemia
  ------------------------------------------------------ */

  if (

    fastingLow

  ) {

    impression =
      "Biochemical findings are consistent with hypoglycaemia.";

    recommendation =
      "Interpret together with the patient's symptoms, medication history and clinical condition. Further evaluation may be required to determine the underlying cause.";

  }

  /*
     Diabetes Mellitus
  ------------------------------------------------------ */

  else if (

    fastingDiabetes ||
    randomDiabetes ||
    ogttDiabetes ||
    hba1cDiabetes

  ) {

    impression =
      "Biochemical findings are consistent with diabetes mellitus.";

    recommendation =
      "Diagnosis should be confirmed according to current clinical guidelines where appropriate. Assessment for diabetic complications and comprehensive glycaemic management are recommended.";

  }

  /*
     Prediabetes
  ------------------------------------------------------ */

  else if (

    impairedFasting ||
    impairedGlucoseTolerance ||
    hba1cPrediabetes

  ) {

    impression =
      "Biochemical findings are consistent with prediabetes.";

    recommendation =
      "Lifestyle modification is recommended, including weight management, healthy diet and regular physical activity. Repeat glycaemic assessment should be performed according to clinical guidelines.";

  }

  /*
     Poor Glycaemic Control
  ------------------------------------------------------ */

  else if (

    hba1c !== null &&
    hba1c >= 8.0

  ) {

    impression =
      "Poor long-term glycaemic control.";

    recommendation =
      "Review current diabetic management, medication adherence, dietary control and lifestyle measures. Consider treatment optimisation where appropriate.";

  }

  /*
     Acute Hyperglycaemia with Normal HbA1c
  ------------------------------------------------------ */

  else if (

    randomDiabetes &&
    hba1c !== null &&
    hba1c < HBA1C_NORMAL

  ) {

    impression =
      "Acute hyperglycaemia with a normal HbA1c.";

    recommendation =
      "Consider acute illness, physiological stress or recent-onset hyperglycaemia. Repeat glucose testing and clinical correlation are recommended.";

  }

  /*
     Discordant Glycaemic Results
  ------------------------------------------------------ */

  else if (

    fastingDiabetes &&
    hba1c !== null &&
    hba1c < HBA1C_PREDIABETES

  ) {

    impression =
      "Discordant glucose and HbA1c results.";

    recommendation =
      "Repeat testing and clinical correlation are recommended. Conditions affecting red cell survival or recent changes in glycaemic status should be considered.";

  }

  /*
     Normal Glucose Regulation
  ------------------------------------------------------ */

  else {

    impression =
      "Glucose metabolism is within acceptable laboratory limits.";

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
      "Routine clinical correlation is advised. Repeat glucose assessment where clinically indicated or as part of routine health screening.";

  }

  else if (

    impression.includes("hypoglycaemia")

  ) {

    recommendation =
      "Evaluate for diabetes treatment-related hypoglycaemia, prolonged fasting, endocrine disorders, liver disease or other underlying causes. Urgent management may be required in symptomatic patients.";

  }

  else if (

    impression.includes("prediabetes")

  ) {

    recommendation =
      "Lifestyle modification, including weight optimisation, healthy diet and regular physical activity, is recommended. Repeat glycaemic assessment should be performed according to current clinical guidelines.";

  }

  else if (

    impression.includes("diabetes mellitus")

  ) {

    recommendation =
      "Confirm the diagnosis where appropriate according to current diagnostic guidelines. Assess for diabetic complications and initiate comprehensive glycaemic management, including lifestyle measures and pharmacological therapy where indicated.";

  }

  else if (

    impression.includes("Poor long-term glycaemic control")

  ) {

    recommendation =
      "Review medication adherence, dietary habits, exercise, home glucose monitoring and treatment regimen. Consider intensification of therapy where clinically appropriate.";

  }

  else if (

    impression.includes("Acute hyperglycaemia")

  ) {

    recommendation =
      "Repeat plasma glucose testing after recovery from acute illness where appropriate. Consider stress hyperglycaemia and correlate with the clinical presentation.";

  }

  else if (

    impression.includes("Discordant")

  ) {

    recommendation =
      "Consider conditions affecting HbA1c interpretation such as haemoglobinopathies, recent blood loss, haemolysis or chronic kidney disease. Repeat testing or alternative glycaemic assessment may be appropriate.";

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