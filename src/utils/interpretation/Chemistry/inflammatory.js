import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   INFLAMMATORY MARKERS INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • C-Reactive Protein (CRP)
   • ESR
   • Procalcitonin (PCT)

   Detects
   ----------------------------------------------------------
   • Normal inflammatory profile
   • Mild inflammation
   • Acute inflammation
   • Severe bacterial infection
   • Possible sepsis
   • Chronic inflammatory disease
========================================================== */

export default function interpretInflammation(

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

  const crp =
    getNumericResult(
      resultMap,
      "CRP"
    ) ??
    getNumericResult(
      resultMap,
      "C-Reactive Protein"
    );

  const esr =
    getNumericResult(
      resultMap,
      "ESR"
    );

  const pct =
    getNumericResult(
      resultMap,
      "Procalcitonin"
    ) ??
    getNumericResult(
      resultMap,
      "PCT"
    );

  /* ======================================================
     REFERENCE LIMITS
  ====================================================== */

  const CRP_ULN = 5;
  const ESR_ULN = 20;
  const PCT_ULN = 0.05;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const crpHigh =
    crp !== null &&
    crp > CRP_ULN;

  const esrHigh =
    esr !== null &&
    esr > ESR_ULN;

  const pctHigh =
    pct !== null &&
    pct > PCT_ULN;

  const severeCRP =
    crp !== null &&
    crp >= 100;

  const veryHighPCT =
    pct !== null &&
    pct >= 2.0;

  const septicPCT =
    pct !== null &&
    pct >= 10;

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

  const crpFold =
    foldIncrease(
      crp,
      CRP_ULN
    );

  const esrFold =
    foldIncrease(
      esr,
      ESR_ULN
    );

  const pctFold =
    foldIncrease(
      pct,
      PCT_ULN
    );

  /* ======================================================
     C-REACTIVE PROTEIN (CRP)
  ====================================================== */

  if (crp !== null) {

    if (!crpHigh) {

      interpretation +=
        "C-reactive protein (CRP) is within the reference interval, indicating no significant acute systemic inflammatory response.\n\n";

    }

    else if (crp < 20) {

      interpretation +=
        "CRP is mildly elevated, consistent with low-grade inflammation. This may occur with minor infection, chronic inflammatory disorders or following tissue injury.\n\n";

    }

    else if (crp < 100) {

      interpretation +=
        "CRP is moderately elevated, indicating significant inflammation or infection. Clinical correlation is recommended.\n\n";

    }

    else {

      interpretation +=
        "CRP is markedly elevated (>100 mg/L), strongly suggesting severe bacterial infection, extensive tissue injury or significant systemic inflammation.\n\n";

    }

  }

  /* ======================================================
     ERYTHROCYTE SEDIMENTATION RATE (ESR)
  ====================================================== */

  if (esr !== null) {

    if (!esrHigh) {

      interpretation +=
        "Erythrocyte sedimentation rate (ESR) is within the reference interval.\n\n";

    }

    else if (esr < 50) {

      interpretation +=
        "ESR is mildly elevated. This is a non-specific indicator of inflammation and should be interpreted together with CRP and the clinical findings.\n\n";

    }

    else {

      interpretation +=
        "ESR is markedly elevated, consistent with significant inflammation, autoimmune disease, chronic infection or plasma cell disorders.\n\n";

    }

  }

  /* ======================================================
     PROCALCITONIN (PCT)
  ====================================================== */

  if (pct !== null) {

    if (!pctHigh) {

      interpretation +=
        "Procalcitonin is within the reference interval, making significant systemic bacterial infection less likely.\n\n";

    }

    else if (pct < 0.5) {

      interpretation +=
        "Procalcitonin is slightly elevated. Early bacterial infection or localized infection should be considered in the appropriate clinical context.\n\n";

    }

    else if (pct < 2.0) {

      interpretation +=
        "Procalcitonin is elevated, supporting the presence of clinically significant bacterial infection.\n\n";

    }

    else if (pct < 10) {

      interpretation +=
        "Marked elevation of procalcitonin strongly suggests severe bacterial infection or sepsis.\n\n";

    }

    else {

      interpretation +=
        "Very marked elevation of procalcitonin is highly suggestive of severe sepsis or septic shock and requires urgent clinical assessment.\n\n";

    }

  }

  /* ======================================================
     COMBINED INFLAMMATORY PROFILE
  ====================================================== */

  if (

    crpHigh &&
    esrHigh &&
    !pctHigh

  ) {

    interpretation +=
      "Concurrent elevation of CRP and ESR with normal procalcitonin favours a non-bacterial inflammatory process such as autoimmune disease or chronic inflammation.\n\n";

  }

  else if (

    crpHigh &&
    pctHigh

  ) {

    interpretation +=
      "Concurrent elevation of CRP and procalcitonin strongly supports bacterial infection.\n\n";

  }

  else if (

    severeCRP &&
    veryHighPCT

  ) {

    interpretation +=
      "Marked elevation of both CRP and procalcitonin is highly suggestive of severe bacterial sepsis.\n\n";

  }

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Severe Sepsis / Septic Shock
  ------------------------------------------------------ */

  if (

    septicPCT

  ) {

    impression =
      "Inflammatory marker profile is highly suggestive of severe sepsis or septic shock.";

    recommendation =
      "Urgent clinical assessment is required. Correlate with blood cultures, serum lactate, organ function tests and initiate appropriate antimicrobial therapy according to local guidelines.";

  }

  /*
     Severe Bacterial Infection
  ------------------------------------------------------ */

  else if (

    severeCRP &&
    veryHighPCT

  ) {

    impression =
      "Inflammatory marker profile is consistent with severe bacterial infection.";

    recommendation =
      "Interpret together with microbiological investigations, imaging studies and the patient's clinical condition. Prompt antimicrobial therapy should be considered where appropriate.";

  }

  /*
     Acute Bacterial Infection
  ------------------------------------------------------ */

  else if (

    crpHigh &&
    pctHigh

  ) {

    impression =
      "Biochemical findings support acute bacterial infection.";

    recommendation =
      "Correlate with microbiology results, clinical findings and imaging where indicated. Serial procalcitonin measurements may assist in monitoring response to therapy.";

  }

  /*
     Chronic / Non-bacterial Inflammation
  ------------------------------------------------------ */

  else if (

    crpHigh &&
    esrHigh &&
    !pctHigh

  ) {

    impression =
      "Pattern is suggestive of chronic or non-bacterial inflammatory disease.";

    recommendation =
      "Consider autoimmune disorders, chronic inflammatory diseases or chronic infection. Correlation with autoimmune serology and clinical findings is recommended.";

  }

  /*
     Mild Inflammatory Response
  ------------------------------------------------------ */

  else if (

    crpHigh ||
    esrHigh

  ) {

    impression =
      "Mild inflammatory response.";

    recommendation =
      "Interpret together with the patient's symptoms and clinical findings. Repeat inflammatory markers may be useful if clinically indicated.";

  }

  /*
     Isolated Elevated ESR
  ------------------------------------------------------ */

  else if (

    esrHigh &&
    !crpHigh

  ) {

    impression =
      "Isolated elevation of ESR.";

    recommendation =
      "This finding is non-specific and may occur with ageing, anaemia, autoimmune disease or plasma cell disorders. Clinical correlation is advised.";

  }

  /*
     Normal Profile
  ------------------------------------------------------ */

  else {

    impression =
      "Inflammatory markers are within acceptable laboratory limits.";

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

    impression.includes("Mild inflammatory")

  ) {

    recommendation =
      "Interpret together with the patient's symptoms, examination findings and other laboratory investigations. Repeat inflammatory markers if clinically indicated.";

  }

  else if (

    impression.includes("Acute bacterial infection")

  ) {

    recommendation =
      "Correlation with microbiological cultures, imaging studies and antimicrobial susceptibility testing is recommended. Serial procalcitonin measurements may assist in monitoring treatment response.";

  }

  else if (

    impression.includes("Severe bacterial infection")

  ) {

    recommendation =
      "Urgent clinical assessment is recommended. Obtain appropriate microbiological specimens before initiating antimicrobial therapy where feasible.";

  }

  else if (

    impression.includes("sepsis")

  ) {

    recommendation =
      "Immediate sepsis management is advised, including blood cultures, serum lactate, organ function assessment and prompt antimicrobial therapy in accordance with local sepsis guidelines.";

  }

  else if (

    impression.includes("non-bacterial inflammatory")

  ) {

    recommendation =
      "Further evaluation for autoimmune disease, chronic inflammatory disorders or malignancy may be appropriate. Correlate with ESR, autoimmune serology and imaging where indicated.";

  }

  else if (

    impression.includes("Isolated elevation of ESR")

  ) {

    recommendation =
      "Interpret in the clinical context. Consider anaemia, autoimmune disease, plasma cell disorders or chronic inflammatory conditions where appropriate.";

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