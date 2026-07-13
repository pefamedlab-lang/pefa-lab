import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   LIPID PROFILE INTERPRETATION ENGINE
========================================================== */

export default function interpretLipid(

  report = {},

  resultMap = {}

) {

  const total =
    getNumericResult(
      resultMap,
      "Total Cholesterol"
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

  const triglyceride =
    getNumericResult(
      resultMap,
      "Triglycerides"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     TOTAL CHOLESTEROL
  ====================================================== */

  if (total !== null) {

    if (total < 5.2) {

      interpretation +=
        "Total cholesterol is within the desirable range.\n\n";

    }

    else if (total < 6.2) {

      interpretation +=
        "Total cholesterol is borderline elevated.\n\n";

    }

    else {

      interpretation +=
        "Total cholesterol is elevated, increasing cardiovascular risk.\n\n";

    }

  }

  /* ======================================================
     HDL
  ====================================================== */

  if (hdl !== null) {

    if (hdl < 1.0) {

      interpretation +=
        "HDL cholesterol is reduced, conferring increased cardiovascular risk.\n\n";

    }

    else if (hdl >= 1.6) {

      interpretation +=
        "HDL cholesterol is favourable and provides cardioprotective benefit.\n\n";

    }

    else {

      interpretation +=
        "HDL cholesterol is within the acceptable range.\n\n";

    }

  }

  /* ======================================================
     LDL
  ====================================================== */

  if (ldl !== null) {

    if (ldl < 2.6) {

      interpretation +=
        "LDL cholesterol is optimal.\n\n";

    }

    else if (ldl < 3.4) {

      interpretation +=
        "LDL cholesterol is near optimal.\n\n";

    }

    else if (ldl < 4.1) {

      interpretation +=
        "LDL cholesterol is borderline elevated.\n\n";

    }

    else if (ldl < 4.9) {

      interpretation +=
        "LDL cholesterol is elevated.\n\n";

    }

    else {

      interpretation +=
        "LDL cholesterol is markedly elevated, indicating significantly increased atherosclerotic cardiovascular risk.\n\n";

    }

  }

  /* ======================================================
     TRIGLYCERIDES
  ====================================================== */

  if (triglyceride !== null) {

    if (triglyceride < 1.7) {

      interpretation +=
        "Triglycerides are within the desirable range.\n\n";

    }

    else if (triglyceride < 2.3) {

      interpretation +=
        "Triglycerides are mildly elevated.\n\n";

    }

    else if (triglyceride < 5.6) {

      interpretation +=
        "Triglycerides are moderately elevated.\n\n";

    }

    else {

      interpretation +=
        "Marked hypertriglyceridaemia is present, increasing the risk of acute pancreatitis.\n\n";

    }

  }

  /* ======================================================
     NON-HDL CHOLESTEROL
  ====================================================== */

  let nonHDL = null;

  if (

    total !== null &&

    hdl !== null

  ) {

    nonHDL =
      total - hdl;

    interpretation +=
      `Calculated non-HDL cholesterol is ${nonHDL.toFixed(2)} mmol/L.\n\n`;

  }

  /* ======================================================
     TC / HDL RATIO
  ====================================================== */

  let ratio = null;

  if (

    total !== null &&

    hdl !== null &&

    hdl > 0

  ) {

    ratio =
      total / hdl;

    interpretation +=
      `Total cholesterol / HDL ratio is ${ratio.toFixed(2)}.\n\n`;

  }

  /* ======================================================
     MIXED DYSLIPIDAEMIA
  ====================================================== */

  if (

    ldl > 3.4 &&

    triglyceride > 1.7

  ) {

    impression =
      "Mixed dyslipidaemia.";

    recommendation =
      "Lifestyle modification and cardiovascular risk assessment are recommended. Consider lipid-lowering therapy where clinically appropriate.";

  }

  /* ======================================================
     ATHEROGENIC PROFILE
  ====================================================== */

  else if (

    triglyceride > 1.7 &&

    hdl < 1.0

  ) {

    impression =
      "Atherogenic dyslipidaemia.";

    recommendation =
      "Evaluate for metabolic syndrome, insulin resistance and type 2 diabetes mellitus.";

  }

  /* ======================================================
     HIGH LDL
  ====================================================== */

  else if (

    ldl > 4.1

  ) {

    impression =
      "Hypercholesterolaemia.";

    recommendation =
      "Dietary modification and assessment for lipid-lowering therapy are recommended.";

  }

  /* ======================================================
     HYPERTRIGLYCERIDAEMIA
  ====================================================== */

  else if (

    triglyceride > 5.6

  ) {

    impression =
      "Severe hypertriglyceridaemia.";

    recommendation =
      "Urgent intervention is recommended to reduce the risk of acute pancreatitis.";

  }

  /* ======================================================
     RATIO
  ====================================================== */

  else if (

    ratio !== null &&

    ratio > 5

  ) {

    impression =
      "Elevated cardiovascular risk.";

    recommendation =
      "Comprehensive cardiovascular risk assessment is advised.";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  else {

    impression =
      "Lipid profile is within desirable limits.";

    recommendation =
      "Maintain healthy diet, regular physical activity and routine lipid monitoring.";

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}