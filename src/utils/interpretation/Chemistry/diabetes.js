import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   DIABETES INTERPRETATION ENGINE
========================================================== */

export default function interpretDiabetes(

  report = {},

  resultMap = {}

) {

  const glucose =
    getNumericResult(
      resultMap,
      "Glucose"
    ) ??

    getNumericResult(
      resultMap,
      "Fasting Blood Sugar"
    ) ??

    getNumericResult(
      resultMap,
      "FBS"
    );

  const random =
    getNumericResult(
      resultMap,
      "Random Blood Sugar"
    ) ??

    getNumericResult(
      resultMap,
      "RBS"
    );

  const twoHPP =
    getNumericResult(
      resultMap,
      "2HPP"
    ) ??

    getNumericResult(
      resultMap,
      "2 Hours Post Prandial"
    );

  const ogtt =
    getNumericResult(
      resultMap,
      "OGTT"
    ) ??

    getNumericResult(
      resultMap,
      "2 Hour Glucose"
    );

  const hba1c =
    getNumericResult(
      resultMap,
      "HbA1c"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     FASTING GLUCOSE
  ====================================================== */

  if (glucose !== null) {

    if (glucose < 3.0) {

      interpretation +=
        "Fasting plasma glucose is critically low, consistent with severe hypoglycaemia. Immediate clinical attention is required.\n\n";

    }

    else if (glucose < 3.9) {

      interpretation +=
        "Fasting plasma glucose is below the reference interval, indicating hypoglycaemia.\n\n";

    }

    else if (glucose < 5.6) {

      interpretation +=
        "Fasting plasma glucose is within the normal reference interval.\n\n";

    }

    else if (glucose < 7.0) {

      interpretation +=
        "Fasting plasma glucose is elevated and falls within the impaired fasting glucose (prediabetes) range.\n\n";

    }

    else {

      interpretation +=
        "Fasting plasma glucose is within the diagnostic range for diabetes mellitus.\n\n";

    }

  }

  /* ======================================================
     RANDOM GLUCOSE
  ====================================================== */

  if (random !== null) {

    if (random >= 11.1) {

      interpretation +=
        "Random plasma glucose is markedly elevated and is consistent with diabetes mellitus when correlated with clinical symptoms.\n\n";

    }

    else {

      interpretation +=
        "Random plasma glucose does not meet the diagnostic threshold for diabetes mellitus.\n\n";

    }

  }

  /* ======================================================
     2-HOUR POST PRANDIAL
  ====================================================== */

  if (twoHPP !== null) {

    if (twoHPP < 7.8) {

      interpretation +=
        "Two-hour post-prandial glucose is within the normal range.\n\n";

    }

    else if (twoHPP < 11.1) {

      interpretation +=
        "Two-hour post-prandial glucose is elevated, suggesting impaired glucose tolerance.\n\n";

    }

    else {

      interpretation +=
        "Two-hour post-prandial glucose is consistent with diabetes mellitus.\n\n";

    }

  }

  /* ======================================================
     OGTT
  ====================================================== */

  if (ogtt !== null) {

    if (ogtt < 7.8) {

      interpretation +=
        "Oral Glucose Tolerance Test result is normal.\n\n";

    }

    else if (ogtt < 11.1) {

      interpretation +=
        "OGTT demonstrates impaired glucose tolerance (prediabetes).\n\n";

    }

    else {

      interpretation +=
        "OGTT result satisfies the diagnostic criteria for diabetes mellitus.\n\n";

    }

  }

  /* ======================================================
     HbA1c
  ====================================================== */

  if (hba1c !== null) {

    if (hba1c < 5.7) {

      interpretation +=
        "HbA1c is within the normal range and reflects normal average blood glucose over the previous 2–3 months.\n\n";

    }

    else if (hba1c < 6.5) {

      interpretation +=
        "HbA1c falls within the prediabetes range, indicating increased risk of developing diabetes mellitus.\n\n";

    }

    else if (hba1c < 8.0) {

      interpretation +=
        "HbA1c is diagnostic of diabetes mellitus and indicates suboptimal long-term glycaemic control.\n\n";

    }

    else if (hba1c < 10.0) {

      interpretation +=
        "HbA1c indicates poorly controlled diabetes mellitus.\n\n";

    }

    else {

      interpretation +=
        "HbA1c indicates very poor long-term glycaemic control with a significantly increased risk of diabetic complications.\n\n";

    }

  }

  /* ======================================================
     COMBINED IMPRESSION
  ====================================================== */

  if (

    hba1c >= 6.5 &&

    glucose >= 7.0

  ) {

    impression =
      "Findings are diagnostic of diabetes mellitus with persistent hyperglycaemia.";

  }

  else if (

    hba1c >= 5.7 ||

    glucose >= 5.6 ||

    ogtt >= 7.8 ||

    twoHPP >= 7.8

  ) {

    impression =
      "Findings are consistent with prediabetes / impaired glucose regulation.";

  }

  else {

    impression =
      "No laboratory evidence of abnormal glucose metabolism.";

  }

  /* ======================================================
     RECOMMENDATION
  ====================================================== */

  if (

    hba1c >= 6.5 ||

    glucose >= 7.0 ||

    ogtt >= 11.1 ||

    twoHPP >= 11.1

  ) {

    recommendation =
      "Clinical evaluation, diabetic education, lifestyle modification, and regular monitoring of HbA1c, renal function, lipid profile, and urine microalbumin are recommended.";

  }

  else if (

    hba1c >= 5.7 ||

    glucose >= 5.6 ||

    ogtt >= 7.8 ||

    twoHPP >= 7.8

  ) {

    recommendation =
      "Lifestyle modification, weight control, dietary counselling, regular physical activity, and repeat glucose assessment within 3–6 months are recommended.";

  }

  else {

    recommendation =
      "Maintain healthy lifestyle practices and continue routine screening according to clinical risk factors.";

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}