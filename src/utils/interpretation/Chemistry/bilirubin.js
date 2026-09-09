import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   BILIRUBIN INTERPRETATION ENGINE
========================================================== */

export default function interpretBilirubin(

  report = {},

  patient = {},

  resultMap = {}

) {

  const total =
    getNumericResult(
      resultMap,
      "Total Bilirubin"
    );

  const direct =
    getNumericResult(
      resultMap,
      "Direct Bilirubin"
    );

  const indirect =
    getNumericResult(
      resultMap,
      "Indirect Bilirubin"
    );

  const ageDays =
    patient.age_in_days ??
    report.age_in_days ??
    null;

  const isNeonate =
    ageDays !== null &&
    ageDays <= 28;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     ABNORMALITY FLAG
  ====================================================== */

  let abnormal = false;

  /* ======================================================
     ADULT
  ====================================================== */

  if (!isNeonate) {

    if (total !== null) {

      if (total <= 21) {

        interpretation +=
          "Total bilirubin is within the reference interval.\n\n";

      }

      else {

        abnormal = true;

        interpretation +=
          "Hyperbilirubinaemia is present.\n\n";

      }

    }

    if (

      direct !== null &&
      total !== null &&
      direct > (0.2 * total)

    ) {

      abnormal = true;

      interpretation +=
        "Predominantly conjugated hyperbilirubinaemia is present, suggesting hepatocellular dysfunction or biliary obstruction.\n\n";

    }

    if (

      indirect !== null &&
      direct !== null &&
      indirect > direct

    ) {

      abnormal = true;

      interpretation +=
        "Predominantly unconjugated hyperbilirubinaemia is present, which may occur in haemolysis, Gilbert syndrome or ineffective erythropoiesis.\n\n";

    }

    /* ======================================================
       CLINICAL PATTERNS
    ====================================================== */

    if (

      total !== null &&
      direct !== null &&
      total > 21 &&
      direct > (0.2 * total)

    ) {

      impression =
        "Conjugated hyperbilirubinaemia.";

      recommendation =
        "Correlate with liver enzymes and perform hepatobiliary evaluation where clinically indicated.";

    }

    else if (

      total !== null &&
      total > 21

    ) {

      impression =
        "Unconjugated hyperbilirubinaemia.";

      recommendation =
        "Evaluate for haemolysis and inherited bilirubin metabolism disorders.";

    }

    else if (!abnormal) {

      impression =
        "Bilirubin profile is within acceptable laboratory limits.";

      recommendation =
        "Routine clinical correlation.";

    }

    else {

      impression =
        "Abnormal bilirubin profile detected.";

      recommendation =
        "Interpret alongside the patient's clinical findings and correlate with liver function tests, haemolysis profile and imaging where indicated.";

    }

  }

  /* ======================================================
     NEONATAL
  ====================================================== */

  else {

    if (total !== null) {

      if (total < 5) {

        interpretation +=
          "Serum bilirubin concentration is within acceptable limits for a neonate.\n\n";

        impression =
          "No significant neonatal hyperbilirubinaemia.";

        recommendation =
          "Routine neonatal observation.";

      }

      else if (total < 12) {

        abnormal = true;

        interpretation +=
          "Mild neonatal hyperbilirubinaemia is present. This may represent physiological neonatal jaundice depending on the infant's postnatal age.\n\n";

        impression =
          "Mild neonatal jaundice.";

        recommendation =
          "Clinical monitoring and repeat bilirubin assessment where indicated.";

      }

      else if (total < 20) {

        abnormal = true;

        interpretation +=
          "Moderately elevated neonatal bilirubin level. Depending on age in hours and associated risk factors, phototherapy may be indicated.\n\n";

        impression =
          "Moderate neonatal hyperbilirubinaemia.";

        recommendation =
          "Prompt paediatric review with assessment using neonatal bilirubin nomograms.";

      }

      else if (total < 25) {

        abnormal = true;

        interpretation +=
          "Marked neonatal hyperbilirubinaemia with increased risk of bilirubin neurotoxicity if untreated.\n\n";

        impression =
          "Severe neonatal jaundice.";

        recommendation =
          "Urgent phototherapy assessment is recommended.";

      }

      else {

        abnormal = true;

        interpretation +=
          "Critically elevated neonatal bilirubin concentration with a significant risk of acute bilirubin encephalopathy (kernicterus).\n\n";

        impression =
          "Critical neonatal hyperbilirubinaemia.";

        recommendation =
          "URGENT neonatal management. Immediate specialist review and exchange transfusion should be considered according to established neonatal guidelines.";

      }

    }

    if (

      direct !== null &&
      total !== null &&
      (
        direct > 2 ||
        direct > (0.20 * total)
      )

    ) {

      abnormal = true;

      interpretation +=
        "Conjugated hyperbilirubinaemia is present. This is not consistent with physiological neonatal jaundice and may indicate neonatal cholestasis or hepatobiliary disease.\n\n";

      impression =
        "Conjugated neonatal hyperbilirubinaemia.";

      recommendation =
        "Further evaluation for neonatal liver disease is recommended.";

    }

    if (!impression && !abnormal) {

      impression =
        "Neonatal bilirubin profile is within acceptable laboratory limits.";

      recommendation =
        "Routine neonatal observation.";

    }

    else if (!impression) {

      impression =
        "Abnormal neonatal bilirubin profile detected.";

      recommendation =
        "Interpret alongside the infant's age in hours, gestational age and clinical findings. Follow established neonatal jaundice management guidelines.";

    }

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}