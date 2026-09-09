import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";

/* ==========================================================
   PANCREATIC FUNCTION INTERPRETATION ENGINE

   Tests Supported
   ----------------------------------------------------------
   • Amylase
   • Lipase

   Detects
   ----------------------------------------------------------
   • Normal pancreatic enzymes
   • Acute pancreatitis
   • Chronic pancreatic disease
   • Hyperamylasaemia
   • Hyperlipasaemia
   • Non-pancreatic enzyme elevation
========================================================== */

export default function interpretPancreatic(

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

  const amylase =
    getNumericResult(
      resultMap,
      "Amylase"
    );

  const lipase =
    getNumericResult(
      resultMap,
      "Lipase"
    );

  /* ======================================================
     REFERENCE LIMITS

     (May later be loaded dynamically from the LIS)
  ====================================================== */

  const AMYLASE_ULN = 100;
  const LIPASE_ULN = 60;

  let interpretation = "";

  let impression = "";

  let recommendation = "";

  /* ======================================================
     DERIVED FLAGS
  ====================================================== */

  const amylaseHigh =
    amylase !== null &&
    amylase > AMYLASE_ULN;

  const lipaseHigh =
    lipase !== null &&
    lipase > LIPASE_ULN;

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */

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

  function isHigh(
    value,
    upperLimit
  ) {

    return (
      value !== null &&
      value > upperLimit
    );

  }

  const amylaseFold =
    foldIncrease(
      amylase,
      AMYLASE_ULN
    );

  const lipaseFold =
    foldIncrease(
      lipase,
      LIPASE_ULN
    );

  /* ======================================================
     AMYLASE
  ====================================================== */

  if (amylase !== null) {

    if (amylase <= AMYLASE_ULN) {

      interpretation +=
        "Serum amylase is within the reference interval.\n\n";

    }

    else if (amylaseFold < 3) {

      interpretation +=
        "Serum amylase is mildly elevated. Mild hyperamylasaemia may occur in acute pancreatitis, salivary gland disorders, renal impairment, gastrointestinal disease or macroamylasaemia.\n\n";

    }

    else if (amylaseFold < 10) {

      interpretation +=
        "Serum amylase is moderately elevated, compatible with acute pancreatic injury in the appropriate clinical setting.\n\n";

    }

    else {

      interpretation +=
        "Serum amylase is markedly elevated, strongly suggesting acute pancreatitis, although other causes of marked hyperamylasaemia should be considered.\n\n";

    }

  }

  /* ======================================================
     LIPASE
  ====================================================== */

  if (lipase !== null) {

    if (lipase <= LIPASE_ULN) {

      interpretation +=
        "Serum lipase is within the reference interval.\n\n";

    }

    else if (lipaseFold < 3) {

      interpretation +=
        "Serum lipase is mildly elevated. Mild elevation may occur in pancreatic disease, renal impairment, peptic ulcer disease, cholecystitis and other intra-abdominal disorders.\n\n";

    }

    else if (lipaseFold < 10) {

      interpretation +=
        "Serum lipase is significantly elevated, consistent with pancreatic inflammation. Clinical correlation is recommended.\n\n";

    }

    else {

      interpretation +=
        "Serum lipase is markedly elevated, strongly supporting acute pancreatitis in the appropriate clinical setting.\n\n";

    }

  }

  /* ======================================================
     COMBINED PANCREATIC ENZYME INTERPRETATION
  ====================================================== */

  if (

    amylaseHigh &&
    lipaseHigh

  ) {

    interpretation +=
      "Concurrent elevation of both amylase and lipase provides strong biochemical evidence of pancreatic injury.\n\n";

  }

  else if (

    lipaseHigh &&
    !amylaseHigh

  ) {

    interpretation +=
      "Isolated elevation of lipase may occur in acute pancreatitis and is generally more sensitive and specific than amylase, particularly in patients presenting later after symptom onset.\n\n";

  }

  else if (

    amylaseHigh &&
    !lipaseHigh

  ) {

    interpretation +=
      "Isolated hyperamylasaemia may be pancreatic or non-pancreatic in origin. Salivary gland disease, renal impairment, gastrointestinal disorders and macroamylasaemia should be considered where clinically appropriate.\n\n";

  }

  /* ======================================================
     PATTERN RECOGNITION
  ====================================================== */

  /*
     Severe Acute Pancreatitis
  ------------------------------------------------------ */

  if (

    lipaseFold !== null &&
    lipaseFold >= 10

  ) {

    impression =
      "Biochemical findings are highly suggestive of severe acute pancreatitis.";

    recommendation =
      "Urgent clinical assessment is recommended. Correlate with abdominal pain, serum inflammatory markers and abdominal imaging. Assess for organ dysfunction and possible complications.";

  }

  /*
     Acute Pancreatitis
  ------------------------------------------------------ */

  else if (

    lipaseFold !== null &&
    lipaseFold >= 3 &&
    amylaseFold !== null &&
    amylaseFold >= 3

  ) {

    impression =
      "Biochemical findings are consistent with acute pancreatitis.";

    recommendation =
      "Interpret together with the patient's clinical presentation and imaging studies. Lipase is the preferred biochemical marker for diagnosis.";

  }

  /*
     Predominant Lipase Elevation
  ------------------------------------------------------ */

  else if (

    lipaseHigh &&
    !amylaseHigh

  ) {

    impression =
      "Isolated hyperlipasaemia.";

    recommendation =
      "Clinical correlation is recommended. Acute pancreatitis remains possible, although elevated lipase may also occur in renal impairment, gastrointestinal disorders and other intra-abdominal diseases.";

  }

  /*
     Predominant Amylase Elevation
  ------------------------------------------------------ */

  else if (

    amylaseHigh &&
    !lipaseHigh

  ) {

    impression =
      "Isolated hyperamylasaemia.";

    recommendation =
      "Consider salivary gland disease, macroamylasaemia, renal impairment, gastrointestinal disorders or early pancreatic disease. Clinical correlation is advised.";

  }

  /*
     Mild Pancreatic Enzyme Elevation
  ------------------------------------------------------ */

  else if (

    amylaseHigh ||
    lipaseHigh

  ) {

    impression =
      "Mild pancreatic enzyme elevation.";

    recommendation =
      "Interpret in conjunction with the patient's symptoms, medication history and abdominal imaging where clinically indicated.";

  }

  /*
     Normal Pattern
  ------------------------------------------------------ */

  else {

    impression =
      "Pancreatic enzyme profile is within acceptable laboratory limits.";

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
      "Routine clinical correlation is advised. If symptoms strongly suggest pancreatic disease despite normal enzyme levels, repeat testing and appropriate imaging may be considered.";

  }

  else if (

    impression.includes("severe acute pancreatitis")

  ) {

    recommendation =
      "Urgent hospital management is recommended. Assess disease severity, monitor renal function, electrolytes and inflammatory markers, and perform appropriate abdominal imaging. Early specialist review is advised.";

  }

  else if (

    impression.includes("acute pancreatitis")

  ) {

    recommendation =
      "Interpret together with the patient's clinical presentation, abdominal imaging and underlying aetiology. Evaluate for gallstones, alcohol-related disease, hypertriglyceridaemia, medications and other recognised causes.";

  }

  else if (

    impression.includes("hyperlipasaemia")

  ) {

    recommendation =
      "Clinical correlation is recommended. Persistent elevation should prompt evaluation for pancreatic disease, renal impairment or other intra-abdominal pathology.";

  }

  else if (

    impression.includes("hyperamylasaemia")

  ) {

    recommendation =
      "Consider salivary gland disorders, macroamylasaemia, renal impairment and gastrointestinal disease. Additional investigations may be indicated depending on the clinical presentation.";

  }

  else if (

    impression.includes("Mild pancreatic enzyme elevation")

  ) {

    recommendation =
      "Repeat pancreatic enzyme testing may be appropriate where symptoms persist. Correlation with abdominal imaging and the clinical picture is recommended.";

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