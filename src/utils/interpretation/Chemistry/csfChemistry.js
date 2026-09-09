import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   CEREBROSPINAL FLUID (CSF) CHEMISTRY INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • CSF Protein
   • CSF Glucose
   • Plasma Glucose (optional)
   • CSF Lactate
   • CSF Chloride

   Detects
   ----------------------------------------------------------
   • Normal CSF chemistry
   • Bacterial meningitis pattern
   • Viral meningitis pattern
   • Tuberculous/Fungal meningitis pattern
   • Blood-CSF barrier dysfunction
   • Hypoglycorrhachia
   • Elevated CSF lactate
========================================================== */

export default function interpretCSFChemistry(

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

  const protein =
    getNumericResult(resultMap, "CSF Protein") ??
    getNumericResult(resultMap, "Protein");

  const glucose =
    getNumericResult(resultMap, "CSF Glucose") ??
    getNumericResult(resultMap, "Glucose");

  const plasmaGlucose =
    getNumericResult(resultMap, "Plasma Glucose");

  const lactate =
    getNumericResult(resultMap, "CSF Lactate") ??
    getNumericResult(resultMap, "Lactate");

  const chloride =
    getNumericResult(resultMap, "CSF Chloride") ??
    getNumericResult(resultMap, "Chloride");

  /* ======================================================
     REFERENCE LIMITS
  ====================================================== */

  const PROTEIN_ULN = 0.45;      // g/L
  const GLUCOSE_LOW = 2.5;       // mmol/L
  const LACTATE_ULN = 2.8;       // mmol/L
  const CHLORIDE_LOW = 118;      // mmol/L

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const proteinHigh =
    protein !== null &&
    protein > PROTEIN_ULN;

  const glucoseLow =
    glucose !== null &&
    glucose < GLUCOSE_LOW;

  const lactateHigh =
    lactate !== null &&
    lactate > LACTATE_ULN;

  const chlorideLow =
    chloride !== null &&
    chloride < CHLORIDE_LOW;

  /* ======================================================
     CSF / PLASMA GLUCOSE RATIO
  ====================================================== */

  const glucoseRatio =

    glucose !== null &&
    plasmaGlucose !== null &&
    plasmaGlucose > 0

      ? glucose / plasmaGlucose

      : null;

  const lowGlucoseRatio =

    glucoseRatio !== null &&
    glucoseRatio < 0.40;

  const borderlineGlucoseRatio =

    glucoseRatio !== null &&
    glucoseRatio >= 0.40 &&
    glucoseRatio < 0.60;

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

  function hasValue(value) {

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

  const proteinFold =
    foldIncrease(
      protein,
      PROTEIN_ULN
    );

  const lactateFold =
    foldIncrease(
      lactate,
      LACTATE_ULN
    );

  /* ======================================================
     CSF PROTEIN
  ====================================================== */

  if (hasValue(protein)) {

    if (!proteinHigh) {

      interpretation +=
        "CSF protein concentration is within the reference interval.\n\n";

    }

    else if (proteinFold < 2) {

      interpretation +=
        "CSF protein is mildly elevated, suggesting increased permeability of the blood–CSF barrier or mild central nervous system inflammation.\n\n";

    }

    else {

      interpretation +=
        "CSF protein is markedly elevated, consistent with significant blood–CSF barrier dysfunction or central nervous system pathology.\n\n";

    }

  }

  /* ======================================================
     CSF GLUCOSE
  ====================================================== */

  if (hasValue(glucose)) {

    if (!glucoseLow) {

      interpretation +=
        "CSF glucose concentration is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "CSF glucose concentration is reduced (hypoglycorrhachia). This finding may occur in bacterial, tuberculous or fungal meningitis and other disorders affecting glucose transport or consumption.\n\n";

    }

  }

  /* ======================================================
     CSF / PLASMA GLUCOSE RATIO
  ====================================================== */

  if (glucoseRatio !== null) {

    interpretation +=
      `Calculated CSF/plasma glucose ratio is ${glucoseRatio.toFixed(2)}.\n\n`;

    if (lowGlucoseRatio) {

      interpretation +=
        "The CSF/plasma glucose ratio is significantly reduced, supporting impaired glucose transport or increased glucose consumption within the central nervous system.\n\n";

    }

    else if (borderlineGlucoseRatio) {

      interpretation +=
        "The CSF/plasma glucose ratio is borderline reduced and should be interpreted together with the clinical findings and other CSF investigations.\n\n";

    }

    else {

      interpretation +=
        "The CSF/plasma glucose ratio is within the expected range.\n\n";

    }

  }

  /* ======================================================
     CSF LACTATE
  ====================================================== */

  if (hasValue(lactate)) {

    if (!lactateHigh) {

      interpretation +=
        "CSF lactate concentration is within the reference interval.\n\n";

    }

    else if (lactateFold < 2) {

      interpretation +=
        "CSF lactate is elevated. Increased CSF lactate supports bacterial meningitis or impaired cerebral metabolism but is not diagnostic in isolation.\n\n";

    }

    else {

      interpretation +=
        "CSF lactate is markedly elevated, strongly supporting significant central nervous system infection or severe cerebral hypoxia/ischaemia in the appropriate clinical context.\n\n";

    }

  }

  /* ======================================================
     CSF CHLORIDE
  ====================================================== */

  if (hasValue(chloride)) {

    if (!chlorideLow) {

      interpretation +=
        "CSF chloride concentration is within the reference interval.\n\n";

    }

    else {

      interpretation +=
        "CSF chloride concentration is reduced. This finding is non-specific but may occur in tuberculous meningitis and other inflammatory conditions.\n\n";

    }

  }

  /* ======================================================
     COMBINED COMMENTS
  ====================================================== */

  if (

    proteinHigh &&
    glucoseLow

  ) {

    interpretation +=
      "The combination of elevated CSF protein and reduced CSF glucose supports an inflammatory or infectious process affecting the central nervous system.\n\n";

  }

  if (

    glucoseLow &&
    lactateHigh

  ) {

    interpretation +=
      "Concurrent hypoglycorrhachia and elevated CSF lactate increase the likelihood of bacterial meningitis in the appropriate clinical setting.\n\n";

  }

  if (

    proteinHigh &&
    lactateHigh

  ) {

    interpretation +=
      "Concurrent elevation of CSF protein and lactate supports significant central nervous system pathology and should be interpreted together with CSF microscopy, microbiology and neuroimaging.\n\n";

  }

  /* ======================================================
     GENERAL COMMENT
  ====================================================== */

  interpretation +=
    "CSF chemistry findings should always be interpreted together with CSF cell counts, Gram stain, culture, molecular testing, serum glucose concentration and the patient's clinical presentation.\n\n";

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Bacterial Meningitis Pattern
  ------------------------------------------------------ */

  if (

    proteinHigh &&
    glucoseLow &&
    lactateHigh

  ) {

    impression =
      "CSF biochemical findings are highly suggestive of bacterial meningitis.";

    recommendation =
      "Urgent clinical review is recommended. Correlate immediately with CSF cell count, Gram stain, culture, molecular testing (PCR), blood cultures and neuroimaging where appropriate.";

  }

  /*
     Tuberculous / Fungal Meningitis Pattern
  ------------------------------------------------------ */

  else if (

    proteinHigh &&
    lowGlucoseRatio &&
    chlorideLow

  ) {

    impression =
      "CSF biochemical findings are compatible with tuberculous or fungal meningitis.";

    recommendation =
      "Correlate with CSF microscopy, Ziehl–Neelsen stain, fungal studies, mycobacterial culture, nucleic acid amplification tests and neuroimaging.";

  }

  /*
     Viral Meningitis Pattern
  ------------------------------------------------------ */

  else if (

    !glucoseLow &&
    proteinHigh &&
    !lactateHigh

  ) {

    impression =
      "CSF biochemical profile is compatible with viral meningitis.";

    recommendation =
      "Interpret together with CSF lymphocyte count, viral PCR results and the clinical presentation.";

  }

  /*
     Blood–CSF Barrier Dysfunction
  ------------------------------------------------------ */

  else if (

    proteinHigh &&
    !glucoseLow &&
    !lactateHigh

  ) {

    impression =
      "Evidence of blood–CSF barrier dysfunction.";

    recommendation =
      "Correlate with CSF albumin index, oligoclonal bands, neuroimaging and the patient's neurological condition.";

  }

  /*
     Isolated Hypoglycorrhachia
  ------------------------------------------------------ */

  else if (

    glucoseLow

  ) {

    impression =
      "Hypoglycorrhachia.";

    recommendation =
      "Interpret together with serum glucose concentration, CSF cell count and microbiological investigations.";

  }

  /*
     Isolated Hyperproteinorrachia
  ------------------------------------------------------ */

  else if (

    proteinHigh

  ) {

    impression =
      "Elevated CSF protein concentration.";

    recommendation =
      "Consider inflammatory, infectious, neoplastic or demyelinating disorders. Clinical correlation is recommended.";

  }

  /*
     Elevated CSF Lactate
  ------------------------------------------------------ */

  else if (

    lactateHigh

  ) {

    impression =
      "Elevated CSF lactate concentration.";

    recommendation =
      "Correlate with clinical findings, CSF microscopy, microbiology and cerebral perfusion status.";

  }

  /*
     Normal CSF Chemistry
  ------------------------------------------------------ */

  else {

    impression =
      "CSF chemistry findings are within acceptable laboratory limits.";

    recommendation =
      "Interpret together with CSF microscopy, microbiology and the patient's neurological presentation.";

  }

  /* ======================================================
     RECOMMENDATION REFINEMENT
  ====================================================== */

  if (

    impression.includes("bacterial meningitis")

  ) {

    recommendation =
      "This biochemical pattern requires urgent clinical assessment. Correlate with CSF cell count and differential, Gram stain, culture, multiplex PCR, blood cultures and neuroimaging where indicated. Empirical antimicrobial therapy should not be delayed when bacterial meningitis is clinically suspected.";

  }

  else if (

    impression.includes("tuberculous") ||
    impression.includes("fungal")

  ) {

    recommendation =
      "Correlate with acid-fast bacilli staining, mycobacterial culture, nucleic acid amplification testing, fungal microscopy and culture, cryptococcal antigen testing where appropriate, and neuroimaging.";

  }

  else if (

    impression.includes("viral meningitis")

  ) {

    recommendation =
      "Interpret together with CSF lymphocyte count, viral PCR testing and the clinical presentation. Correlate with neuroimaging where clinically indicated.";

  }

  else if (

    impression.includes("blood–CSF barrier dysfunction")

  ) {

    recommendation =
      "Consider additional investigations including CSF albumin index, IgG index, oligoclonal bands and neuroimaging to evaluate blood–CSF barrier integrity and inflammatory neurological disease.";

  }

  else if (

    impression.includes("Hypoglycorrhachia")

  ) {

    recommendation =
      "Review the paired plasma glucose concentration and correlate with CSF microscopy, microbiology and molecular investigations to determine the underlying cause.";

  }

  else if (

    impression.includes("Elevated CSF protein")

  ) {

    recommendation =
      "Interpret together with CSF cell count, microbiology, oligoclonal bands and neuroimaging. Consider inflammatory, infectious, demyelinating and neoplastic disorders.";

  }

  else if (

    impression.includes("Elevated CSF lactate")

  ) {

    recommendation =
      "Correlate with microbiological investigations, serum lactate where appropriate and the patient's neurological status. Elevated CSF lactate is supportive but not diagnostic of bacterial meningitis.";

  }

  else if (

    impression.includes("within acceptable")

  ) {

    recommendation =
      "Normal CSF chemistry does not exclude neurological disease. Interpret together with CSF microscopy, microbiology, molecular testing, neuroimaging and the overall clinical assessment.";

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