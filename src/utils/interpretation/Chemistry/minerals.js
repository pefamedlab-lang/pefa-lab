import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   MINERAL PROFILE INTERPRETATION ENGINE
========================================================== */

export default function interpretMinerals(

  report = {},

  resultMap = {}

) {

  const calcium =
    getNumericResult(
      resultMap,
      "Calcium"
    );

  const ionized =
    getNumericResult(
      resultMap,
      "Ionized Calcium"
    ) ??
    getNumericResult(
      resultMap,
      "ICA"
    );

  const corrected =
    getNumericResult(
      resultMap,
      "Corrected Calcium"
    ) ??
    getNumericResult(
      resultMap,
      "CCA"
    );

  const magnesium =
    getNumericResult(
      resultMap,
      "Magnesium"
    );

  const phosphorus =
    getNumericResult(
      resultMap,
      "Phosphorus"
    ) ??
    getNumericResult(
      resultMap,
      "Phosphate"
    );

  const creatinine =
    getNumericResult(
      resultMap,
      "Creatinine"
    );

  const egfr =
    getNumericResult(
      resultMap,
      "eGFR"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     TOTAL CALCIUM
  ====================================================== */

  if (calcium !== null) {

    if (calcium < 2.10) {

      interpretation +=
        "Total serum calcium is below the reference interval, suggesting hypocalcaemia.\n\n";

    }

    else if (calcium <= 2.60) {

      interpretation +=
        "Total serum calcium is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Total serum calcium is elevated, indicating hypercalcaemia.\n\n";

    }

  }

  /* ======================================================
     IONIZED CALCIUM
  ====================================================== */

  if (ionized !== null) {

    if (ionized < 1.12) {

      interpretation +=
        "Ionized calcium is reduced, confirming biologically significant hypocalcaemia.\n\n";

    }

    else if (ionized <= 1.32) {

      interpretation +=
        "Ionized calcium is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Ionized calcium is elevated.\n\n";

    }

  }

  /* ======================================================
     CORRECTED CALCIUM
  ====================================================== */

  if (corrected !== null) {

    if (corrected < 2.10) {

      interpretation +=
        "Corrected calcium remains low after albumin adjustment.\n\n";

    }

    else if (corrected <= 2.60) {

      interpretation +=
        "Corrected calcium is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Corrected calcium is elevated.\n\n";

    }

  }

  /* ======================================================
     MAGNESIUM
  ====================================================== */

  if (magnesium !== null) {

    if (magnesium < 0.70) {

      interpretation +=
        "Serum magnesium is below the reference interval (hypomagnesaemia).\n\n";

    }

    else if (magnesium <= 1.05) {

      interpretation +=
        "Serum magnesium is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum magnesium is elevated (hypermagnesaemia).\n\n";

    }

  }

  /* ======================================================
     PHOSPHORUS
  ====================================================== */

  if (phosphorus !== null) {

    if (phosphorus < 0.80) {

      interpretation +=
        "Serum phosphate is reduced (hypophosphataemia).\n\n";

    }

    else if (phosphorus <= 1.50) {

      interpretation +=
        "Serum phosphate is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "Serum phosphate is elevated (hyperphosphataemia).\n\n";

    }

  }

  /* ======================================================
     CKD MINERAL BONE DISORDER
  ====================================================== */

  if (

    egfr !== null &&
    egfr < 60 &&
    phosphorus > 1.50

  ) {

    interpretation +=
      "The combination of reduced eGFR and hyperphosphataemia is suggestive of chronic kidney disease–mineral and bone disorder (CKD-MBD).\n\n";

  }

  /* ======================================================
     IMPRESSION
  ====================================================== */

  if (

    ionized !== null &&
    ionized < 1.12

  ) {

    impression =
      "Confirmed hypocalcaemia.";

  }

  else if (

    calcium !== null &&
    calcium > 2.60

  ) {

    impression =
      "Hypercalcaemia.";

  }

  else if (

    magnesium !== null &&
    magnesium < 0.70

  ) {

    impression =
      "Hypomagnesaemia.";

  }

  else if (

    phosphorus !== null &&
    phosphorus > 1.50

  ) {

    impression =
      "Hyperphosphataemia.";

  }

  else {

    impression =
      "Mineral profile is within acceptable laboratory limits.";

  }

  /* ======================================================
     RECOMMENDATION
  ====================================================== */

  if (

    impression ===
    "Mineral profile is within acceptable laboratory limits."

  ) {

    recommendation =
      "Routine clinical correlation.";

  }

  else {

    recommendation =
      "Interpret alongside renal function, parathyroid hormone, vitamin D status and the patient's clinical presentation.";

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}