import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   LIPID PROFILE INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Total Cholesterol
   • Triglyceride
   • HDL Cholesterol
   • LDL Cholesterol
   • VLDL (optional)
   • Non-HDL Cholesterol (optional)

   Detects
   ----------------------------------------------------------
   • Normal lipid profile
   • Isolated hypercholesterolaemia
   • Hypertriglyceridaemia
   • Low HDL cholesterol
   • Elevated LDL cholesterol
   • Mixed dyslipidaemia
   • Atherogenic dyslipidaemia
========================================================== */

export default function interpretLipid(

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

  const totalCholesterol =
    getNumericResult(
      resultMap,
      "Total Cholesterol"
    ) ??
    getNumericResult(
      resultMap,
      "Cholesterol"
    );

  const triglyceride =
    getNumericResult(
      resultMap,
      "Triglyceride"
    ) ??
    getNumericResult(
      resultMap,
      "Triglycerides"
    );

  const hdl =
    getNumericResult(
      resultMap,
      "HDL"
    ) ??
    getNumericResult(
      resultMap,
      "HDL Cholesterol"
    );

  const ldl =
    getNumericResult(
      resultMap,
      "LDL"
    ) ??
    getNumericResult(
      resultMap,
      "LDL Cholesterol"
    );

  const vldl =
    getNumericResult(
      resultMap,
      "VLDL"
    );

  const nonHdl =
    getNumericResult(
      resultMap,
      "Non-HDL"
    ) ??
    getNumericResult(
      resultMap,
      "Non HDL Cholesterol"
    );

  /* ======================================================
     REFERENCE LIMITS
     (Adult Reference / Treatment Targets)
  ====================================================== */

  const TC_HIGH = 5.2;
  const TG_HIGH = 1.7;
  const HDL_LOW = 1.0;
  const HDL_HIGH = 1.6;
  const LDL_HIGH = 3.4;
  const NON_HDL_HIGH = 4.1;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const tcHigh =
    totalCholesterol !== null &&
    totalCholesterol > TC_HIGH;

  const tgHigh =
    triglyceride !== null &&
    triglyceride > TG_HIGH;

  const hdlLow =
    hdl !== null &&
    hdl < HDL_LOW;

  const hdlHigh =
    hdl !== null &&
    hdl >= HDL_HIGH;

  const ldlHigh =
    ldl !== null &&
    ldl > LDL_HIGH;

  const nonHdlHigh =
    nonHdl !== null &&
    nonHdl > NON_HDL_HIGH;

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

  /* ======================================================
     TOTAL CHOLESTEROL
  ====================================================== */

  if (totalCholesterol !== null) {

    if (totalCholesterol < 5.2) {

      interpretation +=
        "Total cholesterol is within the desirable reference range.\n\n";

    }

    else if (totalCholesterol < 6.2) {

      interpretation +=
        "Total cholesterol is mildly elevated (borderline high), indicating an increased long-term risk of atherosclerotic cardiovascular disease.\n\n";

    }

    else {

      interpretation +=
        "Total cholesterol is significantly elevated, consistent with hypercholesterolaemia and an increased risk of cardiovascular disease.\n\n";

    }

  }

  /* ======================================================
     TRIGLYCERIDES
  ====================================================== */

  if (triglyceride !== null) {

    if (triglyceride < 1.7) {

      interpretation +=
        "Serum triglycerides are within the desirable reference interval.\n\n";

    }

    else if (triglyceride < 2.3) {

      interpretation +=
        "Triglycerides are mildly elevated.\n\n";

    }

    else if (triglyceride < 5.6) {

      interpretation +=
        "Triglycerides are moderately elevated, which may be associated with insulin resistance, diabetes mellitus, obesity or excessive alcohol intake.\n\n";

    }

    else {

      interpretation +=
        "Marked hypertriglyceridaemia is present, increasing the risk of acute pancreatitis as well as cardiovascular disease.\n\n";

    }

  }

  /* ======================================================
     HDL CHOLESTEROL
  ====================================================== */

  if (hdl !== null) {

    if (hdl < HDL_LOW) {

      interpretation +=
        "HDL cholesterol is reduced. Low HDL cholesterol is an independent cardiovascular risk factor.\n\n";

    }

    else if (hdl >= HDL_HIGH) {

      interpretation +=
        "HDL cholesterol is elevated, which is generally considered cardioprotective.\n\n";

    }

    else {

      interpretation +=
        "HDL cholesterol is within the acceptable reference interval.\n\n";

    }

  }

  /* ======================================================
     LDL CHOLESTEROL
  ====================================================== */

  if (ldl !== null) {

    if (ldl < 2.6) {

      interpretation +=
        "LDL cholesterol is within the optimal range.\n\n";

    }

    else if (ldl < 3.4) {

      interpretation +=
        "LDL cholesterol is near optimal.\n\n";

    }

    else if (ldl < 4.1) {

      interpretation +=
        "LDL cholesterol is mildly elevated.\n\n";

    }

    else if (ldl < 4.9) {

      interpretation +=
        "LDL cholesterol is moderately elevated and is associated with increased cardiovascular risk.\n\n";

    }

    else {

      interpretation +=
        "LDL cholesterol is markedly elevated, suggesting a high risk for atherosclerotic cardiovascular disease. Familial hypercholesterolaemia should be considered where clinically appropriate.\n\n";

    }

  }

  /* ======================================================
     NON-HDL CHOLESTEROL
  ====================================================== */

  if (nonHdl !== null) {

    if (nonHdl <= NON_HDL_HIGH) {

      interpretation +=
        "Non-HDL cholesterol is within the recommended target range.\n\n";

    }

    else {

      interpretation +=
        "Non-HDL cholesterol is elevated, indicating an increased burden of atherogenic lipoproteins.\n\n";

    }

  }

  /* ======================================================
     VLDL
  ====================================================== */

  if (vldl !== null) {

    interpretation +=
      `Calculated VLDL cholesterol is ${vldl.toFixed(2)} mmol/L.\n\n`;

  }

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Mixed Dyslipidaemia
  ------------------------------------------------------ */

  if (

    tcHigh &&
    ldlHigh &&
    tgHigh

  ) {

    impression =
      "Mixed dyslipidaemia.";

    recommendation =
      "Clinical correlation is recommended. Assess overall cardiovascular risk, screen for diabetes mellitus, hypothyroidism and secondary causes of dyslipidaemia. Lifestyle modification and lipid-lowering therapy should be considered where appropriate.";

  }

  /*
     Atherogenic Dyslipidaemia
  ------------------------------------------------------ */

  else if (

    tgHigh &&
    hdlLow

  ) {

    impression =
      "Atherogenic dyslipidaemia.";

    recommendation =
      "This pattern is commonly associated with insulin resistance, metabolic syndrome and type 2 diabetes mellitus. Assessment of cardiovascular risk factors and lifestyle intervention are recommended.";

  }

  /*
     Isolated Hypercholesterolaemia
  ------------------------------------------------------ */

  else if (

    tcHigh &&
    !tgHigh

  ) {

    impression =
      "Isolated hypercholesterolaemia.";

    recommendation =
      "Evaluate cardiovascular risk profile. Dietary modification, weight management and consideration of lipid-lowering therapy should be guided by current clinical guidelines.";

  }

  /*
     Elevated LDL Cholesterol
  ------------------------------------------------------ */

  else if (

    ldlHigh &&
    !tgHigh

  ) {

    impression =
      "Elevated LDL cholesterol.";

    recommendation =
      "Raised LDL cholesterol is associated with increased atherosclerotic cardiovascular risk. Clinical risk assessment should guide management.";

  }

  /*
     Hypertriglyceridaemia
  ------------------------------------------------------ */

  else if (

    tgHigh &&
    !tcHigh &&
    !ldlHigh

  ) {

    impression =
      "Hypertriglyceridaemia.";

    recommendation =
      "Assess for diabetes mellitus, obesity, alcohol intake, renal disease and secondary causes. Lifestyle modification is recommended.";

  }

  /*
     Severe Hypertriglyceridaemia
  ------------------------------------------------------ */

  else if (

    triglyceride !== null &&
    triglyceride >= 5.6

  ) {

    impression =
      "Severe hypertriglyceridaemia.";

    recommendation =
      "This level is associated with an increased risk of acute pancreatitis. Prompt clinical assessment and triglyceride-lowering therapy should be considered.";

  }

  /*
     Low HDL Cholesterol
  ------------------------------------------------------ */

  else if (

    hdlLow &&
    !tcHigh &&
    !ldlHigh &&
    !tgHigh

  ) {

    impression =
      "Isolated low HDL cholesterol.";

    recommendation =
      "Low HDL cholesterol is an independent cardiovascular risk factor. Lifestyle measures including regular exercise, weight optimisation and smoking cessation are recommended.";

  }

  /*
     Normal Lipid Profile
  ------------------------------------------------------ */

  else {

    impression =
      "Lipid profile is within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation and continued healthy lifestyle measures are advised.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("Normal") ||
    impression.includes("within acceptable")

  ) {

    recommendation =
      "Routine clinical correlation is advised. Maintenance of a healthy diet, regular physical activity and periodic lipid monitoring are encouraged.";

  }

  else if (

    impression.includes("Mixed dyslipidaemia")

  ) {

    recommendation =
      "Comprehensive cardiovascular risk assessment is recommended. Evaluate for diabetes mellitus, hypothyroidism, chronic kidney disease and other secondary causes. Lifestyle modification and lipid-lowering therapy should be considered according to current clinical guidelines.";

  }

  else if (

    impression.includes("Atherogenic")

  ) {

    recommendation =
      "Assess for metabolic syndrome, insulin resistance and type 2 diabetes mellitus. Weight reduction, increased physical activity and optimisation of cardiovascular risk factors are recommended.";

  }

  else if (

    impression.includes("Hypercholesterolaemia") ||
    impression.includes("Elevated LDL")

  ) {

    recommendation =
      "Assessment of overall cardiovascular risk is recommended. Dietary modification, regular exercise and lipid-lowering therapy should be considered where clinically indicated.";

  }

  else if (

    impression.includes("Hypertriglyceridaemia")

  ) {

    recommendation =
      "Evaluate for diabetes mellitus, obesity, excessive alcohol intake, hypothyroidism and medication-related causes. Lifestyle intervention is recommended.";

  }

  else if (

    impression.includes("Severe hypertriglyceridaemia")

  ) {

    recommendation =
      "Urgent clinical assessment is recommended because of the increased risk of acute pancreatitis. Appropriate triglyceride-lowering therapy and dietary fat restriction should be considered.";

  }

  else if (

    impression.includes("low HDL")

  ) {

    recommendation =
      "Encourage smoking cessation where applicable, regular aerobic exercise, weight optimisation and management of other cardiovascular risk factors.";

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