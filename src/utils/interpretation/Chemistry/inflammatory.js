import {
  createInterpretation,
  getNumericResult,
} from "../helpers";

/* ==========================================================
   INFLAMMATORY MARKER INTERPRETATION ENGINE
========================================================== */

export default function interpretInflammatory(

  report = {},

  resultMap = {}

) {

  const crp =
    getNumericResult(
      resultMap,
      "CRP"
    );

  const hscrp =
    getNumericResult(
      resultMap,
      "hs-CRP"
    );

  const pct =
    getNumericResult(
      resultMap,
      "Procalcitonin"
    );

  const esr =
    getNumericResult(
      resultMap,
      "ESR"
    );

  const lactate =
    getNumericResult(
      resultMap,
      "Lactate"
    );

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     CRP
  ====================================================== */

  if (crp !== null) {

    if (crp < 5) {

      interpretation +=
        "C-reactive protein is within the reference interval.\n\n";

    }

    else if (crp < 20) {

      interpretation +=
        "Mild elevation of C-reactive protein suggests low-grade inflammation.\n\n";

    }

    else if (crp < 100) {

      interpretation +=
        "Moderately elevated C-reactive protein is compatible with active inflammatory or infectious disease.\n\n";

    }

    else {

      interpretation +=
        "Marked elevation of C-reactive protein indicates significant systemic inflammation.\n\n";

    }

  }

  /* ======================================================
     hs-CRP
  ====================================================== */

  if (hscrp !== null) {

    if (hscrp < 1) {

      interpretation +=
        "hs-CRP indicates low cardiovascular inflammatory risk.\n\n";

    }

    else if (hscrp < 3) {

      interpretation +=
        "hs-CRP indicates intermediate cardiovascular inflammatory risk.\n\n";

    }

    else {

      interpretation +=
        "hs-CRP indicates increased cardiovascular inflammatory risk.\n\n";

    }

  }

  /* ======================================================
     ESR
  ====================================================== */

  if (esr !== null) {

    if (esr <= 20) {

      interpretation +=
        "ESR is within the expected reference interval.\n\n";

    }

    else {

      interpretation +=
        "Elevated ESR supports the presence of inflammation but is non-specific.\n\n";

    }

  }

  /* ======================================================
     PROCALCITONIN
  ====================================================== */

  if (pct !== null) {

    if (pct < 0.10) {

      interpretation +=
        "Procalcitonin is within the normal range.\n\n";

    }

    else if (pct < 0.50) {

      interpretation +=
        "Slight elevation of procalcitonin may indicate early bacterial infection.\n\n";

    }

    else if (pct < 2.0) {

      interpretation +=
        "Procalcitonin level is compatible with significant bacterial infection.\n\n";

    }

    else if (pct < 10) {

      interpretation +=
        "Markedly elevated procalcitonin strongly suggests severe bacterial infection or sepsis.\n\n";

    }

    else {

      interpretation +=
        "Extremely elevated procalcitonin is highly suggestive of severe sepsis or septic shock.\n\n";

    }

  }

  /* ======================================================
     LACTATE
  ====================================================== */

  if (lactate !== null) {

    if (lactate <= 2.0) {

      interpretation +=
        "Serum lactate is within normal limits.\n\n";

    }

    else if (lactate <= 4.0) {

      interpretation +=
        "Elevated serum lactate suggests tissue hypoperfusion.\n\n";

    }

    else {

      interpretation +=
        "Marked hyperlactataemia indicates severe tissue hypoxia and warrants urgent clinical evaluation.\n\n";

    }

  }

  /* ======================================================
     SEPTIC SHOCK
  ====================================================== */

  if (

    pct > 2 &&

    lactate > 2

  ) {

    impression =
      "Biochemical findings are highly suggestive of sepsis with tissue hypoperfusion.";

    recommendation =
      "Urgent clinical review is recommended. Immediate sepsis management according to institutional protocols should be considered.";

  }

  /* ======================================================
     BACTERIAL INFECTION
  ====================================================== */

  else if (

    pct > 0.5 &&

    crp > 20

  ) {

    impression =
      "Findings are compatible with active bacterial infection.";

    recommendation =
      "Interpret together with microbiology findings and clinical assessment.";

  }

  /* ======================================================
     INFLAMMATION
  ====================================================== */

  else if (

    crp > 20 ||

    esr > 20

  ) {

    impression =
      "Evidence of active inflammatory process.";

    recommendation =
      "Clinical correlation and investigation of the underlying cause are recommended.";

  }

  /* ======================================================
     CARDIOVASCULAR RISK
  ====================================================== */

  else if (

    hscrp > 3

  ) {

    impression =
      "Elevated cardiovascular inflammatory risk.";

    recommendation =
      "Interpret in conjunction with lipid profile and overall cardiovascular risk assessment.";

  }

  /* ======================================================
     NORMAL
  ====================================================== */

  else {

    impression =
      "Inflammatory markers are within acceptable laboratory limits.";

    recommendation =
      "Routine clinical correlation.";

  }

  return createInterpretation({

    interpretation:
      interpretation.trim(),

    impression,

    recommendation,

  });

}